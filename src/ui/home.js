// HOME — hero, the four-kiñit reference strip (tap to hear),
// and the instrument chooser. Progress rings arrive in Step 3.

import { SCALES, SCALE_ORDER, noteName } from '../theory/scales.js';
import { INSTRUMENTS, INSTRUMENT_ORDER } from '../config.js';
import { playNote, unlockAudio } from '../audio/engine.js';
import { el } from './components.js';
import { getLessons } from '../lessons/index.js';
import { levelProgress } from '../progress/store.js';

function previewScale(scaleKey) {
  unlockAudio();
  const s = SCALES[scaleKey];
  const seq = [...s.semis, 12].map((iv) => 60 + iv);
  seq.forEach((m, i) => playNote(m, 'keys', i * 0.28, 0.5));
}

export function renderHome(app) {
  const view = el('div', 'view');

  const scaleCards = SCALE_ORDER.map((key) => {
    const s = SCALES[key];
    const notes = s.semis
      .map((iv, i) => `<span class="n${i === 0 ? ' root' : ''}">${noteName(iv, s.flats)}</span>`)
      .join('');
    return `<button class="scale-card" data-scale="${key}">
      <div class="nm">${s.am}</div>
      <div class="en">${s.en} — ${s.mood}</div>
      <div class="notes">${notes}</div>
      <div class="play-hint">▶ ስሙት · tap to hear</div>
    </button>`;
  }).join('');

  const instCards = INSTRUMENT_ORDER.map((key) => {
    const inst = INSTRUMENTS[key];
    const all=getLessons(key,'beginner');
    const done=all.filter(x=>app.data.completed[`${key}.beginner.${x.id}`]).length;
    const pct=Math.round(done/all.length*100)||0;
    return `<button class="inst-card" data-inst="${key}">
      <div class="ic">${inst.ic}</div>
      ${inst.strings ? `<div class="strings">${inst.strings}</div>` : ''}
      <div class="am">${inst.am}</div>
      <div class="en">${inst.en}</div>
      <div class="desc">${inst.desc.en}</div>
      <div class="progress-line"><i style="width:${pct}%"></i></div><small>${pct}% ተጠናቋል · complete</small>
    </button>`;
  }).join('');

  view.innerHTML = `
    <div class="wrap">
      <div class="hero">
        <h1 class="mark">ቅኝት</h1>
        <p class="sub-am">የአማርኛ ሙዚቃ ትምህርት ቤት</p>
        <p class="sub-en">Kiñit Music School — learn Ethiopian music from the very first note</p>
        <p class="lead">Four traditional pentatonic kiñit, four instruments, three levels — every note glows, and every note plays real sound. Start where you are; we begin from zero.</p>
        <div class="tibeb-rule"></div>
        ${app.data.current?'<button class="btn continue" data-continue>▶ ካቆሙበት ይቀጥሉ · Continue where you left off</button>':''}
      </div>

      <div class="eyebrow">አራቱ ቅኝቶች · The Four Kiñit</div>
      <div class="sec-title"><span class="am">የኢትዮጵያ ሙዚቃ መሠረት</span><span class="en">tap a scale to hear it</span></div>
      <div class="scales-strip">${scaleCards}</div>

      <div class="eyebrow">መሣሪያ ይምረጡ · Choose an instrument</div>
      <div class="sec-title"><span class="am">ምን መጫወት ይፈልጋሉ?</span><span class="en">what will you play?</span></div>
      <div class="inst-grid">${instCards}</div>

      <footer>
        <span class="fidel">ቅኝት</span> · original example melodies only · built with the Web Audio API
      </footer>
    </div>`;

  view.querySelectorAll('[data-scale]').forEach((b) =>
    b.addEventListener('click', () => previewScale(b.dataset.scale)));

  view.querySelectorAll('[data-inst]').forEach((b) =>
    b.addEventListener('click', () => app.openInstrument(b.dataset.inst)));
  view.querySelector('[data-continue]')?.addEventListener('click',()=>{const c=app.data.current;app.openLevel(c.instrument,c.level);app.gotoLesson(c.lesson)});

  return view;
}
