const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function healthCheck() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}

export async function translateText(text) {
  const response = await fetch(`${API_URL}/asl/translate`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Translation failed.');
  return result;
}

export async function processPresentation(file) {
  const response = await fetch(`${API_URL}/presentation/process`, { method: 'POST', body: (() => { const data = new FormData(); data.append('presentation', file); return data; })() });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Presentation processing failed.');
  return result;
}
