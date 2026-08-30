import signs from '../data/aslSigns.json' with { type: 'json' };
import {
  mapGlossToAnimations,
  mapTextToDatasetGestures,
  ASL_DATASET_CHARACTERS
} from '../services/aslService.js';
import { buildAnimateDiffPlan } from '../services/animatediffService.js';
import { translateEnglishToASL } from '../services/aslTranslationService.js';
import { synthesizeSentenceMotion, SIGN_MOTION_LIBRARY } from '../services/motionService.js';
import { predictGesture } from '../services/localModelService.js';
import { detectLanguage, translateMultilingualToASL } from '../services/multilingualService.js';

export async function translateText(request, response, next) {
  try {
    const originalText = String(request.body?.text || '').trim();
    const forcedLang = request.body?.language || null;
    const avatarId = request.body?.avatarId || 'sarah';
    if (!originalText) return response.status(400).json({ error: 'Text is required.' });

    // 1. Language Intelligence: Detect language (Tamil / Hindi / English)
    const detectedLang = forcedLang || detectLanguage(originalText);
    let linguisticResult;
    let gloss;

    if (detectedLang === 'ta' || detectedLang === 'hi') {
      const multiResult = await translateMultilingualToASL(originalText, detectedLang);
      if (multiResult.translatedEnglish) {
        linguisticResult = translateEnglishToASL(multiResult.translatedEnglish);
        linguisticResult.originalText = originalText;
        linguisticResult.translatedEnglish = multiResult.translatedEnglish;
        linguisticResult.detectedLang = detectedLang;
        linguisticResult.langName = multiResult.langName;
        gloss = linguisticResult.glossSequence;
      } else {
        gloss = multiResult.glossSequence;
        linguisticResult = {
          originalText,
          detectedLang,
          langName: multiResult.langName,
          glossSequence: gloss,
          syntaxFormat: `Time-Topic-Comment (${multiResult.langName} -> ASL)`,
          linguisticStructure: { mainClause: gloss },
          nonManualMarkers: gloss.map((t) => ({ token: t, eyebrows: 'NEUTRAL', mouthMorpheme: 'NATURAL_SIGN_MOUTH' }))
        };
      }
    } else {
      linguisticResult = translateEnglishToASL(originalText);
      linguisticResult.detectedLang = 'en';
      linguisticResult.langName = 'English';
      gloss = linguisticResult.glossSequence;
    }

    // Optional external orchestration; local translation remains the default.
    if (process.env.N8N_ENABLED === 'true' && process.env.N8N_WEBHOOK_URL) {
      try {
        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text: originalText, avatarId, language: detectedLang })
        });
        if (n8nResponse.ok) {
          const result = await n8nResponse.json();
          if (Array.isArray(result.gloss)) gloss = result.gloss.map((token) => String(token).toUpperCase());
        }
      } catch (n8nError) {
        console.warn(`n8n fallback: ${n8nError.message}`);
      }
    }

    // Build the dataset mapping before motion so the renderer receives the exact reference sample.
    const datasetGestures = mapTextToDatasetGestures(originalText, gloss);

    // 2. Sign Motion Generation: Synthesize continuous 3D skeletal frames & coarticulation
    const motionPlan = synthesizeSentenceMotion(gloss, 30, datasetGestures);

    // 3. Asset mapping & AnimateDiff Motion Plan
    const mapped = mapGlossToAnimations(signs, gloss);
    const animatediffPlan = buildAnimateDiffPlan(gloss, avatarId);

    // 4. Real ASL Dataset Image Recognition & Gesture Mapping (Letters + Words)
    return response.json({
      originalText,
      language: linguisticResult.detectedLang || 'en',
      languageName: linguisticResult.langName || 'English',
      translatedEnglish: linguisticResult.translatedEnglish || null,
      gloss,
      syntaxFormat: linguisticResult.syntaxFormat,
      linguisticStructure: linguisticResult.linguisticStructure,
      nonManualMarkers: linguisticResult.nonManualMarkers,
      animations: mapped.animations.map(({ path }) => path),
      unsupported: mapped.unsupported,
      motionPlan,
      datasetGestures,
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
    const datasetGestures = mapTextToDatasetGestures('', gloss);
    const motionPlan = synthesizeSentenceMotion(gloss, 30, datasetGestures);
    return response.json(motionPlan);
  } catch (error) {
    return next(error);
  }
}

export async function predictDatasetGesture(request, response, next) {
  try {
    if (!request.file) return response.status(400).json({ error: 'A gesture image is required.' });
    const result = await predictGesture(request.file.buffer, request.file.originalname);
    return response.json({ ...result, model: 'local-knn', dataset: 'Dataset/American' });
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

export function getDatasetLibrary(_request, response) {
  const characters = Object.values(ASL_DATASET_CHARACTERS).map((item) => {
    const lower = item.char.toLowerCase();
    return {
      ...item,
      lowerChar: lower,
      imageUrl: `/dataset-image/${lower}`,
      sampleUrls: [
        `/dataset-image/${lower}?sample=0`,
        `/dataset-image/${lower}?sample=1`,
        `/dataset-image/${lower}?sample=2`,
        `/dataset-image/${lower}?sample=3`
      ]
    };
  });

  return response.json({

    totalCharacters: characters.length,
    characters
  });
}


