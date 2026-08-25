/**
 * Avatar Voice Synthesis & Caption Tracking Service
 * Integrates Web Speech API SpeechSynthesis with Chrome speech bug workarounds
 * and Web Audio API fallback.
 */

class AvatarSpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.speechTimer = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices() || [];
    return this.voices;
  }

  getVoiceForAvatar(avatarId = 'sarah') {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }

    const englishVoices = this.voices.filter((v) => v.lang.startsWith('en'));
    const allVoices = englishVoices.length > 0 ? englishVoices : this.voices;

    const preferredVoice = (names) => allVoices.find((voice) => names.some((name) => voice.name.includes(name)));

    switch (avatarId) {
      case 'sarah': {
        const female = preferredVoice(['Zira', 'Samantha', 'Victoria', 'Google US English', 'Female']);
        return female || allVoices[0] || null;
      }
      case 'alex': {
        const male = preferredVoice(['David', 'Alex', 'Guy', 'Male', 'Natural']);
        return male || allVoices[1] || allVoices[0] || null;
      }
      case 'maya': {
        return preferredVoice(['Karen', 'Moira', 'Fiona']) || allVoices[2] || allVoices[0] || null;
      }
      case 'marcus': {
        return preferredVoice(['George', 'Daniel', 'Oliver']) || allVoices[3] || allVoices[1] || null;
      }
      default:
        return allVoices[0] || null;
    }
  }

  speak({
    text = '',
    avatarId = 'sarah',
    rate = 0.95,
    pitch = 1.0,
    volume = 1.0,
    onStart = null,
    onBoundary = null,
    onEnd = null,
    onError = null
  }) {
    if (!this.synth || !text.trim()) return;

    // Reset previous utterances
    this.stop();

    // Chrome Speech Synthesis Resume Hack
    if (this.synth.paused) {
      this.synth.resume();
    }

    const cleanText = text.trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    const voice = this.getVoiceForAvatar(avatarId);
    if (voice) utterance.voice = voice;

    // Persona-specific pitch & rate tuning
    if (avatarId === 'maya') {
      utterance.pitch = 1.2;
      utterance.rate = 1.05;
    } else if (avatarId === 'marcus') {
      utterance.pitch = 0.82;
      utterance.rate = 0.9;
    } else if (avatarId === 'alex') {
      utterance.pitch = 0.95;
      utterance.rate = 1.0;
    } else {
      utterance.pitch = pitch;
      utterance.rate = rate;
    }

    utterance.volume = volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();

      // Chrome Speech Synthesis long-utterance bug fix (auto pause-resume tick)
      if (this.speechTimer) clearInterval(this.speechTimer);
      this.speechTimer = setInterval(() => {
        if (this.synth && this.synth.speaking) {
          this.synth.pause();
          this.synth.resume();
        } else {
          clearInterval(this.speechTimer);
        }
      }, 5000);
    };

    utterance.onboundary = (event) => {
      if (onBoundary) {
        const charIndex = event.charIndex || 0;
        const remaining = cleanText.slice(charIndex);
        const match = remaining.match(/^([a-zA-Z0-9'-]+)/);
        const currentWord = match ? match[1] : '';
        onBoundary({ charIndex, word: currentWord });
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.speechTimer) clearInterval(this.speechTimer);
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.warn('Speech synthesis notice:', event);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.speechTimer) clearInterval(this.speechTimer);
      if (onError) onError(event);
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Speech speak failed:', err);
    }
  }

  stop() {
    if (this.speechTimer) clearInterval(this.speechTimer);
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }
}

export const avatarSpeech = new AvatarSpeechService();
