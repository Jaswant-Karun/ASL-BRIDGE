import React, { useState } from 'react';
import { translateText } from '../services/api';
import AnimateDiffStudio from '../components/AnimateDiffStudio';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';

export default function Home({ navigate, user }) {
  const [text, setText] = useState('Tomorrow I am going to college because I have an important project review.');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    if (event) event.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const translation = await translateText(text.trim());
      setResult(translation);
    } catch (translationError) {
      setError(translationError.message);
    } finally {
      setLoading(false);
    }
  }

  const activeSentence = result?.originalText || text;

  return (
    <div className="home-workspace-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">📝 TEXT TO ASL ANIMATEDIFF 3D STUDIO</span>
          <h2>Text to ASL 3D Avatar Studio</h2>
          <p>
            Translate natural English text into continuous 3D cartoon avatar sign language sequences with talking lip-sync and synchronized spoken voice.
          </p>
        </div>
      </header>

      {/* Text Input Card */}
      <section className="text-input-card">
        <form onSubmit={submit} className="translation-form">
          <div className="input-header-row">
            <label htmlFor="translation-text">
              Enter any English sentence (e.g. <em>Tomorrow I am going to college...</em>):
            </label>
            <span className="telemetry-pill">● AnimateDiff 3D Engine Active</span>
          </div>

          <textarea
            id="translation-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows="3"
            placeholder="Type any sentence..."
            className="rainbow-textarea"
          />

          <div className="form-action-row">
            <button
              type="submit"
              className="rainbow-motion-btn primary-btn"
              disabled={loading || !text.trim()}
            >
              <span>{loading ? '🎬 Synthesizing 3D Motion...' : '✨ Generate AnimateDiff 3D Sign Video'}</span>
            </button>

            {/* Quick Sample Prompts */}
            <div className="quick-samples-row">
              <span className="sample-label">Try:</span>
              <button
                type="button"
                className="sample-pill-btn"
                onClick={() => {
                  setText('Tomorrow I am going to college because I have an important project review.');
                }}
              >
                Tomorrow College Review
              </button>
              <button
                type="button"
                className="sample-pill-btn"
                onClick={() => {
                  setText('Hello everyone, my name is Jashwan Karan.');
                }}
              >
                Hello My Name Jashwan
              </button>
              <button
                type="button"
                className="sample-pill-btn"
                onClick={() => {
                  setText('Good morning what to do next to learn computer science.');
                }}
              >
                Good Morning Computer Science
              </button>
            </div>
          </div>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}
      </section>

      {/* Integrated AnimateDiff 3D Studio (Directly inside Text to ASL) */}
      <section className="integrated-animatediff-section">
        <AnimateDiffStudio
          initialText={activeSentence}
          gloss={result?.gloss || ['TOMORROW', 'ME', 'COLLEGE', 'GO', 'WHY', 'ME', 'HAVE', 'IMPORTANT', 'PROJECT', 'REVIEW']}
          animations={result?.animations || []}
          unsupported={result?.unsupported || []}
          motionPlan={result?.motionPlan || null}
          linguisticStructure={result?.linguisticStructure || null}
          nonManualMarkers={result?.nonManualMarkers || []}
          animatediffData={result?.animatediff || null}
          datasetGestures={result?.datasetGestures || null}
        />

      </section>

      {/* Rainbow Architecture Diagram Flow */}
      <section className="pipeline-flow-section" style={{ marginTop: '2rem' }}>
        <RainbowPipelineDiagram activeStep="avatar" />
      </section>
    </div>
  );
}
