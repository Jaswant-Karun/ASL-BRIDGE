export function transcribeSpeech(_request, response) {
  response.status(501).json({ error: 'Speech transcription is not configured yet.' });
}
