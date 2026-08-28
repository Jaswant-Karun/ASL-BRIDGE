import React, { useState, useEffect } from 'react';

/* ── Small reusable toggle switch ─────────────────────────────────────── */
function Toggle({ on, onChange, label, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`settings-toggle ${on ? 'settings-toggle--on' : ''}`}
      onClick={() => onChange(!on)}
    >
      <span className="settings-toggle__thumb" />
    </button>
  );
}

export default function SettingsPage({ darkMode, onToggleTheme }) {
  /* persist all prefs in localStorage so they survive page refresh */
  const load = (key, fallback) => {
    try { const v = localStorage.getItem(`asl-pref-${key}`); return v !== null ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  };
  const save = (key, val) => {
    try { localStorage.setItem(`asl-pref-${key}`, JSON.stringify(val)); } catch {}
  };

  const [rainbowGlow,   setRainbowGlow]   = useState(() => load('rainbowGlow', true));
  const [rainbowInt,    setRainbowInt]     = useState(() => load('rainbowInt', 85));
  const [autoVoice,     setAutoVoice]      = useState(() => load('autoVoice', true));
  const [captionsOn,    setCaptionsOn]     = useState(() => load('captionsOn', true));
  const [captionSize,   setCaptionSize]    = useState(() => load('captionSize', 'medium'));
  const [speechSpeed,   setSpeechSpeed]    = useState(() => load('speechSpeed', 1.0));
  const [landmarkDots,  setLandmarkDots]   = useState(() => load('landmarkDots', true));
  const [gestureSound,  setGestureSound]   = useState(() => load('gestureSound', false));
  const [reduceMotion,  setReduceMotion]   = useState(() => load('reduceMotion', false));

  /* persist on every change */
  useEffect(() => save('rainbowGlow',  rainbowGlow),  [rainbowGlow]);
  useEffect(() => save('rainbowInt',   rainbowInt),   [rainbowInt]);
  useEffect(() => save('autoVoice',    autoVoice),    [autoVoice]);
  useEffect(() => save('captionsOn',   captionsOn),   [captionsOn]);
  useEffect(() => save('captionSize',  captionSize),  [captionSize]);
  useEffect(() => save('speechSpeed',  speechSpeed),  [speechSpeed]);
  useEffect(() => save('landmarkDots', landmarkDots), [landmarkDots]);
  useEffect(() => save('gestureSound', gestureSound), [gestureSound]);
  useEffect(() => save('reduceMotion', reduceMotion), [reduceMotion]);

  return (
    <div className="settings-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">⚙️ SYSTEM PREFERENCES</span>
          <h2>Studio Settings</h2>
          <p>All preferences are saved automatically to your browser and applied immediately.</p>
        </div>
      </header>

      <div className="settings-grid">

        {/* ── Theme ──────────────────────────────────────────────────── */}
        <div className="settings-card">
          <h3>🎨 Appearance</h3>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Dark / Light Mode</strong>
              <p>Switch between the deep-dark cyber studio and the light blue workspace theme.</p>
            </div>
            <div className="theme-toggle-group">
              <button
                type="button"
                className={`theme-mode-btn ${darkMode ? '' : 'theme-mode-btn--active'}`}
                onClick={() => darkMode && onToggleTheme()}
              >
                ☀️ Light
              </button>
              <button
                type="button"
                className={`theme-mode-btn ${darkMode ? 'theme-mode-btn--active' : ''}`}
                onClick={() => !darkMode && onToggleTheme()}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Rainbow Neon Glow</strong>
              <p>Enable animated rainbow gradient outlines on buttons and panels.</p>
            </div>
            <Toggle on={rainbowGlow} onChange={setRainbowGlow} label="Rainbow glow" />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Glow Intensity — {rainbowInt}%</strong>
              <p>Controls the bloom radius of rainbow motion borders.</p>
            </div>
            <div className="slider-box">
              <input
                type="range" min="20" max="100"
                value={rainbowInt}
                onChange={(e) => setRainbowInt(Number(e.target.value))}
                className="rainbow-slider"
                disabled={!rainbowGlow}
                aria-label="Rainbow glow intensity"
              />
              <span>{rainbowInt}%</span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Reduce Motion</strong>
              <p>Disables auto-advancing animations and fade transitions for accessibility.</p>
            </div>
            <Toggle on={reduceMotion} onChange={setReduceMotion} label="Reduce motion" />
          </div>
        </div>

        {/* ── Voice ──────────────────────────────────────────────────── */}
        <div className="settings-card">
          <h3>🔊 Voice &amp; Captions</h3>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Auto Avatar Voice</strong>
              <p>Speak the translated sentence automatically after each translation.</p>
            </div>
            <Toggle on={autoVoice} onChange={setAutoVoice} label="Auto avatar voice" />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Live Captions</strong>
              <p>Show real-time subtitle captions beneath the avatar viewport.</p>
            </div>
            <Toggle on={captionsOn} onChange={setCaptionsOn} label="Live captions" />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Caption Size</strong>
              <p>Typography size of the live subtitle banner.</p>
            </div>
            <div className="speed-pills-row">
              {['small', 'medium', 'large'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`pill-btn ${captionSize === sz ? 'active' : ''}`}
                  onClick={() => setCaptionSize(sz)}
                >
                  {sz[0].toUpperCase() + sz.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Speech Speed</strong>
              <p>How fast the avatar narrates the translated sentence.</p>
            </div>
            <div className="speed-pills-row">
              {[0.75, 1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`pill-btn ${speechSpeed === s ? 'active' : ''}`}
                  onClick={() => setSpeechSpeed(s)}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Camera ─────────────────────────────────────────────────── */}
        <div className="settings-card">
          <h3>📹 Camera &amp; Gesture Recognition</h3>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Landmark Dot Overlay</strong>
              <p>Draw 21 blue landmark dots on your hand in the live camera feed.</p>
            </div>
            <Toggle on={landmarkDots} onChange={setLandmarkDots} label="Landmark dots" />
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <strong>Gesture Sound Feedback</strong>
              <p>Play a subtle click tone each time a new letter is confidently detected.</p>
            </div>
            <Toggle on={gestureSound} onChange={setGestureSound} label="Gesture sound" />
          </div>
        </div>

        {/* ── About / version ────────────────────────────────────────── */}
        <div className="settings-card settings-card--info">
          <h3>ℹ️ About ASL Bridge Studio</h3>
          <div className="about-info-grid">
            <div className="about-row"><span>Version</span><strong>1.0.0</strong></div>
            <div className="about-row"><span>Model</span><strong>KNN · 24×24 grayscale · 36 classes</strong></div>
            <div className="about-row"><span>Avatar engine</span><strong>Three.js 3D skeletal rig · 60 FPS</strong></div>
            <div className="about-row"><span>Hand tracking</span><strong>MediaPipe HandLandmarker (21 pts)</strong></div>
            <div className="about-row"><span>Speech engine</span><strong>Web Speech API · Faster-Whisper</strong></div>
            <div className="about-row"><span>Theme</span><strong>{darkMode ? 'Dark Cyber Blue' : 'Light Blue'}</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
}
