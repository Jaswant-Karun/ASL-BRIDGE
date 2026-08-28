import React, { useState, useCallback } from 'react';
import { translateText } from '../services/api';
import AnimateDiffMotionVideoEngine from '../components/AnimateDiffMotionVideoEngine';
import GestureStrip from '../components/GestureStrip';

const AVATAR = { id:'sarah', name:'Sarah', badge:'Studio ASL', accentColor:'#e26d4d' };
const SAMPLES = [
  `Once upon a time there was a student who loved computer science. Every morning she went to college. She worked on an important project. Her teacher was very proud of her progress.`,
  `Hello everyone. Today I want to teach you about sign language. First you learn the alphabet. Then you practice every day. Soon you will understand ASL very well.`,
];

export default function StorytellingMode() {
  const [story,       setStory]       = useState('');
  const [sentences,   setSentences]   = useState([]);
  const [activeIdx,   setActiveIdx]   = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [results,     setResults]     = useState({});  // { idx: translationResult }
  const [isPlaying,   setIsPlaying]   = useState(false);
  const autoTimerRef  = React.useRef(null);

  const splitSentences = (text) =>
    text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) || [text.trim()];

  const buildStory = useCallback(async (text) => {
    if (!text.trim()) return;
    setError('');
    const sents = splitSentences(text);
    setSentences(sents);
    setActiveIdx(0);
    setResults({});
    setLoading(true);
    // Translate first sentence immediately, rest lazily
    try {
      const first = await translateText(sents[0]);
      setResults({ 0: first });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  async function loadSentence(i) {
    setActiveIdx(i);
    if (results[i]) return;
    setLoading(true);
    try {
      const res = await translateText(sentences[i]);
      setResults((prev) => ({ ...prev, [i]: res }));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function autoPlay() {
    if (isPlaying) { clearTimeout(autoTimerRef.current); setIsPlaying(false); return; }
    setIsPlaying(true);
    let i = activeIdx;
    const advance = async () => {
      if (i >= sentences.length) { setIsPlaying(false); return; }
      await loadSentence(i);
      i++;
      autoTimerRef.current = setTimeout(advance, 4000);
    };
    advance();
  }

  const active = results[activeIdx];
  const gloss  = active?.gloss || [];

  return (
    <div className="story-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">📖 STORYTELLING MODE</span>
          <h2>Multi-Sentence Story Player</h2>
          <p>Paste or write a story. Each sentence becomes an avatar signing sequence you can step through or auto-play.</p>
        </div>
      </header>

      {/* Input */}
      <div className="story-input-section">
        <textarea className="rainbow-textarea" rows={5}
          placeholder="Write or paste a story here — each sentence will become a sign sequence…"
          value={story} onChange={(e) => setStory(e.target.value)} />
        <div className="home-meta-bar" style={{marginTop:'0.5rem'}}>
          <span className="char-count-pill">{splitSentences(story).filter(Boolean).length} sentences</span>
          {SAMPLES.map((s,i) => (
            <button key={i} type="button" className="sample-pill-btn" onClick={() => { setStory(s); buildStory(s); }}>
              Sample {i+1}
            </button>
          ))}
        </div>
        <button type="button" className="rainbow-motion-btn primary-btn" style={{marginTop:'0.75rem'}}
          onClick={() => buildStory(story)} disabled={loading||!story.trim()}>
          {loading ? '⏳ Translating…' : '✨ Build Story Sequence'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>

      {sentences.length > 0 && (
        <div className="story-player-layout">
          {/* Sentence playlist */}
          <div className="story-playlist">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.6rem'}}>
              <span className="rainbow-kicker">SEQUENCE ({sentences.length})</span>
              <button type="button" className={`ftl-drill-btn ${isPlaying?'recording':''}`} onClick={autoPlay}
                style={{padding:'0.3rem 0.8rem',fontSize:'0.78rem'}}>
                {isPlaying ? '⏹ Stop' : '▶ Auto-play'}
              </button>
            </div>
            {sentences.map((s, i) => (
              <button key={i} type="button"
                className={`story-sentence-btn ${activeIdx===i?'story-sentence-btn--active':''} ${results[i]?'story-sentence-btn--loaded':''}`}
                onClick={() => loadSentence(i)}>
                <span className="story-sentence-num">{i+1}</span>
                <span className="story-sentence-text">{s.slice(0,70)}{s.length>70?'…':''}</span>
                {results[i] && <span className="story-sentence-gloss">{results[i].gloss?.slice(0,4).join(' ')}…</span>}
              </button>
            ))}
          </div>

          {/* Player */}
          <div className="story-player-panel">
            {loading && !active && <p style={{color:'var(--muted)'}}>Translating sentence {activeIdx+1}…</p>}
            {active && (
              <>
                <div className="story-active-sentence">
                  <span className="rainbow-kicker">SENTENCE {activeIdx+1} / {sentences.length}</span>
                  <p className="story-active-text">"{sentences[activeIdx]}"</p>
                  <div className="grammar-result-chips" style={{marginTop:'0.4rem'}}>
                    {gloss.map((g,i) => <span key={i} className="gloss-chip">{g}</span>)}
                  </div>
                </div>
                <AnimateDiffMotionVideoEngine avatar={AVATAR} activeSign={{ token: gloss[0] || 'HELLO' }} isPlaying={true} motionPlan={active.motionPlan} />
                <div style={{marginTop:'1rem'}}>
                  <GestureStrip text={sentences[activeIdx]} isSpeaking={false} />
                </div>
              </>
            )}
            {/* Navigation */}
            <div style={{display:'flex',gap:'0.6rem',marginTop:'1rem'}}>
              <button type="button" className="gstrip-ctrl-btn" disabled={activeIdx===0}
                onClick={() => loadSentence(activeIdx-1)}>◀ Prev</button>
              <button type="button" className="gstrip-ctrl-btn" disabled={activeIdx>=sentences.length-1}
                onClick={() => loadSentence(activeIdx+1)}>Next ▶</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
