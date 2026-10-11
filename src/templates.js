export const AIRPORT_NAMES = {
  SHJ: { en: 'Sharjah', ar: 'الشارقة', ur: 'شارجہ' },
  AUH: { en: 'Abu Dhabi', ar: 'أبوظبي', ur: 'ابوظہبی' },
  DXB: { en: 'Dubai', ar: 'دبي', ur: 'دبئی' },
  GIZ: { en: 'Jazan', ar: 'جازان', ur: 'جازان' },
  JED: { en: 'Jeddah', ar: 'جدة', ur: 'جدہ' },
  RUH: { en: 'Riyadh', ar: 'الرياض', ur: 'ریاض' },
  DMM: { en: 'Dammam', ar: 'الدمام', ur: 'دمام' },
  MED: { en: 'Madinah', ar: 'المدينة', ur: 'مدینہ' },
  CAI: { en: 'Cairo', ar: 'القاهرة', ur: 'قاہرہ' },
  HBE: { en: 'Alexandria', ar: 'الإسكندرية', ur: 'اسکندریہ' },
  KHI: { en: 'Karachi', ar: 'كراتشي', ur: 'کراچی' },
  LHE: { en: 'Lahore', ar: 'لاهور', ur: 'لاہور' },
  ISB: { en: 'Islamabad', ar: 'إسلام آباد', ur: 'اسلام آباد' },
  DEL: { en: 'Delhi', ar: 'دلهي', ur: 'دہلی' },
  BOM: { en: 'Mumbai', ar: 'مومباي', ur: 'ممبئی' },
  CMN: { en: 'Casablanca', ar: 'الدار البيضاء', ur: 'کاسابلانکا' },
  BAH: { en: 'Bahrain', ar: 'البحرين', ur: 'بحرین' },
  DOH: { en: 'Doha', ar: 'الدوحة', ur: 'دوحہ' },
  MCT: { en: 'Muscat', ar: 'مسقط', ur: 'مسقط' },
  KWI: { en: 'Kuwait', ar: 'الكويت', ur: 'کویت' },
  SAW: { en: 'Istanbul', ar: 'إسطنبول', ur: 'استنبول' },
};


export const AIRLINE_NAMES = {
  "Air Arabia": { en: "Air Arabia", ar: "العربية للطيران", ur: "ایئر عربیہ" },
  "Air Arabia Egypt": { en: "Air Arabia Egypt", ar: "العربية للطيران مصر", ur: "ایئر عربیہ مصر" },
  "Air Arabia Maroc": { en: "Air Arabia Maroc", ar: "العربية للطيران المغرب", ur: "ایئر عربیہ مراکش" },
  "Fly Jinnah": { en: "Fly Jinnah", ar: "فلاي جناح", ur: "فلائے جناح" },
};


AIRLINE_NAMES["Air Arabia Dammam"] = {en:"Air Arabia",ar:"العربية للطيران",ur:"ایئر عربیہ"};
AIRLINE_NAMES["Air Arabia Abu Dhabi"] = {en:"Air Arabia Abu Dhabi",ar:"العربية للطيران أبوظبي",ur:"ایئر عربیہ ابوظہبی"};

