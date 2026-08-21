import React, { useState } from 'react';
import AnimateDiffMotionVideoEngine from '../components/AnimateDiffMotionVideoEngine';

export default function AvatarCustomizerPage() {
  const [selectedAvatarId, setSelectedAvatarId] = useState('marcus');
  const [activeGesture, setActiveGesture] = useState('HELLO');

  const avatars = [
    {
      id: 'marcus',
      name: 'Marcus',
      role: 'Accessibility Interpreter',
      badge: 'Emerald Cartoon',
      accentColor: '#10b981',
      description: 'Optimized high-contrast cartoon silhouette for maximum visual accessibility.'
    },
    {
      id: 'alex',
      name: 'Alex',
      role: 'Tech Digital Human',
      badge: 'Cyan Cartoon',
      accentColor: '#38bdf8',
      description: 'Futuristic digital avatar with sharp hand articulation and high-precision fingers.'
    },
    {
      id: 'maya',
      name: 'Maya',
      role: 'Anime / Stylized Signer',
      badge: 'Pink Anime Cartoon',
      accentColor: '#ec4899',
      description: 'Vibrant expressive anime cartoon avatar with lively facial grammar and bouncing expressions.'
    },
    {
      id: 'sarah',
      name: 'Sarah',
      role: 'Studio ASL Interpreter',
      badge: 'Coral Studio Cartoon',
      accentColor: '#e26d4d',
      description: 'Friendly certified ASL interpreter avatar with warm studio presence.'
    }
  ];

  const currentAvatar = avatars.find((a) => a.id === selectedAvatarId) || avatars[0];

  return (
    <div className="avatar-customizer-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">👥 3D CARTOON AVATARS</span>
          <h2>Cartoon Avatar Wardrobe & Persona Studio</h2>
          <p>Customize your 3D signing avatars, test signing gestures, and switch studio lighting profiles.</p>
        </div>
      </header>

      <div className="customizer-grid">
        {/* Left Side: Avatar Selector & Wardrobe Options */}
        <div className="wardrobe-panel">
          <h3>Select Signing Persona</h3>
          <div className="avatar-cards-grid">
            {avatars.map((av) => (
              <div
                key={av.id}
                className={`avatar-persona-card ${selectedAvatarId === av.id ? 'active' : ''}`}
                onClick={() => setSelectedAvatarId(av.id)}
                style={{
                  borderColor: selectedAvatarId === av.id ? av.accentColor : 'rgba(255,255,255,0.08)'
                }}
              >
                <div className="card-top">
                  <div className="avatar-color-badge" style={{ backgroundColor: av.accentColor }}></div>
                  <strong>{av.name}</strong>
                  <span className="badge-pill" style={{ color: av.accentColor }}>{av.badge}</span>
                </div>
                <p className="card-role">{av.role}</p>
                <p className="card-desc">{av.description}</p>
              </div>
            ))}
          </div>

          <h4 style={{ marginTop: '1.5rem' }}>Test Sign Gesture in Real Time</h4>
          <div className="gesture-test-pills">
            {['HELLO', 'WELCOME', 'THANK_YOU', 'MORNING', 'COLLEGE', 'COMPUTER', 'PROJECT'].map((g) => (
              <button
                key={g}
                type="button"
                className={`gesture-pill ${activeGesture === g ? 'active' : ''}`}
                onClick={() => setActiveGesture(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Real-time 3D Viewport */}
        <div className="customizer-preview-box">
          <div className="preview-header">
            <div className="title-group">
              <span className="preview-kicker">ACTIVE 3D CARTOON AVATAR</span>
              <h3>{currentAvatar.name} ({currentAvatar.role})</h3>
            </div>
            <span className="telemetry-pill" style={{ color: currentAvatar.accentColor }}>
              ● LIVE RENDER
            </span>
          </div>

          <div className="customizer-viewport-wrapper">
            <AnimateDiffMotionVideoEngine
              avatar={currentAvatar}
              activeSign={{ token: activeGesture }}
              isPlaying={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
