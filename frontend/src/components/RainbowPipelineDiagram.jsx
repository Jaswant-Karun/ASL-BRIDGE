import React from 'react';

/**
 * RainbowPipelineDiagram
 * Colorful multi-chromatic interactive architectural pipeline visualization.
 */
export default function RainbowPipelineDiagram({ activeStep = 'motion' }) {
  const steps = [
    {
      id: 'input',
      name: 'Speech & Text Input',
      desc: 'Natural English sentence capture',
      icon: '🎤',
      gradient: 'linear-gradient(135deg, #ff0055, #ff5500)',
      color: '#ff0055'
    },
    {
      id: 'nlp',
      name: 'NLP Tokenizer',
      desc: 'Lemmatization & stopword reordering',
      icon: '🧠',
      gradient: 'linear-gradient(135deg, #ff5500, #ffaa00)',
      color: '#ff5500'
    },
    {
      id: 'grammar',
      name: 'ASL Syntax Engine',
      desc: 'Time-Topic-Comment & Facial NMM',
      icon: '🌈',
      gradient: 'linear-gradient(135deg, #ffaa00, #00ff66)',
      color: '#ffaa00'
    },
    {
      id: 'motion',
      name: 'Kinematics Generator',
      desc: 'Forward kinematics & spline blending',
      icon: '🤖',
      gradient: 'linear-gradient(135deg, #00ff66, #00d4ff)',
      color: '#00ff66'
    },
    {
      id: 'avatar',
      name: '3D Cartoon Avatar',
      desc: 'Articulated gestures & lip sync',
      icon: '🎥',
      gradient: 'linear-gradient(135deg, #00d4ff, #9900ff)',
      color: '#00d4ff'
    },
    {
      id: 'voice',
      name: 'Voice & Subtitles',
      desc: 'Synchronized TTS & live caption glow',
      icon: '🔊',
      gradient: 'linear-gradient(135deg, #9900ff, #ff00aa)',
      color: '#9900ff'
    }
  ];

  return (
    <div className="rainbow-pipeline-container" aria-label="Rainbow Architectural Pipeline">
      <div className="rainbow-diagram-header">
        <span className="rainbow-badge-chip">🌈 RAINBOW SYSTEM PIPELINE</span>
        <h4>Continuous Sign-to-Speech Architecture Flow</h4>
      </div>

      <div className="rainbow-steps-row">
        {steps.map((step, idx) => {
          const isActive = step.id === activeStep || activeStep === 'all';
          return (
            <div key={step.id} className="rainbow-step-wrapper">
              <div
                className={`rainbow-step-card ${isActive ? 'active-step' : ''}`}
                style={{
                  '--step-color': step.color,
                  '--step-gradient': step.gradient
                }}
              >
                <div className="step-glow-orb" style={{ background: step.gradient }}></div>
                <div className="step-icon-badge">{step.icon}</div>
                <div className="step-content">
                  <span className="step-num">STAGE 0{idx + 1}</span>
                  <h5 className="step-name">{step.name}</h5>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="rainbow-connector-arrow">
                  <span className="arrow-pulse">➔</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
