import React, { useState, useEffect } from 'react';

const load = (k, fb) => { try { const v = localStorage.getItem(`a11y-${k}`); return v!==null?JSON.parse(v):fb; } catch { return fb; } };
const save = (k, v) => { try { localStorage.setItem(`a11y-${k}`, JSON.stringify(v)); } catch {} };

function Toggle({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label}
      className={`settings-toggle ${on?'settings-toggle--on':''}`} onClick={() => onChange(!on)}>
      <span className="settings-toggle__thumb" />
    </button>
  );
}

const FONT_SIZES = ['14px','16px','18px','20px','24px'];
const CONTRAST   = ['default','high-contrast','yellow-black'];
const SPEEDS     = [0.5, 0.75, 1.0, 1.25, 1.5];

export default function AccessibilityTools() {
  const [fontSize,      setFontSize]      = useState(() => load('fontSize','16px'));
  const [contrast,      setContrast]      = useState(() => load('contrast','default'));
  const [motionSpeed,   setMotionSpeed]   = useState(() => load('motionSpeed', 1.0));
  const [reduceMotion,  setReduceMotion]  = useState(() => load('reduceMotion', false));
  const [captionSize,   setCaptionSize]   = useState(() => load('captionSize','medium'));
  const [captionBg,     setCaptionBg]     = useState(() => load('captionBg', true));
  const [screenReader,  setScreenReader]  = useState(() => load('screenReader', false));
  const [highViz,       setHighViz]       = useState(() => load('highViz', false));
  const [cursorBig,     setCursorBig]     = useState(() => load('cursorBig', false));

  useEffect(() => { save('fontSize',     fontSize);     document.documentElement.style.fontSize = fontSize; }, [fontSize]);
  useEffect(() => { save('contrast',     contrast);     document.body.dataset.contrast = contrast; }, [contrast]);
  useEffect(() => { save('motionSpeed',  motionSpeed); },  [motionSpeed]);
  useEffect(() => { save('reduceMotion', reduceMotion); document.body.dataset.reduceMotion = reduceMotion; }, [reduceMotion]);
  useEffect(() => { save('captionSize',  captionSize); }, [captionSize]);
  useEffect(() => { save('captionBg',    captionBg); },   [captionBg]);
  useEffect(() => { save('screenReader', screenReader); },[screenReader]);
  useEffect(() => { save('highViz',      highViz); document.body.dataset.highViz = highViz; }, [highViz]);
  useEffect(() => { save('cursorBig',    cursorBig); document.body.style.cursor = cursorBig ? 'url("")' : ''; }, [cursorBig]);

  function reset() {
    setFontSize('16px'); setContrast('default'); setMotionSpeed(1.0); setReduceMotion(false);
    setCaptionSize('medium'); setCaptionBg(true); setScreenReader(false); setHighViz(false); setCursorBig(false);
  }

  return (
    <div className="a11y-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">♿ ACCESSIBILITY TOOLS</span>
          <h2>Accessibility &amp; Display Preferences</h2>
          <p>Every setting below applies immediately and is saved to your browser. These options make ASL Bridge usable by everyone.</p>
        </div>
        <button type="button" className="a11y-reset-btn" onClick={reset}>↺ Reset all</button>
      </header>

      <div className="a11y-grid">

        {/* Vision */}
        <div className="settings-card">
          <h3>👁️ Vision &amp; Display</h3>

          <div className="setting-row">
            <div className="setting-info"><strong>Base Font Size</strong><p>Scales all text across the app.</p></div>
            <div className="speed-pills-row">
              {FONT_SIZES.map((s) => (
                <button key={s} type="button" className={`pill-btn ${fontSize===s?'active':''}`} onClick={() => setFontSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info"><strong>Colour Contrast</strong><p>Improves readability for low-vision users.</p></div>
            <div className="speed-pills-row">
              {CONTRAST.map((c) => (
                <button key={c} type="button" className={`pill-btn ${contrast===c?'active':''}`} onClick={() => setContrast(c)}>
                  {c==='default'?'Default':c==='high-contrast'?'High contrast':'Yellow / Black'}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info"><strong>High-Visibility Borders</strong><p>Adds thick visible borders to all interactive elements.</p></div>
            <Toggle on={highViz} onChange={setHighViz} label="High-visibility borders" />
          </div>
        </div>

        {/* Motion */}
        <div className="settings-card">
          <h3>🎬 Motion &amp; Animation</h3>

          <div className="setting-row">
            <div className="setting-info"><strong>Reduce Motion</strong><p>Disables sliding, fading, and auto-advancing animations.</p></div>
            <Toggle on={reduceMotion} onChange={setReduceMotion} label="Reduce motion" />
          </div>

          <div className="setting-row">
            <div className="setting-info"><strong>Avatar Playback Speed</strong><p>Controls how fast the 3D avatar performs signs.</p></div>
            <div className="speed-pills-row">
              {SPEEDS.map((s) => (
                <button key={s} type="button" className={`pill-btn ${motionSpeed===s?'active':''}`} onClick={() => setMotionSpeed(s)}>{s}×</button>
              ))}
            </div>
          </div>
        </div>

        {/* Captions */}
        <div className="settings-card">
          <h3>💬 Captions &amp; Text</h3>

          <div className="setting-row">
            <div className="setting-info"><strong>Caption Size</strong><p>Size of the live subtitle text under the avatar.</p></div>
            <div className="speed-pills-row">
              {['small','medium','large','x-large'].map((s) => (
                <button key={s} type="button" className={`pill-btn ${captionSize===s?'active':''}`} onClick={() => setCaptionSize(s)}>
                  {s[0].toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info"><strong>Caption Background</strong><p>Semi-transparent dark band behind captions for legibility.</p></div>
            <Toggle on={captionBg} onChange={setCaptionBg} label="Caption background" />
          </div>

          <div className="setting-row">
            <div className="setting-info"><strong>Screen Reader Hints</strong><p>Adds extra aria-label annotations to interactive components.</p></div>
            <Toggle on={screenReader} onChange={setScreenReader} label="Screen reader hints" />
          </div>
        </div>

        {/* Live preview */}
        <div className="settings-card a11y-preview-card">
          <h3>👀 Live Preview</h3>
          <div className="a11y-preview-box" style={{
            fontSize,
            background: contrast==='high-contrast' ? '#000' : contrast==='yellow-black' ? '#ffe000' : 'var(--panel)',
            color: contrast==='high-contrast' ? '#fff' : contrast==='yellow-black' ? '#000' : 'var(--ink)',
            border: highViz ? '3px solid #ef4444' : '1px solid var(--line)',
          }}>
            <p style={{margin:0,fontWeight:700}}>ASL Bridge — preview text</p>
            <p style={{margin:'0.4rem 0 0',fontSize:'0.85em',opacity:0.8}}>Adjust settings on the left to see changes here instantly.</p>
            <div className="a11y-preview-caption" style={{
              fontSize: captionSize==='small'?'0.7em':captionSize==='medium'?'0.9em':captionSize==='large'?'1.1em':'1.3em',
              background: captionBg ? 'rgba(0,0,0,0.6)' : 'transparent',
              padding: captionBg ? '4px 8px' : '0',
              borderRadius: '4px',
              marginTop: '0.6rem',
              display: 'inline-block',
            }}>
              🔤 Live Caption Preview — HELLO WORLD
            </div>
          </div>
          <p style={{fontSize:'0.75rem',color:'var(--muted)',marginTop:'0.5rem'}}>
            Current: font {fontSize} · contrast {contrast} · speed {motionSpeed}×
          </p>
        </div>

      </div>
    </div>
  );
}
