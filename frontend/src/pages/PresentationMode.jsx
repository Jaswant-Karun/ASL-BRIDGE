import React, { useEffect, useState } from 'react';
import PresentationUpload from '../components/PresentationUpload';
import ASLPlayer from '../components/ASLPlayer';

export default function PresentationMode({ navigate }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeLine, setActiveLine] = useState(0);
  const [isPlayingLines, setIsPlayingLines] = useState(false);

  const lines = result?.lines || [];
  const currentLine = lines[activeLine] || result;

  useEffect(() => {
    if (!isPlayingLines || lines.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveLine((value) => {
        if (value >= lines.length - 1) {
          setIsPlayingLines(false);
          return 0;
        }
        return value + 1;
      });
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isPlayingLines, lines.length]);

  return (
    <div className="presentation-workspace-page">
      <p className="eyebrow">PRESENTATION MODE</p>
      <h1>Bring your slides into the conversation.</h1>
      <p className="dashboard-intro">
        Upload a PowerPoint presentation (.pptx) and ASL Bridge extracts slide text to generate synchronized AnimateDiff avatar signs.
      </p>

      <PresentationUpload
        onResult={(value) => {
          setResult(value);
          setActiveLine(0);
          setIsPlayingLines(false);
          setError('');
        }}
        onError={setError}
      />

      {error && <p className="error-message" role="alert">{error}</p>}

      {result && (
        <div className="presentation-result">
          <section className="presentation-slide-pane">
            <p className="eyebrow">SLIDE EXTRACTED CONTENT</p>
            <h2>{result.fileName}</h2>
            <button type="button" className="presentation-play-lines" onClick={() => setIsPlayingLines((value) => !value)} disabled={lines.length < 2}>
              {isPlayingLines ? 'Pause line playback' : 'Play lines sequentially'}
            </button>
            <div className="presentation-line-list">
              {lines.length > 0 ? lines.map((line, idx) => (
                <button
                  type="button"
                  key={`${line.slideNumber}-${line.lineNumber}`}
                  className={`presentation-line ${idx === activeLine ? 'active' : ''}`}
                  onClick={() => setActiveLine(idx)}
                >
                  <span>Slide {line.slideNumber} / Line {line.lineNumber}</span>
                  <strong>{line.text}</strong>
                </button>
              )) : (
                <p>{result.originalText || 'No readable slide text found.'}</p>
              )}
            </div>
            <div className="gloss-sequence-badges">
              {currentLine?.gloss?.map((token, idx) => (
                <span key={`${token}-${idx}`} className="gloss-token-badge">
                  {token}
                </span>
              ))}
            </div>
          </section>

          <section className="presentation-avatar-pane">
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
          </section>
        </div>
      )}
    </div>
  );
}
