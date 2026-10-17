import asyncio
import json
import logging
import os
from pathlib import Path
import shutil
import sys
import time
import edge_tts

VOICE_MAP={
'en':['en-US-AriaNeural','en-US-JennyNeural','en-US-GuyNeural','en-GB-SoniaNeural','en-GB-RyanNeural'],
'ar':['ar-AE-FatimaNeural','ar-AE-HamdanNeural','ar-SA-ZariyahNeural','ar-EG-SalmaNeural'],
'ur':['ur-PK-UzmaNeural','ur-PK-AsadNeural']}
ROOT=Path('/tmp/airarabia-pa') if os.getenv('VERCEL') else Path(__file__).resolve().parent.parent
ROOT.mkdir(parents=True,exist_ok=True)
STATE={'validated':False,'warnings':[],'voices':VOICE_MAP.copy(),'substitutions':{}}

async def command(*args, input=None, timeout=30):
 p=await asyncio.create_subprocess_exec(*map(str,args),stdin=asyncio.subprocess.PIPE if input is not None else asyncio.subprocess.DEVNULL,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE)
 try:out,err=await asyncio.wait_for(p.communicate(input),timeout)
 except BaseException:
  if p.returncode is None:
   p.kill();await p.communicate()
  raise
 if p.returncode:raise RuntimeError(err.decode(errors='replace')[-1500:])
 return out

async def validate_voices():
 """Execute the requested CLI at each startup; never prevent offline startup."""
 try:
  output=(await command(sys.executable,'-m','edge_tts','--list-voices',timeout=18)).decode()
  names={line.split()[0] for line in output.splitlines() if 'Neural' in line}
  if not names:raise RuntimeError('Voice directory returned no neural voices')
  resolved={};substitutions={};warnings=[]
  for lang,wanted in VOICE_MAP.items():
   resolved[lang]=[]
   for voice in wanted:
    replacement=voice if voice in names else next(iter(sorted(n for n in names if n.startswith(voice[:5]+'-'))),None) or next(iter(sorted(n for n in names if n.startswith(lang+'-'))),None)
    if replacement:
     if replacement not in resolved[lang]:resolved[lang].append(replacement)
     if replacement!=voice:substitutions[voice]=replacement;warnings.append(f'{voice} missing; using {replacement}')
    else:warnings.append(f'No neural voice available for {lang}')
  STATE.update(validated=True,voices=resolved,substitutions=substitutions,warnings=warnings)
  (ROOT/'voice-catalog.json').write_text(json.dumps(STATE,ensure_ascii=False),encoding='utf-8')
 except Exception as e:
  try:STATE.update(json.loads((ROOT/'voice-catalog.json').read_text(encoding='utf-8')))
  except (OSError,ValueError):pass
  STATE['validated']=False;STATE['warnings']=[f'Live voice validation unavailable: {type(e).__name__}. Using last known catalog; cached audio still works.']
 for warning in STATE['warnings']:logging.warning(warning)
 return STATE

def piper_config():
 """Each model requires its matching .onnx.json. No silent cross-language voice."""
 path=ROOT/'piper.json'
 return json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}

EDGE_RETRY_AT=0.0

async def synthesize(text,lang,voice,rate,pitch,volume,target):
 global EDGE_RETRY_AT
 errors=[]
 for attempt in range(0 if time.monotonic()<EDGE_RETRY_AT else 1):
  try:
   await asyncio.wait_for(edge_tts.Communicate(text,voice,rate=rate,pitch=pitch,volume=volume).save(str(target)),timeout=20)
   if target.stat().st_size<100:raise RuntimeError('Empty speech')
   EDGE_RETRY_AT=0.0
   return 'edge-tts'
  except Exception as e:
   errors.append(type(e).__name__)
   target.unlink(missing_ok=True)
   if attempt==0:await asyncio.sleep(.3)
 if errors:EDGE_RETRY_AT=time.monotonic()+45
 cfg=piper_config();model=cfg.get('models',{}).get(lang);binary=cfg.get('binary') or shutil.which('piper')
 if model and binary:
  model=Path(model);model=model if model.is_absolute() else ROOT/model
  if not model.is_file() or not Path(str(model)+'.json').is_file():raise RuntimeError(f'Piper model and .onnx.json missing for {lang}')
  wav=target.with_suffix('.wav')
  try:
   await command(binary,'--model',model,'--output_file',wav,input=text.encode('utf-8'),timeout=90)
   # Prosody is applied in audio.py, since Piper has no Edge-style pitch API.
   target.unlink(missing_ok=True)
   wav.replace(target)
   return 'piper'
  finally:wav.unlink(missing_ok=True)
 raise RuntimeError('Online speech unavailable ('+', '.join(errors)+'); no configured Piper voice for '+lang+'. Use a cached announcement or explicitly enable browser speech.')
