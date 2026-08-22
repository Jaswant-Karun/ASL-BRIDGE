export const ASL_DATASET_CHARACTERS = {
  a: { char: 'A', category: 'Alphabet', handshape: 'A-Fist: Closed fist with thumb pressed upright against index finger side' },
  b: { char: 'B', category: 'Alphabet', handshape: 'Flat B: Four fingers extended vertically together, thumb folded across palm' },
  c: { char: 'C', category: 'Alphabet', handshape: 'C-Shape: Curved fingers and thumb forming a cupped C contour' },
  d: { char: 'D', category: 'Alphabet', handshape: '1-D: Index finger extended straight up, thumb touches middle, ring, pinky' },
  e: { char: 'E', category: 'Alphabet', handshape: 'Claw E: All fingers bent at middle knuckles resting on curled thumb' },
  f: { char: 'F', category: 'Alphabet', handshape: 'OK / F: Index finger and thumb tips touching to form circle, other 3 fingers up' },
  g: { char: 'G', category: 'Alphabet', handshape: 'G-Pointer: Index finger and thumb extended horizontally parallel' },
  h: { char: 'H', category: 'Alphabet', handshape: 'H-Double: Index and middle fingers extended together horizontally' },
  i: { char: 'I', category: 'Alphabet', handshape: 'I-Pinky: Pinky finger extended straight up, all other fingers closed in fist' },
  j: { char: 'J', category: 'Alphabet', handshape: 'J-Trace: Pinky extended making a downward J swoop trajectory' },
  k: { char: 'K', category: 'Alphabet', handshape: 'K-Peace: Index up, middle forward, thumb tucked between them' },
  l: { char: 'L', category: 'Alphabet', handshape: 'L-Angle: Thumb and index finger extended perpendicular forming an L' },
  m: { char: 'M', category: 'Alphabet', handshape: 'M-Tuck: Thumb tucked under first three fingers (index, middle, ring)' },
  n: { char: 'N', category: 'Alphabet', handshape: 'N-Tuck: Thumb tucked under first two fingers (index, middle)' },
  o: { char: 'O', category: 'Alphabet', handshape: 'O-Ring: All finger tips touch thumb tip creating an O-shaped circle' },
  p: { char: 'P', category: 'Alphabet', handshape: 'P-Down: K-handshape inverted with index pointing down' },
  q: { char: 'Q', category: 'Alphabet', handshape: 'Q-Down: G-handshape inverted with index and thumb pointing downward' },
  r: { char: 'R', category: 'Alphabet', handshape: 'R-Cross: Index and middle fingers crossed over each other' },
  s: { char: 'S', category: 'Alphabet', handshape: 'S-Fist: Tight fist with thumb wrapped across front of fingers' },
  t: { char: 'T', category: 'Alphabet', handshape: 'T-Tuck: Thumb tucked between index and middle fingers' },
  u: { char: 'U', category: 'Alphabet', handshape: 'U-Pair: Index and middle fingers extended straight up together' },
  v: { char: 'V', category: 'Alphabet', handshape: 'V-Peace: Index and middle fingers spread in a V formation' },
  w: { char: 'W', category: 'Alphabet', handshape: 'W-Three: Index, middle, and ring fingers spread upward in a W' },
  x: { char: 'X', category: 'Alphabet', handshape: 'X-Hook: Index finger bent like a hook, other fingers in a fist' },
  y: { char: 'Y', category: 'Alphabet', handshape: 'Y-Horn: Thumb and pinky extended outward, middle 3 fingers curled' },
  z: { char: 'Z', category: 'Alphabet', handshape: 'Z-Trace: Index finger traces a Z pattern in the air' },
  0: { char: '0', category: 'Number', handshape: 'Number 0: Oval handshape with all fingertips meeting thumb' },
  1: { char: '1', category: 'Number', handshape: 'Number 1: Index finger straight up from fist' },
  2: { char: '2', category: 'Number', handshape: 'Number 2: Index and middle fingers extended upright' },
  3: { char: '3', category: 'Number', handshape: 'Number 3: Thumb, index, and middle fingers extended' },
  4: { char: '4', category: 'Number', handshape: 'Number 4: Four fingers extended upright, thumb tucked in palm' },
  5: { char: '5', category: 'Number', handshape: 'Number 5: Open 5 handshape with all 5 digits spread wide' },
  6: { char: '6', category: 'Number', handshape: 'Number 6: Pinky touches thumb tip, 3 fingers extended' },
  7: { char: '7', category: 'Number', handshape: 'Number 7: Ring finger touches thumb tip, 3 fingers extended' },
  8: { char: '8', category: 'Number', handshape: 'Number 8: Middle finger touches thumb tip, 3 fingers extended' },
  9: { char: '9', category: 'Number', handshape: 'Number 9: Index finger touches thumb tip, 3 fingers extended' }
};

export function mapGlossToAnimations(signs, gloss = []) {
  const animations = [];
  const unsupported = [];

  for (const token of gloss) {
    const sign = signs[token.toUpperCase()];
    if (sign) animations.push({ token, ...sign });
    else unsupported.push(token);
  }

  return { animations, unsupported };
}

/**
 * Maps English text and ASL gloss into real Dataset gesture images (both letter-by-letter & word-by-word)
 */
export function mapTextToDatasetGestures(text = '', gloss = []) {
  const clean = text.trim();
  const rawWords = clean.length > 0
    ? clean.split(/\s+/).filter(Boolean)
    : (gloss.length > 0 ? gloss : ['HELLO']);

  let cumulativeIndex = 0;
  const wordGestures = [];
  const flatGestureStream = [];

  rawWords.forEach((wordStr, wordIdx) => {
    const cleanWord = wordStr.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanWord) return;

    const chars = cleanWord.split('');
    const letters = [];

    chars.forEach((ch, chIdx) => {
      const lower = ch.toLowerCase();
      const meta = ASL_DATASET_CHARACTERS[lower] || {
        char: ch,
        category: 'Alphabet',
        handshape: `ASL Gesture for ${ch}`
      };

      const primaryUrl = `/dataset-image/${lower}`;
      const sampleUrls = [
        `/dataset-image/${lower}?sample=0`,
        `/dataset-image/${lower}?sample=1`,
        `/dataset-image/${lower}?sample=2`,
        `/dataset-image/${lower}?sample=3`
      ];

      const gestureObj = {
        id: `gst_${wordIdx}_${chIdx}_${ch}`,
        index: cumulativeIndex,
        wordIndex: wordIdx,
        charIndexInWord: chIdx,
        char: ch,
        lowerChar: lower,
        word: cleanWord,
        imageUrl: primaryUrl,
        sampleUrls,
        category: meta.category,
        handshape: meta.handshape
      };


      letters.push(gestureObj);
      flatGestureStream.push(gestureObj);
      cumulativeIndex++;
    });

    const isSignConcept = ['HELLO', 'WELCOME', 'THANK YOU', 'STUDENT', 'TEACHER', 'CLASS', 'COMPUTER', 'SCIENCE'].includes(cleanWord);

    wordGestures.push({
      word: cleanWord,
      wordIndex: wordIdx,
      isSignConcept,
      signVideoUrl: isSignConcept ? `/asl/${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4` : null,
      letters,
      totalLetters: letters.length
    });
  });

  return {
    originalText: clean,
    totalWords: wordGestures.length,
    totalGestures: flatGestureStream.length,
    wordGestures,
    flatGestureStream,
    datasetLibrary: ASL_DATASET_CHARACTERS
  };
}

