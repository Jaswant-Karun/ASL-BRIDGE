import React, { useState, useEffect, useRef } from 'react';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = '0123456789'.split('');
const ALL = [...LETTERS, ...NUMBERS];

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const HANDSHAPE = {
  A:'A-Fist: Closed fist, thumb pressed against index finger side',
  B:'Flat-B: Four fingers extended up together, thumb folded across palm',
  C:'C-Shape: All fingers curve to form an open C',
  D:'D: Index up, thumb + middle+ring+pinky form circle',
  E:'Claw-E: All fingers bent at middle knuckles, rest on curled thumb',
  F:'OK/F: Index+thumb tips touch, 3 fingers up',
  G:'G-Pointer: Index+thumb extended horizontally parallel',
  H:'H-Double: Index+middle extended together horizontally',
  I:'I-Pinky: Pinky straight up, others in fist',
  J:'J-Trace: Pinky traces a J curve downward',
  K:'K-Peace: Index up, middle forward, thumb between them',
  L:'L-Angle: Thumb+index form an L shape',
  M:'M-Tuck: Thumb tucked under index+middle+ring',
  N:'N-Tuck: Thumb tucked under index+middle',
  O:'O-Ring: All fingertips touch thumb forming an O',
  P:'P-Down: K-shape pointing down',
  Q:'Q-Down: G-shape pointing down',
  R:'R-Cross: Index+middle crossed',
  S:'S-Fist: Tight fist, thumb over fingers',
  T:'T-Tuck: Thumb between index+middle',
  U:'U-Pair: Index+middle extended straight up together',
  V:'V-Peace: Index+middle spread in V',
  W:'W-Three: Index+middle+ring spread upward',
  X:'X-Hook: Index bent like a hook',
  Y:'Y-Horn: Thumb+pinky extended out',
  Z:'Z-Trace: Index traces a Z in the air',
  '0':'Zero: O-shape — all tips meet thumb',
  '1':'One: Index finger straight up',
  '2':'Two: Index+middle up',
  '3':'Three: Thumb+index+middle up',
  '4':'Four: Four fingers up, thumb tucked',
  '5':'Five: All five digits spread wide',
  '6':'Six: Pinky touches thumb, 3 fingers up',
  '7':'Seven: Ring touches thumb, 3 fingers up',
  '8':'Eight: Middle touches thumb, 3 fingers up',
  '9':'Nine: Index touches thumb, 3 fingers up',
};

function loadProgress() {
  try { return JSON.parse(localStorage.getItem('ftl-progress') || '{}'); } catch { return {}; }
}
function saveProgress(p) {
  try { localStorage.setItem('ftl-progress', JSON.stringify(p)); } catch {}
}

