import {quotaSettings,reserveQuota} from '../lib/quota.js';
import {settings,authenticate,validRequest,sameOrigin,headers,ssml,verifyVoice,boundedAudio,BLOCKED} from '../lib/voice-service.js';
// Deliberately no automatic retry: synthesis may have been billed even when the response is lost.
export default async function handler(req,res){
 headers(res);
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 if(!sameOrigin(req))return res.status(403).json({error:'Origin not allowed'});
 if(!req.headers['content-type']?.startsWith('application/json'))return res.status(415).json({error:'JSON body required'});
 let body=req.body;try{if(typeof body==='string'){if(body.length>15000)return res.status(413).json({error:'Request too large'});body=JSON.parse(body);}}catch{return res.status(400).json({error:'Invalid JSON'});}
 if(!validRequest(body))return res.status(400).json({error:'Invalid station, language or script. Maximum 2500 characters.'});
 const s=settings(),q=quotaSettings();if(!s||!q)return res.status(503).json({error:BLOCKED});
 const token=(req.headers.authorization||'').replace(/^Bearer /,'');
 if(!authenticate(body.station,token,s.codes))return res.status(401).json({error:'Invalid station access code'});
 const voice=s.voices.find(v=>v.id===body.voice&&v.language===body.lang);
 if(!voice)return res.status(422).json({error:'This premium voice is not approved for the requested language.'});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 const aborted=()=>controller.abort();req.on?.('aborted',aborted);
 try{
 if(!await verifyVoice(s,voice,fetch,controller.signal))return res.status(422).json({error:'The provider does not confirm this HD voice and locale as generally available. No substitute was used.'});
 const payload=ssml(body.text,voice);
 if(!await reserveQuota(q,body.station,payload.length,fetch,controller.signal))return res.status(429).json({error:'Daily character allowance reached. No synthesis request was sent.'});
 const r=await fetch(`https://${s.region}.tts.speech.microsoft.com/cognitiveservices/v1`,{method:'POST',headers:{'Ocp-Apim-Subscription-Key':s.key,'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'audio-24khz-96kbitrate-mono-mp3','User-Agent':'AirArabiaStationPA/5.0'},body:payload,signal:controller.signal,redirect:'error'});
 if(!r.ok)return res.status(r.status===429?429:502).json({error:r.status===429?'Voice service quota reached. No fallback or automatic retry was used.':'Premium voice service failed. Try again later.'});
 const mime=r.headers.get('content-type')||'';if(!mime.startsWith('audio/'))throw new Error('type');
 const audio=await boundedAudio(r);res.setHeader('Content-Type','audio/mpeg');res.setHeader('X-Voice-Quality','hd');res.setHeader('X-Voice-Id',voice.id);return res.status(200).send(audio);
 }catch(e){return res.status(e.name==='AbortError'?504:502).json({error:e.name==='AbortError'?'Voice service timed out.':'Premium voice audio could not be verified.'});}finally{clearTimeout(timer);req.off?.('aborted',aborted);}
}
