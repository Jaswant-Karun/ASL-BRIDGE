import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/** All 36 ASL characters with short handshape labels. */
const HANDSHAPE = {
  a: 'A-Fist', b: 'Flat-B', c: 'C-Shape', d: '1-D', e: 'Claw-E',
  f: 'OK/F', g: 'G-Pointer', h: 'H-Double', i: 'I-Pinky', j: 'J-Trace',
  k: 'K-Peace', l: 'L-Angle', m: 'M-Tuck', n: 'N-Tuck', o: 'O-Ring',
  p: 'P-Down', q: 'Q-Down', r: 'R-Cross', s: 'S-Fist', t: 'T-Tuck',
  u: 'U-Pair', v: 'V-Peace', w: 'W-Three', x: 'X-Hook', y: 'Y-Horn',
  z: 'Z-Trace',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
};

/** Speed options in milliseconds per letter */
const SPEED_OPTIONS = [
  { label: 'Slow',   ms: 1800 },
  { label: 'Normal', ms: 1000 },
  { label: 'Fast',   ms: 500  },
];

/** Turn free text into a flat array of letter tokens. */
function parseLetters(text) {
  const tokens = [];
  const words = text.trim().split(/\s+/).filter(Boolean);
  words.forEach((word, wi) => {
    const clean = word.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean) return;
    clean.toLowerCase().split('').forEach((ch, ci) => {
      if (!HANDSHAPE[ch]) return;
      tokens.push({
        id: `${wi}-${ci}-${ch}`,
        ch,
        word: word.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
        wordIdx: wi,
        isWordStart: ci === 0,
      });
    });
  });
  return tokens;
}

