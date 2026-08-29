import React, { useRef, useState } from 'react';

export default function PresentationUpload({ onResult, onError }) {
  const inputRef   = useRef(null);
  const [loading,  setLoading]  = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100

  async function processFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      onError?.('Only .pptx files are supported.');
      return;
    }
    setFileName(file.name);
    setLoading(true);
    setProgress(10);

    // Fake progress ticks while upload is running
    const tick = setInterval(() => {
      setProgress(prev => (prev < 85 ? prev + 8 : prev));
    }, 400);

    const data = new FormData();
    data.append('presentation', file);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/presentation/process`,
        { method: 'POST', body: data }
      );
      const result = await response.json();
      clearInterval(tick);
      setProgress(100);
      if (!response.ok) throw new Error(result.error || 'Presentation processing failed.');
      setTimeout(() => { setLoading(false); setProgress(0); }, 600);
      onResult?.(result);
    } catch (error) {
      clearInterval(tick);
      setLoading(false);
      setProgress(0);
      onError?.(error.message);
    }
  }

  function onChange(e) { processFile(e.target.files?.[0]); }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div
      className={`ppt-upload-zone ${dragging ? 'ppt-upload-zone--drag' : ''} ${loading ? 'ppt-upload-zone--loading' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !loading && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload PowerPoint presentation"
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        id="presentation-file"
        type="file"
        accept=".pptx"
        onChange={onChange}
        style={{ display: 'none' }}
      />

      {loading ? (
        <div className="ppt-upload-progress-state">
          <div className="ppt-spinner" aria-hidden="true">
            <div className="ppt-spinner-ring" />
          </div>
          <p className="ppt-upload-status">Processing <strong>{fileName}</strong></p>
          <p className="ppt-upload-substatus">Extracting slide text and generating ASL gloss…</p>
          <div className="ppt-progress-bar">
            <div className="ppt-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="ppt-progress-pct">{progress}%</span>
        </div>
      ) : (
        <div className="ppt-upload-idle-state">
          <div className="ppt-upload-icon" aria-hidden="true">📊</div>
          <h3 className="ppt-upload-heading">
            {dragging ? 'Drop your .pptx here' : 'Upload a PowerPoint Presentation'}
          </h3>
          <p className="ppt-upload-sub">
            Drag &amp; drop a <strong>.pptx</strong> file here, or click to browse
          </p>
          {fileName && <p className="ppt-upload-filename">Last: {fileName}</p>}
          <div className="ppt-upload-cta">
            <span className="ppt-upload-btn">
              Choose .pptx file
            </span>
          </div>
          <p className="ppt-upload-hint">
            Slide text is extracted → converted to ASL gloss → 3D avatar signs each line
          </p>
        </div>
      )}
    </div>
  );
}
