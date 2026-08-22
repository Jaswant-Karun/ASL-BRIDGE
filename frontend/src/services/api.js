const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function healthCheck() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}

export async function translateText(text, avatarId = 'sarah') {
  const response = await fetch(`${API_URL}/asl/translate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, avatarId })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Translation failed.');
  return result;
}

export async function getAvatars() {
  const response = await fetch(`${API_URL}/asl/animatediff/avatars`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to load avatars.');
  return result;
}

export async function getSignLibrary() {
  const response = await fetch(`${API_URL}/asl/animatediff/library`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to load sign library.');
  return result;
}

export async function generateAnimateDiffAvatar({ text, gloss = [], avatarId = 'sarah', options = {} }) {
  const response = await fetch(`${API_URL}/asl/animatediff/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, gloss, avatarId, options })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Avatar video generation failed.');
  return result;
}

export async function stitchAvatarVideo({ gloss, avatarId = 'sarah', options = {} }) {
  const response = await fetch(`${API_URL}/asl/animatediff/stitch`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ gloss, avatarId, options })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Video stitch failed.');
  return result;
}

export async function processPresentation(file) {
  const response = await fetch(`${API_URL}/presentation/process`, {
    method: 'POST',
    body: (() => {
      const data = new FormData();
      data.append('presentation', file);
      return data;
    })()
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Presentation processing failed.');
  return result;
}

export async function getDatasetLibrary() {
  const response = await fetch(`${API_URL}/asl/dataset`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to load ASL dataset.');
  return result;
}



