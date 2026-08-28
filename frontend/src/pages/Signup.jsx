import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Signup({ onAuthenticated, onGuestMode, darkMode = true, onToggleTheme }) {
  const [mode, setMode] = useState('signup');
  const [signinMethod, setSigninMethod] = useState('email');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const endpoint = mode === 'signup' ? 'signup' : 'signin';
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, ...(mode === 'signin' ? { method: signinMethod } : {}) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to authenticate.');
      onAuthenticated?.(result.user);
    } catch (signupError) {
      setError(signupError.message || 'Unable to authenticate.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`auth-page-dark ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <button type="button" className="auth-theme-toggle" onClick={onToggleTheme} title="Toggle dark and light mode">
        {darkMode ? '☀ Light mode' : '☾ Dark mode'}
      </button>
      <div className="auth-hero-side">
        <div className="rainbow-brand-badge-large">
          <span>ASL</span>
        </div>
        <span className="rainbow-kicker">🌈 NEXT-GEN SIGN TRANSLATION</span>
        <h1>Speak. Sign. Connect.</h1>
        <p className="auth-hero-desc">
          Continuous 3D cartoon avatar sign language synthesis with talking lip-sync and live spoken captions.
        </p>

        <div className="auth-feature-list">
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <div>
              <strong>4 Cartoon Avatar Personas</strong>
              <p>Marcus, Sarah, Alex, and Maya in full 60 FPS 3D motion.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎙️</span>
            <div>
              <strong>Rainbow Audio Spectrum</strong>
              <p>Real-time microphone speech capture with chromatic visualization.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔊</span>
            <div>
              <strong>Synchronized Spoken Voice</strong>
              <p>Natural text-to-speech with live word-by-word active caption glow.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form Panel */}
      <section className="auth-form-card">
        <div className="auth-tabs-row">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Create Account
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            Sign In
          </button>
        </div>

        <div className="auth-form-header">
          <h2>{mode === 'signup' ? 'Join ASL Bridge Studio' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {mode === 'signup'
              ? 'Start building accessible sign language conversations.'
              : 'Sign in to access your 3D cartoon translation studio.'}
          </p>
        </div>

          {mode === 'signin' && (
            <div className="signin-method-switch" role="tablist" aria-label="Sign in method">
              <button type="button" className={signinMethod === 'email' ? 'active' : ''} onClick={() => setSigninMethod('email')}>Email & Password</button>
              <button type="button" className={signinMethod === 'identity' ? 'active' : ''} onClick={() => setSigninMethod('identity')}>Username & Personal ID</button>
            </div>
          )}

        <form onSubmit={submit} className="auth-fields-form">
          {mode === 'signup' && (
            <div className="input-group">
              <label htmlFor="signup-name">Your Name</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                placeholder="e.g. Jashwan Karan"
                value={form.name}
                onChange={updateField}
                autoComplete="name"
                required
                className="rainbow-input"
              />
            </div>
          )}

          {mode === 'signin' && signinMethod === 'identity' ? (
            <>
              <div className="input-group">
                <label htmlFor="signin-username">Username</label>
                <input id="signin-username" name="username" type="text" placeholder="your generated username" value={form.username || ''} onChange={updateField} autoComplete="username" required className="rainbow-input" />
              </div>
              <div className="input-group">
                <label htmlFor="signin-public-id">Personal ID</label>
                <input id="signin-public-id" name="publicId" type="text" placeholder="AS_••••••" value={form.publicId || ''} onChange={updateField} required className="rainbow-input" />
              </div>
            </>
          ) : <div className="input-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="user@aslbridge.ai"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              required
              className="rainbow-input"
            />
          </div>}

          {(mode === 'signup' || signinMethod === 'email') && <div className="input-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="••••••••"
              minLength={6}
              value={form.password}
              onChange={updateField}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              className="rainbow-input"
            />
          </div>}

          <button
            className="rainbow-motion-btn submit-btn"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : mode === 'signup' ? 'Create Free Account' : 'Sign In to Studio'} ➔</span>
          </button>

        </form>

        {error && <p className="auth-error-banner">{error}</p>}
      </section>
    </main>
  );
}