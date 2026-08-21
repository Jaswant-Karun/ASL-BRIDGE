import Navbar from '../components/Navbar';
import { useState } from 'react';
import { translateText } from '../services/api';
import ASLPlayer from '../components/ASLPlayer';

export default function Home({ navigate }) {
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
      <Navbar navigate={navigate} />
      <main>
        <p>ASL Bridge</p>
        <h1>Communication without barriers.</h1>
        <p>Translate speech and text into American Sign Language resources.</p>
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
