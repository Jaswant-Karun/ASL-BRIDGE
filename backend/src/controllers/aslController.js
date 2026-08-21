import signs from '../data/aslSigns.json' with { type: 'json' };
import { mapGlossToAnimations } from '../services/aslService.js';

const stopWords = new Set(['A', 'AN', 'THE', 'TO', 'OUR', 'IS', 'ARE', 'OF', 'IN', 'AND']);

function localGloss(text) {
  return text.toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter((token) => token && !stopWords.has(token));
}

export async function translateText(request, response, next) {
  try {
    const originalText = String(request.body?.text || '').trim();
    if (!originalText) return response.status(400).json({ error: 'Text is required.' });

    let gloss = localGloss(originalText);
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: originalText })
        });
        if (!n8nResponse.ok) throw new Error(`n8n returned ${n8nResponse.status}`);
        const result = await n8nResponse.json();
        if (Array.isArray(result.gloss)) gloss = result.gloss.map((token) => String(token).toUpperCase());
      } catch (n8nError) {
        console.warn(`n8n unavailable; using local gloss fallback: ${n8nError.message}`);
      }
    }

    const mapped = mapGlossToAnimations(signs, gloss);
    return response.json({ originalText, gloss, animations: mapped.animations.map(({ path }) => path), unsupported: mapped.unsupported });
  } catch (error) {
    return next(error);
  }
}

export function getSigns(_request, response) {
  response.json(signs);
}

export function mapSigns(request, response) {
  const gloss = Array.isArray(request.body?.gloss)
    ? request.body.gloss.map((token) => String(token).toUpperCase())
    : [];
  const mapped = mapGlossToAnimations(signs, gloss);
  response.json({ gloss, animations: mapped.animations.map(({ path }) => path), unsupported: mapped.unsupported });
}
