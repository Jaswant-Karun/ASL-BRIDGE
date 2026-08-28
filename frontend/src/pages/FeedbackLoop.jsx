import React, { useState, useMemo } from 'react';

const CATEGORIES = ['Translation quality','Avatar accuracy','Recognition speed','Caption clarity','Overall experience'];
const TAGS = ['Great gesture images','Needs more signs','Fast prediction','Slow response','Clear captions','Hard to use','Very helpful','Avatar is smooth','Recognition errors','Love the design'];

function loadHistory() { try { return JSON.parse(localStorage.getItem('feedback-history')||'[]'); } catch { return []; } }
function saveHistory(h) { try { localStorage.setItem('feedback-history', JSON.stringify(h)); } catch {} }

export default function FeedbackLoop() {
  const [category,  setCategory]  = useState(CATEGORIES[0]);
  const [rating,    setRating]    = useState(0);
  const [hover,     setHover]     = useState(0);
  const [note,      setNote]      = useState('');
  const [tags,      setTags]      = useState([]);
  const [history,   setHistory]   = useState(loadHistory);
  const [submitted, setSubmitted] = useState(false);
  const [filter,    setFilter]    = useState('all');

  function toggleTag(t) {
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x!==t) : [...prev, t]);
  }

  function submit() {
    if (!rating) return;
    const entry = {
      id: Date.now(),
      ts: new Date().toLocaleString(),
      category,
      rating,
      note: note.trim(),
      tags,
    };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated); saveHistory(updated);
    setRating(0); setNote(''); setTags([]); setCategory(CATEGORIES[0]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return history;
    return history.filter((h) => h.category === filter);
  }, [history, filter]);

  const avgRating = history.length
    ? (history.reduce((s,h) => s+h.rating, 0) / history.length).toFixed(1)
    : '—';

  const starColor = (s) => s <= (hover||rating) ? '#fbbf24' : 'var(--line)';

  return (
    <div className="feedback-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">💬 FEEDBACK LOOP</span>
          <h2>Practice Feedback &amp; Improvement Journal</h2>
          <p>Log what worked, what didn't, and track your improvement over time. All feedback is stored locally.</p>
        </div>
        <div className="audit-summary">
          <div className="audit-stat" style={{color:'#fbbf24'}}><strong>{avgRating}⭐</strong><span>Avg rating</span></div>
          <div className="audit-stat"><strong>{history.length}</strong><span>Total entries</span></div>
        </div>
      </header>

      <div className="feedback-layout">
        {/* Form */}
        <div className="settings-card feedback-form-card">
          <h3>📝 New Feedback Entry</h3>

          <div className="setting-row">
            <div className="setting-info"><strong>Category</strong></div>
            <div className="speed-pills-row">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" className={`pill-btn ${category===c?'active':''}`} onClick={() => setCategory(c)}
                  style={{fontSize:'0.7rem'}}>{c}</button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info"><strong>Rating</strong><p>How was this feature?</p></div>
            <div className="feedback-stars">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" className="feedback-star"
                  style={{color:starColor(s),fontSize:'1.6rem'}}
                  onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}>★</button>
              ))}
              {rating > 0 && <span style={{marginLeft:'0.4rem',fontSize:'0.8rem',color:'#fbbf24'}}>{rating}/5</span>}
            </div>
          </div>

          <div className="setting-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'0.5rem'}}>
            <strong style={{fontSize:'0.85rem',color:'var(--ink)'}}>Quick tags</strong>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.35rem'}}>
              {TAGS.map((t) => (
                <button key={t} type="button"
                  className={`pill-btn ${tags.includes(t)?'active':''}`}
                  style={{fontSize:'0.7rem'}}
                  onClick={() => toggleTag(t)}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{marginTop:'0.5rem'}}>
            <label style={{fontSize:'0.82rem',color:'var(--muted)',display:'block',marginBottom:'0.3rem'}}>Detailed note (optional)</label>
            <textarea className="rainbow-textarea" rows={4}
              placeholder="Describe what you noticed, what felt unclear, or what you want to practice more…"
              value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <button type="button" className="rainbow-motion-btn primary-btn" style={{marginTop:'0.75rem'}}
            onClick={submit} disabled={!rating}>
            {submitted ? '✓ Saved!' : 'Save feedback entry'}
          </button>
        </div>

        {/* History */}
        <div className="feedback-history-panel">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem',flexWrap:'wrap',gap:'0.4rem'}}>
            <span className="rainbow-kicker">HISTORY ({filtered.length})</span>
            <div style={{display:'flex',gap:'0.35rem',flexWrap:'wrap'}}>
              <button type="button" className={`pill-btn ${filter==='all'?'active':''}`} onClick={() => setFilter('all')}
                style={{fontSize:'0.7rem'}}>All</button>
              {CATEGORIES.map((c) => (
                <button key={c} type="button" className={`pill-btn ${filter===c?'active':''}`}
                  onClick={() => setFilter(c)} style={{fontSize:'0.68rem'}}>{c}</button>
              ))}
            </div>
            {history.length > 0 && (
              <button type="button" className="clear-history-btn"
                onClick={() => { if(window.confirm('Clear all feedback?')) { setHistory([]); saveHistory([]); } }}>
                Clear all
              </button>
            )}
          </div>

          {filtered.length === 0 && <p style={{color:'var(--muted)',fontSize:'0.82rem'}}>No entries yet. Submit your first feedback above.</p>}

          <div className="feedback-entries">
            {filtered.map((entry) => (
              <div key={entry.id} className="feedback-entry-card">
                <div className="feedback-entry-header">
                  <span className="feedback-entry-cat">{entry.category}</span>
                  <span className="feedback-entry-stars">{'★'.repeat(entry.rating)}{'☆'.repeat(5-entry.rating)}</span>
                  <span className="feedback-entry-ts">{entry.ts}</span>
                </div>
                {entry.tags.length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem',marginTop:'0.35rem'}}>
                    {entry.tags.map((t) => <span key={t} className="history-chip" style={{fontSize:'0.68rem'}}>{t}</span>)}
                  </div>
                )}
                {entry.note && <p className="feedback-entry-note">"{entry.note}"</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
