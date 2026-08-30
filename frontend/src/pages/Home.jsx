import React, { useState, useCallback } from 'react';
import { translateText } from '../services/api';
import AnimateDiffStudio from '../components/AnimateDiffStudio';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';
import { logTranslation } from './AnalyticsPage';

export default function Home({ navigate, user }) {
  const [text,      setText]      = useState('');
  const [inputLang, setInputLang] = useState('en'); // 'en' | 'ta' | 'hi'
  const [result,    setResult]    = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [copied,    setCopied]    = useState(false);

  // ---------- translation ----------
  const runTranslation = useCallback(async (sentence, lang = inputLang) => {
    if (!sentence.trim()) return;
    setLoading(true);
    setError('');
    try {
      const t0 = Date.now();
      const translation = await translateText(sentence.trim(), lang);
      logTranslation(sentence.trim(), translation.gloss || [], Date.now() - t0);
      setResult(translation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [inputLang]);

  function submit(event) {
    if (event) event.preventDefault();
    setSubmitted(true);
    runTranslation(text, inputLang);
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

  function loadSample(sample, lang = inputLang) {
    setText(sample);
    setInputLang(lang);
    setSubmitted(true);
    runTranslation(sample, lang);
  }

  const samplePresets = {
    en: [
      { label: 'Tomorrow College Review', text: 'Tomorrow I am going to college because I have an important project review.' },
      { label: 'Hello My Name Jashwan', text: 'Hello everyone, my name is Jashwan Karan.' },
      { label: 'Thank You For Help', text: 'Good morning, thank you for your help today.' }
    ],
    ta: [
      { label: 'நாளை கல்லூரி செல்கிறேன்', text: 'நாளை நான் கல்லூரி போகிறேன் எனக்கு முக்கிய திட்டம் உள்ளது.' },
      { label: 'வணக்கம் என் பெயர் ஜஸ்வந்த்', text: 'வணக்கம் எல்லோருக்கும், என் பெயர் ஜஸ்வந்த் கரன்.' },
      { label: 'உதவிக்கு நன்றி', text: 'காலை வணக்கம், உங்கள் உதவிக்கு மிக்க நன்றி.' }
    ],
    hi: [
      { label: 'कल कॉलेज जा रहा हूँ', text: 'कल मैं कॉलेज जा रहा हूँ क्योंकि मेरा महत्वपूर्ण प्रोजेक्ट है।' },
      { label: 'नमस्ते मेरा नाम जशवंत', text: 'नमस्ते, मेरा नाम जशवंत करन है।' },
      { label: 'मदद के लिए धन्यवाद', text: 'शुभ प्रभात, आपकी सहायता के लिए धन्यवाद।' }
    ]
  };

  const placeholders = {
    en: 'Type any English sentence (e.g. Tomorrow I am going to college...)',
    ta: 'தமிழில் தட்டச்சு செய்யவும் (எ.கா: நாளை நான் கல்லூரி போகிறேன்...)',
    hi: 'हिन्दी में लिखें (उदा: कल मैं कॉलेज जा रहा हूँ...)'
  };

  return (
    <div className="home-workspace-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">🌐 MULTILINGUAL ASL ANIMATEDIFF 3D STUDIO</span>
          <h2>Tamil + English + Hindi to ASL 3D Avatar</h2>
          <p>
            Translate natural speech or text in <strong>Tamil (தமிழ்)</strong>, <strong>English</strong>, and <strong>Hindi (हिन्दी)</strong> into continuous 3D avatar sign language with synchronized voice narration.
          </p>
        </div>
      </header>

      {/* Text Input Card */}
      <section className="text-input-card">
        <form onSubmit={submit} className="translation-form">
          <div className="input-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            {/* Language Selector Pills */}
            <div className="language-tab-group" style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', padding: '0.3rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                type="button"
                className={`lang-pill-btn ${inputLang === 'en' ? 'active' : ''}`}
                onClick={() => setInputLang('en')}
                style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: inputLang === 'en' ? '#38bdf8' : 'transparent', color: inputLang === 'en' ? '#040814' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                className={`lang-pill-btn ${inputLang === 'ta' ? 'active' : ''}`}
                onClick={() => setInputLang('ta')}
                style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: inputLang === 'ta' ? '#10b981' : 'transparent', color: inputLang === 'ta' ? '#040814' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                🇮🇳 தமிழ் (Tamil)
              </button>
              <button
                type="button"
                className={`lang-pill-btn ${inputLang === 'hi' ? 'active' : ''}`}
                onClick={() => setInputLang('hi')}
                style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: inputLang === 'hi' ? '#f59e0b' : 'transparent', color: inputLang === 'hi' ? '#040814' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                🇮🇳 हिन्दी (Hindi)
              </button>
            </div>

            <span className="telemetry-pill">● Multilingual NLP & 3D Engine Active</span>
          </div>

          <textarea
            id="translation-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows="3"
            placeholder={placeholders[inputLang]}
            className="rainbow-textarea"
            style={{ marginTop: '0.75rem' }}
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
              <span>{loading ? '🎬 Synthesizing 3D Motion...' : '✨ Generate 3D Avatar Sign Video'}</span>
            </button>

            {/* Multilingual Quick Sample Prompts */}
            <div className="quick-samples-row">
              <span className="sample-label">Try ({inputLang.toUpperCase()}):</span>
              {samplePresets[inputLang].map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sample-pill-btn"
                  onClick={() => loadSample(s.text, inputLang)}
                >
                  {s.label}
                </button>
              ))}
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
            translatedEnglish={result?.translatedEnglish || ''}
            gloss={result?.gloss || []}
            animations={result?.animations || []}
            unsupported={result?.unsupported || []}
            motionPlan={result?.motionPlan || null}
            linguisticStructure={result?.linguisticStructure || null}
            nonManualMarkers={result?.nonManualMarkers || []}
            animatediffData={result?.animatediff || null}
            datasetGestures={result?.datasetGestures || null}
            language={result?.language || inputLang}
            languageName={result?.languageName || 'English'}
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
