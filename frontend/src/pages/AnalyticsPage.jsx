import React, { useMemo, useState } from 'react';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';

/* ── Read real session data from localStorage ─────────────────────────── */
function loadRealData() {
  // Translation log — stored by Home/SpeechStudio via a simple append helper
  let translations = [];
  try {
    translations = JSON.parse(localStorage.getItem('asl-translation-log') || '[]');
  } catch { /* ignored */ }

  // ASL Coach stats
  let coachStats = {};
  try {
    coachStats = JSON.parse(localStorage.getItem('coach-stats') || '{}');
  } catch { /* ignored */ }

  // Finger Training Lab progress
  let ftlProgress = {};
  try {
    ftlProgress = JSON.parse(localStorage.getItem('ftl-progress') || '{}');
  } catch { /* ignored */ }

  // Feedback entries
  let feedback = [];
  try {
    feedback = JSON.parse(localStorage.getItem('feedback-history') || '[]');
  } catch { /* ignored */ }

  // Engagement tracker
  let engagement = { totalXp: 0, days: {} };
  try {
    engagement = JSON.parse(localStorage.getItem('asl-engagement') || '{}') || engagement;
  } catch { /* ignored */ }

  // Gesture audit
  let audit = {};
  try {
    audit = JSON.parse(localStorage.getItem('gesture-audit') || '{}');
  } catch { /* ignored */ }

  return { translations, coachStats, ftlProgress, feedback, engagement, audit };
}

