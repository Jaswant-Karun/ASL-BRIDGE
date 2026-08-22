import React, { useState } from 'react';
import AnimateDiffMotionVideoEngine from '../components/AnimateDiffMotionVideoEngine';

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSign, setSelectedSign] = useState('HELLO');
  const [activeLetter, setActiveLetter] = useState('A');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const commonSigns = [
    { token: 'HELLO', category: 'Greetings', handshape: 'Open 5 to B', desc: 'Salute outward from temple' },
    { token: 'THANK_YOU', category: 'Politeness', handshape: 'Flat B hand', desc: 'Fingertips touch chin and move outward' },
    { token: 'WELCOME', category: 'Politeness', handshape: 'Open C/5', desc: 'Curved hand sweeps toward body' },
    { token: 'MORNING', category: 'Time', handshape: 'Rising sun palm', desc: 'Right arm rises through left arm horizon' },
    { token: 'COLLEGE', category: 'Education', handshape: 'Flat B hand arc', desc: 'Right palm slides across left palm and arcs upward' },
    { token: 'COMPUTER', category: 'Technology', handshape: 'C hand on arm', desc: 'C hand taps and arcs along forearm' },
    { token: 'SCIENCE', category: 'Education', handshape: 'Alternating A hands', desc: 'Thumbs-down hands pour alternate beakers' },
    { token: 'TEACHER', category: 'People', handshape: 'Flattened O to agent', desc: 'Hands sign teach then drop down as person marker' },
    { token: 'STUDENT', category: 'People', handshape: 'Learn to agent', desc: 'Pick knowledge from palm to forehead + person' },
    { token: 'PROJECT', category: 'Work', handshape: 'P to J hands', desc: 'Right P hand traces on left open palm' },
    { token: 'REVIEW', category: 'Work', handshape: 'R hand back sweep', desc: 'Right R hand sweeps backward across left palm' }
  ];

  const filteredSigns = commonSigns.filter((s) =>
    s.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dictionary-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">📚 ASL KINEMATIC LIBRARY</span>
          <h2>ASL 3D Dictionary & Manual Alphabet</h2>
          <p>Interactive library of parametric sign units, manual alphabet fingerspelling, and 3D gesture kinematics.</p>
        </div>
      </header>

      {/* Manual Alphabet Fingerspelling Bar */}
      <section className="alphabet-bar-section">
        <div className="alphabet-bar-header">
          <span className="rainbow-badge-chip">🔤 MANUAL ALPHABET (A - Z FINGERSPELLING)</span>
          <p>Select any letter to inspect its parametric 3D handshape kinematics.</p>
        </div>
        <div className="alphabet-chips-row">
          {alphabet.map((letter) => (
            <button
              key={letter}
              type="button"
              className={`letter-chip ${activeLetter === letter ? 'active' : ''}`}
              onClick={() => {
                setActiveLetter(letter);
                setSelectedSign(letter);
              }}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      {/* Main Dictionary Explorer Grid */}
      <div className="dictionary-grid">
        {/* Left Side: Search & Sign List */}
        <div className="sign-list-panel">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search ASL signs or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dictionary-search-input"
            />
          </div>

          <div className="sign-card-list">
            {filteredSigns.map((sign) => (
              <div
                key={sign.token}
                className={`sign-item-card ${selectedSign === sign.token ? 'selected' : ''}`}
                onClick={() => setSelectedSign(sign.token)}
              >
                <div className="item-header">
                  <strong>{sign.token}</strong>
                  <span className="item-cat">{sign.category}</span>
                </div>
                <p className="item-desc">{sign.desc}</p>
                <small className="item-handshape">🖐️ {sign.handshape}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Interactive 3D Previewer */}
        <div className="sign-preview-panel">
          <div className="preview-top-bar">
            <div className="sign-title-group">
              <span className="preview-kicker">ACTIVE KINEMATIC SIGN</span>
              <h3>{selectedSign}</h3>
            </div>
            <span className="live-status-tag">60 FPS 3D KINEMATICS</span>
          </div>

          <div className="preview-canvas-wrapper" style={{ display: 'grid', gridTemplateColumns: selectedSign.length === 1 ? '1fr 180px' : '1fr', gap: '1rem' }}>
            <AnimateDiffMotionVideoEngine
              avatar={{
                id: 'alex',
                name: 'Alex',
                badge: 'Tech Cyan Cartoon',
                accentColor: '#38bdf8'
              }}
              activeSign={{ token: selectedSign }}
              isPlaying={true}
            />

            {selectedSign.length === 1 && (
              <div className="dataset-reference-box" style={{ background: '#071220', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 'bold' }}>DATASET GESTURE</span>
                <img
                  src={`/dataset-image/${selectedSign.toLowerCase()}`}
                  alt={`ASL dataset gesture for ${selectedSign}`}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `/dataset-image/${selectedSign.toLowerCase()}`;
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 'bold' }}>Letter '{selectedSign}'</span>
              </div>
            )}

          </div>

          <div className="sign-kinematics-info">
            <div className="info-stat">
              <span>Sign Class</span>
              <strong>{selectedSign.length === 1 ? 'Dataset Alphabet Gesture' : 'Parametric ASL Unit'}</strong>
            </div>
            <div className="info-stat">
              <span>Hand Articulation</span>
              <strong>5-Finger IK Spline</strong>
            </div>
            <div className="info-stat">
              <span>Dataset Source</span>
              <strong>Dataset/American/{selectedSign.toLowerCase()}</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
