// One atomic, shared reservation across every serverless instance. Fail closed on outages.
export const SCRIPT=`
local cost=tonumber(ARGV[1])
local globalLimit=tonumber(ARGV[2])
local stationLimit=tonumber(ARGV[3])
local global=tonumber(redis.call('GET',KEYS[1]) or '0')
local station=tonumber(redis.call('GET',KEYS[2]) or '0')
if global+cost>globalLimit or station+cost>stationLimit then return 0 end
redis.call('INCRBY',KEYS[1],cost)
redis.call('INCRBY',KEYS[2],cost)
redis.call('EXPIRE',KEYS[1],172800)
redis.call('EXPIRE',KEYS[2],172800)
return 1`;
export function quotaSettings(env=process.env){const total=Number(env.MAX_DAILY_CHARACTERS),station=Number(env.MAX_STATION_DAILY_CHARACTERS);if(!Number.isSafeInteger(total)||total<1||!Number.isSafeInteger(station)||station<1||station>total)return null;try{const url=new URL(env.UPSTASH_REDIS_REST_URL);if(url.protocol!=='https:'||!url.hostname.endsWith('.upstash.io')||url.username||url.password||url.pathname!=='/'||url.search||url.hash||url.port||!env.UPSTASH_REDIS_REST_TOKEN)return null;return {url:url.origin,token:env.UPSTASH_REDIS_REST_TOKEN,total,station};}catch{return null;}}
export async function reserveQuota(q,station,characters,fetcher=fetch,signal){const day=new Date().toISOString().slice(0,10);const r=await fetcher(q.url,{method:'POST',redirect:'error',signal,headers:{Authorization:`Bearer ${q.token}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',SCRIPT,2,`pa:{quota}:${day}:all`,`pa:{quota}:${day}:${station}`,characters,q.total,q.station])});if(!r.ok)throw new Error('Quota unavailable');const j=await r.json();if(j.error||![0,1].includes(j.result))throw new Error('Quota unavailable');return j.result===1;}