/* ── Store a translation event (called from Home + SpeechStudio) ─────── */
export function logTranslation(text, gloss = [], latencyMs = null) {
  try {
    const prev = JSON.parse(localStorage.getItem('asl-translation-log') || '[]');
    const entry = {
      ts: Date.now(),
      time: new Date().toLocaleTimeString(),
      query: text,
      tokens: gloss.length,
      latency: latencyMs ? `${latencyMs}ms` : '—',
      status: 'Optimal',
    };
    const next = [entry, ...prev].slice(0, 40); // keep last 40
    localStorage.setItem('asl-translation-log', JSON.stringify(next));
  } catch { /* ignored */ }
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState('overview'); // 'overview' | 'coach' | 'training' | 'feedback'
  const data = useMemo(loadRealData, []);

  /* ── Derived numbers ─────────────────────────────────────────────────── */
  const totalTranslations = data.translations.length;

  const avgLatencyMs = (() => {
    const nums = data.translations.map(t => parseInt(t.latency)).filter(n => !isNaN(n));
    return nums.length ? Math.round(nums.reduce((a,b) => a+b, 0) / nums.length) : null;
  })();

  const coachEntries  = Object.values(data.coachStats);
  const coachTotal    = coachEntries.reduce((s,v) => s + v.correct + v.wrong, 0);
  const coachCorrect  = coachEntries.reduce((s,v) => s + v.correct, 0);
  const coachPct      = coachTotal ? Math.round((coachCorrect / coachTotal) * 100) : null;

  const masteredCount = Object.values(data.ftlProgress).filter(v => v >= 3).length;
  const auditConfident = Object.values(data.audit).filter(v => v === 'confident').length;

  const avgFeedback = data.feedback.length
    ? (data.feedback.reduce((s,f) => s+f.rating, 0) / data.feedback.length).toFixed(1)
    : null;

  /* ── Live stat cards ─────────────────────────────────────────────────── */
  const statCards = [
    {
      label: 'Translations Made',
      value: totalTranslations || '0',
      sub: totalTranslations ? 'in your session log' : 'Translate a sentence to start',
      color: '#10b981',
    },
    {
      label: 'Avg Prediction Latency',
      value: avgLatencyMs ? `${avgLatencyMs}ms` : '—',
      sub: avgLatencyMs ? 'across your translations' : 'No data yet',
      color: '#38bdf8',
    },
    {
      label: 'Coach Accuracy',
      value: coachPct !== null ? `${coachPct}%` : '—',
      sub: coachTotal ? `${coachTotal} quiz answers` : 'Play ASL Coach to track',
      color: '#f59e0b',
    },
    {
      label: 'Mastered Gestures',
      value: masteredCount || auditConfident || '—',
      sub: masteredCount
        ? `${masteredCount} / 36 in Training Lab`
        : auditConfident
          ? `${auditConfident} / 36 in Gesture Audit`
          : 'Use Training Lab or Audit',
      color: '#ec4899',
    },
  ];

  return (
    <div className="analytics-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">📊 SESSION ANALYTICS</span>
          <h2>Your Real-Time Performance Dashboard</h2>
          <p>Live metrics pulled from your browser session — translations, quiz scores, mastery progress, and feedback ratings.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Data stored locally in your browser</span>
        </div>
      </header>

      {/* Stat cards */}
      <section className="analytics-stat-grid">
        {statCards.map((st) => (
          <div key={st.label} className="rainbow-metric-card" style={{ '--metric-color': st.color }}>
            <span className="metric-label">{st.label}</span>
            <strong className="metric-value" style={{ color: st.color }}>{st.value}</strong>
            <span className="metric-change">{st.sub}</span>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <div className="tc-tabs" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        {[['overview','Translation Log'],['coach','Quiz Stats'],['training','Mastery'],['feedback','Feedback']].map(([id,label]) => (
          <button key={id} type="button" className={`tab-btn ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* ── Overview: translation log ── */}
      {tab === 'overview' && (
        <section className="logs-card-section">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <h3 style={{ margin:0 }}>Translation History</h3>
            {totalTranslations > 0 && (
              <button type="button" className="clear-history-btn"
                onClick={() => { localStorage.removeItem('asl-translation-log'); window.location.reload(); }}>
                Clear log
              </button>
            )}
          </div>
          {totalTranslations === 0 ? (
            <div className="pre-submit-card" style={{ padding:'2rem' }}>
              <span className="pre-submit-icon">📋</span>
              <h3>No translations yet</h3>
              <p>Go to Text to ASL Studio or Speech Studio and translate a sentence. It will appear here automatically.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Sentence</th>
                    <th>Signs</th>
                    <th>Latency</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.translations.map((log, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace:'nowrap' }}>{log.time}</td>
                      <td><span style={{ color:'#e2e8f0', fontSize:'0.82rem' }}>"{log.query?.slice(0,60)}{log.query?.length>60?'…':''}"</span></td>
                      <td><span className="token-count-pill">{log.tokens || '—'} Signs</span></td>
                      <td><span className="latency-tag">{log.latency}</span></td>
                      <td><span className="status-badge optimal">{log.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ── Coach stats ── */}
      {tab === 'coach' && (
        <section className="logs-card-section">
          <h3>ASL Coach — Per-Character Quiz Results</h3>
          {Object.keys(data.coachStats).length === 0 ? (
            <div className="pre-submit-card" style={{ padding:'2rem' }}>
              <span className="pre-submit-icon">🏆</span>
              <h3>No quiz data yet</h3>
              <p>Play the ASL Coach quiz. Your per-letter accuracy will appear here.</p>
            </div>
          ) : (
            <div className="coach-stats-grid" style={{ marginTop:'0.75rem' }}>
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').filter(c => data.coachStats[c]).map(c => {
                const s = data.coachStats[c];
                const tot = s.correct + s.wrong;
                const pct = Math.round((s.correct/tot)*100);
                return (
                  <div key={c} className="coach-stat-chip"
                    style={{ borderColor: pct>=70?'#22c55e':pct>=40?'#f59e0b':'#ef4444', padding:'0.5rem 0.65rem' }}>
                    <strong style={{ fontSize:'1.1rem' }}>{c}</strong>
                    <span style={{ color:pct>=70?'#22c55e':pct>=40?'#f59e0b':'#ef4444', fontWeight:700 }}>{pct}%</span>
                    <span style={{ fontSize:'0.6rem', color:'var(--muted)' }}>{tot} tries</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Training mastery ── */}
      {tab === 'training' && (
        <section className="logs-card-section">
          <h3>Finger Training Lab — Mastery Progress</h3>
          {Object.keys(data.ftlProgress).length === 0 ? (
            <div className="pre-submit-card" style={{ padding:'2rem' }}>
              <span className="pre-submit-icon">✋</span>
              <h3>No training data yet</h3>
              <p>Open Finger Training Lab and mark gestures as you learn them.</p>
            </div>
          ) : (
            <>
              <div className="ftl-progress-track" style={{ margin:'0.75rem 0' }}>
                <div className="ftl-progress-fill" style={{ width:`${Math.round((masteredCount/36)*100)}%`, background:'#22c55e' }} />
              </div>
              <p style={{ fontSize:'0.78rem', color:'var(--muted)', marginBottom:'0.75rem' }}>
                {masteredCount} / 36 mastered ({Math.round((masteredCount/36)*100)}%)
              </p>
              <div className="ftl-grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(60px,1fr))', gap:'0.4rem' }}>
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').map(c => {
                  const score = data.ftlProgress[c] || 0;
                  const color = score>=3?'#22c55e':score>=1?'#38bdf8':'var(--muted)';
                  return (
                    <div key={c} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                      padding:'5px', background:'var(--panel)', border:`2px solid ${color}`, borderRadius:'8px' }}>
                      <span style={{ fontWeight:800, fontSize:'0.9rem', color }}>{c}</span>
                      <span style={{ fontSize:'0.6rem', color }}>{score>=3?'✓ Master':score>=1?'Learning':'New'}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Feedback history ── */}
      {tab === 'feedback' && (
        <section className="logs-card-section">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <h3 style={{ margin:0 }}>Feedback Entries ({data.feedback.length})</h3>
            {avgFeedback && <span style={{ color:'#fbbf24', fontWeight:700 }}>⭐ Avg: {avgFeedback} / 5</span>}
          </div>
          {data.feedback.length === 0 ? (
            <div className="pre-submit-card" style={{ padding:'2rem' }}>
              <span className="pre-submit-icon">💬</span>
              <h3>No feedback yet</h3>
              <p>Go to Feedback Loop and log your first session review.</p>
            </div>
          ) : (
            <div className="feedback-entries">
              {data.feedback.slice(0,20).map((entry, i) => (
                <div key={i} className="feedback-entry-card">
                  <div className="feedback-entry-header">
                    <span className="feedback-entry-cat">{entry.category}</span>
                    <span className="feedback-entry-stars" style={{ color:'#fbbf24' }}>{'★'.repeat(entry.rating)}{'☆'.repeat(5-entry.rating)}</span>
                    <span className="feedback-entry-ts">{entry.ts}</span>
                  </div>
                  {entry.tags?.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', marginTop:'0.3rem' }}>
                      {entry.tags.map(t => <span key={t} className="history-chip" style={{ fontSize:'0.68rem' }}>{t}</span>)}
                    </div>
                  )}
                  {entry.note && <p className="feedback-entry-note">"{entry.note}"</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Architecture diagram always visible */}
      <section style={{ marginTop: '2rem' }}>
        <RainbowPipelineDiagram activeStep="all" />
      </section>
    </div>
  );
}
