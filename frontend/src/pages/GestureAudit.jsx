import React, { useState, useMemo } from 'react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000';
const ALL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

const HANDSHAPE = {
  A:'A-Fist',B:'Flat-B',C:'C-Shape',D:'1-D',E:'Claw-E',F:'OK/F',G:'G-Pointer',H:'H-Double',
  I:'I-Pinky',J:'J-Trace',K:'K-Peace',L:'L-Angle',M:'M-Tuck',N:'N-Tuck',O:'O-Ring',
  P:'P-Down',Q:'Q-Down',R:'R-Cross',S:'S-Fist',T:'T-Tuck',U:'U-Pair',V:'V-Peace',
  W:'W-Three',X:'X-Hook',Y:'Y-Horn',Z:'Z-Trace',
  '0':'Zero','1':'One','2':'Two','3':'Three','4':'Four','5':'Five',
  '6':'Six','7':'Seven','8':'Eight','9':'Nine',
};

function loadAudit() { try { return JSON.parse(localStorage.getItem('gesture-audit')||'{}'); } catch { return {}; } }
function saveAudit(a) { try { localStorage.setItem('gesture-audit', JSON.stringify(a)); } catch {} }

const STATUS_CYCLE = ['untested','practiced','confident','needs-work'];
const STATUS_LABELS = { untested:'Untested', practiced:'Practiced', confident:'✓ Confident', 'needs-work':'⚠ Needs work' };
const STATUS_COLORS = { untested:'#475569', practiced:'#38bdf8', confident:'#22c55e', 'needs-work':'#ef4444' };

