const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const neutralPose = {
  palm: { x: 0, y: 0, z: 0 },
  wrist: { x: 0.1, y: 0.1, z: 0 },
  thumb: { x: 0.2, y: 0.2, z: 0 },
  fingers: {
    index: { x: 0.1, y: 0, z: 0 },
    middle: { x: 0.1, y: 0, z: 0 },
    ring: { x: 0.1, y: 0, z: 0 },
    pinky: { x: 0.1, y: 0, z: 0 }
  }
};

export const ASL_GESTURE_LIBRARY = {
  NEUTRAL: {
    ...neutralPose,
    hand: { x: 0.15, y: 0, z: 0 }
  },
  A: {
    palm: { x: 0.3, y: 0.15, z: 0.1 },
    wrist: { x: 0.2, y: 0.2, z: -0.15 },
    thumb: { x: 0.7, y: 0.5, z: 0.3 },
    fingers: {
      index: { x: 1.5, y: 0.05, z: 0.15 },
      middle: { x: 1.5, y: 0.05, z: 0.1 },
      ring: { x: 1.5, y: 0.05, z: 0.05 },
      pinky: { x: 1.5, y: 0.05, z: 0.05 }
    }
  },
  B: {
    palm: { x: 0.15, y: 0, z: 0 },
    wrist: { x: 0.1, y: 0.12, z: 0.05 },
    thumb: { x: 0.25, y: 0.8, z: 0.1 },
    fingers: {
      index: { x: 0.1, y: 0, z: 0 },
      middle: { x: 0.1, y: 0, z: 0 },
      ring: { x: 0.1, y: 0, z: 0 },
      pinky: { x: 0.1, y: 0, z: 0 }
    }
  },
  C: {
    palm: { x: 0.25, y: 0.2, z: 0.3 },
    wrist: { x: 0.5, y: 0.2, z: 0.15 },
    thumb: { x: 0.4, y: 0.9, z: 0.9 },
    fingers: {
      index: { x: 1.2, y: 0.35, z: 0.5 },
      middle: { x: 1.2, y: 0.35, z: 0.5 },
      ring: { x: 1.2, y: 0.35, z: 0.5 },
      pinky: { x: 1.2, y: 0.35, z: 0.45 }
    }
  },
  D: {
    palm: { x: 0.25, y: 0.12, z: 0.05 },
    wrist: { x: 0.2, y: 0.1, z: 0.1 },
    thumb: { x: 0.8, y: 0.6, z: 0.25 },
    fingers: {
      index: { x: 0.1, y: 0, z: 0.15 },
      middle: { x: 1.4, y: 0, z: 0.05 },
      ring: { x: 1.4, y: 0, z: 0.05 },
      pinky: { x: 1.45, y: 0, z: 0.05 }
    }
  },
  E: {
    palm: { x: 0.2, y: 0.2, z: 0.05 },
    wrist: { x: 0.25, y: 0.1, z: -0.05 },
    thumb: { x: 0.9, y: 0.6, z: 0.15 },
    fingers: {
      index: { x: 1.3, y: 0.05, z: 0.1 },
      middle: { x: 1.3, y: 0.05, z: 0.1 },
      ring: { x: 1.3, y: 0.05, z: 0.1 },
      pinky: { x: 1.3, y: 0.05, z: 0.1 }
    }
  },
  F: {
    palm: { x: 0.1, y: 0.05, z: 0.12 },
    wrist: { x: 0.15, y: 0.08, z: 0.15 },
    thumb: { x: 0.5, y: 0.8, z: 0.3 },
    fingers: {
      index: { x: 0.2, y: 0.2, z: 0.1 },
      middle: { x: 0.1, y: 0, z: 0 },
      ring: { x: 0.1, y: 0, z: 0 },
      pinky: { x: 0.1, y: 0, z: 0 }
    }
  },
  G: {
    palm: { x: 0.15, y: 0.1, z: 0.1 },
    wrist: { x: 0.15, y: 0.08, z: 0.15 },
    thumb: { x: 0.7, y: 0.4, z: 0.05 },
    fingers: {
      index: { x: 0.1, y: 0.2, z: 0.15 },
      middle: { x: 1.4, y: 0.05, z: 0.05 },
      ring: { x: 1.4, y: 0.05, z: 0.05 },
      pinky: { x: 1.45, y: 0.05, z: 0.05 }
    }
  },
  H: {
    palm: { x: 0.15, y: 0.06, z: 0 },
    wrist: { x: 0.15, y: 0.08, z: 0 },
    thumb: { x: 0.25, y: 0.4, z: 0.1 },
    fingers: {
      index: { x: 0.1, y: 0, z: 0.2 },
      middle: { x: 0.1, y: 0, z: 0.2 },
      ring: { x: 1.3, y: 0.05, z: 0.05 },
      pinky: { x: 1.3, y: 0.05, z: 0.05 }
    }
  },
  I: {
    palm: { x: 0.1, y: 0.08, z: 0.05 },
    wrist: { x: 0.2, y: 0.12, z: 0 },
    thumb: { x: 1.1, y: 0.3, z: 0.15 },
    fingers: {
      index: { x: 1.35, y: 0.2, z: 0.05 },
      middle: { x: 1.45, y: 0.1, z: 0.05 },
      ring: { x: 1.5, y: 0.1, z: 0.05 },
      pinky: { x: 0.1, y: 0, z: 0.2 }
    }
  },
  J: {
    palm: { x: 0.15, y: 0.15, z: 0.1 },
    wrist: { x: 0.4, y: 0.2, z: 0.35 },
    thumb: { x: 1.1, y: 0.2, z: 0.2 },
    fingers: {
      index: { x: 1.5, y: 0.05, z: 0.05 },
      middle: { x: 1.5, y: 0.05, z: 0.05 },
      ring: { x: 1.5, y: 0.05, z: 0.05 },
      pinky: { x: 0.2, y: 0.25, z: 0.2 }
    }
  },
  K: {
    palm: { x: 0.2, y: 0.1, z: 0.15 },
    wrist: { x: 0.2, y: 0.1, z: 0.2 },
    thumb: { x: 0.8, y: 0.8, z: 0.65 },
    fingers: {
      index: { x: 0.15, y: 0.2, z: 0.35 },
      middle: { x: 0.1, y: 0.4, z: 0.2 },
      ring: { x: 1.35, y: 0.1, z: 0.08 },
      pinky: { x: 1.45, y: 0.1, z: 0.08 }
    }
  },
  L: {
    palm: { x: 0.15, y: 0.2, z: 0.2 },
    wrist: { x: 0.15, y: 0.15, z: 0.2 },
    thumb: { x: 0.2, y: 0.8, z: 0.25 },
    fingers: {
      index: { x: 0.2, y: 0.4, z: 1.1 },
      middle: { x: 1.5, y: 0.1, z: 0.04 },
      ring: { x: 1.5, y: 0.1, z: 0.04 },
      pinky: { x: 1.5, y: 0.1, z: 0.04 }
    }
  },
  M: {
    palm: { x: 0.2, y: 0.12, z: 0.05 },
    wrist: { x: 0.1, y: 0.08, z: 0.1 },
    thumb: { x: 1.1, y: 0.8, z: 0.25 },
    fingers: {
      index: { x: 1.2, y: 0.35, z: 0.05 },
      middle: { x: 1.15, y: 0.25, z: 0.05 },
      ring: { x: 1.1, y: 0.2, z: 0.05 },
      pinky: { x: 1.0, y: 0.15, z: 0.06 }
    }
  },
  N: {
    palm: { x: 0.2, y: 0.12, z: 0.05 },
    wrist: { x: 0.1, y: 0.08, z: 0.1 },
    thumb: { x: 1.0, y: 0.8, z: 0.25 },
    fingers: {
      index: { x: 1.2, y: 0.25, z: 0.05 },
      middle: { x: 1.15, y: 0.2, z: 0.05 },
      ring: { x: 1.25, y: 0.1, z: 0.04 },
      pinky: { x: 1.3, y: 0.1, z: 0.04 }
    }
  },
  O: {
    palm: { x: 0.15, y: 0.15, z: 0.1 },
    wrist: { x: 0.1, y: 0.15, z: 0.15 },
    thumb: { x: 0.9, y: 0.8, z: 0.9 },
    fingers: {
      index: { x: 1.2, y: 0.3, z: 0.45 },
      middle: { x: 1.2, y: 0.3, z: 0.45 },
      ring: { x: 1.2, y: 0.3, z: 0.45 },
      pinky: { x: 1.2, y: 0.3, z: 0.45 }
    }
  },
  P: {
    palm: { x: 0.2, y: 0.08, z: 0.12 },
    wrist: { x: 0.2, y: 0.1, z: 0.12 },
    thumb: { x: 0.8, y: 0.7, z: 1.1 },
    fingers: {
      index: { x: 0.2, y: 0.25, z: 0.2 },
      middle: { x: 1.25, y: 0.1, z: 0.08 },
      ring: { x: 1.35, y: 0.1, z: 0.08 },
      pinky: { x: 1.4, y: 0.1, z: 0.08 }
    }
  },
  Q: {
    palm: { x: 0.2, y: 0.08, z: 0.15 },
    wrist: { x: 0.15, y: 0.1, z: 0.16 },
    thumb: { x: 0.75, y: 0.7, z: 1.15 },
    fingers: {
      index: { x: 0.2, y: 0.3, z: 0.2 },
      middle: { x: 1.25, y: 0.1, z: 0.08 },
      ring: { x: 1.35, y: 0.1, z: 0.08 },
      pinky: { x: 1.4, y: 0.1, z: 0.08 }
    }
  },
  R: {
    palm: { x: 0.12, y: 0.18, z: 0.35 },
    wrist: { x: 0.18, y: 0.08, z: 0.25 },
    thumb: { x: 0.8, y: 0.8, z: 0.1 },
    fingers: {
      index: { x: 0.1, y: 0.65, z: 0.25 },
      middle: { x: 0.1, y: 0.65, z: 0.25 },
      ring: { x: 1.2, y: 0.08, z: 0.04 },
      pinky: { x: 1.3, y: 0.08, z: 0.04 }
    }
  },
  S: {
    palm: { x: 0.2, y: 0.1, z: 0.05 },
    wrist: { x: 0.2, y: 0.12, z: -0.05 },
    thumb: { x: 1.0, y: 0.4, z: 0.2 },
    fingers: {
      index: { x: 1.5, y: 0.1, z: 0.15 },
      middle: { x: 1.5, y: 0.1, z: 0.12 },
      ring: { x: 1.5, y: 0.1, z: 0.12 },
      pinky: { x: 1.5, y: 0.1, z: 0.12 }
    }
  },
  T: {
    palm: { x: 0.15, y: 0.08, z: 0.05 },
    wrist: { x: 0.2, y: 0.1, z: 0.1 },
    thumb: { x: 1.2, y: 0.8, z: 0.1 },
    fingers: {
      index: { x: 1.4, y: 0.15, z: 0.05 },
      middle: { x: 1.35, y: 0.15, z: 0.05 },
      ring: { x: 1.3, y: 0.1, z: 0.04 },
      pinky: { x: 1.3, y: 0.1, z: 0.04 }
    }
  },
  U: {
    palm: { x: 0.12, y: 0.08, z: 0.15 },
    wrist: { x: 0.15, y: 0.08, z: 0.1 },
    thumb: { x: 0.25, y: 0.5, z: 0.1 },
    fingers: {
      index: { x: 0.12, y: 0, z: 0.05 },
      middle: { x: 0.12, y: 0, z: 0.05 },
      ring: { x: 1.25, y: 0.03, z: 0.03 },
      pinky: { x: 1.35, y: 0.03, z: 0.03 }
    }
  },
  V: {
    palm: { x: 0.12, y: 0.08, z: 0.28 },
    wrist: { x: 0.1, y: 0.08, z: 0.15 },
    thumb: { x: 0.3, y: 0.4, z: 0.1 },
    fingers: {
      index: { x: 0.1, y: 0.5, z: 0.2 },
      middle: { x: 0.1, y: 0.45, z: 0.2 },
      ring: { x: 1.2, y: 0.05, z: 0.05 },
      pinky: { x: 1.3, y: 0.05, z: 0.05 }
    }
  },
  W: {
    palm: { x: 0.12, y: 0.08, z: 0.2 },
    wrist: { x: 0.18, y: 0.08, z: 0.15 },
    thumb: { x: 0.25, y: 0.45, z: 0.1 },
    fingers: {
      index: { x: 0.12, y: 0.5, z: 0.15 },
      middle: { x: 0.12, y: 0.45, z: 0.15 },
      ring: { x: 0.12, y: 0.35, z: 0.15 },
      pinky: { x: 1.2, y: 0.04, z: 0.05 }
    }
  },
  X: {
    palm: { x: 0.18, y: 0.15, z: 0.1 },
    wrist: { x: 0.2, y: 0.1, z: 0.1 },
    thumb: { x: 1.1, y: 0.45, z: 0.25 },
    fingers: {
      index: { x: 0.85, y: 0.2, z: 0.2 },
      middle: { x: 1.4, y: 0.1, z: 0.05 },
      ring: { x: 1.5, y: 0.1, z: 0.04 },
      pinky: { x: 1.6, y: 0.1, z: 0.04 }
    }
  },
  Y: {
    palm: { x: 0.2, y: 0.12, z: 0.15 },
    wrist: { x: 0.2, y: 0.1, z: 0.15 },
    thumb: { x: 0.2, y: 0.8, z: 0.1 },
    fingers: {
      index: { x: 1.5, y: 0.1, z: 0.05 },
      middle: { x: 1.5, y: 0.1, z: 0.05 },
      ring: { x: 1.5, y: 0.1, z: 0.05 },
      pinky: { x: 0.1, y: 0.2, z: 0.15 }
    }
  },
  Z: {
    palm: { x: 0.1, y: 0.1, z: 0.18 },
    wrist: { x: 0.15, y: 0.08, z: 0.2 },
    thumb: { x: 0.45, y: 0.55, z: 0.05 },
    fingers: {
      index: { x: 0.15, y: 0.2, z: 0.25 },
      middle: { x: 1.2, y: 0.06, z: 0.04 },
      ring: { x: 1.25, y: 0.06, z: 0.04 },
      pinky: { x: 1.35, y: 0.06, z: 0.04 }
    }
  }
};

