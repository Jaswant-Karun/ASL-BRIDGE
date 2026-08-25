import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * AnimateDiff 3D Cartoon Motion Video Engine
 * 60 FPS stylized digital human avatar in continuous signing action.
 * Features sentence-driven 3D Head Gestures, 3D Body/Torso Sway,
 * 5-finger articulated 3D Hand Gestures, and resting idle pose on stop.
 */
export default function AnimateDiffMotionVideoEngine({
  avatar = {
    id: 'marcus',
    name: 'Marcus',
    role: 'Accessibility Interpreter',
    badge: 'High Contrast',
    avatarImage: '/assets/avatars/marcus.png',
    accentColor: '#10b981'
  },
  motionPlan = null,
  activeSign = null,
  activeSignIndex = 0,
  isSpeaking = false,
  isPlaying = true,
  playbackRate = 1.0,
  loopSingleSign = false,
  onSignComplete = null,
  datasetGestures = null
}) {
  const mountRef = useRef(null);
  const [cameraView, setCameraView] = useState('studio'); // 'studio' | 'hands' | 'cinematic'
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [currentFrameNum, setCurrentFrameNum] = useState(0);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const characterRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  const totalFrames = motionPlan?.totalFrames || 180;
  const motionUnits = motionPlan?.motionUnits || [];
  const activeMotionUnit = motionUnits.find(
    (unit) => currentFrameNum >= unit.startFrame && currentFrameNum <= unit.endFrame
  ) || motionUnits[activeSignIndex] || null;
  const datasetReference = activeMotionUnit?.datasetGesture ||
    datasetGestures?.flatGestureStream?.[activeSignIndex] || null;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 440;

    // 1. Three.js Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.28, 1.82);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x060e1c, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    mainKeyLight.position.set(2.0, 3.5, 2.5);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-2.5, 2.0, 2.0);
    scene.add(fillLight);

    const rimColor =
      avatar.id === 'alex'
        ? 0x38bdf8
        : avatar.id === 'maya'
        ? 0xec4899
        : avatar.id === 'marcus'
        ? 0x10b981
        : 0xe26d4d;

    const rimLight = new THREE.DirectionalLight(rimColor, 1.4);
    rimLight.position.set(0, 3.0, -2.5);
    scene.add(rimLight);

    // Floor shadow catcher
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x040810,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.02;
    floor.receiveShadow = true;
    scene.add(floor);

    // 5. Build 3D Cartoon Avatar Model
    const charModel = buildCartoonAvatar(scene, avatar);
    characterRef.current = charModel;

    // 6. Interactive 360 Drag Orbit Controls
    const dom = renderer.domElement;
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      dom.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current || !characterRef.current) return;
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      characterRef.current.root.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(0.1, Math.min(0.8, camera.position.y - deltaY * 0.003));
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', handleResize);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [avatar.id]);

  // Camera presets
  useEffect(() => {
    if (!cameraRef.current) return;
    if (cameraView === 'studio') {
      cameraRef.current.position.set(0, 0.28, 1.82);
    } else if (cameraView === 'hands') {
      cameraRef.current.position.set(0.08, 0.16, 1.08);
    } else if (cameraView === 'cinematic') {
      cameraRef.current.position.set(0.25, 0.32, 1.6);
    }
  }, [cameraView]);

  // Main 60 FPS Kinematics & Speech Lip-Sync Animation Loop
  useEffect(() => {
    let frameClock = 0;

    const animateLoop = () => {
      animFrameIdRef.current = requestAnimationFrame(animateLoop);

      if (characterRef.current) {
        const isActivelySigning = isPlaying || isSpeaking;

        if (isActivelySigning) {
          frameClock = (frameClock + playbackRate * 0.8) % Math.max(1, totalFrames);
          const currentFrameInt = Math.floor(frameClock);
          setCurrentFrameNum(currentFrameInt);

          // Find active sign in motion sequence
          const currentUnit =
            motionUnits.find(
              (u) => currentFrameInt >= u.startFrame && currentFrameInt <= u.endFrame
            ) || motionUnits[0];

          // Animate the Cartoon Avatar with full sentence-responsive gestures
          updateCartoonAvatarMotion(
            characterRef.current,
            currentUnit,
            currentFrameInt,
            isSpeaking,
            frameClock,
            showSkeleton,
            activeSign?.token,
            true
          );
        } else {
          // Stopped / Idle Neutral Pose
          frameClock += 0.02;
          updateCartoonAvatarMotion(
            characterRef.current,
            null,
            0,
            false,
            frameClock,
            showSkeleton,
            null,
            false
          );
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animateLoop();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, motionPlan, totalFrames, playbackRate, isSpeaking, showSkeleton, activeSign, datasetGestures]);

  return (
    <div className="motion-video-engine-container">
      {/* 3D WebGL Cartoon Canvas Viewport */}
      <div ref={mountRef} className="motion-canvas-viewport" />
      {datasetReference && (
        <aside className="dataset-reference-panel" aria-label="Dataset gesture reference">
          <span className="dataset-reference-label">DATASET HANDSHAPE</span>
          <strong>{datasetReference.char}</strong>
          <small>{datasetReference.handshape}</small>
          <span className="dataset-match-status">3D SHAPE ACTIVE</span>
        </aside>
      )}

      {/* Cinematic Camera Switcher */}
      <div className="camera-view-bar">
        <div className="cam-buttons">
          <button
            type="button"
            className={`cam-btn ${cameraView === 'studio' ? 'active' : ''}`}
            onClick={() => setCameraView('studio')}
            title="Studio Presenter Framing"
          >
            🎥 Studio View
          </button>
          <button
            type="button"
            className={`cam-btn ${cameraView === 'hands' ? 'active' : ''}`}
            onClick={() => setCameraView('hands')}
            title="Hand & Sign Gesture Close-Up"
          >
            🖐️ Hands Close-Up
          </button>
          <button
            type="button"
            className={`cam-btn ${cameraView === 'cinematic' ? 'active' : ''}`}
            onClick={() => setCameraView('cinematic')}
            title="Cinematic Angle"
          >
            🎬 Cinematic
          </button>
          <button
            type="button"
            className={`cam-btn ${showSkeleton ? 'active' : ''}`}
            onClick={() => setShowSkeleton(!showSkeleton)}
            title="Toggle Skeletal Rig"
          >
            🦴 {showSkeleton ? 'Hide Bones' : 'Show Bones'}
          </button>
        </div>

        <div className="telemetry-tag">
          <span className="live-pulse"></span>
          3D CONTINUOUS MOTION ENGINE (60 FPS)
        </div>
      </div>
    </div>
  );
}

/**
 * Builds a front-facing 3D human presenter with articulated signing limbs.
 */
function buildCartoonAvatar(scene, avatar) {
  const root = new THREE.Group();
  scene.add(root);

  // Persona Cartoon Colors
  let skinTone = 0xf5d0b5;
  let hairColor = 0x2d1810;
  let shirtColor = 0x0284c7; // Vibrant cartoon blue

  if (avatar.id === 'marcus') {
    skinTone = 0x6e432a;
    hairColor = 0x18181b;
    shirtColor = 0x10b981; // Emerald hoodie
  } else if (avatar.id === 'alex') {
    skinTone = 0xf5d0be;
    hairColor = 0x3f2e22;
    shirtColor = 0x38bdf8; // Tech cyan
  } else if (avatar.id === 'maya') {
    skinTone = 0xffe4d6;
    hairColor = 0xb45309; // Auburn anime hair
    shirtColor = 0xec4899; // Vibrant pink
  } else {
    // Sarah
    skinTone = 0xf7d8c6;
    hairColor = 0x3e2723;
    shirtColor = 0xe26d4d; // Warm coral
  }

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: skinTone,
    roughness: 0.3,
    metalness: 0.05
  });

  const clothMaterial = new THREE.MeshStandardMaterial({
    color: shirtColor,
    roughness: 0.45,
    metalness: 0.1
  });

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: hairColor,
    roughness: 0.5
  });

  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x881337 });
  const teethMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // 1. Torso Group
  const torsoGroup = new THREE.Group();
  const torsoGeo = new THREE.CapsuleGeometry(0.21, 0.34, 8, 24);
  const torso = new THREE.Mesh(torsoGeo, clothMaterial);
  torso.position.y = -0.08;
  torso.castShadow = true;
  torso.receiveShadow = true;
  torsoGroup.add(torso);

  const shoulderGeo = new THREE.SphereGeometry(0.16, 24, 16);
  shoulderGeo.scale(1.55, 0.58, 0.8);
  const shoulders = new THREE.Mesh(shoulderGeo, clothMaterial);
  shoulders.position.set(0, 0.2, 0);
  shoulders.castShadow = true;
  torsoGroup.add(shoulders);

  // Hoodie collar
  const collarGeo = new THREE.TorusGeometry(0.12, 0.04, 16, 24);
  collarGeo.rotateX(Math.PI / 2);
  const collar = new THREE.Mesh(collarGeo, clothMaterial);
  collar.position.y = 0.28;
  torsoGroup.add(collar);

  root.add(torsoGroup);

  // 2. Neck
  const neckGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.12, 16);
  const neck = new THREE.Mesh(neckGeo, skinMaterial);
  neck.position.y = 0.33;
  root.add(neck);

  // 3. Expressive Cartoon Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.51, 0);

  const headGeo = new THREE.SphereGeometry(0.165, 32, 32);
  headGeo.scale(1.0, 1.18, 1.05);
  const head = new THREE.Mesh(headGeo, skinMaterial);
  head.castShadow = true;
  headGroup.add(head);

  // Cartoon Ears
  const earGeo = new THREE.SphereGeometry(0.04, 16, 16);
  earGeo.scale(0.5, 1.0, 0.7);

  const leftEar = new THREE.Mesh(earGeo, skinMaterial);
  leftEar.position.set(-0.16, 0.01, -0.01);
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, skinMaterial);
  rightEar.position.set(0.16, 0.01, -0.01);
  headGroup.add(rightEar);

  // Cartoon Hair Styling
  const hairGroup = new THREE.Group();
  const hairBaseGeo = new THREE.SphereGeometry(0.175, 24, 24);
  hairBaseGeo.scale(1.04, 1.15, 1.1);
  const hairBase = new THREE.Mesh(hairBaseGeo, hairMaterial);
  hairBase.position.set(0, 0.04, -0.02);
  hairGroup.add(hairBase);

  // Hair Bangs Tufts
  for (let b = -2; b <= 2; b++) {
    const tuftGeo = new THREE.ConeGeometry(0.045, 0.1, 12);
    tuftGeo.rotateZ(b * 0.2);
    const tuft = new THREE.Mesh(tuftGeo, hairMaterial);
    tuft.position.set(b * 0.04, 0.13, 0.12);
    hairGroup.add(tuft);
  }
  headGroup.add(hairGroup);

  // 4. Big Expressive Cartoon Eyes
  const leftEyeGroup = new THREE.Group();
  leftEyeGroup.position.set(-0.058, 0.03, 0.145);

  const eyeWhiteGeo = new THREE.SphereGeometry(0.026, 20, 20);
  eyeWhiteGeo.scale(1.0, 1.2, 0.5);
  const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  leftEyeGroup.add(leftEyeWhite);

  const irisGeo = new THREE.SphereGeometry(0.014, 16, 16);
  irisGeo.scale(1.0, 1.1, 0.4);
  const leftIris = new THREE.Mesh(irisGeo, irisMat);
  leftIris.position.set(0, 0, 0.016);
  leftEyeGroup.add(leftIris);

  const catchlightGeo = new THREE.SphereGeometry(0.007, 12, 12);
  const leftCatch = new THREE.Mesh(catchlightGeo, highlightMat);
  leftCatch.position.set(0.006, 0.006, 0.022);
  leftEyeGroup.add(leftCatch);

  headGroup.add(leftEyeGroup);

  const rightEyeGroup = leftEyeGroup.clone();
  rightEyeGroup.position.set(0.058, 0.03, 0.145);
  headGroup.add(rightEyeGroup);

  // 5. Cartoon Eyebrows (Dynamic ASL Grammar)
  const browGeo = new THREE.BoxGeometry(0.055, 0.014, 0.025);
  const leftEyebrow = new THREE.Mesh(browGeo, hairMaterial);
  leftEyebrow.position.set(-0.058, 0.085, 0.142);
  headGroup.add(leftEyebrow);

  const rightEyebrow = new THREE.Mesh(browGeo, hairMaterial);
  rightEyebrow.position.set(0.058, 0.085, 0.142);
  headGroup.add(rightEyebrow);

  // 6. Cartoon Animated Mouth (Talking Lip-Sync & Jaw Visemes)
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.07, 0.142);

  const mouthOpenGeo = new THREE.SphereGeometry(0.03, 16, 16);
  mouthOpenGeo.scale(1.3, 0.7, 0.5);
  const mouthOpenMesh = new THREE.Mesh(mouthOpenGeo, mouthMat);
  mouthGroup.add(mouthOpenMesh);

  // Teeth strip
  const teethGeo = new THREE.BoxGeometry(0.04, 0.012, 0.02);
  const teeth = new THREE.Mesh(teethGeo, teethMat);
  teeth.position.set(0, 0.01, 0.01);
  mouthGroup.add(teeth);

  headGroup.add(mouthGroup);
  root.add(headGroup);

  // 7. Right Arm & 5-Finger Hand (Dominant ASL Signing Arm)
  const rShoulder = new THREE.Group();
  rShoulder.position.set(0.28, 0.22, 0.14);

  const upperArmGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.28, 16);
  upperArmGeo.translate(0, -0.14, 0);
  const rUpperArm = new THREE.Mesh(upperArmGeo, clothMaterial);
  rUpperArm.castShadow = true;
  rShoulder.add(rUpperArm);

  const rElbow = new THREE.Group();
  rElbow.position.set(0, -0.28, 0);

  const forearmGeo = new THREE.CylinderGeometry(0.046, 0.038, 0.26, 16);
  forearmGeo.translate(0, -0.13, 0);
  const rForearm = new THREE.Mesh(forearmGeo, skinMaterial);
  rForearm.castShadow = true;
  rElbow.add(rForearm);

  const rWrist = new THREE.Group();
  rWrist.position.set(0, -0.26, 0);

  const palmGeo = new THREE.BoxGeometry(0.08, 0.09, 0.028);
  palmGeo.translate(0, -0.045, 0);
  const rPalm = new THREE.Mesh(palmGeo, skinMaterial);
  rPalm.castShadow = true;
  rWrist.add(rPalm);

  const rFingers = [];
  const fingerOffsets = [-0.028, -0.01, 0.01, 0.028, 0.042];
  for (let f = 0; f < 5; f++) {
    const fGroup = new THREE.Group();
    fGroup.position.set(fingerOffsets[f], -0.09, 0);

    const fGeo = new THREE.CylinderGeometry(0.009, 0.007, 0.07, 10);
    fGeo.translate(0, -0.035, 0);
    const fMesh = new THREE.Mesh(fGeo, skinMaterial);
    fMesh.castShadow = true;
    fGroup.add(fMesh);

    rWrist.add(fGroup);
    rFingers.push(fGroup);
  }

  rElbow.add(rWrist);
  rShoulder.add(rElbow);
  root.add(rShoulder);

  // 8. Left Arm & 5-Finger Hand
  const lShoulder = new THREE.Group();
  lShoulder.position.set(-0.28, 0.22, 0.14);

  const lUpperArm = new THREE.Mesh(upperArmGeo.clone(), clothMaterial);
  lUpperArm.castShadow = true;
  lShoulder.add(lUpperArm);

  const lElbow = new THREE.Group();
  lElbow.position.set(0, -0.28, 0);

  const lForearm = new THREE.Mesh(forearmGeo.clone(), skinMaterial);
  lForearm.castShadow = true;
  lElbow.add(lForearm);

  const lWrist = new THREE.Group();
  lWrist.position.set(0, -0.26, 0);

  const lPalm = new THREE.Mesh(palmGeo.clone(), skinMaterial);
  lPalm.castShadow = true;
  lWrist.add(lPalm);

  const lFingers = [];
  for (let f = 0; f < 5; f++) {
    const fGroup = new THREE.Group();
    fGroup.position.set(fingerOffsets[f], -0.09, 0);

    const fGeo = new THREE.CylinderGeometry(0.009, 0.007, 0.07, 10);
    fGeo.translate(0, -0.035, 0);
    const fMesh = new THREE.Mesh(fGeo, skinMaterial);
    fMesh.castShadow = true;
    fGroup.add(fMesh);

    lWrist.add(fGroup);
    lFingers.push(fGroup);
  }

  lElbow.add(lWrist);
  lShoulder.add(lElbow);
  root.add(lShoulder);

  const legGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.48, 18);
  legGeo.translate(0, -0.24, 0);
  const rightLeg = new THREE.Mesh(legGeo, clothMaterial);
  rightLeg.position.set(0.12, -0.52, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);
  const leftLeg = new THREE.Mesh(legGeo.clone(), clothMaterial);
  leftLeg.position.set(-0.12, -0.52, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const footGeo = new THREE.SphereGeometry(0.105, 18, 12);
  footGeo.scale(1.25, 0.55, 1.65);
  const rightFoot = new THREE.Mesh(footGeo, clothMaterial);
  rightFoot.position.set(0.12, -1.02, 0.04);
  rightFoot.castShadow = true;
  root.add(rightFoot);
  const leftFoot = new THREE.Mesh(footGeo.clone(), clothMaterial);
  leftFoot.position.set(-0.12, -1.02, 0.04);
  leftFoot.castShadow = true;
  root.add(leftFoot);

  const capMaterial = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.55 });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), capMaterial);
  cap.scale.set(1.08, 0.42, 1.02);
  cap.position.set(0, 0.68, 0.005);
  root.add(cap);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.018, 24), capMaterial);
  brim.scale.set(1.2, 1, 0.55);
  brim.position.set(0, 0.62, 0.12);
  root.add(brim);

  if (avatar.id === 'alex' || avatar.id === 'marcus') {
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.7, roughness: 0.2 });
    const lensGeo = new THREE.TorusGeometry(0.04, 0.006, 8, 20);
    [-0.058, 0.058].forEach((x) => {
      const lens = new THREE.Mesh(lensGeo, frameMaterial);
      lens.position.set(x, 0.54, 0.147);
      root.add(lens);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.006, 0.006), frameMaterial);
    bridge.position.set(0, 0.54, 0.147);
    root.add(bridge);
  }

  return {
    root,
    torso: torsoGroup,
    head: headGroup,
    leftEye: leftEyeGroup,
    rightEye: rightEyeGroup,
    leftEyebrow,
    rightEyebrow,
    mouth: mouthGroup,
    rShoulder,
    rElbow,
    rWrist,
    rFingers,
    lShoulder,
    lElbow,
    lWrist,
    lFingers,
    skinMaterial,
    clothMaterial
  };
}

