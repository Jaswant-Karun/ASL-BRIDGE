import { transcribe } from '../services/speechService.js';

export async function transcribeSpeech(request, response, next) {
  try {
    if (!request.file) return response.status(400).json({ error: 'An audio recording is required.' });
    const result = await transcribe(request.file.buffer, request.file.originalname);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}
