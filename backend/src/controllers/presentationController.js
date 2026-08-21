import AdmZip from 'adm-zip';
import signs from '../data/aslSigns.json' with { type: 'json' };
import { mapGlossToAnimations } from '../services/aslService.js';

function extractPptxText(buffer) {
  const zip = new AdmZip(buffer);
  return zip.getEntries()
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry.entryName))
    .sort((left, right) => left.entryName.localeCompare(right.entryName, undefined, { numeric: true }))
    .map((entry) => entry.getData().toString('utf8').replace(/<a:t>(.*?)<\/a:t>/g, '$1 ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');
}

export function processPresentation(request, response, next) {
  try {
    const file = request.file;
    if (!file) return response.status(400).json({ error: 'Upload a .pptx presentation.' });
    if (!file.originalname.toLowerCase().endsWith('.pptx')) return response.status(415).json({ error: 'Only .pptx files are supported in this MVP.' });
    const originalText = extractPptxText(file.buffer);
    const gloss = originalText.toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
    const mapped = mapGlossToAnimations(signs, gloss);
    response.json({ fileName: file.originalname, originalText, gloss, animations: mapped.animations.map(({ path }) => path), unsupported: mapped.unsupported });
  } catch (error) {
    next(error);
  }
}
