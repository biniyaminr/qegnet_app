import { noteName, scalePcs, rootPc } from '../theory/scales.js';
import { shouldIgnoreKeyEvent } from '../input/keymap.js';

const TUNINGS = {
  bass: [43, 38, 33, 28],
  acoustic: [64, 59, 55, 50, 45, 40],
  lead: [64, 59, 55, 50, 45, 40],
};
const STRING_NAMES = {
  bass: ['G', 'D', 'A', 'E'],
  acoustic: ['e', 'B', 'G', 'D', 'A', 'E'],
  lead: ['e', 'B', 'G', 'D', 'A', 'E'],
};

// Bass (4 strings): the four letter rows of a QWERTY keyboard are the
// four strings top-to-bottom (G, D, A, E), each key along a row is the
// next fret — the first key in the row is the open string.
const BASS_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

// Acoustic / lead (6 strings): no keyboard has six rows, so ↑/↓ (or a
// click) picks the active string, and the number row plays its frets.
const FRET_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function createFretboard({ instrument = 'acoustic', onHit } = {}) {
  const tuning = TUNINGS[instrument];
  const names = STRING_NAMES[instrument];
  const fretCount = instrument === 'bass' ? 12 : 12;
  const root = document.createElement('div');
  root.className = `instrument-shell ${instrument}`;
  root.innerHTML = `
    <div class="instrument-identity">
      <span class="instrument-badge">${instrument === 'bass' ? 'BASS · 4 STRING' : instrument === 'acoustic' ? 'ACOUSTIC · 6 STRING' : 'LEAD · 6 STRING'}</span>
      <span class="play-direction">NUT → HIGHER NOTES</span>
    </div>
    <div class="fret-scroll"><div class="fretboard" role="group" aria-label="Interactive ${instrument} fretboard"></div></div>
    ${instrument === 'acoustic' ? '<div class="strum-hint">↕ ሕብረቶቹን ይምቱ · strum across the strings</div>' : ''}
    <div class="kbd-help" data-kbdhelp></div>`;
  const board = root.querySelector('.fretboard');
  board.style.setProperty('--strings', tuning.length);
  board.style.setProperty('--frets', fretCount + 1);
  const cells = [];

  tuning.forEach((openMidi, stringIndex) => {
    for (let fret = 0; fret <= fretCount; fret++) {
      const midi = openMidi + fret;
      const cell = document.createElement('button');
      cell.className = `fret-note ${fret === 0 ? 'open' : ''}`;
      cell.dataset.midi = midi;
      cell.dataset.string = stringIndex;
      cell.dataset.fret = fret;
      cell.style.gridRow = stringIndex + 1;
      cell.style.gridColumn = fret + 1;
      cell.setAttribute('aria-label', `${names[stringIndex]} string, fret ${fret}, ${noteName(midi, false)}`);
      cell.innerHTML = `<span class="string-name">${fret === 0 ? names[stringIndex] : ''}</span><span class="note-dot"></span><span class="note-label"></span><span class="kbd-hint"></span>`;
      cell.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        if (instrument !== 'bass' && inputEnabled) setActiveString(stringIndex);
        flash(midi, stringIndex, fret);
        onHit?.(midi);
      });
      board.appendChild(cell); cells.push(cell);
    }
  });

  const numbers = document.createElement('div');
  numbers.className = 'fret-numbers';
  numbers.innerHTML = Array.from({length:fretCount+1},(_,i)=>`<span>${i === 0 ? 'OPEN' : i}</span>`).join('');
  board.appendChild(numbers);

  function highlight({ scaleKey, rootIdx, colorScale = true, flats = false } = {}) {
    const pcs = colorScale ? scalePcs(scaleKey, rootIdx) : [];
    const rpc = rootPc(rootIdx);
    cells.forEach((cell) => {
      const midi = +cell.dataset.midi, pc = midi % 12;
      const inScale = pcs.includes(pc), isRoot = inScale && pc === rpc;
      cell.classList.toggle('scale', inScale); cell.classList.toggle('root', isRoot);
      cell.querySelector('.note-label').textContent = inScale || colorScale === false ? noteName(pc, flats) : '';
    });
  }
  function flash(midi, stringIndex, fret) {
    let matches = cells.filter(c => +c.dataset.midi === midi);
    if (stringIndex !== undefined) matches = matches.filter(c => +c.dataset.string === stringIndex && +c.dataset.fret === fret);
    if (!matches.length) {
      const pc = ((midi % 12) + 12) % 12;
      matches = cells.filter(c => +c.dataset.midi % 12 === pc && +c.dataset.fret <= 7).slice(0, 1);
    }
    matches.forEach(c => { c.classList.add('lit'); setTimeout(()=>c.classList.remove('lit'), 420); });
  }
  function clearLit(){ cells.forEach(c=>c.classList.remove('lit')); }
  function focusMidi(pc) {
    const choices=cells.map(c=>+c.dataset.midi).filter(m=>m%12===((pc%12)+12)%12);
    const target=instrument==='bass'?40:52;
    return choices.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))[0];
  }

  // ---- computer-keyboard input (desktop only, bound by the caller) ----
  const kbdHelp = root.querySelector('[data-kbdhelp]');
  let activeString = 0; // acoustic / lead only: which string the number row plays
  let inputEnabled = false;
  let hintsEnabled = false;

  function setActiveString(i) {
    if (instrument === 'bass') return;
    activeString = Math.max(0, Math.min(tuning.length - 1, i));
    cells.forEach((c) => c.classList.toggle('active-string', inputEnabled && +c.dataset.string === activeString));
    paintHints();
  }

  function paintHints() {
    cells.forEach((c) => { const h = c.querySelector('.kbd-hint'); if (h) h.textContent = ''; });
    if (!hintsEnabled) return;
    if (instrument === 'bass') {
      BASS_ROWS.forEach((row, stringIndex) => row.forEach((key, fret) => {
        const cell = cells.find((c) => +c.dataset.string === stringIndex && +c.dataset.fret === fret);
        const h = cell?.querySelector('.kbd-hint');
        if (h) h.textContent = key.toUpperCase();
      }));
    } else {
      FRET_KEYS.forEach((key, fret) => {
        const cell = cells.find((c) => +c.dataset.string === activeString && +c.dataset.fret === fret);
        const h = cell?.querySelector('.kbd-hint');
        if (h) h.textContent = key === '0' ? '0' : key;
      });
    }
  }

  function paintHelp() {
    if (!kbdHelp) return;
    if (!hintsEnabled) { kbdHelp.textContent = ''; return; }
    kbdHelp.textContent = instrument === 'bass'
      ? 'ኪቦርድ፡ 1234567890 · QWERTYUIOP · ASDFGHJKL; · ZXCVBNM,./ — string rows, key = fret'
      : '⌨ ↑ / ↓ ይምረጡ string · 0–9 = frets';
  }

  function onKeyDown(e) {
    if (!inputEnabled || e.repeat || shouldIgnoreKeyEvent(e)) return;
    const key = e.key.toLowerCase();

    if (instrument === 'bass') {
      for (let stringIndex = 0; stringIndex < BASS_ROWS.length; stringIndex++) {
        const fret = BASS_ROWS[stringIndex].indexOf(key);
        if (fret === -1) continue;
        const midi = tuning[stringIndex] + fret;
        e.preventDefault();
        flash(midi, stringIndex, fret);
        onHit?.(midi);
        return;
      }
      return;
    }

    if (key === 'arrowup') { e.preventDefault(); setActiveString(activeString - 1); return; }
    if (key === 'arrowdown') { e.preventDefault(); setActiveString(activeString + 1); return; }
    const fret = key === '`' ? 0 : FRET_KEYS.indexOf(key);
    if (fret === -1) return;
    const midi = tuning[activeString] + fret;
    e.preventDefault();
    flash(midi, activeString, fret);
    onHit?.(midi);
  }
  window.addEventListener('keydown', onKeyDown);

  function setInputEnabled(v) { inputEnabled = v; if (instrument !== 'bass') setActiveString(activeString); }
  function setHintsVisible(v) { hintsEnabled = v; paintHints(); paintHelp(); }
  function destroy() { window.removeEventListener('keydown', onKeyDown); }

  return { el: root, keyByMidi: new Map(cells.map(c=>[+c.dataset.midi,c])), highlight, flash, clearLit, focusMidi, setInputEnabled, setHintsVisible, destroy };
}
