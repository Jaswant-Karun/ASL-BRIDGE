import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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
    const rig = buildAvatarRig(scene);
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
  }, []);

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
 * Builds the 3D Digital Human Avatar Rig (Bones, Joints, Shaders) in Three.js
 */
function buildAvatarRig(scene) {
  const root = new THREE.Group();
  scene.add(root);

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5d0b5,
    roughness: 0.4,
    metalness: 0.1
  });

  const clothMaterial = new THREE.MeshStandardMaterial({
    color: 0x183b3a,
    roughness: 0.6,
    metalness: 0.2
  });

  const jointMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6
  });

  const boneMaterial = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });

  // 1. Torso / Upper Body
  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.55, 16);
  const torso = new THREE.Mesh(torsoGeo, clothMaterial);
  torso.position.y = 0;
  root.add(torso);

  // 2. Neck & Head
  const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.12, 12);
  const neck = new THREE.Mesh(neckGeo, skinMaterial);
  neck.position.y = 0.32;
  root.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.48, 0);

  const headGeo = new THREE.SphereGeometry(0.14, 24, 24);
  headGeo.scale(1, 1.2, 1);
  const headMesh = new THREE.Mesh(headGeo, skinMaterial);
  headGroup.add(headMesh);

  // Eyebrows (for Non-Manual ASL Markers)
  const browGeo = new THREE.BoxGeometry(0.06, 0.012, 0.015);
  const browMat = new THREE.MeshBasicMaterial({ color: 0x332211 });

  const leftEyebrow = new THREE.Mesh(browGeo, browMat);
  leftEyebrow.position.set(-0.055, 0.06, 0.13);
  headGroup.add(leftEyebrow);

  const rightEyebrow = new THREE.Mesh(browGeo, browMat);
  rightEyebrow.position.set(0.055, 0.06, 0.13);
  headGroup.add(rightEyebrow);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.02, 12, 12);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.055, 0.02, 0.13);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.055, 0.02, 0.13);
  headGroup.add(rightEye);

  root.add(headGroup);

  // 3. Right Arm (Dominant Signer Arm)
  const rShoulderGroup = new THREE.Group();
  rShoulderGroup.position.set(0.28, 0.22, 0);

  const rUpperArmGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.28, 12);
  rUpperArmGeo.translate(0, -0.14, 0);
  const rUpperArm = new THREE.Mesh(rUpperArmGeo, clothMaterial);
  rShoulderGroup.add(rUpperArm);

  const rElbowGroup = new THREE.Group();
  rElbowGroup.position.set(0, -0.28, 0);

  const rForearmGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.26, 12);
  rForearmGeo.translate(0, -0.13, 0);
  const rForearm = new THREE.Mesh(rForearmGeo, skinMaterial);
  rElbowGroup.add(rForearm);

  const rWristGroup = new THREE.Group();
  rWristGroup.position.set(0, -0.26, 0);

  // Hand Palm & Articulated 5 Fingers
  const palmGeo = new THREE.BoxGeometry(0.07, 0.08, 0.02);
  palmGeo.translate(0, -0.04, 0);
  const rPalm = new THREE.Mesh(palmGeo, skinMaterial);
  rWristGroup.add(rPalm);

  const rFingers = [];
  const fingerOffsets = [-0.024, -0.008, 0.008, 0.024, 0.035];
  for (let f = 0; f < 5; f++) {
    const fGroup = new THREE.Group();
    fGroup.position.set(fingerOffsets[f], -0.08, 0);
    const fGeo = new THREE.CylinderGeometry(0.007, 0.006, 0.06, 8);
    fGeo.translate(0, -0.03, 0);
    const fMesh = new THREE.Mesh(fGeo, skinMaterial);
    fGroup.add(fMesh);
    rWristGroup.add(fGroup);
    rFingers.push(fGroup);
  }

  rElbowGroup.add(rWristGroup);
  rShoulderGroup.add(rElbowGroup);
  root.add(rShoulderGroup);

  // 4. Left Arm (Non-Dominant Arm)
  const lShoulderGroup = new THREE.Group();
  lShoulderGroup.position.set(-0.28, 0.22, 0);

  const lUpperArmGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.28, 12);
  lUpperArmGeo.translate(0, -0.14, 0);
  const lUpperArm = new THREE.Mesh(lUpperArmGeo, clothMaterial);
  lShoulderGroup.add(lUpperArm);

  const lElbowGroup = new THREE.Group();
  lElbowGroup.position.set(0, -0.28, 0);

  const lForearmGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.26, 12);
  lForearmGeo.translate(0, -0.13, 0);
  const lForearm = new THREE.Mesh(lForearmGeo, skinMaterial);
  lElbowGroup.add(lForearm);

  const lWristGroup = new THREE.Group();
  lWristGroup.position.set(0, -0.26, 0);

  const lPalm = new THREE.Mesh(palmGeo.clone(), skinMaterial);
  lWristGroup.add(lPalm);

  const lFingers = [];
  for (let f = 0; f < 5; f++) {
    const fGroup = new THREE.Group();
    fGroup.position.set(fingerOffsets[f], -0.08, 0);
    const fGeo = new THREE.CylinderGeometry(0.007, 0.006, 0.06, 8);
    fGeo.translate(0, -0.03, 0);
    const fMesh = new THREE.Mesh(fGeo, skinMaterial);
    fGroup.add(fMesh);
    lWristGroup.add(fGroup);
    lFingers.push(fGroup);
  }

  lElbowGroup.add(lWristGroup);
  lShoulderGroup.add(lElbowGroup);
  root.add(lShoulderGroup);

  return {
    root,
    head: headGroup,
    leftEyebrow,
    rightEyebrow,
    rShoulder: rShoulderGroup,
    rElbow: rElbowGroup,
    rWrist: rWristGroup,
    rFingers,
    lShoulder: lShoulderGroup,
    lElbow: lElbowGroup,
    lWrist: lWristGroup,
    lFingers,
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

    rig.rShoulder.rotation.x = THREE.MathUtils.lerp(k0.shoulder[0], k1.shoulder[0], smoothT);
    rig.rShoulder.rotation.y = THREE.MathUtils.lerp(k0.shoulder[1], k1.shoulder[1], smoothT);
    rig.rShoulder.rotation.z = THREE.MathUtils.lerp(k0.shoulder[2], k1.shoulder[2], smoothT);

    rig.rElbow.rotation.x = THREE.MathUtils.lerp(k0.elbow[0], k1.elbow[0], smoothT);
    rig.rElbow.rotation.y = THREE.MathUtils.lerp(k0.elbow[1], k1.elbow[1], smoothT);
    rig.rElbow.rotation.z = THREE.MathUtils.lerp(k0.elbow[2], k1.elbow[2], smoothT);

    rig.rWrist.rotation.x = THREE.MathUtils.lerp(k0.wrist[0], k1.wrist[0], smoothT);
    rig.rWrist.rotation.y = THREE.MathUtils.lerp(k0.wrist[1], k1.wrist[1], smoothT);
    rig.rWrist.rotation.z = THREE.MathUtils.lerp(k0.wrist[2], k1.wrist[2], smoothT);
  } else {
    // Rest pose
    rig.rShoulder.rotation.set(0.1, 0, -0.2);
    rig.rElbow.rotation.set(0.4, 0, 0);
  }

  // 4. Non-Dominant (Left) Arm
  if (unit.leftArmKeyframes && unit.leftArmKeyframes.length > 0) {
    const lk0 = unit.leftArmKeyframes[0];
    const lk1 = unit.leftArmKeyframes[unit.leftArmKeyframes.length - 1] || lk0;
    const smoothT = Math.sin(progress * Math.PI * 0.5);

    rig.lShoulder.rotation.x = THREE.MathUtils.lerp(lk0.shoulder[0], lk1.shoulder[0], smoothT);
    rig.lShoulder.rotation.y = THREE.MathUtils.lerp(lk0.shoulder[1], lk1.shoulder[1], smoothT);
    rig.lShoulder.rotation.z = THREE.MathUtils.lerp(lk0.shoulder[2], lk1.shoulder[2], smoothT);

    rig.lElbow.rotation.x = THREE.MathUtils.lerp(lk0.elbow[0], lk1.elbow[0], smoothT);
    rig.lElbow.rotation.y = THREE.MathUtils.lerp(lk0.elbow[1], lk1.elbow[1], smoothT);
    rig.lElbow.rotation.z = THREE.MathUtils.lerp(lk0.elbow[2], lk1.elbow[2], smoothT);
  } else {
    // Relaxed rest position
    rig.lShoulder.rotation.set(0.1, 0, 0.2);
    rig.lElbow.rotation.set(0.3, 0, 0);
  }

  // 5. Finger Joint Flexion / Curls
  if (unit.handshape && rig.rFingers) {
    const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    for (let f = 0; f < 5; f++) {
      const curlArr = unit.handshape[fingers[f]] || [0, 0, 0];
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
