import { createHash,timingSafeEqual } from 'node:crypto';
export const BLOCKED='Premium voice generation is disabled. No verified, funded service has been connected; no paid requests were sent.';
export function settings(env=process.env){
 // This flag is a deployment lock, NOT a billing cap. Leave disabled under a zero-spend requirement.
 if(env.PREMIUM_VOICE_ENABLED!=='true')return null;
 if(!/^[a-z0-9]+$/.test(env.AZURE_SPEECH_REGION||'')||!env.AZURE_SPEECH_KEY)return null;
 let voices,codes;try{voices=JSON.parse(env.APPROVED_HD_VOICES||'[]');codes=JSON.parse(env.STATION_ACCESS_HASHES||'{}');}catch{return null;}
 if(!Array.isArray(voices)||!voices.length||!codes||Array.isArray(codes))return null;
 if(!voices.every(v=>typeof v.id==='string'&&/^[A-Za-z0-9-]+:DragonHD(?:Omni|Flash)?(?:Latest|V[0-9]+)Neural$/.test(v.id)&&['en','ar','ur'].includes(v.language)&&typeof v.name==='string'&&v.name.length<=80&&typeof v.locale==='string'&&v.locale.startsWith(v.language+'-')&&/^[a-z]{2}-[A-Z]{2}$/.test(v.locale)))return null;
 return {region:env.AZURE_SPEECH_REGION,key:env.AZURE_SPEECH_KEY,voices,codes};
}
export function authenticate(station,token,codes){if(!/^[A-Z]{3}$/.test(station||'')||typeof token!=='string'||token.length<24||token.length>256)return false;const expected=codes[station];if(typeof expected!=='string'||!/^[a-f0-9]{64}$/.test(expected))return false;return timingSafeEqual(createHash('sha256').update(token).digest(),Buffer.from(expected,'hex'));}
export function escapeXML(s){return s.replace(/[<>&'\"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]));}
export function ssml(text,voice){return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${escapeXML(voice.locale)}"><voice name="${escapeXML(voice.id)}"><lang xml:lang="${escapeXML(voice.locale)}">${escapeXML(text)}</lang></voice></speak>`;}
export function validRequest(body){return body&&typeof body==='object'&&typeof body.text==='string'&&body.text.trim().length>0&&body.text.length<=2500&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body.text)&&['en','ar','ur'].includes(body.lang)&&typeof body.voice==='string'&&/^[A-Z]{3}$/.test(body.station||'');}
export function headers(res){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');}
export function sameOrigin(req){const origin=req.headers.origin;if(!origin)return true;try{return new URL(origin).host===req.headers.host&&new URL(origin).protocol==='https:';}catch{return false;}}
export async function verifyVoice(config,voice,fetcher=fetch,signal){const r=await fetcher(`https://${config.region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,{headers:{'Ocp-Apim-Subscription-Key':config.key},redirect:'error',signal});if(!r.ok)throw new Error('catalog');const catalog=await r.json();if(!Array.isArray(catalog))return false;const found=catalog.find(v=>v.ShortName?.toLowerCase()===voice.id.toLowerCase());return !!found&&found.Status==='GA'&&[found.Locale,...(found.SecondaryLocaleList||[])].some(l=>l.toLowerCase()===voice.locale.toLowerCase());}
export async function boundedAudio(response){const max=6*1024*1024;if(Number(response.headers.get('content-length'))>max)throw new Error('size');const reader=response.body.getReader();let size=0;const chunks=[];try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max)throw new Error('size');chunks.push(Buffer.from(value));}}finally{await reader.cancel().catch(()=>{});}if(size<100)throw new Error('empty');return Buffer.concat(chunks);}
