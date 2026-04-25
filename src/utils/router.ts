// Simple hash-based router (no react-router-dom dependency needed)
// This avoids npm permission issues

export function getCurrentPath(): string {
  const hash = window.location.hash.replace('#', '') || '/';
  return hash.split('?')[0];
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function onRouteChange(callback: (path: string) => void) {
  window.addEventListener('hashchange', () => callback(getCurrentPath()));
  callback(getCurrentPath());
}
