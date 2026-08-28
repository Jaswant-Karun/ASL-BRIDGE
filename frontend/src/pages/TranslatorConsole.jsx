import React, { useState, useCallback } from 'react';
import { translateText } from '../services/api';
import GestureStrip from '../components/GestureStrip';

const SKIP = new Set(['I','AM','IS','ARE','WAS','WERE','A','AN','THE','TO','DO','DOES','DID','WILL',
  'WOULD','GOING','HAVE','HAS','HAD','BE','BEEN','IT','IN','ON','AT','OF','FOR','AND','BUT','OR',
  'SO','BECAUSE','THAT','WITH','FROM','THIS','THESE','THOSE']);
const TIME_WORDS = new Set(['YESTERDAY','TODAY','TOMORROW','MORNING','NIGHT','EVENING','SOON','LATER','ALWAYS','NEVER','NOW']);
const NEGATE = new Set(["DON'T","DOESN'T","CAN'T","NOT","NEVER","WITHOUT","NO"]);
const QUESTION = new Set(['WHAT','WHERE','WHEN','WHY','HOW','WHO','WHICH']);

function toGloss(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const tokens = words.map((w) => {
    const u = w.toUpperCase().replace(/[^A-Z0-9']/g, '');
    const type = TIME_WORDS.has(u) ? 'time' : NEGATE.has(u) ? 'neg' : QUESTION.has(u) ? 'nmm' : SKIP.has(u) ? 'skip' : 'word';
    return { raw: w, u, type };
  });
  const time   = tokens.filter((t) => t.type === 'time');
  const rest   = tokens.filter((t) => t.type !== 'time' && t.type !== 'skip');
  return [...time, ...rest];
}

const SAMPLES = [
  'Tomorrow I am going to college because I have an important project review.',
  'Hello everyone, my name is Jashwan Karan.',
  'Good morning, what do you want to learn today?',
  'I don\'t understand the question. Can you explain again?',
  'Please help me find the computer science classroom.',
];

export default function TranslatorConsole() {
  const [input,    setInput]    = useState('');
  const [gloss,    setGloss]    = useState(null);
  const [apiGloss, setApiGloss] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [copied,   setCopied]   = useState(false);
  const [tab,      setTab]      = useState('gloss'); // 'gloss' | 'fingerspell' | 'compare'

  const run = useCallback(async (text) => {
    if (!text.trim()) return;
    setLoading(true); setError('');
    setGloss(toGloss(text));
    try {
      const res = await translateText(text.trim());
      setApiGloss(res.gloss || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  function copyGloss() {
    const g = gloss?.filter((t)=>t.type!=='skip').map((t)=>t.u).join(' ') || '';
    navigator.clipboard?.writeText(g).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const glossTokens = gloss?.filter((t) => t.type !== 'skip') || [];
  const fingerspell = input.trim().toUpperCase().replace(/[^A-Z0-9\s]/g,'').split('').filter(Boolean);

  return (
    <div className="translator-console-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">🔄 TRANSLATOR CONSOLE</span>
          <h2>English → ASL Gloss &amp; Fingerspelling</h2>
          <p>Type or paste any English sentence. See the ASL gloss reorder, fingerspelling breakdown, and gesture image strip side-by-side.</p>
        </div>
      </header>

      {/* Input pane */}
      <div className="tc-input-pane">
        <div className="tc-textarea-wrap">
          <textarea
            className="rainbow-textarea"
            rows={4}
            placeholder="Type any English sentence…"
            value={input}
            onChange={(e) => { setInput(e.target.value); if (e.target.value.trim()) setGloss(toGloss(e.target.value)); else setGloss(null); }}
          />
          <div className="home-meta-bar">
            <span className="char-count-pill">{input.length} chars · {input.trim().split(/\s+/).filter(Boolean).length} words</span>
            <button type="button" className={`copy-sentence-btn ${copied?'copy-sentence-btn--copied':''}`} onClick={copyGloss} disabled={!gloss}>
              {copied ? '✓ Copied gloss' : '⎘ Copy ASL gloss'}
            </button>
          </div>
        </div>
        <div className="tc-sample-col">
          <span className="rainbow-kicker" style={{marginBottom:'0.4rem',display:'block'}}>SAMPLES</span>
          {SAMPLES.map((s) => (
            <button key={s} type="button" className="sample-pill-btn tc-sample-pill"
              onClick={() => { setInput(s); setGloss(toGloss(s)); run(s); }}>
              {s.slice(0, 42)}…
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="rainbow-motion-btn primary-btn" onClick={() => run(input)} disabled={loading || !input.trim()}>
        {loading ? '⏳ Translating…' : '✨ Translate to ASL Gloss'}
      </button>
      {error && <p className="error-message" role="alert">{error}</p>}

      {gloss && (
        <>
          {/* Tabs */}
          <div className="tc-tabs">
            {[['gloss','ASL Gloss'],['fingerspell','Fingerspelling'],['compare','API Compare']].map(([id,label]) => (
              <button key={id} type="button" className={`tab-btn ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>

          {/* Gloss tab */}
          {tab === 'gloss' && (
            <div className="tc-gloss-pane">
              <div className="tc-gloss-strip">
                {glossTokens.map((t, i) => (
                  <div key={i} className={`tc-gloss-token tc-gloss-token--${t.type}`}>
                    <span className="tc-gloss-word">{t.u || t.raw.toUpperCase()}</span>
                    <span className="tc-gloss-type">{t.type==='time'?'⏰ TIME':t.type==='neg'?'✗ NEG':t.type==='nmm'?'❓ NMM':'SIGN'}</span>
                  </div>
                ))}
              </div>
              <p className="tc-rule-note">
                Time anchors move to front · function words stripped · negations and NMMs color-coded
              </p>
            </div>
          )}

          {/* Fingerspell tab */}
          {tab === 'fingerspell' && (
            <div className="tc-fingerspell-pane">
              <p style={{color:'var(--muted)',fontSize:'0.82rem',marginBottom:'0.75rem'}}>
                Every letter of your sentence as a dataset hand gesture image — as it would be fingerspelled.
              </p>
              <GestureStrip text={input} isSpeaking={false} />
            </div>
          )}

          {/* Compare tab */}
          {tab === 'compare' && (
            <div className="tc-compare-pane">
              <div className="tc-compare-col">
                <span className="rainbow-kicker">LOCAL GLOSS (rule-based)</span>
                <div className="grammar-result-chips" style={{marginTop:'0.5rem'}}>
                  {glossTokens.map((t,i) => (
                    <span key={i} className={`gloss-chip gloss-chip--${t.type==='word'?'':t.type}`}>{t.u||t.raw.toUpperCase()}</span>
                  ))}
                </div>
              </div>
              <div className="tc-compare-arrow">⇌</div>
              <div className="tc-compare-col">
                <span className="rainbow-kicker">API GLOSS (server)</span>
                {loading ? <p style={{color:'var(--muted)'}}>Loading…</p> : (
                  <div className="grammar-result-chips" style={{marginTop:'0.5rem'}}>
                    {apiGloss.map((g,i) => <span key={i} className="gloss-chip">{g}</span>)}
                    {apiGloss.length===0 && <span style={{color:'var(--muted)',fontSize:'0.8rem'}}>Click Translate first</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
