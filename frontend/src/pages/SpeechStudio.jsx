import React, { useState, useRef, useEffect } from 'react';
import { translateText, transcribeAudio } from '../services/api';
import RainbowAudioVisualizer from '../components/RainbowAudioVisualizer';
import AnimateDiffStudio from '../components/AnimateDiffStudio';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';
import { avatarSpeech } from '../utils/speechSynthesis';
import { logTranslation } from './AnalyticsPage';

export default function SpeechStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-US'); // 'en-US' | 'ta-IN' | 'hi-IN'
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [micStream, setMicStream] = useState(null);
  const [speechNotice, setSpeechNotice] = useState('');
  const [whisperLoading, setWhisperLoading] = useState(false);

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
    recognition.lang = speechLang;

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
  const handleTranslate = async (textToTranslate = transcript, forcedLang = null) => {
    const text = (textToTranslate || transcript).trim();
    if (!text) {
      setSpeechNotice('Please speak or enter text first.');
      return;
    }

    setSpeechNotice('');
    setIsLoading(true);
    try {
      const t0 = Date.now();
      const langCode = forcedLang || (speechLang.startsWith('ta') ? 'ta' : speechLang.startsWith('hi') ? 'hi' : 'en');
      const res = await translateText(text, langCode);
      logTranslation(text, res.gloss || [], Date.now() - t0);
      setTranslationResult(res);
    } catch (err) {
      console.error('Translation error:', err);
      setSpeechNotice('Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhisperFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setWhisperLoading(true);
    setSpeechNotice('Whisper is transcribing your audio locally...');
    try {
      const result = await transcribeAudio(file);
      setTranscript(result.text || '');
      sessionFinalTextRef.current = result.text || '';
      setInterimText('');
      setSpeechNotice(`Whisper detected ${result.language || 'the spoken language'} using the local ${result.model || 'Whisper'} model.`);
    } catch (error) {
      setSpeechNotice(error.message || 'Whisper transcription failed.');
    } finally {
      setWhisperLoading(false);
      event.target.value = '';
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
        <div className="speech-lang-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="language-tab-group" style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', padding: '0.3rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              className={`lang-pill-btn ${speechLang === 'en-US' ? 'active' : ''}`}
              onClick={() => setSpeechLang('en-US')}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: speechLang === 'en-US' ? '#38bdf8' : 'transparent', color: speechLang === 'en-US' ? '#040814' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              🇬🇧 English (en-US)
            </button>
            <button
              type="button"
              className={`lang-pill-btn ${speechLang === 'ta-IN' ? 'active' : ''}`}
              onClick={() => setSpeechLang('ta-IN')}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: speechLang === 'ta-IN' ? '#10b981' : 'transparent', color: speechLang === 'ta-IN' ? '#040814' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              🇮🇳 தமிழ் (ta-IN)
            </button>
            <button
              type="button"
              className={`lang-pill-btn ${speechLang === 'hi-IN' ? 'active' : ''}`}
              onClick={() => setSpeechLang('hi-IN')}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: speechLang === 'hi-IN' ? '#f59e0b' : 'transparent', color: speechLang === 'hi-IN' ? '#040814' : '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
            >
              🇮🇳 हिन्दी (hi-IN)
            </button>
          </div>

          <span className="telemetry-pill">🎙️ Active Spoken Language: {speechLang}</span>
        </div>

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

          <label className="whisper-upload-button">
            {whisperLoading ? 'Transcribing with Whisper...' : 'Transcribe audio with Whisper'}
            <input type="file" accept="audio/*,video/*" onChange={handleWhisperFile} disabled={whisperLoading} />
          </label>

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
                  <span className="rec-dot"></span> RECORDING LIVE ({speechLang})...
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
            placeholder={
              speechLang === 'ta-IN'
                ? "மைக் தொடங்கி தமிழில் பேசுங்கள் (எ.கா: 'வணக்கம், நாளை நான் கல்லூரி போகிறேன்')..."
                : speechLang === 'hi-IN'
                ? "माइक शुरू करके हिन्दी में बोलें (उदा: 'नमस्ते, कल मैं कॉलेज जा रहा हूँ')..."
                : "Click 'Start Rainbow Voice Recording' and speak in English..."
            }
            rows="3"
            className="rainbow-textarea speech-transcript-area"
          />

          {/* Quick Pre-Set Speech Prompts */}
          <div className="quick-speech-samples">
            <span className="sample-label">Or test sample voice ({speechLang}):</span>
            {speechLang === 'ta-IN' ? (
              <>
                <button
                  type="button"
                  className="sample-pill-btn"
                  onClick={() => {
                    const sample = 'நாளை நான் கல்லூரி போகிறேன் எனக்கு முக்கிய திட்டம் உள்ளது.';
                    setTranscript(sample);
                    sessionFinalTextRef.current = sample;
                    handleTranslate(sample, 'ta');
                  }}
                >
                  நாளை கல்லூரி திட்டம்
                </button>
                <button
                  type="button"
                  className="sample-pill-btn"
                  onClick={() => {
                    const sample = 'வணக்கம், உங்கள் உதவிக்கு மிக்க நன்றி.';
                    setTranscript(sample);
                    sessionFinalTextRef.current = sample;
                    handleTranslate(sample, 'ta');
                  }}
                >
                  வணக்கம் நன்றி
                </button>
              </>
            ) : speechLang === 'hi-IN' ? (
              <>
                <button
                  type="button"
                  className="sample-pill-btn"
                  onClick={() => {
                    const sample = 'कल मैं कॉलेज जा रहा हूँ क्योंकि मेरा महत्वपूर्ण प्रोजेक्ट है।';
                    setTranscript(sample);
                    sessionFinalTextRef.current = sample;
                    handleTranslate(sample, 'hi');
                  }}
                >
                  कल कॉलेज प्रोजेक्ट
                </button>
                <button
                  type="button"
                  className="sample-pill-btn"
                  onClick={() => {
                    const sample = 'नमस्ते, आपकी सहायता के लिए बहुत धन्यवाद।';
                    setTranscript(sample);
                    sessionFinalTextRef.current = sample;
                    handleTranslate(sample, 'hi');
                  }}
                >
                  नमस्ते धन्यवाद
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="sample-pill-btn"
                  onClick={() => {
                    const sample = 'Tomorrow I am going to college because I have an important project review.';
                    setTranscript(sample);
                    sessionFinalTextRef.current = sample;
                    handleTranslate(sample, 'en');
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
                    handleTranslate(sample, 'en');
                  }}
                >
                  Hello My Name Jashwan
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Integrated AnimateDiff 3D Studio — only shown after a translation result */}
      {translationResult ? (
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
            language={translationResult?.language || (speechLang.startsWith('ta') ? 'ta' : speechLang.startsWith('hi') ? 'hi' : 'en')}
            languageName={translationResult?.languageName || 'English'}
          />
        </section>
      ) : (
        <section className="home-pre-submit-hint">
          <div className="pre-submit-card">
            <span className="pre-submit-icon">🎙️</span>
            <h3>Click Start Recording and speak a sentence</h3>
            <p>The 3D avatar and ASL gesture images will appear here after your speech is translated.</p>
          </div>
        </section>
      )}

      {/* Rainbow Architecture Diagram */}
      <section className="pipeline-flow-section" style={{ marginTop: '2rem' }}>
        <RainbowPipelineDiagram activeStep="input" />
      </section>
    </div>
  );
}
