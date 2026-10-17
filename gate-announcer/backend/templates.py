"""GOM source text stays separate from speech formatting and translations."""
import re

FIELDS = {
 'greeting': {'label':'Time of day','default':'evening','choices':['morning','afternoon','evening']},
 'flight': {'label':'Flight number (G9 + 3 digits)','default':'G9 123','pattern':r'^G9\s?\d{3}$'},
 'destination': {'label':'Destination city','default':'Sharjah'},
 'airport': {'label':'Airport name','default':'King Fahd International Airport'},
 'origin': {'label':'Origin city','default':'Dammam'},
 'gate': {'label':'Boarding gate','default':'12'},
 'new_gate': {'label':'New boarding gate','default':'14'},
 'old_gate': {'label':'Previous boarding gate','default':'12'},
 'boarding_time': {'label':'Boarding time (local)','default':'18:30','type':'time'},
 'time': {'label':'Revised departure time (local)','default':'19:00','type':'time'},
 'duration': {'label':'Delay in minutes','default':'30','type':'number'},
 'reason': {'label':'Delay reason','default':'operational requirements'},
 'names': {'label':'Passenger name(s), separated by commas','default':'Ahmed Ali'},
 'title': {'label':'Passenger title','default':'Mr.','choices':['Mr.','Ms.','Mrs.']},
 'terminal': {'label':'Terminal','default':'1'},
 'aircraft': {'label':'Aircraft type','default':'A320','choices':['A320','A321']},
 'belt': {'label':'Baggage reclaim belt','default':'3'},
 'date': {'label':'Travel date','default':'2026-10-17','type':'date'},
}
TEMPLATES=[]
def add(id, category, title, en, ar, ur, official=False, extra=()):
    fields=list(dict.fromkeys(re.findall(r'\[([a-z_]+)\]',en+ar+ur)+list(extra)))
    TEMPLATES.append(dict(id=id,category=category,title=title,texts=dict(en=en,ar=ar,ur=ur),fields=fields,
      verification={'en':'GOM verified; placeholders substituted' if official else 'Unverified — fallback / authored',
                    'ar':'Unverified — authored translation','ur':'Unverified — authored translation'}))

