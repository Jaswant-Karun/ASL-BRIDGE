import React, { useState, useRef, useCallback } from 'react';
import { translateText } from '../services/api';
import AnimateDiffStudio from '../components/AnimateDiffStudio';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';

export default function Home({ navigate, user }) {
  const [text, setText] = useState('Tomorrow I am going to college because I have an important project review.');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const autoSubmitTimerRef = useRef(null);

  // ---------- translation ----------
  const runTranslation = useCallback(async (sentence) => {
    if (!sentence.trim()) return;
    setLoading(true);
    setError('');
    try {
      const translation = await translateText(sentence.trim());
      setResult(translation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  async function submit(event) {
    if (event) event.preventDefault();
    runTranslation(text);
  }

  // ---------- speech input ----------
  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  function startListening() {
    if (!supported) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setText(transcript);

      // Auto-submit 1.2 s after the user stops talking
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = setTimeout(() => {
        runTranslation(transcript);
      }, 1200);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
  }

  function toggleListening() {
    listening ? stopListening() : startListening();
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

          <div className="textarea-mic-row">
            <textarea
              id="translation-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows="3"
              placeholder="Type or speak a sentence…"
              className="rainbow-textarea"
            />

            {/* Microphone button */}
            <button
              type="button"
              className={`mic-btn ${listening ? 'mic-btn--active' : ''}`}
              onClick={toggleListening}
              disabled={!supported}
              title={supported ? (listening ? 'Stop microphone' : 'Start microphone') : 'Speech recognition not supported'}
              aria-label={listening ? 'Stop listening' : 'Start microphone'}
            >
              {listening ? (
                <>
                  <span className="mic-pulse-ring" />
                  <span className="mic-icon">🎙️</span>
                  <span className="mic-label">Listening…</span>
                </>
              ) : (
                <>
                  <span className="mic-icon">🎤</span>
                  <span className="mic-label">Speak</span>
                </>
              )}
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
              <button
                type="button"
                className="sample-pill-btn"
                onClick={() => setText('Tomorrow I am going to college because I have an important project review.')}
              >
                Tomorrow College Review
              </button>
              <button
                type="button"
                className="sample-pill-btn"
                onClick={() => setText('Hello everyone, my name is Jashwan Karan.')}
              >
                Hello My Name Jashwan
              </button>
              <button
                type="button"
                className="sample-pill-btn"
                onClick={() => setText('Good morning what to do next to learn computer science.')}
              >
                Good Morning Computer Science
              </button>
            </div>
          </div>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}
      </section>

      {/* Integrated AnimateDiff 3D Studio */}
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
