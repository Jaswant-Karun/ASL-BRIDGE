import React from 'react';

export default function LiveCaptionBanner({
  fullText = '',
  translatedEnglish = '',
  language = 'en',
  languageName = 'English',
  currentWord = '',
  activeGlossToken = '',
  isSpeaking = false,
  onSpeakAgain = null,
  onStopSpeech = null,
  avatar = null
}) {
  if (!fullText) return null;

  const words = fullText.split(/\s+/).filter(Boolean);

  return (
    <div className="live-caption-container" aria-label="Real-time spoken captions">
      <div className="caption-top-bar">
        <div className="caption-meta">
          <span className="caption-live-indicator">
            <span className={`voice-waveform ${isSpeaking ? 'active' : ''}`}>
              <span></span><span></span><span></span><span></span>
            </span>
            {isSpeaking
              ? `${avatar?.name || 'Avatar'} Speaking in ${languageName || 'Selected Language'}...`
              : `Voice Narration (${languageName || 'Selected Language'})`}
          </span>
          {activeGlossToken && (
            <span className="caption-active-token">
              Sign: <strong>{activeGlossToken}</strong>
            </span>
          )}
        </div>

        <div className="caption-actions">
          {isSpeaking ? (
            <button
              type="button"
              className="caption-voice-btn stop"
              onClick={onStopSpeech}
              title="Stop Avatar Voice"
            >
              🔇 Stop Voice
            </button>
          ) : (
            <button
              type="button"
              className="caption-voice-btn speak"
              onClick={onSpeakAgain}
              title={`Speak sentence in ${languageName || 'selected language'}`}
            >
              🔊 Play Voice ({languageName || 'Voice'})
            </button>
          )}
        </div>
      </div>

      {/* Main Subtitle Display Area */}
      <div className="caption-speech-box">
        <p className="caption-words-stream">
          {words.map((w, idx) => {
            const cleanWord = w.replace(/[.,!?()[\]{}"'\\/|।]/g, '');
            const isCurrent =
              currentWord &&
              cleanWord.toLowerCase() === currentWord.toLowerCase();

            return (
              <span
                key={`${w}-${idx}`}
                className={`caption-word ${isCurrent ? 'highlight-active' : ''}`}
              >
                {w}{' '}
              </span>
            );
          })}
        </p>

        {translatedEnglish && translatedEnglish !== fullText && (
          <div className="caption-english-sub" style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.35rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>English Conversion: </span>
            "{translatedEnglish}"
          </div>
        )}
      </div>
    </div>
  );
}