function getFingerOrder(letter = '') {
  if (!letter || typeof letter !== 'string') return ['index', 'middle', 'ring', 'pinky'];
  return ['index', 'middle', 'ring', 'pinky'];
}

export function normalizeGestureInput(input = '') {
  const text = String(input || '').replace(/[^A-Za-z]/g, '');
  if (!text) return ['NEUTRAL'];
  return text.toUpperCase().split('').filter(Boolean);
}

export function getASLGesture(letter = '') {
  const key = String(letter || '').trim().toUpperCase();
  if (!key || !ASL_GESTURE_LIBRARY[key]) {
    const fallback = normalizeGestureInput(key)[0] || 'NEUTRAL';
    return ASL_GESTURE_LIBRARY[fallback] || ASL_GESTURE_LIBRARY.NEUTRAL;
  }
  return ASL_GESTURE_LIBRARY[key];
}

export class ASLGestureController {
  constructor(rig) {
    this.rig = rig;
  }

  applySequence(text = '', blend = 1.0, side = 'right') {
    const letters = normalizeGestureInput(text);
    const activeLetter = letters[0] || 'NEUTRAL';
    return this.applyLetter(activeLetter, blend, side);
  }

  applyLetter(letter = 'NEUTRAL', blend = 1.0, side = 'right') {
    if (!this.rig) return;
    const gestureKey = String(letter || '').trim().toUpperCase();
    const safeLetter = gestureKey && ASL_GESTURE_LIBRARY[gestureKey] ? gestureKey : 'NEUTRAL';
    const gesture = getASLGesture(safeLetter);
    const isLeft = side === 'left';
    const wrist = isLeft ? this.rig.lWrist : this.rig.rWrist;
    const shoulder = isLeft ? this.rig.lShoulder : this.rig.rShoulder;
    const elbow = isLeft ? this.rig.lElbow : this.rig.rElbow;
    const thumb = isLeft ? this.rig.lThumb : this.rig.rThumb;
    const fingers = isLeft ? this.rig.lFingers : this.rig.rFingers;
    const poseBlend = clamp(blend, 0, 1);

    if (shoulder) {
      shoulder.rotation.x = shoulder.rotation.x * (1 - poseBlend) + (isLeft ? 0.18 : 0.12) * poseBlend;
      shoulder.rotation.y = shoulder.rotation.y * (1 - poseBlend) + (isLeft ? 0.28 : -0.28) * poseBlend;
      shoulder.rotation.z = shoulder.rotation.z * (1 - poseBlend) + (isLeft ? 0.15 : -0.15) * poseBlend;
    }

    if (elbow) {
      elbow.rotation.x = elbow.rotation.x * (1 - poseBlend) + (isLeft ? 0.45 : 0.5) * poseBlend;
      elbow.rotation.y = elbow.rotation.y * (1 - poseBlend) + (isLeft ? 0.1 : -0.1) * poseBlend;
      elbow.rotation.z = elbow.rotation.z * (1 - poseBlend) + (isLeft ? -0.05 : 0.05) * poseBlend;
    }

    if (wrist) {
      wrist.rotation.x = wrist.rotation.x * (1 - poseBlend) + gesture.wrist.x * poseBlend;
      wrist.rotation.y = wrist.rotation.y * (1 - poseBlend) + (isLeft ? -gesture.wrist.y : gesture.wrist.y) * poseBlend;
      wrist.rotation.z = wrist.rotation.z * (1 - poseBlend) + (isLeft ? -gesture.wrist.z : gesture.wrist.z) * poseBlend;
    }

    if (thumb) {
      thumb.rotation.x = thumb.rotation.x * (1 - poseBlend) + (isLeft ? -gesture.thumb.x : gesture.thumb.x) * poseBlend;
      thumb.rotation.y = thumb.rotation.y * (1 - poseBlend) + (isLeft ? -gesture.thumb.y : gesture.thumb.y) * poseBlend;
      thumb.rotation.z = thumb.rotation.z * (1 - poseBlend) + (isLeft ? -gesture.thumb.z : gesture.thumb.z) * poseBlend;
    }

    const order = getFingerOrder(letter);
    for (let index = 0; index < order.length; index += 1) {
      const fingerName = order[index];
      const target = gesture.fingers[fingerName] || gesture.fingers.index;
      const group = fingers[index];
      if (!group) continue;
      group.rotation.x = group.rotation.x * (1 - poseBlend) + (isLeft ? -target.x : target.x) * poseBlend;
      group.rotation.y = group.rotation.y * (1 - poseBlend) + (isLeft ? -target.y : target.y) * poseBlend;
      group.rotation.z = group.rotation.z * (1 - poseBlend) + (isLeft ? -target.z : target.z) * poseBlend;
    }
  }
}

export function createASLGestureController(rig) {
  return new ASLGestureController(rig);
}
