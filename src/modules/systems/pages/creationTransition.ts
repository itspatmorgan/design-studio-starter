// Only the initiating tab carries a creation handoff across the dev server restart.
const key = 'studio:creating-system';
export function beginSystemCreation(name: string) {
  const theme = document.querySelector('.studio-theme') ?? document.documentElement;
  const style = getComputedStyle(theme);
  sessionStorage.setItem(key, JSON.stringify({ name, started: Date.now(), appearance: {
    background: style.getPropertyValue('--background'), foreground: style.getPropertyValue('--foreground'),
    muted: style.getPropertyValue('--muted-foreground'), border: style.getPropertyValue('--border'), font: style.fontFamily,
  } }));
  window.dispatchEvent(new Event('studio:system-creating'));
}
export function openCreatedSystem(id: string) {
  const pending = JSON.parse(sessionStorage.getItem(key) || 'null');
  if (pending) sessionStorage.setItem(key, JSON.stringify({ ...pending, id }));
  // Vite reloads once the new declarations are ready. Change the destination without
  // navigating into the old module graph or starting a competing document load.
  window.history.replaceState(null, '', `/systems/${encodeURIComponent(id)}`);
  window.dispatchEvent(new Event('studio:system-creating'));
}
export function finishSystemCreation(id?: string) {
  window.dispatchEvent(new CustomEvent('studio:system-created', { detail: { id } }));
}
