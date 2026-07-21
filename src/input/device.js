// ─────────────────────────────────────────────────────────────
// DEVICE DETECTION — computer-keyboard playing is desktop-only.
// A fine pointer + hover capability implies a mouse/trackpad
// machine; a real touchstart anywhere downgrades us for the rest
// of the session (covers touchscreen laptops reporting "fine").
// ─────────────────────────────────────────────────────────────

let touchSeen = false;
if (typeof window !== 'undefined') {
  window.addEventListener('touchstart', () => { touchSeen = true; }, { passive: true, once: true });
}

export function isDesktopInput() {
  if (touchSeen) return false;
  if (typeof matchMedia !== 'function') return false;
  return matchMedia('(pointer: fine)').matches && matchMedia('(hover: hover)').matches;
}
