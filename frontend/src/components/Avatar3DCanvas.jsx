import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createASLGestureController } from '../utils/aslGestureController';
import { useAvatarDesign } from '../utils/avatarDesign';

export default function Avatar3DCanvas({
  motionPlan = null,
  activeSignIndex = 0,
  onSignProgress = null,
  playbackSpeed = 1.0,
  isPaused = false
}) {
  const mountRef = useRef(null);
  const [renderMode, setRenderMode] = useState('mesh'); // 'mesh' | 'skeleton' | 'landmarks'
  const [isPlaying, setIsPlaying] = useState(!isPaused);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeToken, setActiveToken] = useState('');
  const [nonManualTag, setNonManualTag] = useState('Neutral');

  // Read saved custom design so the skeletal avatar reflects Character Designer changes
  const customAvatar = useAvatarDesign();

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const avatarRigRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const totalFrames = motionPlan?.totalFrames || 120;
  const motionUnits = motionPlan?.motionUnits || [];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 420;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 2.4);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e0, 1.2);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    // 5. Construct 3D Digital Human Avatar Rig
    const rig = buildAvatarRig(scene, customAvatar);
    rig.gestureController = createASLGestureController(rig);
    avatarRigRef.current = rig;

    // 6. Mouse Orbit Interaction
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current || !avatarRigRef.current?.root) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      avatarRigRef.current.root.rotation.y += deltaX * 0.008;
      avatarRigRef.current.root.rotation.x = Math.max(
        -0.3,
        Math.min(0.3, avatarRigRef.current.root.rotation.x + deltaY * 0.005)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [customAvatar?.customSkinHex, customAvatar?.customOutfitHex]);

  // Main 60 FPS Kinematics Animation Loop
  useEffect(() => {
    let frameCounter = 0;

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      if (isPlaying && motionUnits.length > 0) {
        frameCounter = (frameCounter + playbackSpeed * 0.7) % totalFrames;
        const currentFrameInt = Math.floor(frameCounter);
        setCurrentFrame(currentFrameInt);

        // Find active sign unit in motion plan
        const currentUnit = motionUnits.find(
          (u) => currentFrameInt >= u.startFrame && currentFrameInt <= u.endFrame
        ) || motionUnits[0];

        if (currentUnit) {
          setActiveToken(currentUnit.token);
          setNonManualTag(
            currentUnit.eyebrows > 0.5 ? 'Rhetorical WHY / Raised' : currentUnit.eyebrows > 0 ? 'Topic' : 'Neutral'
          );

          // Apply Kinematics to 3D Avatar Bones
          if (avatarRigRef.current) {
            updateAvatarPose(avatarRigRef.current, currentUnit, currentFrameInt, renderMode);
          }
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isPlaying, motionPlan, totalFrames, playbackSpeed, renderMode]);

  const resetCamera = () => {
    if (avatarRigRef.current?.root) {
      avatarRigRef.current.root.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="avatar-3d-wrapper">
      <div className="avatar-3d-hud-top">
        <div className="hud-badge-group">
          <span className="hud-pill live">
            <span className="live-pulse"></span> 3D SKELETAL AVATAR (60 FPS)
          </span>
          <span className="hud-pill token-tag">{activeToken || 'READY'}</span>
          <span className="hud-pill nmm-tag">NMM: {nonManualTag}</span>
        </div>

        <div className="render-mode-switch">
          <button
            type="button"
            className={`mode-sub-btn ${renderMode === 'mesh' ? 'active' : ''}`}
            onClick={() => setRenderMode('mesh')}
          >
            👤 Mesh
          </button>
          <button
            type="button"
            className={`mode-sub-btn ${renderMode === 'skeleton' ? 'active' : ''}`}
            onClick={() => setRenderMode('skeleton')}
          >
            🦴 Skeleton
          </button>
          <button
            type="button"
            className={`mode-sub-btn ${renderMode === 'landmarks' ? 'active' : ''}`}
            onClick={() => setRenderMode('landmarks')}
          >
            📍 Landmarks
          </button>
          <button type="button" className="mode-sub-btn" onClick={resetCamera} title="Reset 3D View">
            🔄
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="avatar-3d-canvas-container" />

      {/* Playback Controls & Frame Scrubber */}
      <div className="avatar-3d-scrubber">
        <div className="scrub-controls">
          <button
            type="button"
            className="play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <span className="frame-counter-label">
            Frame: {currentFrame} / {totalFrames}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max={Math.max(1, totalFrames - 1)}
          value={currentFrame}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentFrame(Number(e.target.value));
          }}
          className="scrub-slider"
        />
      </div>
    </div>
  );
}

