import { useEffect, useRef, useState } from 'react';

export default function SpeechInput({ onTranscript, initialLang = 'en-US' }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState(initialLang);
  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  function toggleListening() {
    if (!supported) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => onTranscript?.(Array.from(event.results).map((result) => result[0].transcript).join(''));
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }

  const langNames = {
    'en-US': 'English',
    'ta-IN': 'Tamil (தமிழ்)',
    'hi-IN': 'Hindi (हिन्दी)'
  };

  return (
    <section className="speech-control">
      <div className="speech-input-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={toggleListening} disabled={!supported} className={`speech-mic-btn ${listening ? 'listening' : ''}`}>
          {listening ? '⏹ Stop listening' : '🎙️ Start microphone'}
        </button>

        <div className="language-selector-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.06)', padding: '0.25rem 0.65rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>🌐 Language:</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            disabled={listening}
            style={{ background: 'transparent', color: '#38bdf8', border: 'none', fontWeight: 600, cursor: 'pointer', outline: 'none', fontSize: '0.85rem' }}
          >
            <option value="en-US" style={{ background: '#0f172a', color: '#fff' }}>🇬🇧 English (en-US)</option>
            <option value="ta-IN" style={{ background: '#0f172a', color: '#fff' }}>🇮🇳 தமிழ் (ta-IN)</option>
            <option value="hi-IN" style={{ background: '#0f172a', color: '#fff' }}>🇮🇳 हिन्दी (hi-IN)</option>
          </select>
        </div>
      </div>

      <small>
        {supported
          ? listening
            ? `Listening for your ${langNames[lang] || 'speech'}...`
            : `Speak in ${langNames[lang] || 'your language'}; your transcript will appear below.`
          : 'Speech recognition is not supported in this browser.'}
      </small>
    </section>
  );
}
