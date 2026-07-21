// ─────────────────────────────────────────────────────────────
// METRONOME — a small stateful ticker. Accents every 6th beat for
// the 6/8 chik-chika feel common in Ethiopian music.
// ─────────────────────────────────────────────────────────────

import { clickTone } from './engine.js';

export class Metronome {
  constructor(onBeat) {
    this.timer = null;
    this.beat = 0;
    this.onBeat = onBeat || (() => {});
    this.beatsPerBar = 6;
  }

  get running() {
    return this.timer !== null;
  }

  start(bpm) {
    this.stop();
    this.beat = 0;
    const tick = () => {
      const accent = this.beat % this.beatsPerBar === 0;
      clickTone(accent);
      this.onBeat(accent, this.beat);
      this.beat++;
    };
    tick();
    this.timer = setInterval(tick, (60 / bpm) * 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
