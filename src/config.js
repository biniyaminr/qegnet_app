// ─────────────────────────────────────────────────────────────
// CATALOG — instrument and level metadata (bilingual labels,
// tunings, synth tone). Content lives in /src/lessons/*.json.
// ─────────────────────────────────────────────────────────────

export const INSTRUMENTS = {
  keyboard: {
    ic: '🎹', am: 'ኪቦርድ / ፒያኖ', en: 'Keyboard', tone: 'keys', strings: '',
    desc: { am: 'ኖታዎቹ በአንድ ቀጥተኛ መስመር — ቅኝቱን ለማየት ግልፅ ቦታ።', en: 'Notes in a straight line — the clearest place to see a kiñit.' },
  },
  bass: {
    ic: '🎸', am: 'ባስ ጊታር', en: 'Bass Guitar', tone: 'bass', strings: 'E · A · D · G',
    desc: { am: 'ከግሩቭ ስር ያለው ጥልቅ ምት።', en: 'The deep pulse under the groove.' },
  },
  acoustic: {
    ic: '🪕', am: 'የሳጥን ጊታር', en: 'Acoustic “box” Guitar', tone: 'acoustic', strings: 'E · A · D · G · B · E',
    desc: { am: 'ቅኝቱን መምታትና በጣት መንካት።', en: 'Strumming and fingerpicking the kiñit.' },
  },
  lead: {
    ic: '🎶', am: 'መሪ ጊታር', en: 'Lead Guitar', tone: 'lead', strings: 'E · A · D · G · B · E',
    desc: { am: 'ዜማ፣ ሶሎ፣ የክራርና ማሲንቆ ስልት።', en: 'Melody, solos, krar & masinko-style phrasing.' },
  },
};

export const INSTRUMENT_ORDER = ['keyboard', 'bass', 'acoustic', 'lead'];

export const LEVELS = {
  beginner:     { step: 'Level 1', am: 'ጀማሪ',    en: 'Beginner',
    desc: { am: 'ምንም እውቀት አያስፈልግም። ኖታ ምንድን ነው፣ ሰባቱ ስሞች፣ የመጀመሪያ ቅኝትህ።', en: 'Zero knowledge assumed. What a note is, the seven names, and your first kiñit.' } },
  intermediate: { step: 'Level 2', am: 'መካከለኛ', en: 'Intermediate',
    desc: { am: 'አራቱም ቅኝቶች፣ 6/8 እና 12/8 ግሩቭ፣ አጫጭር ባህላዊ ዜማዎች።', en: 'All four kiñit, 6/8 & 12/8 grooves, and short traditional-style melodies.' } },
  expert:       { step: 'Level 3', am: 'ባለሙያ',   en: 'Expert',
    desc: { am: 'ወደ ማንኛውም ኖታ አዛውር፣ በአዝማሪ ስልት ኢምፕሮቫይዝ አድርግ፣ ኢትዮ-ጃዝ ንካ።', en: 'Transpose anywhere, improvise azmari-style, and touch ethio-jazz color.' } },
};

export const LEVEL_ORDER = ['beginner', 'intermediate', 'expert'];
