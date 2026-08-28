import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import Avatar3DCanvas from '../components/Avatar3DCanvas';

const VISION_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
function createMotionPlan(letter) {
  const safeLetter = /^[A-Z]$/.test(letter) || /^\d$/.test(letter) ? letter : 'NEUTRAL';
  return { totalFrames: 90, motionUnits: [{ token: safeLetter, datasetGesture: { char: safeLetter }, startFrame: 0, endFrame: 89, eyebrows: 0 }] };
}

export default function CameraMode() {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const predictionBusyRef = useRef(false);
  const lastPredictionAtRef = useRef(0);
  const predictionHistoryRef = useRef([]);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const [streamReady, setStreamReady] = useState(false);
  const [cameraRequested, setCameraRequested] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState('');
  const [detectedGesture, setDetectedGesture] = useState('OPEN_PALM');
  const [confidence, setConfidence] = useState(0);
  const [gestureText, setGestureText] = useState('Allow webcam access to begin landmark detection.');
  const [motionPlan, setMotionPlan] = useState(createMotionPlan('OPEN_PALM'));
  const [predictionError, setPredictionError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState('');

  useEffect(() => {
    let stream;
    let mounted = true;
    if (!cameraRequested) return undefined;
    const drawLandmarks = (points) => {
      const canvas = overlayRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#38bdf8';
      points.forEach((point) => { context.beginPath(); context.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, Math.PI * 2); context.fill(); });
    };
    const requestModelPrediction = async (hand) => {
      const video = videoRef.current;
      if (!video || predictionBusyRef.current || Date.now() - lastPredictionAtRef.current < 200) return;
      predictionBusyRef.current = true;
      const canvas = document.createElement('canvas');
      const sourceWidth = video.videoWidth || 640;
      const sourceHeight = video.videoHeight || 480;
      const points = hand || [];
      const minX = Math.max(0, Math.min(...points.map((point) => point.x)) - 0.14);
      const maxX = Math.min(1, Math.max(...points.map((point) => point.x)) + 0.14);
      const minY = Math.max(0, Math.min(...points.map((point) => point.y)) - 0.14);
      const maxY = Math.min(1, Math.max(...points.map((point) => point.y)) + 0.14);
      const boxX = minX * sourceWidth;
      const boxY = minY * sourceHeight;
      const boxWidth = Math.max(1, (maxX - minX) * sourceWidth);
      const boxHeight = Math.max(1, (maxY - minY) * sourceHeight);
      const cropSize = Math.min(Math.max(boxWidth, boxHeight), Math.min(sourceWidth, sourceHeight));
      const cropX = Math.max(0, Math.min(sourceWidth - cropSize, boxX + boxWidth / 2 - cropSize / 2));
      const cropY = Math.max(0, Math.min(sourceHeight - cropSize, boxY + boxHeight / 2 - cropSize / 2));
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      context.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      if (!blob) {
        predictionBusyRef.current = false;
        return;
      }
      lastPredictionAtRef.current = Date.now();
      try {
        const data = new FormData();
        data.append('image', blob, 'camera-frame.jpg');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/asl/predict`, { method: 'POST', body: data });
        const prediction = await response.json();
        if (!response.ok) throw new Error(prediction.error || `Recognition service returned ${response.status}.`);
        const label = String(prediction.prediction || 'UNKNOWN').toUpperCase();
        const history = [...predictionHistoryRef.current, label].slice(-3);
        predictionHistoryRef.current = history;
        const counts = history.reduce((result, item) => ({ ...result, [item]: (result[item] || 0) + 1 }), {});
        const stableLabel = Object.entries(counts).sort((left, right) => right[1] - left[1])[0][0];
        const modelConfidence = Number(prediction.confidence || 0);
        if (counts[stableLabel] >= 2 && modelConfidence >= 0.25) {
          setDetectedGesture(stableLabel);
          setConfidence(Math.round(modelConfidence * 100));
          setGestureText(`Stable model prediction: ${stableLabel}. Top matches: ${(prediction.topMatches || []).map((match) => `${match.label} (${Math.round(match.confidence * 100)}%)`).join(', ') || 'none'}.`);
          setMotionPlan(createMotionPlan(stableLabel));
        } else {
          setGestureText('Reading hand position…');
        }
        setPredictionError('');
      } catch (predictionError) {
        setPredictionError(predictionError.message || 'Recognition service unavailable.');
        setGestureText(predictionError.message || 'The recognition service is unavailable.');
      } finally {
        predictionBusyRef.current = false;
      }
    };
    const detectFrame = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!mounted || !video || !landmarker) return;
      if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        const result = landmarker.detectForVideo(video, performance.now());
        lastVideoTimeRef.current = video.currentTime;
        const hand = result.landmarks?.[0];
        if (hand) {
          drawLandmarks(hand);
          requestModelPrediction(hand);
        } else {
          overlayRef.current?.getContext('2d').clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
          setConfidence(0);
          setGestureText('No hand detected. Center one hand in the camera frame.');
        }
      }
      animationRef.current = requestAnimationFrame(detectFrame);
    };
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser does not support camera access.');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        streamRef.current = stream;
        if (!mounted || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamReady(true);
        const vision = await FilesetResolver.forVisionTasks(VISION_WASM);
        const options = { runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: 0.6, minHandPresenceConfidence: 0.6, minTrackingConfidence: 0.6 };
        let landmarker;
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, { ...options, baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'GPU' } });
        } catch (gpuError) {
          try {
            landmarker = await HandLandmarker.createFromOptions(vision, { ...options, baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'CPU' } });
          } catch (cpuError) {
            throw new Error(`Hand model could not load. Check internet access to the MediaPipe model URL. ${cpuError.message}`);
          }
        }
        if (!mounted) return;
        landmarkerRef.current = landmarker;
        setModelReady(true);
        detectFrame();
      } catch (cameraError) {
        if (mounted) {
          const message = cameraError.name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow camera access for localhost, then try again.'
            : cameraError.name === 'NotFoundError'
              ? 'No camera was found. Connect a webcam and try again.'
              : cameraError.message || 'Camera or hand model initialization failed.';
          setError(message);
              if (!stream) setCameraRequested(false);
              else setStreamReady(true);
        }
      }
    }
    start();
    return () => {
      mounted = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      landmarkerRef.current?.close();
      stream?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStreamReady(false);
      setModelReady(false);
      setConfidence(0);
      setDetectedGesture('WAITING');
      setGestureText('Turn on the camera to begin recognition.');
    };
  }, [cameraRequested]);

  useEffect(() => () => { if (recordingUrl) URL.revokeObjectURL(recordingUrl); }, [recordingUrl]);

  function toggleRecording() {
    if (!streamRef.current) return;
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      return;
    }
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm';
    recordingChunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (event) => { if (event.data.size > 0) recordingChunksRef.current.push(event.data); };
    recorder.onstop = () => {
      const url = URL.createObjectURL(new Blob(recordingChunksRef.current, { type: mimeType }));
      setRecordingUrl((previousUrl) => { if (previousUrl) URL.revokeObjectURL(previousUrl); return url; });
      setIsRecording(false);
    };
    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  }

  return (
    <div className="camera-mode-page">
      <p className="eyebrow">LIVE CAMERA MODE</p>
      <h1>ASL hand tracking + avatar response</h1>
      <p className="dashboard-intro">MediaPipe tracks hand landmarks in your browser. The recognized handshape is passed into the existing articulated avatar rig.</p>
      <div className="camera-layout">
        <div className="camera-panel">
          <div className="camera-video-wrap">
            <video ref={videoRef} autoPlay muted playsInline className={`camera-video ${streamReady ? '' : 'camera-video-hidden'}`} />
            {streamReady && <canvas ref={overlayRef} className="camera-landmark-overlay" />}
            {!streamReady && <div className="camera-placeholder"><span>Camera preview</span><small>{error || 'Your camera stays off until you choose to enable it.'}</small><button type="button" className="presentation-play-lines camera-enable-button" onClick={() => { setError(''); setCameraRequested(true); }}>Turn on camera</button></div>}
          </div>
          <div className="camera-status-row"><span className={modelReady ? 'status-live' : ''}>{modelReady ? '● Hand model live' : '○ Loading hand model'}</span><span>{detectedGesture} {confidence ? `${confidence}%` : ''}</span></div>
          {streamReady && <div className="camera-control-row"><button type="button" className="camera-stop-button" onClick={() => setCameraRequested(false)}>Turn off camera</button><button type="button" className="camera-record-button" onClick={toggleRecording}>{isRecording ? 'Stop recording' : 'Record camera'}</button>{recordingUrl && <a className="camera-download-link" href={recordingUrl} download="asl-bridge-camera.webm">Download recording</a>}</div>}
          {predictionError && <p className="camera-error-message" role="alert">{predictionError}</p>}
          <div className="camera-avatar-preview"><Avatar3DCanvas motionPlan={motionPlan} playbackSpeed={1.2} /></div>
        </div>
        <aside className="camera-insight-panel">
          <div className="insight-card"><span className="detail-label">Detected handshape</span><strong className="detail-value">{detectedGesture}</strong></div>
          <div className="insight-card"><span className="detail-label">Landmark confidence</span><strong className="detail-value">{confidence ? `${confidence}%` : 'Waiting'}</strong></div>
          <div className="insight-card accent-card"><span className="detail-label">Interpretation</span><p>{gestureText}</p></div>
          <div className="insight-card"><span className="detail-label">Recognition scope</span><p>Landmarks are tracked live and each sampled frame is classified by the local trained ASL model. Continuous words and body-language semantics require a temporal video model.</p></div>
        </aside>
      </div>
    </div>
  );
}
