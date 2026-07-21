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
