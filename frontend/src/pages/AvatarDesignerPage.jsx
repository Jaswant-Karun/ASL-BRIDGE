/**
 * AvatarDesignerPage
 * Full-featured character customizer with a live Three.js 3D preview.
 * Every change is applied to the 3D rig in real time via shared refs.
 * Design is persisted to localStorage so it survives page reloads.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// ─── Design presets ──────────────────────────────────────────────────────────

const SKIN_TONES = [
  { id: 'light',      label: 'Light',      hex: '#fcd5b5' },
  { id: 'fair',       label: 'Fair',       hex: '#f5c6a0' },
  { id: 'medium',     label: 'Medium',     hex: '#d4956b' },
  { id: 'tan',        label: 'Tan',        hex: '#bf7f4e' },
  { id: 'brown',      label: 'Brown',      hex: '#8d5524' },
  { id: 'dark',       label: 'Dark',       hex: '#5c3317' },
];

const HAIR_STYLES = [
  { id: 'none',       label: 'Bald',       emoji: '🧑‍🦲' },
  { id: 'short',      label: 'Short',      emoji: '🪮' },
  { id: 'medium',     label: 'Medium',     emoji: '💇' },
  { id: 'long',       label: 'Long',       emoji: '👩' },
  { id: 'curly',      label: 'Curly',      emoji: '🌀' },
  { id: 'mohawk',     label: 'Mohawk',     emoji: '⚡' },
  { id: 'bun',        label: 'Bun',        emoji: '🎀' },
  { id: 'afro',       label: 'Afro',       emoji: '🌸' },
];

const HAIR_COLORS = [
  { id: 'black',   hex: '#1a1008' },
  { id: 'brown',   hex: '#5c3317' },
  { id: 'auburn',  hex: '#8b3a1e' },
  { id: 'blonde',  hex: '#d4aa5e' },
  { id: 'red',     hex: '#c0392b' },
  { id: 'grey',    hex: '#9e9e9e' },
  { id: 'white',   hex: '#f0f0f0' },
  { id: 'blue',    hex: '#1565c0' },
  { id: 'pink',    hex: '#e91e8c' },
  { id: 'green',   hex: '#2e7d32' },
  { id: 'purple',  hex: '#6a1b9a' },
  { id: 'orange',  hex: '#e65100' },
];

const OUTFIT_STYLES = [
  { id: 'tshirt',   label: 'T-Shirt',     emoji: '👕' },
  { id: 'hoodie',   label: 'Hoodie',      emoji: '🧥' },
  { id: 'jacket',   label: 'Jacket',      emoji: '🥼' },
  { id: 'suit',     label: 'Suit',        emoji: '🤵' },
  { id: 'shirt',    label: 'Shirt',       emoji: '👔' },
  { id: 'vest',     label: 'Vest',        emoji: '🦺' },
  { id: 'sport',    label: 'Sportswear',  emoji: '🏃' },
  { id: 'uniform',  label: 'Uniform',     emoji: '👮' },
];

const OUTFIT_COLORS = [
  { id: 'navy',    hex: '#1a237e' },
  { id: 'black',   hex: '#212121' },
  { id: 'white',   hex: '#f5f5f5' },
  { id: 'red',     hex: '#c62828' },
  { id: 'green',   hex: '#1b5e20' },
  { id: 'teal',    hex: '#004d40' },
  { id: 'grey',    hex: '#546e7a' },
  { id: 'purple',  hex: '#4a148c' },
  { id: 'orange',  hex: '#e65100' },
  { id: 'brown',   hex: '#4e342e' },
  { id: 'pink',    hex: '#880e4f' },
  { id: 'cyan',    hex: '#006064' },
];

const PANTS_COLORS = [
  { id: 'jeans',   hex: '#1565c0', label: 'Jeans' },
  { id: 'black',   hex: '#1a1a1a', label: 'Black' },
  { id: 'grey',    hex: '#616161', label: 'Grey' },
  { id: 'khaki',   hex: '#8d6e63', label: 'Khaki' },
  { id: 'beige',   hex: '#bcaaa4', label: 'Beige' },
  { id: 'navy',    hex: '#1a237e', label: 'Navy' },
  { id: 'brown',   hex: '#4e342e', label: 'Brown' },
  { id: 'white',   hex: '#eceff1', label: 'White' },
];

const SHOE_STYLES = [
  { id: 'sneakers', label: 'Sneakers',  emoji: '👟' },
  { id: 'boots',    label: 'Boots',     emoji: '🥾' },
  { id: 'loafers',  label: 'Loafers',   emoji: '🥿' },
  { id: 'heels',    label: 'Heels',     emoji: '👠' },
  { id: 'sandals',  label: 'Sandals',   emoji: '👡' },
  { id: 'formal',   label: 'Formal',    emoji: '👞' },
];

const SHOE_COLORS = [
  { id: 'white',  hex: '#f5f5f5' },
  { id: 'black',  hex: '#212121' },
  { id: 'brown',  hex: '#5d4037' },
  { id: 'red',    hex: '#b71c1c' },
  { id: 'blue',   hex: '#0d47a1' },
  { id: 'grey',   hex: '#607d8b' },
];

const CAP_STYLES = [
  { id: 'none',       label: 'None',        emoji: '❌' },
  { id: 'baseball',   label: 'Baseball',    emoji: '🧢' },
  { id: 'beanie',     label: 'Beanie',      emoji: '🎩' },
  { id: 'tophat',     label: 'Top Hat',     emoji: '🎩' },
  { id: 'cowboy',     label: 'Cowboy',      emoji: '🤠' },
  { id: 'beret',      label: 'Beret',       emoji: '🎨' },
];

const CAP_COLORS = [
  { id: 'black',  hex: '#212121' },
  { id: 'red',    hex: '#c62828' },
  { id: 'navy',   hex: '#1a237e' },
  { id: 'white',  hex: '#f5f5f5' },
  { id: 'green',  hex: '#1b5e20' },
  { id: 'grey',   hex: '#546e7a' },
];

const GLASSES_STYLES = [
  { id: 'none',       label: 'None',        emoji: '❌' },
  { id: 'round',      label: 'Round',       emoji: '🔵' },
  { id: 'square',     label: 'Square',      emoji: '⬛' },
  { id: 'aviator',    label: 'Aviator',     emoji: '✈️' },
  { id: 'sunglasses', label: 'Sunglasses',  emoji: '🕶️' },
  { id: 'half-rim',   label: 'Half-Rim',    emoji: '🔲' },
];

const WATCH_STYLES = [
  { id: 'none',     label: 'None',       emoji: '❌' },
  { id: 'classic',  label: 'Classic',    emoji: '⌚' },
  { id: 'sport',    label: 'Sport',      emoji: '🏃' },
  { id: 'smart',    label: 'Smart',      emoji: '📱' },
  { id: 'luxury',   label: 'Luxury',     emoji: '✨' },
];

const JACKET_STYLES = [
  { id: 'none',      label: 'None',       emoji: '❌' },
  { id: 'bomber',    label: 'Bomber',     emoji: '🧥' },
  { id: 'denim',     label: 'Denim',      emoji: '👖' },
  { id: 'leather',   label: 'Leather',    emoji: '🖤' },
  { id: 'trench',    label: 'Trench',     emoji: '🕵️' },
  { id: 'blazer',    label: 'Blazer',     emoji: '👔' },
];

const BG_PRESETS = [
  { id: 'studio',  label: 'Studio',    color: '#0a0f1e' },
  { id: 'light',   label: 'Light',     color: '#e8f4ff' },
  { id: 'forest',  label: 'Forest',    color: '#0d2b0d' },
  { id: 'sunset',  label: 'Sunset',    color: '#1a0a05' },
  { id: 'purple',  label: 'Purple',    color: '#0d0020' },
  { id: 'gym',     label: 'Gym',       color: '#0f0f0f' },
];

// ─── Default design ───────────────────────────────────────────────────────────
const DEFAULT_DESIGN = {
  skinTone: 'medium',
  hairStyle: 'short',
  hairColor: 'black',
  outfitStyle: 'hoodie',
  outfitColor: 'navy',
  pantsColor: 'jeans',
  shoeStyle: 'sneakers',
  shoeColor: 'white',
  capStyle: 'none',
  capColor: 'black',
  glassesStyle: 'none',
  watchStyle: 'none',
  jacketStyle: 'none',
  background: 'studio',
  avatarName: 'My Avatar',
};

function loadDesign() {
  try { return { ...DEFAULT_DESIGN, ...JSON.parse(localStorage.getItem('avatar-design') || '{}') }; }
  catch { return { ...DEFAULT_DESIGN }; }
}
function saveDesign(d) {
  try { localStorage.setItem('avatar-design', JSON.stringify(d)); } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToThree(hex) {
  return new THREE.Color(hex);
}
function findHex(arr, id) {
  return arr.find(x => x.id === id)?.hex || '#888';
}

// ─── Live 3D Avatar Builder ────────────────────────────────────────────────────
function buildDesignerRig(scene, design) {
  const root = new THREE.Group();
  scene.add(root);
  root.position.y = -0.6;

  const skinHex   = findHex(SKIN_TONES,    design.skinTone);
  const outfitHex = findHex(OUTFIT_COLORS, design.outfitColor);
  const pantsHex  = findHex(PANTS_COLORS,  design.pantsColor);
  const shoeHex   = findHex(SHOE_COLORS,   design.shoeColor);
  const hairHex   = findHex(HAIR_COLORS,   design.hairColor);
  const capHex    = findHex(CAP_COLORS,    design.capColor);

  const mat = {
    skin:   new THREE.MeshStandardMaterial({ color: hexToThree(skinHex),   roughness: 0.5 }),
    outfit: new THREE.MeshStandardMaterial({ color: hexToThree(outfitHex), roughness: 0.6 }),
    pants:  new THREE.MeshStandardMaterial({ color: hexToThree(pantsHex),  roughness: 0.65 }),
    shoe:   new THREE.MeshStandardMaterial({ color: hexToThree(shoeHex),   roughness: 0.7 }),
    hair:   new THREE.MeshStandardMaterial({ color: hexToThree(hairHex),   roughness: 0.8 }),
    cap:    new THREE.MeshStandardMaterial({ color: hexToThree(capHex),    roughness: 0.6 }),
    eye:    new THREE.MeshBasicMaterial({ color: 0x1a1a2e }),
    white:  new THREE.MeshBasicMaterial({ color: 0xffffff }),
    glass:  new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4, metalness: 0.9 }),
    watch:  new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 }),
    metal:  new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.2 }),
    dark:   new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 }),
  };

  // ── Legs ──
  const legGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.45, 14);
  const rLeg = new THREE.Mesh(legGeo, mat.pants); rLeg.position.set(0.1, 0.225, 0); root.add(rLeg);
  const lLeg = new THREE.Mesh(legGeo, mat.pants); lLeg.position.set(-0.1, 0.225, 0); root.add(lLeg);

  // ── Shoes ──
  const shoeGeo = new THREE.BoxGeometry(0.09, 0.055, 0.17);
  const rShoe = new THREE.Mesh(shoeGeo, mat.shoe); rShoe.position.set(0.1, 0.03, 0.03); root.add(rShoe);
  const lShoe = new THREE.Mesh(shoeGeo, mat.shoe); lShoe.position.set(-0.1, 0.03, 0.03); root.add(lShoe);
  // Shoe sole accent
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.9 });
  const soleGeo = new THREE.BoxGeometry(0.092, 0.01, 0.173);
  const rSole = new THREE.Mesh(soleGeo, soleMat); rSole.position.set(0.1, 0.008, 0.03); root.add(rSole);
  const lSole = new THREE.Mesh(soleGeo, soleMat); lSole.position.set(-0.1, 0.008, 0.03); root.add(lSole);

  // ── Torso ──
  let torsoMat = mat.outfit;
  // Jacket layer if selected
  const hasJacket = design.jacketStyle !== 'none';
  const torsoGeo = new THREE.CylinderGeometry(0.22, 0.19, 0.5, 18);
  const torso = new THREE.Mesh(torsoGeo, torsoMat); torso.position.y = 0.7; root.add(torso);

  if (hasJacket) {
    const jacketHex = design.jacketStyle === 'leather' ? '#1a1a1a' :
                      design.jacketStyle === 'denim'   ? '#1565c0' :
                      design.jacketStyle === 'bomber'  ? '#2e7d32' :
                      design.jacketStyle === 'trench'  ? '#6d4c41' :
                      design.jacketStyle === 'blazer'  ? '#1a237e' : outfitHex;
    const jMat = new THREE.MeshStandardMaterial({ color: hexToThree(jacketHex), roughness: 0.5 });
    const jacketGeo = new THREE.CylinderGeometry(0.235, 0.21, 0.5, 18);
    const jacket = new THREE.Mesh(jacketGeo, jMat); jacket.position.y = 0.7; root.add(jacket);
    // Lapels
    const lapelGeo = new THREE.BoxGeometry(0.04, 0.18, 0.02);
    const lLapel = new THREE.Mesh(lapelGeo, jMat); lLapel.position.set(-0.13, 0.82, 0.22); root.add(lLapel);
    const rLapel = new THREE.Mesh(lapelGeo, jMat); rLapel.position.set(0.13, 0.82, 0.22); root.add(rLapel);
  }

  // ── Collar / neckline detail ──
  const collarGeo = new THREE.TorusGeometry(0.08, 0.015, 8, 24);
  const collar = new THREE.Mesh(collarGeo, mat.outfit); collar.position.set(0, 0.95, 0.05); collar.rotation.x = Math.PI / 2; root.add(collar);

  // ── Arms ──
  function buildArm(side) {
    const sg = new THREE.Group(); sg.position.set(side * 0.27, 0.88, 0); root.add(sg);
    const uaGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.28, 12); uaGeo.translate(0,-0.14,0);
    const ua = new THREE.Mesh(uaGeo, mat.outfit); sg.add(ua);
    const eg = new THREE.Group(); eg.position.set(0,-0.28,0); sg.add(eg);
    const faGeo = new THREE.CylinderGeometry(0.042, 0.036, 0.25, 12); faGeo.translate(0,-0.125,0);
    const fa = new THREE.Mesh(faGeo, mat.skin); eg.add(fa);
    const wg = new THREE.Group(); wg.position.set(0,-0.26,0); eg.add(wg);
    const palmGeo = new THREE.BoxGeometry(0.072, 0.082, 0.025); palmGeo.translate(0,-0.04,0);
    const palm = new THREE.Mesh(palmGeo, mat.skin); wg.add(palm);
    const tGeo = new THREE.CylinderGeometry(0.009,0.007,0.048,8);
    const thumb = new THREE.Mesh(tGeo, mat.skin);
    thumb.rotation.z = side * (Math.PI/3); thumb.position.set(side*0.045,-0.02,0.015); wg.add(thumb);
    for(let f=0;f<4;f++){
      const fg = new THREE.Group(); fg.position.set((f*0.016-0.024), -0.082, 0);
      const fGeo = new THREE.CylinderGeometry(0.007,0.006,0.058,8); fGeo.translate(0,-0.029,0);
      fg.add(new THREE.Mesh(fGeo, mat.skin)); wg.add(fg);
    }
    // Watch on left wrist
    if (side === -1 && design.watchStyle !== 'none') {
      const wbGeo = new THREE.TorusGeometry(0.022, 0.007, 8, 20);
      const wb = new THREE.Mesh(wbGeo, design.watchStyle === 'luxury' ? mat.watch : mat.metal);
      wb.rotation.x = Math.PI/2; wb.position.set(0, -0.01, 0); wg.add(wb);
      const wfGeo = new THREE.BoxGeometry(0.025, 0.025, 0.01);
      const wf = new THREE.Mesh(wfGeo, design.watchStyle === 'smart' ? new THREE.MeshStandardMaterial({color:0x222222}) : mat.watch);
      wf.position.set(0, -0.015, 0.016); wg.add(wf);
    }
    sg.rotation.set(0.1, 0, side * -0.22);
    eg.rotation.set(0.45, 0, 0);
    return sg;
  }
  buildArm(1); buildArm(-1);

  // ── Neck ──
  const neckGeo = new THREE.CylinderGeometry(0.062, 0.07, 0.11, 14);
  const neck = new THREE.Mesh(neckGeo, mat.skin); neck.position.y = 1.01; root.add(neck);

  // ── Head ──
  const headGroup = new THREE.Group(); headGroup.position.set(0,1.16,0); root.add(headGroup);
  const headGeo = new THREE.SphereGeometry(0.155, 28, 28);
  headGeo.scale(1, 1.15, 0.98);
  headGroup.add(new THREE.Mesh(headGeo, mat.skin));

  // Ears
  const earGeo = new THREE.SphereGeometry(0.032, 12, 12); earGeo.scale(0.5,1,0.7);
  const lEar = new THREE.Mesh(earGeo, mat.skin); lEar.position.set(-0.16, 0, 0); headGroup.add(lEar);
  const rEar = new THREE.Mesh(earGeo, mat.skin); rEar.position.set(0.16, 0, 0); headGroup.add(rEar);

  // Eyes
  const eyeWhiteGeo = new THREE.SphereGeometry(0.026, 12, 12);
  const lEye = new THREE.Mesh(eyeWhiteGeo, mat.white); lEye.position.set(-0.055, 0.025, 0.14); headGroup.add(lEye);
  const rEye = new THREE.Mesh(eyeWhiteGeo, mat.white); rEye.position.set(0.055, 0.025, 0.14); headGroup.add(rEye);
  const pupilGeo = new THREE.SphereGeometry(0.014, 8, 8);
  const lPupil = new THREE.Mesh(pupilGeo, mat.eye); lPupil.position.set(-0.054, 0.025, 0.155); headGroup.add(lPupil);
  const rPupil = new THREE.Mesh(pupilGeo, mat.eye); rPupil.position.set(0.056, 0.025, 0.155); headGroup.add(rPupil);

  // Eyebrows
  const browGeo = new THREE.BoxGeometry(0.055, 0.009, 0.01);
  const browMat = new THREE.MeshBasicMaterial({ color: hexToThree(hairHex) });
  const lBrow = new THREE.Mesh(browGeo, browMat); lBrow.position.set(-0.055, 0.068, 0.145); headGroup.add(lBrow);
  const rBrow = new THREE.Mesh(browGeo, browMat); rBrow.position.set(0.055, 0.068, 0.145); headGroup.add(rBrow);

  // Nose
  const noseGeo = new THREE.ConeGeometry(0.018, 0.038, 8);
  const nose = new THREE.Mesh(noseGeo, mat.skin); nose.rotation.x = Math.PI/2;
  nose.position.set(0, -0.005, 0.158); headGroup.add(nose);

  // Mouth
  const mouthGeo = new THREE.TorusGeometry(0.028, 0.007, 6, 16, Math.PI);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0xb05050 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat); mouth.position.set(0,-0.045,0.147); mouth.rotation.z = Math.PI; headGroup.add(mouth);

  // ── Hair ──
  if (design.hairStyle !== 'none') {
    const hMat = new THREE.MeshStandardMaterial({ color: hexToThree(hairHex), roughness: 0.9 });
    if (design.hairStyle === 'short') {
      const hGeo = new THREE.SphereGeometry(0.162, 24, 24, 0, Math.PI*2, 0, Math.PI*0.55);
      headGroup.add(new THREE.Mesh(hGeo, hMat));
    } else if (design.hairStyle === 'medium') {
      const hGeo = new THREE.SphereGeometry(0.168, 24, 24, 0, Math.PI*2, 0, Math.PI*0.65);
      headGroup.add(new THREE.Mesh(hGeo, hMat));
      const sideGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.18, 12);
      const lSide = new THREE.Mesh(sideGeo, hMat); lSide.position.set(-0.17,-0.09,0); headGroup.add(lSide);
      const rSide = new THREE.Mesh(sideGeo, hMat); rSide.position.set(0.17,-0.09,0); headGroup.add(rSide);
    } else if (design.hairStyle === 'long') {
      const hGeo = new THREE.SphereGeometry(0.168, 24, 24, 0, Math.PI*2, 0, Math.PI*0.65);
      headGroup.add(new THREE.Mesh(hGeo, hMat));
      const longGeo = new THREE.CylinderGeometry(0.05, 0.03, 0.5, 10);
      const lLong = new THREE.Mesh(longGeo, hMat); lLong.position.set(-0.14,-0.3,0); headGroup.add(lLong);
      const rLong = new THREE.Mesh(longGeo, hMat); rLong.position.set(0.14,-0.3,0); headGroup.add(rLong);
      const backGeo = new THREE.BoxGeometry(0.26, 0.5, 0.04);
      const back = new THREE.Mesh(backGeo, hMat); back.position.set(0,-0.28,-0.12); headGroup.add(back);
    } else if (design.hairStyle === 'curly') {
      for (let i=0;i<10;i++){
        const cx = (Math.random()-0.5)*0.28;
        const cy = 0.05 + Math.random()*0.12;
        const cz = (Math.random()-0.5)*0.28;
        const cGeo = new THREE.SphereGeometry(0.045+Math.random()*0.02, 8, 8);
        const curl = new THREE.Mesh(cGeo, hMat); curl.position.set(cx,cy,cz); headGroup.add(curl);
      }
    } else if (design.hairStyle === 'mohawk') {
      const mGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.22, 10);
      const m = new THREE.Mesh(mGeo, hMat); m.position.set(0, 0.22, 0); m.rotation.z = 0.1; headGroup.add(m);
    } else if (design.hairStyle === 'bun') {
      const hGeo = new THREE.SphereGeometry(0.162, 24, 24, 0, Math.PI*2, 0, Math.PI*0.55);
      headGroup.add(new THREE.Mesh(hGeo, hMat));
      const bunGeo = new THREE.SphereGeometry(0.06, 14, 14);
      const bun = new THREE.Mesh(bunGeo, hMat); bun.position.set(0, 0.14, -0.1); headGroup.add(bun);
    } else if (design.hairStyle === 'afro') {
      const aGeo = new THREE.SphereGeometry(0.22, 20, 20);
      const afro = new THREE.Mesh(aGeo, hMat); afro.position.set(0, 0.04, 0); headGroup.add(afro);
    }
  }

  // ── Cap ──
  if (design.capStyle !== 'none') {
    const cMat = new THREE.MeshStandardMaterial({ color: hexToThree(capHex), roughness: 0.6 });
    if (design.capStyle === 'baseball') {
      const domGeo = new THREE.SphereGeometry(0.168, 20, 20, 0, Math.PI*2, 0, Math.PI*0.5);
      headGroup.add(new THREE.Mesh(domGeo, cMat));
      const brimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.012, 20, 1, false, -0.55, 1.1);
      const brim = new THREE.Mesh(brimGeo, cMat); brim.position.set(0, -0.02, 0); headGroup.add(brim);
    } else if (design.capStyle === 'beanie') {
      const bGeo = new THREE.SphereGeometry(0.172, 20, 20, 0, Math.PI*2, 0, Math.PI*0.5);
      headGroup.add(new THREE.Mesh(bGeo, cMat));
      const bandGeo = new THREE.TorusGeometry(0.162, 0.02, 8, 32);
      const band = new THREE.Mesh(bandGeo, new THREE.MeshStandardMaterial({color:hexToThree(capHex),roughness:0.9}));
      band.position.y = -0.03; headGroup.add(band);
    } else if (design.capStyle === 'tophat') {
      const crownGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.22, 20);
      const crown = new THREE.Mesh(crownGeo, cMat); crown.position.y = 0.22; headGroup.add(crown);
      const brimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.015, 20);
      headGroup.add(new THREE.Mesh(brimGeo, cMat));
    } else if (design.capStyle === 'cowboy') {
      const crownGeo = new THREE.CylinderGeometry(0.1, 0.13, 0.18, 20);
      const crown = new THREE.Mesh(crownGeo, cMat); crown.position.y = 0.12; headGroup.add(crown);
      const brimGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 32); brimGeo.scale(1, 0.3, 1);
      const brim = new THREE.Mesh(brimGeo, cMat); brim.position.y = 0.02; headGroup.add(brim);
    } else if (design.capStyle === 'beret') {
      const bGeo = new THREE.SphereGeometry(0.18, 20, 20, 0, Math.PI*2, 0, Math.PI*0.45);
      const beret = new THREE.Mesh(bGeo, cMat); beret.position.set(0.04, 0.06, 0); beret.rotation.z = -0.15; headGroup.add(beret);
    }
  }

  // ── Glasses ──
  if (design.glassesStyle !== 'none') {
    const gMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.2 });
    const lensMat = design.glassesStyle === 'sunglasses'
      ? new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.7, metalness: 0.5 })
      : mat.glass;

    if (design.glassesStyle === 'round' || design.glassesStyle === 'sunglasses') {
      const lensGeo = new THREE.TorusGeometry(0.036, 0.006, 8, 24);
      const lLens = new THREE.Mesh(lensGeo, gMat); lLens.position.set(-0.055, 0.025, 0.155); headGroup.add(lLens);
      const rLens = new THREE.Mesh(lensGeo, gMat); rLens.position.set(0.055, 0.025, 0.155); headGroup.add(rLens);
      const lFill = new THREE.Mesh(new THREE.CircleGeometry(0.033,16), lensMat); lFill.position.set(-0.055,0.025,0.154); headGroup.add(lFill);
      const rFill = new THREE.Mesh(new THREE.CircleGeometry(0.033,16), lensMat); rFill.position.set(0.055,0.025,0.154); headGroup.add(rFill);
    } else if (design.glassesStyle === 'square' || design.glassesStyle === 'half-rim') {
      const lFrame = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.045, 0.005), gMat); lFrame.position.set(-0.056, 0.025, 0.155); headGroup.add(lFrame);
      const rFrame = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.045, 0.005), gMat); rFrame.position.set(0.056, 0.025, 0.155); headGroup.add(rFrame);
      const lFill = new THREE.Mesh(new THREE.PlaneGeometry(0.064,0.038), lensMat); lFill.position.set(-0.056,0.025,0.154); headGroup.add(lFill);
      const rFill = new THREE.Mesh(new THREE.PlaneGeometry(0.064,0.038), lensMat); rFill.position.set(0.056,0.025,0.154); headGroup.add(rFill);
    } else if (design.glassesStyle === 'aviator') {
      const aGeo = new THREE.TorusGeometry(0.038, 0.006, 8, 20); aGeo.scale(1, 1.2, 1);
      const lLens = new THREE.Mesh(aGeo, gMat); lLens.position.set(-0.055, 0.018, 0.155); headGroup.add(lLens);
      const rLens = new THREE.Mesh(aGeo.clone(), gMat); rLens.position.set(0.055, 0.018, 0.155); headGroup.add(rLens);
      const lFill = new THREE.Mesh(new THREE.CircleGeometry(0.035,16), lensMat); lFill.position.set(-0.055,0.018,0.153); headGroup.add(lFill);
      const rFill = new THREE.Mesh(new THREE.CircleGeometry(0.035,16), lensMat); rFill.position.set(0.055,0.018,0.153); headGroup.add(rFill);
    }
    // Bridge
    const bridgeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.038, 8);
    const bridge = new THREE.Mesh(bridgeGeo, gMat); bridge.rotation.z = Math.PI/2; bridge.position.set(0, 0.025, 0.155); headGroup.add(bridge);
    // Temples
    const templeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.18, 8);
    const lTemple = new THREE.Mesh(templeGeo, gMat); lTemple.rotation.z = Math.PI/2; lTemple.position.set(-0.155, 0.025, 0.06); headGroup.add(lTemple);
    const rTemple = new THREE.Mesh(templeGeo, gMat); rTemple.rotation.z = Math.PI/2; rTemple.position.set(0.155, 0.025, 0.06); headGroup.add(rTemple);
  }

  // Idle animation state
  return { root, headGroup, time: 0 };
}

// ─── Component ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'body',       label: 'Body',        emoji: '🧬' },
  { id: 'hair',       label: 'Hair',        emoji: '💇' },
  { id: 'outfit',     label: 'Outfit',      emoji: '👕' },
  { id: 'pants',      label: 'Pants',       emoji: '👖' },
  { id: 'shoes',      label: 'Shoes',       emoji: '👟' },
  { id: 'cap',        label: 'Cap',         emoji: '🧢' },
  { id: 'glasses',    label: 'Glasses',     emoji: '🕶️' },
  { id: 'jacket',     label: 'Jacket',      emoji: '🧥' },
  { id: 'watch',      label: 'Watch',       emoji: '⌚' },
  { id: 'background', label: 'Background',  emoji: '🌆' },
];

export default function AvatarDesignerPage() {
  const [design, setDesign] = useState(loadDesign);
  const [activeCategory, setActiveCategory] = useState('body');
  const [copied, setCopied] = useState(false);
  const [saved,  setSaved]  = useState(false);  // toast state for Save button

  const mountRef      = useRef(null);
  const sceneRef      = useRef(null);
  const rendererRef   = useRef(null);
  const cameraRef     = useRef(null);
  const rigRef        = useRef(null);
  const rafRef        = useRef(null);
  const dragRef       = useRef({ active: false, prev: { x:0, y:0 } });
  const designRef     = useRef(design);

  useEffect(() => { designRef.current = design; }, [design]);

  const update = useCallback((partial) => {
    setDesign(prev => {
      const next = { ...prev, ...partial };
      saveDesign(next);
      // Broadcast to all pages so the avatar updates immediately on every change
      window.dispatchEvent(new CustomEvent('avatar-design-saved', { detail: next }));
      return next;
    });
  }, []);

  // ── Rebuild rig when design changes ──────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    // Remove old rig
    if (rigRef.current) {
      scene.remove(rigRef.current.root);
      rigRef.current.root.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    }
    // Set background
    const bgHex = BG_PRESETS.find(b => b.id === design.background)?.color || '#0a0f1e';
    scene.background = new THREE.Color(bgHex);
    // Build new rig
    rigRef.current = buildDesignerRig(scene, design);
  }, [design]);

  // ── Three.js init ──────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth  || 480;
    const H = container.clientHeight || 560;

    const scene    = new THREE.Scene();
    scene.background = new THREE.Color('#0a0f1e');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, W/H, 0.1, 100);
    camera.position.set(0, 0.6, 2.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xfff5e0, 1.4); key.position.set(2, 4, 3); key.castShadow = true; scene.add(key);
    const rim = new THREE.DirectionalLight(0x38bdf8, 0.8); rim.position.set(-2, 2, -2); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4); fill.position.set(0, -1, 3); scene.add(fill);

    // Ground
    const groundGeo = new THREE.CircleGeometry(0.85, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat); ground.rotation.x = -Math.PI/2; ground.position.y = -0.37; scene.add(ground);
    // Shadow ring
    const ringGeo = new THREE.RingGeometry(0.28, 0.85, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = -Math.PI/2; ring.position.y = -0.368; scene.add(ring);

    // Build initial rig
    rigRef.current = buildDesignerRig(scene, designRef.current);

    // rAF loop
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      if (rigRef.current) {
        rigRef.current.time = (rigRef.current.time || 0) + 0.012;
        const t = rigRef.current.time;
        rigRef.current.root.rotation.y += 0.004; // slow auto-rotate
        // subtle idle bob
        rigRef.current.root.position.y = Math.sin(t * 0.8) * 0.008;
        // head slight nod
        if (rigRef.current.headGroup) {
          rigRef.current.headGroup.rotation.y = Math.sin(t * 0.5) * 0.04;
          rigRef.current.headGroup.rotation.x = Math.sin(t * 0.35) * 0.02;
        }
      }
      renderer.render(scene, camera);
    };
    loop();

    // Drag to orbit
    const el = renderer.domElement;
    const onDown = (e) => { dragRef.current.active = true; dragRef.current.prev = { x:e.clientX, y:e.clientY }; };
    const onMove = (e) => {
      if (!dragRef.current.active || !rigRef.current) return;
      const dx = e.clientX - dragRef.current.prev.x;
      const dy = e.clientY - dragRef.current.prev.y;
      rigRef.current.root.rotation.y += dx * 0.012;
      rigRef.current.root.rotation.x = Math.max(-0.4, Math.min(0.4, rigRef.current.root.rotation.x + dy * 0.008));
      dragRef.current.prev = { x:e.clientX, y:e.clientY };
    };
    const onUp = () => { dragRef.current.active = false; };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // Touch
    el.addEventListener('touchstart', (e) => onDown(e.touches[0]));
    window.addEventListener('touchmove', (e) => onMove(e.touches[0]));
    window.addEventListener('touchend', onUp);

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function resetDesign() {
    setDesign({ ...DEFAULT_DESIGN });
    saveDesign({ ...DEFAULT_DESIGN });
  }

  function exportDesign() {
    const code = JSON.stringify(design, null, 2);
    navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  /** Persist current design AND broadcast to all listening components/pages */
  function saveAndBroadcast() {
    saveDesign(design);
    // Notify every hook/component subscribed to 'avatar-design-saved'
    window.dispatchEvent(new CustomEvent('avatar-design-saved', { detail: design }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── Panel renderers ────────────────────────────────────────────────────────
  const renderPanel = () => {
    switch (activeCategory) {
      case 'body': return (
        <div className="designer-panel-content">
          <PanelSection title="Skin Tone">
            <div className="swatch-grid">
              {SKIN_TONES.map(s => (
                <button key={s.id} type="button" className={`color-swatch ${design.skinTone===s.id?'active':''}`}
                  style={{ background: s.hex }} title={s.label}
                  onClick={() => update({ skinTone: s.id })}>
                  {design.skinTone===s.id && <span className="swatch-check">✓</span>}
                </button>
              ))}
            </div>
            <p className="panel-hint">Selected: <strong>{SKIN_TONES.find(s=>s.id===design.skinTone)?.label}</strong></p>
          </PanelSection>
          <PanelSection title="Avatar Name">
            <input className="designer-name-input" value={design.avatarName}
              onChange={e => update({ avatarName: e.target.value })}
              placeholder="Name your avatar…" maxLength={24} />
          </PanelSection>
        </div>
      );
      case 'hair': return (
        <div className="designer-panel-content">
          <PanelSection title="Hair Style">
            <div className="style-card-grid">
              {HAIR_STYLES.map(h => (
                <button key={h.id} type="button" className={`style-card ${design.hairStyle===h.id?'active':''}`}
                  onClick={() => update({ hairStyle: h.id })}>
                  <span className="style-card-emoji">{h.emoji}</span>
                  <span className="style-card-label">{h.label}</span>
                </button>
              ))}
            </div>
          </PanelSection>
          <PanelSection title="Hair Color">
            <div className="swatch-grid swatch-grid--wide">
              {HAIR_COLORS.map(c => (
                <button key={c.id} type="button" className={`color-swatch ${design.hairColor===c.id?'active':''}`}
                  style={{ background: c.hex }} title={c.id}
                  onClick={() => update({ hairColor: c.id })}>
                  {design.hairColor===c.id && <span className="swatch-check">✓</span>}
                </button>
              ))}
            </div>
          </PanelSection>
        </div>
      );
      case 'outfit': return (
        <div className="designer-panel-content">
          <PanelSection title="Outfit Style">
            <div className="style-card-grid">
              {OUTFIT_STYLES.map(o => (
                <button key={o.id} type="button" className={`style-card ${design.outfitStyle===o.id?'active':''}`}
                  onClick={() => update({ outfitStyle: o.id })}>
                  <span className="style-card-emoji">{o.emoji}</span>
                  <span className="style-card-label">{o.label}</span>
                </button>
              ))}
            </div>
          </PanelSection>
          <PanelSection title="Outfit Color">
            <div className="swatch-grid swatch-grid--wide">
              {OUTFIT_COLORS.map(c => (
                <button key={c.id} type="button" className={`color-swatch ${design.outfitColor===c.id?'active':''}`}
                  style={{ background: c.hex }} title={c.id}
                  onClick={() => update({ outfitColor: c.id })}>
                  {design.outfitColor===c.id && <span className="swatch-check">✓</span>}
                </button>
              ))}
            </div>
          </PanelSection>
        </div>
      );
      case 'pants': return (
        <div className="designer-panel-content">
          <PanelSection title="Pants Color">
            <div className="style-card-grid">
              {PANTS_COLORS.map(p => (
                <button key={p.id} type="button"
                  className={`style-card style-card--color ${design.pantsColor===p.id?'active':''}`}
                  onClick={() => update({ pantsColor: p.id })}>
                  <span className="style-card-swatch" style={{ background: p.hex }} />
                  <span className="style-card-label">{p.label}</span>
                </button>
              ))}
            </div>
          </PanelSection>
        </div>
      );
      case 'shoes': return (
        <div className="designer-panel-content">
          <PanelSection title="Shoe Style">
            <div className="style-card-grid">
              {SHOE_STYLES.map(s => (
                <button key={s.id} type="button" className={`style-card ${design.shoeStyle===s.id?'active':''}`}
                  onClick={() => update({ shoeStyle: s.id })}>
                  <span className="style-card-emoji">{s.emoji}</span>
                  <span className="style-card-label">{s.label}</span>
                </button>
              ))}
            </div>
          </PanelSection>
          <PanelSection title="Shoe Color">
            <div className="swatch-grid">
              {SHOE_COLORS.map(c => (
                <button key={c.id} type="button" className={`color-swatch ${design.shoeColor===c.id?'active':''}`}
                  style={{ background: c.hex }}
                  onClick={() => update({ shoeColor: c.id })}>
                  {design.shoeColor===c.id && <span className="swatch-check">✓</span>}
                </button>
              ))}
            </div>
          </PanelSection>
        </div>
      );
      case 'cap': return (
        <div className="designer-panel-content">
          <PanelSection title="Cap Style">
            <div className="style-card-grid">
              {CAP_STYLES.map(c => (
                <button key={c.id} type="button" className={`style-card ${design.capStyle===c.id?'active':''}`}
                  onClick={() => update({ capStyle: c.id })}>
                  <span className="style-card-emoji">{c.emoji}</span>
                  <span className="style-card-label">{c.label}</span>
                </button>
              ))}
            </div>
          </PanelSection>
          {design.capStyle !== 'none' && (
            <PanelSection title="Cap Color">
              <div className="swatch-grid">
                {CAP_COLORS.map(c => (
                  <button key={c.id} type="button" className={`color-swatch ${design.capColor===c.id?'active':''}`}
                    style={{ background: c.hex }}
                    onClick={() => update({ capColor: c.id })}>
                    {design.capColor===c.id && <span className="swatch-check">✓</span>}
                  </button>
                ))}
              </div>
            </PanelSection>
          )}
        </div>
      );
      case 'glasses': return (
        <div className="designer-panel-content">
          <PanelSection title="Glasses Style">
            <div className="style-card-grid">
              {GLASSES_STYLES.map(g => (
                <button key={g.id} type="button" className={`style-card ${design.glassesStyle===g.id?'active':''}`}
                  onClick={() => update({ glassesStyle: g.id })}>
                  <span className="style-card-emoji">{g.emoji}</span>
                  <span className="style-card-label">{g.label}</span>
                </button>
              ))}
            </div>
          </PanelSection>
        </div>
      );
      case 'jacket': return (
        <div className="designer-panel-content">
          <PanelSection title="Jacket / Outerwear">
            <div className="style-card-grid">
              {JACKET_STYLES.map(j => (
                <button key={j.id} type="button" className={`style-card ${design.jacketStyle===j.id?'active':''}`}
                  onClick={() => update({ jacketStyle: j.id })}>
                  <span className="style-card-emoji">{j.emoji}</span>
                  <span className="style-card-label">{j.label}</span>
                </button>
              ))}
            </div>
          </PanelSection>
        </div>
      );
      case 'watch': return (
        <div className="designer-panel-content">
          <PanelSection title="Watch Style">
            <div className="style-card-grid">
              {WATCH_STYLES.map(w => (
                <button key={w.id} type="button" className={`style-card ${design.watchStyle===w.id?'active':''}`}
                  onClick={() => update({ watchStyle: w.id })}>
                  <span className="style-card-emoji">{w.emoji}</span>
                  <span className="style-card-label">{w.label}</span>
                </button>
              ))}
            </div>
          </PanelSection>
        </div>
      );
      case 'background': return (
        <div className="designer-panel-content">
          <PanelSection title="Scene Background">
            <div className="style-card-grid">
              {BG_PRESETS.map(b => (
                <button key={b.id} type="button"
                  className={`style-card style-card--bg ${design.background===b.id?'active':''}`}
                  onClick={() => update({ background: b.id })}>
                  <span className="style-card-swatch" style={{ background: b.color }} />
                  <span className="style-card-label">{b.label}</span>
                </button>
              ))}
            </div>
          </PanelSection>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="avatar-designer-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">🎨 CHARACTER DESIGNER</span>
          <h2>Custom Avatar Studio</h2>
          <p>Design your own 3D signing avatar — hair, skin, outfit, shoes, glasses, cap, jacket, watch and more. Drag to orbit the model.</p>
        </div>
        <div className="designer-header-actions">
          <button type="button" className="designer-reset-btn" onClick={resetDesign}>↺ Reset</button>
          <button type="button" className={`copy-sentence-btn ${copied?'copy-sentence-btn--copied':''}`} onClick={exportDesign}>
            {copied ? '✓ Copied!' : '⎘ Export JSON'}
          </button>
          {/* Primary Save button — persists design + broadcasts to all pages */}
          <button
            type="button"
            className={`designer-save-btn ${saved ? 'designer-save-btn--saved' : ''}`}
            onClick={saveAndBroadcast}
          >
            {saved ? (
              <><span className="save-check">✓</span> Saved to all pages!</>
            ) : (
              <><span className="save-icon">💾</span> Save Design</>
            )}
          </button>
        </div>
      </header>

      <div className="avatar-designer-layout">
        {/* Left: Category tabs */}
        <nav className="designer-category-nav">
          {CATEGORIES.map(cat => (
            <button key={cat.id} type="button"
              className={`designer-cat-btn ${activeCategory===cat.id?'designer-cat-btn--active':''}`}
              onClick={() => setActiveCategory(cat.id)}>
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </nav>

        {/* Centre: 3D Canvas */}
        <div className="designer-canvas-col">
          <div className="designer-canvas-wrap" ref={mountRef} />
          <div className="designer-canvas-overlay">
            <span className="designer-avatar-name">{design.avatarName}</span>
            <span className="designer-hint">Drag to rotate · Design saves automatically</span>
          </div>
        </div>

        {/* Right: Options panel */}
        <div className="designer-options-panel">
          <div className="designer-panel-header">
            <span>{CATEGORIES.find(c=>c.id===activeCategory)?.emoji} {CATEGORIES.find(c=>c.id===activeCategory)?.label}</span>
          </div>
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}

// ── Small helper sub-components ───────────────────────────────────────────────
function PanelSection({ title, children }) {
  return (
    <div className="panel-section">
      <span className="panel-section-title">{title}</span>
      {children}
    </div>
  );
}
