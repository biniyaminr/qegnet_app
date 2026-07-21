// Small DOM helpers shared across screens.

export function el(tag, className, html) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (html != null) n.innerHTML = html;
  return n;
}

// A styled action button with a click handler.
export function button(label, onClick, { secondary = false, disabled = false } = {}) {
  const b = el('button', 'btn' + (secondary ? ' sec' : ''));
  b.innerHTML = label;
  if (disabled) b.disabled = true;
  b.addEventListener('click', onClick);
  return b;
}

// Bilingual title block: Amharic first, English underneath.
export function bilingual(am, en, { amClass = 'am', enClass = 'en' } = {}) {
  return `<span class="${amClass}">${am}</span><span class="${enClass}">${en}</span>`;
}