export const templates = {
  en: {
    goToGate: (d) => `Ladies and Gentlemen, ${d.greeting}. Passengers travelling on ${d.airline} flight ${d.flight} from ${d.origin} to ${d.destination} are kindly requested to proceed to gate ${d.gate} at this time. Boarding will commence shortly. Thank you.`,
    boardRow1: (d) => {
      const rows = d.rows;
      return `Ladies and Gentlemen, ${d.greeting}. ${d.airline} welcomes you on board on a Non-Stop Flight service from ${d.origin} to ${d.destination}. To allow a smooth boarding process, we now welcome passengers seated from row ${rows.from} to row ${rows.to} to board at this time. Remaining passengers kindly be seated and await for the announcement.`;
    },
    boardRow2: (d) => `Ladies and Gentlemen. We now welcome the remaining passengers to board the aircraft. We wish you a pleasant flight.`,
    boardZoneC: (d) => `Ladies and Gentlemen, ${d.greeting}. ${d.airline} welcomes you on board on a Non-Stop Flight service from ${d.origin} to ${d.destination}. To allow a smooth boarding process, we now welcome passengers seated in Zone C. Remaining passengers kindly be seated and await for the announcement.`,
    boardZoneB: () => `Thank you for waiting. We now welcome all passengers seated in Zone B.`,
    boardZoneRemain: (d) => `We now welcome the remaining passengers to board the aircraft. We wish you a pleasant flight.`,
    first: (d) => `Attention please. This is the first call for ${d.airline} flight ${d.flight} from ${d.origin} to ${d.destination}. Passengers are requested to proceed to gate ${d.gate} for boarding.`,
    second: (d) => `Attention please. This is the second call for ${d.airline} flight ${d.flight} to ${d.destination}. All remaining passengers please proceed immediately to gate ${d.gate}.`,
    final: (d) => `Final call. Final call for ${d.airline} flight ${d.flight} to ${d.destination}. This is the last call for boarding at gate ${d.gate}. Passengers who have not yet boarded should proceed to the gate immediately.`,
    priority: (d) => `Priority boarding is now open for ${d.airline} flight ${d.flight} to ${d.destination}. Business class, elite members and passengers requiring priority assistance, please proceed to gate ${d.gate}.`,
    families: (d) => `Families with young children and passengers travelling with infants are now invited to board ${d.airline} flight ${d.flight} to ${d.destination} at gate ${d.gate}.`,
    assistance: (d) => `Passengers requiring special assistance or wheelchair support for ${d.airline} flight ${d.flight} to ${d.destination}, please proceed to gate ${d.gate} at this time.`,
    gateClosing: (d) => `Attention. The gate is now closing for ${d.airline} flight ${d.flight} to ${d.destination}. All remaining passengers must board immediately at gate ${d.gate}. The aircraft doors will close shortly.`,
    completed: (d) => `Boarding is now complete for ${d.airline} flight ${d.flight} to ${d.destination}. We wish you a pleasant flight. Thank you for flying with ${d.airline}.`,
    delayTentative: (d) => {
      let s = `Ladies and Gentlemen, may I have your attention please. ${d.airline} regrets to announce a ${d.delayAmount} tentative delay of its flight ${d.flight} from ${d.origin} to ${d.destination}.`;
      if (d.delayReason) s += ` This delay is due to ${d.delayReason}.`;
      s += ` We will share further updates on the delay and sincerely apologize for any inconvenience caused to you. Our staff will be available for any assistance you may require. Thank you.`;
      return s;
    },
    delayFull: (d) => {
      let s = `Ladies and Gentlemen, may I have your attention please. ${d.airline} regrets to announce a ${d.delayAmount} delay of flight ${d.flight} from ${d.origin} to ${d.destination}.`;
      if (d.delayReason) s += ` This delay is due to ${d.delayReason}.`;
      if (d.etd) s += ` Estimated time of departure is ${d.etd}.`;
      s += ` We are sorry for this delay and sincerely apologize for any inconvenience caused to you. Our staff will be available for any assistance you may require. Thank you.`;
      return s;
    },
    gateChange: (d) => `Attention please. There has been a gate change for ${d.airline} flight ${d.flight} to ${d.destination}. The new gate is ${d.gate}. Please proceed to the new gate.`,
    resumed: (d) => `Attention. Boarding has now resumed for ${d.airline} flight ${d.flight} to ${d.destination} at gate ${d.gate}. Please proceed to the gate.`,
    page: (d, title, name) => `Ladies and Gentlemen. Calling the attention of ${title} ${name}. Passenger travelling on ${d.airline} flight ${d.flight} to ${d.destination}. ${title} ${name}. Please contact our guest service staff immediately. Or proceed to the aircraft without delay. Thank you.`
  },
  ar: {
    goToGate: (d) => `سيداتي سادتي. ${d.greeting}. يرجى من الركاب المسافرين على رحلة ${d.airline} رقم ${d.flight}. من ${d.origin} إلى ${d.destination}. التوجه الآن إلى البوابة رقم ${d.gate}. سيبدأ الصعود إلى الطائرة قريباً. شكراً لكم.`,
    boardRow1: (d) => {
      const rows = d.rows;
      return `سيداتي سادتي. ${d.greeting}. ترحب بكم ${d.airline} على متن رحلتها المباشرة. من ${d.origin} إلى ${d.destination}. لتسهيل عملية الصعود. ندعو الآن الركاب الجالسين من الصف ${rows.from} إلى الصف ${rows.to}. للصعود في هذا الوقت. يرجى من بقية الركاب البقاء في أماكنهم. وانتظار الإعلان التالي.`;
    },
    boardRow2: (d) => `سيداتي سادتي. ندعو الآن بقية الركاب للصعود إلى الطائرة. نتمنى لكم رحلة طيبة.`,
    boardZoneC: (d) => `سيداتي سادتي. ${d.greeting}. ترحب بكم ${d.airline} على متن رحلتها المباشرة. من ${d.origin} إلى ${d.destination}. لتسهيل عملية الصعود. ندعو الآن الركاب في المنطقة سي. يرجى من بقية الركاب البقاء في أماكنهم. وانتظار الإعلان التالي.`,
    boardZoneB: () => `شكراً لانتظاركم. ندعو الآن جميع الركاب في المنطقة بي. للصعود إلى الطائرة.`,
    boardZoneRemain: (d) => `ندعو الآن بقية الركاب للصعود إلى الطائرة. نتمنى لكم رحلة طيبة.`,
    first: (d) => `انتباه من فضلكم. هذا هو النداء الأول. لرحلة ${d.airline} رقم ${d.flight}. من ${d.origin} إلى ${d.destination}. يرجى من الركاب التوجه إلى البوابة رقم ${d.gate}. للصعود إلى الطائرة.`,
    second: (d) => `انتباه من فضلكم. هذا هو النداء الثاني. لرحلة ${d.airline} رقم ${d.flight}. إلى ${d.destination}. يرجى من جميع الركاب المتبقين. التوجه فوراً إلى البوابة رقم ${d.gate}.`,
    final: (d) => `آخر نداء. آخر نداء. لرحلة ${d.airline} رقم ${d.flight}. إلى ${d.destination}. هذا هو آخر نداء للصعود. من البوابة رقم ${d.gate}. يرجى من الركاب الذين لم يصعدوا بعد. التوجه فوراً إلى البوابة.`,
    priority: (d) => `بدأ الصعود ذو الأولوية. لرحلة ${d.airline} رقم ${d.flight}. إلى ${d.destination}. يرجى من ركاب درجة الأعمال. والأعضاء المميزين. والركاب الذين يحتاجون مساعدة ذات أولوية. التوجه إلى البوابة رقم ${d.gate}.`,
    families: (d) => `ندعو العائلات التي لديها أطفال صغار. والركاب المسافرين مع الرضع. للصعود إلى رحلة ${d.airline} رقم ${d.flight}. إلى ${d.destination}. من البوابة رقم ${d.gate}.`,
    assistance: (d) => `الركاب الذين يحتاجون إلى مساعدة خاصة. أو كرسي متحرك. لرحلة ${d.airline} رقم ${d.flight}. إلى ${d.destination}. يرجى التوجه الآن إلى البوابة رقم ${d.gate}.`,
    gateClosing: (d) => `انتباه. يتم الآن إغلاق البوابة. لرحلة ${d.airline} رقم ${d.flight}. إلى ${d.destination}. يجب على جميع الركاب المتبقين الصعود فوراً. من البوابة رقم ${d.gate}. أبواب الطائرة ستُغلق قريباً.`,
    completed: (d) => `اكتمل صعود الركاب. لرحلة ${d.airline} رقم ${d.flight}. إلى ${d.destination}. نتمنى لكم رحلة طيبة. شكراً لاختياركم ${d.airline}.`,
    delayTentative: (d) => {
      let s = `سيداتي سادتي. هل لي أن أحظى باهتمامكم. تأسف ${d.airline} للإعلان عن تأخير مبدئي. لمدة ${d.delayAmount}. لرحلتها رقم ${d.flight}. من ${d.origin} إلى ${d.destination}.`;
      if (d.delayReason) s += ` يعود هذا التأخير إلى ${d.delayReason}.`;
      s += ` سنوافيكم بالمزيد من التحديثات. ونعتذر بصدق عن أي إزعاج. سيكون طاقمنا متاحاً لأي مساعدة. شكراً لكم.`;
      return s;
    },
    delayFull: (d) => {
      let s = `سيداتي سادتي. هل لي أن أحظى باهتمامكم. تأسف ${d.airline} للإعلان عن تأخير. لمدة ${d.delayAmount}. لرحلة رقم ${d.flight}. من ${d.origin} إلى ${d.destination}.`;
      if (d.delayReason) s += ` يعود هذا التأخير إلى ${d.delayReason}.`;
      if (d.etd) s += ` الوقت المقدر للإقلاع هو ${d.etd}.`;
      s += ` نأسف لهذا التأخير. ونعتذر بصدق عن أي إزعاج. سيكون طاقمنا متاحاً لأي مساعدة. شكراً لكم.`;
      return s;
    },
    gateChange: (d) => `انتباه من فضلكم. تم تغيير بوابة الرحلة. رحلة ${d.airline} رقم ${d.flight}. إلى ${d.destination}. البوابة الجديدة هي رقم ${d.gate}. يرجى التوجه إلى البوابة الجديدة.`,
    resumed: (d) => `انتباه. تم استئناف صعود الركاب. لرحلة ${d.airline} رقم ${d.flight}. إلى ${d.destination}. من البوابة رقم ${d.gate}. يرجى التوجه إلى البوابة.`,
    page: (d, title, name) => {
      const tMap = { 'Mr.': 'السيد', 'Ms.': 'السيدة', 'Mrs.': 'السيدة', 'Miss': 'الآنسة' };
      const t = tMap[title] || title;
      return `سيداتي سادتي. نداء للراكب. ${t} ${name}. المسافر على رحلة ${d.airline}. رقم ${d.flight}. إلى ${d.destination}. ${t} ${name}. يرجى التوجه فوراً إلى موظفي خدمة الضيوف. أو إلى الطائرة. شكراً لكم.`;
    }
  },
  ur: {
    goToGate: (d) => `خواتین و حضرات، ${d.greeting}. مسافروں سے درخواست ہے جو ${d.airline} فلائٹ نمبر ${d.flight} پر ${d.origin} سے ${d.destination} جا رہے ہیں، براہ کرم ابھی گیٹ نمبر ${d.gate} پر تشریف لائیں۔ بورڈنگ جلد شروع ہو گی۔ شکریہ۔`,
    boardRow1: (d) => {
      const rows = d.rows;
      return `خواتین و حضرات، ${d.greeting}. ${d.airline} آپ کا خیرمقدم کرتی ہے اپنی براہ راست پرواز پر جو ${d.origin} سے ${d.destination} جا رہی ہے۔ ہموار بورڈنگ کے لیے اب ہم صف ${rows.from} سے صف ${rows.to} تک بیٹھے مسافروں کو بورڈ ہونے کی دعوت دیتے ہیں۔ باقی مسافر براہ کرم اپنی سیٹوں پر بیٹھے رہیں اور اگلے اعلان کا انتظار کریں۔`;
    },
    boardRow2: (d) => `خواتین و حضرات۔ اب ہم باقی مسافروں کو طیارے پر بورڈ ہونے کی دعوت دیتے ہیں۔ ہم آپ کے لیے خوشگوار پرواز کی خواہش کرتے ہیں۔`,
    boardZoneC: (d) => `خواتین و حضرات، ${d.greeting}. ${d.airline} آپ کا خیرمقدم کرتی ہے اپنی براہ راست پرواز پر جو ${d.origin} سے ${d.destination} جا رہی ہے۔ ہموار بورڈنگ کے لیے اب ہم زون C میں بیٹھے مسافروں کو بورڈ ہونے کی دعوت دیتے ہیں۔ باقی مسافر براہ کرم اپنی سیٹوں پر بیٹھے رہیں اور اگلے اعلان کا انتظار کریں۔`,
    boardZoneB: () => `انتظار کرنے کا شکریہ۔ اب ہم زون B میں بیٹھے تمام مسافروں کو بورڈ ہونے کی دعوت دیتے ہیں۔`,
    boardZoneRemain: (d) => `اب ہم باقی مسافروں کو طیارے پر بورڈ ہونے کی دعوت دیتے ہیں۔ ہم آپ کے لیے خوشگوار پرواز کی خواہش کرتے ہیں۔`,
    first: (d) => `توجہ فرمائیں۔ یہ ${d.airline} فلائٹ نمبر ${d.flight} کا پہلا اعلان ہے جو ${d.origin} سے ${d.destination} جا رہی ہے۔ مسافروں سے درخواست ہے کہ گیٹ نمبر ${d.gate} پر بورڈنگ کے لیے تشریف لائیں۔`,
    second: (d) => `توجہ فرمائیں۔ یہ ${d.airline} فلائٹ نمبر ${d.flight} کا دوسرا اعلان ہے جو ${d.destination} جا رہی ہے۔ تمام باقی مسافروں سے درخواست ہے کہ فوری طور پر گیٹ نمبر ${d.gate} پر تشریف لائیں۔`,
    final: (d) => `آخری اعلان۔ آخری اعلان ${d.airline} فلائٹ نمبر ${d.flight} کے لیے جو ${d.destination} جا رہی ہے۔ یہ گیٹ نمبر ${d.gate} پر بورڈنگ کا آخری اعلان ہے۔ جو مسافر ابھی بورڈ نہیں ہوئے وہ فوری طور پر گیٹ پر تشریف لائیں۔`,
    priority: (d) => `${d.airline} فلائٹ نمبر ${d.flight} کے لیے ترجیحی بورڈنگ اب شروع ہو گئی ہے جو ${d.destination} جا رہی ہے۔ بزنس کلاس، ایلیٹ ممبرز اور جن مسافروں کو ترجیحی مدد درکار ہے، براہ کرم گیٹ نمبر ${d.gate} پر تشریف لائیں۔`,
    families: (d) => `نوجوان بچوں والے خاندان اور شیرخوار بچوں کے ساتھ سفر کرنے والے مسافروں کو دعوت دی جاتی ہے کہ وہ ${d.airline} فلائٹ نمبر ${d.flight} پر بورڈ کریں جو ${d.destination} جا رہی ہے، گیٹ نمبر ${d.gate} پر۔`,
    assistance: (d) => `جن مسافروں کو خصوصی مدد یا وہیل چیئر سپورٹ درکار ہے ${d.airline} فلائٹ نمبر ${d.flight} کے لیے جو ${d.destination} جا رہی ہے، براہ کرم ابھی گیٹ نمبر ${d.gate} پر تشریف لائیں۔`,
    gateClosing: (d) => `توجہ فرمائیں۔ ${d.airline} فلائٹ نمبر ${d.flight} کے لیے گیٹ بند کیا جا رہا ہے جو ${d.destination} جا رہی ہے۔ تمام باقی مسافروں کو فوری طور پر گیٹ نمبر ${d.gate} سے بورڈ کرنا ہوگا۔ طیارے کے دروازے جلد بند ہو جائیں گے۔`,
    completed: (d) => `${d.airline} فلائٹ نمبر ${d.flight} کی بورڈنگ مکمل ہو گئی ہے جو ${d.destination} جا رہی ہے۔ ہم آپ کے لیے خوشگوار پرواز کی خواہش کرتے ہیں۔ ${d.airline} کے ساتھ سفر کرنے کا شکریہ۔`,
    delayTentative: (d) => {
      let s = `خواتین و حضرات، براہ کرم توجہ دیں۔ ${d.airline} کو افسوس ہے کہ فلائٹ نمبر ${d.flight} جو ${d.origin} سے ${d.destination} جا رہی ہے، ${d.delayAmount} کی عارضی تاخیر کا اعلان کرتی ہے۔`;
      if (d.delayReason) s += ` یہ تاخیر ${d.delayReason} کی وجہ سے ہے۔`;
      s += ` ہم تاخیر کے بارے میں مزید اپڈیٹس شیئر کریں گے اور کسی بھی تکلیف کے لیے معذرت خواہ ہیں۔ ہمارا عملہ کسی بھی مدد کے لیے دستیاب ہوگا۔ شکریہ۔`;
      return s;
    },
    delayFull: (d) => {
      let s = `خواتین و حضرات، براہ کرم توجہ دیں۔ ${d.airline} کو افسوس ہے کہ فلائٹ نمبر ${d.flight} جو ${d.origin} سے ${d.destination} جا رہی ہے، ${d.delayAmount} کی تاخیر کا اعلان کرتی ہے۔`;
      if (d.delayReason) s += ` یہ تاخیر ${d.delayReason} کی وجہ سے ہے۔`;
      if (d.etd) s += ` تخمینی روانگی کا وقت ${d.etd} ہے۔`;
      s += ` ہم اس تاخیر کے لیے معذرت خواہ ہیں۔ ہمارا عملہ کسی بھی مدد کے لیے دستیاب ہوگا۔ شکریہ۔`;
      return s;
    },
    gateChange: (d) => `توجہ فرمائیں۔ ${d.airline} فلائٹ نمبر ${d.flight} کے گیٹ میں تبدیلی ہوئی ہے جو ${d.destination} جا رہی ہے۔ نیا گیٹ نمبر ${d.gate} ہے۔ براہ کرم نئے گیٹ پر تشریف لائیں۔`,
    resumed: (d) => `توجہ فرمائیں۔ ${d.airline} فلائٹ نمبر ${d.flight} کی بورڈنگ دوبارہ شروع ہو گئی ہے جو ${d.destination} جا رہی ہے، گیٹ نمبر ${d.gate} پر۔ براہ کرم گیٹ پر تشریف لائیں۔`,
    page: (d, title, name) => {
      const tMap = { 'Mr.': 'جناب', 'Ms.': 'محترمہ', 'Mrs.': 'محترمہ', 'Miss': 'محترمہ' };
      const t = tMap[title] || title;
      return `خواتین و حضرات۔ ${t} ${name} کی توجہ مبذول کرواتے ہیں۔ مسافر جو ${d.airline} فلائٹ نمبر ${d.flight} پر ${d.destination} جا رہے ہیں۔ ${t} ${name}۔ براہ کرم فوری طور پر گیسٹ سروس سے رابطہ کریں۔ یا طیارے کی طرف تشریف لائیں۔ شکریہ۔`;
    }
  }
};

