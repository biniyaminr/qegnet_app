// ─────────────────────────────────────────────────────────────
// KEYBOARD — builds an interactive piano over a MIDI range and
// exposes highlight / flash controls. Emits onHit(midi) so the
// caller owns the sound (tone choice lives with the lesson).
// ─────────────────────────────────────────────────────────────

import { noteName, scalePcs, rootPc } from '../theory/scales.js';
import { shouldIgnoreKeyEvent } from '../input/keymap.js';

const BLACK_PC = { 1: 1, 3: 1, 6: 1, 8: 1, 10: 1 };

// Standard DAW-style computer-keyboard piano: A S D F G H J K are the
// white keys of one octave (C D E F G A B C), W E T Y U the black keys
// between them. Semitone offset from the mapped octave's root.
const PIANO_KEYMAP = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12 };

export function createKeyboard({ low = 60, high = 84, showLabels = true, onHit } = {}) {
  const el = document.createElement('div');
  el.className = 'piano';

  const whites = [];
  const blacks = [];
  for (let m = low; m <= high; m++) {
    (m % 12 in BLACK_PC) ? blacks.push(m) : whites.push(m);
  }

  const keyByMidi = new Map();

  const makeHit = (m, node) => (e) => {
    e.preventDefault();
    flash(m);
    if (onHit) onHit(m);
  };

  whites.forEach((m) => {
    const k = document.createElement('div');
    k.className = 'wkey';
    if (showLabels) k.classList.add('labeled');
    k.dataset.midi = m;
    k.innerHTML = `<span class="lab"></span><span class="kbd-hint"></span>`;
    k.addEventListener('pointerdown', makeHit(m, k));
    el.appendChild(k);
    keyByMidi.set(m, k);
  });

  const nW = whites.length;
  const wPct = 100 / nW;
  blacks.forEach((m) => {
    const whitesBefore = whites.filter((w) => w < m).length;
    const b = document.createElement('div');
    b.className = 'bkey';
    b.dataset.midi = m;
    b.style.left = `calc(${whitesBefore * wPct}% - 3.1%)`;
    b.innerHTML = `<span class="lab"></span><span class="kbd-hint"></span>`;
    b.addEventListener('pointerdown', makeHit(m, b));
    el.appendChild(b);
    keyByMidi.set(m, b);
  });

  // Apply scale / root colouring and note-name labels.
  function highlight({ scaleKey, rootIdx, colorScale = true, flats = false } = {}) {
    const pcs = colorScale ? scalePcs(scaleKey, rootIdx) : [];
    const rpc = rootPc(rootIdx);
    keyByMidi.forEach((node, m) => {
      const pc = m % 12;
      const inScale = colorScale && pcs.includes(pc);
      const isRoot = colorScale && pc === rpc;
      node.classList.toggle('scale', inScale);
      node.classList.toggle('root', isRoot);
      node.querySelector('.lab').textContent = noteName(pc, flats);
    });
  }

  function flash(midi) {
    const node = keyByMidi.get(midi);
    if (!node) return;
    node.classList.add('lit');
    setTimeout(() => node.classList.remove('lit'), 260);
  }

  function clearLit() {
    keyByMidi.forEach((n) => n.classList.remove('lit'));
  }

  // ---- computer-keyboard input (desktop only, bound by the caller) ----
  let octaveBase = low; // the midi note the "A" key currently plays
  let inputEnabled = false;
  let hintsEnabled = false;

  function paintHints() {
    keyByMidi.forEach((node) => { const h = node.querySelector('.kbd-hint'); if (h) h.textContent = ''; });
    if (!hintsEnabled) return;
    Object.entries(PIANO_KEYMAP).forEach(([key, semitone]) => {
      const node = keyByMidi.get(octaveBase + semitone);
      const h = node?.querySelector('.kbd-hint');
      if (h) h.textContent = key.toUpperCase();
    });
  }

  function onKeyDown(e) {
    if (!inputEnabled || e.repeat || shouldIgnoreKeyEvent(e)) return;
    const key = e.key.toLowerCase();
    if (key === 'z') { octaveBase = Math.max(low, octaveBase - 12); e.preventDefault(); paintHints(); return; }
    if (key === 'x') { octaveBase = Math.min(high - 12, octaveBase + 12); e.preventDefault(); paintHints(); return; }
    if (!(key in PIANO_KEYMAP)) return;
    const midi = octaveBase + PIANO_KEYMAP[key];
    if (!keyByMidi.has(midi)) return;
    e.preventDefault();
    flash(midi);
    if (onHit) onHit(midi);
  }
  window.addEventListener('keydown', onKeyDown);

  function setInputEnabled(v) { inputEnabled = v; }
  function setHintsVisible(v) { hintsEnabled = v; paintHints(); }
  function destroy() { window.removeEventListener('keydown', onKeyDown); }

  return { el, whites, blacks, keyByMidi, highlight, flash, clearLit, setInputEnabled, setHintsVisible, destroy };
}
