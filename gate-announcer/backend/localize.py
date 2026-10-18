"""Typed placeholders, never blanket replacement inside passenger names."""
import re
from datetime import date
from num2words import num2words
from .templates import AIRLINES
DIGITS={'en':'zero one two three four five six seven eight niner'.split(),
'ar':'صفر واحد اثنان ثلاثة أربعة خمسة ستة سبعة ثمانية تسعة'.split(),
'ur':'صفر ایک دو تین چار پانچ چھ سات آٹھ نو'.split()}
LETTERS={
'en':'Alpha Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliett Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu'.split(),
'ar':'إيه بي سي دي إي إف جي إتش آي جاي كيه إل إم إن أو بي كيو آر إس تي يو في دبليو إكس واي زد'.split(),
'ur':'اے بی سی ڈی ای ایف جی ایچ آئی جے کے ایل ایم این او پی کیو آر ایس ٹی یو وی ڈبلیو ایکس وائی زیڈ'.split()}
UR_0_59='صفر،ایک،دو،تین،چار،پانچ،چھ،سات،آٹھ،نو،دس،گیارہ،بارہ،تیرہ،چودہ،پندرہ،سولہ،سترہ،اٹھارہ،انیس،بیس،اکیس،بائیس،تئیس،چوبیس،پچیس،چھبیس،ستائیس،اٹھائیس،انتیس،تیس،اکتیس،بتیس،تینتیس،چونتیس،پینتیس،چھتیس،سینتیس،اڑتیس،انتالیس،چالیس،اکتالیس،بیالیس،تینتالیس،چوالیس،پینتالیس،چھیالیس،سینتالیس،اڑتالیس،انچاس،پچاس،اکیاون،باون،ترپن،چون،پچپن،چھپن،ستاون،اٹھاون،انسٹھ'.split('،')
UR_TAIL='ساٹھ،اکسٹھ،باسٹھ،تریسٹھ،چونسٹھ،پینسٹھ،چھیاسٹھ،سڑسٹھ،اڑسٹھ،انہتر،ستر،اکہتر،بہتر،تہتر،چوہتر،پچھتر،چھہتر،ستتر،اٹھہتر،اناسی،اسی،اکیاسی،بیاسی،تراسی،چوراسی،پچاسی،چھیاسی،ستاسی،اٹھاسی،نواسی،نوے،اکانوے،بانوے،ترانوے،چورانوے،پچانوے،چھیانوے،ستانوے،اٹھانوے،ننانوے'.split('،')
def digits(s,lang):
 return ' '.join(DIGITS[lang][int(c)] if c.isdecimal() else c for c in str(s))
