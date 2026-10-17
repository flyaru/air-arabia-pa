import asyncio
import os
from urllib.parse import urlparse
from contextlib import asynccontextmanager
import hashlib
import io
import json
import logging
from pathlib import Path
import re
import time
import uuid
import zipfile
from typing import Literal
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, Field
from . import tts
from .audio import create_chime, master
from .templates import TEMPLATES, BY_ID, FIELDS, DEFAULTS
from .localize import compose
ROOT=Path(__file__).resolve().parent.parent
HOSTED=bool(os.getenv('VERCEL'))
DATA_ROOT=Path('/tmp/airarabia-pa') if HOSTED else ROOT
DATA_ROOT.mkdir(parents=True,exist_ok=True)
CONFIG=DATA_ROOT/'settings.json'
logging.basicConfig(level=logging.INFO)
settings={'cache_location':'cache'}
if CONFIG.exists():settings.update(json.loads(CONFIG.read_text(encoding='utf-8')))
def cache_dir():
 p=(DATA_ROOT/settings['cache_location']).resolve()
 if not p.is_relative_to(DATA_ROOT) or p==DATA_ROOT:raise ValueError('Cache location must be a subfolder of this project')
 p.mkdir(parents=True,exist_ok=True);return p
cache_dir()
CHIME=DATA_ROOT/'chime.wav';create_chime(CHIME)
JOBS={};TASKS=set();LOCKS={};SEMAPHORE=asyncio.Semaphore(2)

def background(coro):
 task=asyncio.create_task(coro);TASKS.add(task);task.add_done_callback(TASKS.discard);return task
@asynccontextmanager
async def lifespan(app):
 if not HOSTED:background(tts.validate_voices())
 yield
 for task in list(TASKS):task.cancel()
 await asyncio.gather(*TASKS,return_exceptions=True)
app=FastAPI(title='Air Arabia local PA',lifespan=lifespan)
app.add_middleware(TrustedHostMiddleware,allowed_hosts=['localhost','127.0.0.1','testserver','airarabia-gate-announcer.vercel.app',os.getenv('VERCEL_URL','localhost'),os.getenv('VERCEL_PROJECT_PRODUCTION_URL','localhost')])
@app.middleware('http')
async def local_only(request:Request,call_next):
 origin=request.headers.get('origin')
 if origin and urlparse(origin).netloc != request.headers.get('host'):
  return Response('Cross-origin requests are not allowed',status_code=403)
 response=await call_next(request)
 response.headers['X-Content-Type-Options']='nosniff'
 response.headers['Referrer-Policy']='no-referrer'
 response.headers['Content-Security-Policy']="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'"
 return response

class Render(BaseModel):
 template_id:str='boarding'
 language:Literal['en','ar','ur']='en'
 voice:str=''
 variables:dict[str,str]=Field(default_factory=dict)
 text:str|None=Field(default=None,max_length=6000)
 rate:int=Field(default=-5,ge=-40,le=40)
 pitch:int=Field(default=0,ge=-40,le=40)
 volume:int=Field(default=0,ge=-50,le=50)
 chime:bool=True
 gap:float=Field(default=.5,ge=.05,le=3)
class Build(BaseModel):
 items:list[Render]=Field(max_length=150,min_length=1)
 force:bool=False

def prepared(r):
 if len(r.variables)>40 or any(len(v)>500 for v in r.variables.values()):raise HTTPException(422,'Variable too long')
 if r.text is not None:
  text=r.text.strip()
  if not text:raise HTTPException(422,'Enter announcement text')
 else:
  template=BY_ID.get(r.template_id)
  if not template:raise HTTPException(404,'Unknown template')
  try:text=compose(template,r.variables,r.language)
  except (ValueError,KeyError) as e:raise HTTPException(422,str(e))
 voice=r.voice or tts.VOICE_MAP[r.language][0]
 voice=tts.STATE['substitutions'].get(voice,voice)
 if voice not in tts.STATE['voices'][r.language] and voice not in tts.VOICE_MAP[r.language]:raise HTTPException(422,'Choose a listed voice for this language')
 canonical=r.model_dump();canonical['variables']={k:r.variables.get(k,'') for k in BY_ID[r.template_id]['fields']} if r.text is None else {}
 key=hashlib.sha256(json.dumps({'version':3,'request':canonical,'spoken':text,'voice':voice},sort_keys=True,ensure_ascii=False).encode()).hexdigest()
 return text,voice,key
async def render_file(r,force=False):
 text,voice,key=prepared(r);directory=cache_dir();path=directory/(key+'.mp3');meta=directory/(key+'.json')
 lock=LOCKS.setdefault(key,asyncio.Lock())
 async with lock:
  if path.is_file() and meta.is_file() and not force:return path,json.loads(meta.read_text(encoding='utf-8'))
  async with SEMAPHORE:
   raw=directory/(uuid.uuid4().hex+'.raw');temp=directory/(uuid.uuid4().hex+'.part')
   try:
    engine=await tts.synthesize(text,r.language,voice,f'{r.rate:+}%',f'{r.pitch:+}Hz',f'{r.volume:+}%',raw)
    await master(raw,temp,CHIME if r.chime else None,r.gap,engine,f'{r.rate:+}%',f'{r.pitch:+}Hz',f'{r.volume:+}%')
    metadata={'key':key,'text':text,'voice':voice,'engine':engine,'language':r.language,'created':time.time()}
    # Failed rebuild leaves previous audio intact. Atomic rename prevents partial cache hits.
    temp.replace(path);mtemp=meta.with_suffix('.tmp');mtemp.write_text(json.dumps(metadata,ensure_ascii=False),encoding='utf-8');mtemp.replace(meta)
    return path,metadata
   except Exception as e:raise HTTPException(503,str(e))
   finally:raw.unlink(missing_ok=True);temp.unlink(missing_ok=True)

