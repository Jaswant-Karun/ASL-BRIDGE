/**
 * GestureStrip
 * Shows ASL hand gesture images one letter at a time, in strict left-to-right
 * sequential order, with a progress bar, play/pause, speed control, and a
 * scrollable tile rail.
 *
 * Design principle: ALL timing lives in a single useEffect that owns one
 * requestAnimationFrame loop. No setInterval, no external timers, no stale
 * closures. The rAF loop reads everything it needs from refs so it is always
 * up-to-date regardless of React render cycles.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const HANDSHAPE = {
  a:'A-Fist', b:'Flat-B', c:'C-Shape', d:'1-D', e:'Claw-E',
  f:'OK/F', g:'G-Pointer', h:'H-Double', i:'I-Pinky', j:'J-Trace',
  k:'K-Peace', l:'L-Angle', m:'M-Tuck', n:'N-Tuck', o:'O-Ring',
  p:'P-Down', q:'Q-Down', r:'R-Cross', s:'S-Fist', t:'T-Tuck',
  u:'U-Pair', v:'V-Peace', w:'W-Three', x:'X-Hook', y:'Y-Horn',
  z:'Z-Trace',
  '0':'Zero','1':'One','2':'Two','3':'Three','4':'Four',
  '5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine',
};

const SPEEDS = [
  { label: 'Slow',   ms: 1800 },
  { label: 'Normal', ms: 1100 },
  { label: 'Fast',   ms: 550  },
];

function parseLetters(text) {
  const out = [];
  text.trim().split(/\s+/).filter(Boolean).forEach((word, wi) => {
    const clean = word.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean) return;
    clean.toLowerCase().split('').forEach((ch, ci) => {
      if (!HANDSHAPE[ch]) return;
      out.push({ id:`${wi}-${ci}-${ch}`, ch, word: clean.toUpperCase(), wordIdx: wi, isWordStart: ci === 0 });
    });
  });
  return out;
}

export default function GestureStrip({ text = '', currentSpokenWord = '', isSpeaking = false }) {
  const letters = useMemo(() => parseLetters(text), [text]);

  // ── display state ──────────────────────────────────────────────────────
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs,   setSpeedMs]   = useState(1100);
  const [progress,  setProgress]  = useState(0);

  // ── refs (readable by rAF loop without stale closure) ─────────────────
  const playingRef    = useRef(false);
  const speedRef      = useRef(1100);
  const idxRef        = useRef(0);
  const lettersRef    = useRef(letters);
  const rafRef        = useRef(null);
  const letterStartTs = useRef(0);   // timestamp when current letter began
  const tileRefs      = useRef([]);  // one ref per tile for auto-scroll
  const railRef       = useRef(null);

  // keep lettersRef in sync
  useEffect(() => { lettersRef.current = letters; }, [letters]);

  // ── The single rAF loop — owns ALL timing ─────────────────────────────
  useEffect(() => {
    const loop = (now) => {
      if (!playingRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const elapsed = now - letterStartTs.current;
      const dur     = speedRef.current;
      const pct     = Math.min(elapsed / dur, 1);
      setProgress(pct);

      if (pct >= 1) {
        // Time to advance to the next letter
        const len  = lettersRef.current.length;
        const next = idxRef.current + 1;

        if (next >= len) {
          // Finished the last letter — stop and go back to start
          playingRef.current = false;
          setIsPlaying(false);
          idxRef.current = 0;
          setActiveIdx(0);
          setProgress(0);
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        idxRef.current    = next;
        letterStartTs.current = now;
        setActiveIdx(next);        // re-render with new letter
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // runs once — loop reads everything from refs

  // ── Auto-scroll active tile into view ─────────────────────────────────
  useEffect(() => {
    const el = tileRefs.current[activeIdx];
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIdx]);

  // ── Sync spoken word from avatar ──────────────────────────────────────
  useEffect(() => {
    if (!currentSpokenWord || !isSpeaking) return;
    const upper = currentSpokenWord.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const idx = lettersRef.current.findIndex((t) => t.word === upper && t.isWordStart);
    if (idx === -1) return;
    idxRef.current    = idx;
    letterStartTs.current = performance.now();
    setActiveIdx(idx);
    playingRef.current = true;
    setIsPlaying(true);
  }, [currentSpokenWord, isSpeaking]);

  // ── Reset when text changes, auto-start after a short delay ──────────
  useEffect(() => {
    playingRef.current    = false;
    idxRef.current        = 0;
    letterStartTs.current = 0;
    setActiveIdx(0);
    setIsPlaying(false);
    setProgress(0);

    if (letters.length === 0) return;

    const t = setTimeout(() => {
      idxRef.current        = 0;
      letterStartTs.current = performance.now();
      playingRef.current    = true;
      setIsPlaying(true);
    }, 350); // small delay so the first image has time to load

    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────
  function togglePlay() {
    if (playingRef.current) {
      playingRef.current = false;
      setIsPlaying(false);
    } else {
      letterStartTs.current = performance.now() - (progress * speedRef.current); // resume mid-bar
      playingRef.current    = true;
      setIsPlaying(true);
    }
  }

  function stepTo(targetIdx) {
    playingRef.current    = false;
    setIsPlaying(false);
    const clamped = Math.max(0, Math.min(letters.length - 1, targetIdx));
    idxRef.current        = clamped;
    letterStartTs.current = 0;
    setActiveIdx(clamped);
    setProgress(0);
  }

  function changeSpeed(ms) {
    speedRef.current = ms;
    setSpeedMs(ms);
    if (playingRef.current) letterStartTs.current = performance.now(); // restart bar for this letter
  }

  // ── Empty state ────────────────────────────────────────────────────────
  if (letters.length === 0) {
    return (
      <div className="gesture-strip gesture-strip--empty">
        <p className="gesture-strip__placeholder">Type or speak a sentence to see the ASL hand gestures here.</p>
      </div>
    );
  }

  const currentLetter = letters[activeIdx] ?? letters[0];
  const progressPct   = Math.round(progress * 100);

  return (
    <div className="gesture-strip" aria-label="ASL letter gesture strip">

      {/* Header */}
      <div className="gesture-strip__header">
        <span className="gesture-strip__kicker">🖐 ASL HAND GESTURES</span>
        <span className="gesture-strip__count">{activeIdx + 1} / {letters.length}</span>
      </div>

      {/* Big active card */}
      <ActiveCard letter={currentLetter} isPlaying={isPlaying} />

      {/* Progress bar */}
      <div className="gesture-strip__progress-track" aria-hidden="true">
        <div className="gesture-strip__progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Controls */}
      <div className="gesture-strip__controls">
        <button type="button" className="gstrip-ctrl-btn" aria-label="Previous"
          onClick={() => stepTo(idxRef.current - 1)}>◀</button>

        <button type="button"
          className={`gstrip-ctrl-btn gstrip-ctrl-btn--play ${isPlaying ? 'active' : ''}`}
          onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button type="button" className="gstrip-ctrl-btn" aria-label="Next"
          onClick={() => stepTo(idxRef.current + 1)}>▶▶</button>

        <div className="gstrip-speed-group">
          {SPEEDS.map(({ label, ms }) => (
            <button key={label} type="button"
              className={`gstrip-speed-pill ${speedMs === ms ? 'active' : ''}`}
              onClick={() => changeSpeed(ms)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Tile rail */}
      <div className="gesture-strip__rail" ref={railRef}>
        {letters.map((letter, idx) => (
          <button
            key={letter.id}
            ref={(el) => { tileRefs.current[idx] = el; }}
            type="button"
            className={[
              'gesture-strip__tile',
              idx === activeIdx        ? 'gesture-strip__tile--active' : '',
              idx < activeIdx         ? 'gesture-strip__tile--past'   : '',
              letter.isWordStart      ? 'gesture-strip__tile--word-start' : '',
            ].join(' ')}
            onClick={() => stepTo(idx)}
            title={`${letter.ch.toUpperCase()} — ${HANDSHAPE[letter.ch] || 'ASL'}`}
            aria-pressed={idx === activeIdx}
          >
            <img
              src={`${API_BASE}/dataset-image/${letter.ch}?sample=0`}
              alt={`ASL ${letter.ch.toUpperCase()}`}
              className="gesture-strip__tile-img"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `${API_BASE}/dataset-image/${letter.ch}`; }}
            />
            <span className="gesture-strip__tile-char">{letter.ch.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Word labels */}
      <div className="gesture-strip__words" aria-hidden="true">
        {(() => {
          const starts = letters.map((l,i)=>({...l,i})).filter(l=>l.isWordStart);
          return starts.map(({word, i}) => {
            const nextI  = starts.find(s=>s.i>i)?.i ?? letters.length;
            const active = activeIdx >= i && activeIdx < nextI;
            const past   = activeIdx >= nextI;
            return (
              <span key={`${word}-${i}`}
                className={['gesture-strip__word-label',
                  active ? 'gesture-strip__word-label--active' : '',
                  past   ? 'gesture-strip__word-label--past'   : ''].join(' ')}>
                {word}
              </span>
            );
          });
        })()}
      </div>
    </div>
  );
}

/* ── Active large card ────────────────────────────────────────────────────── */
function ActiveCard({ letter, isPlaying }) {
  const [imgSrc,  setImgSrc]  = useState(null);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (!letter) return;
    const sample = letter.ch.charCodeAt(0) % 4;
    setImgSrc(`${API_BASE}/dataset-image/${letter.ch}?sample=${sample}`);
    setFadeKey(k => k + 1);
  }, [letter?.ch]);

  if (!letter) return null;

  return (
    <div className={`gesture-strip__active-card ${isPlaying ? 'gesture-strip__active-card--playing' : ''}`}>
      <div className="gesture-strip__active-img-wrap">
        {imgSrc && (
          <img key={fadeKey} src={imgSrc}
            alt={`ASL sign for ${letter.ch.toUpperCase()}`}
            className="gesture-strip__active-img gesture-strip__active-img--fade"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `${API_BASE}/dataset-image/${letter.ch}`; }}
          />
        )}
        {isPlaying && (
          <div className="gesture-strip__playing-badge" aria-hidden="true">
            <span className="gs-play-dot" /><span className="gs-play-dot" /><span className="gs-play-dot" />
          </div>
        )}
      </div>
      <div className="gesture-strip__active-meta">
        <span className="gesture-strip__active-char">{letter.ch.toUpperCase()}</span>
        <span className="gesture-strip__active-shape">{HANDSHAPE[letter.ch] || 'ASL'}</span>
        <span className="gesture-strip__active-word">Word: {letter.word}</span>
      </div>
    </div>
  );
}
