import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { translateText } from '../services/api';
import ASLPlayer from '../components/ASLPlayer';
import ActivityChart from '../components/ActivityChart';

export default function Home({ navigate, user, darkMode, onToggleTheme }) {
  const [text, setText] = useState('Welcome to our computer science class.');
  const [avatarId, setAvatarId] = useState('sarah');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    if (event) event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const translation = await translateText(text, avatarId);
      setResult(translation);
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
        <p className="eyebrow">YOUR ACCESSIBILITY WORKSPACE</p>
        <h1>Good to see you{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1>
        <p className="dashboard-intro">
          Synthesize high-fidelity ASL video animations using AnimateDiff motion diffusion and avatar personas.
        </p>

        {/* Feature Mode Grid */}
        <div className="mode-grid">
          <button type="button" onClick={() => document.getElementById('translation-text')?.focus()}>
            <span className="mode-icon">✨</span>
            <strong>AnimateDiff Avatar Studio</strong>
            <small>Turn written text into realistic avatar sign videos</small>
          </button>
          <button type="button" onClick={() => navigate?.('live')}>
            <span className="mode-icon">◉</span>
            <strong>Live Translation</strong>
            <small>Follow real-time speech with avatar signing</small>
          </button>
          <button type="button" onClick={() => navigate?.('presentation')}>
            <span className="mode-icon">▣</span>
            <strong>Presentation Mode</strong>
            <small>Translate PowerPoint slides with avatar</small>
          </button>
        </div>

        <ActivityChart />

        {/* Translation Input Section */}
        <div className="section-heading">
          <div>
            <p className="eyebrow">ANIMATEDIFF TEXT TO ASL</p>
            <h2>Synthesize Avatar Sign Video</h2>
          </div>
          <span className="status-pill">● AnimateDiff v3 Ready</span>
        </div>

        <form onSubmit={submit} className="translation-form">
          <label htmlFor="translation-text">Enter English sentence to translate into sign video</label>
          <textarea
            id="translation-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows="3"
            placeholder="Type a sentence (e.g. Welcome to our computer science class)..."
          />

          <div className="form-action-row">
            <button type="submit" className="primary-action-btn" disabled={loading || !text.trim()}>
              {loading ? '🎬 Generating AnimateDiff Video...' : '✨ Generate Avatar Sign Video'}
            </button>
          </div>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}

        {/* Translation Results & AnimateDiff Studio */}
        {result && (
          <section className="results-section" aria-label="Translation result">
            <div className="results-header-card">
              <div>
                <span className="result-kicker">CAPTIONS & GLOSS SEQUENCE</span>
                <p className="caption-text">"{result.originalText}"</p>
                <div className="gloss-sequence-badges">
                  {result.gloss.map((token, idx) => (
                    <span key={`${token}-${idx}`} className="gloss-token-badge">
                      {token}
                    </span>
                  ))}
                </div>
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
