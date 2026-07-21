import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const instruments = ['keyboard', 'bass', 'acoustic', 'lead'];
const unlockedLevels = ['beginner'];
const ids = new Set();
const failures = [];

for (const instrument of instruments) {
  for (const level of unlockedLevels) {
    const file = resolve('src', 'lessons', `${instrument}.${level}.json`);
    let pack;
    try { pack = JSON.parse(await readFile(file, 'utf8')); }
    catch (error) { failures.push(`${file}: invalid JSON (${error.message})`); continue; }

    if (pack.instrument !== instrument || pack.level !== level) failures.push(`${file}: pack metadata does not match its filename`);
    if (!Array.isArray(pack.lessons) || pack.lessons.length === 0) {
      failures.push(`${file}: unlocked curriculum pack must contain at least one lesson`);
      continue;
    }

    pack.lessons.forEach((lesson, index) => {
      const at = `${file} lesson ${index + 1}`;
      if (!lesson.id) failures.push(`${at}: missing id`);
      else if (ids.has(lesson.id)) failures.push(`${at}: duplicate id ${lesson.id}`);
      else ids.add(lesson.id);
      if (!lesson.title?.am || !lesson.title?.en) failures.push(`${at}: missing bilingual title`);
      if (!lesson.body?.am || !lesson.body?.en) failures.push(`${at}: missing bilingual body`);
      if (!lesson.widget || !lesson.scale) failures.push(`${at}: missing widget or scale`);
      if (!Array.isArray(lesson.exercises)) failures.push(`${at}: exercises must be an array`);
      if (!Array.isArray(lesson.quiz) || lesson.quiz.length < 3) failures.push(`${at}: quiz must contain at least 3 questions`);
      lesson.quiz?.forEach((question, questionIndex) => {
        const choices = Array.isArray(question.choices) ? question.choices : [];
        if (!question.prompt?.am || !question.prompt?.en || choices.length < 2) {
          failures.push(`${at}, quiz ${questionIndex + 1}: invalid bilingual question`);
        }
        if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= choices.length) {
          failures.push(`${at}, quiz ${questionIndex + 1}: answer index is out of range`);
        }
      });
    });
  }
}

if (failures.length) {
  console.error(`Curriculum validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Curriculum valid: ${ids.size} unlocked lessons across ${instruments.length} instruments.`);
