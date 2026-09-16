/* =========================================================
   AIRPORT ANNOUNCER – Microsoft Edge Neural ONLY
   No Puter. No browser voices. Pure Edge Neural via Netlify.
   ========================================================= */

let currentAudio = null;
let isSpeaking = false;
let playToken = 0; // prevents double / overlapping playback
let wakeLock = null;

async function requestWakeLock() {
  try {
    if (!('wakeLock' in navigator)) return;
    // release any previous lock first
    if (wakeLock) {
      try { await wakeLock.release(); } catch (e) {}
      wakeLock = null;
    }
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      // OS may release on tab hide; re-acquire if still announcing
    });
  } catch (e) {
    // not supported or denied – ignore
  }
}

async function releaseWakeLock() {
  try {
    if (wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (e) {
    wakeLock = null;
  }
}

// Re-request wake lock if user returns to the tab during an announcement
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && isSpeaking) {
    await requestWakeLock();
  }
});

// Male Neural voices only (high quality)
const MALE_VOICES = {
  en: 'en-US-GuyNeural',       // HD English male
  ar: 'ar-AE-HamdanNeural',    // HD Emirati UAE male (default Arabic)
  ur: 'ur-PK-AsadNeural'       // HD Urdu male
};

const AIRPORT_NAMES = {
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


const AIRLINE_NAMES = {
  "Air Arabia": { en: "Air Arabia", ar: "العربية للطيران", ur: "ایئر عربیہ" },
  "Air Arabia Egypt": { en: "Air Arabia Egypt", ar: "العربية للطيران مصر", ur: "ایئر عربیہ مصر" },
  "Air Arabia Maroc": { en: "Air Arabia Maroc", ar: "العربية للطيران المغرب", ur: "ایئر عربیہ مراکش" },
  "Fly Jinnah": { en: "Fly Jinnah", ar: "فلاي جناح", ur: "فلائے جناح" },
};

function resolveAirport(codeOrName, langKey) {
  if (!codeOrName) return codeOrName;
  const raw = codeOrName.trim();
  const upper = raw.toUpperCase();
  if (AIRPORT_NAMES[upper]) return AIRPORT_NAMES[upper][langKey] || AIRPORT_NAMES[upper].en;
  for (const names of Object.values(AIRPORT_NAMES)) {
    if (names.en.toLowerCase() === raw.toLowerCase()) return names[langKey] || names.en;
  }
  return raw;
}

let audioUnlocked = false;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms))
  ]);
}

async function unlockAudio() {
  if (audioUnlocked) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      if (!window.__paCtx) window.__paCtx = new Ctx();
      if (window.__paCtx.state === 'suspended') {
        await withTimeout(window.__paCtx.resume(), 800);
      }
    }
  } catch (e) {}

  try {
    const a = new Audio();
    a.setAttribute('playsinline', 'true');
    a.setAttribute('webkit-playsinline', 'true');
    // very short silent wav
    a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';
    a.volume = 0.01;
    await withTimeout(a.play().catch(() => {}), 600);
    try { a.pause(); } catch (e) {}
  } catch (e) {}

  audioUnlocked = true;
}

function playChime() {
  return new Promise(async (resolve) => {
    const done = () => resolve();
    const timer = setTimeout(done, 1500);
    try {
      await unlockAudio();
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) { clearTimeout(timer); done(); return; }
      if (!window.__paCtx) window.__paCtx = new Ctx();
      const ctx = window.__paCtx;
      if (ctx.state === 'suspended') {
        await withTimeout(ctx.resume(), 500);
      }
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.04 + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + 1.0 + i * 0.12);
        } catch (e) {}
      });
    } catch (e) {
      clearTimeout(timer);
      done();
    }
  });
}

function getLangKey() {
  const lang = document.getElementById('language').value;
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('ur')) return 'ur';
  return 'en';
}

function getGreeting() {
  const tod = document.getElementById('timeOfDay').value;
  const langKey = getLangKey();
  if (langKey === 'ar') return tod === 'Morning' ? 'صباح الخير' : 'مساء الخير';
  if (langKey === 'ur') return tod === 'Morning' ? 'صبح بخیر' : 'آداب';
  return `Good ${tod}`;
}

function getRows() {
  return document.getElementById('aircraft').value === 'A321' ? { from: 18, to: 36 } : { from: 14, to: 28 };
}

