import React, { useState, useRef, useEffect } from 'react';
import { translateText } from '../services/api';
import RainbowAudioVisualizer from '../components/RainbowAudioVisualizer';
import AnimateDiffStudio from '../components/AnimateDiffStudio';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';
import { avatarSpeech } from '../utils/speechSynthesis';

export default function SpeechStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [micStream, setMicStream] = useState(null);
  const [speechNotice, setSpeechNotice] = useState('');

  // Critical Refs for bulletproof synchronous state control
  const isRecordingRef = useRef(false);
  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);
  const sessionFinalTextRef = useRef('');

  // Helper to completely kill the recognition instance and mic tracks
  const terminateAudioAndRecognition = () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.abort();
      } catch (_) {}
      recognitionRef.current = null;
    }

    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      } catch (_) {}
      micStreamRef.current = null;
      setMicStream(null);
    }
  };

  // Start Voice Recording (ONLY records when user clicks this)
  const startRecording = async () => {
    // 1. Terminate any previous session completely
    terminateAudioAndRecognition();
    avatarSpeech.stop();

    setSpeechNotice('');
    setTranscript('');
    setInterimText('');
    setTranslationResult(null);
    sessionFinalTextRef.current = '';

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechNotice('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // 2. Request Microphone Access
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        if (stream) {
          micStreamRef.current = stream;
          setMicStream(stream);
        }
      }
    } catch (_) {}

    // 3. Configure Web Speech Recognition
    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isRecordingRef.current = true;
      setIsRecording(true);
      setSpeechNotice('');
    };

    recognition.onresult = (event) => {
      // Guard: strictly ignore any events if recording is not active
      if (!isRecordingRef.current) return;

      let fullFinal = '';
      let liveInterim = '';

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          fullFinal += item[0].transcript + ' ';
        } else {
          liveInterim += item[0].transcript;
        }
      }

      const cleanFinal = fullFinal.trim();
      sessionFinalTextRef.current = cleanFinal;
      setTranscript(cleanFinal);
      setInterimText(liveInterim.trim());
    };

    recognition.onerror = (err) => {
      console.warn('Speech recognition notice:', err);
      if (!isRecordingRef.current) return;

      if (err.error === 'no-speech') {
        setSpeechNotice('No speech detected. Please speak into your microphone.');
      } else if (err.error === 'not-allowed') {
        setSpeechNotice('Microphone access was denied. Please allow microphone permissions.');
      }
      terminateAudioAndRecognition();
    };

    recognition.onend = () => {
      // Auto-reconnect ONLY if user is still actively recording
      if (isRecordingRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (_) {
          terminateAudioAndRecognition();
        }
      } else {
        terminateAudioAndRecognition();
      }
    };

    recognitionRef.current = recognition;
    isRecordingRef.current = true;
    setIsRecording(true);

    try {
      recognition.start();
    } catch (e) {
      console.error('Recognition start error:', e);
      terminateAudioAndRecognition();
      setSpeechNotice('Could not start microphone.');
    }
  };

  // Stop Recording and Extract Final Text (ONLY extract when user clicks stop)
  const stopRecordingAndExtract = () => {
    // Grab the final spoken text BEFORE terminating
    const finalSpoken = (sessionFinalTextRef.current || transcript || interimText || '').trim();

    // 1. Immediately cut all microphone and recognition connections
    terminateAudioAndRecognition();
    setInterimText('');

    // 2. Extract and translate
    if (finalSpoken) {
      setTranscript(finalSpoken);
      sessionFinalTextRef.current = finalSpoken;
      handleTranslate(finalSpoken);
    } else {
      setSpeechNotice('No words detected during recording. Click Start Recording and speak clearly.');
    }
  };

  // Main Toggle Button
  const handleToggleRecord = () => {
    if (isRecordingRef.current || isRecording) {
      stopRecordingAndExtract();
    } else {
      startRecording();
    }
  };

  // Clear Speech & Reset Everything
  const handleClear = () => {
    terminateAudioAndRecognition();
    avatarSpeech.stop();

    setTranscript('');
    setInterimText('');
    sessionFinalTextRef.current = '';
    setTranslationResult(null);
    setSpeechNotice('');
  };

  // Execute translation
  const handleTranslate = async (textToTranslate = transcript) => {
    const text = (textToTranslate || transcript).trim();
    if (!text) {
      setSpeechNotice('Please speak or enter text first.');
      return;
    }

    setSpeechNotice('');
    setIsLoading(true);
    try {
      const res = await translateText(text);
      setTranslationResult(res);
    } catch (err) {
      console.error('Translation error:', err);
      setSpeechNotice('Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      terminateAudioAndRecognition();
      avatarSpeech.stop();
    };
  }, []);

  const displayedText = transcript + (interimText ? (transcript ? ` ${interimText}` : interimText) : '');

  return (
    <div className="speech-studio-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">🎙️ SPEECH TO ASL ANIMATEDIFF 3D STUDIO</span>
          <h2>Speech to ASL Rainbow Studio</h2>
          <p>
            Click <strong>Start Rainbow Voice Recording</strong>, speak your sentence, and click <strong>Stop & Extract Spoken Words</strong>. The microphone operates ONLY while recording.
          </p>
        </div>
      </header>

      {/* Rainbow Microphone Recording Section */}
      <section className="speech-record-panel">
        <RainbowAudioVisualizer isRecording={isRecording} audioStream={micStream} />

        <div className="speech-action-bar">
          <button
            type="button"
            className={`rainbow-motion-btn record-toggle-btn ${isRecording ? 'recording' : ''}`}
            onClick={handleToggleRecord}
          >
            <span className="btn-icon">{isRecording ? '⏹️' : '🎙️'}</span>
            <span>{isRecording ? 'Stop & Extract Spoken Words' : 'Start Rainbow Voice Recording'}</span>
          </button>

          <button
            type="button"
            className="rainbow-motion-btn primary-btn"
            onClick={() => handleTranslate(displayedText)}
            disabled={isLoading || !displayedText.trim() || isRecording}
          >
            <span>{isLoading ? 'Synthesizing...' : '✨ Translate Spoken Text to 3D Sign'}</span>
          </button>

          {/* Clear Speech Button */}
          <button
            type="button"
            className="clear-speech-btn"
            onClick={handleClear}
            title="Stop microphone, clear text, and reset avatar"
          >
            🗑️ Clear Speech
          </button>
        </div>

        {speechNotice && (
          <div className="speech-notice-banner" style={{ marginTop: '0.75rem', color: '#38bdf8', fontSize: '0.85rem' }}>
            ℹ️ {speechNotice}
          </div>
        )}

        {/* Live Speech Transcript Box (Real-Time Display & Editing) */}
        <div className={`transcript-display-box ${isRecording ? 'live-streaming' : ''}`}>
          <div className="transcript-box-top">
            <span className="box-label">
              {isRecording ? (
                <span className="live-rec-pill">
                  <span className="rec-dot"></span> RECORDING LIVE (CLICK STOP WHEN DONE)...
                </span>
              ) : (
                'EXTRACTED SPEECH TRANSCRIPT'
              )}
            </span>

            {displayedText.trim() && (
              <span className="word-count-tag">
                {displayedText.trim().split(/\s+/).length} Words Spoken
              </span>
            )}
          </div>

          <textarea
            value={displayedText}
            onChange={(e) => {
              setTranscript(e.target.value);
              sessionFinalTextRef.current = e.target.value;
              setInterimText('');
            }}
            placeholder="Click 'Start Rainbow Voice Recording' and speak. When finished, click 'Stop & Extract Spoken Words'..."
            rows="3"
            className="rainbow-textarea speech-transcript-area"
          />

          {/* Quick Pre-Set Speech Prompts */}
          <div className="quick-speech-samples">
            <span className="sample-label">Or test sample voice:</span>
            <button
              type="button"
              className="sample-pill-btn"
              onClick={() => {
                const sample = 'Tomorrow I am going to college because I have an important project review.';
                setTranscript(sample);
                sessionFinalTextRef.current = sample;
                handleTranslate(sample);
              }}
            >
              Tomorrow College Review
            </button>
            <button
              type="button"
              className="sample-pill-btn"
              onClick={() => {
                const sample = 'Hello everyone, my name is Jashwan Karan.';
                setTranscript(sample);
                sessionFinalTextRef.current = sample;
                handleTranslate(sample);
              }}
            >
              Hello My Name Jashwan
            </button>
            <button
              type="button"
              className="sample-pill-btn"
              onClick={() => {
                const sample = 'Good morning, what to do next to learn computer science?';
                setTranscript(sample);
                sessionFinalTextRef.current = sample;
                handleTranslate(sample);
              }}
            >
              Good Morning Computer Science
            </button>
          </div>
        </div>
      </section>

      {/* Integrated AnimateDiff 3D Studio (Directly inside Speech to ASL) */}
      <section className="integrated-animatediff-section">
        <AnimateDiffStudio
          initialText={translationResult?.originalText || ''}
          gloss={translationResult?.gloss || []}
          animations={translationResult?.animations || []}
          unsupported={translationResult?.unsupported || []}
          motionPlan={translationResult?.motionPlan || null}
          linguisticStructure={translationResult?.linguisticStructure || null}
          nonManualMarkers={translationResult?.nonManualMarkers || []}
          animatediffData={translationResult?.animatediff || null}
          datasetGestures={translationResult?.datasetGestures || null}
        />

      </section>

      {/* Rainbow Architecture Diagram */}
      <section className="pipeline-flow-section" style={{ marginTop: '2rem' }}>
        <RainbowPipelineDiagram activeStep="input" />
      </section>
    </div>
  );
}
