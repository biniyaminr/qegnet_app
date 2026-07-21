// ─────────────────────────────────────────────────────────────
// APP CONTROLLER + SHELL — owns state, the navigation stack (so
// Android back behaves), the top bar, and view mounting.
// ─────────────────────────────────────────────────────────────

import { renderHome } from './home.js';
import { renderLevels } from './levels.js';
import { renderLesson, stopActiveLesson } from './lesson.js';
import { unlockAudio } from '../audio/engine.js';
import { loadStore, saveStore } from '../progress/store.js';
import { setVolume } from '../audio/engine.js';
import { renderSettings, renderAbout, renderCertificate, renderOnboarding } from './static.js';

export function createApp(root) {
  const state = {
    view: 'home',
    instrument: null,
    level: null,
    lesson: 0,
    scale: 'tizita',
    root: 0, // index into ROOTS
    widget: null,
  };
  const data = loadStore();
  setVolume(data.settings.volume);
  document.documentElement.dataset.language = data.settings.language;

  // navigation stack of {view, instrument, level, lesson}
  const stack = [];

  root.innerHTML = `
    <div class="topbar">
      <button class="brand" data-act="home">
        <span class="fidel">ቅኝት</span>
        <span class="en">Music School</span>
      </button>
      <span class="spacer"></span>
      <button class="icon-btn" aria-label="About" data-act="about">ⓘ</button>
      <button class="icon-btn" aria-label="Settings" data-act="settings">⚙</button>
    </div>
    <main id="view" class="view-host"></main>`;

  const host = root.querySelector('#view');

  root.querySelector('[data-act="home"]').addEventListener('click', () => app.home());
  root.querySelector('[data-act="about"]').addEventListener('click', () => app.openView('about'));
  root.querySelector('[data-act="settings"]').addEventListener('click', () => app.openView('settings'));

  function render() {
    stopActiveLesson(); // stop any metronome / sequenced audio from the previous view
    host.replaceChildren();
    let node;
    if (state.view === 'home') node = renderHome(app);
    else if (state.view === 'levels') node = renderLevels(app);
    else if (state.view === 'lesson') node = renderLesson(app);
    else if (state.view === 'settings') node = renderSettings(app);
    else if (state.view === 'about') node = renderAbout(app);
    else if (state.view === 'certificate') node = renderCertificate(app);
    else if (state.view === 'onboarding') node = renderOnboarding(app);
    host.appendChild(node);
    host.classList.remove('fade');
    // reflow to restart the animation
    void host.offsetWidth;
    host.classList.add('fade');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function snapshot() {
    return { view: state.view, instrument: state.instrument, level: state.level, lesson: state.lesson };
  }

  const app = {
    state, data,
    persist() { saveStore(data); },
    openView(view) { stack.push(snapshot()); state.view=view; render(); },

    home() {
      state.view = 'home';
      stack.length = 0;
      render();
    },

    openInstrument(key) {
      stack.push(snapshot());
      state.instrument = key;
      state.view = 'levels';
      render();
    },

    openLevel(instrument, level) {
      stack.push(snapshot());
      state.instrument = instrument;
      state.level = level;
      state.lesson = 0;
      data.current = { instrument, level, lesson: 0 }; saveStore(data);
      state.view = 'lesson';
      render();
    },

    gotoLesson(idx) {
      state.lesson = idx;
      data.current = { instrument: state.instrument, level: state.level, lesson: idx }; saveStore(data);
      render();
    },

    back() {
      const prev = stack.pop();
      if (!prev) { app.home(); return; }
      Object.assign(state, prev);
      render();
    },

    unlockAudio,
    render,
  };

  if (!data.onboarded) { state.view='onboarding'; render(); }
  else app.home();
  return app;
}