/**
 * 60 FPS Sentence-Responsive Motion Solver (Head + Body + Hands + Idle Pose)
 */
function updateCartoonAvatarMotion(
  char,
  unit,
  frameInt,
  isSpeaking,
  clock,
  showSkeleton,
  currentWordToken,
  isActiveSigning = true
) {
  if (!isActiveSigning) {
    // ==========================================
    // 1. IDLE / STOPPED POSE (Smooth Resting)
    // ==========================================
    // Calm breathing
    char.torso.position.y = Math.sin(clock * 0.04) * 0.008;
    char.torso.rotation.set(0, 0, 0);

    // Relaxed neutral head
    char.head.rotation.set(Math.sin(clock * 0.03) * 0.015, Math.cos(clock * 0.02) * 0.02, 0);

    // Mouth closed in calm gentle posture
    char.mouth.scale.set(0.9, 0.25, 0.6);
    char.mouth.position.y = -0.07;

    // Eyebrows neutral
    char.leftEyebrow.position.y = 0.085;
    char.rightEyebrow.position.y = 0.085;

    // Natural eye blink every few seconds
    const isBlink = Math.sin(clock * 0.03) > 0.97;
    char.leftEye.scale.y = isBlink ? 0.1 : 1.0;
    char.rightEye.scale.y = isBlink ? 0.1 : 1.0;

    // Arms resting naturally at sides
    char.rShoulder.rotation.set(0.12, 0.05, 0.15);
    char.rElbow.rotation.set(0.25, 0, 0);
    char.rWrist.rotation.set(0.08, 0, 0);

    char.lShoulder.rotation.set(0.12, -0.05, -0.15);
    char.lElbow.rotation.set(0.25, 0, 0);
    char.lWrist.rotation.set(0.08, 0, 0);

    // Fingers relaxed
    if (char.rFingers) {
      char.rFingers.forEach((f) => {
        f.rotation.x = 0.2;
      });
    }
    if (char.lFingers) {
      char.lFingers.forEach((f) => {
        f.rotation.x = 0.2;
      });
    }
    return;
  }

  // ==========================================
  // 2. ACTIVE SIGNING & SPEAKING MOTION
  // ==========================================
  const localFrame = frameInt - (unit?.startFrame || 0);
  const duration = unit?.durationFrames || 24;
  const progress = Math.max(0, Math.min(1, localFrame / duration));
  const smoothT = Math.sin(progress * Math.PI * 0.5);
  const handshapeIndex = Math.min(
    Math.max(0, Math.floor(progress * (unit?.fingerHandshapes?.length || 1))),
    Math.max(0, (unit?.fingerHandshapes?.length || 1) - 1)
  );
  const activeHandshape = unit?.fingerHandshapes?.[handshapeIndex] || unit?.handshape;

  // A. Dynamic Body Gestures (Torso Sway, Spine Flexion, Breathing Bounce)
  const bodySwayX = Math.sin(clock * 0.09) * 0.022;
  const bodySwayZ = Math.cos(clock * 0.07) * 0.018;
  char.torso.position.y = Math.sin(clock * 0.08) * 0.016;
  char.torso.rotation.x = bodySwayX * 0.8;
  char.torso.rotation.z = bodySwayZ * 0.9;

  // B. Dynamic Head Gestures (Nods, Grammatical Tilts & Speech Visemes)
  const headNod = Math.sin(clock * 0.14) * 0.06;
  const headTurn = Math.cos(clock * 0.08) * 0.05;

  if (unit?.headMotion) {
    char.head.rotation.x = (unit.headMotion.pitch || 0) * Math.sin(progress * Math.PI) + headNod;
    char.head.rotation.y = (unit.headMotion.yaw || 0) * Math.sin(progress * Math.PI) + headTurn;
  } else {
    char.head.rotation.x = headNod;
    char.head.rotation.y = headTurn;
  }

  // Talking Mouth Lip-Sync Visemes
  if (isSpeaking) {
    const mouthOpen = 0.4 + Math.abs(Math.sin(clock * 0.6)) * 1.6;
    const mouthWidth = 1.0 + Math.sin(clock * 0.4) * 0.35;
    char.mouth.scale.set(mouthWidth, mouthOpen, 1.2);
    char.mouth.position.y = -0.07 - mouthOpen * 0.01;
  } else {
    char.mouth.scale.set(1.0, 0.4, 0.8);
    char.mouth.position.y = -0.07;
  }

  // Eye Blinks
  const isBlinking = Math.sin(clock * 0.04) > 0.96;
  char.leftEye.scale.y = isBlinking ? 0.1 : 1.0;
  char.rightEye.scale.y = isBlinking ? 0.1 : 1.0;

  // Eyebrow ASL Grammar Elevation
  const eyebrowLift = unit?.eyebrows || (Math.sin(clock * 0.1) > 0.4 ? 0.6 : 0.1);
  char.leftEyebrow.position.y = 0.085 + eyebrowLift * 0.035;
  char.rightEyebrow.position.y = 0.085 + eyebrowLift * 0.035;

  // C. Dynamic 3D Hand Gestures & Arm Kinematics (Dominant & Non-Dominant Hands)
  if (unit?.rightArmKeyframes && unit.rightArmKeyframes.length > 0) {
    const k0 = unit.rightArmKeyframes[0];
    const k1 = unit.rightArmKeyframes[unit.rightArmKeyframes.length - 1] || k0;

    char.rShoulder.rotation.x = THREE.MathUtils.lerp(k0.shoulder[0] + 0.45, k1.shoulder[0] + 0.45, smoothT);
    char.rShoulder.rotation.y = THREE.MathUtils.lerp(k0.shoulder[1] + 0.25, k1.shoulder[1] + 0.25, smoothT);
    char.rShoulder.rotation.z = THREE.MathUtils.lerp(k0.shoulder[2] + 0.35, k1.shoulder[2] + 0.35, smoothT);

    char.rElbow.rotation.x = THREE.MathUtils.lerp(k0.elbow[0] + 0.7, k1.elbow[0] + 0.7, smoothT);
    char.rElbow.rotation.y = THREE.MathUtils.lerp(k0.elbow[1], k1.elbow[1], smoothT);
    char.rElbow.rotation.z = THREE.MathUtils.lerp(k0.elbow[2], k1.elbow[2], smoothT);

    char.rWrist.rotation.x = THREE.MathUtils.lerp(k0.wrist[0], k1.wrist[0], smoothT);
    char.rWrist.rotation.y = THREE.MathUtils.lerp(k0.wrist[1], k1.wrist[1], smoothT);
    char.rWrist.rotation.z = THREE.MathUtils.lerp(k0.wrist[2], k1.wrist[2], smoothT);
  } else {
    // Active front-of-chest ASL signing space gesture
    const signSwing = Math.sin(clock * 0.15);
    const signReach = Math.cos(clock * 0.12);

    char.rShoulder.rotation.set(0.7 + signSwing * 0.25, 0.4 + signReach * 0.18, 0.4);
    char.rElbow.rotation.set(1.4 + Math.sin(clock * 0.18) * 0.35, 0.3, 0.35);
    char.rWrist.rotation.set(0.4 + Math.cos(clock * 0.16) * 0.3, 0.2, 0.5 + Math.sin(clock * 0.2) * 0.35);
  }

  // Left Arm ASL Action
  if (unit?.leftArmKeyframes && unit.leftArmKeyframes.length > 0) {
    const lk0 = unit.leftArmKeyframes[0];
    const lk1 = unit.leftArmKeyframes[unit.leftArmKeyframes.length - 1] || lk0;

    char.lShoulder.rotation.x = THREE.MathUtils.lerp(lk0.shoulder[0] + 0.4, lk1.shoulder[0] + 0.4, smoothT);
    char.lShoulder.rotation.y = THREE.MathUtils.lerp(lk0.shoulder[1] - 0.25, lk1.shoulder[1] - 0.25, smoothT);
    char.lShoulder.rotation.z = THREE.MathUtils.lerp(lk0.shoulder[2] - 0.35, lk1.shoulder[2] - 0.35, smoothT);

    char.lElbow.rotation.x = THREE.MathUtils.lerp(lk0.elbow[0] + 0.6, lk1.elbow[0] + 0.6, smoothT);
    char.lElbow.rotation.y = THREE.MathUtils.lerp(lk0.elbow[1], lk1.elbow[1], smoothT);
    char.lElbow.rotation.z = THREE.MathUtils.lerp(lk0.elbow[2], lk1.elbow[2], smoothT);

    char.lWrist.rotation.x = THREE.MathUtils.lerp(lk0.wrist[0], lk1.wrist[0], smoothT);
    char.lWrist.rotation.y = THREE.MathUtils.lerp(lk0.wrist[1], lk1.wrist[1], smoothT);
    char.lWrist.rotation.z = THREE.MathUtils.lerp(lk0.wrist[2], lk1.wrist[2], smoothT);
  } else {
    // Natural supporting arm movement in chest volume
    char.lShoulder.rotation.set(0.45 + Math.sin(clock * 0.08) * 0.15, -0.3, -0.3);
    char.lElbow.rotation.set(0.85 + Math.cos(clock * 0.1) * 0.2, 0.1, -0.15);
    char.lWrist.rotation.set(0.3, 0, -0.25);
  }

  // D. 5-Finger Articulation
  if (char.rFingers) {
    const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    for (let f = 0; f < 5; f++) {
      const curl = activeHandshape?.[fingers[f]]?.[0] ?? (Math.sin(clock * 0.18 + f * 0.8) > 0 ? 0.75 : 0.15);
      if (char.rFingers[f]) {
        char.rFingers[f].rotation.x = curl * (Math.PI * 0.5);
      }
    }
  }

  if (char.lFingers) {
    for (let f = 0; f < 5; f++) {
      if (char.lFingers[f]) {
        char.lFingers[f].rotation.x = 0.25 + Math.sin(clock * 0.12 + f * 0.6) * 0.2;
      }
    }
  }

  // Skeleton Rig
  if (char.skinMaterial && char.clothMaterial) {
    char.skinMaterial.wireframe = showSkeleton;
    char.clothMaterial.wireframe = showSkeleton;
  }
}
