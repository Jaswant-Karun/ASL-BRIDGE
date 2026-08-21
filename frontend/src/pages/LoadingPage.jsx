import { useEffect } from 'react';

export default function LoadingPage({ onComplete }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1800);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="loading-page" aria-label="Loading ASL Bridge">
      <div className="loading-mark" aria-hidden="true"><span>ASL</span></div>
      <p className="eyebrow">ACCESSIBILITY, IN MOTION</p>
      <h1>ASL Bridge</h1>
      <p className="loading-copy">Turning every voice into a visible conversation.</p>
      <div className="loading-line" aria-hidden="true"><span /></div>
      <p className="loading-status">Preparing your bridge</p>
    </main>
  );
}
