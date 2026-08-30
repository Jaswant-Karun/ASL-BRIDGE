/**
 * Multilingual Translation & Natural Language Processing Service
 * Supports Tamil (தமிழ்), English, and Hindi (हिन्दी) translation to ASL Gloss.
 */

// ─── LANGUAGE DETECTION ──────────────────────────────────────────────────────
export function detectLanguage(text = '') {
  const clean = text.trim();
  if (/[\u0B80-\u0BFF]/.test(clean)) return 'ta'; // Tamil script
  if (/[\u0900-\u097F]/.test(clean)) return 'hi'; // Devanagari / Hindi script
  return 'en'; // English / Latin
}

// ─── TAMIL DICTIONARY & CONCEPT MAP ──────────────────────────────────────────
export const TAMIL_MAP = {
  // Pronouns & People
  'நான்': 'ME',
  'என்னை': 'ME',
  'எனக்கு': 'ME',
  'என்': 'MY',
  'என்னுடைய': 'MY',
  'நீ': 'YOU',
  'நீங்கள்': 'YOU',
  'உன்னை': 'YOU',
  'உங்களுக்கு': 'YOU',
  'உன்': 'YOUR',
  'உங்களுடைய': 'YOUR',
  'அவன்': 'HE',
  'அவள்': 'SHE',
  'அவர்': 'HE',
  'அது': 'IT',
  'நாங்கள்': 'WE',
  'நாம்': 'WE',
  'எங்கள்': 'WE',
  'அவர்கள்': 'THEY',
  'அவை': 'THEY',
  'அம்மா': 'MOTHER',
  'தாய்': 'MOTHER',
  'அப்பா': 'FATHER',
  'தந்தை': 'FATHER',
  'அண்ணன்': 'BROTHER',
  'தம்பி': 'BROTHER',
  'சகோதரன்': 'BROTHER',
  'அக்கா': 'SISTER',
  'தங்கை': 'SISTER',
  'சகோதரி': 'SISTER',
  'நண்பன்': 'FRIEND',
  'தோழன்': 'FRIEND',
  'தோழி': 'FRIEND',
  'குடும்பம்': 'FAMILY',
  'ஆசிரியர்': 'TEACHER',
  'மாணவர்': 'STUDENT',
  'மாணவி': 'STUDENT',

  // Time & Days
  'நாளை': 'TOMORROW',
  'நேற்று': 'YESTERDAY',
  'இன்று': 'TODAY',
  'இப்போது': 'NOW',
  'இப்பொழுது': 'NOW',
  'காலை': 'MORNING',
  'மதியம்': 'AFTERNOON',
  'மாலை': 'EVENING',
  'இரவு': 'NIGHT',
  'விரைவில்': 'SOON',
  'முன்பு': 'BEFORE',
  'பின்பு': 'LATER',
  'பிறகு': 'LATER',
  'எப்போதும்': 'ALWAYS',
  'ஒருபோதும்': 'NEVER',
  'திங்கள்': 'MONDAY',
  'செவ்வாய்': 'TUESDAY',
  'புதன்': 'WEDNESDAY',
  'வியாழன்': 'THURSDAY',
  'வெள்ளி': 'FRIDAY',
  'சனி': 'SATURDAY',
  'ஞாயிறு': 'SUNDAY',

  // Actions & Verbs
  'போகிறேன்': 'GO',
  'போகிறார்': 'GO',
  'போகிறோம்': 'GO',
  'செல்': 'GO',
  'செல்கிறேன்': 'GO',
  'போ': 'GO',
  'வருகிறேன்': 'COME',
  'வருகிறார்': 'COME',
  'வா': 'COME',
  'சாப்பிடு': 'EAT',
  'சாப்பிடுகிறேன்': 'EAT',
  'உண்': 'EAT',
  'குடி': 'DRINK',
  'குடிக்கிறேன்': 'DRINK',
  'படி': 'LEARN',
  'படிக்கிறேன்': 'LEARN',
  'கற்றுக்கொள்': 'LEARN',
  'உதவி': 'HELP',
  'உதவு': 'HELP',
  'உதவுகிறேன்': 'HELP',
  'பார்': 'SEE',
  'பார்க்கிறேன்': 'SEE',
  'காண்': 'SEE',
  'பேசு': 'SPEAK',
  'பேசுகிறேன்': 'SPEAK',
  'புரிந்தது': 'UNDERSTAND',
  'புரிகிறது': 'UNDERSTAND',
  'தெரியும்': 'KNOW',
  'விரும்பு': 'LIKE',
  'பிடிக்கும்': 'LIKE',
  'நினைக்கிறேன்': 'THINK',
  'தூங்கு': 'SLEEP',
  'வேலை': 'WORK',
  'பணி': 'WORK',
  'விளையாடு': 'PLAY',
  'எழுது': 'WRITE',

  // Places & Objects
  'கல்லூரி': 'COLLEGE',
  'பள்ளி': 'SCHOOL',
  'பள்ளிக்கூடம்': 'SCHOOL',
  'வீடு': 'HOUSE',
  'மருத்துவமனை': 'HOSPITAL',
  'தண்ணீர்': 'WATER',
  'நீர்': 'WATER',
  'உணவு': 'FOOD',
  'சாப்பாடு': 'FOOD',
  'பெயர்': 'NAME',
  'புத்தகம்': 'BOOK',
  'மருந்து': 'MEDICINE',
  'பணம்': 'MONEY',
  'நேரம்': 'TIME',
  'கார்': 'CAR',
  'வாகனம்': 'CAR',

  // Polite & Conversational
  'வணக்கம்': 'HELLO',
  'நமஸ்காரம்': 'HELLO',
  'நன்றி': 'THANK-YOU',
  'வரவேற்கிறோம்': 'WELCOME',
  'நல்வரவு': 'WELCOME',
  'மன்னிக்கவும்': 'SORRY',
  'தயவுசெய்து': 'PLEASE',
  'ஆம்': 'YES',
  'சரி': 'YES',
  'இல்லை': 'NO',
  'நல்வாழ்த்துக்கள்': 'CONGRATULATIONS',
  'அன்பு': 'LOVE',
  'காதல்': 'LOVE',
  'மகிழ்ச்சி': 'HAPPY',
  'மகிழ்ச்சியாக': 'HAPPY',
  'அமைதி': 'PEACE',
  'முக்கியம்': 'IMPORTANT',

  // Questions
  'என்ன': 'WHAT',
  'எப்படி': 'HOW',
  'எங்கே': 'WHERE',
  'எங்கு': 'WHERE',
  'ஏன்': 'WHY',
  'எப்போது': 'WHEN',
  'எப்பொழுது': 'WHEN',
  'யார்': 'WHO',
  'எவ்வளவு': 'HOW-MUCH',
  'எத்தனை': 'HOW-MUCH'
};

