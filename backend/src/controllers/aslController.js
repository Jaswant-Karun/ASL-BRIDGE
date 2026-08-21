import signs from '../data/aslSigns.json' with { type: 'json' };
import { mapGlossToAnimations } from '../services/aslService.js';
import { buildAnimateDiffPlan } from '../services/animatediffService.js';
import { translateEnglishToASL } from '../services/aslTranslationService.js';
import { synthesizeSentenceMotion, SIGN_MOTION_LIBRARY } from '../services/motionService.js';

export async function translateText(request, response, next) {
  try {
    const originalText = String(request.body?.text || '').trim();
    const avatarId = request.body?.avatarId || 'sarah';
    if (!originalText) return response.status(400).json({ error: 'Text is required.' });

    // 1. Language Intelligence: English -> ASL Grammar & Non-Manual Markers
    const linguisticResult = translateEnglishToASL(originalText);
    let gloss = linguisticResult.glossSequence;

    // Optional n8n orchestration hook
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text: originalText, avatarId })
        });
        if (n8nResponse.ok) {
          const result = await n8nResponse.json();
          if (Array.isArray(result.gloss)) gloss = result.gloss.map((token) => String(token).toUpperCase());
        }
      } catch (n8nError) {
        console.warn(`n8n fallback: ${n8nError.message}`);
      }
    }

    // 2. Sign Motion Generation: Synthesize continuous 3D skeletal frames & coarticulation
    const motionPlan = synthesizeSentenceMotion(gloss);

    // 3. Asset mapping & AnimateDiff Motion Plan
    const mapped = mapGlossToAnimations(signs, gloss);
    const animatediffPlan = buildAnimateDiffPlan(gloss, avatarId);

    return response.json({
      originalText,
      gloss,
      syntaxFormat: linguisticResult.syntaxFormat,
      linguisticStructure: linguisticResult.linguisticStructure,
      nonManualMarkers: linguisticResult.nonManualMarkers,
      animations: mapped.animations.map(({ path }) => path),
      unsupported: mapped.unsupported,
      motionPlan,
      animatediff: {
        avatar: animatediffPlan.avatar,
        config: animatediffPlan.config,
        signSequences: animatediffPlan.signSequences,
        totalDurationSec: animatediffPlan.totalEstimatedDurationSec
      }
    });
  } catch (error) {
    return next(error);
  }
}

export function synthesizeMotion(request, response, next) {
  try {
    const gloss = Array.isArray(request.body?.gloss)
      ? request.body.gloss.map((t) => String(t).toUpperCase())
      : [];
    const motionPlan = synthesizeSentenceMotion(gloss);
    return response.json(motionPlan);
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

