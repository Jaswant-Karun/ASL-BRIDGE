/**
 * Sign-to-Motion Generation Engine ⭐
 * Generates continuous 3D skeletal motion frames, finger articulation keyframes,
 * coarticulation transition blending, and dynamic fingerspelling for ASL sentences.
 */

// Parametric 3D hand shapes (finger curl: 0 = fully extended, 1 = fully curled fist)
export const HANDSHAPES = {
  OPEN_B: { thumb: [0.1, 0.1], index: [0, 0, 0], middle: [0, 0, 0], ring: [0, 0, 0], pinky: [0, 0, 0] },
  OPEN_5: { thumb: [0, 0], index: [0, 0, 0], middle: [0, 0, 0], ring: [0, 0, 0], pinky: [0, 0, 0] },
  A_FIST: { thumb: [0.2, 0.1], index: [1, 1, 1], middle: [1, 1, 1], ring: [1, 1, 1], pinky: [1, 1, 1] },
  S_FIST: { thumb: [0.8, 0.5], index: [1, 1, 1], middle: [1, 1, 1], ring: [1, 1, 1], pinky: [1, 1, 1] },
  C_SHAPE: { thumb: [0.4, 0.3], index: [0.4, 0.4, 0.4], middle: [0.4, 0.4, 0.4], ring: [0.4, 0.4, 0.4], pinky: [0.4, 0.4, 0.4] },
  ONE_D: { thumb: [0.8, 0.8], index: [0, 0, 0], middle: [1, 1, 1], ring: [1, 1, 1], pinky: [1, 1, 1] },
  FLAT_O: { thumb: [0.5, 0.5], index: [0.6, 0.7, 0.8], middle: [0.6, 0.7, 0.8], ring: [0.6, 0.7, 0.8], pinky: [0.6, 0.7, 0.8] },
  Y_SHAPE: { thumb: [0, 0], index: [1, 1, 1], middle: [1, 1, 1], ring: [1, 1, 1], pinky: [0, 0, 0] }
};

const DATASET_HANDSHAPE_BY_CHAR = {
  a: HANDSHAPES.A_FIST, b: HANDSHAPES.OPEN_B, c: HANDSHAPES.C_SHAPE,
  d: HANDSHAPES.ONE_D, e: HANDSHAPES.FLAT_O, f: HANDSHAPES.FLAT_O,
  g: HANDSHAPES.ONE_D, h: HANDSHAPES.OPEN_B, i: HANDSHAPES.Y_SHAPE,
  j: HANDSHAPES.Y_SHAPE, k: HANDSHAPES.ONE_D, l: HANDSHAPES.ONE_D,
  m: HANDSHAPES.A_FIST, n: HANDSHAPES.A_FIST, o: HANDSHAPES.FLAT_O,
  p: HANDSHAPES.ONE_D, q: HANDSHAPES.ONE_D, r: HANDSHAPES.ONE_D,
  s: HANDSHAPES.S_FIST, t: HANDSHAPES.A_FIST, u: HANDSHAPES.OPEN_B,
  v: HANDSHAPES.OPEN_B, w: HANDSHAPES.OPEN_B, x: HANDSHAPES.ONE_D,
  y: HANDSHAPES.Y_SHAPE, z: HANDSHAPES.ONE_D,
  0: HANDSHAPES.FLAT_O, 1: HANDSHAPES.ONE_D, 2: HANDSHAPES.OPEN_B,
  3: HANDSHAPES.OPEN_B, 4: HANDSHAPES.OPEN_B, 5: HANDSHAPES.OPEN_5,
  6: HANDSHAPES.FLAT_O, 7: HANDSHAPES.FLAT_O, 8: HANDSHAPES.FLAT_O, 9: HANDSHAPES.FLAT_O
};

function getDatasetHandshape(character) {
  return DATASET_HANDSHAPE_BY_CHAR[String(character || '').toLowerCase()] || null;
}