@app.get('/api/health')
def health():return {'status':'ok','hosted':HOSTED,'voice_validation':tts.STATE['validated'],'warnings':tts.STATE['warnings'],'cached_variants':len(list(cache_dir().glob('*.mp3'))),'cache_location':settings['cache_location'],'piper_languages':list(tts.piper_config().get('models',{}))}
@app.get('/api/voices')
async def voices():
 if HOSTED and not tts.STATE['validated']:
  try:await asyncio.wait_for(tts.validate_voices(),timeout=8)
  except asyncio.TimeoutError:pass
 return tts.STATE
@app.get('/api/templates')
def templates():return {'templates':TEMPLATES,'fields':FIELDS,'defaults':DEFAULTS}
@app.post('/api/preview')
def preview(r:Render):
 text,voice,key=prepared(r);return {'text':text,'voice':voice,'key':key}
@app.post('/api/render')
async def render(r:Render):
 try:path,meta=await asyncio.wait_for(render_file(r),timeout=45)
 except asyncio.TimeoutError:raise HTTPException(504,'Speech generation exceeded 45 seconds. Please retry; no audio was played.')
 return FileResponse(path,media_type='audio/mpeg',headers={'X-Audio-Key':meta['key'],'X-TTS-Engine':meta['engine']},filename=f'{r.template_id}-{r.language}.mp3')
async def run_job(id,build):
 job=JOBS[id]
 async def one(r):
  try:
   _,meta=await render_file(r,build.force);job['results'].append({'request':r.model_dump(),**meta});job['succeeded']+=1
  except Exception as e:job['errors'].append({'template':r.template_id,'language':r.language,'error':getattr(e,'detail',str(e))})
  finally:job['completed']+=1
 await asyncio.gather(*(one(r) for r in build.items));job['status']='complete'
@app.post('/api/cache/build')
async def build_cache(b:Build):
 if sum(j['status']=='running' for j in JOBS.values())>=2:raise HTTPException(429,'A cache build is already running')
 for r in b.items:prepared(r)
 if len(JOBS)>30:
  for k in list(JOBS):
   if JOBS[k]['status']=='complete':del JOBS[k]
 id=uuid.uuid4().hex;JOBS[id]={'status':'running','total':len(b.items),'completed':0,'succeeded':0,'results':[],'errors':[]};background(run_job(id,b));return {'job_id':id}
@app.get('/api/cache/jobs/{id}')
def job(id:str):
 if id not in JOBS:raise HTTPException(404,'Job not found')
 return JOBS[id]
@app.get('/api/audio/{key}')
def audio(key:str):
 if not re.fullmatch('[a-f0-9]{64}',key):raise HTTPException(404,'Not found')
 path=cache_dir()/(key+'.mp3')
 if not path.exists():raise HTTPException(404,'Not cached')
 return FileResponse(path,media_type='audio/mpeg')
@app.get('/api/cache/export')
def export():
 data=io.BytesIO()
 with zipfile.ZipFile(data,'w',zipfile.ZIP_STORED) as z:
  manifest=[]
  for p in cache_dir().glob('*.json'):
   audio=p.with_suffix('.mp3')
   if audio.exists():
    m=json.loads(p.read_text(encoding='utf-8'));z.write(audio,'announcements/'+audio.name);manifest.append(m)
  z.writestr('announcements/manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2))
 return Response(data.getvalue(),media_type='application/zip',headers={'Content-Disposition':'attachment; filename="AirArabia-announcements.zip"'})
class Settings(BaseModel):
 cache_location:str=Field(min_length=1,max_length=120)
@app.post('/api/settings')
def save_settings(s:Settings):
 if HOSTED:return {'cache_location':'Browser storage (hosted mode)'}
 p=(ROOT/s.cache_location).resolve()
 if not p.is_relative_to(ROOT) or p==ROOT or p.relative_to(ROOT).parts[0] in ('backend','frontend','models','tests','docs'):raise HTTPException(422,'Use a separate cache subfolder inside this project')
 if any(j['status']=='running' for j in JOBS.values()):raise HTTPException(409,'Wait for the cache build to finish')
 settings['cache_location']=str(p.relative_to(ROOT));cache_dir();CONFIG.write_text(json.dumps(settings),encoding='utf-8');return settings
@app.get('/chime.wav')
def chime_file():return FileResponse(CHIME,media_type='audio/wav')

app.mount('/',StaticFiles(directory=ROOT/'frontend',html=True),name='frontend')
