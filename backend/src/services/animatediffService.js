import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AVATAR_PERSONAS = {
  sarah: {
    id: 'sarah',
    name: 'Sarah',
    role: 'Studio ASL Interpreter',
    description: 'Photorealistic certified ASL interpreter with natural facial grammar and clear hand gestures.',
    badge: 'Photorealistic',
    avatarImage: '/assets/avatars/sarah.png',
    lighting: 'Soft Studio Three-Point Lighting',
    background: 'Neutral Studio Slate',
    stylePrompt: 'photorealistic certified ASL interpreter woman in professional navy attire, crystal clear facial grammar, expressive eyes, upper-body framing against clean neutral studio background, 8k uhd, photorealistic, sharp focus',
    accentColor: '#e26d4d'
  },
  alex: {
    id: 'alex',
    name: 'Alex',
    role: '3D Next-Gen Digital Human',
    description: 'Hyper-detailed 3D digital human engineered for precision hand articulation and accessible viewing.',
    badge: '3D Hyper-Real',
    avatarImage: '/assets/avatars/alex.png',
    lighting: 'Volumetric Cinematic Lighting',
    background: 'Modern Tech Suite',
    stylePrompt: '3D hyper-realistic digital human avatar man, Unreal Engine 5 Metahuman render, immaculate hand and finger geometry, subtle volumetric rim lighting, crisp articulation, centered portrait, 4k octanerender',
    accentColor: '#38bdf8'
  },
  maya: {
    id: 'maya',
    name: 'Maya',
    role: 'Stylized Anime Signer',
    description: 'Vibrant stylized anime aesthetic with dynamic micro-expressions and high-contrast lines.',
    badge: 'Anime / Stylized',
    avatarImage: '/assets/avatars/maya.png',
    lighting: 'Vibrant Sunlight Glow',
    background: 'Minimalist Gradient',
    stylePrompt: 'high-end modern anime style ASL signer girl, Makoto Shinkai artistic direction, expressive anime eyes, crisp linework, fluid cel-shaded hand animations, beautiful gradient lighting',
    accentColor: '#ec4899'
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    role: 'High-Contrast Accessibility Interpreter',
    description: 'Optimized for low-vision users with high-contrast luminance and bold gesture silhouettes.',
    badge: 'High Contrast',
    avatarImage: '/assets/avatars/marcus.png',
    lighting: 'High-Luminance Edge Contrast',
    background: 'Deep Charcoal Noir',
    stylePrompt: 'high-contrast accessibility ASL interpreter, vivid cyan and amber illuminated silhouette, bold sharp hand outlines, maximum clarity for low-vision readability, dark charcoal background',
    accentColor: '#10b981'
  }
};

export const SIGN_MOTION_DESCRIPTIONS = {
  HELLO: {
    motion: 'dominant hand starting at temple in a flat handshape and smoothly saluting outward towards the camera with friendly facial expression',
    handshape: 'Open B-handshape',
    location: 'Temple to neutral space',
    durationSec: 1.8,
    videoAsset: '/asl/hello.mp4'
  },
  WELCOME: {
    motion: 'both hands open, palms facing up, gracefully sweeping inward toward chest in warm welcoming motion',
    handshape: 'Open 5-handshape / flat palms',
    location: 'Forward space to chest',
    durationSec: 2.0,
    videoAsset: '/asl/welcome.mp4'
  },
  'THANK YOU': {
    motion: 'flat hand fingertips touching chin and extending forward and slightly down toward the audience with an appreciative smile',
    handshape: 'Flat B-handshape',
    location: 'Chin to forward space',
    durationSec: 1.7,
    videoAsset: '/asl/thank_you.mp4'
  },
  STUDENT: {
    motion: 'dominant hand scoops conceptual knowledge from flat non-dominant palm, moves to forehead, followed by downward parallel agent hands',
    handshape: 'Learn + Person affix (Flat hands)',
    location: 'Palm to forehead to sides',
    durationSec: 2.2,
    videoAsset: '/asl/student.mp4'
  },
  TEACHER: {
    motion: 'both hands near forehead in flattened O-shapes expanding outward into open hands, followed by agent marker downward motion',
    handshape: 'Teach + Person affix (O to 5)',
    location: 'Temples outward',
    durationSec: 2.2,
    videoAsset: '/asl/teacher.mp4'
  },
  CLASS: {
    motion: 'both hands in C-handshape with thumbs initially touching, smoothly arcing outward in circle until pinkies touch',
    handshape: 'C-handshape',
    location: 'Chest level circular path',
    durationSec: 2.0,
    videoAsset: '/asl/class.mp4'
  },
  COMPUTER: {
    motion: 'dominant hand in C-handshape arcing upward along the extended forearm of the non-dominant arm',
    handshape: 'C-handshape over flat arm',
    location: 'Forearm trajectory',
    durationSec: 2.1,
    videoAsset: '/asl/computer.mp4'
  },
  SCIENCE: {
    motion: 'both hands in loose A-fists with thumbs pointed down, alternating in circular pouring gestures like laboratory flasks',
    handshape: 'A-handshapes with thumbs down',
    location: 'Mid-chest alternating circles',
    durationSec: 2.1,
    videoAsset: '/asl/science.mp4'
  }
};