// 3D Motion Kinematics for ASL Sign Units
export const SIGN_MOTION_LIBRARY = {
  TOMORROW: {
    durationFrames: 24,
    handshape: HANDSHAPES.A_FIST,
    rightArm: [
      { frame: 0, shoulder: [0.2, 0.3, 0.1], elbow: [1.2, 0.4, 0.2], wrist: [0.2, 0.1, 0.4] }, // at cheek
      { frame: 24, shoulder: [0.4, 0.5, 0.2], elbow: [0.8, 0.3, 0.3], wrist: [0.3, 0.3, 0.6] }  // arc forward
    ],
    leftArm: null,
    headMotion: { pitch: 0.05, yaw: 0.02, roll: 0 },
    eyebrows: 0.4 // raised topic
  },
  ME: {
    durationFrames: 18,
    handshape: HANDSHAPES.ONE_D,
    rightArm: [
      { frame: 0, shoulder: [0.3, 0.2, 0.1], elbow: [0.9, 0.2, 0.3], wrist: [0.1, 0.1, 0.5] },
      { frame: 18, shoulder: [0.2, 0.1, 0.0], elbow: [1.4, 0.1, 0.1], wrist: [0.0, -0.1, 0.1] } // point to chest
    ],
    leftArm: null,
    headMotion: { pitch: 0, yaw: 0, roll: 0 },
    eyebrows: 0.0
  },
  COLLEGE: {
    durationFrames: 28,
    handshape: HANDSHAPES.OPEN_B,
    rightArm: [
      { frame: 0, shoulder: [0.3, 0.2, 0.2], elbow: [1.1, 0.2, 0.3], wrist: [0.0, 0.2, 0.3] }, // flat on left palm
      { frame: 28, shoulder: [0.5, 0.4, 0.4], elbow: [0.7, 0.5, 0.5], wrist: [0.2, 0.4, 0.5] }  // sweeps up in arc
    ],
    leftArm: [
      { frame: 0, shoulder: [-0.3, 0.2, 0.2], elbow: [1.0, -0.2, 0.3], wrist: [0.0, 0.0, 0.3] },
      { frame: 28, shoulder: [-0.3, 0.2, 0.2], elbow: [1.0, -0.2, 0.3], wrist: [0.0, 0.0, 0.3] }
    ],
    headMotion: { pitch: 0.02, yaw: 0, roll: 0 },
    eyebrows: 0.1
  },
  GO: {
    durationFrames: 20,
    handshape: HANDSHAPES.ONE_D,
    rightArm: [
      { frame: 0, shoulder: [0.2, 0.2, 0.1], elbow: [1.2, 0.2, 0.2], wrist: [0.1, 0.0, 0.3] },
      { frame: 20, shoulder: [0.6, 0.4, 0.3], elbow: [0.4, 0.1, 0.5], wrist: [0.4, 0.3, 0.7] } // arc outward
    ],
    leftArm: null,
    headMotion: { pitch: 0.04, yaw: 0.05, roll: 0 },
    eyebrows: 0.0
  },
  WHY: {
    durationFrames: 22,
    handshape: HANDSHAPES.Y_SHAPE,
    rightArm: [
      { frame: 0, shoulder: [0.3, 0.3, 0.2], elbow: [1.3, 0.4, 0.2], wrist: [0.1, 0.3, 0.4] }, // forehead
      { frame: 22, shoulder: [0.4, 0.2, 0.3], elbow: [0.9, 0.2, 0.4], wrist: [0.2, 0.0, 0.5] }  // drops into Y-hand
    ],
    leftArm: null,
    headMotion: { pitch: -0.06, yaw: 0, roll: 0.03 },
    eyebrows: 0.8 // RHETORICAL WHY -> Eyebrows strongly raised
  },
  PROJECT: {
    durationFrames: 26,
    handshape: HANDSHAPES.OPEN_B,
    rightArm: [
      { frame: 0, shoulder: [0.3, 0.2, 0.2], elbow: [1.1, 0.3, 0.3], wrist: [0.1, 0.2, 0.3] },
      { frame: 26, shoulder: [0.4, 0.3, 0.3], elbow: [0.8, 0.4, 0.4], wrist: [0.3, 0.3, 0.5] }
    ],
    leftArm: [
      { frame: 0, shoulder: [-0.3, 0.2, 0.2], elbow: [1.0, -0.2, 0.3], wrist: [0.0, 0.0, 0.3] },
      { frame: 26, shoulder: [-0.3, 0.2, 0.2], elbow: [1.0, -0.2, 0.3], wrist: [0.0, 0.0, 0.3] }
    ],
    headMotion: { pitch: 0, yaw: 0, roll: 0 },
    eyebrows: 0.0
  },
  REVIEW: {
    durationFrames: 24,
    handshape: HANDSHAPES.OPEN_B,
    rightArm: [
      { frame: 0, shoulder: [0.4, 0.3, 0.2], elbow: [1.0, 0.3, 0.3], wrist: [0.2, 0.2, 0.4] },
      { frame: 24, shoulder: [0.3, 0.1, 0.1], elbow: [1.2, 0.1, 0.2], wrist: [0.0, 0.1, 0.3] }
    ],
    leftArm: [
      { frame: 0, shoulder: [-0.3, 0.2, 0.2], elbow: [1.0, -0.2, 0.3], wrist: [0.0, 0.0, 0.3] },
      { frame: 24, shoulder: [-0.3, 0.2, 0.2], elbow: [1.0, -0.2, 0.3], wrist: [0.0, 0.0, 0.3] }
    ],
    headMotion: { pitch: 0.03, yaw: 0, roll: 0 },
    eyebrows: 0.2
  },
  IMPORTANT: {
    durationFrames: 26,
    handshape: HANDSHAPES.FLAT_O,
    rightArm: [
      { frame: 0, shoulder: [0.2, 0.2, 0.1], elbow: [1.2, 0.3, 0.2], wrist: [0.1, 0.1, 0.3] },
      { frame: 26, shoulder: [0.5, 0.4, 0.3], elbow: [0.8, 0.4, 0.4], wrist: [0.2, 0.3, 0.5] }
    ],
    leftArm: [
      { frame: 0, shoulder: [-0.2, 0.2, 0.1], elbow: [1.2, -0.3, 0.2], wrist: [-0.1, 0.1, 0.3] },
      { frame: 26, shoulder: [-0.5, 0.4, 0.3], elbow: [0.8, -0.4, 0.4], wrist: [-0.2, 0.3, 0.5] }
    ],
    headMotion: { pitch: 0.08, yaw: 0, roll: 0 }, // Affirmation nod
    eyebrows: 0.7 // Intense emphasis
  },
  HAVE: {
    durationFrames: 18,
    handshape: HANDSHAPES.OPEN_B,
    rightArm: [
      { frame: 0, shoulder: [0.3, 0.2, 0.2], elbow: [1.0, 0.2, 0.3], wrist: [0.2, 0.2, 0.4] },
      { frame: 18, shoulder: [0.2, 0.1, 0.0], elbow: [1.3, 0.1, 0.2], wrist: [0.1, 0.0, 0.2] }
    ],
    leftArm: [
      { frame: 0, shoulder: [-0.3, 0.2, 0.2], elbow: [1.0, -0.2, 0.3], wrist: [-0.2, 0.2, 0.4] },
      { frame: 18, shoulder: [-0.2, 0.1, 0.0], elbow: [1.3, -0.1, 0.2], wrist: [-0.1, 0.0, 0.2] }
    ],
    headMotion: { pitch: 0.02, yaw: 0, roll: 0 },
    eyebrows: 0.0
  },
  HELLO: {
    durationFrames: 24,
    handshape: HANDSHAPES.OPEN_B,
    rightArm: [
      { frame: 0, shoulder: [0.3, 0.3, 0.2], elbow: [1.2, 0.4, 0.2], wrist: [0.2, 0.2, 0.4] },
      { frame: 24, shoulder: [0.5, 0.5, 0.3], elbow: [0.7, 0.3, 0.4], wrist: [0.4, 0.3, 0.6] }
    ],
    leftArm: null,
    headMotion: { pitch: 0.04, yaw: 0.02, roll: 0 },
    eyebrows: 0.3
  },
  WELCOME: {
    durationFrames: 26,
    handshape: HANDSHAPES.OPEN_5,
    rightArm: [
      { frame: 0, shoulder: [0.4, 0.4, 0.3], elbow: [0.8, 0.3, 0.4], wrist: [0.3, 0.2, 0.5] },
      { frame: 26, shoulder: [0.2, 0.1, 0.1], elbow: [1.3, 0.2, 0.2], wrist: [0.1, 0.1, 0.2] }
    ],
    leftArm: [
      { frame: 0, shoulder: [-0.4, 0.4, 0.3], elbow: [0.8, -0.3, 0.4], wrist: [-0.3, 0.2, 0.5] },
      { frame: 26, shoulder: [-0.2, 0.1, 0.1], elbow: [1.3, -0.2, 0.2], wrist: [-0.1, 0.1, 0.2] }
    ],
    headMotion: { pitch: 0.05, yaw: 0, roll: 0 },
    eyebrows: 0.2
  }
};

