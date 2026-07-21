// ─────────────────────────────────────────────────────────────
// AUDIO ENGINE — Web Audio synthesis. All sound is generated live;
// there are zero audio assets, so the whole app works offline.
// A master gain node lets the settings screen control volume.
// ─────────────────────────────────────────────────────────────

import { midiFreq } from '../theory/scales.js';

let AC = null;
let master = null;
let volume = 0.9; // 0..1, persisted by settings

function ctx() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain();
    master.gain.value = volume;
    master.connect(AC.destination);
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

export function unlockAudio() {
  // Call from a user gesture to make sure the context is running.
  return ctx();
}

export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.value = volume;
}

export function getVolume() {
  return volume;
}

export function audioState() {
  return AC ? AC.state : 'unstarted';
}

// Play a single note. Every instrument has its own compact synthesized voice.
export function playNote(midi, tone = 'keys', when = 0, dur = 0.7) {
  const ac = ctx();
  const t = ac.currentTime + when;
  const freq = midiFreq(midi);
  const out = ac.createGain();
  out.connect(master);
  const filt = ac.createBiquadFilter();
  filt.connect(out);

  if (tone === 'bass') {
    const o = ac.createOscillator(); o.type = 'sine';
    const o2 = ac.createOscillator(); o2.type = 'sawtooth';
    o.frequency.value = freq; o2.frequency.value = freq;
    filt.type = 'lowpass'; filt.Q.value = 3; filt.frequency.setValueAtTime(1250,t); filt.frequency.exponentialRampToValueAtTime(260,t+dur);
    const g2 = ac.createGain(); g2.gain.value = 0.16; o2.connect(g2); g2.connect(filt); o.connect(filt);
    out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(0.62, t + 0.008);
    out.gain.exponentialRampToValueAtTime(0.0008, t + dur * 1.7);
    o.start(t); o2.start(t); o.stop(t + dur * 1.5); o2.stop(t + dur * 1.5);
  } else if (tone === 'acoustic' || tone === 'lead') {
    const o = ac.createOscillator(), o2 = ac.createOscillator();
    o.type = tone === 'lead' ? 'sawtooth' : 'triangle'; o2.type = tone === 'lead' ? 'square' : 'sine';
    o.frequency.setValueAtTime(freq * 1.008,t); o.frequency.exponentialRampToValueAtTime(freq,t+.035); o2.frequency.value=freq*2;
    const g2=ac.createGain();g2.gain.value=tone==='lead'?.11:.2;o2.connect(g2);g2.connect(filt);o.connect(filt);
    filt.type='lowpass';filt.Q.value=tone==='lead'?5:2;filt.frequency.setValueAtTime(tone==='lead'?4800:3600,t);filt.frequency.exponentialRampToValueAtTime(tone==='lead'?1000:620,t+dur);
    out.gain.setValueAtTime(.001,t);out.gain.exponentialRampToValueAtTime(tone==='lead'?.38:.5,t+.008);out.gain.exponentialRampToValueAtTime(.0006,t+dur*(tone==='lead'?1.25:1));
    o.start(t);o2.start(t);o.stop(t+dur*1.3);o2.stop(t+dur*1.3);
  } else {
    // keys — clean, rounded
    const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2;
    const g2 = ac.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(filt);
    filt.type = 'lowpass'; filt.frequency.value = 4200;
    out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(0.4, t + 0.012);
    out.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(filt); o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
}

// Short metronome click. accent = downbeat.
export function clickTone(accent) {
  const ac = ctx();
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = 'square';
  o.frequency.value = accent ? 1600 : 1050;
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(0.25, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0005, t + 0.05);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.06);
}
