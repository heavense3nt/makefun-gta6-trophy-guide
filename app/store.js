// Progress store: the earned set lives in localStorage and can be exported
// to a file and imported back, so progress survives a reload and a device move.
const STORE_KEY = 'leonida-trophy-guide-progress-v1';

function readStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function loadEarned() {
  return readStored();
}

export function saveEarned(earned) {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
}

export function downloadProgress(earned) {
  const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), earned: [...earned] }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

export async function parseProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('not a progress file');
  return new Set(list.filter((n) => typeof n === 'string'));
}
