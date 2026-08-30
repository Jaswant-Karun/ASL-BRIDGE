import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
  const gltfModelRef = useRef(null);
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
    const modelUrl = avatar.modelUrl || import.meta.env.VITE_AVATAR_GLB_URL;
    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => {
        if (!container.isConnected) return;
        gltf.scene.traverse((object) => {
          if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
        });
        gltf.scene.position.set(0, -1.02, 0);
        gltf.scene.scale.setScalar(avatar.modelScale || 1);
        scene.add(gltf.scene);
        gltfModelRef.current = gltf.scene;
        charModel.root.visible = false;
      }, undefined, (loadError) => {
        console.warn(`GLB avatar unavailable; using procedural avatar fallback: ${loadError.message}`);
      });
    }

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
      if (gltfModelRef.current) {
        gltfModelRef.current.traverse((object) => {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material?.dispose();
        });
        scene.remove(gltfModelRef.current);
        gltfModelRef.current = null;
      }
    };
  }, [avatar.id, avatar.customSkinHex, avatar.customOutfitHex, avatar.customHairHex]);

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
          updateRiggedAvatarMotion(gltfModelRef.current, activeMotionUnit, currentFrameNum);
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
 * Builds a photorealistic-style animated human presenter for ASL signing.
 * Matches the reference: realistic face, dark styled hair, black jacket,
 * white shirt, jeans, and anatomically correct forward-facing 5-finger hands.
 */