function getFlightData() {
  const langKey = getLangKey();
  const rawOrigin = document.getElementById('origin').value.trim() || 'DMM';
  const rawDest = document.getElementById('destination').value.trim() || 'SHJ';
  const airlineEn = document.getElementById('airline').value;
  const airlineLocal = (AIRLINE_NAMES[airlineEn] && AIRLINE_NAMES[airlineEn][langKey]) || airlineEn;
  return {
    airline: airlineLocal,
    flight: document.getElementById('flight').value.trim() || 'G9 221',
    gate: document.getElementById('gate').value.trim() || '12',
    origin: resolveAirport(rawOrigin, langKey),
    destination: resolveAirport(rawDest, langKey),
    delayAmount: document.getElementById('delayAmount')?.value.trim() || '30 minutes',
    delayReason: document.getElementById('delayReason')?.value.trim() || '',
    etd: document.getElementById('etd')?.value.trim() || ''
  };
}

const templates = {
  en: {
    goToGate: (d) => `Ladies and Gentlemen, ${getGreeting()}. Passengers travelling on ${d.airline} flight ${d.flight} from ${d.origin} to ${d.destination} are kindly requested to proceed to gate ${d.gate} at this time. Boarding will commence shortly. Thank you.`,
    boardRow1: (d) => {
      const rows = getRows();
      return `Ladies and Gentlemen, ${getGreeting()}. ${d.airline} welcomes you on board on a Non-Stop Flight service from ${d.origin} to ${d.destination}. To allow a smooth boarding process, we now welcome passengers seated from row ${rows.from} to row ${rows.to} to board at this time. Remaining passengers kindly be seated and await for the announcement.`;
    },
    boardRow2: () => `Ladies and Gentlemen. We now welcome the remaining passengers to board the aircraft. We wish you a pleasant flight.`,
    boardZoneC: (d) => `Ladies and Gentlemen, ${getGreeting()}. ${d.airline} welcomes you on board on a Non-Stop Flight service from ${d.origin} to ${d.destination}. To allow a smooth boarding process, we now welcome passengers seated in Zone C. Remaining passengers kindly be seated and await for the announcement.`,
    boardZoneB: () => `Thank you for waiting. We now welcome all passengers seated in Zone B.`,
    boardZoneRemain: () => `We now welcome the remaining passengers to board the aircraft. We wish you a pleasant flight.`,
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
    goToGate: (d) => `سيداتي سادتي. ${getGreeting()}. يرجى من الركاب المسافرين على رحلة ${d.airline} رقم ${d.flight}. من ${d.origin} إلى ${d.destination}. التوجه الآن إلى البوابة رقم ${d.gate}. سيبدأ الصعود إلى الطائرة قريباً. شكراً لكم.`,
    boardRow1: (d) => {
      const rows = getRows();
      return `سيداتي سادتي. ${getGreeting()}. ترحب بكم ${d.airline} على متن رحلتها المباشرة. من ${d.origin} إلى ${d.destination}. لتسهيل عملية الصعود. ندعو الآن الركاب الجالسين من الصف ${rows.from} إلى الصف ${rows.to}. للصعود في هذا الوقت. يرجى من بقية الركاب البقاء في أماكنهم. وانتظار الإعلان التالي.`;
    },
    boardRow2: () => `سيداتي سادتي. ندعو الآن بقية الركاب للصعود إلى الطائرة. نتمنى لكم رحلة طيبة.`,
    boardZoneC: (d) => `سيداتي سادتي. ${getGreeting()}. ترحب بكم ${d.airline} على متن رحلتها المباشرة. من ${d.origin} إلى ${d.destination}. لتسهيل عملية الصعود. ندعو الآن الركاب في المنطقة سي. يرجى من بقية الركاب البقاء في أماكنهم. وانتظار الإعلان التالي.`,
    boardZoneB: () => `شكراً لانتظاركم. ندعو الآن جميع الركاب في المنطقة بي. للصعود إلى الطائرة.`,
    boardZoneRemain: () => `ندعو الآن بقية الركاب للصعود إلى الطائرة. نتمنى لكم رحلة طيبة.`,
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
    goToGate: (d) => `خواتین و حضرات، ${getGreeting()}. مسافروں سے درخواست ہے جو ${d.airline} فلائٹ نمبر ${d.flight} پر ${d.origin} سے ${d.destination} جا رہے ہیں، براہ کرم ابھی گیٹ نمبر ${d.gate} پر تشریف لائیں۔ بورڈنگ جلد شروع ہو گی۔ شکریہ۔`,
    boardRow1: (d) => {
      const rows = getRows();
      return `خواتین و حضرات، ${getGreeting()}. ${d.airline} آپ کا خیرمقدم کرتی ہے اپنی براہ راست پرواز پر جو ${d.origin} سے ${d.destination} جا رہی ہے۔ ہموار بورڈنگ کے لیے اب ہم صف ${rows.from} سے صف ${rows.to} تک بیٹھے مسافروں کو بورڈ ہونے کی دعوت دیتے ہیں۔ باقی مسافر براہ کرم اپنی سیٹوں پر بیٹھے رہیں اور اگلے اعلان کا انتظار کریں۔`;
    },
    boardRow2: () => `خواتین و حضرات۔ اب ہم باقی مسافروں کو طیارے پر بورڈ ہونے کی دعوت دیتے ہیں۔ ہم آپ کے لیے خوشگوار پرواز کی خواہش کرتے ہیں۔`,
    boardZoneC: (d) => `خواتین و حضرات، ${getGreeting()}. ${d.airline} آپ کا خیرمقدم کرتی ہے اپنی براہ راست پرواز پر جو ${d.origin} سے ${d.destination} جا رہی ہے۔ ہموار بورڈنگ کے لیے اب ہم زون C میں بیٹھے مسافروں کو بورڈ ہونے کی دعوت دیتے ہیں۔ باقی مسافر براہ کرم اپنی سیٹوں پر بیٹھے رہیں اور اگلے اعلان کا انتظار کریں۔`,
    boardZoneB: () => `انتظار کرنے کا شکریہ۔ اب ہم زون B میں بیٹھے تمام مسافروں کو بورڈ ہونے کی دعوت دیتے ہیں۔`,
    boardZoneRemain: () => `اب ہم باقی مسافروں کو طیارے پر بورڈ ہونے کی دعوت دیتے ہیں۔ ہم آپ کے لیے خوشگوار پرواز کی خواہش کرتے ہیں۔`,
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

function buildScript(type, title = null, name = null) {
  const langKey = getLangKey();
  const data = getFlightData();
  const pack = templates[langKey] || templates.en;
  if (type === 'page' && name) return pack.page(data, title || 'Mr.', name);
  if (pack[type]) return pack[type](data);
  return '';
}

function setStatus(msg, type = '') {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'statusbox' + (type ? ' ' + type : '');
}

function addHistory(text) {
  const hist = document.getElementById('history');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const div = document.createElement('div');
  div.textContent = `[${time}] ${text.slice(0, 120)}${text.length > 120 ? '…' : ''}`;
  hist.prepend(div);
}

function stopSpeaking() {
  playToken++; // invalidate any in-flight playback sequence
  releaseWakeLock();
  if (currentAudio) {
    try {
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.pause();
      currentAudio.currentTime = 0;
      if (currentAudio.src && currentAudio.src.startsWith('blob:')) {
        URL.revokeObjectURL(currentAudio.src);
      }
    } catch (e) {}
    currentAudio = null;
  }
  isSpeaking = false;
  setStatus('STOPPED • Ready');
  document.getElementById('connection').textContent = '● ONLINE';
  document.getElementById('connection').style.color = 'var(--green)';
}


function getFlightDataForLang(langKey) {
  const rawOrigin = document.getElementById('origin').value.trim() || 'DMM';
  const rawDest = document.getElementById('destination').value.trim() || 'SHJ';
  const airlineEn = document.getElementById('airline').value;
  const airlineLocal = (AIRLINE_NAMES[airlineEn] && AIRLINE_NAMES[airlineEn][langKey]) || airlineEn;
  return {
    airline: airlineLocal,
    flight: document.getElementById('flight').value.trim() || 'G9 221',
    gate: document.getElementById('gate').value.trim() || '12',
    origin: resolveAirport(rawOrigin, langKey),
    destination: resolveAirport(rawDest, langKey),
    delayAmount: document.getElementById('delayAmount')?.value.trim() || '30 minutes',
    delayReason: document.getElementById('delayReason')?.value.trim() || '',
    etd: document.getElementById('etd')?.value.trim() || ''
  };
}

function getGreetingForLang(langKey) {
  const tod = document.getElementById('timeOfDay').value;
  if (langKey === 'ar') return tod === 'Morning' ? 'صباح الخير' : 'مساء الخير';
  if (langKey === 'ur') return tod === 'Morning' ? 'صبح بخیر' : 'آداب';
  return `Good ${tod}`;
}

function buildScriptForLang(type, langKey, title = null, name = null) {
  // Temporarily override helpers used inside templates
  const origGetLang = getLangKey;
  const origGetGreeting = getGreeting;
  const origGetFlight = getFlightData;

  // Monkey-patch for this call only
  window.__forceLang = langKey;
  const pack = templates[langKey] || templates.en;
  const data = getFlightDataForLang(langKey);

  // Build using pack with local greeting
  const greeting = getGreetingForLang(langKey);
  // Most templates call getGreeting() and getFlightData() internally via closures.
  // Safer: rebuild by calling pack functions after temporarily swapping globals.

  // Simple approach: call pack functions with data, but boardRow etc call getGreeting internally.
  // So we temporarily redefine getGreeting / getFlightData / getLangKey.
  const saved = { getGreeting, getFlightData, getLangKey };
  getGreeting = () => getGreetingForLang(langKey);
  getFlightData = () => getFlightDataForLang(langKey);
  getLangKey = () => langKey;

  let script = '';
  try {
    if (type === 'page' && name) script = pack.page(data, title || 'Mr.', name);
    else if (pack[type]) script = pack[type](data);
  } finally {
    getGreeting = saved.getGreeting;
    getFlightData = saved.getFlightData;
    getLangKey = saved.getLangKey;
  }
  return script;
}

async function fetchTTS(text, voice, rateStr) {
  const maxRetries = 5;
  let lastError = 'TTS failed';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) await new Promise(r => setTimeout(r, 700 * attempt));

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, rate: rateStr })
      });

      if (res.status === 404) {
        lastError = 'API not found – check Vercel deployment';
        continue;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        lastError = err.error || ('HTTP ' + res.status);
        continue;
      }

      const blob = await res.blob();
      if (!blob || blob.size < 500) {
        lastError = 'Empty audio';
        continue;
      }
      return blob;
    } catch (e) {
      lastError = e.message || 'Network error';
    }
  }
  throw new Error(lastError);
}

