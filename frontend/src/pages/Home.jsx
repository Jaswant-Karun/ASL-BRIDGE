import React, { useState, useCallback } from 'react';
import { translateText } from '../services/api';
import AnimateDiffStudio from '../components/AnimateDiffStudio';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';
import { logTranslation } from './AnalyticsPage';

export default function Home({ navigate, user }) {
  const [text,      setText]      = useState('');
  const [result,    setResult]    = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [copied,    setCopied]    = useState(false);

  // ---------- translation ----------
  const runTranslation = useCallback(async (sentence) => {
    if (!sentence.trim()) return;
    setLoading(true);
    setError('');
    try {
      const t0 = Date.now();
      const translation = await translateText(sentence.trim());
      logTranslation(sentence.trim(), translation.gloss || [], Date.now() - t0);
      setResult(translation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  function submit(event) {
    if (event) event.preventDefault();
    setSubmitted(true);
    runTranslation(text);
  }

  // ---------- helpers ----------
  function copyText() {
    if (!text.trim()) return;
    navigator.clipboard?.writeText(text.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function clearText() {
    setText('');
    setResult(null);
    setSubmitted(false);
    setError('');
  }

  function loadSample(sample) {
    setText(sample);
    setSubmitted(true);
    runTranslation(sample);
  }

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
            placeholder="Type a sentence…"
            className="rainbow-textarea"
          />

          {/* Meta bar: char count + copy + clear */}
          <div className="home-meta-bar">
            <span className="char-count-pill">
              {text.length} chars · {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              type="button"
              className={`copy-sentence-btn ${copied ? 'copy-sentence-btn--copied' : ''}`}
              onClick={copyText}
              disabled={!text.trim()}
            >
              {copied ? '✓ Copied!' : '⎘ Copy'}
            </button>
            <button
              type="button"
              className="clear-text-btn"
              onClick={clearText}
              disabled={!text.trim() && !submitted}
              title="Clear text and reset"
            >
              ✕ Clear
            </button>
          </div>

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
              <button type="button" className="sample-pill-btn"
                onClick={() => loadSample('Tomorrow I am going to college because I have an important project review.')}>
                Tomorrow College Review
              </button>
              <button type="button" className="sample-pill-btn"
                onClick={() => loadSample('Hello everyone, my name is Jashwan Karan.')}>
                Hello My Name Jashwan
              </button>
              <button type="button" className="sample-pill-btn"
                onClick={() => loadSample('Good morning what to do next to learn computer science.')}>
                Good Morning Computer Science
              </button>
            </div>
          </div>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}
      </section>

      {/* Studio — only shown after submit */}
      {submitted && (
        <section className="integrated-animatediff-section">
          <AnimateDiffStudio
            initialText={result?.originalText || text}
            gloss={result?.gloss || []}
            animations={result?.animations || []}
            unsupported={result?.unsupported || []}
            motionPlan={result?.motionPlan || null}
            linguisticStructure={result?.linguisticStructure || null}
            nonManualMarkers={result?.nonManualMarkers || []}
            animatediffData={result?.animatediff || null}
            datasetGestures={result?.datasetGestures || null}
          />
        </section>
      )}

      {/* Placeholder before first submit */}
      {!submitted && (
        <section className="home-pre-submit-hint">
          <div className="pre-submit-card">
            <span className="pre-submit-icon">✋</span>
            <h3>Type a sentence above and click Generate</h3>
            <p>The 3D avatar and ASL hand gesture images will appear here after you submit your first sentence.</p>
          </div>
        </section>
      )}

      {/* Architecture diagram */}
      <section className="pipeline-flow-section" style={{ marginTop: '2rem' }}>
        <RainbowPipelineDiagram activeStep="avatar" />
      </section>
    </div>
  );
}
