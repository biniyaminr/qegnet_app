const KEY = 'kinit-school-v2';
const defaults = { completed: {}, scores: {}, current: null, settings: { language: 'am', volume: .9, keyLabels: true }, onboarded: false, installSeen: false };

export function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...structuredClone(defaults), ...saved, settings: { ...defaults.settings, ...(saved.settings || {}) } };
  } catch { return structuredClone(defaults); }
}
export function saveStore(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
export function lessonKey(i, l, id) { return `${i}.${l}.${id}`; }
export function levelProgress(data, i, l, lessons) {
  if (!lessons.length) return 0;
  return lessons.filter(x => data.completed[lessonKey(i, l, x.id)]).length / lessons.length;
}
export function resetStore() { localStorage.removeItem(KEY); }