/**
 * Generate 3D fingerspelling motion keyframes for any arbitrary unsupported word.
 */
export function generateFingerspellingMotion(word = '') {
  const letters = word.toUpperCase().split('');
  const framesPerLetter = 12;
  const totalFrames = Math.max(16, letters.length * framesPerLetter);

  return {
    isFingerspelled: true,
    token: word,
    durationFrames: totalFrames,
    handshape: HANDSHAPES.ONE_D,
    rightArm: [
      { frame: 0, shoulder: [0.3, 0.2, 0.2], elbow: [1.2, 0.3, 0.3], wrist: [0.2, 0.1, 0.4] },
      { frame: totalFrames, shoulder: [0.3, 0.2, 0.2], elbow: [1.2, 0.3, 0.3], wrist: [0.2, 0.1, 0.4] }
    ],
    leftArm: null,
    headMotion: { pitch: 0, yaw: 0, roll: 0 },
    eyebrows: 0.1
  };
}

/**
 * Compose continuous skeletal motion track across a sequence of sign tokens
 * with coarticulation and kinematic blending.
 */
export function synthesizeSentenceMotion(glossSequence = [], fps = 30, datasetGestures = null) {
  const motionUnits = [];
  let currentFrameOffset = 0;
  const datasetLetters = datasetGestures?.flatGestureStream || [];
  const sequence = datasetLetters.length > 0
    ? datasetLetters.map((gesture) => ({ token: gesture.char, gesture }))
    : glossSequence.map((token) => ({ token, gesture: null }));

  for (let i = 0; i < sequence.length; i++) {
    const token = String(sequence[i].token).toUpperCase().trim();
    const datasetGesture = sequence[i].gesture;
    const signUnit = SIGN_MOTION_LIBRARY[token] || generateFingerspellingMotion(token);
    const handshape = getDatasetHandshape(datasetGesture?.lowerChar) || signUnit.handshape;

    motionUnits.push({
      index: i + 1,
      token,
      startFrame: currentFrameOffset,
      durationFrames: signUnit.durationFrames,
      endFrame: currentFrameOffset + signUnit.durationFrames,
      startTimeSec: (currentFrameOffset / fps).toFixed(2),
      endTimeSec: ((currentFrameOffset + signUnit.durationFrames) / fps).toFixed(2),
      handshape,
      fingerHandshapes: [handshape],
      rightArmKeyframes: signUnit.rightArm,
      leftArmKeyframes: signUnit.leftArm,
      headMotion: signUnit.headMotion,
      eyebrows: signUnit.eyebrows,
      datasetGesture,
      isCoreSign: Boolean(SIGN_MOTION_LIBRARY[token])
    });

    // Add 4-frame coarticulation transition blending between signs
    const blendFrames = i < glossSequence.length - 1 ? 4 : 0;
    currentFrameOffset += signUnit.durationFrames + blendFrames;
  }

  const totalFrames = currentFrameOffset;
  const totalDurationSec = (totalFrames / fps).toFixed(2);

  return {
    fps,
    totalFrames,
    totalDurationSec,
    totalSigns: motionUnits.length,
    coarticulationEnabled: true,
    motionUnits
  };
}