function buildCartoonAvatar(scene, avatar) {
  const root = new THREE.Group();
  root.rotation.set(0, 0, 0);
  scene.add(root);

  // ─── Colour palette ──────────────────────────────────────────────────────
  let skinHex   = '#f6cbaf';  // natural warm peach skin
  let hairHex   = '#2d1810';  // rich espresso dark brown hair
  let shirtHex  = '#f8fafc';  // crisp white shirt
  let jacketHex = '#16171a';  // tailored black suit jacket/blazer
  let jeansHex  = '#2f7fc1';  // vibrant classic medium denim blue
  let beltHex   = '#1c1712';  // dark leather belt
  let shoeHex   = '#18191c';  // dark shoes

  if (avatar.customSkinHex) {
    skinHex   = avatar.customSkinHex;
    hairHex   = avatar.customHairHex   || '#2d1810';
    shirtHex  = avatar.customOutfitHex || '#f8fafc';
    jacketHex = '#16171a';
  } else if (avatar.id === 'marcus') {
    skinHex  = '#7a4a28'; hairHex = '#0d0a08'; shirtHex = '#f8fafc'; jacketHex = '#16171a'; jeansHex = '#2f7fc1';
  } else if (avatar.id === 'maya') {
    skinHex  = '#ffe0cc'; hairHex = '#8b4513'; shirtHex = '#fce4ec'; jacketHex = '#2a1520'; jeansHex = '#3b6ea5';
  } else if (avatar.id === 'alex') {
    skinHex  = '#f6cbaf'; hairHex = '#2d1810'; shirtHex = '#f8fafc'; jacketHex = '#16171a'; jeansHex = '#2f7fc1';
  }

  const SM = (hex, rough = 0.45, metal = 0.0) =>
    new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: rough, metalness: metal });

  const skin     = SM(skinHex,   0.50, 0.0);
  const hairMat  = SM(hairHex,   0.65, 0.05);
  const shirt    = SM(shirtHex,  0.55, 0.0);
  const jacket   = SM(jacketHex, 0.60, 0.05);
  const jeans    = SM(jeansHex,  0.70, 0.0);
  const beltMat  = SM(beltHex,   0.45, 0.2);
  const buckleM  = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.85 });
  const shoeMat  = SM(shoeHex,   0.65, 0.1);
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const irisMat  = new THREE.MeshStandardMaterial({ color: new THREE.Color('#382012'), roughness: 0.25 });
  const pupilM   = new THREE.MeshBasicMaterial({ color: 0x080808 });
  const catchM   = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lipMat   = SM('#b9635b', 0.48, 0.0);
  const teethMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const lashMat  = new THREE.MeshBasicMaterial({ color: 0x141414 });

  const add = (geo, mat, px=0, py=0, pz=0, rx=0, ry=0, rz=0, sx=1, sy=1, sz=1) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(px, py, pz);
    m.rotation.set(rx, ry, rz);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  // ─── 1. LEGS (Jeans) ─────────────────────────────────────────────────────
  const legGeo = new THREE.CylinderGeometry(0.088, 0.076, 0.52, 20);
  const rLeg = add(legGeo, jeans,  0.11, -0.60, 0); root.add(rLeg);
  const lLeg = add(legGeo, jeans, -0.11, -0.60, 0); root.add(lLeg);

  // ─── 2. SHOES ────────────────────────────────────────────────────────────
  const shoeGeo = new THREE.SphereGeometry(0.088, 16, 12);
  shoeGeo.scale(1.25, 0.52, 1.75);
  const rShoe = add(shoeGeo, shoeMat,  0.11, -0.88, 0.04); root.add(rShoe);
  const lShoe = add(shoeGeo, shoeMat, -0.11, -0.88, 0.04); root.add(lShoe);

  // ─── 3. BELT & BUCKLE ────────────────────────────────────────────────────
  const beltRing = new THREE.TorusGeometry(0.21, 0.016, 8, 32);
  const belt = add(beltRing, beltMat, 0, -0.33, 0, Math.PI/2, 0, 0);
  root.add(belt);

  // Silver buckle
  const buckleGeo = new THREE.BoxGeometry(0.048, 0.034, 0.012);
  const buckle = add(buckleGeo, buckleM, 0, -0.33, 0.212);
  root.add(buckle);

  // ─── 4. TORSO — White Shirt under Open Black Suit Blazer ─────────────────
  const torsoGroup = new THREE.Group();

  // White shirt body
  const shirtGeo = new THREE.CylinderGeometry(0.21, 0.19, 0.48, 24);
  torsoGroup.add(add(shirtGeo, shirt, 0, 0, 0));

  // Open black blazer jacket (surrounding back and sides, open in front)
  const jacketBackGeo = new THREE.CylinderGeometry(0.226, 0.206, 0.48, 24, 1, false, -Math.PI * 0.65, Math.PI * 1.30);
  torsoGroup.add(add(jacketBackGeo, jacket, 0, 0, 0));

  // Jacket notch lapels (neat black folded collar along chest sides)
  const lapelGeo = new THREE.BoxGeometry(0.042, 0.26, 0.012);
  const lapelL = add(lapelGeo, jacket, -0.11, 0.09, 0.212, 0, 0.12, 0.14);
  const lapelR = add(lapelGeo, jacket,  0.11, 0.09, 0.212, 0, -0.12, -0.14);
  torsoGroup.add(lapelL);
  torsoGroup.add(lapelR);

  // Visible white shirt front with central placket
  const shirtFront = add(new THREE.PlaneGeometry(0.13, 0.32), shirt, 0, 0.04, 0.210);
  torsoGroup.add(shirtFront);

  // Shirt buttons
  const buttonGeo = new THREE.SphereGeometry(0.006, 8, 8);
  const buttonMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
  [-0.07, 0.0, 0.07, 0.13].forEach((y) => {
    torsoGroup.add(add(buttonGeo, buttonMat, 0, y, 0.212));
  });

  // Rounded smooth shoulder caps connecting into sleeves
  const shoulderGeo = new THREE.SphereGeometry(0.12, 20, 16);
  shoulderGeo.scale(1.4, 0.7, 0.9);
  torsoGroup.add(add(shoulderGeo, jacket,  0.24, 0.20, 0));
  torsoGroup.add(add(shoulderGeo.clone(), jacket, -0.24, 0.20, 0));

  torsoGroup.position.set(0, 0, 0);
  root.add(torsoGroup);

  // ─── 5. NECK & OPEN V-COLLAR ─────────────────────────────────────────────
  const neckGeo = new THREE.CylinderGeometry(0.065, 0.078, 0.14, 20);
  root.add(add(neckGeo, skin, 0, 0.34, 0));

  // Open V-neck shirt collar
  const collarBand = add(new THREE.TorusGeometry(0.082, 0.012, 8, 24, Math.PI * 1.3), shirt, 0, 0.33, -0.01, Math.PI/2, 0, Math.PI*0.35);
  root.add(collarBand);
  const collarWingGeo = new THREE.BoxGeometry(0.032, 0.065, 0.008);
  root.add(add(collarWingGeo, shirt, -0.052, 0.30, 0.07, -0.2, 0.25, -0.35));
  root.add(add(collarWingGeo, shirt,  0.052, 0.30, 0.07, -0.2, -0.25, 0.35));

  // ─── 6. HEAD & EXPRESSIVE FACE (Facing camera +Z) ────────────────────────
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.535, 0);

  // Head base — smooth stylized human head
  const headGeo = new THREE.SphereGeometry(0.150, 32, 32);
  headGeo.scale(0.96, 1.15, 0.98);
  headGroup.add(add(headGeo, skin, 0, 0, 0));

  // Subtle chin contour
  const chinGeo = new THREE.SphereGeometry(0.045, 16, 12);
  chinGeo.scale(1.1, 0.60, 0.80);
  headGroup.add(add(chinGeo, skin, 0, -0.130, 0.035));

  // Ears
  const earGeo = new THREE.SphereGeometry(0.034, 14, 12);
  earGeo.scale(0.35, 1.0, 0.60);
  headGroup.add(add(earGeo, skin, -0.150, 0.010, -0.010));
  headGroup.add(add(earGeo.clone(), skin,  0.150, 0.010, -0.010));

  // 3D Nose with bridge and tip
  const noseBridgeGeo = new THREE.CylinderGeometry(0.008, 0.014, 0.050, 12);
  headGroup.add(add(noseBridgeGeo, skin, 0, -0.010, 0.145, -0.25, 0, 0));
  const noseTipGeo = new THREE.SphereGeometry(0.016, 14, 12);
  headGroup.add(add(noseTipGeo, skin, 0, -0.038, 0.155));

  // ─── Eyes (Large, expressive, facing forward +Z) ─────────────────────────
  function makeEye(side) {
    const eg = new THREE.Group();
    eg.position.set(side * 0.055, 0.025, 0.136);

    // White sclera
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.022, 18, 14), eyeWhite);
    sclera.scale.set(1.0, 1.15, 0.45);
    eg.add(sclera);

    // Warm rich dark-brown iris
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), irisMat);
    iris.scale.set(1.0, 1.08, 0.35);
    iris.position.set(0, 0, 0.008);
    eg.add(iris);

    // Black pupil
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.0075, 16), pupilM);
    pupil.position.set(0, 0, 0.016);
    eg.add(pupil);

    // Crisp specular catchlight
    const clight = new THREE.Mesh(new THREE.CircleGeometry(0.0032, 8), catchM);
    clight.position.set(0.0035, 0.0040, 0.0165);
    eg.add(clight);

    // Eyelash line
    const lashGeo = new THREE.BoxGeometry(0.046, 0.0035, 0.004);
    const lash = new THREE.Mesh(lashGeo, lashMat);
    lash.position.set(0, 0.019, 0.009);
    eg.add(lash);

    return eg;
  }

  const leftEyeGroup  = makeEye(-1);
  const rightEyeGroup = makeEye(1);
  headGroup.add(leftEyeGroup);
  headGroup.add(rightEyeGroup);

  // Eyebrows (Arched dark espresso brown)
  const browGeo = new THREE.BoxGeometry(0.050, 0.009, 0.012);
  const browMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hairHex), roughness: 0.65 });
  const leftEyebrow  = add(browGeo, browMat, -0.055, 0.068, 0.142, 0, 0,  0.08);
  const rightEyebrow = add(browGeo.clone(), browMat,  0.055, 0.068, 0.142, 0, 0, -0.08);
  headGroup.add(leftEyebrow);
  headGroup.add(rightEyebrow);

  // Mouth (Friendly warm smiling lips)
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.062, 0.144);

  const upperLipGeo = new THREE.SphereGeometry(0.024, 16, 8);
  upperLipGeo.scale(1.30, 0.42, 0.40);
  mouthGroup.add(add(upperLipGeo, lipMat, 0, 0.004, 0));

  const lowerLipGeo = new THREE.SphereGeometry(0.026, 16, 8);
  lowerLipGeo.scale(1.25, 0.52, 0.40);
  mouthGroup.add(add(lowerLipGeo, lipMat, 0, -0.006, 0));

  const teethGeo = new THREE.BoxGeometry(0.035, 0.008, 0.012);
  mouthGroup.add(add(teethGeo, teethMat, 0, 0.000, 0.004));

  headGroup.add(mouthGroup);

  // ─── 7. STYLED HAIR (Top and back of head, side-swept bangs) ─────────────
  // Hair cap sits ONLY on the top and back, NEVER overlapping the face!
  const hairCapGeo = new THREE.SphereGeometry(0.154, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.42);
  hairCapGeo.scale(1.02, 1.10, 1.04);
  headGroup.add(add(hairCapGeo, hairMat, 0, 0.028, -0.015));

  // Back of head hair
  const backHairGeo = new THREE.SphereGeometry(0.152, 24, 18, 0, Math.PI, 0, Math.PI * 0.65);
  headGroup.add(add(backHairGeo, hairMat, 0, 0.010, -0.025, 0, -Math.PI / 2, 0));

  // Signature side-swept bangs across forehead hairline (from left to right)
  const bang1 = add(new THREE.CylinderGeometry(0.016, 0.010, 0.13, 12), hairMat, -0.025, 0.108, 0.118, -0.22, 0.10, -0.40);
  headGroup.add(bang1);
  const bang2 = add(new THREE.CylinderGeometry(0.011, 0.005, 0.09, 12), hairMat,  0.045, 0.095, 0.122, -0.18, -0.15, -0.55);
  headGroup.add(bang2);

  // Sideburns framing the sides
  headGroup.add(add(new THREE.CylinderGeometry(0.018, 0.010, 0.10, 10), hairMat, -0.152, -0.005, 0.005));
  headGroup.add(add(new THREE.CylinderGeometry(0.018, 0.010, 0.10, 10), hairMat,  0.152, -0.005, 0.005));

  root.add(headGroup);

  // ─── 8. REALISTIC ARTICULATED HUMAN ARMS & 5-FINGER HANDS ───────────────
  function buildArm(side) {
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(side * 0.28, 0.22, 0.02);

    // Shoulder ball-and-socket joint
    const shoulderBallGeo = new THREE.SphereGeometry(0.058, 16, 14);
    shoulderGroup.add(add(shoulderBallGeo, jacket, 0, 0, 0));

    // Upper arm sleeve cylinder (extends down -Y)
    const uaGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.26, 16);
    uaGeo.translate(0, -0.13, 0);
    shoulderGroup.add(add(uaGeo, jacket));

    // Elbow hinge joint
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(0, -0.26, 0);

    const elbowBallGeo = new THREE.SphereGeometry(0.045, 14, 12);
    elbowGroup.add(add(elbowBallGeo, jacket, 0, 0, 0));

    // Forearm sleeve cylinder
    const faJacketGeo = new THREE.CylinderGeometry(0.042, 0.038, 0.16, 16);
    faJacketGeo.translate(0, -0.08, 0);
    elbowGroup.add(add(faJacketGeo, jacket));

    // White shirt cuff
    const cuffGeo = new THREE.CylinderGeometry(0.038, 0.036, 0.038, 16);
    cuffGeo.translate(0, -0.18, 0);
    elbowGroup.add(add(cuffGeo, shirt));

    // Bare wrist skin
    const faSkinGeo = new THREE.CylinderGeometry(0.034, 0.032, 0.048, 14);
    faSkinGeo.translate(0, -0.215, 0);
    elbowGroup.add(add(faSkinGeo, skin));

    // Wrist joint
    const wristGroup = new THREE.Group();
    wristGroup.position.set(0, -0.24, 0);

    const wristBallGeo = new THREE.SphereGeometry(0.032, 14, 12);
    wristGroup.add(add(wristBallGeo, skin, 0, 0, 0));

    // ─── Realistic Human Palm with Muscle Contours ───────────────────────────
    const palmGroup = new THREE.Group();
    wristGroup.add(palmGroup);

    // Central contoured palm base
    const palmBaseGeo = new THREE.BoxGeometry(0.068, 0.076, 0.020);
    palmBaseGeo.translate(0, -0.038, 0);
    palmGroup.add(add(palmBaseGeo, skin));

    // Thenar muscle pad (thumb base mound)
    const thenarGeo = new THREE.SphereGeometry(0.020, 16, 12);
    thenarGeo.scale(1.15, 1.45, 0.85);
    palmGroup.add(add(thenarGeo, skin, side * 0.024, -0.028, 0.008));

    // Hypothenar muscle pad (pinky edge)
    const hypothenarGeo = new THREE.SphereGeometry(0.015, 14, 10);
    hypothenarGeo.scale(0.85, 1.45, 0.80);
    palmGroup.add(add(hypothenarGeo, skin, -side * 0.024, -0.038, 0.006));

    // Smooth dorsal back-of-hand curvature
    const dorsalGeo = new THREE.SphereGeometry(0.036, 16, 12);
    dorsalGeo.scale(0.85, 0.95, 0.28);
    palmGroup.add(add(dorsalGeo, skin, 0, -0.038, -0.006));

    // ─── Proportional Human 5 Fingers ────────────────────────────────────────
    const fingers = [];
    // [radialOffset, p0-length, p1-length, p2-length, radius]
    const fingerDefs = [
      [ 0.032, 0.028, 0.020, 0.015, 0.0082],  // 0: Thumb (Radial)
      [ 0.020, 0.034, 0.024, 0.016, 0.0076],  // 1: Index
      [ 0.006, 0.038, 0.027, 0.018, 0.0078],  // 2: Middle (Longest)
      [-0.008, 0.034, 0.024, 0.016, 0.0074],  // 3: Ring
      [-0.021, 0.026, 0.018, 0.013, 0.0068],  // 4: Pinky (Shortest)
    ];

    fingerDefs.forEach(([radialOffset, l0, l1, l2, rad0], fi) => {
      const baseGroup = new THREE.Group();
      const isThumb = fi === 0;

      if (isThumb) {
        // Thumb base angled forward and outward
        baseGroup.position.set(side * radialOffset, -0.022, 0.008);
        baseGroup.rotation.set(0.18, side * 0.35, side * -0.55);
      } else {
        // 4 fingers spaced along knuckle arch
        baseGroup.position.set(side * radialOffset, -0.076, 0);
      }

      // 1. Proximal Phalange
      const p0 = new THREE.Group();
      const p0geo = new THREE.CylinderGeometry(rad0, rad0 * 0.90, l0, 10);
      p0geo.translate(0, -l0/2, 0);
      p0.add(add(p0geo, skin));
      p0.add(add(new THREE.SphereGeometry(rad0 * 0.95, 8, 8), skin, 0, 0, 0));

      // 2. Intermediate Phalange
      const p1 = new THREE.Group();
      p1.position.set(0, -l0, 0);
      const p1geo = new THREE.CylinderGeometry(rad0 * 0.88, rad0 * 0.78, l1, 10);
      p1geo.translate(0, -l1/2, 0);
      p1.add(add(p1geo, skin));
      p1.add(add(new THREE.SphereGeometry(rad0 * 0.85, 8, 8), skin, 0, 0, 0));

      // 3. Distal Phalange
      const p2 = new THREE.Group();
      p2.position.set(0, -l1, 0);
      const p2geo = new THREE.CylinderGeometry(rad0 * 0.76, rad0 * 0.62, l2, 10);
      p2geo.translate(0, -l2/2, 0);
      p2.add(add(p2geo, skin));

      // Smooth natural rounded fingertip pad
      const tipGeo = new THREE.SphereGeometry(rad0 * 0.65, 10, 8);
      tipGeo.scale(1.0, 0.9, 0.95);
      p2.add(add(tipGeo, skin, 0, -l2, 0));

      p1.add(p2);
      p0.add(p1);
      baseGroup.add(p0);
      wristGroup.add(baseGroup);

      fingers.push({
        base: baseGroup,
        proximal: p0,
        intermediate: p1,
        distal: p2,
        isThumb
      });
    });

    elbowGroup.add(wristGroup);
    shoulderGroup.add(elbowGroup);
    root.add(shoulderGroup);

    return { shoulder: shoulderGroup, elbow: elbowGroup, wrist: wristGroup, fingers };
  }

  const rightArm = buildArm( 1);
  const leftArm  = buildArm(-1);

  // Default natural anatomical neutral rest pose
  rightArm.shoulder.rotation.set(0.04, 0.0, -0.06);
  rightArm.elbow.rotation.set(0.08, 0.0, 0.0);
  rightArm.wrist.rotation.set(0.02, 0.35, 0.0);

  leftArm.shoulder.rotation.set(0.04, 0.0, 0.06);
  leftArm.elbow.rotation.set(0.08, 0.0, 0.0);
  leftArm.wrist.rotation.set(0.02, -0.35, 0.0);

  return {
    root,
    torso:         torsoGroup,
    head:          headGroup,
    leftEye:       leftEyeGroup,
    rightEye:      rightEyeGroup,
    leftEyebrow,
    rightEyebrow,
    mouth:         mouthGroup,
    rShoulder:     rightArm.shoulder,
    rElbow:        rightArm.elbow,
    rWrist:        rightArm.wrist,
    rFingers:      rightArm.fingers.map(f => f.proximal),
    rFingersAll:   rightArm.fingers,
    lShoulder:     leftArm.shoulder,
    lElbow:        leftArm.elbow,
    lWrist:        leftArm.wrist,
    lFingers:      leftArm.fingers.map(f => f.proximal),
    lFingersAll:   leftArm.fingers,
    skinMaterial:  skin,
    clothMaterial: jacket,
  };
}

