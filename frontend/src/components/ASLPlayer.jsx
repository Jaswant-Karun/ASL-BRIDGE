import React, { useEffect, useRef, useState } from 'react';
import AnimateDiffStudio from './AnimateDiffStudio';

export default function ASLPlayer({
  animations = [],
  unsupported = [],
  gloss = [],
  text = '',
  motionPlan = null,
  linguisticStructure = null,
  nonManualMarkers = [],
  animatediff = null
}) {
  const [playerMode, setPlayerMode] = useState('studio'); // 'studio' | 'compact'
  const videoRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const current = animations[index];

  useEffect(() => {
    setIndex(0);
    setVideoFailed(false);
  }, [animations]);

  const next = () => setIndex((value) => Math.min(value + 1, animations.length - 1));
  const previous = () => setIndex((value) => Math.max(value - 1, 0));
  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="asl-player-wrapper">
      {/* Mode Switcher Header */}
      <div className="player-mode-toggle-bar">
        <span className="mode-title">Avatar Presentation Mode</span>
        <div className="mode-pills">
          <button
            type="button"
            className={`mode-pill ${playerMode === 'studio' ? 'active' : ''}`}
            onClick={() => setPlayerMode('studio')}
          >
            ✨ 3D Avatar & AnimateDiff Studio
          </button>
          <button
            type="button"
            className={`mode-pill ${playerMode === 'compact' ? 'active' : ''}`}
            onClick={() => setPlayerMode('compact')}
          >
            📺 Standard View
          </button>
        </div>
      </div>

      {playerMode === 'studio' ? (
        <AnimateDiffStudio
          initialText={text}
          gloss={gloss}
          animations={animations}
          unsupported={unsupported}
          motionPlan={motionPlan}
          linguisticStructure={linguisticStructure}
          nonManualMarkers={nonManualMarkers}
          animatediffData={animatediff}
        />
      ) : (
        <section className="compact-asl-player" aria-label="ASL animation player">
          <div className="compact-player-header">
            <span>
              Sign {animations.length ? index + 1 : 0} of {animations.length}
            </span>
            {gloss[index] && <strong className="active-gloss-badge">{gloss[index]}</strong>}
          </div>

          {current && !videoFailed ? (
            <div className="compact-video-frame">
              <video
                ref={videoRef}
                key={current}
                controls
                autoPlay
                onEnded={next}
                onError={() => setVideoFailed(true)}
                src={current}
                aria-label="ASL sign video"
              />
            </div>
          ) : current ? (
            <div className="sign-fallback" role="img" aria-label={`${current} sign asset unavailable`}>
              <span>ASL SIGN</span>
              <strong>{current.split('/').pop().replace('.mp4', '').replaceAll('_', ' ')}</strong>
              <small>Real-time pose animation active.</small>
            </div>
          ) : (
            <p className="no-anim-msg">No supported animation available.</p>
          )}

          <div className="compact-player-controls">
            <button type="button" onClick={previous} disabled={index === 0}>
              ◀ Previous Sign
            </button>
            <button type="button" onClick={restart} disabled={!current}>
              🔄 Restart
            </button>
            <button type="button" onClick={next} disabled={!current || index === animations.length - 1}>
              Next Sign ▶
            </button>
          </div>

          {unsupported.length > 0 && (
            <p className="unsupported-msg" role="status">
              ⚠️ Synthetic pose fallback for: {unsupported.join(', ')}
            </p>
          )}
        </section>
      )}
    </div>
  );
}