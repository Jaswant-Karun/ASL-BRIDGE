import React, { useState } from 'react';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';

/* ── Very lightweight English → ASL gloss converter ──────────────────── */
const TIME_WORDS = new Set(['YESTERDAY','TODAY','TOMORROW','MORNING','NIGHT','EVENING','SOON','LATER','ALWAYS','NEVER','SOMETIMES','NOW']);
const SKIP_WORDS = new Set(['I','AM','IS','ARE','WAS','WERE','A','AN','THE','TO','DO','DOES','DID','WILL','WOULD','GOING','HAVE','HAS','HAD','BE','BEEN','IT','IN','ON','AT','OF','FOR','AND','BUT','OR','SO','BECAUSE','THAT','WITH','FROM']);
const NEGATE_WORDS = new Set(["DON'T","DOESN'T","CAN'T","NOT","NEVER","WITHOUT","NO"]);
const QUESTION_WORDS = new Set(['WHAT','WHERE','WHEN','WHY','HOW','WHO','WHICH']);

function classifyToken(word) {
  const w = word.toUpperCase().replace(/[^A-Z']/g, '');
  if (TIME_WORDS.has(w)) return 'time';
  if (NEGATE_WORDS.has(w)) return 'neg';
  if (QUESTION_WORDS.has(w)) return 'nmm';
  if (SKIP_WORDS.has(w)) return 'skip';
  return 'default';
}

function toASLGloss(sentence) {
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  const tokens = words.map(w => ({ raw: w, upper: w.toUpperCase().replace(/[^A-Z0-9']/g,''), type: classifyToken(w) }));
  // Bring time words to the front
  const timeTokens = tokens.filter(t => t.type === 'time');
  const rest = tokens.filter(t => t.type !== 'time' && t.type !== 'skip');
  return [...timeTokens, ...rest];
}

export default function LinguisticsPage() {
  const [sampleSentence, setSampleSentence] = useState('Tomorrow I am going to college because I have an important project review.');
  const [analyzerInput, setAnalyzerInput] = useState('');
  const [analyzedGloss, setAnalyzedGloss] = useState(null);

  function runAnalysis() {
    if (!analyzerInput.trim()) return;
    setAnalyzedGloss(toASLGloss(analyzerInput));
  }

  const grammarRules = [
    {
      rule: 'Time-Topic-Comment Structure',
      english: 'Tomorrow I am going to college.',
      asl: 'TOMORROW ME COLLEGE GO',
      explanation: 'Time adverbs (TOMORROW) establish temporal anchor, followed by Subject Topic (ME COLLEGE) and action predicate (GO).',
      tag: 'Temporal Fronting'
    },
    {
      rule: 'Rhetorical Question Marker (WHY?)',
      english: '...because I have an important project review.',
      asl: '...WHY? ME HAVE IMPORTANT PROJECT REVIEW',
      explanation: 'In ASL, "because" is expressed by raising eyebrows on rhetorical "WHY?", followed by the cause statement.',
      tag: 'NMM Eyebrows UP'
    },
    {
      rule: 'Fingerspelling Expansion (Names/Rare Words)',
      english: 'My name is Jashwan Karan.',
      asl: 'MY NAME J-A-S-H-W-A-N K-A-R-A-N',
      explanation: 'Proper nouns and acronyms are synthesized as individual handshape keyframes in rapid signing cadence.',
      tag: 'Manual Alphabet'
    },
    {
      rule: 'Negation & Facial Morphology',
      english: 'I do not understand the question.',
      asl: 'QUESTION ME UNDERSTAND NOT [Head Shake]',
      explanation: 'Negative morphemes are synchronized with side-to-side head shaking and furrowed brow markers.',
      tag: 'Head Shake'
    }
  ];

  return (
    <div className="linguistics-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">🧠 ASL COMPUTATIONAL LINGUISTICS</span>
          <h2>Rainbow Grammar & Non-Manual Marker Engine</h2>
          <p>Explore how English syntax is transformed into spatial-temporal ASL grammar and facial morphemes.</p>
        </div>
      </header>

      {/* Rainbow Architecture Diagram */}
      <RainbowPipelineDiagram activeStep="grammar" />

      {/* Interactive Syntax Tree Visualization */}
      <section className="syntax-tree-card">
        <div className="card-top-bar">
          <span className="rainbow-badge-chip">🌳 SYNTAX TREE DECOMPOSITION</span>
          <h4>Time-Topic-Comment Hierarchy</h4>
        </div>

        <div className="tree-node-visualizer">
          <div className="tree-level level-root">
            <div className="node-chip root-node">
              <span>ROOT SENTENCE</span>
              <strong>ASL Discourse Frame</strong>
            </div>
          </div>

          <div className="tree-connector-lines"></div>

          <div className="tree-level level-branches">
            <div className="node-branch temporal-branch">
              <div className="node-chip temporal-node">
                <span className="branch-tag">⏰ [TIME ANCHOR]</span>
                <strong>TOMORROW</strong>
                <small>Eyebrows neutral / forward posture</small>
              </div>
            </div>

            <div className="node-branch topic-branch">
              <div className="node-chip topic-node">
                <span className="branch-tag">🎯 [TOPIC FRAME]</span>
                <strong>ME COLLEGE</strong>
                <small>Raised eyebrows (Topic Marker)</small>
              </div>
            </div>

            <div className="node-branch comment-branch">
              <div className="node-chip comment-node">
                <span className="branch-tag">💬 [COMMENT / ACTION]</span>
                <strong>GO</strong>
                <small>Forward directional arc</small>
              </div>
            </div>

            <div className="node-branch rhetorical-branch">
              <div className="node-chip rhetorical-node">
                <span className="branch-tag">❓ [RHETORICAL CLAUSE]</span>
                <strong>WHY? ME HAVE PROJECT REVIEW</strong>
                <small>Eyebrows elevated / head tilt back</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grammar Rules Grid */}
      <section className="grammar-rules-section">
        <h3>Core ASL Grammar Rules & Morphological Transformations</h3>
        <div className="grammar-rules-grid">
          {grammarRules.map((rule, idx) => (
            <div key={rule.rule} className="grammar-card">
              <div className="grammar-card-header">
                <span className="rule-badge">0{idx + 1} • {rule.tag}</span>
                <h4>{rule.rule}</h4>
              </div>
              <div className="translation-comparison">
                <div className="trans-box eng">
                  <span className="lang-label">Natural English:</span>
                  <p>"{rule.english}"</p>
                </div>
                <div className="trans-arrow">➔</div>
                <div className="trans-box asl">
                  <span className="lang-label">ASL Gloss Representation:</span>
                  <strong>{rule.asl}</strong>
                </div>
              </div>
              <p className="rule-desc">{rule.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Grammar Analyzer ── */}
      <section className="grammar-analyzer-card">
        <span className="rainbow-kicker">🔬 LIVE GRAMMAR ANALYZER</span>
        <h4>Type any English sentence — see it converted to ASL gloss instantly</h4>
        <div className="grammar-input-row">
          <input
            type="text"
            placeholder="e.g. I don't understand the question tomorrow."
            value={analyzerInput}
            onChange={(e) => {
              setAnalyzerInput(e.target.value);
              if (e.target.value.trim()) setAnalyzedGloss(toASLGloss(e.target.value));
              else setAnalyzedGloss(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
          />
          <button type="button" className="analyze-btn" onClick={runAnalysis}>Analyze</button>
        </div>

        {analyzedGloss && (
          <>
            <div className="grammar-result-chips">
              {analyzedGloss.map((token, i) => (
                <span
                  key={i}
                  className={`gloss-chip gloss-chip--${token.type === 'default' ? '' : token.type}`}
                  title={
                    token.type === 'time' ? 'Time anchor — moves to front in ASL' :
                    token.type === 'neg'  ? 'Negation marker — head shake + NOT' :
                    token.type === 'nmm'  ? 'Non-manual marker — eyebrow raised' :
                    'Content word'
                  }
                >
                  {token.upper || token.raw.toUpperCase()}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <small style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>
                🟡 Time anchor &nbsp;|&nbsp; 🔴 Negation &nbsp;|&nbsp; 🟣 NMM / Question &nbsp;|&nbsp; 🔵 Content word
              </small>
              <small style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>
                Function words (am, is, the, a…) stripped per ASL grammar
              </small>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