// ─── HINDI DICTIONARY & CONCEPT MAP ──────────────────────────────────────────
export const HINDI_MAP = {
  // Pronouns & People
  'मैं': 'ME',
  'मुझे': 'ME',
  'मुझको': 'ME',
  'मेरा': 'MY',
  'मेरी': 'MY',
  'मेरे': 'MY',
  'आप': 'YOU',
  'तुम': 'YOU',
  'तुम्हें': 'YOU',
  'तुझको': 'YOU',
  'तुम्हारा': 'YOUR',
  'तुम्हारी': 'YOUR',
  'आपका': 'YOUR',
  'आपकी': 'YOUR',
  'आपके': 'YOUR',
  'वह': 'HE',
  'उसने': 'HE',
  'उसे': 'HE',
  'उसका': 'HIS',
  'उसकी': 'HER',
  'हम': 'WE',
  'हमें': 'WE',
  'हमारा': 'WE',
  'हमारी': 'WE',
  'वे': 'THEY',
  'उन्होंने': 'THEY',
  'उन्हें': 'THEY',
  'उनका': 'THEIR',
  'माँ': 'MOTHER',
  'माता': 'MOTHER',
  'माताजी': 'MOTHER',
  'अम्मी': 'MOTHER',
  'पिता': 'FATHER',
  'पापा': 'FATHER',
  'पिताजी': 'FATHER',
  'अब्बू': 'FATHER',
  'भाई': 'BROTHER',
  'भैया': 'BROTHER',
  'बहन': 'SISTER',
  'दीदी': 'SISTER',
  'दोस्त': 'FRIEND',
  'मित्र': 'FRIEND',
  'सखा': 'FRIEND',
  'सहेली': 'FRIEND',
  'परिवार': 'FAMILY',
  'शिक्षक': 'TEACHER',
  'अध्यापक': 'TEACHER',
  'गुरु': 'TEACHER',
  'छात्र': 'STUDENT',
  'विद्यार्थी': 'STUDENT',

  // Time & Days
  'कल': 'TOMORROW',
  'आज': 'TODAY',
  'अब': 'NOW',
  'अभी': 'NOW',
  'सुबह': 'MORNING',
  'दोपहर': 'AFTERNOON',
  'शाम': 'EVENING',
  'रात': 'NIGHT',
  'जल्दी': 'SOON',
  'शीघ्र': 'SOON',
  'पहले': 'BEFORE',
  'बाद': 'LATER',
  'हमेशा': 'ALWAYS',
  'सदा': 'ALWAYS',
  'कभी': 'SOMETIMES',
  'सोमवार': 'MONDAY',
  'मंगलवार': 'TUESDAY',
  'बुधवार': 'WEDNESDAY',
  'गुरुवार': 'THURSDAY',
  'बृहस्पतिवार': 'THURSDAY',
  'शुक्रवार': 'FRIDAY',
  'शनिवार': 'SATURDAY',
  'रविवार': 'SUNDAY',

  // Actions & Verbs
  'जाना': 'GO',
  'जा': 'GO',
  'जाता': 'GO',
  'जाती': 'GO',
  'जाते': 'GO',
  'जाऊंगा': 'GO',
  'जाऊंगी': 'GO',
  'जाओ': 'GO',
  'जाएं': 'GO',
  'आना': 'COME',
  'आ': 'COME',
  'आता': 'COME',
  'आती': 'COME',
  'आते': 'COME',
  'आऊंगा': 'COME',
  'आओ': 'COME',
  'आइए': 'COME',
  'खाना': 'EAT',
  'खा': 'EAT',
  'खाता': 'EAT',
  'खाओ': 'EAT',
  'पीना': 'DRINK',
  'पी': 'DRINK',
  'पीओ': 'DRINK',
  'सीखना': 'LEARN',
  'सीखो': 'LEARN',
  'पढ़ना': 'LEARN',
  'पढ़': 'LEARN',
  'मदद': 'HELP',
  'सहायता': 'HELP',
  'देखना': 'SEE',
  'देख': 'SEE',
  'देखो': 'SEE',
  'बोलना': 'SPEAK',
  'बात': 'SPEAK',
  'समझना': 'UNDERSTAND',
  'समझ': 'UNDERSTAND',
  'जानना': 'KNOW',
  'पता': 'KNOW',
  'पसंद': 'LIKE',
  'चाहता': 'WANT',
  'चाहती': 'WANT',
  'सोचना': 'THINK',
  'सोना': 'SLEEP',
  'काम': 'WORK',
  'खेलना': 'PLAY',
  'लिखना': 'WRITE',

  // Places & Objects
  'कॉलेज': 'COLLEGE',
  'महाविद्यालय': 'COLLEGE',
  'स्कूल': 'SCHOOL',
  'विद्यालय': 'SCHOOL',
  'घर': 'HOUSE',
  'मकान': 'HOUSE',
  'अस्पताल': 'HOSPITAL',
  'चिकित्सालय': 'HOSPITAL',
  'पानी': 'WATER',
  'जल': 'WATER',
  'भोजन': 'FOOD',
  'नाम': 'NAME',
  'किताब': 'BOOK',
  'पुस्तक': 'BOOK',
  'दवा': 'MEDICINE',
  'औषधि': 'MEDICINE',
  'पैसा': 'MONEY',
  'रुपया': 'MONEY',
  'धन': 'MONEY',
  'समय': 'TIME',
  'वक्त': 'TIME',
  'गाड़ी': 'CAR',
  'कार': 'CAR',

  // Polite & Conversational
  'नमस्ते': 'HELLO',
  'नमस्कार': 'HELLO',
  'प्रणाम': 'HELLO',
  'आदाब': 'HELLO',
  'धन्यवाद': 'THANK-YOU',
  'शुक्रिया': 'THANK-YOU',
  'आभार': 'THANK-YOU',
  'स्वागत': 'WELCOME',
  'अभिनंदन': 'WELCOME',
  'माफ़': 'SORRY',
  'क्षमा': 'SORRY',
  'कृपया': 'PLEASE',
  'हाँ': 'YES',
  'जी': 'YES',
  'ठीक': 'YES',
  'नहीं': 'NO',
  'ना': 'NO',
  'बधाई': 'CONGRATULATIONS',
  'मुबारक': 'CONGRATULATIONS',
  'प्यार': 'LOVE',
  'प्रेम': 'LOVE',
  'खुश': 'HAPPY',
  'प्रसन्न': 'HAPPY',
  'आनंद': 'HAPPY',
  'शांति': 'PEACE',
  'ज़रूरी': 'IMPORTANT',
  'महत्वपूर्ण': 'IMPORTANT',
  'अलविदा': 'GOODBYE',
  'बाय': 'GOODBYE',

  // Questions
  'क्या': 'WHAT',
  'कैसे': 'HOW',
  'कैसा': 'HOW',
  'कैसी': 'HOW',
  'कहाँ': 'WHERE',
  'किधर': 'WHERE',
  'क्यों': 'WHY',
  'कब': 'WHEN',
  'कौन': 'WHO',
  'कितना': 'HOW-MUCH',
  'कितने': 'HOW-MUCH',
  'कितनी': 'HOW-MUCH'
};