/**
 * Builds the 3D Digital Human Avatar Rig in Three.js matching the reference presenter:
 * Dark styled swept hair, black suit blazer, white collared shirt, denim jeans,
 * expressive face with eyes/eyebrows/smile, and articulated 5-finger hands.
 */
function buildAvatarRig(scene, customAvatar = null) {
  const root = new THREE.Group();
  root.rotation.set(0, 0, 0);
  scene.add(root);

  // Palette matching reference
  const skinHex   = customAvatar?.customSkinHex   || '#f6cbaf';
  const hairHex   = customAvatar?.customHairHex   || '#2d1810';
  const shirtHex  = customAvatar?.customOutfitHex || '#f8fafc';
  const jacketHex = '#16171a';
  const jeansHex  = '#2f7fc1';
  const beltHex   = '#1c1712';

  const SM = (hex, rough = 0.5, metal = 0.0) =>
    new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: rough, metalness: metal });

  const skinMaterial  = SM(skinHex,   0.50, 0.0);
  const hairMaterial  = SM(hairHex,   0.65, 0.05);
  const shirtMaterial = SM(shirtHex,  0.55, 0.0);
  const clothMaterial = SM(jacketHex, 0.60, 0.05);
  const jeansMaterial = SM(jeansHex,  0.70, 0.0);
  const beltMaterial  = SM(beltHex,   0.45, 0.2);
  const buckleM       = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.85 });
  const shoeMaterial  = SM('#18191c', 0.65, 0.1);
  const eyeWhiteMat   = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const irisMat       = new THREE.MeshStandardMaterial({ color: new THREE.Color('#382012'), roughness: 0.25 });
  const pupilM        = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
  const catchM        = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lipMaterial   = SM('#b9635b', 0.48, 0.0);
  const jointMaterial = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 });

  const add = (geo, mat, px=0, py=0, pz=0, rx=0, ry=0, rz=0, sx=1, sy=1, sz=1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(px, py, pz); m.rotation.set(rx, ry, rz); m.scale.set(sx, sy, sz);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  };

  // 1. Legs (Jeans)
  const legGeo = new THREE.CylinderGeometry(0.088, 0.075, 0.52, 20);
  root.add(add(legGeo, jeansMaterial,  0.11, -0.60, 0));
  root.add(add(legGeo, jeansMaterial, -0.11, -0.60, 0));

  // Shoes
  const shoeGeo = new THREE.SphereGeometry(0.088, 16, 12);
  shoeGeo.scale(1.25, 0.52, 1.75);
  root.add(add(shoeGeo, shoeMaterial,  0.11, -0.88, 0.045));
  root.add(add(shoeGeo, shoeMaterial, -0.11, -0.88, 0.045));

  // Belt & Silver Buckle
  const beltRing = new THREE.TorusGeometry(0.222, 0.018, 10, 32);
  root.add(add(beltRing, beltMaterial, 0, -0.33, 0, Math.PI/2, 0, 0));
  const buckleGeo = new THREE.BoxGeometry(0.050, 0.036, 0.014);
  root.add(add(buckleGeo, buckleM, 0, -0.33, 0.224));

  // 2. Torso (White shirt under open black blazer jacket)
  const torsoGroup = new THREE.Group();
  const shirtGeo = new THREE.CylinderGeometry(0.218, 0.202, 0.51, 24);
  torsoGroup.add(add(shirtGeo, shirtMaterial, 0, 0, 0));

  const jacketBackGeo = new THREE.CylinderGeometry(0.236, 0.218, 0.51, 24, 1, false, -Math.PI * 0.72, Math.PI * 1.44);
  torsoGroup.add(add(jacketBackGeo, clothMaterial, 0, 0, 0));

  // Front lapels & open panels
  const lapelGeo = new THREE.BoxGeometry(0.065, 0.24, 0.018);
  torsoGroup.add(add(lapelGeo, clothMaterial, -0.125, 0.11, 0.228, 0, 0.15, 0.16));
  torsoGroup.add(add(lapelGeo, clothMaterial,  0.125, 0.11, 0.228, 0, -0.15, -0.16));

  // White shirt front
  torsoGroup.add(add(new THREE.PlaneGeometry(0.14, 0.32), shirtMaterial, 0, 0.05, 0.226));

  // Tailored shoulders
  const shoulderGeo = new THREE.SphereGeometry(0.168, 24, 16);
  shoulderGeo.scale(1.58, 0.56, 0.88);
  torsoGroup.add(add(shoulderGeo, clothMaterial, 0, 0.24, 0));
  root.add(torsoGroup);

  // 3. Neck & Open Collar
  const neckGeo = new THREE.CylinderGeometry(0.065, 0.078, 0.14, 20);
  root.add(add(neckGeo, skinMaterial, 0, 0.34, 0));

  const collarWingGeo = new THREE.BoxGeometry(0.032, 0.065, 0.008);
  root.add(add(collarWingGeo, shirtMaterial, -0.052, 0.30, 0.07, -0.2, 0.25, -0.35));
  root.add(add(collarWingGeo, shirtMaterial,  0.052, 0.30, 0.07, -0.2, -0.25, 0.35));

  // 4. Head & Face (Facing Forward +Z)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.535, 0);

  const headGeo = new THREE.SphereGeometry(0.150, 32, 32);
  headGeo.scale(0.96, 1.15, 0.98);
  headGroup.add(add(headGeo, skinMaterial, 0, 0, 0));

  // Subtle chin
  const chinGeo = new THREE.SphereGeometry(0.045, 16, 12);
  chinGeo.scale(1.1, 0.60, 0.80);
  headGroup.add(add(chinGeo, skinMaterial, 0, -0.130, 0.035));

  // Ears
  const earGeo = new THREE.SphereGeometry(0.034, 14, 12);
  earGeo.scale(0.35, 1.0, 0.60);
  headGroup.add(add(earGeo, skinMaterial, -0.150, 0.010, -0.010));
  headGroup.add(add(earGeo.clone(), skinMaterial,  0.150, 0.010, -0.010));

  // 3D Nose
  const noseBridgeGeo = new THREE.CylinderGeometry(0.008, 0.014, 0.050, 12);
  headGroup.add(add(noseBridgeGeo, skinMaterial, 0, -0.010, 0.145, -0.25, 0, 0));
  const noseTipGeo = new THREE.SphereGeometry(0.016, 14, 12);
  headGroup.add(add(noseTipGeo, skinMaterial, 0, -0.038, 0.155));

  // Eyes (Forward-facing)
  function makeEye(side) {
    const eg = new THREE.Group();
    eg.position.set(side * 0.055, 0.025, 0.136);
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.022, 18, 14), eyeWhiteMat);
    sclera.scale.set(1.0, 1.15, 0.45);
    eg.add(sclera);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), irisMat);
    iris.scale.set(1.0, 1.08, 0.35); iris.position.set(0, 0, 0.008);
    eg.add(iris);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.0075, 16), pupilM);
    pupil.position.set(0, 0, 0.016);
    eg.add(pupil);
    const clight = new THREE.Mesh(new THREE.CircleGeometry(0.0032, 8), catchM);
    clight.position.set(0.0035, 0.0040, 0.0165);
    eg.add(clight);
    return eg;
  }
  headGroup.add(makeEye(-1));
  headGroup.add(makeEye(1));

  // Eyebrows
  const browGeo = new THREE.BoxGeometry(0.050, 0.009, 0.012);
  const browMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hairHex), roughness: 0.65 });
  const leftEyebrow  = add(browGeo, browMat, -0.055, 0.068, 0.142, 0, 0,  0.08);
  const rightEyebrow = add(browGeo.clone(), browMat,  0.055, 0.068, 0.142, 0, 0, -0.08);
  headGroup.add(leftEyebrow);
  headGroup.add(rightEyebrow);

  // Mouth
  const mouthGeo = new THREE.SphereGeometry(0.026, 16, 8);
  mouthGeo.scale(1.30, 0.48, 0.40);
  headGroup.add(add(mouthGeo, lipMaterial, 0, -0.062, 0.144));

  // Hair - Top and back only
  const hairCapGeo = new THREE.SphereGeometry(0.154, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.42);
  hairCapGeo.scale(1.02, 1.10, 1.04);
  headGroup.add(add(hairCapGeo, hairMaterial, 0, 0.028, -0.015));

  const backHairGeo = new THREE.SphereGeometry(0.152, 24, 18, 0, Math.PI, 0, Math.PI * 0.65);
  headGroup.add(add(backHairGeo, hairMaterial, 0, 0.010, -0.025, 0, -Math.PI / 2, 0));

  // Side-swept bangs across forehead
  headGroup.add(add(new THREE.CylinderGeometry(0.016, 0.010, 0.13, 12), hairMaterial, -0.025, 0.108, 0.118, -0.22, 0.10, -0.40));
  headGroup.add(add(new THREE.CylinderGeometry(0.011, 0.005, 0.09, 12), hairMaterial,  0.045, 0.095, 0.122, -0.18, -0.15, -0.55));
  headGroup.add(add(new THREE.CylinderGeometry(0.018, 0.010, 0.10, 10), hairMaterial, -0.152, -0.005, 0.005));
  headGroup.add(add(new THREE.CylinderGeometry(0.018, 0.010, 0.10, 10), hairMaterial,  0.152, -0.005, 0.005));

  root.add(headGroup);

  // 5. Arms & Articulated Hands (Anatomical Left/Right Rig)
  function buildArm(side) {
    const sGroup = new THREE.Group();
    sGroup.position.set(side * 0.28, 0.22, 0.02);

    const sBallGeo = new THREE.SphereGeometry(0.058, 16, 14);
    sGroup.add(add(sBallGeo, clothMaterial));

    const uaGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.26, 16);
    uaGeo.translate(0, -0.13, 0);
    sGroup.add(add(uaGeo, clothMaterial));

    const eGroup = new THREE.Group();
    eGroup.position.set(0, -0.26, 0);

    const eBallGeo = new THREE.SphereGeometry(0.045, 14, 12);
    eGroup.add(add(eBallGeo, clothMaterial));

    const faGeo = new THREE.CylinderGeometry(0.042, 0.038, 0.16, 16);
    faGeo.translate(0, -0.08, 0);
    eGroup.add(add(faGeo, clothMaterial));

    const cuffGeo = new THREE.CylinderGeometry(0.038, 0.036, 0.038, 16);
    cuffGeo.translate(0, -0.18, 0);
    eGroup.add(add(cuffGeo, shirtMaterial));

    const faSkinGeo = new THREE.CylinderGeometry(0.034, 0.032, 0.048, 14);
    faSkinGeo.translate(0, -0.215, 0);
    eGroup.add(add(faSkinGeo, skinMaterial));

    const wGroup = new THREE.Group();
    wGroup.position.set(0, -0.24, 0);

    const wBallGeo = new THREE.SphereGeometry(0.032, 12, 10);
    wGroup.add(add(wBallGeo, skinMaterial));

    const palmGeo = new THREE.BoxGeometry(0.072, 0.082, 0.022);
    palmGeo.translate(0, -0.041, 0);
    wGroup.add(add(palmGeo, skinMaterial));

    // Thumb (Radial side)
    const thumbGroup = new THREE.Group();
    thumbGroup.position.set(side * 0.034, -0.024, 0.008);
    thumbGroup.rotation.set(0.15, side * 0.30, side * -0.50);
    const thumbMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.0088, 0.0070, 0.055, 10), skinMaterial);
    thumbMesh.position.set(0, -0.028, 0);
    thumbGroup.add(thumbMesh);
    wGroup.add(thumbGroup);

    // 4 Fingers (Index, Middle, Ring, Pinky) - from Radial to Ulnar
    const fingers = [];
    const fingerOffsets = [0.022, 0.007, -0.008, -0.023];
    const fingerLens    = [0.074, 0.080, 0.074, 0.060];
    for (let f = 0; f < 4; f++) {
      const fGroup = new THREE.Group();
      fGroup.position.set(side * fingerOffsets[f], -0.082, 0);
      const fGeo = new THREE.CylinderGeometry(0.0082, 0.0065, fingerLens[f], 10);
      fGeo.translate(0, -fingerLens[f]/2, 0);
      fGroup.add(add(fGeo, skinMaterial));
      wGroup.add(fGroup);
      fingers.push(fGroup);
    }

    eGroup.add(wGroup);
    sGroup.add(eGroup);
    root.add(sGroup);

    return { shoulder: sGroup, elbow: eGroup, wrist: wGroup, thumb: thumbGroup, fingers };
  }

  const rightArm = buildArm( 1);
  const leftArm  = buildArm(-1);

  // Default neutral anatomical rest pose
  rightArm.shoulder.rotation.set(0.04, 0.0, -0.06);
  rightArm.elbow.rotation.set(0.08, 0.0, 0.0);
  rightArm.wrist.rotation.set(0.02, 0.35, 0.0);

  leftArm.shoulder.rotation.set(0.04, 0.0, 0.06);
  leftArm.elbow.rotation.set(0.08, 0.0, 0.0);
  leftArm.wrist.rotation.set(0.02, -0.35, 0.0);

  return {
    root,
    torso: torsoGroup,
    head: headGroup,
    leftEyebrow,
    rightEyebrow,
    rShoulder: rightArm.shoulder,
    rElbow:    rightArm.elbow,
    rWrist:    rightArm.wrist,
    rThumb:    rightArm.thumb,
    rFingers:  rightArm.fingers,
    lShoulder: leftArm.shoulder,
    lElbow:    leftArm.elbow,
    lWrist:    leftArm.wrist,
    lThumb:    leftArm.thumb,
    lFingers:  leftArm.fingers,
    skinMaterial,
    clothMaterial,
    jointMaterial
  };
}

