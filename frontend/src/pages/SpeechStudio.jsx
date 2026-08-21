import React, { useState, useRef } from 'react';
import { translateText } from '../services/api';
import RainbowAudioVisualizer from '../components/RainbowAudioVisualizer';
import AnimateDiffStudio from '../components/AnimateDiffStudio';
import RainbowPipelineDiagram from '../components/RainbowPipelineDiagram';

export default function SpeechStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef(null);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
    };

    recognition.onresult = async (event) => {
      let finalStr = '';
      for (let i = 0; i < event.results.length; i++) {
        finalStr += event.results[i][0].transcript;
      }
      setTranscript(finalStr);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleTranslateSpeech = async () => {
    const text = transcript.trim() || 'Good morning, welcome to our presentation.';
    setIsLoading(true);
    try {
      const res = await translateText(text);
      setTranslationResult(res);
    } catch (err) {
      console.error('Speech translation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeText = transcript.trim() || 'Good morning, welcome to our presentation.';

  return (
    <div className="speech-studio-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">🎙️ SPEECH TO ASL ANIMATEDIFF 3D STUDIO</span>
          <h2>Speech to ASL Rainbow Studio</h2>
          <p>
            Speak directly into your microphone with dynamic rainbow audio spectrum recording, translating your voice into continuous 3D cartoon avatar sign language.
          </p>
        </div>
      </header>

      {/* Rainbow Microphone Recording Section */}
      <section className="speech-record-panel">
        <RainbowAudioVisualizer isRecording={isRecording} />

        <div className="speech-action-bar">
          <button
            type="button"
            className={`rainbow-motion-btn record-toggle-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
          >
            <span className="btn-icon">{isRecording ? '⏹️' : '🎙️'}</span>
            <span>{isRecording ? 'Stop Recording' : 'Start Rainbow Voice Recording'}</span>
          </button>

          <button
            type="button"
            className="rainbow-motion-btn primary-btn"
            onClick={handleTranslateSpeech}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Synthesizing...' : '✨ Translate Speech to 3D Sign Video'}</span>
          </button>
        </div>

        {/* Live Speech Transcript Box */}
        <div className="transcript-display-box">
          <span className="box-label">LIVE VOICE TRANSCRIPT:</span>
          <p className="transcript-text">
            {transcript ? `"${transcript}"` : 'Your spoken words will appear here in real-time as you speak...'}
          </p>
        </div>
      </section>

      {/* Integrated AnimateDiff 3D Studio (Directly inside Speech to ASL) */}
      <section className="integrated-animatediff-section">
        <AnimateDiffStudio
          initialText={activeText}
          gloss={translationResult?.gloss || ['GOOD', 'MORNING', 'WELCOME', 'OUR', 'PRESENTATION']}
          animations={translationResult?.animations || []}
          unsupported={translationResult?.unsupported || []}
          motionPlan={translationResult?.motionPlan || null}
          linguisticStructure={translationResult?.linguisticStructure || null}
          nonManualMarkers={translationResult?.nonManualMarkers || []}
          animatediffData={translationResult?.animatediff || null}
        />
      </section>

      {/* Rainbow Architecture Diagram */}
      <section className="pipeline-flow-section" style={{ marginTop: '2rem' }}>
        <RainbowPipelineDiagram activeStep="input" />
      </section>
    </div>
  );
}
