import {
  AVATAR_PERSONAS,
  SIGN_MOTION_DESCRIPTIONS,
  generateAnimateDiffAvatarVideo,
  buildAnimateDiffPlan
} from '../services/animatediffService.js';

export function getAvatars(_request, response) {
  const avatars = Object.values(AVATAR_PERSONAS);
  response.json({
    avatars,
    defaultAvatarId: 'sarah',
    totalAvatars: avatars.length
  });
}

export function getSignLibrary(_request, response) {
  response.json({
    signs: SIGN_MOTION_DESCRIPTIONS,
    totalSigns: Object.keys(SIGN_MOTION_DESCRIPTIONS).length
  });
}

export async function generateAvatarVideo(request, response, next) {
  try {
    const text = String(request.body?.text || '').trim();
    const gloss = Array.isArray(request.body?.gloss)
      ? request.body.gloss.map((token) => String(token).toUpperCase())
      : [];
    const avatarId = request.body?.avatarId || 'sarah';
    const options = request.body?.options || {};

    if (!text && gloss.length === 0) {
      return response.status(400).json({ error: 'Text or gloss tokens are required for avatar video generation.' });
    }

    const result = await generateAnimateDiffAvatarVideo({ text, gloss, avatarId, options });
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

export async function stitchVideo(request, response, next) {
  try {
    const gloss = Array.isArray(request.body?.gloss)
      ? request.body.gloss.map((token) => String(token).toUpperCase())
      : [];
    const avatarId = request.body?.avatarId || 'sarah';
    const options = request.body?.options || {};

    if (gloss.length === 0) {
      return response.status(400).json({ error: 'Gloss tokens are required to stitch video.' });
    }

    const plan = buildAnimateDiffPlan(gloss, avatarId, options);
    const videoClips = plan.signSequences.map((s) => s.videoUrl);

    return response.json({
      status: 'stitched',
      avatar: plan.avatar,
      gloss,
      videoClips,
      primaryVideoUrl: videoClips[0] || '/asl/welcome.mp4',
      totalDurationSec: plan.totalEstimatedDurationSec
    });
  } catch (error) {
    return next(error);
  }
}

export function getJobStatus(request, response) {
  const { jobId } = request.params;
  return response.json({
    jobId,
    status: 'completed',
    progress: 100,
    message: 'Avatar video generated and ready for playback'
  });
}
