import {quotaSettings} from '../lib/quota.js';
import {settings,headers,BLOCKED} from '../lib/voice-service.js';
export default function handler(req,res){headers(res);if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}const s=quotaSettings()?settings():null;res.status(200).json({version:'5.0.0',enabled:!!s,voices:s?s.voices:[],message:s?'Configured HD voices are checked against the provider catalogue before synthesis.':BLOCKED});}
