"""Server-side administration. Redis in hosted mode; SQLite for local use."""
import copy
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
from pathlib import Path
from urllib.request import Request as URLRequest, urlopen
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field
from .templates import TEMPLATES, BY_ID, FIELDS
from . import tts

router = APIRouter(prefix='/api/admin')
COOKIE = 'pa_admin_session'
DB = Path(__file__).resolve().parent.parent / 'admin.sqlite3'
EMPTY = {'revision': 0, 'locked_voices': [], 'templates': {}}

def configured():
 return not os.getenv('VERCEL') or bool(os.getenv('UPSTASH_REDIS_REST_URL') and os.getenv('UPSTASH_REDIS_REST_TOKEN'))

def redis(*command):
 try:
  request = URLRequest(os.environ['UPSTASH_REDIS_REST_URL'], data=json.dumps(command).encode(), headers={'Authorization':'Bearer '+os.environ['UPSTASH_REDIS_REST_TOKEN'], 'Content-Type':'application/json'})
  with urlopen(request, timeout=8) as response: data=json.load(response)
  if data.get('error'): raise ValueError('Storage error')
  return data.get('result')
 except Exception: raise HTTPException(503, 'Shared settings storage is unavailable. Please retry.')

def local():
 db=sqlite3.connect(DB, timeout=10)
 db.execute('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT, expires REAL)')
 return db

def get(key):
 if os.getenv('VERCEL'):
  if not configured(): raise HTTPException(503, 'Shared admin storage has not been configured.')
  return redis('GET', 'pa:'+key)
 with local() as db:
  row=db.execute('SELECT value FROM kv WHERE key=? AND (expires IS NULL OR expires>?)',(key,time.time())).fetchone()
  return row[0] if row else None

def put(key,value,ttl=None):
 if os.getenv('VERCEL'):
  return redis('SET','pa:'+key,value,*(['EX',ttl] if ttl else []))
 with local() as db: db.execute('INSERT OR REPLACE INTO kv VALUES (?,?,?)',(key,value,time.time()+ttl if ttl else None))

def config():
 # A deployment with no admin storage retains the original public experience.
 if not configured(): return copy.deepcopy(EMPTY)
 return json.loads(get('config') or json.dumps(EMPTY))

def effective_templates(cfg=None):
 cfg=config() if cfg is None else cfg
 result=copy.deepcopy(TEMPLATES)
 for t in result:
  for lang,text in cfg['templates'].get(t['id'],{}).items():
   t['texts'][lang]=text
   t['verification'][lang]='Admin-edited template — review before broadcast'
 return result

def allowed(voice,cfg=None):
 if voice in (config() if cfg is None else cfg)['locked_voices']:
  raise HTTPException(403,'This voice is locked by the administrator. Choose an unlocked voice.')

def require_admin(request):
 token=request.cookies.get(COOKIE,'')
 if not re.fullmatch('[a-f0-9]{64}', token) or not get('session:'+hashlib.sha256(token.encode()).hexdigest()):
  raise HTTPException(401,'Admin login required')

class Login(BaseModel):
 username: str=Field(max_length=50)
 password: str=Field(max_length=256)

@router.post('/login')
def login(body:Login,request:Request,response:Response):
 password=os.getenv('PA_ADMIN_PASSWORD')
 if not password or not configured(): raise HTTPException(503,'Admin login requires server password and shared storage configuration.')
 # Atomic attempt counter, shared across instances in hosted mode.
 key='login:'+hashlib.sha256((request.client.host if request.client else 'unknown').encode()).hexdigest()+':'+str(int(time.time()//900))
 if os.getenv('VERCEL'):
  attempts=redis('INCR','pa:'+key)
  if attempts==1: redis('EXPIRE','pa:'+key,900)
 else:
  with local() as db:
   db.execute('BEGIN IMMEDIATE')
   row=db.execute('SELECT value FROM kv WHERE key=?',(key,)).fetchone()
   attempts=int(row[0])+1 if row else 1
   db.execute('INSERT OR REPLACE INTO kv VALUES (?,?,?)',(key,str(attempts),time.time()+900))
 if attempts>10: raise HTTPException(429,'Too many login attempts. Try again in 15 minutes.')
 if body.username!='admin' or not hmac.compare_digest(body.password.encode(),password.encode()): raise HTTPException(401,'Incorrect username or password')
 token=secrets.token_hex(32)
 put('session:'+hashlib.sha256(token.encode()).hexdigest(),'admin',28800)
 response.set_cookie(COOKIE,token,httponly=True,secure=bool(os.getenv('VERCEL')),samesite='strict',max_age=28800,path='/')
 return {'authenticated':True}

@router.post('/logout')
def logout(request:Request,response:Response):
 token=request.cookies.get(COOKIE,'')
 if re.fullmatch('[a-f0-9]{64}',token): put('session:'+hashlib.sha256(token.encode()).hexdigest(),'',1)
 response.delete_cookie(COOKIE,path='/')
 return {'authenticated':False}

@router.get('/settings')
def read_settings(request:Request):
 require_admin(request)
 return {**config(),'catalog':tts.STATE['voices'],'templates_data':effective_templates()}

class Update(BaseModel):
 revision:int=Field(ge=0)
 locked_voices:list[str]=Field(max_length=500)
 templates:dict[str,dict[str,str]]

@router.post('/settings')
def update(body:Update,request:Request):
 require_admin(request)
 if any(not re.fullmatch(r'(en|ar|ur)-[A-Z]{2}-[A-Za-z]+Neural',v) for v in body.locked_voices): raise HTTPException(422,'Invalid voice')
 if len(body.templates)>len(TEMPLATES): raise HTTPException(422,'Too many templates')
 for tid,texts in body.templates.items():
  if tid not in BY_ID or not texts or set(texts)-{'en','ar','ur'}: raise HTTPException(422,'Unknown template or language')
  for text in texts.values():
   if not text.strip() or len(text)>6000: raise HTTPException(422,'Template must contain 1–6000 characters')
   tokens=re.findall(r'\[([^\]]*)\]',text)
   if set(tokens)-set(BY_ID[tid]['fields'])-{'row_start','row_end','airline'}: raise HTTPException(422,'Use only the listed placeholders for this template')
 cfg=body.model_dump();cfg['revision']+=1;cfg['locked_voices']=sorted(set(cfg['locked_voices']))
 value=json.dumps(cfg,ensure_ascii=False)
 if os.getenv('VERCEL'):
  script="local old=redis.call('GET',KEYS[1]); local rev=0; if old then rev=cjson.decode(old).revision end; if rev~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1"
  ok=redis('EVAL',script,1,'pa:config',body.revision,value)
 else:
  with local() as db:
   db.execute('BEGIN IMMEDIATE')
   row=db.execute("SELECT value FROM kv WHERE key='config'").fetchone()
   ok=(json.loads(row[0])['revision'] if row else 0)==body.revision
   if ok: db.execute('INSERT OR REPLACE INTO kv VALUES (?,?,NULL)',('config',value))
 if not ok: raise HTTPException(409,'Settings changed in another session. Reopen Admin and try again.')
 return cfg
