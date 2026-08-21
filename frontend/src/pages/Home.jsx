import Navbar from '../components/Navbar';
import { useState } from 'react';
import { translateText } from '../services/api';
import ASLPlayer from '../components/ASLPlayer';
import ActivityChart from '../components/ActivityChart';

export default function Home({ navigate, user, darkMode, onToggleTheme }) {
  const [text, setText] = useState('Welcome to our computer science class.');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('');
    try { setResult(await translateText(text)); } catch (translationError) { setError(translationError.message); } finally { setLoading(false); }
  }
  return (
    <>
      <Navbar navigate={navigate} darkMode={darkMode} onToggleTheme={onToggleTheme} />
      <main>
        <p className="eyebrow">YOUR ACCESSIBILITY WORKSPACE</p>
        <h1>Good to see you{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1>
        <p className="dashboard-intro">Choose how you want to make your next conversation visible.</p>
        <div className="mode-grid"><button type="button" onClick={() => document.getElementById('translation-text')?.focus()}><span className="mode-icon">Aa</span><strong>Translate text</strong><small>Turn written words into ASL signs</small></button><button type="button" onClick={() => navigate?.('live')}><span className="mode-icon">◉</span><strong>Live translation</strong><small>Follow speech as it happens</small></button><button type="button" onClick={() => navigate?.('presentation')}><span className="mode-icon">▣</span><strong>Presentation mode</strong><small>Make your slides accessible</small></button></div>
        <ActivityChart />
        <div className="section-heading"><div><p className="eyebrow">TEXT TO ASL</p><h2>Start with a sentence</h2></div><span className="status-pill">● Ready</span></div>
        <form onSubmit={submit}>
          <label htmlFor="translation-text">English text</label>
          <textarea id="translation-text" value={text} onChange={(event) => setText(event.target.value)} rows="4" />
          <button type="submit" disabled={loading || !text.trim()}>{loading ? 'Translating...' : 'Translate to ASL'}</button>
        </form>
        {error && <p role="alert">{error}</p>}
        {result && <section aria-label="Translation result"><h2>English captions</h2><p>{result.originalText}</p><h2>ASL sequence</h2><p>{result.gloss.join(' -> ')}</p><ASLPlayer animations={result.animations} unsupported={result.unsupported} /></section>}
      </main>
    </>
  );
}