add('boarding','Boarding','General boarding',
'Good [greeting] ladies and gentlemen. Air Arabia welcomes you to [airport]. This is a boarding announcement for flight [flight] to [destination]. Passengers holding boarding cards for this flight are requested to proceed to gate number [gate] for boarding. Please have your boarding pass and travel documents ready. Thank you.',
'السيدات والسادة، [greeting]. ترحب بكم العربية للطيران في [airport]. نعلن عن بدء صعود ركاب الرحلة [flight] المتجهة إلى [destination]. يرجى من ركاب هذه الرحلة التوجه إلى البوابة رقم [gate]، مع تجهيز بطاقات الصعود ووثائق السفر. شكراً لكم.',
'خواتین و حضرات، [greeting]۔ [airport] پر ایئر عربیہ آپ کو خوش آمدید کہتی ہے۔ [destination] جانے والی پرواز [flight] کے مسافروں کی بورڈنگ شروع ہو گئی ہے۔ براہ کرم گیٹ نمبر [gate] پر تشریف لائیں اور اپنا بورڈنگ پاس اور سفری دستاویزات تیار رکھیں۔ شکریہ۔')
add('final','Final Call','Final call',
'Ladies and gentlemen, this is the final call for Air Arabia flight [flight] to [destination]. Passenger [names], please proceed immediately to gate number [gate], as the flight is ready for departure. Thank you.',
'السيدات والسادة، هذا هو النداء الأخير لرحلة العربية للطيران [flight] المتجهة إلى [destination]. يرجى من المسافرين [names] التوجه فوراً إلى البوابة رقم [gate]، فالرحلة جاهزة للمغادرة. شكراً لكم.',
'خواتین و حضرات، [destination] جانے والی ایئر عربیہ کی پرواز [flight] کے لیے یہ آخری اعلان ہے۔ مسافر [names] براہ کرم فوراً گیٹ نمبر [gate] پر پہنچیں۔ پرواز روانگی کے لیے تیار ہے۔ شکریہ۔')
add('gate','Gate Change','Gate change',
'Ladies and gentlemen, may we have your attention please. The departure gate for Air Arabia flight [flight] to [destination] has been changed. Boarding will now take place from gate number [new_gate] instead of gate number [old_gate]. Passengers are requested to proceed to gate number [new_gate]. We apologise for any inconvenience. Thank you.',
'السيدات والسادة، يرجى الانتباه. تم تغيير بوابة المغادرة لرحلة العربية للطيران [flight] المتجهة إلى [destination]. سيكون الصعود من البوابة رقم [new_gate] بدلاً من البوابة رقم [old_gate]. يرجى التوجه إلى البوابة رقم [new_gate]. نعتذر عن أي إزعاج، وشكراً لكم.',
'خواتین و حضرات، براہ کرم توجہ فرمائیں۔ [destination] جانے والی ایئر عربیہ کی پرواز [flight] کا گیٹ تبدیل ہو گیا ہے۔ بورڈنگ اب گیٹ نمبر [old_gate] کے بجائے گیٹ نمبر [new_gate] سے ہوگی۔ براہ کرم گیٹ نمبر [new_gate] پر تشریف لے جائیں۔ زحمت کے لیے معذرت خواہ ہیں۔ شکریہ۔')
add('delay','Delay','Delay — GOM',
'Ladies and Gentlemen / May I have your attention please./ AirArabia regrets to announce a /[duration]/Minute(s) Hour(s) delay flight /[flight]to [destination]./ This delay is due to / [reason] /. Estimated time for departure is / [time] (use A.M or P.M)\nWe are sorry for this delay and sincerely apologize for any inconveniences caused to you./ Our staff will be available for any assistance you may require',
'السيدات والسادة، يرجى الانتباه. تأسف العربية للطيران للإعلان عن تأخر رحلتها [flight] المتجهة إلى [destination] لمدة [duration] دقيقة، وذلك بسبب [reason]. موعد المغادرة المتوقع هو [time]. نعتذر عن هذا التأخير وما سببه من إزعاج. موظفونا مستعدون لتقديم المساعدة التي تحتاجون إليها.',
'خواتین و حضرات، براہ کرم توجہ فرمائیں۔ ایئر عربیہ کو افسوس ہے کہ [destination] جانے والی پرواز [flight]، [reason] کی وجہ سے [duration] منٹ تاخیر کا شکار ہے۔ روانگی کا متوقع وقت [time] ہے۔ اس تاخیر اور زحمت کے لیے معذرت خواہ ہیں۔ ہمارے عملے سے کسی بھی مدد کے لیے رابطہ کیجیے۔', True)
add('preboard','Special Assistance / Pre-Boarding','Pre-boarding',
'Ladies and gentlemen, Air Arabia flight [flight] to [destination] is now ready for pre-boarding. Passengers travelling with infants and young children, and passengers requiring special assistance, are invited to board first at gate number [gate]. Thank you.',
'السيدات والسادة، نبدأ الآن الصعود المبكر لرحلة العربية للطيران [flight] المتجهة إلى [destination]. ندعو المسافرين برفقة الرضع والأطفال الصغار، والمسافرين الذين يحتاجون إلى مساعدة خاصة، للتوجه إلى البوابة رقم [gate] للصعود أولاً. شكراً لكم.',
'خواتین و حضرات، [destination] جانے والی ایئر عربیہ کی پرواز [flight] کے لیے ابتدائی بورڈنگ شروع ہو رہی ہے۔ شیر خوار اور چھوٹے بچوں کے ساتھ سفر کرنے والے مسافر، اور خصوصی مدد کے ضرورت مند مسافر، پہلے سوار ہونے کے لیے گیٹ نمبر [gate] پر تشریف لائیں۔ شکریہ۔')
add('cancel','Cancellation','Cancellation',
'Ladies and gentlemen, may we have your attention please. Air Arabia regrets to inform you that flight [flight] to [destination] has been cancelled. Passengers are requested to proceed to the Air Arabia transfer desk for further assistance. Air Arabia apologises for the inconvenience caused. Thank you.',
'السيدات والسادة، يرجى الانتباه. تأسف العربية للطيران لإبلاغكم بإلغاء الرحلة [flight] المتجهة إلى [destination]. يرجى التوجه إلى مكتب تحويل الرحلات التابع للعربية للطيران للحصول على المساعدة. نعتذر عن الإزعاج الذي سببه هذا الإلغاء. شكراً لكم.',
'خواتین و حضرات، براہ کرم توجہ فرمائیں۔ ایئر عربیہ کو افسوس کے ساتھ اطلاع دینی ہے کہ [destination] جانے والی پرواز [flight] منسوخ کر دی گئی ہے۔ مزید مدد کے لیے ایئر عربیہ کے ٹرانسفر ڈیسک پر تشریف لے جائیں۔ اس زحمت کے لیے معذرت خواہ ہیں۔ شکریہ۔')
add('baggage','Baggage / Oversize','Cabin baggage at gate',
'Ladies and gentlemen, passengers travelling on Air Arabia flight [flight] to [destination] are kindly requested to check in their cabin baggage at the gate, as the flight is fully booked. Thank you for your cooperation.',
'السيدات والسادة، نظراً لاكتمال حجز رحلة العربية للطيران [flight] المتجهة إلى [destination]، يرجى تسليم حقائب المقصورة عند بوابة الصعود لشحنها مع الأمتعة. شكراً لتعاونكم.',
'خواتین و حضرات، [destination] جانے والی ایئر عربیہ کی پرواز [flight] مکمل طور پر بک ہے۔ مسافروں سے گزارش ہے کہ اپنا دستی سامان گیٹ پر عملے کے حوالے کریں تاکہ اسے جہاز کے سامان والے حصے میں رکھا جا سکے۔ تعاون کا شکریہ۔')
add('oversize','Baggage / Oversize','Oversize baggage',
'Ladies and gentlemen, passengers with oversized baggage for Air Arabia flight [flight] to [destination] are requested to contact our staff at gate number [gate] for assistance. Thank you.',
'السيدات والسادة، يرجى من ركاب رحلة العربية للطيران [flight] المتجهة إلى [destination] الذين يحملون أمتعة كبيرة الحجم مراجعة موظفينا عند البوابة رقم [gate] للمساعدة. شكراً لكم.',
'خواتین و حضرات، [destination] جانے والی ایئر عربیہ کی پرواز [flight] کے جن مسافروں کے پاس بڑے سائز کا سامان ہے، وہ مدد کے لیے گیٹ نمبر [gate] پر ہمارے عملے سے رابطہ کریں۔ شکریہ۔')
add('arrival','Arrival','Arrival / baggage reclaim',
'Ladies and gentlemen, welcome to [airport]. Air Arabia flight [flight] from [origin] has arrived. Baggage will be available at belt number [belt] in terminal [terminal]. Thank you for flying with Air Arabia.',
'السيدات والسادة، أهلاً بكم في [airport]. وصلت رحلة العربية للطيران [flight] القادمة من [origin]. يمكن استلام الأمتعة من السير رقم [belt] في مبنى الركاب رقم [terminal]. شكراً لاختياركم العربية للطيران.',
'خواتین و حضرات، [airport] پر خوش آمدید۔ [origin] سے آنے والی ایئر عربیہ کی پرواز [flight] پہنچ چکی ہے۔ سامان ٹرمینل [terminal] میں بیلٹ نمبر [belt] سے وصول کریں۔ ایئر عربیہ کے ساتھ سفر کرنے کا شکریہ۔')
add('transit','Transit','Connecting passengers',
'Ladies and gentlemen, passengers connecting to Air Arabia flight [flight] to [destination] are requested to proceed to gate number [gate] in terminal [terminal]. Boarding is scheduled for [boarding_time]. Please contact our transfer desk if you require assistance. Thank you.',
'السيدات والسادة، يرجى من المسافرين الذين يواصلون رحلتهم على العربية للطيران، الرحلة [flight] المتجهة إلى [destination]، التوجه إلى البوابة رقم [gate] في مبنى الركاب رقم [terminal]. يبدأ الصعود في [boarding_time]. للمساعدة، يرجى مراجعة مكتب تحويل الرحلات. شكراً لكم.',
'خواتین و حضرات، ایئر عربیہ کی پرواز [flight] سے [destination] جانے والے ٹرانزٹ مسافر ٹرمینل [terminal] میں گیٹ نمبر [gate] پر تشریف لے جائیں۔ بورڈنگ کا وقت [boarding_time] ہے۔ مدد کے لیے ٹرانسفر ڈیسک سے رابطہ کریں۔ شکریہ۔')
add('security','Security Reminder','Unattended baggage',
'Ladies and gentlemen, please keep your baggage with you at all times. Do not leave any item unattended or accept baggage from another person. If you notice an unattended item, please inform airport staff immediately. Thank you for your cooperation.',
'السيدات والسادة، يرجى إبقاء أمتعتكم معكم في جميع الأوقات، وعدم تركها دون مراقبة أو قبول أمتعة من أشخاص آخرين. إذا لاحظتم أي أمتعة متروكة، يرجى إبلاغ موظفي المطار فوراً. شكراً لتعاونكم.',
'خواتین و حضرات، اپنا سامان ہر وقت اپنے پاس رکھیں۔ کوئی چیز لاوارث نہ چھوڑیں اور کسی دوسرے شخص کا سامان قبول نہ کریں۔ کوئی لاوارث چیز نظر آئے تو فوراً ہوائی اڈے کے عملے کو اطلاع دیں۔ تعاون کا شکریہ۔')
add('welcome','Welcome','Welcome',
'Good [greeting] ladies and gentlemen. Welcome to [airport]. Air Arabia wishes you a pleasant journey. Please check the flight information screens for your departure gate and boarding time. Our staff will be happy to assist you. Thank you.',
'السيدات والسادة، [greeting]. أهلاً بكم في [airport]. تتمنى لكم العربية للطيران رحلة سعيدة. يرجى متابعة شاشات معلومات الرحلات لمعرفة بوابة المغادرة وموعد الصعود. يسعد موظفينا تقديم المساعدة. شكراً لكم.',
'خواتین و حضرات، [greeting]۔ [airport] پر خوش آمدید۔ ایئر عربیہ آپ کے خوشگوار سفر کی خواہش مند ہے۔ روانگی کے گیٹ اور بورڈنگ کے وقت کے لیے پروازوں کی معلوماتی اسکرینیں دیکھتے رہیں۔ ہمارا عملہ آپ کی مدد کے لیے حاضر ہے۔ شکریہ۔')
add('row','Boarding','GOM • rows 14–28 / A321 18–36',
'Ladies and Gentlemen, Good [greeting]. Air Arabia welcomes you on board on a Non-Stop Flight service from [origin] to [destination]. To allow a smooth boarding process, we now welcome passengers seated from row 14 to row 28 to board 1ˢᵗ. Remaining passengers kindly be seated and await for the announcement.',
'السيدات والسادة، [greeting]. ترحب بكم العربية للطيران على رحلتها المباشرة من [origin] إلى [destination]. لتسهيل الصعود، ندعو الآن الركاب في الصفوف من [row_start] إلى [row_end] للصعود أولاً. يرجى من بقية الركاب البقاء جالسين وانتظار الإعلان التالي.',
'خواتین و حضرات، [greeting]۔ [origin] سے [destination] کی براہ راست پرواز پر ایئر عربیہ آپ کو خوش آمدید کہتی ہے۔ آسان بورڈنگ کے لیے صف [row_start] سے صف [row_end] تک کے مسافر پہلے تشریف لائیں۔ باقی مسافر براہ کرم تشریف رکھیں اور اگلے اعلان کا انتظار کریں۔',True,('aircraft',))
add('zone_c','Boarding','GOM • zone C',
'Ladies and Gentlemen, Good [greeting]. Air Arabia welcomes you on board on a Non-Stop Flight service from [origin] to [destination]. To allow a smooth boarding process, we now welcome passengers seated from zone C. Remaining passengers kindly be seated and await for the announcement.',
'السيدات والسادة، [greeting]. ترحب بكم العربية للطيران على رحلتها المباشرة من [origin] إلى [destination]. لتسهيل الصعود، ندعو الآن ركاب المنطقة سي. يرجى من بقية الركاب البقاء جالسين وانتظار الإعلان التالي.',
'خواتین و حضرات، [greeting]۔ [origin] سے [destination] کی براہ راست پرواز پر ایئر عربیہ آپ کو خوش آمدید کہتی ہے۔ آسان بورڈنگ کے لیے زون سی کے مسافر تشریف لائیں۔ باقی مسافر براہ کرم بیٹھے رہیں اور اگلے اعلان کا انتظار کریں۔',True)
add('zone_b','Boarding','GOM • zone B',
'Thank you for waiting, we now welcome all passengers seated on zone B.',
'شكراً لانتظاركم. ندعو الآن جميع ركاب المنطقة بي للصعود.',
'انتظار کا شکریہ۔ اب زون بی کے تمام مسافر سوار ہونے کے لیے تشریف لائیں۔',True)
add('remaining','Boarding','GOM • remaining passengers',
'We now welcome the remaining passengers to board the aircraft.',
'ندعو الآن بقية الركاب للصعود إلى الطائرة.',
'اب باقی تمام مسافر جہاز میں سوار ہونے کے لیے تشریف لائیں۔',True)
add('pleasant','Boarding','GOM • closing remark',
'We wish you a pleasant flight.',
'نتمنى لكم رحلة سعيدة.',
'ہم آپ کے خوشگوار سفر کے خواہش مند ہیں۔',True)
for action, en, ar, ur in [('aircraft','you are requested to kindly proceed to the aircraft immediately','يرجى التوجه إلى الطائرة فوراً','براہ کرم فوراً جہاز کی طرف تشریف لے جائیں'),('staff','You are requested to contact our guest service staff immediately','يرجى مراجعة موظفي خدمة المسافرين فوراً','براہ کرم فوراً ہمارے مسافر خدمات کے عملے سے رابطہ کریں')]:
 add('page_'+action,'Final Call','GOM • paging / '+action,
 'Ladies and Gentlemen, Calling the attention of [title] [names], Passenger travelling on AirArabia [flight] to [destination].\n[title] [names] ('+en+')\nThank you.',
 'السيدات والسادة، نرجو انتباه المسافر [names] على رحلة العربية للطيران [flight] المتجهة إلى [destination]. '+ar+'. شكراً لكم.',
 'خواتین و حضرات، [destination] جانے والی ایئر عربیہ کی پرواز [flight] کے مسافر [names] توجہ فرمائیں۔ '+ur+'۔ شکریہ۔',True)