/**
 * Updates 3D Bone Rotations and Non-Manual Blendshapes per frame
 */
function updateAvatarPose(rig, unit, frameInt, renderMode) {
  const localFrame = frameInt - unit.startFrame;
  const progress = Math.max(0, Math.min(1, localFrame / (unit.durationFrames || 24)));

  // 1. Non-Manual Facial Expression (Eyebrow elevation)
  const eyebrowLift = unit.eyebrows || 0;
  rig.leftEyebrow.position.y = 0.06 + eyebrowLift * 0.035;
  rig.rightEyebrow.position.y = 0.06 + eyebrowLift * 0.035;

  // 2. Head Kinematics
  if (unit.headMotion) {
    rig.head.rotation.x = (unit.headMotion.pitch || 0) * Math.sin(progress * Math.PI);
    rig.head.rotation.y = (unit.headMotion.yaw || 0) * Math.sin(progress * Math.PI);
    rig.head.rotation.z = (unit.headMotion.roll || 0);
  }

  // 3. Dominant (Right) Arm Forward Kinematics
  if (unit.rightArmKeyframes && unit.rightArmKeyframes.length > 0) {
    const k0 = unit.rightArmKeyframes[0];
    const k1 = unit.rightArmKeyframes[unit.rightArmKeyframes.length - 1] || k0;
    const smoothT = Math.sin(progress * Math.PI * 0.5);

    rig.rShoulder.rotation.x = THREE.MathUtils.lerp(k0.shoulder[0] + 0.25, k1.shoulder[0] + 0.25, smoothT);
    rig.rShoulder.rotation.y = THREE.MathUtils.lerp(k0.shoulder[1] + 0.15, k1.shoulder[1] + 0.15, smoothT);
    rig.rShoulder.rotation.z = THREE.MathUtils.lerp(k0.shoulder[2] + 0.10, k1.shoulder[2] + 0.10, smoothT);

    rig.rElbow.rotation.x = THREE.MathUtils.lerp(k0.elbow[0] + 0.35, k1.elbow[0] + 0.35, smoothT);
    rig.rElbow.rotation.y = THREE.MathUtils.lerp(k0.elbow[1], k1.elbow[1], smoothT);
    rig.rElbow.rotation.z = THREE.MathUtils.lerp(k0.elbow[2], k1.elbow[2], smoothT);

    rig.rWrist.rotation.x = THREE.MathUtils.lerp(k0.wrist[0], k1.wrist[0], smoothT);
    rig.rWrist.rotation.y = THREE.MathUtils.lerp(k0.wrist[1] + Math.PI - 0.25, k1.wrist[1] + Math.PI - 0.25, smoothT);
    rig.rWrist.rotation.z = THREE.MathUtils.lerp(k0.wrist[2], k1.wrist[2], smoothT);
  } else {
    // Neutral anatomical rest pose
    rig.rShoulder.rotation.set(0.04, 0.0, -0.06);
    rig.rElbow.rotation.set(0.08, 0.0, 0.0);
    rig.rWrist.rotation.set(0.02, 0.35, 0.0);
  }

  // 4. Non-Dominant (Left) Arm
  if (unit.leftArmKeyframes && unit.leftArmKeyframes.length > 0) {
    const lk0 = unit.leftArmKeyframes[0];
    const lk1 = unit.leftArmKeyframes[unit.leftArmKeyframes.length - 1] || lk0;
    const smoothT = Math.sin(progress * Math.PI * 0.5);

    rig.lShoulder.rotation.x = THREE.MathUtils.lerp(lk0.shoulder[0] + 0.20, lk1.shoulder[0] + 0.20, smoothT);
    rig.lShoulder.rotation.y = THREE.MathUtils.lerp(lk0.shoulder[1] - 0.15, lk1.shoulder[1] - 0.15, smoothT);
    rig.lShoulder.rotation.z = THREE.MathUtils.lerp(lk0.shoulder[2] - 0.10, lk1.shoulder[2] - 0.10, smoothT);

    rig.lElbow.rotation.x = THREE.MathUtils.lerp(lk0.elbow[0] + 0.30, lk1.elbow[0] + 0.30, smoothT);
    rig.lElbow.rotation.y = THREE.MathUtils.lerp(lk0.elbow[1], lk1.elbow[1], smoothT);
    rig.lElbow.rotation.z = THREE.MathUtils.lerp(lk0.elbow[2], lk1.elbow[2], smoothT);

    rig.lWrist.rotation.x = THREE.MathUtils.lerp(lk0.wrist[0], lk1.wrist[0], smoothT);
    rig.lWrist.rotation.y = THREE.MathUtils.lerp(lk0.wrist[1] - Math.PI + 0.25, lk1.wrist[1] - Math.PI + 0.25, smoothT);
    rig.lWrist.rotation.z = THREE.MathUtils.lerp(lk0.wrist[2], lk1.wrist[2], smoothT);
  } else {
    // Relaxed neutral anatomical rest position
    rig.lShoulder.rotation.set(0.04, 0.0, 0.06);
    rig.lElbow.rotation.set(0.08, 0.0, 0.0);
    rig.lWrist.rotation.set(0.02, -0.35, 0.0);
  }

  // 5. ASL Letter Pose Mapping: drive the actual finger & wrist articulation
  const rawToken = String(unit?.datasetGesture?.char || unit?.token || 'neutral');
  const letters = rawToken.replace(/[^A-Za-z]/g, '').toUpperCase().split('').filter(Boolean);
  const letter = letters[0] || 'NEUTRAL';
  if (rig.gestureController) {
    const poseBlend = Math.min(1, Math.max(0, progress));
    rig.gestureController.applySequence(letter, poseBlend, 'right');
    rig.gestureController.applySequence(letter, poseBlend * 0.8, 'left');
  } else if (unit.handshape && rig.rFingers) {
    const fallbackFingers = ['index', 'middle', 'ring', 'pinky'];
    for (let f = 0; f < fallbackFingers.length; f++) {
      const curlArr = unit.handshape[fallbackFingers[f]] || [0, 0, 0];
      const curlAmount = curlArr[0] || 0;
      if (rig.rFingers[f]) {
        rig.rFingers[f].rotation.x = curlAmount * (Math.PI * 0.45);
      }
    }
  }

  // 6. Shader / Render Mode styling
  if (rig.skinMaterial && rig.clothMaterial) {
    const isWireframe = renderMode === 'skeleton';
    rig.skinMaterial.wireframe = isWireframe;
    rig.clothMaterial.wireframe = isWireframe;
  }
}