export default function GestureStrip({
  text = '',
  currentSpokenWord = '',
  isSpeaking = false,
}) {
  const letters = useMemo(() => parseLetters(text), [text]);

  const [activeIdx, setActiveIdx]   = useState(0);
  const [isPlaying, setIsPlaying]   = useState(true);   // auto-play on load
  const [speedMs, setSpeedMs]       = useState(1000);   // Normal by default

  // Progress within the current letter (0→1), used for the progress bar
  const [progress, setProgress]     = useState(0);

  const timerRef    = useRef(null);
  const rafRef      = useRef(null);
  const startedAt   = useRef(null);   // timestamp when current letter began
  const activeRef   = useRef(null);
  const containerRef = useRef(null);

  // ── Auto-scroll the active tile into view ──────────────────────────────
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth', block: 'nearest', inline: 'center',
    });
  }, [activeIdx]);

  // ── Progress bar animation (rAF loop) ──────────────────────────────────
  const startProgressRaf = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    startedAt.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const pct = Math.min(elapsed / speedMs, 1);
      setProgress(pct);
      if (pct < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [speedMs]);

  // ── Core auto-advance timer ─────────────────────────────────────────────
  const scheduleNext = useCallback(() => {
    clearTimeout(timerRef.current);
    startProgressRaf();

    timerRef.current = setTimeout(() => {
      setActiveIdx((prev) => {
        const next = prev + 1;
        if (next >= letters.length) {
          // Reached the end — pause and go back to start
          setIsPlaying(false);
          setProgress(0);
          return 0;
        }
        return next;
      });
    }, speedMs);
  }, [letters.length, speedMs, startProgressRaf]);

  // Start / stop the slideshow
  useEffect(() => {
    if (isPlaying && letters.length > 0) {
      scheduleNext();
    } else {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      if (!isPlaying) setProgress(0);
    }

    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, activeIdx, speedMs, letters.length]);

  // ── Sync with avatar spoken word while avatar is speaking ───────────────
  useEffect(() => {
    if (!currentSpokenWord || !isSpeaking) return;
    const upper = currentSpokenWord.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const idx = letters.findIndex((t) => t.word === upper && t.isWordStart);
    if (idx !== -1) {
      setActiveIdx(idx);
      setIsPlaying(true);
    }
  }, [currentSpokenWord, isSpeaking, letters]);

  // ── Reset when text changes ─────────────────────────────────────────────
  useEffect(() => {
    setActiveIdx(0);
    setIsPlaying(true);
    setProgress(0);
  }, [text]);

  // ── Manual step ────────────────────────────────────────────────────────
  const step = (dir) => {
    setIsPlaying(false);
    setActiveIdx((prev) => {
      const next = prev + dir;
      if (next < 0) return letters.length - 1;
      if (next >= letters.length) return 0;
      return next;
    });
  };

  if (letters.length === 0) {
    return (
      <div className="gesture-strip gesture-strip--empty">
        <p className="gesture-strip__placeholder">
          Type or speak a sentence to see the ASL hand gestures here.
        </p>
      </div>
    );
  }

  const currentLetter = letters[activeIdx];
  const progressPct   = Math.round(progress * 100);

  return (
    <div className="gesture-strip" aria-label="ASL letter gesture strip">

      {/* ── Header ── */}
      <div className="gesture-strip__header">
        <span className="gesture-strip__kicker">🖐 ASL HAND GESTURES</span>
        <span className="gesture-strip__count">
          {activeIdx + 1} / {letters.length}
        </span>
      </div>

      {/* ── Large active card ── */}
      <ActiveCard letter={currentLetter} isPlaying={isPlaying} />

      {/* ── Progress bar ── */}
      <div className="gesture-strip__progress-track" aria-hidden="true">
        <div
          className="gesture-strip__progress-fill"
          style={{ width: isPlaying ? `${progressPct}%` : '0%' }}
        />
      </div>

      {/* ── Playback controls ── */}
      <div className="gesture-strip__controls">
        <button
          type="button"
          className="gstrip-ctrl-btn"
          onClick={() => step(-1)}
          title="Previous letter"
          aria-label="Previous letter"
        >
          ◀
        </button>

        <button
          type="button"
          className={`gstrip-ctrl-btn gstrip-ctrl-btn--play ${isPlaying ? 'active' : ''}`}
          onClick={() => setIsPlaying((p) => !p)}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          type="button"
          className="gstrip-ctrl-btn"
          onClick={() => step(1)}
          title="Next letter"
          aria-label="Next letter"
        >
          ▶▶
        </button>

        {/* Speed selector */}
        <div className="gstrip-speed-group">
          {SPEED_OPTIONS.map(({ label, ms }) => (
            <button
              key={label}
              type="button"
              className={`gstrip-speed-pill ${speedMs === ms ? 'active' : ''}`}
              onClick={() => setSpeedMs(ms)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable tile rail ── */}
      <div className="gesture-strip__rail" ref={containerRef}>
        {letters.map((letter, idx) => (
          <LetterTile
            key={letter.id}
            letter={letter}
            isActive={idx === activeIdx}
            isPast={idx < activeIdx}
            tileRef={idx === activeIdx ? activeRef : null}
            onClick={() => { setIsPlaying(false); setActiveIdx(idx); }}
          />
        ))}
      </div>

      {/* ── Word label row ── */}
      <WordLabelRow letters={letters} activeIdx={activeIdx} />
    </div>
  );
}

/* ── Active large card ──────────────────────────────────────────────────── */
function ActiveCard({ letter, isPlaying }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [fadeKey, setFadeKey] = useState(0); // forces re-mount on letter change → CSS fade-in

  useEffect(() => {
    if (!letter) return;
    const sample = Math.floor(Math.random() * 4);
    setImgSrc(`${API_BASE}/dataset-image/${letter.ch}?sample=${sample}`);
    setFadeKey((k) => k + 1);
  }, [letter?.ch]);

  if (!letter) return null;

  return (
    <div className={`gesture-strip__active-card ${isPlaying ? 'gesture-strip__active-card--playing' : ''}`}>
      <div className="gesture-strip__active-img-wrap">
        {imgSrc && (
          <img
            key={fadeKey}
            src={imgSrc}
            alt={`ASL sign for ${letter.ch.toUpperCase()}`}
            className="gesture-strip__active-img gesture-strip__active-img--fade"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `${API_BASE}/dataset-image/${letter.ch}`;
            }}
          />
        )}
        {/* Playing indicator */}
        {isPlaying && (
          <div className="gesture-strip__playing-badge" aria-hidden="true">
            <span className="gs-play-dot" />
            <span className="gs-play-dot" />
            <span className="gs-play-dot" />
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

/* ── Small tile in the rail ─────────────────────────────────────────────── */
function LetterTile({ letter, isActive, isPast, tileRef, onClick }) {
  return (
    <button
      ref={tileRef}
      type="button"
      className={[
        'gesture-strip__tile',
        isActive ? 'gesture-strip__tile--active' : '',
        isPast  ? 'gesture-strip__tile--past'   : '',
        letter.isWordStart ? 'gesture-strip__tile--word-start' : '',
      ].join(' ')}
      onClick={onClick}
      title={`${letter.ch.toUpperCase()} — ${HANDSHAPE[letter.ch] || 'ASL'}`}
      aria-pressed={isActive}
    >
      <img
        src={`${API_BASE}/dataset-image/${letter.ch}?sample=0`}
        alt={`ASL ${letter.ch.toUpperCase()}`}
        className="gesture-strip__tile-img"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = `${API_BASE}/dataset-image/${letter.ch}`;
        }}
      />
      <span className="gesture-strip__tile-char">{letter.ch.toUpperCase()}</span>
    </button>
  );
}

/* ── Word labels row ────────────────────────────────────────────────────── */
function WordLabelRow({ letters, activeIdx }) {
  const wordStarts = letters
    .map((l, i) => ({ ...l, idx: i }))
    .filter((l) => l.isWordStart);

  return (
    <div className="gesture-strip__words" aria-hidden="true">
      {wordStarts.map(({ word, idx }) => {
        const nextStart = wordStarts.find((w) => w.idx > idx)?.idx ?? letters.length;
        const isActive  = activeIdx >= idx && activeIdx < nextStart;
        const isPast    = activeIdx >= nextStart;
        return (
          <span
            key={`${word}-${idx}`}
            className={[
              'gesture-strip__word-label',
              isActive ? 'gesture-strip__word-label--active' : '',
              isPast   ? 'gesture-strip__word-label--past'   : '',
            ].join(' ')}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
