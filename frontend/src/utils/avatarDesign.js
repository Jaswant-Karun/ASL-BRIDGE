/**
 * avatarDesign.js
 *
 * Single shared source of truth for the custom avatar design.
 * All components that render 3D avatars import from here so the
 * Character Designer changes propagate everywhere automatically.
 *
 * Storage key: 'avatar-design'  (same key used by AvatarDesignerPage)
 */

// ─── Colour tables (mirrors AvatarDesignerPage constants) ────────────────────
const SKIN_TONES = [
  { id: 'light',  hex: '#fcd5b5' },
  { id: 'fair',   hex: '#f5c6a0' },
  { id: 'medium', hex: '#d4956b' },
  { id: 'tan',    hex: '#bf7f4e' },
  { id: 'brown',  hex: '#8d5524' },
  { id: 'dark',   hex: '#5c3317' },
];

const OUTFIT_COLORS = [
  { id: 'navy',   hex: '#1a237e' },
  { id: 'black',  hex: '#212121' },
  { id: 'white',  hex: '#f5f5f5' },
  { id: 'red',    hex: '#c62828' },
  { id: 'green',  hex: '#1b5e20' },
  { id: 'teal',   hex: '#004d40' },
  { id: 'grey',   hex: '#546e7a' },
  { id: 'purple', hex: '#4a148c' },
  { id: 'orange', hex: '#e65100' },
  { id: 'brown',  hex: '#4e342e' },
  { id: 'pink',   hex: '#880e4f' },
  { id: 'cyan',   hex: '#006064' },
];

const HAIR_COLORS = [
  { id: 'black',  hex: '#1a1008' },
  { id: 'brown',  hex: '#5c3317' },
  { id: 'auburn', hex: '#8b3a1e' },
  { id: 'blonde', hex: '#d4aa5e' },
  { id: 'red',    hex: '#c0392b' },
  { id: 'grey',   hex: '#9e9e9e' },
  { id: 'white',  hex: '#f0f0f0' },
  { id: 'blue',   hex: '#1565c0' },
  { id: 'pink',   hex: '#e91e8c' },
  { id: 'green',  hex: '#2e7d32' },
  { id: 'purple', hex: '#6a1b9a' },
  { id: 'orange', hex: '#e65100' },
];

const DEFAULT_DESIGN = {
  skinTone:    'fair',
  hairStyle:   'short',
  hairColor:   'brown',
  outfitStyle: 'shirt',
  outfitColor: 'white',
  pantsColor:  'jeans',
  shoeStyle:   'formal',
  shoeColor:   'black',
  capStyle:    'none',
  capColor:    'black',
  glassesStyle:'none',
  watchStyle:  'none',
  jacketStyle: 'blazer',
  background:  'studio',
  avatarName:  'ASL Presenter',
};

function findHex(arr, id) {
  return arr.find(x => x.id === id)?.hex || null;
}

// ─── Load raw design from localStorage ───────────────────────────────────────
export function loadAvatarDesign() {
  try {
    const raw = localStorage.getItem('avatar-design');
    if (!raw) return null;                 // no saved design yet
    return { ...DEFAULT_DESIGN, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

/**
 * Resolve a saved design into ready-to-use CSS hex colour strings.
 * Returns null if no design has been saved.
 */
export function resolveDesignColors(design) {
  if (!design) return null;
  return {
    skinHex:   findHex(SKIN_TONES,    design.skinTone)   || '#d4956b',
    outfitHex: findHex(OUTFIT_COLORS, design.outfitColor)|| '#1a237e',
    hairHex:   findHex(HAIR_COLORS,   design.hairColor)  || '#1a1008',
    avatarName: design.avatarName || 'My Avatar',
    accentColor: findHex(OUTFIT_COLORS, design.outfitColor) || '#38bdf8',
  };
}

/**
 * Build the avatar object expected by AnimateDiffMotionVideoEngine
 * and AnimateDiffStudio from a saved design.
 * Returns null when no design has been saved yet (fallback to presets).
 */
export function buildAvatarFromDesign() {
  const design = loadAvatarDesign();
  if (!design) return null;
  const colors = resolveDesignColors(design);
  return {
    id:          'designer',
    name:        colors.avatarName,
    role:        'Custom Character',
    badge:       'My Design',
    avatarImage: '/assets/avatars/marcus.png',  // fallback thumbnail
    accentColor: colors.accentColor,
    // custom colour overrides read by buildCartoonAvatar
    customSkinHex:   colors.skinHex,
    customOutfitHex: colors.outfitHex,
    customHairHex:   colors.hairHex,
  };
}

/**
 * React hook — returns the resolved design colours (or null) and re-renders
 * whenever the design changes (listens to the 'avatar-design-saved' custom event
 * dispatched by AvatarDesignerPage on Save).
 */
import { useState, useEffect } from 'react';

export function useAvatarDesign() {
  const [avatar, setAvatar] = useState(() => buildAvatarFromDesign());

  useEffect(() => {
    // Also refresh whenever storage changes in another tab
    const onStorage = (e) => {
      if (e.key === 'avatar-design') setAvatar(buildAvatarFromDesign());
    };
    const onSaved = () => setAvatar(buildAvatarFromDesign());
    window.addEventListener('avatar-design-saved', onSaved);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('avatar-design-saved', onSaved);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return avatar;   // null = no saved design → use page default
}
