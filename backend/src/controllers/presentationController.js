import AdmZip from 'adm-zip';
import signs from '../data/aslSigns.json' with { type: 'json' };
import { mapGlossToAnimations } from '../services/aslService.js';

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPptxSlides(buffer) {
  const zip = new AdmZip(buffer);
  return zip.getEntries()
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry.entryName))
    .sort((left, right) => left.entryName.localeCompare(right.entryName, undefined, { numeric: true }))
    .map((entry, slideIndex) => {
      const xml = entry.getData().toString('utf8');
      const lines = [...xml.matchAll(/<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g)]
        .map((match) => decodeXml([...match[1].matchAll(/<a:t\b[^>]*>([\s\S]*?)<\/a:t>/g)]
          .map((textMatch) => textMatch[1])
          .join(' ')))
        .filter(Boolean);

      return { slideNumber: slideIndex + 1, lines };
    })
    .filter((slide) => slide.lines.length > 0);
}

export function processPresentation(request, response, next) {
  try {
    const file = request.file;
    if (!file) return response.status(400).json({ error: 'Upload a .pptx presentation.' });
    if (!file.originalname.toLowerCase().endsWith('.pptx')) return response.status(415).json({ error: 'Only .pptx files are supported in this MVP.' });
    const slides = extractPptxSlides(file.buffer).map((slide) => ({
      ...slide,
      lines: slide.lines.map((text, lineIndex) => {
        const gloss = text.toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
        const mapped = mapGlossToAnimations(signs, gloss);
        return {
          lineNumber: lineIndex + 1,
          text,
          gloss,
          animations: mapped.animations.map(({ path }) => path),
          unsupported: mapped.unsupported
        };
      })
    }));
    const lines = slides.flatMap((slide) => slide.lines);
    const originalText = lines.map((line) => line.text).join('\n');
    const gloss = lines.flatMap((line) => line.gloss);
    const animations = lines.flatMap((line) => line.animations);
    const unsupported = [...new Set(lines.flatMap((line) => line.unsupported))];
    response.json({ fileName: file.originalname, originalText, gloss, animations, unsupported, slides, lines });
  } catch (error) {
    next(error);
  }
}
