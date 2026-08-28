import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000';
const ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

const HANDSHAPE = {
  A:'A-Fist: Closed fist, thumb side',B:'Flat-B: Four fingers up, thumb across palm',
  C:'C-Shape: Curved fingers form a C',D:'1-D: Index up, others circle',
  E:'Claw-E: Fingers bent at knuckles',F:'OK/F: Index+thumb circle',
  G:'G-Pointer: Index+thumb horizontal',H:'H-Double: Index+middle horizontal',
  I:'I-Pinky: Pinky up',J:'J-Trace: Pinky draws a J',K:'K-Peace: Index up, middle forward',
  L:'L-Angle: Thumb+index form L',M:'M-Tuck: 3 fingers over thumb',
  N:'N-Tuck: 2 fingers over thumb',O:'O-Ring: All tips meet',P:'P-Down: K pointing down',
  Q:'Q-Down: G pointing down',R:'R-Cross: Index+middle crossed',S:'S-Fist: Tight fist, thumb over',
  T:'T-Tuck: Thumb between fingers',U:'U-Pair: Two fingers up',V:'V-Peace: V spread',
  W:'W-Three: Three fingers spread',X:'X-Hook: Index hook',Y:'Y-Horn: Thumb+pinky out',
  Z:'Z-Trace: Index traces Z','0':'Zero','1':'One','2':'Two','3':'Three','4':'Four',
  '5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine',
};

function loadStats() { try { return JSON.parse(localStorage.getItem('coach-stats')||'{}'); } catch { return {}; } }
function saveStats(s) { try { localStorage.setItem('coach-stats', JSON.stringify(s)); } catch {} }

function shuffle(arr) { return [...arr].sort(()=>Math.random()-0.5); }

const QUIZ_SIZE = 10;