async function ensureAudioCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!window.__paCtx) window.__paCtx = new Ctx();
  const ctx = window.__paCtx;
  if (ctx.state === 'suspended') {
    try { await withTimeout(ctx.resume(), 1000); } catch (e) {}
  }
  return ctx;
}

function playBlob(blob, rateVal, token) {
  return new Promise(async (resolve, reject) => {
    if (token !== playToken) {
      resolve();
      return;
    }

    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(safety);
      try {
        if (currentAudio) {
          if (currentAudio.stop) currentAudio.stop();
          if (currentAudio.pause) currentAudio.pause();
        }
      } catch (e) {}
      currentAudio = null;
      if (err) reject(err);
      else resolve();
    };

    const safety = setTimeout(() => finish(), 180000);

    try {
      const ctx = await ensureAudioCtx();
      const arrayBuf = await blob.arrayBuffer();

      // Preferred path: Web Audio API (reliable volume on mobile)
      if (ctx && ctx.decodeAudioData) {
        let audioBuf;
        try {
          audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0));
        } catch (decodeErr) {
          // fallback to HTMLAudio below
          audioBuf = null;
        }

        if (audioBuf) {
          if (token !== playToken) return finish();
          const source = ctx.createBufferSource();
          const gain = ctx.createGain();
          source.buffer = audioBuf;
          try { source.playbackRate.value = rateVal || 1; } catch (e) {}
          gain.gain.value = 1.0;
          source.connect(gain);
          gain.connect(ctx.destination);
          currentAudio = {
            stop: () => { try { source.stop(0); } catch (e) {} },
            pause: () => { try { source.stop(0); } catch (e) {} },
            src: null
          };
          source.onended = () => finish();
          source.start(0);
          return;
        }
      }

      // Fallback: HTMLAudioElement
      const url = URL.createObjectURL(blob);
      const audio = new Audio();
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.muted = false;
      audio.volume = 1.0;
      audio.preload = 'auto';
      audio.src = url;
      currentAudio = audio;

      audio.onended = () => {
        try { URL.revokeObjectURL(url); } catch (e) {}
        finish();
      };
      audio.onerror = () => {
        try { URL.revokeObjectURL(url); } catch (e) {}
        finish(new Error('Playback error'));
      };

      try { audio.playbackRate = rateVal || 1; } catch (e) {}
      audio.load();
      const p = audio.play();
      if (p && p.catch) {
        p.catch(async () => {
          try {
            await ensureAudioCtx();
            audio.muted = false;
            audio.volume = 1.0;
            await audio.play();
          } catch (e2) {
            finish(new Error('No sound – check phone volume / silent switch'));
          }
        });
      }
    } catch (err) {
      finish(err);
    }
  });
}

