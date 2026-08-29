import React, { useEffect, useState } from 'react';
import PresentationUpload from '../components/PresentationUpload';
import ASLPlayer from '../components/ASLPlayer';

const FEATURE_CARDS = [
  { icon: '📋', title: 'Slide Text Extraction', desc: 'Every line of text on every slide is pulled out in reading order and prepared for signing.' },
  { icon: '🌈', title: 'ASL Gloss Conversion', desc: 'English sentences are converted to ASL grammar — time anchors to the front, function words stripped.' },
  { icon: '🤖', title: '3D Avatar Signing', desc: 'Each line drives the articulated avatar rig with full finger kinematics at 60 FPS.' },
  { icon: '▶️', title: 'Sequential Playback', desc: 'Step through slides line by line manually, or hit Play for automatic timed sequencing.' },
];

export default function PresentationMode({ navigate }) {
  const [result,          setResult]          = useState(null);
  const [error,           setError]           = useState('');
  const [activeLine,      setActiveLine]      = useState(0);
  const [isPlayingLines,  setIsPlayingLines]  = useState(false);

  const lines       = result?.lines || [];
  const currentLine = lines[activeLine] || result;

  // Auto-advance lines during playback
  useEffect(() => {
    if (!isPlayingLines || lines.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveLine(v => {
        if (v >= lines.length - 1) { setIsPlayingLines(false); return 0; }
        return v + 1;
      });
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isPlayingLines, lines.length]);

  function handleResult(value) {
    setResult(value);
    setActiveLine(0);
    setIsPlayingLines(false);
    setError('');
  }

  return (
    <div className="ppt-page">

      {/* ── Hero header ── */}
      <header className="ppt-hero">
        <div className="ppt-hero-text">
          <span className="rainbow-kicker">📚 PPT TO ASL FLOW</span>
          <h1 className="ppt-hero-title">Bring your slides into<br />the conversation.</h1>
          <p className="ppt-hero-desc">
            Upload any PowerPoint (.pptx) and ASL Bridge extracts every line of slide text,
            converts it to ASL gloss, and drives your 3D signing avatar — line by line,
            fully synchronized.
          </p>
          <div className="ppt-hero-badges">
            <span className="ppt-badge">🔵 .pptx supported</span>
            <span className="ppt-badge">⚡ Instant extraction</span>
            <span className="ppt-badge">🤖 60 FPS avatar</span>
            <span className="ppt-badge">🌈 ASL grammar engine</span>
          </div>
        </div>
        <div className="ppt-hero-illustration" aria-hidden="true">
          <div className="ppt-slide-mock">
            <div className="ppt-slide-mock-bar">
              <span /><span /><span />
            </div>
            <div className="ppt-slide-mock-line ppt-slide-mock-line--title" />
            <div className="ppt-slide-mock-line" />
            <div className="ppt-slide-mock-line ppt-slide-mock-line--short" />
            <div className="ppt-slide-mock-line" />
            <div className="ppt-slide-mock-arrow">→ ASL</div>
          </div>
        </div>
      </header>

      {/* ── Feature cards ── */}
      {!result && (
        <section className="ppt-features-grid">
          {FEATURE_CARDS.map(f => (
            <div key={f.title} className="ppt-feature-card">
              <span className="ppt-feature-icon">{f.icon}</span>
              <h4 className="ppt-feature-title">{f.title}</h4>
              <p className="ppt-feature-desc">{f.desc}</p>
            </div>
          ))}
        </section>
      )}

      {/* ── Upload zone ── */}
      {!result && (
        <section className="ppt-upload-section">
          <PresentationUpload onResult={handleResult} onError={setError} />
          {error && <p className="error-message ppt-upload-error" role="alert">⚠ {error}</p>}
        </section>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="ppt-result-layout">

          {/* Left: slide line list */}
          <aside className="ppt-slide-panel">
            <div className="ppt-slide-panel-header">
              <div>
                <span className="rainbow-kicker">EXTRACTED CONTENT</span>
                <h3 className="ppt-file-name">{result.fileName}</h3>
              </div>
              <div className="ppt-slide-controls">
                <button
                  type="button"
                  className={`ppt-play-btn ${isPlayingLines ? 'ppt-play-btn--active' : ''}`}
                  onClick={() => setIsPlayingLines(v => !v)}
                  disabled={lines.length < 2}
                >
                  {isPlayingLines ? '⏸ Pause' : '▶ Auto-play'}
                </button>
                <button
                  type="button"
                  className="ppt-reset-btn"
                  onClick={() => { setResult(null); setError(''); }}
                >
                  ↺ Upload new
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="ppt-playback-track">
              <div
                className="ppt-playback-fill"
                style={{ width: lines.length > 1 ? `${(activeLine / (lines.length - 1)) * 100}%` : '0%' }}
              />
            </div>
            <p className="ppt-line-counter">
              Line {activeLine + 1} of {lines.length || 1}
            </p>

            <div className="ppt-line-list">
              {lines.length > 0 ? lines.map((line, idx) => (
                <button
                  type="button"
                  key={`${line.slideNumber}-${line.lineNumber}`}
                  className={`ppt-line-btn ${idx === activeLine ? 'ppt-line-btn--active' : ''} ${idx < activeLine ? 'ppt-line-btn--done' : ''}`}
                  onClick={() => { setActiveLine(idx); setIsPlayingLines(false); }}
                >
                  <span className="ppt-line-meta">
                    Slide {line.slideNumber} · Line {line.lineNumber}
                    {idx < activeLine && <span className="ppt-done-check">✓</span>}
                  </span>
                  <span className="ppt-line-text">{line.text}</span>
                </button>
              )) : (
                <p className="ppt-no-lines">{result.originalText || 'No readable slide text found.'}</p>
              )}
            </div>

            {/* Gloss tokens */}
            {currentLine?.gloss?.length > 0 && (
              <div className="ppt-gloss-row">
                <span className="rainbow-kicker" style={{ marginBottom: '0.4rem', display: 'block' }}>ASL GLOSS</span>
                <div className="ppt-gloss-chips">
                  {currentLine.gloss.map((token, i) => (
                    <span key={`${token}-${i}`} className="ppt-gloss-chip">{token}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Right: avatar player */}
          <div className="ppt-avatar-panel">
            <div className="ppt-avatar-header">
              <span className="rainbow-kicker">3D AVATAR SIGNING</span>
              {currentLine?.text && (
                <p className="ppt-current-line-text">"{currentLine.text}"</p>
              )}
            </div>
            <ASLPlayer
              text={currentLine?.text || result.originalText}
              gloss={currentLine?.gloss || result.gloss}
              animations={currentLine?.animations || result.animations}
              unsupported={currentLine?.unsupported || result.unsupported}
              motionPlan={result.motionPlan}
              linguisticStructure={result.linguisticStructure}
              nonManualMarkers={result.nonManualMarkers}
              animatediff={result.animatediff}
            />
          </div>
        </div>
      )}
    </div>
  );
}