def cardinal(s,lang):
 n=int(s)
 if not 0<=n<=9999: raise ValueError('Number must be between 0 and 9999')
 if lang!='ur': return num2words(n,lang=lang)
 if n<100:return (UR_0_59+UR_TAIL)[n]
 for unit,word in [(1000,'ہزار'),(100,'سو')]:
  if n>=unit:return cardinal(n//unit,lang)+' '+word+(' '+cardinal(n%unit,lang) if n%unit else '')
def identifier(s,lang):
 return ' '.join(DIGITS[lang][int(c)] if c.isdecimal() else LETTERS[lang][ord(c)-65] if 'A'<=c<='Z' else c for c in str(s).upper() if not c.isspace())
def time_spoken(s,lang):
 if not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d',s):raise ValueError('Use local time HH:MM')
 h,m=map(int,s.split(':')); hour=cardinal(h%12 or 12,lang)
 if lang=='en': return hour+(' oh '+cardinal(m,lang) if 0<m<10 else ' '+cardinal(m,lang) if m else '')+(' A M' if h<12 else ' P M')
 if lang=='ar':return hour+(' و '+cardinal(m,lang)+' دقيقة' if m else ' تماماً')+(' صباحاً' if h<12 else ' مساءً')
 return ('صبح ' if h<12 else 'دوپہر ' if h<17 else 'شام ' if h<20 else 'رات ')+hour+' بج کر '+cardinal(m,lang)+' منٹ'
def date_spoken(s,lang):
 d=date.fromisoformat(s)
 months={'en':['January','February','March','April','May','June','July','August','September','October','November','December'], 'ar':'يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر'.split(),'ur':'جنوری فروری مارچ اپریل مئی جون جولائی اگست ستمبر اکتوبر نومبر دسمبر'.split()}
 return f'{cardinal(d.day,lang)} {months[lang][d.month-1]} {cardinal(d.year,lang)}'
def value(key,s,lang):
 if key=='airline':return AIRLINES[s][lang]
 if key=='boarding_group':
  return {'Zone A':{'en':'Zone A','ar':'المنطقة إيه','ur':'زون اے'},'Zone C':{'en':'Zone C','ar':'المنطقة سي','ur':'زون سی'},'Rows 14–28':{'en':'rows fourteen to twenty-eight','ar':'الصفوف من أربعة عشر إلى ثمانية وعشرين','ur':'صف چودہ سے اٹھائیس'},'Rows 18–36':{'en':'rows eighteen to thirty-six','ar':'الصفوف من ثمانية عشر إلى ستة وثلاثين','ur':'صف اٹھارہ سے چھتیس'}}[s][lang]
 if key=='flight':
  if not re.fullmatch(r'(?:G9|3O|E5|3L|9P|4P)\s?[0-9]{1,4}',s):raise ValueError('Use a group airline code followed by 1–4 digits')
  return identifier(s,lang)
 if key in ('gate','new_gate','old_gate','belt','terminal','aircraft'):
  return identifier(s,lang) if re.search('[A-Za-z]',s) else cardinal(s,lang)
 if key in ('row_start','row_end','duration'):return cardinal(s,lang)
 if key in ('time','boarding_time'):return time_spoken(s,lang)
 if key=='date':return date_spoken(s,lang)
 if key=='greeting':
  return {'en':{'morning':'morning','afternoon':'afternoon','evening':'evening'},'ar':{'morning':'صباح الخير','afternoon':'طاب نهاركم','evening':'مساء الخير'},'ur':{'morning':'صبح بخیر','afternoon':'آداب','evening':'شام بخیر'}}[lang][s]
 if key in ('destination','origin','airport','reason'):
  glossary={'dammam':{'ar':'الدمام','ur':'دمام'},'sharjah':{'ar':'الشارقة','ur':'شارجہ'},'jeddah':{'ar':'جدة','ur':'جدہ'},'riyadh':{'ar':'الرياض','ur':'ریاض'},'king fahd international airport':{'ar':'مطار الملك فهد الدولي','ur':'کنگ فہد بین الاقوامی ہوائی اڈہ'},'operational requirements':{'ar':'متطلبات تشغيلية','ur':'عملی ضروریات'}}
  return glossary.get(s.strip().lower(),{}).get(lang,s)
 if key=='names':return ('، ' if lang!='en' else ', passenger ').join(x.strip() for x in s.split(',') if x.strip())
 return s

def compose(template,variables,lang):
 missing=[k for k in template['fields'] if not str(variables.get(k,'')).strip()]
 if missing:raise ValueError('Missing fields: '+', '.join(missing))
 v=dict(variables); v.update(row_start='18' if v.get('aircraft')=='A321' else '14',row_end='36' if v.get('aircraft')=='A321' else '28')
 airline=v.get('airline','G9')
 if airline not in AIRLINES:raise ValueError('Choose a group airline')
 if 'flight' in template['fields'] and not v['flight'].startswith(airline):raise ValueError('Flight prefix must match the selected airline')
 source=template['texts'][lang]
 if airline!='G9':
  for original in {'en':['Air Arabia','AirArabia'],'ar':['العربية للطيران'],'ur':['ایئر عربیہ']}[lang]:source=source.replace(original,AIRLINES[airline][lang])
 if lang=='en':source=source.replace('[flight]to','[flight] to')
 # Spoken interpretation of written operator directions; source preview remains verbatim.
 if template['id']=='row' and v.get('aircraft')=='A321':source=source.replace('row 14 to row 28','row 18 to row 36')
 text=re.sub(r'\[([a-z_]+)\]',lambda m:value(m[1],str(v[m[1]]),lang),source)
 if lang=='en':
  text=text.replace('(use A.M or P.M)','').replace('Minute(s) Hour(s)','minutes').replace('Minute/ Hour(s)','minutes').replace('1ˢᵗ','first').replace('/', '. ').replace('(', '').replace(')','')
  text=re.sub(r'(?<=three)to\b',' to',text)
 return text