add('tentative','Delay','GOM • tentative delay',
'Ladies and Gentlemen / May I have your attention please / Air Arabia Regrets to announce a [duration] Minute/ Hour(s) tentative delay of its flight [flight] to [destination]./ This delay is due to [reason]./ We would share further updates on delay and sincerely apologize for any inconveniences caused to you./Our staff will be available for any assistance you may require.\nThank You',
'السيدات والسادة، يرجى الانتباه. تأسف العربية للطيران للإعلان عن تأخر مبدئي لمدة [duration] دقيقة لرحلتها [flight] المتجهة إلى [destination]، وذلك بسبب [reason]. سنوافيكم بالمستجدات، ونعتذر عن الإزعاج. موظفونا مستعدون لمساعدتكم. شكراً لكم.',
'خواتین و حضرات، براہ کرم توجہ فرمائیں۔ ایئر عربیہ کو افسوس ہے کہ [destination] جانے والی پرواز [flight]، [reason] کی وجہ سے ابتدائی اندازے کے مطابق [duration] منٹ تاخیر کا شکار ہے۔ مزید معلومات فراہم کی جائیں گی۔ زحمت کے لیے معذرت خواہ ہیں۔ ہمارا عملہ مدد کے لیے حاضر ہے۔ شکریہ۔',True)
# Computed fields are never editable; governed by the source's A321 instruction.
for t in TEMPLATES:
 t['fields']=[f for f in t['fields'] if f not in ('row_start','row_end')]
