import { useState } from 'react';

export function useASL() {
  const [sign, setSign] = useState(null);
  return { sign, setSign };
}
