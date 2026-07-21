// ─────────────────────────────────────────────────────────────
// THEORY — the four kiñit, note names, and transposition math.
// Pure functions, no DOM. This is the single source of truth for
// every scale, spelling, and pitch computation in the app.
// ─────────────────────────────────────────────────────────────

export const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// The four traditional kiñit, rooted on C. `semis` = semitone offsets
// from the root. `flats` selects flat spelling for display.
export const SCALES = {
  tizita:    { am: 'ትዝታ',   en: 'Tizita',    mood: 'warm · nostalgic',  semis: [0, 2, 4, 7, 9],  flats: false },
  bati:      { am: 'ባቲ',     en: 'Bati',      mood: 'bright · open',     semis: [0, 4, 5, 7, 11], flats: false },
  ambassel:  { am: 'አምባሰል', en: 'Ambassel',  mood: 'solemn · yearning', semis: [0, 1, 5, 7, 8],  flats: true },
  anchihoye: { am: 'አንቺሆዬ', en: 'Anchihoye', mood: 'mystic · haunting', semis: [0, 1, 5, 6, 9],  flats: true },
};

export const SCALE_ORDER = ['tizita', 'bati', 'ambassel', 'anchihoye'];

// Natural roots C D E F G A B, with their pitch classes.
export const ROOTS = [
  { name: 'C', pc: 0 }, { name: 'D', pc: 2 }, { name: 'E', pc: 4 }, { name: 'F', pc: 5 },
  { name: 'G', pc: 7 }, { name: 'A', pc: 9 }, { name: 'B', pc: 11 },
];

export function noteName(pc, flats) {
  return (flats ? FLAT : SHARP)[(((pc % 12) + 12) % 12)];
}

export function midiFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// Pitch classes of a scale at a given root index.
export function scalePcs(scaleKey, rootIdx) {
  const rpc = ROOTS[rootIdx].pc;
  return SCALES[scaleKey].semis.map((iv) => (rpc + iv) % 12);
}

export function rootPc(rootIdx) {
  return ROOTS[rootIdx].pc;
}

// The scale spelled out as note names at a given root, e.g. "G – Ab – C – D – Eb".
export function spellScale(scaleKey, rootIdx) {
  const s = SCALES[scaleKey];
  return s.semis.map((iv) => noteName(rootPc(rootIdx) + iv, s.flats));
}

// MIDI notes for the scale, anchored near C4, optionally with the octave root on top.
export function scaleMidis(scaleKey, rootIdx, withOctave) {
  const base = 60 + rootPc(rootIdx);
  const arr = SCALES[scaleKey].semis.map((iv) => base + iv);
  if (withOctave) arr.push(base + 12);
  return arr;
}
