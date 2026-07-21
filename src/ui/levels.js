// LEVELS — choose ጀማሪ / መካከለኛ / ባለሙያ for the picked instrument.
// Only the fully authored Beginner path is public for launch.

import { INSTRUMENTS, LEVELS, LEVEL_ORDER } from '../config.js';
import { lessonCount, getLessons } from '../lessons/index.js';
import { el } from './components.js';
import { levelProgress } from '../progress/store.js';

export function renderLevels(app) {
  const view = el('div', 'view');
  const instKey = app.state.instrument;
  const inst = INSTRUMENTS[instKey];

  const cards = LEVEL_ORDER.map((lvKey) => {
    const lv = LEVELS[lvKey];
    const unlocked = lvKey === 'beginner';
    const lessons = getLessons(instKey, lvKey);
    const ready = unlocked && lessonCount(instKey, lvKey) > 0;
    const progress = ready ? Math.round(levelProgress(app.data, instKey, lvKey, lessons)*100) : 0;
    const levelNumber = LEVEL_ORDER.indexOf(lvKey) + 1;
    return `<button class="level-card" ${ready ? `data-level="${lvKey}"` : 'data-locked="1" disabled aria-disabled="true"'}>
      <div class="step">${ready ? lv.step : `ክፍል ${levelNumber} · በቅርቡ`}</div>
      <div class="am">${lv.am}</div>
      <div class="en">${lv.en}</div>
      <div class="desc">${lv.desc.en}</div>
      ${ready
        ? `<div class="progress-line"><i style="width:${progress}%"></i></div><small>${progress}% complete</small>`
        : '<span class="lock-pill">🔒 በቅርቡ · Coming soon</span>'}
    </button>`;
  }).join('');

  view.innerHTML = `
    <div class="wrap">
      <div class="crumbs">
        <button data-act="home">መነሻ · Home</button>
        <span class="sep">/</span><span>${inst.en}</span>
      </div>
      <div class="level-head">
        <div class="ic">${inst.ic}</div>
        <div class="sec-title"><span class="am">${inst.am}</span><span class="en">${inst.en}</span></div>
      </div>
      <div class="level-grid">${cards}</div>
    </div>`;

  view.querySelector('[data-act="home"]').addEventListener('click', () => app.home());
  view.querySelectorAll('[data-level]:not([disabled])').forEach((b) =>
    b.addEventListener('click', () => app.openLevel(instKey, b.dataset.level)));

  return view;
}
