import { AIRPORT_NAMES, AIRLINE_NAMES, templates } from './templates.js';
export const types = [
 ['goToGate','Go to gate','Boarding'],['first','First call','Boarding'],['second','Second call','Boarding'],['final','Final call','Boarding'],
 ['zone','Board by zone','Boarding'],['rows','Board by rows','Boarding'],['boardRow2','Remaining passengers','Boarding'],
 ['priority','Priority boarding','Assistance'],['families','Families & children','Assistance'],['assistance','Special assistance','Assistance'],
 ['gateClosing','Gate closing','Boarding'],['completed','Boarding complete','Boarding'],['resumed','Boarding resumed','Boarding'],
 ['delayTentative','Tentative delay','Disruption'],['delayFull','Confirmed delay','Disruption'],['gateChange','Gate change','Disruption'],['page','Passenger paging','Paging'],['custom','Custom announcement','Paging']
];
export const languages = {en:'English',ar:'العربية',ur:'اردو'};
export function validateFlight(d,type) {
 const errors=[];
 if(!/^[A-Z]{3}$/.test(d.station)) errors.push('Enter a three-letter station code.');
 if(type==='custom') return errors;
 if(!/^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/.test(d.flight)) errors.push('Enter a flight number, for example G9 168.');
 if(!d.origin || !d.destination) errors.push('Enter both origin and destination.');
 if(d.origin.toLowerCase()===d.destination.toLowerCase()) errors.push('Origin and destination must be different.');
 if(!d.gate && !['completed','delayTentative','delayFull'].includes(type)) errors.push('Enter the gate.');
 if(type==='rows' && (!Number.isInteger(d.rowFrom)||!Number.isInteger(d.rowTo)||d.rowFrom<1||d.rowTo<d.rowFrom||d.rowTo>60)) errors.push('Enter a valid row range between 1 and 60.');
 if(type==='zone'&&!/^[A-F](?:\s*\+\s*[A-F]){0,3}$/.test(d.zone)) errors.push('Enter zone A–F or a combination such as B + C.');
 if(type.startsWith('delay')&&!(Number.isInteger(d.delayMinutes)&&d.delayMinutes>0&&d.delayMinutes<=1440)) errors.push('Enter a delay between 1 and 1440 minutes.');
 if(type==='delayFull'&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.etd)) errors.push('Enter the estimated local departure time.');
 if(type==='page'&&!d.passenger.trim()) errors.push('Enter the passenger name.');
 return errors;
}
export function airportName(value,lang){return AIRPORT_NAMES[value.toUpperCase()]?.[lang]||value;}
export function buildScript(raw,type,lang){
 if(!languages[lang])throw new Error('Unsupported language');
 const greet={en:{morning:'Good morning',afternoon:'Good afternoon',evening:'Good evening'},ar:{morning:'صباح الخير',afternoon:'طاب يومكم',evening:'مساء الخير'},ur:{morning:'صبح بخیر',afternoon:'دوپہر بخیر',evening:'شام بخیر'}};
 const d={...raw,airline:AIRLINE_NAMES[raw.airline]?.[lang]||raw.airline,origin:airportName(raw.origin,lang),destination:airportName(raw.destination,lang),greeting:greet[lang][raw.greeting],rows:{from:raw.rowFrom,to:raw.rowTo},delayAmount:lang==='ar'?`${raw.delayMinutes} دقيقة`:lang==='ur'?`${raw.delayMinutes} منٹ`:`${raw.delayMinutes} minutes`};
 // Reasons are entered per language in the reviewed script; do not claim an automatic translation.
 d.delayReason='';
 if(type==='custom')return '';
 if(type==='zone'){
 const z=d.zone.replace(/\+/g,lang==='ar'?' و ':lang==='ur'?' اور ':' and ');
 return {en:`Ladies and gentlemen, ${d.greeting}. Passengers travelling on ${d.airline} flight ${d.flight} to ${d.destination}, seated in zone ${z}, are now invited to board at gate ${d.gate}. Remaining passengers, please remain seated and await the next announcement. We wish you a pleasant flight.`,ar:`سيداتي سادتي، ${d.greeting}. ندعو الآن ركاب رحلة ${d.airline} رقم ${d.flight} إلى ${d.destination} في المنطقة ${z} للصعود إلى الطائرة من البوابة ${d.gate}. يرجى من بقية الركاب البقاء في أماكنهم وانتظار النداء التالي. نتمنى لكم رحلة سعيدة.`,ur:`خواتین و حضرات، ${d.greeting}۔ ${d.airline} کی پرواز ${d.flight}، ${d.destination} کے لیے زون ${z} کے مسافروں کو گیٹ ${d.gate} پر بورڈنگ کی دعوت دی جاتی ہے۔ باقی مسافر براہ کرم تشریف رکھیں اور اگلے اعلان کا انتظار کریں۔ آپ کا سفر خوشگوار ہو۔`}[lang];
 }
 if(type==='page')return {en:`Ladies and gentlemen. Calling the attention of ${d.passenger}, travelling on ${d.airline} flight ${d.flight} to ${d.destination}. Please contact our guest service staff at gate ${d.gate} immediately. Thank you.`,ar:`سيداتي سادتي. نرجو انتباه المسافر ${d.passenger} على رحلة ${d.airline} رقم ${d.flight} إلى ${d.destination}. يرجى التواصل فوراً مع موظفي خدمة المسافرين عند البوابة ${d.gate}. شكراً لكم.`,ur:`خواتین و حضرات۔ ${d.airline} کی پرواز ${d.flight} سے ${d.destination} جانے والے مسافر ${d.passenger} سے درخواست ہے کہ فوراً گیٹ ${d.gate} پر مسافر خدمات کے عملے سے رابطہ کریں۔ شکریہ۔`}[lang];
 const fn=templates[lang][type==='rows'?'boardRow1':type];
 if(!fn)throw new Error('Template unavailable');
 return fn(d);
}
export function validScript(text){return typeof text==='string'&&text.trim().length>0&&text.length<=2500&&!/\{[a-zA-Z]+\}|undefined|NaN/.test(text);}
export class RunGuard {
 constructor(){this.revision=0;this.controller=null;}
 stop(){this.revision++;this.controller?.abort();this.controller=null;}
 start(){this.stop();this.controller=new AbortController();return {revision:this.revision,signal:this.controller.signal};}
 assert(revision){if(revision!==this.revision)throw new DOMException('Cancelled','AbortError');}
}
