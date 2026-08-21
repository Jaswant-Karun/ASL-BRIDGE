import React, { useState } from 'react';

export default function SettingsPage({ darkMode, onToggleTheme }) {
  const [rainbowIntensity, setRainbowIntensity] = useState(85);
  const [captionSize, setCaptionSize] = useState('medium');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [autoVoice, setAutoVoice] = useState(true);

  return (
    <div className="settings-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">⚙️ SYSTEM PREFERENCES</span>
          <h2>Rainbow Theme & Studio Settings</h2>
          <p>Customize rainbow motion outlines, dark background styling, voice speech rates, and live captions.</p>
        </div>
      </header>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>🌈 Rainbow Motion & Aesthetics</h3>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Rainbow Button Outlines</strong>
              <p>Enable vibrant rainbow neon gradient motion outlines on interactive buttons.</p>
            </div>
            <span className="badge-enabled">ENABLED</span>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Rainbow Glow Intensity</strong>
              <p>Adjust the brightness and bloom radius of rainbow motion borders.</p>
            </div>
            <div className="slider-box">
              <input
                type="range"
                min="30"
                max="100"
                value={rainbowIntensity}
                onChange={(e) => setRainbowIntensity(e.target.value)}
                className="rainbow-slider"
              />
              <span>{rainbowIntensity}%</span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Deep Dark Background Mode</strong>
              <p>Ultra-dark studio backdrop optimized for high visual contrast.</p>
            </div>
            <button
              type="button"
              className={`toggle-switch ${darkMode ? 'active' : ''}`}
              onClick={onToggleTheme}
            >
              {darkMode ? '🌙 Dark Mode Active' : '☀️ Light Mode'}
            </button>
          </div>
        </div>

        <div className="settings-card">
          <h3>🔊 Voice Speech & Live Captions</h3>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Automatic Avatar Voice Narration</strong>
              <p>Automatically speak the sentence out loud whenever translation begins.</p>
            </div>
            <button
              type="button"
              className={`toggle-switch ${autoVoice ? 'active' : ''}`}
              onClick={() => setAutoVoice(!autoVoice)}
            >
              {autoVoice ? '🔊 Voice ON' : '🔇 Muted'}
            </button>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Speech Narration Speed</strong>
              <p>Adjust how fast the avatar speaks.</p>
            </div>
            <div className="speed-pills-row">
              {[0.75, 1.0, 1.25].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`pill-btn ${speechSpeed === s ? 'active' : ''}`}
                  onClick={() => setSpeechSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Live Subtitle Caption Size</strong>
              <p>Configure caption typography size underneath the 3D avatar viewport.</p>
            </div>
            <div className="speed-pills-row">
              {['small', 'medium', 'large'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`pill-btn ${captionSize === sz ? 'active' : ''}`}
                  onClick={() => setCaptionSize(sz)}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
