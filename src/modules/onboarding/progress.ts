// Completion is a browser preference, not contributor registration or setup state.
const completed = new Set<string>();
type StorageSource = () => Pick<Storage, 'getItem' | 'setItem'>;
export function progressKey(base: string) {
  return `design-studio:onboarding:${base}:v1`;
}

export function isComplete(key: string, storage: StorageSource = () => localStorage) {
  if (completed.has(key)) return true;
  try { return storage().getItem(key) === 'complete'; }
  catch { return false; }
}

export function complete(key: string, storage: StorageSource = () => localStorage) {
  completed.add(key);
  try { storage().setItem(key, 'complete'); return true; }
  catch { return false; }
}
