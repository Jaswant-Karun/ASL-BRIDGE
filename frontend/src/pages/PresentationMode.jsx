import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import PresentationUpload from '../components/PresentationUpload';
import ASLPlayer from '../components/ASLPlayer';

export default function PresentationMode({ navigate, darkMode, onToggleTheme }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  return (
    <>
      <Navbar navigate={navigate} darkMode={darkMode} onToggleTheme={onToggleTheme} />
      <main>
        <p className="eyebrow">PRESENTATION MODE</p>
        <h1>Bring your slides into the conversation.</h1>
        <p className="dashboard-intro">
          Upload a PowerPoint presentation (.pptx) and ASL Bridge extracts slide text to generate synchronized AnimateDiff avatar signs.
        </p>

        <PresentationUpload
          onResult={(value) => {
            setResult(value);
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
              <div className="extracted-slide-text">
                <p>{result.originalText || 'No readable slide text found.'}</p>
              </div>
              <div className="gloss-sequence-badges">
                {result.gloss?.map((token, idx) => (
                  <span key={`${token}-${idx}`} className="gloss-token-badge">
                    {token}
                  </span>
                ))}
              </div>
            </section>

            <section className="presentation-avatar-pane">
              <ASLPlayer
                text={result.originalText}
                gloss={result.gloss}
                animations={result.animations}
                unsupported={result.unsupported}
                motionPlan={result.motionPlan}
                linguisticStructure={result.linguisticStructure}
                nonManualMarkers={result.nonManualMarkers}
                animatediff={result.animatediff}
              />
            </section>
          </div>
        )}
      </main>
    </>
  );
}
