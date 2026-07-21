// ─────────────────────────────────────────────────────────────
// KEYMAP GUARDS — shared rules so instrument keyboard shortcuts
// never fight text inputs or browser/OS shortcuts.
// ─────────────────────────────────────────────────────────────

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function shouldIgnoreKeyEvent(e) {
  return e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target);
}
