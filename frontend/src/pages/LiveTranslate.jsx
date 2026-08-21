import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SpeechInput from '../components/SpeechInput';
import { translateText } from '../services/api';
import ASLPlayer from '../components/ASLPlayer';

export default function LiveTranslate({ navigate, darkMode, onToggleTheme }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function translate() {
    if (!text.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await translateText(text);
      setResult(res);
    } catch (translationError) {
      setError(translationError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar navigate={navigate} darkMode={darkMode} onToggleTheme={onToggleTheme} />
      <main>
        <p className="eyebrow">LIVE TRANSLATION</p>
        <h1>Make speech visible.</h1>
        <p className="dashboard-intro">
          Speak into your microphone and generate real-time AnimateDiff avatar sign language animations.
        </p>

        <SpeechInput onTranscript={(val) => { setText(val); }} />

        <div className="live-transcript-box">
          <label htmlFor="live-transcript">English Transcript</label>
          <textarea
            id="live-transcript"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows="3"
            placeholder="Your spoken transcript will appear here..."
          />
          <button
            className="primary-action"
            type="button"
            onClick={translate}
            disabled={!text.trim() || loading}
          >
            {loading ? 'Synthesizing Avatar...' : 'Translate Transcript to Avatar'}
          </button>
        </div>

        {error && <p className="error-message" role="alert">{error}</p>}

        {result && (
          <section className="results-section">
            <div className="results-header-card">
              <span className="result-kicker">LIVE SPEECH TRANSLATION</span>
              <p className="caption-text">"{result.originalText}"</p>
              <div className="gloss-sequence-badges">
                {result.gloss.map((token, idx) => (
                  <span key={`${token}-${idx}`} className="gloss-token-badge">
                    {token}
                  </span>
                ))}
              </div>
            </div>

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
        )}
      </main>
    </>
  );
}
