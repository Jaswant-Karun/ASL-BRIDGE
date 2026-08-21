import React from 'react';

export default function LiveCaptionBanner({
  fullText = '',
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
            {isSpeaking ? `${avatar?.name || 'Avatar'} is Speaking...` : 'Synchronized Speech & Captions'}
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
              title="Speak sentence with avatar voice"
            >
              🔊 Play Voice
            </button>
          )}
        </div>
      </div>

      {/* Main Subtitle Display Area */}
      <div className="caption-speech-box">
        <p className="caption-words-stream">
          {words.map((w, idx) => {
            const cleanWord = w.replace(/[^a-zA-Z0-9'-]/g, '');
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
      </div>
    </div>
  );
}
