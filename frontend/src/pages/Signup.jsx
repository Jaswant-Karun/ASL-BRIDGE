import { useState } from 'react';
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Signup({ onAuthenticated }) {
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const endpoint = mode === 'signup' ? 'signup' : 'signin';
      const response = await fetch(`${API_URL}/auth/${endpoint}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create account.');
      onAuthenticated?.(result.user);
      setForm({ name: '', email: '', password: '' });
    } catch (signupError) {
      setError(signupError.message);
    } finally { setLoading(false); }
  }

  return <main className="auth-page"><div className="auth-brand"><div className="brand-symbol">ASL</div><p className="eyebrow">ACCESSIBILITY, IN MOTION</p><h1>Make every conversation visible.</h1><p>ASL Bridge brings speech, text, and sign animation together in one calm workspace.</p><div className="auth-note"><span>✦</span><p>Designed for classrooms, presentations, and everyday connection.</p></div></div><section className="auth-panel"><p className="panel-kicker">WELCOME TO ASL BRIDGE</p><h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2><p className="muted">{mode === 'signup' ? 'Start building more accessible conversations.' : 'Sign in to continue to your workspace.'}</p><div className="auth-tabs"><button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => { setMode('signup'); setError(''); }}>Sign up</button><button className={mode === 'signin' ? 'active' : ''} type="button" onClick={() => { setMode('signin'); setError(''); }}>Sign in</button></div><form onSubmit={submit}>{mode === 'signup' && <><label htmlFor="signup-name">Name</label><input id="signup-name" name="name" value={form.name} onChange={updateField} autoComplete="name" required /></>}<label htmlFor="signup-email">Email</label><input id="signup-email" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required /><label htmlFor="signup-password">Password</label><input id="signup-password" name="password" type="password" minLength="8" value={form.password} onChange={updateField} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /><button className="primary-action" type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Enter dashboard'} <span>→</span></button></form>{message && <p className="success-message" role="status">{message}</p>}{error && <p className="error-message" role="alert">{error}</p>}<p className="auth-footer">Your data stays private and secure.</p></section></main>;
}