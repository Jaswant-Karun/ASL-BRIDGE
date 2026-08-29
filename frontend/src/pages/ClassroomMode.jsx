import React, { useState, useCallback, useEffect } from 'react';
import { translateText } from '../services/api';
import AnimateDiffMotionVideoEngine from '../components/AnimateDiffMotionVideoEngine';
import { useAvatarDesign } from '../utils/avatarDesign';

const FALLBACK_AVATAR = { id:'marcus', name:'Marcus', badge:'High Contrast', accentColor:'#10b981' };

const PRESET_LESSONS = [
  {
    title: 'ASL Alphabet Introduction',
    lines: [
      'Welcome to our American Sign Language class.',
      'Today we will learn the manual alphabet.',
      'There are 26 letters from A to Z.',
      'Each letter has a unique handshape.',
      'Practice every day to build muscle memory.',
    ]
  },
  {
    title: 'Basic Greetings',
    lines: [
      'Hello, my name is your teacher.',
      'Good morning everyone.',
      'How are you today?',
      'I am very happy to see you.',
      'Let us begin our lesson now.',
    ]
  },
  {
    title: 'Numbers 1 to 10',
    lines: [
      'Today we learn numbers in sign language.',
      'Hold your hand up with fingers forward.',
      'One finger means the number one.',
      'Two fingers means the number two.',
      'Practice counting slowly and clearly.',
    ]
  },
];

export default function ClassroomMode() {
  const designedAvatar = useAvatarDesign();
  const activeAvatar   = designedAvatar || FALLBACK_AVATAR;
  const [tab,         setTab]         = useState('preset'); // 'preset' | 'custom'
  const [selectedLesson, setLesson]   = useState(0);
  const [customLines,  setCustomLines] = useState('');
  const [lines,        setLines]       = useState(PRESET_LESSONS[0].lines);
  const [currentLine,  setCurrentLine] = useState(0);
  const [results,      setResults]     = useState({});
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState('');
  const [fullscreen,   setFullscreen]  = useState(false);

  useEffect(() => {
    setLines(PRESET_LESSONS[selectedLesson].lines);
    setCurrentLine(0); setResults({});
  }, [selectedLesson]);

  const loadLine = useCallback(async (idx, linesArr = lines) => {
    setCurrentLine(idx);
    if (results[idx]) return;
    setLoading(true); setError('');
    try {
      const res = await translateText(linesArr[idx]);
      setResults((prev) => ({ ...prev, [idx]: res }));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [lines, results]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadLine(0, lines); }, [lines]); // auto-load first line when lines change

  function buildCustom() {
    const custom = customLines.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!custom.length) return;
    setLines(custom); setCurrentLine(0); setResults({}); loadLine(0, custom);
  }

  const active   = results[currentLine];
  const gloss    = active?.gloss || [];
  const progress = Math.round(((currentLine + 1) / lines.length) * 100);

  return (
    <div className={`classroom-page ${fullscreen ? 'classroom-fullscreen' : ''}`}>
      {!fullscreen && (
        <header className="page-header-banner">
          <div className="banner-left">
            <span className="rainbow-kicker">🎓 CLASSROOM MODE</span>
            <h2>Line-by-Line Lesson Presenter</h2>
            <p>Select a preset lesson or write your own. Step through each line with synchronized avatar signing.</p>
          </div>
          <button type="button" className="ftl-drill-btn" onClick={() => setFullscreen(true)}>⛶ Full screen</button>
        </header>
      )}

      {!fullscreen && (
        <div className="classroom-setup">
          {/* Tab */}
          <div className="tc-tabs" style={{marginBottom:'1rem'}}>
            <button type="button" className={`tab-btn ${tab==='preset'?'active':''}`} onClick={() => setTab('preset')}>Preset Lessons</button>
            <button type="button" className={`tab-btn ${tab==='custom'?'active':''}`} onClick={() => setTab('custom')}>Custom Content</button>
          </div>

          {tab === 'preset' && (
            <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap'}}>
              {PRESET_LESSONS.map((l, i) => (
                <button key={i} type="button" className={`pill-btn ${selectedLesson===i?'active':''}`}
                  onClick={() => { setLesson(i); setTab('preset'); }}>{l.title}</button>
              ))}
            </div>
          )}

          {tab === 'custom' && (
            <div style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              <textarea className="rainbow-textarea" rows={6}
                placeholder={"Enter one sentence per line:\nHello everyone.\nToday we learn ASL.\nPractice makes perfect."}
                value={customLines} onChange={(e) => setCustomLines(e.target.value)} />
              <button type="button" className="rainbow-motion-btn primary-btn" onClick={buildCustom} disabled={!customLines.trim()}>
                Build lesson
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main presenter */}
      <div className="classroom-presenter">
        {/* Progress bar */}
        <div className="ftl-progress-track">
          <div className="ftl-progress-fill" style={{width:`${progress}%`,background:'#10b981'}} />
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',color:'var(--muted)',marginBottom:'0.75rem'}}>
          <span>Line {currentLine+1} of {lines.length}</span>
          <span>{progress}% complete</span>
          {fullscreen && <button type="button" className="ftl-exit-btn" onClick={() => setFullscreen(false)}>Exit fullscreen</button>}
        </div>

        {/* Current line large display */}
        <div className={`classroom-line-display ${fullscreen?'classroom-line-display--fs':''}`}>
          <p className="classroom-current-text">{lines[currentLine]}</p>
          <div className="grammar-result-chips" style={{marginTop:'0.5rem'}}>
            {gloss.map((g,i) => <span key={i} className="gloss-chip">{g}</span>)}
          </div>
        </div>

        {/* Avatar */}
        <div className="classroom-avatar-row">
          <AnimateDiffMotionVideoEngine avatar={activeAvatar} activeSign={{ token: gloss[0]||'HELLO' }} isPlaying={true} motionPlan={active?.motionPlan} />
        </div>

        {error && <p className="error-message">{error}</p>}
        {loading && <p style={{color:'var(--muted)',fontSize:'0.8rem'}}>Loading ASL…</p>}

        {/* Controls */}
        <div className="classroom-controls">
          <button type="button" className="gstrip-ctrl-btn" disabled={currentLine===0}
            onClick={() => loadLine(currentLine-1)}>◀ Back</button>
          <div className="classroom-line-dots">
            {lines.map((_,i) => (
              <button key={i} type="button"
                className={`classroom-dot ${i===currentLine?'classroom-dot--active':''} ${results[i]?'classroom-dot--loaded':''}`}
                onClick={() => loadLine(i)} title={lines[i].slice(0,40)} />
            ))}
          </div>
          <button type="button" className="gstrip-ctrl-btn" disabled={currentLine>=lines.length-1}
            onClick={() => loadLine(currentLine+1)}>Next ▶</button>
        </div>

        {/* Lines panel */}
        {!fullscreen && (
          <div className="classroom-lines-panel">
            {lines.map((l,i) => (
              <button key={i} type="button"
                className={`story-sentence-btn ${i===currentLine?'story-sentence-btn--active':''}`}
                onClick={() => loadLine(i)}>
                <span className="story-sentence-num">{i+1}</span>
                <span className="story-sentence-text">{l}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
