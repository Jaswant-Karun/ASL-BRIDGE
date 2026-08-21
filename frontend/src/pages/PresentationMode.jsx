import Navbar from '../components/Navbar';
import { useState } from 'react';
import PresentationUpload from '../components/PresentationUpload';
import ASLPlayer from '../components/ASLPlayer';

export default function PresentationMode({ navigate }) {
  const [result, setResult] = useState(null); const [error, setError] = useState('');
  return <><Navbar navigate={navigate} /><main><p className="eyebrow">PRESENTATION MODE</p><h1>Bring your slides into the conversation.</h1><p className="dashboard-intro">Upload a PowerPoint file and ASL Bridge will extract the slide text for captions and sign mapping.</p><PresentationUpload onResult={(value) => { setResult(value); setError(''); }} onError={setError} />{error && <p className="error-message" role="alert">{error}</p>}{result && <div className="presentation-result"><section><p className="eyebrow">ENGLISH CAPTIONS</p><h2>{result.fileName}</h2><p>{result.originalText || 'No readable slide text found.'}</p></section><section><p className="eyebrow">ASL SEQUENCE</p><p>{result.gloss.join(' -> ') || 'No sign tokens found.'}</p><ASLPlayer animations={result.animations} unsupported={result.unsupported} /></section></div>}</main></>;
}