// ─── UNIVERSAL DYNAMIC TRANSLATION (ANY SENTENCE IN ANY LANGUAGE) ─────────────
export async function translateTextUniversally(text = '', fromLang = 'auto', toLang = 'en') {
  const clean = text.trim();
  if (!clean) return '';

  const sourceLang = fromLang === 'auto' ? detectLanguage(clean) : fromLang;

  // 1. Primary: MyMemory Free Translation API (Supports Tamil, Hindi, and 100+ languages)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${sourceLang}|${toLang}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && typeof translated === 'string' && !translated.startsWith('MYMEMORY WARNING:')) {
        return translated.trim();
      }
    }
  } catch (err) {
    console.warn(`MyMemory translation notice: ${err.message}`);
  }

  // 2. Secondary fallback: Google Translate endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedSentence = data[0].map((chunk) => chunk[0]).filter(Boolean).join('');
        if (translatedSentence && translatedSentence.trim()) {
          return translatedSentence.trim();
        }
      }
    }
  } catch (err) {
    console.warn(`Universal dynamic translation notice: ${err.message}`);
  }

  return '';
}

// ─── TRANSLATE ANY SENTENCE TO ASL GLOSS TOKENS (UNIVERSAL + OFFLINE FALLBACK) ──
export async function translateMultilingualToASL(rawText = '', forcedLang = null) {
  const text = rawText.trim();
  if (!text) return { lang: 'en', originalText: '', glossSequence: [], translatedEnglish: '' };

  const lang = forcedLang || detectLanguage(text);
  const langName = lang === 'ta' ? 'Tamil (தமிழ்)' : lang === 'hi' ? 'Hindi (हिन्दी)' : 'English';

  // 1. Try Live Universal Dynamic Translation for any open-ended sentence
  let dynamicEnglish = '';
  if (lang !== 'en') {
    dynamicEnglish = await translateTextUniversally(text, lang, 'en');
  }

  if (dynamicEnglish) {
    return {
      lang,
      langName,
      originalText: text,
      translatedEnglish: dynamicEnglish,
      glossSequence: [] // Will be parsed through translateEnglishToASL
    };
  }

  // 2. Offline / Local Dictionary Fallback
  if (lang === 'ta') {
    const words = text
      .replace(/[.,!?()[\]{}"'\\/]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    const glossTokens = [];
    const timeTokens = [];

    for (const w of words) {
      const cleanW = w.trim();
      const mapped = TAMIL_MAP[cleanW];
      if (mapped) {
        if (['TOMORROW', 'YESTERDAY', 'TODAY', 'NOW', 'MORNING', 'NIGHT', 'SOON'].includes(mapped)) {
          timeTokens.push(mapped);
        } else {
          glossTokens.push(mapped);
        }
      } else {
        glossTokens.push(cleanW.toUpperCase());
      }
    }

    const fullGloss = [...timeTokens, ...glossTokens];
    return {
      lang: 'ta',
      langName: 'Tamil (தமிழ்)',
      originalText: text,
      translatedEnglish: '',
      glossSequence: fullGloss.length > 0 ? fullGloss : ['HELLO']
    };
  }

  if (lang === 'hi') {
    const words = text
      .replace(/[.,!?()[\]{}"'\\/|।]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    const glossTokens = [];
    const timeTokens = [];

    for (const w of words) {
      const cleanW = w.trim();
      const mapped = HINDI_MAP[cleanW];
      if (mapped) {
        if (['TOMORROW', 'YESTERDAY', 'TODAY', 'NOW', 'MORNING', 'NIGHT', 'SOON'].includes(mapped)) {
          timeTokens.push(mapped);
        } else {
          glossTokens.push(mapped);
        }
      } else {
        glossTokens.push(cleanW.toUpperCase());
      }
    }

    const fullGloss = [...timeTokens, ...glossTokens];
    return {
      lang: 'hi',
      langName: 'Hindi (हिन्दी)',
      originalText: text,
      translatedEnglish: '',
      glossSequence: fullGloss.length > 0 ? fullGloss : ['HELLO']
    };
  }

  return { lang: 'en', langName: 'English', originalText: text, translatedEnglish: text, glossSequence: [] };
}
