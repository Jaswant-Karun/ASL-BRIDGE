import React, { useState } from 'react';
import SpeechInput from '../components/SpeechInput';
import { translateText } from '../services/api';
import ASLPlayer from '../components/ASLPlayer';

export default function LiveTranslate({ navigate }) {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('en-US');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function translate() {
    if (!text.trim()) return;
    setError('');
    setLoading(true);
    try {
      const langCode = lang.startsWith('ta') ? 'ta' : lang.startsWith('hi') ? 'hi' : 'en';
      const res = await translateText(text, langCode);
      setResult(res);
    } catch (translationError) {
      setError(translationError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="live-translate-page">
        <p className="eyebrow">LIVE MULTILINGUAL SPEECH TRANSLATION</p>
        <h1>Make speech visible in Tamil, English & Hindi.</h1>
        <p className="dashboard-intro">
          Speak in <strong>Tamil (தமிழ்)</strong>, <strong>English</strong>, or <strong>Hindi (हिन्दी)</strong> to generate real-time 3D cartoon avatar sign language animations.
        </p>

        <SpeechInput initialLang={lang} onTranscript={(val) => { setText(val); }} />

        <div className="live-transcript-box">
          <label htmlFor="live-transcript">Spoken Transcript</label>
          <textarea
            id="live-transcript"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows="3"
            placeholder="Your spoken transcript (Tamil / English / Hindi) will appear here..."
          />
          <button
            className="primary-action"
            type="button"
            onClick={translate}
            disabled={!text.trim() || loading}
          >
            {loading ? 'Synthesizing 3D Avatar...' : '✨ Translate Transcript to 3D Avatar'}
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
    </div>
  );
}
