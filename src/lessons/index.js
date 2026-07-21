// ─────────────────────────────────────────────────────────────
// CURRICULUM REGISTRY — every lesson is data. Adding content later
// means editing (or filling in) a JSON file; no code changes.
// ─────────────────────────────────────────────────────────────

import kbBeginner from './keyboard.beginner.json';
import kbIntermediate from './keyboard.intermediate.json';
import kbExpert from './keyboard.expert.json';
import bassBeginner from './bass.beginner.json';
import bassIntermediate from './bass.intermediate.json';
import bassExpert from './bass.expert.json';
import acBeginner from './acoustic.beginner.json';
import acIntermediate from './acoustic.intermediate.json';
import acExpert from './acoustic.expert.json';
import leadBeginner from './lead.beginner.json';
import leadIntermediate from './lead.intermediate.json';
import leadExpert from './lead.expert.json';

export const CURRICULUM = {
  keyboard: { beginner: kbBeginner, intermediate: kbIntermediate, expert: kbExpert },
  bass:     { beginner: bassBeginner, intermediate: bassIntermediate, expert: bassExpert },
  acoustic: { beginner: acBeginner, intermediate: acIntermediate, expert: acExpert },
  lead:     { beginner: leadBeginner, intermediate: leadIntermediate, expert: leadExpert },
};

const TRACK_COPY = {
  beginner: [
    ['ድምፅን ይወቁ','Meet your instrument','Explore the notes slowly. Listen for low and high sounds, then find a comfortable note.','note-identification'],
    ['ትዝታን ይጫወቱ','Play Tizita','Learn the five-note shape of Tizita. Let every note ring before moving to the next.','ear-note'],
    ['የመጀመሪያ ዜማ','Your first phrase','Echo this short original phrase, first by listening and then in time.','melody-echo']
  ],
  intermediate: [
    ['አራቱ ቅኝቶች','The four kiñit','Compare the distinctive color of Tizita, Bati, Ambassel and Anchihoye.','ear-scale'],
    ['የ6/8 ምት','The 6/8 pulse','Feel two large beats, each divided into three. Tap with the metronome.','rhythm-tap'],
    ['ቅኝትን በዜማ ይለዩ','Hear the scale in melody','Listen beyond individual notes and identify the musical color.','ear-scale']
  ],
  expert: [
    ['ቅኝትን ማዛወር','Transposition','Move one kiñit shape to a new root while keeping its interval color.','note-identification'],
    ['የአዝማሪ ሐረግ','Azmari-style phrasing','Practice call, response, space and a strong return to the root.','melody-echo'],
    ['የመጨረሻ ፈተና','Level performance','Combine ear, rhythm and scale knowledge in a final graded performance.','rhythm-tap']
  ]
};

Object.entries(CURRICULUM).forEach(([instrument, levels]) => Object.entries(levels).forEach(([level, pack]) => {
  if (pack.lessons.length) return;
  pack.lessons = TRACK_COPY[level].map(([am,en,body,exercise], n) => ({
    id: `${instrument}-${level}-${n+1}`, instrument, level,
    title: { am, en }, body: { am: `${am}። በቀስታ ያዳምጡ፣ ይመልከቱ እና ይድገሙ።`, en: body },
    widget: n === 2 ? 'melody' : 'scale', scale: ['tizita','bati','ambassel'][n],
    melody: [0,2,3,2,4,3,2,0], exercises: [{ type: exercise }],
    quiz: [
      { type: 'choice', prompt: { am: 'የዚህ ትምህርት ዋና ልምምድ?', en: 'What is the focus of this lesson?' }, choices: [en,'Play as fast as possible','Ignore the pulse','Skip listening'], answer: 0 },
      { type: 'choice', prompt: { am: 'ጥሩ ልምምድ ምንድን ነው?', en: 'Which is good practice?' }, choices: ['Listen, then repeat','Rush every note','Never use rhythm','Avoid the root'], answer: 0 },
      { type: 'choice', prompt: { am: 'ቅኝት ምንድን ነው?', en: 'What is a kiñit?' }, choices: ['A set of notes with a musical color','A guitar string','A volume setting','A microphone'], answer: 0 }
    ]
  }));
}));

export function getLessons(instrument, level) {
  const lessons = CURRICULUM[instrument]?.[level]?.lessons ?? [];
  return lessons.map((lesson) => lesson.quiz?.length ? lesson : ({ ...lesson, quiz: [
    { type:'choice', prompt:{am:'ኖታ ምንድን ነው?',en:'What is a note?'}, choices:['One musical sound','A tempo','An instrument','A lesson'], answer:0 },
    { type:'choice', prompt:{am:'ቅኝት ምንድን ነው?',en:'What is a kiñit?'}, choices:['A chosen set of notes','A speaker','A string','A beat only'], answer:0 },
    { type:'choice', prompt:{am:'ለመማር የሚረዳው?',en:'What helps learning?'}, choices:['Listen and repeat','Always rush','Skip practice','Mute every note'], answer:0 }
  ]}));
}

export function getLesson(instrument, level, index) {
  return getLessons(instrument, level)[index] ?? null;
}

export function lessonCount(instrument, level) {
  return getLessons(instrument, level).length;
}
