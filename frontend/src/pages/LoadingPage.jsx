import React, { useEffect, useRef, useState } from 'react';

/**
 * LoadingPage (Frontpage Motion Intro)
 * Spectacular rainbow particle canvas, pulsing 3D ASL badge, animated loading progress,
 * and direct 'Launch Studio' action.
 */
export default function LoadingPage({ onComplete }) {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress increment timer
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 400);
          return 100;
        }
        return prev + 2;
      });
    }, 35);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Rainbow Particle Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        hue: Math.random() * 360
      });
    }

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.fillStyle = 'rgba(7, 13, 13, 0.2)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.hue = (p.hue + 0.5) % 360;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
        ctx.shadowColor = `hsl(${p.hue}, 100%, 65%)`;
        ctx.shadowBlur = 10;
        ctx.fill();
      });
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <main className="front-loading-page" aria-label="Loading ASL Bridge Studio">
      <canvas ref={canvasRef} className="rainbow-bg-canvas" />

      <div className="front-loading-card">
        <div className="rainbow-logo-halo">
          <div className="rainbow-logo-badge">
            <span>ASL</span>
          </div>
        </div>

        <span className="rainbow-kicker-pill">🌈 ACCESSIBILITY IN 3D MOTION</span>
        <h1>ASL Bridge</h1>
        <p className="loading-subtitle">
          Real-time speech to 3D cartoon avatar sign language with synchronized voice narration & live subtitles.
        </p>

        {/* Rainbow Progress Bar */}
        <div className="rainbow-progress-bar-container">
          <div
            className="rainbow-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loading-meta-status">
          <span>Initializing 3D Kinematics & Voice Synthesis...</span>
          <strong>{progress}%</strong>
        </div>

        <button
          type="button"
          className="rainbow-motion-btn launch-btn"
          onClick={() => onComplete?.()}
        >
          <span>🚀 Enter Studio Dashboard</span>
        </button>
      </div>
    </main>
  );
}