export default function FingerTrainingLab() {
  const [mode, setMode] = useState('browse'); // 'browse' | 'drill'
  const [filter, setFilter] = useState('all'); // 'all' | 'alpha' | 'num'
  const [selected, setSelected] = useState('A');
  const [drillQueue, setDrillQueue] = useState([]);
  const [drillIdx, setDrillIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [progress, setProgress] = useState(loadProgress);
  const [sampleIdx, setSampleIdx] = useState(0);
  const [sessionLog, setSessionLog] = useState([]);

  const chars = filter === 'alpha' ? LETTERS : filter === 'num' ? NUMBERS : ALL;

  function startDrill() {
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    setDrillQueue(shuffled);
    setDrillIdx(0);
    setShowAnswer(false);
    setScore({ correct: 0, wrong: 0 });
    setSessionLog([]);
    setMode('drill');
  }

  function markResult(knew) {
    const ch = drillQueue[drillIdx];
    const next = { ...progress };
    next[ch] = knew ? (next[ch] || 0) + 1 : Math.max(0, (next[ch] || 0) - 1);
    setProgress(next);
    saveProgress(next);
    setScore((s) => ({ correct: s.correct + (knew ? 1 : 0), wrong: s.wrong + (knew ? 0 : 1) }));
    setSessionLog((l) => [...l, { ch, knew }]);
    if (drillIdx + 1 >= drillQueue.length) { setMode('result'); return; }
    setDrillIdx((i) => i + 1);
    setShowAnswer(false);
    setSampleIdx(Math.floor(Math.random() * 4));
  }

  const masteredCount = Object.values(progress).filter((v) => v >= 3).length;
  const totalPct = Math.round((masteredCount / ALL.length) * 100);

  /* ── Browse Mode ── */
  if (mode === 'browse') return (
    <div className="ftl-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">✋ FINGER TRAINING LAB</span>
          <h2>ASL Fingerspelling Drill</h2>
          <p>Study every handshape, then drill yourself with randomized flashcards. Your mastery progress is saved automatically.</p>
        </div>
        <div className="ftl-hero-stats">
          <div className="ftl-stat"><strong>{masteredCount}</strong><span>Mastered</span></div>
          <div className="ftl-stat"><strong>{ALL.length - masteredCount}</strong><span>To learn</span></div>
          <div className="ftl-stat accent"><strong>{totalPct}%</strong><span>Overall</span></div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="ftl-progress-track"><div className="ftl-progress-fill" style={{ width: `${totalPct}%` }} /></div>

      {/* Filter + Drill */}
      <div className="ftl-toolbar">
        {['all','alpha','num'].map((f) => (
          <button key={f} type="button" className={`pill-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All 36' : f === 'alpha' ? 'A – Z' : '0 – 9'}
          </button>
        ))}
        <button type="button" className="ftl-drill-btn" onClick={startDrill}>
          🎯 Start Flashcard Drill ({chars.length} cards)
        </button>
      </div>

      {/* Grid */}
      <div className="ftl-grid">
        {chars.map((ch) => {
          const mastery = progress[ch] || 0;
          const level = mastery >= 3 ? 'mastered' : mastery >= 1 ? 'learning' : 'new';
          return (
            <button key={ch} type="button"
              className={`ftl-card ${selected === ch ? 'ftl-card--active' : ''} ftl-card--${level}`}
              onClick={() => { setSelected(ch); setSampleIdx(Math.floor(Math.random() * 4)); }}>
              <img src={`${API_BASE}/dataset-image/${ch.toLowerCase()}?sample=${Math.floor(Math.random()*4)}`}
                alt={`ASL ${ch}`} className="ftl-card-img"
                onError={(e) => { e.currentTarget.style.opacity = '0.3'; }} />
              <span className="ftl-card-char">{ch}</span>
              <span className={`ftl-card-dot ftl-card-dot--${level}`} />
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="ftl-detail-panel">
          <div className="ftl-detail-img-wrap">
            <img src={`${API_BASE}/dataset-image/${selected.toLowerCase()}?sample=${sampleIdx}`}
              alt={`ASL ${selected}`} className="ftl-detail-img"
              onError={(e) => { e.currentTarget.src = `${API_BASE}/dataset-image/${selected.toLowerCase()}`; }} />
            <div className="ftl-sample-dots">
              {[0,1,2,3].map((i) => (
                <button key={i} type="button" className={`ftl-dot-btn ${sampleIdx===i?'active':''}`} onClick={() => setSampleIdx(i)} />
              ))}
            </div>
          </div>
          <div className="ftl-detail-info">
            <span className="rainbow-kicker">HANDSHAPE — {selected}</span>
            <h3>{selected}</h3>
            <p className="ftl-handshape-desc">{HANDSHAPE[selected]}</p>
            <div className="ftl-mastery-row">
              <span>Mastery score:</span>
              <div className="ftl-mastery-pips">
                {[1,2,3].map((i) => <span key={i} className={`ftl-pip ${(progress[selected]||0) >= i ? 'filled' : ''}`} />)}
              </div>
              <span className="ftl-mastery-label">
                {(progress[selected]||0) >= 3 ? '✓ Mastered' : (progress[selected]||0) >= 1 ? 'Learning' : 'New'}
              </span>
            </div>
            <div className="ftl-manual-btns">
              <button type="button" className="ftl-knew-btn" onClick={() => {
                const n = { ...progress, [selected]: Math.min(3, (progress[selected]||0)+1) };
                setProgress(n); saveProgress(n);
              }}>✓ I know this</button>
              <button type="button" className="ftl-forgot-btn" onClick={() => {
                const n = { ...progress, [selected]: 0 };
                setProgress(n); saveProgress(n);
              }}>✗ Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── Drill Mode ── */
  if (mode === 'drill') {
    const ch = drillQueue[drillIdx];
    return (
      <div className="ftl-page ftl-drill-mode">
        <div className="ftl-drill-header">
          <span className="rainbow-kicker">FLASHCARD DRILL — {drillIdx + 1} / {drillQueue.length}</span>
          <div className="ftl-drill-score">
            <span className="ftl-score-ok">✓ {score.correct}</span>
            <span className="ftl-score-bad">✗ {score.wrong}</span>
          </div>
          <button type="button" className="ftl-exit-btn" onClick={() => setMode('browse')}>Exit drill</button>
        </div>
        <div className="ftl-drill-progress-track">
          <div className="ftl-progress-fill" style={{ width: `${((drillIdx) / drillQueue.length) * 100}%` }} />
        </div>
        <div className="ftl-flashcard">
          <div className="ftl-flashcard-front">
            <img src={`${API_BASE}/dataset-image/${ch.toLowerCase()}?sample=${sampleIdx}`}
              alt={`ASL gesture`} className="ftl-flashcard-img"
              onError={(e) => { e.currentTarget.src = `${API_BASE}/dataset-image/${ch.toLowerCase()}`; }} />
            <p className="ftl-flashcard-prompt">What letter or number is this?</p>
          </div>
          {showAnswer ? (
            <div className="ftl-flashcard-answer">
              <span className="ftl-answer-char">{ch}</span>
              <p className="ftl-handshape-desc">{HANDSHAPE[ch]}</p>
              <div className="ftl-drill-btns">
                <button type="button" className="ftl-knew-btn" onClick={() => markResult(true)}>✓ Got it!</button>
                <button type="button" className="ftl-forgot-btn" onClick={() => markResult(false)}>✗ Need more practice</button>
              </div>
            </div>
          ) : (
            <button type="button" className="ftl-reveal-btn" onClick={() => setShowAnswer(true)}>Reveal answer</button>
          )}
        </div>
      </div>
    );
  }

  /* ── Result Mode ── */
  const pct = Math.round((score.correct / drillQueue.length) * 100);
  return (
    <div className="ftl-page ftl-result-mode">
      <div className="ftl-result-card">
        <span className="ftl-result-emoji">{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</span>
        <h2>Drill complete!</h2>
        <p>{drillQueue.length} cards · {score.correct} correct · {score.wrong} missed</p>
        <div className="ftl-result-score">{pct}%</div>
        <div className="ftl-result-log">
          {sessionLog.map(({ ch, knew }, i) => (
            <span key={i} className={`history-chip ${knew ? '' : 'ftl-log-miss'}`}>{ch}</span>
          ))}
        </div>
        <div className="ftl-result-btns">
          <button type="button" className="ftl-drill-btn" onClick={startDrill}>Drill again</button>
          <button type="button" className="ftl-exit-btn" onClick={() => setMode('browse')}>Back to browse</button>
        </div>
      </div>
    </div>
  );
}
