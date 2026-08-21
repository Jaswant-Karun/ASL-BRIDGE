import { useState } from 'react';
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Signup({ navigate }) {
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
      const response = await fetch(`${API_URL}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create account.');
      setMessage(`Welcome, ${result.user.name}. Your account is ready.`);
      setForm({ name: '', email: '', password: '' });
    } catch (signupError) {
      setError(signupError.message);
    } finally { setLoading(false); }
  }

  return <><Navbar navigate={navigate} /><main><p>ASL Bridge</p><h1>Create your account</h1><p>Save your accessibility workspace and translation history.</p><form onSubmit={submit}><label htmlFor="signup-name">Name</label><input id="signup-name" name="name" value={form.name} onChange={updateField} autoComplete="name" required /><label htmlFor="signup-email">Email</label><input id="signup-email" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required /><label htmlFor="signup-password">Password</label><input id="signup-password" name="password" type="password" minLength="8" value={form.password} onChange={updateField} autoComplete="new-password" required /><button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button></form>{message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}</main></>;
}