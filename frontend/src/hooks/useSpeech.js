import { useState } from 'react';

export function useSpeech() {
  const [transcript, setTranscript] = useState('');
  return { transcript, setTranscript };
}
