import pytest
from fastapi.testclient import TestClient
from backend import main, admin
from backend.templates import DEFAULTS

@pytest.fixture
def client(tmp_path,monkeypatch):
 monkeypatch.setattr(admin,'DB',tmp_path/'admin.sqlite3')
 monkeypatch.delenv('VERCEL',raising=False)
 monkeypatch.setenv('PA_ADMIN_PASSWORD','test-only-password')
 # No network voice discovery is required for authentication tests.
 return TestClient(main.app)

def sign_in(c):
 return c.post('/api/admin/login',json={'username':'admin','password':'test-only-password'})

def test_auth_lock_templates_and_persistence(client):
 c=client
 assert c.get('/api/admin/settings').status_code==401
 assert c.post('/api/admin/settings',json={'revision':0,'locked_voices':[],'templates':{}}).status_code==401
 assert c.post('/api/admin/login',json={'username':'admin','password':'wrong'}).status_code==401
 r=sign_in(c);assert r.status_code==200
 assert 'HttpOnly' in r.headers['set-cookie'] and 'SameSite=strict' in r.headers['set-cookie']
 cfg=c.get('/api/admin/settings').json()
 body={'revision':cfg['revision'],'locked_voices':['en-US-AriaNeural'],'templates':{'first':{'en':'Welcome aboard [flight] to [destination].'}}}
 assert c.post('/api/admin/settings',json=body).status_code==200
 assert admin.config()['locked_voices']==['en-US-AriaNeural']
 req={'template_id':'first','variables':DEFAULTS,'voice':'en-US-AriaNeural'}
 assert c.post('/api/render',json=req).status_code==403
 assert c.post('/api/preview',json={**req,'voice':'en-GB-RyanNeural'}).json()['text'].startswith('Welcome aboard')
 assert 'en-US-AriaNeural' not in c.get('/api/voices').json()['voices']['en']
 assert c.post('/api/admin/settings',json=body).status_code==409
 assert c.post('/api/admin/settings',json={**body,'revision':1,'templates':{'first':{'en':'Bad [unknown]'}}}).status_code==422
 assert c.post('/api/admin/settings',json={**body,'revision':1,'locked_voices':[]}).status_code==200
 assert c.post('/api/preview',json=req).status_code==200
 cookie=c.cookies.get(admin.COOKIE)
 assert c.post('/api/admin/logout',json={}).status_code==200
 c.cookies.set(admin.COOKIE,cookie)
 assert c.get('/api/admin/settings').status_code==401

def test_cross_origin_and_rate_limit(client):
 assert client.post('/api/admin/login',json={'username':'admin','password':'test-only-password'},headers={'Origin':'https://evil.example'}).status_code==403
 for _ in range(10):assert client.post('/api/admin/login',json={'username':'admin','password':'wrong'}).status_code==401
 assert sign_in(client).status_code==429

def test_hosted_missing_config_fails_closed(client,monkeypatch):
 monkeypatch.setenv('VERCEL','1')
 monkeypatch.delenv('UPSTASH_REDIS_REST_URL',raising=False)
 monkeypatch.delenv('UPSTASH_REDIS_REST_TOKEN',raising=False)
 assert sign_in(client).status_code==503
 assert client.get('/api/templates').status_code==200