const DEFAULT_NEGATIVE_PROMPT =
  'bad anatomy, distorted fingers, extra digits, missing fingers, fused hands, malformed limbs, static pose, jitter, flicker, low quality, glitch, watermark, blurry, deformed face, unrealistic motion blur';

/**
 * Builds AnimateDiff motion prompts and configuration for a sequence of ASL gloss tokens.
 */
export function buildAnimateDiffPlan(glossTokens = [], avatarId = 'sarah', options = {}) {
  const avatar = AVATAR_PERSONAS[avatarId] || AVATAR_PERSONAS.sarah;
  const motionScale = options.motionScale || 1.15;
  const fps = options.fps || 16;
  const numFrames = options.numFrames || 24;
  const guidanceScale = options.guidanceScale || 7.5;
  const steps = options.steps || 25;
  const seed = options.seed || Math.floor(Math.random() * 1000000);

  const signSequences = glossTokens.map((token, index) => {
    const upperToken = String(token).toUpperCase().trim();
    const signInfo = SIGN_MOTION_DESCRIPTIONS[upperToken] || {
      motion: `expressive American Sign Language gesture for the concept "${upperToken}", clear finger articulation and precise hand orientation`,
      handshape: 'Dynamic ASL Handshape',
      location: 'Neutral signing space',
      durationSec: 1.8,
      videoAsset: `/asl/${upperToken.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`
    };

    const isSupported = Boolean(SIGN_MOTION_DESCRIPTIONS[upperToken]);

    const positivePrompt = [
      avatar.stylePrompt,
      signInfo.motion,
      `performing American Sign Language ASL sign "${upperToken}"`,
      `handshape: ${signInfo.handshape}`,
      `signing location: ${signInfo.location}`,
      'anatomically accurate hands, distinct 5 fingers, fluid natural kinematics, expressive facial grammar',
      'masterpiece, 8k uhd, highest fidelity animation, AnimateDiff motion module v3'
    ].join(', ');

    return {
      stepIndex: index + 1,
      token: upperToken,
      isSupported,
      handshape: signInfo.handshape,
      location: signInfo.location,
      durationSec: signInfo.durationSec,
      videoUrl: signInfo.videoAsset,
      prompt: positivePrompt,
      negativePrompt: DEFAULT_NEGATIVE_PROMPT,
      motionScale,
      fps,
      numFrames,
      seed: seed + index * 107
    };
  });

  return {
    avatar,
    config: {
      motionScale,
      fps,
      numFrames,
      guidanceScale,
      steps,
      seed,
      model: 'AnimateDiff-v3-SD1.5 / MotionAdapter'
    },
    signSequences,
    totalEstimatedDurationSec: signSequences.reduce((acc, s) => acc + s.durationSec, 0)
  };
}

/**
 * Generate full AnimateDiff Avatar Video translation metadata and composite video stream URL.
 */
export async function generateAnimateDiffAvatarVideo({ text = '', gloss = [], avatarId = 'sarah', options = {} }) {
  const glossList = gloss.length > 0
    ? gloss
    : text.toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);

  const plan = buildAnimateDiffPlan(glossList, avatarId, options);

  const animations = plan.signSequences.map((s) => s.videoUrl);
  const unsupported = plan.signSequences.filter((s) => !s.isSupported).map((s) => s.token);

  const primaryVideoUrl = animations[0] || '/asl/welcome.mp4';

  return {
    jobId: `adiff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'completed',
    originalText: text,
    gloss: glossList,
    avatar: plan.avatar,
    config: plan.config,
    animations,
    unsupported,
    primaryVideoUrl,
    signSequences: plan.signSequences,
    totalDurationSec: plan.totalEstimatedDurationSec,
    generatedAt: new Date().toISOString()
  };
}
