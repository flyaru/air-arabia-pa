"""Test speech is synthesized tone data, not neural voice evidence."""
import asyncio
import io
import zipfile
from fastapi.testclient import TestClient
from backend import main,tts
from backend.audio import create_chime
from backend.templates import TEMPLATES,DEFAULTS,BY_ID
from backend.localize import compose,identifier,time_spoken,date_spoken

def test_templates_and_gsa():
 for t in TEMPLATES:
  for lang in ('en','ar','ur'):
   text=compose(t,DEFAULTS,lang)
   assert '[' not in text and len(text)>15
 assert BY_ID['zone_c']['operation']=='remote'
 assert BY_ID['bridge_a']['operation']=='bridge'
 assert 'Zones B and C' in BY_ID['bridge_bc']['texts']['en']
 assert 'row 18 to row 36' in compose(BY_ID['row'],{**DEFAULTS,'aircraft':'A321'},'en')

def test_localization():
 assert identifier('G9 123','en')=='Golf niner one two three'
 assert identifier('G9 123','ar')=='جي تسعة واحد اثنان ثلاثة'
 assert identifier('G9 123','ur')=='جی نو ایک دو تین'
 assert time_spoken('00:05','en')=='twelve oh five A M'
 assert time_spoken('12:00','en')=='twelve P M'
 assert 'اکتوبر' in date_spoken('2026-10-17','ur')

def test_cache_export_validation_and_failure(tmp_path,monkeypatch):
 monkeypatch.setattr(main,'cache_dir',lambda:tmp_path)
 calls=[]
 async def synth(text,lang,voice,rate,pitch,volume,target):
  calls.append(text);create_chime(target);return 'test-fixture'
 monkeypatch.setattr(tts,'synthesize',synth)
 with TestClient(main.app) as client:
  req={'template_id':'bridge_a','variables':DEFAULTS}
  first=client.post('/api/render',json=req)
  assert first.status_code==200,first.text
  assert first.headers['content-type']=='audio/mpeg'
  assert len(first.content)>5000
  assert client.post('/api/render',json=req).content==first.content
  assert len(calls)==1
  assert client.post('/api/render',json={**req,'variables':{**DEFAULTS,'belt':'9'}}).content==first.content
  assert len(calls)==1
  assert client.post('/api/render',json={**req,'variables':{**DEFAULTS,'flight':'G9 456'}}).status_code==200
  assert len(calls)==2
  assert client.post('/api/render',json={**req,'variables':{**DEFAULTS,'flight':'bad'}}).status_code==422
  assert client.post('/api/render',json={**req,'voice':'ar-AE-FatimaNeural'}).status_code==422
  z=zipfile.ZipFile(io.BytesIO(client.get('/api/cache/export').content))
  assert len([n for n in z.namelist() if n.endswith('.mp3')])==2
  assert client.post('/api/settings',json={'cache_location':'../../escape'}).status_code==422
  assert client.post('/api/render',json=req,headers={'Origin':'https://evil.example'}).status_code==403
  assert client.get('/api/health',headers={'Host':'evil.example'}).status_code==400
  async def offline(*args):raise RuntimeError('offline')
  monkeypatch.setattr(tts,'synthesize',offline)
  assert client.post('/api/render',json=req).status_code==200
  assert client.post('/api/render',json={**req,'pitch':5}).status_code==503

def test_parallel_dedup_and_build(tmp_path,monkeypatch):
 monkeypatch.setattr(main,'cache_dir',lambda:tmp_path)
 main.LOCKS.clear();main.JOBS.clear()
 async def run():
  calls=[]
  async def synth(*args):
   calls.append(1);await asyncio.sleep(.03);create_chime(args[-1]);return 'test-fixture'
  monkeypatch.setattr(tts,'synthesize',synth)
  req=main.Render(template_id='welcome',variables=DEFAULTS)
  await asyncio.gather(*(main.render_file(req) for _ in range(4)))
  assert len(calls)==1
  b=main.Build(items=[req,main.Render(template_id='welcome',variables=DEFAULTS,language='ar')])
  main.JOBS['test']={'status':'running','total':2,'completed':0,'succeeded':0,'results':[],'errors':[]}
  await main.run_job('test',b)
  assert main.JOBS['test']['succeeded']==2 and main.JOBS['test']['status']=='complete'
 asyncio.run(run())


def test_all_group_airlines_and_calls():
 from backend.templates import AIRLINES
 import pytest
 for code in AIRLINES:
  for call in ('first','second','final','named_final','cancel'):
   for lang in ('en','ar','ur'):
    text=compose(BY_ID[call],{**DEFAULTS,'airline':code,'flight':code+' 123'},lang)
    assert AIRLINES[code][lang] in text
    assert '[' not in text
 with pytest.raises(ValueError,match='prefix'):
  compose(BY_ID['first'],{**DEFAULTS,'airline':'9P'},'en')
 assert 'ar-SA-HamedNeural' in tts.VOICE_MAP['ar']
 assert 'ur-PK-UzmaNeural' in tts.VOICE_MAP['ur']