async function speak(text, isBroadcast = false) {
  const activeBtn = document.querySelector('.buttons button.active');
  const type = activeBtn ? activeBtn.dataset.type : null;
  const isPage = document.body.dataset.pageMode === '1';
  delete document.body.dataset.pageMode;

  if (!type && !isPage && !(text && text.trim())) {
    setStatus('Select a template first', 'error');
    return;
  }

  stopSpeaking();
  const token = playToken;
  isSpeaking = true;

  // Unlock audio during user tap (must not hang)
  setStatus('Starting…', 'live');
  try {
    await withTimeout(unlockAudio(), 1000);
    await ensureAudioCtx();
  } catch (e) {}
  // Keep screen on during the full EN → UAE → UR sequence
  await requestWakeLock();
  if (token !== playToken) return;

  const useChime = document.getElementById('chime').checked;
  if (useChime) {
    setStatus('CHIME…', 'live');
    await playChime();
    if (token !== playToken) return;
  }

  const rateVal = parseFloat(document.getElementById('rate').value) || 0.90;
  const ratePercent = Math.round((rateVal - 1) * 100);
  const rateStr = (ratePercent >= 0 ? '+' : '') + ratePercent + '%';

  const airlineEn = document.getElementById('airline').value;
  const isFlyJinnah = airlineEn === 'Fly Jinnah';
  const includeUrduEl = document.getElementById('includeUrdu');
  const includeUrdu = includeUrduEl ? includeUrduEl.checked : isFlyJinnah;

  // Auto: Fly Jinnah → EN+AR+UR | Others → EN+AR (Urdu only if checkbox on)
  const sequence = [
    { lang: 'en', label: 'English', voice: MALE_VOICES.en },
    { lang: 'ar', label: 'UAE Arabic', voice: MALE_VOICES.ar },
  ];
  if (isFlyJinnah || includeUrdu) {
    sequence.push({ lang: 'ur', label: 'Urdu', voice: MALE_VOICES.ur });
  }

  const title = document.getElementById('title')?.value || 'Mr.';
  const passengerName = document.getElementById('custom')?.value.trim() || '';

  try {
    // Pre-build all scripts
    const jobs = [];
    for (const step of sequence) {
      let script = '';
      if (type === 'page' || isPage) {
        if (!passengerName) {
          setStatus('Enter passenger name first', 'error');
          isSpeaking = false;
          await releaseWakeLock();
          return;
        }
        script = buildScriptForLang('page', step.lang, title, passengerName);
      } else if (type) {
        script = buildScriptForLang(type, step.lang);
      } else {
        script = text;
      }
      if (script && script.trim()) {
        jobs.push({ ...step, script });
      }
    }

    // Pre-fetch ALL audio first (better on mobile – one play session)
    const prepared = [];
    for (let i = 0; i < jobs.length; i++) {
      if (token !== playToken) return;
      const job = jobs[i];
      setStatus(`Generating ${job.label} (${i + 1}/${jobs.length})…`, 'live');
      document.getElementById('connection').textContent = '● GENERATING';
      document.getElementById('connection').style.color = '#00c2ff';
      document.getElementById('preview').value = job.script;

      const blob = await fetchTTS(job.script, job.voice, rateStr);
      if (token !== playToken) return;
      prepared.push({ ...job, blob });
    }

    // Play all sequentially
    for (let i = 0; i < prepared.length; i++) {
      if (token !== playToken) return;
      const job = prepared[i];
      setStatus(`${isBroadcast ? '● ON AIR' : '▶'} ${job.label} (${i + 1}/${prepared.length})…`, 'live');
      document.getElementById('connection').textContent = isBroadcast ? '● ON AIR' : '● PLAYING';
      document.getElementById('connection').style.color = isBroadcast ? '#ff3b4a' : '#00c2ff';
      document.getElementById('preview').value = job.script;

      await playBlob(job.blob, rateVal, token);
      if (token !== playToken) return;

      if (i < prepared.length - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    if (token === playToken) {
      isSpeaking = false;
      await releaseWakeLock();
      setStatus(isBroadcast ? 'BROADCAST COMPLETE (EN+UAE+UR) • Ready' : 'PREVIEW COMPLETE (EN+UAE+UR) • Ready');
      document.getElementById('connection').textContent = '● ONLINE';
      document.getElementById('connection').style.color = 'var(--green)';
    }
  } catch (err) {
    if (token !== playToken) return;
    console.error(err);
    isSpeaking = false;
    await releaseWakeLock();
    setStatus(err.message || 'Voice generation failed', 'error');
    document.getElementById('connection').textContent = '● ONLINE';
    document.getElementById('connection').style.color = 'var(--green)';
  }
}

// Events
document.querySelectorAll('.buttons button').forEach(btn => {
  btn.setAttribute('aria-pressed', 'false');
  btn.addEventListener('click', () => {
    document.querySelectorAll('.buttons button').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const type = btn.dataset.type;
    document.getElementById('delayCard').style.display = (type === 'delayTentative' || type === 'delayFull') ? 'block' : 'none';
    document.getElementById('preview').value = buildScript(type);
    setStatus(`Template loaded: ${btn.textContent}`);
  });
});

document.getElementById('previewBtn').addEventListener('click', () => {
  const text = document.getElementById('preview').value.trim();
  if (!text) { setStatus('Select a template first', 'error'); return; }
  speak(text, false);
});

document.getElementById('playBtn').addEventListener('click', () => {
  const text = document.getElementById('preview').value.trim();
  if (!text) { setStatus('Select a template first', 'error'); return; }
  speak(text, true);
  addHistory(text);
});

document.getElementById('stopBtn').addEventListener('click', stopSpeaking);

document.getElementById('customBtn').addEventListener('click', () => {
  const name = document.getElementById('custom').value.trim();
  const title = document.getElementById('title').value;
  if (!name) { setStatus('Enter passenger name first', 'error'); return; }
  // Mark as page: clear templates and set a virtual active type via dataset on body
  document.querySelectorAll('.buttons button').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  // Build English preview for display
  const script = buildScriptForLang('page', 'en', title, name);
  document.getElementById('preview').value = script;
  // Force page mode for speak()
  document.body.dataset.pageMode = '1';
  speak(script, true);
  addHistory(`PAGE: ${title} ${name}`);
});

document.getElementById('clear').addEventListener('click', () => {
  document.getElementById('history').innerHTML = '';
});

document.getElementById('language').addEventListener('change', () => {
  // Language selector only affects the text preview. Playback always does EN→AR→UR.
  const active = document.querySelector('.buttons button.active');
  if (active) document.getElementById('preview').value = buildScript(active.dataset.type);
  const lang = document.getElementById('language').value;
  const preview = document.getElementById('preview');
  preview.dir = lang.startsWith('ar') || lang.startsWith('ur') ? 'rtl' : 'ltr';
  preview.lang = lang;
});

['origin', 'destination', 'aircraft', 'timeOfDay', 'airline'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', () => {
      const active = document.querySelector('.buttons button.active');
      if (active) document.getElementById('preview').value = buildScript(active.dataset.type);
    });
    if (el.tagName === 'INPUT') el.addEventListener('input', () => {
      const active = document.querySelector('.buttons button.active');
      if (active) document.getElementById('preview').value = buildScript(active.dataset.type);
    });
  }
});

['delayAmount', 'delayReason', 'etd'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    const active = document.querySelector('.buttons button.active');
    if (active && (active.dataset.type === 'delayTentative' || active.dataset.type === 'delayFull')) {
      document.getElementById('preview').value = buildScript(active.dataset.type);
    }
  });
});


document.getElementById('airline').addEventListener('change', () => {
  const ur = document.getElementById('includeUrdu');
  if (ur) {
    ur.checked = document.getElementById('airline').value === 'Fly Jinnah';
  }
  const active = document.querySelector('.buttons button.active');
  if (active) document.getElementById('preview').value = buildScript(active.dataset.type);
});

document.getElementById('rate').addEventListener('input', (e) => {
  document.getElementById('rateVal').textContent = parseFloat(e.target.value).toFixed(2);
});


// Init Urdu checkbox from airline
(function initUrduToggle() {
  const ur = document.getElementById('includeUrdu');
  const al = document.getElementById('airline');
  if (ur && al) ur.checked = al.value === 'Fly Jinnah';
})();

setStatus('READY • HD Male · EN + UAE Arabic · Urdu auto on Fly Jinnah');
