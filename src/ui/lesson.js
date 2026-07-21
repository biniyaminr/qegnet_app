// ─────────────────────────────────────────────────────────────
// LESSON RUNNER — renders a data-driven lesson: bilingual body,
// the dark instrument stage, the studio console (scale/root/play/
// metronome), and the five widget behaviours. All content comes
// from /src/lessons/*.json via app.state.
// ─────────────────────────────────────────────────────────────

import { SCALES, SCALE_ORDER, ROOTS, spellScale, scaleMidis, rootPc, noteName } from '../theory/scales.js';
import { INSTRUMENTS, LEVELS } from '../config.js';
import { getLessons } from '../lessons/index.js';
import { createKeyboard } from '../instruments/keyboard.js';
import { createFretboard } from '../instruments/fretboard.js';
import { playNote, unlockAudio } from '../audio/engine.js';
import { Metronome } from '../audio/metronome.js';
import { el, button } from './components.js';
import { lessonKey, levelProgress } from '../progress/store.js';
import { isDesktopInput } from '../input/device.js';

let active = null; // { stop() } for the currently mounted lesson

export function stopActiveLesson() {
  if (active) active.stop();
  active = null;
}

export function renderLesson(app) {
  stopActiveLesson();
  const { instrument, level } = app.state;
  const lessons = getLessons(instrument, level);

  if (!lessons.length) return renderComingSoon(app);

  const L = lessons[app.state.lesson];
  app.state.widget = L.widget;
  const tone = INSTRUMENTS[instrument].tone;
  const total = lessons.length;
  const idx = app.state.lesson;

  // Model the new step-based lesson flow on Acoustic Beginner Lesson 1 only.
  // The runner itself is data-driven so it can be enabled for every authored
  // lesson after the interaction model is approved.
  if (instrument === 'acoustic' && level === 'beginner' && L.id === 'ac-b-1') {
    return renderStepLesson(app, { lessons, lesson: L, tone, total, idx });
  }

  const view = el('div', 'view');
  const levelName = `${LEVELS[level].am} · ${LEVELS[level].en}`;
  const prog = Array.from({ length: total }, (_, i) => `<i class="${i <= idx ? 'on' : ''}"></i>`).join('');

  view.innerHTML = `
    <div class="wrap">
      <div class="crumbs">
        <button data-act="home">መነሻ</button><span class="sep">/</span>
        <button data-act="levels">${INSTRUMENTS[instrument].en}</button><span class="sep">/</span>
        <span>${levelName}</span>
      </div>

      <div class="lesson-top">
        <div>
          <div class="lesson-idx">ትምህርት ${idx + 1} / ${total} · Lesson ${idx + 1}</div>
          <div class="lesson-title"><span class="am">${L.title.am}</span><span class="en">${L.title.en}</span></div>
        </div>
        <div class="prog">${prog}</div>
      </div>

      <div class="lesson-body">
        ${L.goal ? `<div class="lesson-goal"><b>የትምህርቱ ግብ · Learning goal</b><span class="am">${L.goal.am}</span><span class="en">${L.goal.en}</span></div>` : ''}
        <p class="am-copy">${L.body.am}</p>
        <p class="en-copy">${L.body.en}</p>
        ${L.micro ? `<div class="microtonal"><b>ማስታወሻ · Note:</b> Traditional kiñit tuning holds subtle microtonal shades between the piano keys — the western notes here only approximate them. Your ear will learn the real colors over time.</div>` : ''}
      </div>

      ${L.exercises?.length ? `<section class="practice-card"><div class="eyebrow">ልምምድ · Practice</div>${L.exercises.map((exercise, i) => `<div class="practice-step"><b>${i + 1}</b><p><span>${exercise.instruction.am}</span>${exercise.instruction.en}</p></div>`).join('')}</section>` : ''}

      <div class="learning-flow" aria-label="Practice steps">
        <div class="flow-step"><b>1</b><span>ይመልከቱ<small>WATCH THE NOTES GLOW</small></span></div>
        <i>→</i><div class="flow-step"><b>2</b><span>ያዳምጡ<small>LISTEN SLOWLY</small></span></div>
        <i>→</i><div class="flow-step"><b>3</b><span>ይጫወቱ<small>PLAY IT YOURSELF</small></span></div>
      </div>

      <div class="stage stage-${instrument}">
        <p class="stage-caption" data-cap></p>
        <div data-stage></div>
      </div>

      <div class="console" data-console></div>

      <section class="quiz-card" data-quiz>
        <div class="eyebrow">አጭር ፈተና · Lesson quiz</div>
        <h3>ለማጠናቀቅ 70% ያግኙ · Score 70% to complete</h3>
        <div data-quizbody></div>
      </section>

      <div class="lesson-nav">
        <button class="btn sec" data-act="prev" ${idx === 0 ? 'disabled' : ''}>← ያለፈው · Previous</button>
        ${idx < total - 1
          ? `<button class="btn" data-act="next" disabled>የሚቀጥለው ትምህርት · Next →</button>`
          : `<button class="btn" data-act="finish" disabled>✓ ጨርሰዋል · Finish course</button>`}
      </div>
    </div>`;

  // ---- instrument stage ----
  const instrumentView = instrument === 'keyboard' ? createKeyboard({
    showLabels: true,
    onHit: (m) => playNote(m, tone),
  }) : createFretboard({ instrument, onHit: (m) => playNote(m, tone) });
  view.querySelector('[data-stage]').appendChild(instrumentView.el);

  const desktop = isDesktopInput();
  instrumentView.setInputEnabled?.(desktop);
  instrumentView.setHintsVisible?.(desktop && !!app.data.settings.keyLabels);

  const cap = view.querySelector('[data-cap]');
  const colorScale = !(L.widget === 'freeplay' || L.widget === 'named' || L.widget === 'tuner');

  function refreshStage() {
    instrumentView.highlight({
      scaleKey: app.state.scale,
      rootIdx: app.state.root,
      colorScale,
      flats: SCALES[app.state.scale].flats,
    });
    updateCaption();
  }

  function updateCaption() {
    const s = SCALES[app.state.scale];
    const rn = ROOTS[app.state.root].name;
    if (L.widget === 'freeplay') { cap.textContent = 'ማንኛውንም ኪ ተጫኑ · touch any key'; return; }
    if (L.widget === 'named') { cap.textContent = 'እያንዳንዱን ኪ ተጫኑ · press each key to hear its name'; return; }
    if (L.widget === 'tuner') { cap.textContent = 'ክፍት ክር ይምረጡና ከማጣቀሻው ድምፅ ጋር ያስተካክሉ · match each open string to its reference tone'; return; }
    cap.innerHTML = `${s.am} · ${s.en} on ${rn} &nbsp;—&nbsp; <span style="color:var(--gold)">${spellScale(app.state.scale, app.state.root).join(' – ')}</span>`;
  }

  // ---- sequenced playback ----
  let seqTimers = [];
  const clearSeq = () => { seqTimers.forEach(clearTimeout); seqTimers = []; instrumentView.clearLit(); };

  function instrumentScaleMidis(withOctave=true) {
    if (instrument === 'keyboard') return scaleMidis(app.state.scale, app.state.root, withOctave);
    const s=SCALES[app.state.scale], pc=rootPc(app.state.root);
    let base=instrument === 'bass' ? 36 + pc : 48 + pc;
    if(instrument === 'bass' && base > 43) base -= 12;
    if(instrument !== 'bass' && base > 55) base -= 12;
    const result=s.semis.map(iv=>base+iv); if(withOctave) result.push(base+12); return result;
  }

  function tempo() {
    const t = view.querySelector('[data-tempo]');
    return t ? +t.value : 84;
  }

  function playScaleSeq(upDown) {
    unlockAudio();
    clearSeq();
    const step = (60 / tempo()) * 0.9;
    let seq = instrumentScaleMidis(true);
    if (upDown) seq = seq.concat(seq.slice(0, -1).reverse().slice(1));
    seq.forEach((m, i) => {
      seqTimers.push(setTimeout(() => { playNote(m, tone, 0, step * 0.95); instrumentView.flash(m); }, i * step * 1000));
    });
  }

  function melodyMidis() {
    const pc=rootPc(app.state.root);
    const base = instrument === 'keyboard' ? 60 + pc : instrument === 'bass' ? (36 + pc > 43 ? 24 + pc : 36 + pc) : (48 + pc > 55 ? 36 + pc : 48 + pc);
    const s = SCALES[app.state.scale];
    return (L.melody || []).map((deg) => base + (deg < 5 ? s.semis[deg] : 12));
  }

  function playMelody() {
    unlockAudio();
    clearSeq();
    const step = (60 / tempo()) * 0.75;
    melodyMidis().forEach((m, i) => {
      seqTimers.push(setTimeout(() => {
        playNote(m, tone, 0, step * 0.9);
        instrumentView.flash(m);
        const mn = view.querySelector(`[data-mi="${i}"]`);
        if (mn) { mn.classList.add('on'); setTimeout(() => mn.classList.remove('on'), step * 900); }
      }, i * step * 1000));
    });
  }

  // ---- metronome ----
  const metro = new Metronome((accent) => {
    const dot = view.querySelector('[data-metdot]');
    if (dot) { dot.classList.add('beat'); setTimeout(() => dot.classList.remove('beat'), 90); }
  });

  // ---- console ----
  buildConsole(view, app, L, { playScaleSeq, playMelody, metro, refreshStage });
  refreshStage();
  mountQuiz(view, app, L, lessons, instrumentView);

  // ---- nav ----
  view.querySelector('[data-act="home"]').addEventListener('click', () => app.home());
  view.querySelector('[data-act="levels"]').addEventListener('click', () => app.openInstrument(instrument));
  const prevBtn = view.querySelector('[data-act="prev"]');
  const nextBtn = view.querySelector('[data-act="next"]');
  const finishBtn = view.querySelector('[data-act="finish"]');
  if (prevBtn) prevBtn.addEventListener('click', () => { if (idx > 0) app.gotoLesson(idx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', () => app.gotoLesson(idx + 1));
  if (finishBtn) finishBtn.addEventListener('click', () => {
    if (levelProgress(app.data, instrument, level, lessons) === 1) app.openView('certificate');
    else app.openInstrument(instrument);
  });

  active = { stop() { clearSeq(); metro.stop(); instrumentView.destroy?.(); } };
  return view;
}

function renderStepLesson(app, { lessons, lesson, tone, total, idx }) {
  const { instrument, level } = app.state;
  const bodyChunks = chunkBilingualBody(lesson.body);
  const questions = lesson.quiz.slice(0, 5);
  const steps = [
    ...(lesson.goal ? [{ type: 'goal' }] : []),
    ...bodyChunks.map((chunk, index) => ({ type: 'body', chunk, index })),
    ...(lesson.exercises || []).map((exercise, index) => ({ type: 'exercise', exercise, index })),
    ...questions.map((question, index) => ({ type: 'quiz', question, index })),
    { type: 'result' },
  ];
  const firstQuizStep = steps.findIndex((step) => step.type === 'quiz');
  const answers = Array(questions.length).fill(null);
  let at = 0;
  let resultRecorded = false;

  const view = el('div', 'view step-lesson');
  view.innerHTML = `
    <div class="wrap runner-wrap">
      <div class="runner-progress">
        <button class="runner-exit" data-act="levels" aria-label="Exit lesson">×</button>
        <div class="runner-track" role="progressbar" aria-label="Lesson step progress" aria-valuemin="1" aria-valuemax="${steps.length}" aria-valuenow="1"><i data-runnerfill></i></div>
        <span data-runnercount>1 / ${steps.length}</span>
      </div>

      <div class="runner-heading">
        <span>ትምህርት ${idx + 1} / ${total} · Lesson ${idx + 1}</span>
        <h1>${lesson.title.am}</h1>
        <p>${lesson.title.en}</p>
      </div>

      <main class="runner-screen" data-runnerscreen aria-live="polite"></main>

      <section class="runner-studio" data-runnerstudio hidden>
        <div class="runner-studio-head">
          <span>🎸 እርስዎ ይሞክሩ · Your turn</span>
          <small>ኖታዎቹን ይንኩ · tap the notes</small>
        </div>
        <div class="stage stage-${instrument}">
          <p class="stage-caption" data-cap></p>
          <div data-stage></div>
        </div>
        <div class="runner-swipe-hint">← ፍሬቶቹን ለማየት ያንሸራትቱ · swipe the fretboard →</div>
      </section>

      <div class="runner-actions">
        <button class="runner-back" data-runnerback aria-label="Previous step">←</button>
        <button class="btn runner-continue" data-runnernext>ቀጥል · Continue</button>
      </div>
    </div>`;

  const instrumentView = instrument === 'keyboard' ? createKeyboard({
    showLabels: true,
    onHit: (m) => playNote(m, tone),
  }) : createFretboard({ instrument, onHit: (m) => playNote(m, tone) });
  view.querySelector('[data-stage]').appendChild(instrumentView.el);
  const desktop = isDesktopInput();
  instrumentView.setInputEnabled?.(desktop);
  instrumentView.setHintsVisible?.(desktop && !!app.data.settings.keyLabels);
  instrumentView.highlight({
    scaleKey: app.state.scale,
    rootIdx: app.state.root,
    colorScale: !(lesson.widget === 'freeplay' || lesson.widget === 'named' || lesson.widget === 'tuner'),
    flats: SCALES[app.state.scale].flats,
  });
  view.querySelector('[data-cap]').textContent = lesson.widget === 'freeplay'
    ? 'ማንኛውንም ፍሬት ይንኩ፤ ኖታውን ያዳምጡ · tap any fret and listen'
    : 'ኖታዎቹን ይንኩና ብርሃናቸውን ይመልከቱ · tap a note and watch it glow';

  const screen = view.querySelector('[data-runnerscreen]');
  const studio = view.querySelector('[data-runnerstudio]');
  const progress = view.querySelector('.runner-track');
  const fill = view.querySelector('[data-runnerfill]');
  const count = view.querySelector('[data-runnercount]');
  const back = view.querySelector('[data-runnerback]');
  const next = view.querySelector('[data-runnernext]');

  const playQuizAudio = (question) => {
    if (!question.audio?.midis?.length) return;
    unlockAudio();
    const gap = question.audio.gap ?? .55;
    question.audio.midis.forEach((m, i) => playNote(m, tone, i * gap, Math.min(.7, gap * .9)));
  };

  const score = () => Math.round(answers.filter((choice, i) => choice === questions[i].answer).length / questions.length * 100);

  const draw = () => {
    const step = steps[at];
    const pct = ((at + 1) / steps.length) * 100;
    fill.style.width = `${pct}%`;
    progress.setAttribute('aria-valuenow', String(at + 1));
    count.textContent = `${at + 1} / ${steps.length}`;
    back.disabled = at === 0;
    studio.hidden = step.type !== 'exercise';
    view.classList.toggle('runner-compact', step.type === 'exercise' || step.type === 'quiz' || step.type === 'result');
    next.hidden = false;
    next.disabled = false;
    next.textContent = 'ቀጥል · Continue';

    if (step.type === 'goal') {
      screen.innerHTML = `<article class="runner-card runner-goal">
        <div class="runner-step-icon">✦</div>
        <div class="runner-label">ዛሬ ምን ይማራሉ? · Here’s what you’ll learn</div>
        <h2>${lesson.goal.am}</h2>
        <p>${lesson.goal.en}</p>
      </article>`;
    } else if (step.type === 'body') {
      const isLastBody = step.index === bodyChunks.length - 1;
      screen.innerHTML = `<article class="runner-card runner-idea">
        <div class="runner-step-icon">${step.index + 1}</div>
        <div class="runner-label">ትንሽ ሀሳብ · One small idea</div>
        <h2>${step.chunk.am}</h2>
        <p>${step.chunk.en}</p>
        ${lesson.micro && isLastBody ? '<div class="runner-note">ባህላዊ ቅኝት ከፒያኖ ኖታዎች መካከል ስውር የድምፅ ጥላዎች አሉት። · Traditional kiñit contains subtle shades between western notes.</div>' : ''}
      </article>`;
    } else if (step.type === 'exercise') {
      screen.innerHTML = `<article class="runner-card runner-practice-card">
        <div class="runner-step-icon">${step.index + 1}</div>
        <div class="runner-label">ልምምድ ${step.index + 1} · Practice ${step.index + 1}</div>
        <h2>${step.exercise.instruction.am}</h2>
        <p>${step.exercise.instruction.en}</p>
        <div class="runner-try-cue">ከታች ባለው ጊታር ላይ አሁን ይሞክሩ · Try it on the guitar below</div>
      </article>`;
    } else if (step.type === 'quiz') {
      const question = step.question;
      const chosen = answers[step.index];
      const answered = chosen !== null;
      const listen = question.type === 'ear-training' && question.audio?.midis?.length;
      screen.innerHTML = `<article class="runner-card runner-quiz-card">
        <div class="runner-label">ጥያቄ ${step.index + 1} / ${questions.length} · Question ${step.index + 1}</div>
        <h2>${question.prompt.am}</h2>
        <p>${question.prompt.en}</p>
        ${listen ? '<button class="btn sec runner-listen" data-listen>▶ ድምፁን ያዳምጡ · Play sound</button>' : ''}
        <div class="runner-answer-grid">${question.choices.map((choice, choiceIndex) => {
          const correct = answered && choiceIndex === question.answer;
          const wrong = answered && choiceIndex === chosen && choiceIndex !== question.answer;
          return `<button data-answer="${choiceIndex}" class="${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}" ${answered ? 'disabled' : ''}>${choice}</button>`;
        }).join('')}</div>
        ${answered ? `<div class="runner-feedback ${chosen === question.answer ? 'good' : 'bad'}">${chosen === question.answer ? '✓ በጣም ጥሩ! · Excellent!' : `ትክክለኛው፦ ${question.choices[question.answer]}`}</div>` : ''}
      </article>`;
      next.disabled = !answered;
      screen.querySelector('[data-listen]')?.addEventListener('click', () => playQuizAudio(question));
      screen.querySelectorAll('[data-answer]').forEach((choice) => choice.addEventListener('click', () => {
        answers[step.index] = +choice.dataset.answer;
        if (answers[step.index] !== question.answer) instrumentView.flash(60);
        draw();
      }));
    } else {
      const finalScore = score();
      const pass = finalScore >= 70;
      screen.innerHTML = `<article class="runner-card runner-result ${pass ? 'pass' : 'retry'}">
        <div class="runner-step-icon">${pass ? '✓' : '↻'}</div>
        <div class="runner-label">${pass ? 'ትምህርቱ ተጠናቋል · Lesson complete' : 'አንድ ጊዜ ተጨማሪ · One more try'}</div>
        <strong>${finalScore}%</strong>
        <h2>${pass ? 'እጅግ ጥሩ ሥራ!' : 'እንደገና ይሞክሩ'}</h2>
        <p>${pass ? 'Great work — your hands and ears are ready for the next lesson.' : 'Review the three questions and try to reach 70%.'}</p>
        ${pass ? '' : '<button class="btn sec runner-retry" data-retry>↻ ጥያቄዎቹን እንደገና · Retry quiz</button>'}
      </article>`;
      if (pass) {
        next.textContent = idx < total - 1 ? 'ቀጣዩ ትምህርት · Next lesson' : '✓ ኮርሱን ጨርስ · Finish course';
        if (!resultRecorded) {
          const key = lessonKey(instrument, level, lesson.id);
          app.data.completed[key] = true;
          app.data.scores[key] = finalScore;
          app.persist();
          offerInstall(view, app);
          resultRecorded = true;
        }
      } else {
        next.hidden = true;
        screen.querySelector('[data-retry]').addEventListener('click', () => {
          answers.fill(null);
          at = firstQuizStep;
          draw();
        });
      }
    }

    view.querySelector('.runner-progress').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  back.addEventListener('click', () => { if (at > 0) { at -= 1; draw(); } });
  next.addEventListener('click', () => {
    const step = steps[at];
    if (step.type === 'quiz' && answers[step.index] === null) return;
    if (step.type === 'result') {
      if (score() < 70) return;
      if (idx < total - 1) app.gotoLesson(idx + 1);
      else if (levelProgress(app.data, instrument, level, lessons) === 1) app.openView('certificate');
      else app.openInstrument(instrument);
      return;
    }
    at += 1;
    draw();
  });
  view.querySelector('[data-act="levels"]').addEventListener('click', () => app.openInstrument(instrument));

  draw();
  active = { stop() { instrumentView.clearLit(); instrumentView.destroy?.(); } };
  return view;
}

function chunkBilingualBody(body = {}) {
  const am = splitSentences(body.am || '');
  const en = splitSentences(body.en || '');
  const chunkCount = Math.max(1, Math.ceil(Math.max(am.length, en.length) / 2));
  const group = (sentences, index) => {
    const start = Math.round(index * sentences.length / chunkCount);
    const end = Math.round((index + 1) * sentences.length / chunkCount);
    return sentences.slice(start, end).join(' ');
  };
  return Array.from({ length: chunkCount }, (_, index) => ({ am: group(am, index), en: group(en, index) }))
    .filter((chunk) => chunk.am || chunk.en);
}

function splitSentences(text) {
  return String(text).split(/\n+/u).flatMap((paragraph) =>
    paragraph.match(/[^።፧.!?]+[።፧.!?]+|[^።፧.!?]+$/gu) || []
  ).map((sentence) => sentence.trim()).filter(Boolean);
}

function mountQuiz(view, app, lesson, lessons, kb) {
  const body=view.querySelector('[data-quizbody]'); const questions=lesson.quiz.slice(0,5); let at=0,correct=0;
  const already=app.data.completed[lessonKey(app.state.instrument,app.state.level,lesson.id)];
  const unlock=()=>{view.querySelector('[data-act="next"], [data-act="finish"]')?.removeAttribute('disabled')};
  if(already){body.innerHTML='<div class="quiz-result pass">✓ ቀድሞ ተጠናቋል · Already completed</div>';unlock();return;}
  const playQuizAudio=(q)=>{
    if(!q.audio?.midis?.length)return;
    unlockAudio();
    const gap=q.audio.gap ?? .55;
    q.audio.midis.forEach((m,i)=>playNote(m,INSTRUMENTS[app.state.instrument].tone,i*gap,Math.min(.7,gap*.9)));
  };
  const draw=()=>{const q=questions[at],listen=q.type==='ear-training'&&q.audio?.midis?.length; body.innerHTML=`<div class="quiz-count">${at+1} / ${questions.length}</div><p class="quiz-prompt"><span>${q.prompt.am}</span>${q.prompt.en}</p>${listen?'<button class="btn sec quiz-listen" data-listen>▶ ድምፁን ያዳምጡ · Play sound</button>':''}<div class="answer-grid">${q.choices.map((c,i)=>`<button data-answer="${i}">${c}</button>`).join('')}</div><div data-feedback></div>`;body.querySelector('[data-listen]')?.addEventListener('click',()=>playQuizAudio(q));body.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(+b.dataset.answer,q));};
  const answer=(choice,q)=>{body.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);const good=choice===q.answer;if(good)correct++;else kb.flash(60);const fb=body.querySelector('[data-feedback]');fb.className=`feedback ${good?'good':'bad'}`;fb.textContent=good?'በጣም ጥሩ! · Excellent!':`እንደገና ይሞክሩ — ትክክለኛው: ${q.choices[q.answer]}`;setTimeout(()=>{at++;at<questions.length?draw():finish()},700)};
  const finish=()=>{const score=Math.round(correct/questions.length*100),pass=score>=70;body.innerHTML=`<div class="quiz-result ${pass?'pass':'retry'}"><strong>${score}%</strong><span>${pass?'እንኳን ደስ አለዎት · You passed!':'ጥሩ ሙከራ · Keep practicing'}</span>${pass?'':'<button class="btn sec" data-retry>እንደገና · Try again</button>'}</div>`;if(pass){const key=lessonKey(app.state.instrument,app.state.level,lesson.id);app.data.completed[key]=true;app.data.scores[key]=score;app.persist();unlock();offerInstall(view,app)}else body.querySelector('[data-retry]').onclick=()=>{at=0;correct=0;draw()}}; draw();
}

function offerInstall(view,app){if(app.data.installSeen||!window.kinitInstallPrompt)return;app.data.installSeen=true;app.persist();const n=document.createElement('div');n.className='install-banner';n.innerHTML='<span><b>ቅኝትን ይጫኑ</b> · Install for offline learning</span><button>Install</button>';n.querySelector('button').onclick=()=>{window.kinitInstallPrompt.prompt();n.remove()};view.querySelector('.wrap').prepend(n)}

// ── the studio console (scale / root / play / metronome) ──
function buildConsole(view, app, L, ctx) {
  const consoleEl = view.querySelector('[data-console]');
  const showPickers = !(L.widget === 'freeplay' || L.widget === 'named' || L.widget === 'tuner');

  const scaleChips = SCALE_ORDER
    .map((k) => `<button class="chip ${k === app.state.scale ? 'on' : ''}" data-scale="${k}">${SCALES[k].am}</button>`)
    .join('');
  const rootChips = ROOTS
    .map((r, i) => `<button class="chip sm ${i === app.state.root ? 'on' : ''}" data-root="${i}">${r.name}</button>`)
    .join('');

  consoleEl.innerHTML = `
    ${showPickers ? `
    <div class="console-card">
      <div class="ct">ቅኝት · Scale</div>
      <div class="chip-row" data-scalechips>${scaleChips}</div>
    </div>
    <div class="console-card">
      <div class="ct">መነሻ ኖታ · Root</div>
      <div class="chip-row" data-rootchips>${rootChips}</div>
    </div>` : ''}
    <div class="console-card" ${showPickers ? '' : 'style="grid-column:1/-1"'}>
      <div class="ct">ማጫወቻ · Play</div>
      <div class="btn-row" data-playrow></div>
    </div>
    <div class="console-card">
      <div class="ct">ሜትሮኖም · Metronome</div>
      <div class="metro">
        <div class="metro-dot" data-metdot></div>
        <button class="btn sec" data-metbtn>▶ ጀምር</button>
        <div class="tempo-val"><span data-bpm>84</span> <small>BPM</small></div>
      </div>
      <input type="range" data-tempo min="50" max="160" value="84">
    </div>`;

  // scale / root pickers
  consoleEl.querySelectorAll('[data-scale]').forEach((b) => b.addEventListener('click', () => {
    app.state.scale = b.dataset.scale;
    consoleEl.querySelectorAll('[data-scale]').forEach((x) => x.classList.toggle('on', x.dataset.scale === app.state.scale));
    ctx.refreshStage();
    renderMelodyLine(view, app, L);
  }));
  consoleEl.querySelectorAll('[data-root]').forEach((b) => b.addEventListener('click', () => {
    app.state.root = +b.dataset.root;
    consoleEl.querySelectorAll('[data-root]').forEach((x) => x.classList.toggle('on', +x.dataset.root === app.state.root));
    ctx.refreshStage();
    renderMelodyLine(view, app, L);
  }));

  // play row
  const row = consoleEl.querySelector('[data-playrow]');
  if (L.widget === 'freeplay') {
    row.innerHTML = `<span class="play-note">ማንኛውንም ኪ ተጫኑ · press any key above to hear a note</span>`;
  } else if (L.widget === 'named') {
    row.innerHTML = `<span class="play-note">እያንዳንዱን ኪ ተጫኑ፤ ስሙን ይመልከቱ · press each key to hear its name</span>`;
  } else if (L.widget === 'tuner') {
    const tones = L.referenceTones || [];
    tones.forEach((tone) => row.appendChild(button(`♪ ${tone.label}`, () => { unlockAudio(); playNote(tone.midi, INSTRUMENTS[app.state.instrument].tone, 0, 1.8); })));
    const hint = el('span', 'play-note');
    hint.textContent = 'እያንዳንዱን ድምፅ ደጋግመው ማጫወት ይችላሉ · replay each tone as often as needed';
    row.appendChild(hint);
  } else if (L.widget === 'melody') {
    row.appendChild(button('▶ ዜማውን አጫውት · Play melody', () => ctx.playMelody()));
    row.appendChild(button('▶ ቅኝቱን አጫውት · Play scale', () => ctx.playScaleSeq(false), { secondary: true }));
    const line = el('div', 'melody-line');
    line.setAttribute('data-melodyline', '');
    line.style.width = '100%';
    line.style.marginTop = '12px';
    row.appendChild(line);
    renderMelodyLine(view, app, L);
  } else if (L.widget === 'updown') {
    row.appendChild(button('▶ ቅኝቱን አጫውት · Play the scale', () => ctx.playScaleSeq(false)));
    row.appendChild(button('▶ ወደ ላይና ታች · Up & down', () => ctx.playScaleSeq(true), { secondary: true }));
  } else {
    row.appendChild(button('▶ ቅኝቱን አጫውት · Play the scale', () => ctx.playScaleSeq(false)));
  }

  // metronome controls
  const metBtn = consoleEl.querySelector('[data-metbtn]');
  const tempoEl = consoleEl.querySelector('[data-tempo]');
  const bpmVal = consoleEl.querySelector('[data-bpm]');
  tempoEl.addEventListener('input', () => {
    bpmVal.textContent = tempoEl.value;
    if (ctx.metro.running) ctx.metro.start(+tempoEl.value);
  });
  metBtn.addEventListener('click', () => {
    unlockAudio();
    if (ctx.metro.running) { ctx.metro.stop(); metBtn.textContent = '▶ ጀምር'; }
    else { ctx.metro.start(+tempoEl.value); metBtn.textContent = '■ አቁም'; }
  });
}

function renderMelodyLine(view, app, L) {
  const lineEl = view.querySelector('[data-melodyline]');
  if (!lineEl) return;
  const s = SCALES[app.state.scale];
  lineEl.innerHTML = (L.melody || []).map((deg, i) => {
    const iv = deg < 5 ? s.semis[deg] : 12;
    return `<div class="mnote" data-mi="${i}">${noteName(rootPc(app.state.root) + iv, s.flats)}</div>`;
  }).join('');
}

// ── graceful placeholder for levels not yet authored ──
function renderComingSoon(app) {
  const { instrument, level } = app.state;
  const inst = INSTRUMENTS[instrument];
  const levelName = `${LEVELS[level].am} · ${LEVELS[level].en}`;
  const view = el('div', 'view');
  view.innerHTML = `
    <div class="wrap">
      <div class="crumbs">
        <button data-act="home">መነሻ</button><span class="sep">/</span>
        <button data-act="levels">${inst.en}</button><span class="sep">/</span>
        <span>${levelName}</span>
      </div>
      <div class="locked-panel">
        <div class="big">${inst.ic}✨</div>
        <div class="am">ይህ ክፍል በቅርቡ ይከፈታል</div>
        <div class="en">The lessons for ${inst.en} · ${LEVELS[level].en} are being written. The Beginner Keyboard course is fully playable now.</div>
        <div class="btn-row" style="justify-content:center;margin-top:16px">
          <button class="btn sec" data-act="levels">← ደረጃዎች · Levels</button>
          <button class="btn" data-act="kb">🎹 ጀማሪ ኪቦርድ ይሞክሩ</button>
        </div>
      </div>
    </div>`;
  view.querySelector('[data-act="home"]').addEventListener('click', () => app.home());
  view.querySelectorAll('[data-act="levels"]').forEach((b) => b.addEventListener('click', () => app.openInstrument(instrument)));
  view.querySelector('[data-act="kb"]').addEventListener('click', () => app.openLevel('keyboard', 'beginner'));
  return view;
}
