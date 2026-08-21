import Navbar from '../components/Navbar';
import { useState } from 'react';
import SpeechInput from '../components/SpeechInput';
import { translateText } from '../services/api';
import ASLPlayer from '../components/ASLPlayer';

export default function LiveTranslate({ navigate }) {
  const [text, setText] = useState(''); const [result, setResult] = useState(null); const [error, setError] = useState('');
  async function translate() { if (!text.trim()) return; setError(''); try { setResult(await translateText(text)); } catch (translationError) { setError(translationError.message); } }
  return <><Navbar navigate={navigate} /><main><p className="eyebrow">LIVE TRANSLATION</p><h1>Make speech visible.</h1><p className="dashboard-intro">Speak into your microphone and turn the transcript into an ASL-oriented sequence.</p><SpeechInput onTranscript={setText} /><label htmlFor="live-transcript">English transcript</label><textarea id="live-transcript" value={text} onChange={(event) => setText(event.target.value)} rows="4" placeholder="Your speech transcript will appear here..." /><button className="primary-action" type="button" onClick={translate} disabled={!text.trim()}>Translate transcript</button>{error && <p className="error-message" role="alert">{error}</p>}{result && <section><h2>English captions</h2><p>{result.originalText}</p><h2>ASL sequence</h2><p>{result.gloss.join(' -> ')}</p><ASLPlayer animations={result.animations} unsupported={result.unsupported} /></section>}</main></>;
}
