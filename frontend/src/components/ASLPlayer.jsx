import { useEffect, useRef, useState } from 'react';

export default function ASLPlayer({ animations = [], unsupported = [] }) {
	const videoRef = useRef(null);
	const [index, setIndex] = useState(0);
	 const [videoFailed, setVideoFailed] = useState(false);
	const current = animations[index];

	 useEffect(() => { setIndex(0); setVideoFailed(false); }, [animations]);
	const next = () => setIndex((value) => Math.min(value + 1, animations.length - 1));
	const previous = () => setIndex((value) => Math.max(value - 1, 0));
	const restart = () => { videoRef.current?.load(); videoRef.current?.play().catch(() => {}); };

	return (
		<section aria-label="ASL animation player">
			<p>Sign {animations.length ? index + 1 : 0} of {animations.length}</p>
			{current && !videoFailed ? <video ref={videoRef} key={current} controls autoPlay onEnded={next} onError={() => setVideoFailed(true)} src={current} aria-label="ASL sign video" /> : current ? <div className="sign-fallback" role="img" aria-label={`${current} sign asset unavailable`}><span>ASL</span><strong>{current.split('/').pop().replace('.mp4', '').replaceAll('_', ' ')}</strong><small>Add the real animation file to frontend/public{current}.</small></div> : <p>No supported animation available.</p>}
			<div><button type="button" onClick={previous} disabled={index === 0}>Previous</button><button type="button" onClick={restart} disabled={!current}>Restart</button><button type="button" onClick={next} disabled={!current || index === animations.length - 1}>Next</button></div>
			{unsupported.length > 0 && <p role="status">Unsupported signs: {unsupported.join(', ')}</p>}
		</section>
	);
}
 