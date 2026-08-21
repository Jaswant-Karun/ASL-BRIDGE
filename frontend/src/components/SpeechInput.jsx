import { useEffect, useRef, useState } from 'react';

export default function SpeechInput({ onTranscript }) {
	const recognitionRef = useRef(null);
	const [listening, setListening] = useState(false);
	const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

	useEffect(() => () => recognitionRef.current?.stop(), []);

	function toggleListening() {
		if (!supported) return;
		if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
		const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		const recognition = new Recognition();
		recognition.continuous = false; recognition.interimResults = true; recognition.lang = 'en-US';
		recognition.onstart = () => setListening(true);
		recognition.onresult = (event) => onTranscript?.(Array.from(event.results).map((result) => result[0].transcript).join(''));
		recognition.onerror = () => setListening(false);
		recognition.onend = () => setListening(false);
		recognitionRef.current = recognition;
		recognition.start();
	}

	return <section className="speech-control"><button type="button" onClick={toggleListening} disabled={!supported}>{listening ? 'Stop listening' : 'Start microphone'}</button><small>{supported ? (listening ? 'Listening for your English speech...' : 'Speak naturally; your transcript will appear below.') : 'Speech recognition is not supported in this browser.'}</small></section>;
}
