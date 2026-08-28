import React, { useRef, useState, useEffect } from 'react';

const API     = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000';

export default function GestureCapture() {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const [running,    setRunning]    = useState(false);
  const [snapshot,   setSnapshot]   = useState(null);   // dataURL
  const [predResult, setPredResult] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [gallery,    setGallery]    = useState([]);     // [{dataURL, prediction, confidence, ts}]
  const [sampleIdx,  setSampleIdx]  = useState(0);

  async function startCamera() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ width:640, height:480, facingMode:'user' }, audio:false });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setRunning(true);
    } catch (e) { setError(e.message || 'Camera error'); }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRunning(false);
  }

  useEffect(() => () => stopCamera(), []);

  async function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    canvas.getContext('2d').drawImage(video, 0, 0, 256, 256);
    const dataURL = canvas.toDataURL('image/jpeg', 0.85);
    setSnapshot(dataURL);
    setPredResult(null);
    setLoading(true); setError('');

    canvas.toBlob(async (blob) => {
      const fd = new FormData();
      fd.append('image', blob, 'capture.jpg');
      try {
        const res  = await fetch(`${API}/asl/predict`, { method:'POST', body:fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const result = { label: String(data.prediction||'?').toUpperCase(), confidence: Math.round((data.confidence||0)*100), topMatches: data.topMatches||[] };
        setPredResult(result);
        setGallery((prev) => [{
          dataURL,
          label: result.label,
          confidence: result.confidence,
          ts: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 20));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }, 'image/jpeg', 0.85);
  }

  return (
    <div className="capture-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">📸 GESTURE CAPTURE</span>
          <h2>Snapshot &amp; Predict</h2>
          <p>Take a snapshot of your hand gesture. The ASL model identifies the letter and compares it to the dataset reference image.</p>
        </div>
      </header>

      <div className="capture-layout">
        {/* Camera */}
        <div className="capture-cam-col">
          <div className="monitor-video-wrap">
            <video ref={videoRef} autoPlay muted playsInline className="monitor-video" />
            {!running && (
              <div className="monitor-start-overlay">
                <button type="button" className="monitor-start-btn" onClick={startCamera}>▶ Start Camera</button>
                {error && <p className="monitor-error">{error}</p>}
              </div>
            )}
          </div>
          {running && (
            <div style={{display:'flex',gap:'0.6rem',marginTop:'0.6rem'}}>
              <button type="button" className="ftl-drill-btn" onClick={capture} disabled={loading}>
                {loading ? '⏳ Analyzing…' : '📸 Capture & Predict'}
              </button>
              <button type="button" className="ftl-exit-btn" onClick={stopCamera}>■ Stop</button>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="capture-result-col">
          <span className="rainbow-kicker" style={{marginBottom:'0.5rem',display:'block'}}>PREDICTION RESULT</span>

          {!snapshot && <p style={{color:'var(--muted)',fontSize:'0.82rem'}}>Start the camera and capture a gesture to see the prediction here.</p>}

          {snapshot && (
            <div className="capture-compare-grid">
              {/* Snapshot */}
              <div className="capture-compare-box">
                <span className="capture-compare-label">Your snapshot</span>
                <img src={snapshot} alt="Your captured gesture" className="capture-compare-img" />
              </div>

              {/* Dataset reference */}
              <div className="capture-compare-box">
                <span className="capture-compare-label">Dataset reference — {predResult?.label || '?'}</span>
                {predResult ? (
                  <img src={`${API_BASE}/dataset-image/${predResult.label.toLowerCase()}?sample=${sampleIdx}`}
                    alt={`Dataset ASL ${predResult.label}`} className="capture-compare-img"
                    onError={(e) => { e.currentTarget.src = `${API_BASE}/dataset-image/${predResult.label.toLowerCase()}`; }} />
                ) : (
                  <div className="capture-compare-img" style={{background:'var(--panel)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{color:'var(--muted)'}}>…</span>
                  </div>
                )}
                {predResult && (
                  <div className="ftl-sample-dots" style={{marginTop:'0.3rem'}}>
                    {[0,1,2,3].map((i) => (
                      <button key={i} type="button" className={`ftl-dot-btn ${sampleIdx===i?'active':''}`} onClick={() => setSampleIdx(i)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {predResult && (
            <div style={{marginTop:'1rem'}}>
              {/* Big letter */}
              <div className="monitor-big-letter" style={{marginBottom:'0.75rem'}}>
                <span className="monitor-letter-char">{predResult.label}</span>
                <span className="monitor-letter-label">Predicted</span>
              </div>

              {/* Confidence meter */}
              <div className="monitor-conf-card">
                <span className="monitor-conf-label">Confidence</span>
                <div className="monitor-conf-track">
                  <div className="monitor-conf-fill" style={{
                    width:`${predResult.confidence}%`,
                    background: predResult.confidence>=70?'#22c55e':predResult.confidence>=40?'#f59e0b':'#ef4444'
                  }} />
                </div>
                <span className="monitor-conf-value">{predResult.confidence}%</span>
              </div>

              {/* Top-3 */}
              <div className="monitor-top3" style={{marginTop:'0.75rem'}}>
                <span className="rainbow-kicker" style={{marginBottom:'0.4rem',display:'block'}}>TOP MATCHES</span>
                {predResult.topMatches.slice(0,3).map((m) => (
                  <div key={m.label} className="monitor-match-row">
                    <span className="monitor-match-label">{String(m.label).toUpperCase()}</span>
                    <div className="monitor-match-track">
                      <div className="monitor-match-fill" style={{width:`${Math.round(m.confidence*100)}%`}} />
                    </div>
                    <span className="monitor-match-pct">{Math.round(m.confidence*100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="error-message" style={{marginTop:'0.75rem'}}>{error}</p>}
        </div>
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section style={{marginTop:'1.5rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.6rem'}}>
            <span className="rainbow-kicker">CAPTURE GALLERY ({gallery.length})</span>
            <button type="button" className="clear-history-btn" onClick={() => setGallery([])}>Clear</button>
          </div>
          <div className="capture-gallery">
            {gallery.map((item, i) => (
              <div key={i} className="capture-gallery-item" onClick={() => { setSnapshot(item.dataURL); setPredResult({label:item.label,confidence:item.confidence,topMatches:[]}); }}>
                <img src={item.dataURL} alt={`Capture ${item.label}`} className="capture-gallery-img" />
                <span className="capture-gallery-label">{item.label}</span>
                <span className="capture-gallery-conf" style={{color:item.confidence>=70?'#22c55e':item.confidence>=40?'#f59e0b':'#ef4444'}}>
                  {item.confidence}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