export default function ASLCoach() {
  const [mode,     setMode]     = useState('menu'); // menu | quiz | result
  const [queue,    setQueue]    = useState([]);
  const [idx,      setIdx]      = useState(0);
  const [answer,   setAnswer]   = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [score,    setScore]    = useState({ correct:0, wrong:0 });
  const [log,      setLog]      = useState([]);
  const [stats,    setStats]    = useState(loadStats);
  const [sampleN,  setSampleN]  = useState(0);
  const [streak,   setStreak]   = useState(0);
  const [bestStreak, setBest]   = useState(() => { try { return Number(localStorage.getItem('coach-best-streak')||0); } catch { return 0; } });
  const inputRef   = useRef(null);

  function startQuiz(subset = ALL) {
    const q = shuffle(subset).slice(0, QUIZ_SIZE);
    setQueue(q); setIdx(0); setAnswer(''); setFeedback(null);
    setScore({ correct:0, wrong:0 }); setLog([]); setStreak(0);
    setSampleN(Math.floor(Math.random()*4));
    setMode('quiz');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function submit() {
    if (!answer.trim() || feedback) return;
    const correct = answer.trim().toUpperCase() === queue[idx];
    setFeedback(correct ? 'correct' : 'wrong');

    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > bestStreak) { setBest(newStreak); localStorage.setItem('coach-best-streak', newStreak); }

    const newStats = { ...stats };
    if (!newStats[queue[idx]]) newStats[queue[idx]] = { correct:0, wrong:0 };
    correct ? newStats[queue[idx]].correct++ : newStats[queue[idx]].wrong++;
    setStats(newStats); saveStats(newStats);

    setScore((s) => ({ correct: s.correct+(correct?1:0), wrong: s.wrong+(correct?0:1) }));
    setLog((l) => [...l, { ch: queue[idx], answer: answer.trim().toUpperCase(), correct }]);
  }

  function next() {
    if (idx + 1 >= queue.length) { setMode('result'); return; }
    setIdx((i) => i+1); setAnswer(''); setFeedback(null);
    setSampleN(Math.floor(Math.random()*4));
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  /* Keyboard: Enter to submit/next */
  function onKey(e) {
    if (e.key === 'Enter') { feedback ? next() : submit(); }
  }

  const weakChars = ALL.filter((c) => stats[c] && stats[c].wrong > stats[c].correct);

  /* ── Menu ── */
  if (mode === 'menu') return (
    <div className="coach-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">🏆 ASL COACH</span>
          <h2>Daily Practice Quiz</h2>
          <p>A gesture image appears — type the letter or number. Build speed, accuracy, and confidence through daily repetition.</p>
        </div>
      </header>

      <div className="coach-menu-grid">
        <div className="coach-menu-card">
          <span className="coach-menu-icon">🎯</span>
          <h3>Full Quiz (10 random)</h3>
          <p>10 random characters from A–Z and 0–9.</p>
          <button type="button" className="ftl-drill-btn" onClick={() => startQuiz(ALL)}>Start quiz</button>
        </div>
        <div className="coach-menu-card">
          <span className="coach-menu-icon">🔤</span>
          <h3>Alphabet Only</h3>
          <p>Focus on the 26 ASL letters A–Z.</p>
          <button type="button" className="ftl-drill-btn" onClick={() => startQuiz('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))}>Start A–Z</button>
        </div>
        <div className="coach-menu-card">
          <span className="coach-menu-icon">🔢</span>
          <h3>Numbers Only</h3>
          <p>Practice the 10 number handshapes.</p>
          <button type="button" className="ftl-drill-btn" onClick={() => startQuiz('0123456789'.split(''))}>Start 0–9</button>
        </div>
        {weakChars.length > 0 && (
          <div className="coach-menu-card coach-menu-card--weak">
            <span className="coach-menu-icon">⚠️</span>
            <h3>Weak Spots ({weakChars.length})</h3>
            <p>Characters you've missed more than gotten right: {weakChars.join(' ')}</p>
            <button type="button" className="ftl-drill-btn" onClick={() => startQuiz(weakChars)}>Drill weak spots</button>
          </div>
        )}
      </div>

      {/* Stats table */}
      {Object.keys(stats).length > 0 && (
        <section style={{marginTop:'2rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.6rem'}}>
            <span className="rainbow-kicker">YOUR STATS</span>
            <span style={{fontSize:'0.78rem',color:'var(--muted)'}}>Best streak: <strong style={{color:'var(--accent)'}}>{bestStreak}</strong></span>
          </div>
          <div className="coach-stats-grid">
            {ALL.filter((c) => stats[c]).map((c) => {
              const s = stats[c];
              const total = s.correct + s.wrong;
              const pct = Math.round((s.correct/total)*100);
              return (
                <div key={c} className="coach-stat-chip" style={{borderColor: pct>=70?'#22c55e':pct>=40?'#f59e0b':'#ef4444'}}>
                  <strong>{c}</strong>
                  <span style={{color:pct>=70?'#22c55e':pct>=40?'#f59e0b':'#ef4444'}}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );

  /* ── Quiz ── */
  if (mode === 'quiz') {
    const ch = queue[idx];
    return (
      <div className="coach-page coach-quiz-mode">
        <div className="coach-quiz-header">
          <span className="rainbow-kicker">QUESTION {idx+1} / {queue.length}</span>
          <span className="ftl-score-ok">✓ {score.correct}</span>
          <span className="ftl-score-bad">✗ {score.wrong}</span>
          {streak >= 2 && <span className="coach-streak-badge">🔥 {streak} streak</span>}
          <button type="button" className="ftl-exit-btn" onClick={() => setMode('menu')}>Exit</button>
        </div>
        <div className="ftl-drill-progress-track" style={{marginBottom:'1.5rem'}}>
          <div className="ftl-progress-fill" style={{width:`${(idx/queue.length)*100}%`}} />
        </div>

        <div className="coach-quiz-card">
          <p className="coach-quiz-prompt">What letter or number is this ASL gesture?</p>
          <img src={`${API_BASE}/dataset-image/${ch.toLowerCase()}?sample=${sampleN}`}
            alt="ASL gesture — identify the character"
            className="coach-quiz-img"
            onError={(e)=>{e.currentTarget.src=`${API_BASE}/dataset-image/${ch.toLowerCase()}`;}} />

          {feedback && (
            <div className={`coach-feedback coach-feedback--${feedback}`}>
              {feedback === 'correct'
                ? `✓ Correct! It's "${ch}" — ${HANDSHAPE[ch]}`
                : `✗ The answer is "${ch}" — ${HANDSHAPE[ch]}`}
            </div>
          )}

          {!feedback ? (
            <div className="coach-input-row">
              <input
                ref={inputRef}
                type="text"
                maxLength={1}
                className="coach-answer-input"
                placeholder="Type the letter or number…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                onKeyDown={onKey}
                autoFocus
              />
              <button type="button" className="analyze-btn" onClick={submit} disabled={!answer.trim()}>Check</button>
            </div>
          ) : (
            <button type="button" className="ftl-drill-btn" style={{marginTop:'1rem'}} onClick={next}>
              {idx+1 >= queue.length ? 'See results →' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Result ── */
  const pct = Math.round((score.correct / queue.length) * 100);
  return (
    <div className="coach-page ftl-result-mode">
      <div className="ftl-result-card">
        <span className="ftl-result-emoji">{pct>=90?'🏆':pct>=70?'💪':pct>=50?'📚':'🔄'}</span>
        <h2>{pct>=90?'Excellent!':pct>=70?'Good work!':pct>=50?'Keep practicing':'Try again!'}</h2>
        <p>{queue.length} questions · {score.correct} correct · {score.wrong} wrong</p>
        <div className="ftl-result-score">{pct}%</div>
        <div className="ftl-result-log">
          {log.map(({ch, answer: ans, correct}, i) => (
            <span key={i} className={`history-chip ${correct?'':'ftl-log-miss'}`} title={`You typed: ${ans}`}>{ch}</span>
          ))}
        </div>
        <div className="ftl-result-btns">
          <button type="button" className="ftl-drill-btn" onClick={() => startQuiz(ALL)}>New quiz</button>
          <button type="button" className="ftl-exit-btn" onClick={() => setMode('menu')}>Menu</button>
        </div>
      </div>
    </div>
  );
}