/**
 * 60 FPS Sentence-Responsive Motion Solver
 * Elevates the dominant hand to face level on the face side, facing forward toward viewer.
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
  if (!char) return;

  if (!isActiveSigning) {
    // ==========================================
    // 1. ANATOMICAL NEUTRAL REST POSE (Standing)
    // ==========================================
    char.torso.position.set(0, Math.sin(clock * 0.04) * 0.006, 0);
    char.torso.rotation.set(0, 0, 0);

    char.head.rotation.set(Math.sin(clock * 0.03) * 0.012, Math.cos(clock * 0.02) * 0.015, 0);

    char.mouth.scale.set(0.95, 0.35, 0.7);
    char.mouth.position.y = -0.062;

    char.leftEyebrow.position.y = 0.068;
    char.rightEyebrow.position.y = 0.068;

    const isBlink = Math.sin(clock * 0.03) > 0.97;
    char.leftEye.scale.y = isBlink ? 0.1 : 1.0;
    char.rightEye.scale.y = isBlink ? 0.1 : 1.0;

    // Both arms hanging symmetrically beside torso in neutral anatomical position
    char.rShoulder.rotation.set(0.04, 0.0, -0.06);
    char.rElbow.rotation.set(0.08, 0.0, 0.0);
    char.rWrist.rotation.set(0.02, 0.35, 0.0);

    char.lShoulder.rotation.set(0.04, 0.0, 0.06);
    char.lElbow.rotation.set(0.08, 0.0, 0.0);
    char.lWrist.rotation.set(0.02, -0.35, 0.0);

    if (char.rFingersAll) {
      char.rFingersAll.forEach((f) => {
        f.proximal.rotation.x = 0.10;
        f.intermediate.rotation.x = 0.08;
        f.distal.rotation.x = 0.05;
      });
    }
    if (char.lFingersAll) {
      char.lFingersAll.forEach((f) => {
        f.proximal.rotation.x = 0.10;
        f.intermediate.rotation.x = 0.08;
        f.distal.rotation.x = 0.05;
      });
    }
    return;
  }

  // ==========================================
  // 2. ACTIVE SIGNING MOTION (Elevated to Face Level)
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

  // A. Torso Motion
  const bodySwayX = Math.sin(clock * 0.09) * 0.015;
  const bodySwayZ = Math.cos(clock * 0.07) * 0.012;
  char.torso.position.set(0, Math.sin(clock * 0.08) * 0.012, 0);
  char.torso.rotation.x = bodySwayX * 0.6;
  char.torso.rotation.z = bodySwayZ * 0.7;

  // B. Head Motion (Facing camera + expressive nods)
  const headNod = Math.sin(clock * 0.14) * 0.04;
  const headTurn = Math.cos(clock * 0.08) * 0.03;

  if (unit?.headMotion) {
    char.head.rotation.x = (unit.headMotion.pitch || 0) * Math.sin(progress * Math.PI) + headNod;
    char.head.rotation.y = (unit.headMotion.yaw || 0) * Math.sin(progress * Math.PI) + headTurn;
  } else {
    char.head.rotation.x = headNod;
    char.head.rotation.y = headTurn;
  }

  // Talking Mouth Lip-Sync Visemes
  if (isSpeaking) {
    const mouthOpen = 0.4 + Math.abs(Math.sin(clock * 0.6)) * 1.5;
    const mouthWidth = 1.0 + Math.sin(clock * 0.4) * 0.30;
    char.mouth.scale.set(mouthWidth, mouthOpen, 1.2);
    char.mouth.position.y = -0.062 - mouthOpen * 0.008;
  } else {
    char.mouth.scale.set(1.0, 0.45, 0.85);
    char.mouth.position.y = -0.062;
  }

  // Eye Blinks
  const isBlinking = Math.sin(clock * 0.04) > 0.96;
  char.leftEye.scale.y = isBlinking ? 0.1 : 1.0;
  char.rightEye.scale.y = isBlinking ? 0.1 : 1.0;

  // Eyebrow ASL Grammar
  const eyebrowLift = unit?.eyebrows || (Math.sin(clock * 0.1) > 0.4 ? 0.6 : 0.1);
  char.leftEyebrow.position.y = 0.068 + eyebrowLift * 0.030;
  char.rightEyebrow.position.y = 0.068 + eyebrowLift * 0.030;

  // C. Dominant (Right) Arm: Raised beside face in Face Side signing space
  if (unit?.rightArmKeyframes && unit.rightArmKeyframes.length > 0) {
    const k0 = unit.rightArmKeyframes[0];
    const k1 = unit.rightArmKeyframes[unit.rightArmKeyframes.length - 1] || k0;

    char.rShoulder.rotation.x = THREE.MathUtils.lerp(k0.shoulder[0] + 0.30, k1.shoulder[0] + 0.30, smoothT);
    char.rShoulder.rotation.y = THREE.MathUtils.lerp(k0.shoulder[1] + 0.15, k1.shoulder[1] + 0.15, smoothT);
    char.rShoulder.rotation.z = THREE.MathUtils.lerp(k0.shoulder[2] + 0.10, k1.shoulder[2] + 0.10, smoothT);

    char.rElbow.rotation.x = THREE.MathUtils.lerp(k0.elbow[0] + 0.50, k1.elbow[0] + 0.50, smoothT);
    char.rElbow.rotation.y = THREE.MathUtils.lerp(k0.elbow[1] + 0.10, k1.elbow[1] + 0.10, smoothT);
    char.rElbow.rotation.z = THREE.MathUtils.lerp(k0.elbow[2], k1.elbow[2], smoothT);

    char.rWrist.rotation.x = THREE.MathUtils.lerp(k0.wrist[0] + 0.10, k1.wrist[0] + 0.10, smoothT);
    char.rWrist.rotation.y = THREE.MathUtils.lerp(k0.wrist[1] + Math.PI - 0.20, k1.wrist[1] + Math.PI - 0.20, smoothT);
    char.rWrist.rotation.z = THREE.MathUtils.lerp(k0.wrist[2] + 0.10, k1.wrist[2] + 0.10, smoothT);
  } else {
    // Conversational ASL Presenter Pose (Hand raised beside chin/face, palm forward)
    const signSwing = Math.sin(clock * 0.15);
    const signReach = Math.cos(clock * 0.12);

    char.rShoulder.rotation.set(0.52 + signSwing * 0.10, 0.22 + signReach * 0.08, 0.16);
    char.rElbow.rotation.set(1.68 + Math.sin(clock * 0.18) * 0.14, 0.20, -0.06);
    char.rWrist.rotation.set(0.15 + Math.cos(clock * 0.16) * 0.08, Math.PI - 0.18, 0.12 + Math.sin(clock * 0.2) * 0.08);
  }

  // D. Non-Dominant (Left) Arm Signing
  if (unit?.leftArmKeyframes && unit.leftArmKeyframes.length > 0) {
    const lk0 = unit.leftArmKeyframes[0];
    const lk1 = unit.leftArmKeyframes[unit.leftArmKeyframes.length - 1] || lk0;

    char.lShoulder.rotation.x = THREE.MathUtils.lerp(lk0.shoulder[0] + 0.20, lk1.shoulder[0] + 0.20, smoothT);
    char.lShoulder.rotation.y = THREE.MathUtils.lerp(lk0.shoulder[1] - 0.15, lk1.shoulder[1] - 0.15, smoothT);
    char.lShoulder.rotation.z = THREE.MathUtils.lerp(lk0.shoulder[2] - 0.10, lk1.shoulder[2] - 0.10, smoothT);

    char.lElbow.rotation.x = THREE.MathUtils.lerp(lk0.elbow[0] + 0.30, lk1.elbow[0] + 0.30, smoothT);
    char.lElbow.rotation.y = THREE.MathUtils.lerp(lk0.elbow[1], lk1.elbow[1], smoothT);
    char.lElbow.rotation.z = THREE.MathUtils.lerp(lk0.elbow[2], lk1.elbow[2], smoothT);

    char.lWrist.rotation.x = THREE.MathUtils.lerp(lk0.wrist[0], lk1.wrist[0], smoothT);
    char.lWrist.rotation.y = THREE.MathUtils.lerp(lk0.wrist[1] - Math.PI + 0.25, lk1.wrist[1] - Math.PI + 0.25, smoothT);
    char.lWrist.rotation.z = THREE.MathUtils.lerp(lk0.wrist[2], lk1.wrist[2], smoothT);
  } else {
    // Natural supporting posture beside lower chest
    char.lShoulder.rotation.set(0.25 + Math.sin(clock * 0.08) * 0.06, -0.15, -0.10);
    char.lElbow.rotation.set(0.70 + Math.cos(clock * 0.10) * 0.08, 0.10, -0.05);
    char.lWrist.rotation.set(0.15, -0.45, -0.10);
  }

  // E. Organic 5-Finger Articulation (Curling inward toward palm)
  const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'];

  if (char.rFingersAll) {
    for (let f = 0; f < 5; f++) {
      const fingerObj = char.rFingersAll[f];
      if (!fingerObj) continue;

      const fName = fingerNames[f];
      const curlVal = activeHandshape?.[fName]?.[0] ?? (Math.sin(clock * 0.18 + f * 0.8) > 0 ? 0.85 : 0.15);

      if (f === 0) {
        // Thumb articulation
        fingerObj.proximal.rotation.x = curlVal * 0.75;
        fingerObj.intermediate.rotation.x = curlVal * 0.55;
        fingerObj.distal.rotation.x = curlVal * 0.35;
        // Lateral abduction for L and Y
        const isLOrY = currentWordToken === 'L' || currentWordToken === 'Y' || curlVal < 0.3;
        fingerObj.base.rotation.z = isLOrY ? -1.15 : -0.55;
      } else {
        // 3-Phalange organic joint flexion
        const maxBend = Math.PI * 0.52;
        fingerObj.proximal.rotation.x = curlVal * maxBend * 0.50;
        fingerObj.intermediate.rotation.x = curlVal * maxBend * 0.35;
        fingerObj.distal.rotation.x = curlVal * maxBend * 0.25;
      }
    }
  }

  if (char.lFingersAll) {
    for (let f = 0; f < 5; f++) {
      const fingerObj = char.lFingersAll[f];
      if (!fingerObj) continue;

      const curlVal = 0.20 + Math.sin(clock * 0.12 + f * 0.6) * 0.18;
      const maxBend = Math.PI * 0.52;
      fingerObj.proximal.rotation.x = curlVal * maxBend * 0.50;
      fingerObj.intermediate.rotation.x = curlVal * maxBend * 0.35;
      fingerObj.distal.rotation.x = curlVal * maxBend * 0.25;
    }
  }

  // Skeleton Rig Toggle
  if (char.skinMaterial && char.clothMaterial) {
    char.skinMaterial.wireframe = showSkeleton;
    char.clothMaterial.wireframe = showSkeleton;
  }
}

function updateRiggedAvatarMotion(model, unit, frame) {
  if (!model) return;
  const progress = unit?.startFrame !== undefined && unit?.endFrame > unit.startFrame
    ? THREE.MathUtils.clamp((frame - unit.startFrame) / (unit.endFrame - unit.startFrame), 0, 1)
    : 0;
  const swing = Math.sin(progress * Math.PI) * 0.35;
  model.traverse((object) => {
    if (!object.isBone) return;
    const name = object.name.toLowerCase();
    const isRight = /right|_r\b|\.r\b/.test(name);
    const isLeft = /left|_l\b|\.l\b/.test(name);
    const side = isRight ? 1 : isLeft ? -1 : 0;
    if (/shoulder|upperarm|clavicle/.test(name)) object.rotation.z = side * (0.18 + swing);
    if (/forearm|lowerarm|elbow/.test(name)) object.rotation.x = 0.45 + swing * 0.4;
    if (/wrist|hand/.test(name) && !/finger|thumb|index|middle|ring|pinky/.test(name)) object.rotation.y = side * swing * 0.35;
    if (/thumb|index|middle|ring|pinky|finger/.test(name)) {
      const curl = unit?.handshape?.[name.match(/thumb|index|middle|ring|pinky/)?.[0]]?.[0] || 0;
      object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, curl * 0.9, 0.16);
    }
  });
}
