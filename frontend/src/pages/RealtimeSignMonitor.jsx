import React, { useEffect, useRef, useState, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function RealtimeSignMonitor() {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const lastAtRef  = useRef(0);
  const streamRef  = useRef(null);
  const frameCount = useRef(0);
  const fpsTimer   = useRef(null);

  const [running,    setRunning]    = useState(false);
  const [fps,        setFps]        = useState(0);
  const [topPreds,   setTopPreds]   = useState([]);
  const [confidence, setConfidence] = useState(0);
  const [detected,   setDetected]   = useState('—');
  const [sessionLog, setSessionLog] = useState([]);    // [{label,conf,ts}]
  const [totalFrames, setTotalFrames] = useState(0);
  const [error,      setError]      = useState('');
  const [busy,       setBusy]       = useState(false);

  /* ── FPS ticker ── */
  useEffect(() => {
    if (!running) return;
    fpsTimer.current = setInterval(() => {
      setFps(frameCount.current);
      frameCount.current = 0;
    }, 1000);
    return () => clearInterval(fpsTimer.current);
  }, [running]);

  /* ── Prediction loop ── */
  const sendFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || busy) return;

    const now = Date.now();
    if (now - lastAtRef.current < 250) return;   // max 4 Hz to API
    lastAtRef.current = now;
    setBusy(true);

    canvas.width = 256; canvas.height = 256;
    canvas.getContext('2d').drawImage(video, 0, 0, 256, 256);

    canvas.toBlob(async (blob) => {
      if (!blob) { setBusy(false); return; }
      const fd = new FormData();
      fd.append('image', blob, 'frame.jpg');
      try {
        const res  = await fetch(`${API}/asl/predict`, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const label = String(data.prediction || '?').toUpperCase();
        const conf  = Math.round((data.confidence || 0) * 100);
        setDetected(label);
        setConfidence(conf);
        setTopPreds(data.topMatches || []);
        setTotalFrames((n) => n + 1);
        setSessionLog((prev) => {
          const last = prev[prev.length - 1];
          if (last?.label === label) return prev;
          return [...prev, { label, conf, ts: new Date().toLocaleTimeString() }].slice(-40);
        });
      } catch { /* silent */ }
      finally { setBusy(false); }
    }, 'image/jpeg', 0.82);
  }, [busy]);

  /* ── rAF loop ── */
  const loop = useCallback(() => {
    frameCount.current += 1;
    sendFrame();
    rafRef.current = requestAnimationFrame(loop);
  }, [sendFrame]);

  async function start() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width:640, height:480, facingMode:'user' }, audio: false });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setRunning(true);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      setError(e.message || 'Camera error');
    }
  }

  function stop() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRunning(false); setFps(0); setDetected('—'); setConfidence(0); setTopPreds([]);
  }

  useEffect(() => () => stop(), []); // cleanup on unmount

  const avgConf = sessionLog.length
    ? Math.round(sessionLog.reduce((s, l) => s + l.conf, 0) / sessionLog.length)
    : 0;

  return (
    <div className="monitor-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">⚡ REAL-TIME SIGN MONITOR</span>
          <h2>Live Prediction Dashboard</h2>
          <p>Streams your webcam to the ASL model at up to 4 predictions/sec. Watch confidence, top-3 matches, and session history in real time.</p>
        </div>
      </header>

      <div className="monitor-layout">
        {/* Camera + big letter */}
        <div className="monitor-cam-col">
          <div className="monitor-video-wrap">
            <video ref={videoRef} autoPlay muted playsInline className="monitor-video" />
            <canvas ref={canvasRef} style={{ display:'none' }} />
            {!running && (
              <div className="monitor-start-overlay">
                <button type="button" className="monitor-start-btn" onClick={start}>▶ Start Monitor</button>
                {error && <p className="monitor-error">{error}</p>}
              </div>
            )}
            {running && (
              <div className="monitor-hud">
                <span className="monitor-fps-badge">{fps} FPS</span>
                <span className={`monitor-busy-dot ${busy ? 'busy' : ''}`} />
              </div>
            )}
          </div>
          {running && (
            <button type="button" className="monitor-stop-btn" onClick={stop}>■ Stop</button>
          )}
        </div>

        {/* Stats column */}
        <div className="monitor-stats-col">
          {/* Big detected letter */}
          <div className="monitor-big-letter">
            <span className="monitor-letter-char">{detected}</span>
            <span className="monitor-letter-label">Detected</span>
          </div>

          {/* Confidence meter */}
          <div className="monitor-conf-card">
            <span className="monitor-conf-label">Confidence</span>
            <div className="monitor-conf-track">
              <div className="monitor-conf-fill" style={{ width: `${confidence}%`,
                background: confidence >= 70 ? '#22c55e' : confidence >= 40 ? '#f59e0b' : '#ef4444' }} />
            </div>
            <span className="monitor-conf-value">{confidence}%</span>
          </div>

          {/* Top-3 bar */}
          <div className="monitor-top3">
            <span className="rainbow-kicker" style={{marginBottom:'0.5rem',display:'block'}}>TOP MATCHES</span>
            {topPreds.slice(0,3).map((m) => (
              <div key={m.label} className="monitor-match-row">
                <span className="monitor-match-label">{String(m.label).toUpperCase()}</span>
                <div className="monitor-match-track">
                  <div className="monitor-match-fill" style={{ width:`${Math.round(m.confidence*100)}%` }} />
                </div>
                <span className="monitor-match-pct">{Math.round(m.confidence*100)}%</span>
              </div>
            ))}
            {topPreds.length === 0 && <p style={{color:'var(--muted)',fontSize:'0.8rem'}}>Waiting for hand…</p>}
          </div>

          {/* Session stats */}
          <div className="monitor-session-stats">
            <div className="monitor-stat"><span>Frames analyzed</span><strong>{totalFrames}</strong></div>
            <div className="monitor-stat"><span>Avg confidence</span><strong>{avgConf}%</strong></div>
            <div className="monitor-stat"><span>Unique letters</span><strong>{new Set(sessionLog.map(l=>l.label)).size}</strong></div>
          </div>
        </div>
      </div>

      {/* Session tape */}
      {sessionLog.length > 0 && (
        <section className="monitor-log-section">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
            <span className="rainbow-kicker">SESSION TAPE</span>
            <button type="button" className="clear-history-btn" onClick={() => setSessionLog([])}>Clear</button>
          </div>
          <div className="history-tape">
            {sessionLog.map((e, i) => (
              <span key={i} className={`history-chip ${i===sessionLog.length-1?'history-chip--latest':''}`}
                title={`${e.ts} · ${e.conf}%`}>{e.label}</span>
            ))}
          </div>
          <p style={{marginTop:'0.5rem',fontSize:'0.78rem',color:'var(--muted)'}}>
            Spelled so far: <strong style={{color:'var(--accent)'}}>
              {sessionLog.filter(e=>/^[A-Z]$/.test(e.label)).map(e=>e.label).join('')}
            </strong>
          </p>
        </section>
      )}
    </div>
  );
}