BY_ID={t['id']:t for t in TEMPLATES}
DEFAULTS={k:v['default'] for k,v in FIELDS.items()}

add('bridge_a','Boarding','Aerobridge • Zone A first',
'Ladies and gentlemen, Air Arabia flight [flight] to [destination] is now ready for boarding. We invite passengers seated in Zone A to proceed to gate number [gate]. Please have your boarding pass and travel documents ready. Thank you.',
'السيدات والسادة، نعلن عن بدء الصعود لرحلة العربية للطيران [flight] المتجهة إلى [destination]. ندعو الآن ركاب المنطقة إيه للتوجه إلى البوابة رقم [gate]. يرجى تجهيز بطاقات الصعود ووثائق السفر. شكراً لكم.',
'خواتین و حضرات، [destination] جانے والی ایئر عربیہ کی پرواز [flight] کی بورڈنگ شروع ہو رہی ہے۔ زون اے کے مسافر گیٹ نمبر [gate] پر تشریف لائیں۔ اپنا بورڈنگ پاس اور سفری دستاویزات تیار رکھیں۔ شکریہ۔')
add('bridge_bc','Boarding','Aerobridge • Zones B + C / free boarding',
'Ladies and gentlemen, we now invite all remaining passengers in Zones B and C on Air Arabia flight [flight] to [destination] to board at gate number [gate]. Please have your boarding pass and travel documents ready. Thank you.',
'السيدات والسادة، ندعو الآن جميع الركاب المتبقين في المنطقتين بي وسي على رحلة العربية للطيران [flight] المتجهة إلى [destination] للصعود من البوابة رقم [gate]. يرجى تجهيز بطاقات الصعود ووثائق السفر. شكراً لكم.',
'خواتین و حضرات، [destination] جانے والی ایئر عربیہ کی پرواز [flight] کے زون بی اور سی کے تمام باقی مسافر گیٹ نمبر [gate] پر سوار ہونے کے لیے تشریف لائیں۔ اپنا بورڈنگ پاس اور سفری دستاویزات تیار رکھیں۔ شکریہ۔')
for t in TEMPLATES:
 t['operation']='remote' if t['id'] in ('row','zone_c','zone_b','remaining') else 'bridge' if t['id'].startswith('bridge_') else 'all'
 if t['operation']=='bridge':
  t['verification']={lang:'GSA-aligned authored wording — AAG/GSA/002/2026, effective 02 OCT 2026' for lang in ('en','ar','ur')}
BY_ID={t['id']:t for t in TEMPLATES}

BY_ID['page_staff']['verification']['en']='GOM-derived adaptation — passenger name repeated; see source transcription'
