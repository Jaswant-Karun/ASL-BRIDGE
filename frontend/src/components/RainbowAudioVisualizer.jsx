import React, { useEffect, useRef } from 'react';

/**
 * RainbowAudioVisualizer
 * High-energy multi-chromatic audio waveform visualizer that reacts to
 * microphone audio stream in real-time with vibrant rainbow color spectrum.
 */
export default function RainbowAudioVisualizer({ isRecording = false, audioStream = null }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let analyser = null;
    let dataArray = null;

    if (isRecording) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        if (audioStream) {
          const source = audioCtx.createMediaStreamSource(audioStream);
          source.connect(analyser);
          sourceRef.current = source;
        }

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
      } catch (e) {
        console.warn('Audio Context init warning:', e);
      }
    }

    let phase = 0;

    const render = () => {
      animRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      phase += 0.05;

      const barCount = 32;
      const barWidth = (width / barCount) - 3;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < barCount; i++) {
        let barHeight = 6;

        if (isRecording) {
          if (dataArray && dataArray[i % dataArray.length] > 0) {
            barHeight = Math.max(6, (dataArray[i % dataArray.length] / 255) * height * 0.85);
          } else {
            // Simulated lively voice wave if mic stream analyser is quiet
            barHeight = Math.max(8, (Math.sin(phase + i * 0.35) * 0.5 + 0.5) * height * 0.7 + Math.random() * 8);
          }
        } else {
          // Idle gentle pulse
          barHeight = 4 + Math.sin(phase * 0.5 + i * 0.2) * 3;
        }

        const x = i * (barWidth + 3);
        const y = (height - barHeight) / 2;

        // Rainbow chromatic color gradient based on index and time
        const hue = (i * (360 / barCount) + phase * 40) % 360;
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, `hsl(${hue}, 100%, 70%)`);
        grad.addColorStop(0.5, `hsl(${(hue + 40) % 360}, 100%, 55%)`);
        grad.addColorStop(1, `hsl(${(hue + 80) % 360}, 100%, 40%)`);

        ctx.fillStyle = grad;
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowBlur = isRecording ? 12 : 2;

        // Rounded bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isRecording, audioStream]);

  return (
    <div className={`rainbow-visualizer-box ${isRecording ? 'active-recording' : ''}`}>
      <div className="visualizer-header">
        <span className="rainbow-indicator">
          <span className="rainbow-dot"></span>
          {isRecording ? 'LIVE RAINBOW AUDIO SPECTRUM RECORDING' : 'AUDIO SPECTRUM READY'}
        </span>
        <span className="visualizer-status">
          {isRecording ? '🎙️ Listening to Voice...' : 'Click Record to Speak'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={580}
        height={90}
        className="rainbow-waveform-canvas"
      />
    </div>
  );
}