export default function GestureAudit() {
  const [audit,     setAudit]     = useState(loadAudit);
  const [filter,    setFilter]    = useState('all');
  const [selected,  setSelected]  = useState(null);
  const [sampleIdx, setSampleIdx] = useState(0);
  const [note,      setNote]      = useState('');

  const chars = filter === 'all' ? ALL_CHARS
    : filter === 'confident'   ? ALL_CHARS.filter((c) => audit[c]==='confident')
    : filter === 'needs-work'  ? ALL_CHARS.filter((c) => audit[c]==='needs-work')
    : filter === 'untested'    ? ALL_CHARS.filter((c) => !audit[c] || audit[c]==='untested')
    : ALL_CHARS;

  function cycleStatus(ch) {
    const cur = audit[ch] || 'untested';
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur) + 1) % STATUS_CYCLE.length];
    const updated = { ...audit, [ch]: next };
    setAudit(updated); saveAudit(updated);
  }

  function setStatus(ch, st) {
    const updated = { ...audit, [ch]: st };
    setAudit(updated); saveAudit(updated);
  }

  const stats = useMemo(() => ({
    confident:  ALL_CHARS.filter((c) => audit[c]==='confident').length,
    practiced:  ALL_CHARS.filter((c) => audit[c]==='practiced').length,
    needsWork:  ALL_CHARS.filter((c) => audit[c]==='needs-work').length,
    untested:   ALL_CHARS.filter((c) => !audit[c]||audit[c]==='untested').length,
  }), [audit]);

  const pct = Math.round((stats.confident / ALL_CHARS.length) * 100);

  return (
    <div className="audit-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">✅ GESTURE AUDIT</span>
          <h2>36-Character Mastery Tracker</h2>
          <p>Review every ASL character's dataset image, mark your confidence level, and track exactly which gestures need more practice.</p>
        </div>
        <div className="audit-summary">
          <div className="audit-stat" style={{color:'#22c55e'}}><strong>{stats.confident}</strong><span>Confident</span></div>
          <div className="audit-stat" style={{color:'#38bdf8'}}><strong>{stats.practiced}</strong><span>Practiced</span></div>
          <div className="audit-stat" style={{color:'#ef4444'}}><strong>{stats.needsWork}</strong><span>Needs work</span></div>
          <div className="audit-stat" style={{color:'var(--muted)'}}><strong>{stats.untested}</strong><span>Untested</span></div>
        </div>
      </header>

      {/* Overall progress */}
      <div className="ftl-progress-track" style={{marginBottom:'1rem'}}>
        <div className="ftl-progress-fill" style={{width:`${pct}%`,background:'#22c55e'}} />
      </div>
      <p style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:'1rem'}}>{pct}% confident across all 36 characters</p>

      {/* Filter bar */}
      <div className="ftl-toolbar" style={{marginBottom:'1rem'}}>
        {[['all','All 36'],['untested','Untested'],['practiced','Practiced'],['confident','Confident'],['needs-work','Needs work']].map(([f,l]) => (
          <button key={f} type="button" className={`pill-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>{l}</button>
        ))}
        <button type="button" className="clear-history-btn" style={{marginLeft:'auto'}}
          onClick={() => { setAudit({}); saveAudit({}); }}>Reset all</button>
      </div>

      <div className="audit-layout">
        {/* Grid */}
        <div className="audit-grid">
          {chars.map((ch) => {
            const st = audit[ch] || 'untested';
            return (
              <div key={ch} className={`audit-card ${selected===ch?'audit-card--active':''}`}
                onClick={() => { setSelected(ch); setSampleIdx(0); setNote(''); }}>
                <img src={`${API_BASE}/dataset-image/${ch.toLowerCase()}?sample=0`}
                  alt={`ASL ${ch}`} className="audit-card-img"
                  onError={(e)=>{e.currentTarget.style.opacity='0.2';}} />
                <div className="audit-card-meta">
                  <span className="audit-card-char">{ch}</span>
                  <span className="audit-card-status" style={{color:STATUS_COLORS[st]}}>{STATUS_LABELS[st]}</span>
                </div>
                <button type="button" className="audit-cycle-btn"
                  style={{borderColor:STATUS_COLORS[st],color:STATUS_COLORS[st]}}
                  onClick={(e)=>{e.stopPropagation();cycleStatus(ch);}}>
                  ↻
                </button>
              </div>
            );
          })}
          {chars.length === 0 && <p style={{color:'var(--muted)',gridColumn:'1/-1'}}>No characters in this filter.</p>}
        </div>

        {/* Detail */}
        {selected && (
          <div className="audit-detail">
            <span className="rainbow-kicker">DETAIL — {selected}</span>
            <div className="ftl-detail-img-wrap" style={{marginTop:'0.75rem'}}>
              <img src={`${API_BASE}/dataset-image/${selected.toLowerCase()}?sample=${sampleIdx}`}
                alt={`ASL ${selected}`} className="ftl-detail-img"
                onError={(e)=>{e.currentTarget.src=`${API_BASE}/dataset-image/${selected.toLowerCase()}`;}} />
              <div className="ftl-sample-dots">
                {[0,1,2,3].map((i)=>(
                  <button key={i} type="button" className={`ftl-dot-btn ${sampleIdx===i?'active':''}`} onClick={()=>setSampleIdx(i)} />
                ))}
              </div>
            </div>
            <h3 style={{marginTop:'0.75rem'}}>{selected}</h3>
            <p style={{fontSize:'0.8rem',color:'var(--muted)'}}>{HANDSHAPE[selected]}</p>

            {/* Status buttons */}
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginTop:'0.75rem'}}>
              {STATUS_CYCLE.map((st)=>(
                <button key={st} type="button"
                  className={`pill-btn ${(audit[selected]||'untested')===st?'active':''}`}
                  style={{borderColor:STATUS_COLORS[st],color:(audit[selected]||'untested')===st?'#fff':STATUS_COLORS[st]}}
                  onClick={()=>setStatus(selected,st)}>
                  {STATUS_LABELS[st]}
                </button>
              ))}
            </div>

            <textarea className="rainbow-textarea" rows={3} style={{marginTop:'0.75rem',fontSize:'0.8rem'}}
              placeholder="Add a practice note for this gesture…"
              value={note} onChange={(e)=>setNote(e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
}
