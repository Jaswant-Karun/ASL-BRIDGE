/**
 * ASL Translation & Linguistic Intelligence Service
 * Converts natural English sentences into ASL grammatical structures (Time-Topic-Comment),
 * assigns Non-Manual Markers (NMM), and extracts semantic tokens.
 */

// Time markers in ASL (always move to the front of the sentence)
const TIME_MARKERS = new Set([
  'YESTERDAY', 'TOMORROW', 'TODAY', 'NOW', 'MORNING', 'AFTERNOON', 'NIGHT',
  'LAST WEEK', 'NEXT WEEK', 'LAST YEAR', 'NEXT YEAR', 'SOON', 'BEFORE', 'LATER',
  'DAILY', 'ALWAYS', 'NEVER', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
]);

// Stop words or words with no direct sign equivalence in ASL grammar
const DROP_WORDS = new Set([
  'A', 'AN', 'THE', 'IS', 'ARE', 'AM', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING',
  'TO', 'OF', 'FOR', 'AT', 'BY', 'WITH', 'ABOUT', 'AGAINST', 'BETWEEN', 'INTO',
  'THROUGH', 'DURING', 'BEFORE', 'AFTER', 'ABOVE', 'BELOW', 'FROM', 'UP', 'DOWN',
  'IN', 'OUT', 'ON', 'OFF', 'OVER', 'UNDER', 'AGAIN', 'FURTHER', 'THEN', 'ONCE'
]);

// Pronoun & Subject mapping
const PRONOUN_MAP = {
  'I': 'ME',
  'ME': 'ME',
  'MY': 'MY',
  'MINE': 'MY',
  'YOU': 'YOU',
  'YOUR': 'YOUR',
  'YOURS': 'YOUR',
  'HE': 'HE',
  'SHE': 'SHE',
  'IT': 'IT',
  'WE': 'WE',
  'US': 'WE',
  'THEY': 'THEY',
  'THEM': 'THEY'
};

// Rhetorical & Question words
const RHETORICAL_CONNECTORS = {
  'BECAUSE': 'WHY',
  'WHY': 'WHY',
  'SINCE': 'WHY',
  'SO': 'WHY',
  'THEREFORE': 'RESULT',
  'HOWEVER': 'BUT',
  'ALTHOUGH': 'BUT'
};

/**
 * Transforms an open-ended English sentence into an ASL grammatical representation:
 * 1. Time extraction -> moved to sentence front
 * 2. Topic / Subject / Object identification
 * 3. Rhetorical question formulation (e.g. "because" -> "WHY?" + [raised eyebrows])
 * 4. Non-manual marker assignment (eyebrows, head tilt, body shift)
 */
export function translateEnglishToASL(englishText = '') {
  const cleanText = englishText.trim();
  if (!cleanText) {
    return {
      originalText: '',
      glossSequence: [],
      linguisticStructure: {},
      nonManualMarkers: []
    };
  }

  // Tokenize words
  const rawWords = cleanText
    .toUpperCase()
    .replace(/[^A-Z0-9\s?.,!'-]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const timeTokens = [];
  const mainTokens = [];
  const reasonTokens = [];
  let isReasonClause = false;
  let hasRhetoricalWhy = false;

  for (let i = 0; i < rawWords.length; i++) {
    const rawWord = rawWords[i].replace(/[.,!]/g, '');
    if (!rawWord) continue;

    // Check for multi-word or single time markers
    if (TIME_MARKERS.has(rawWord)) {
      timeTokens.push(rawWord);
      continue;
    }

    // Check for rhetorical connectors (e.g. "because" -> ASL "WHY")
    if (RHETORICAL_CONNECTORS[rawWord]) {
      isReasonClause = true;
      hasRhetoricalWhy = true;
      reasonTokens.push(RHETORICAL_CONNECTORS[rawWord]);
      continue;
    }

    // Skip grammatical filler words
    if (DROP_WORDS.has(rawWord)) {
      continue;
    }

    const mappedToken = PRONOUN_MAP[rawWord] || rawWord;

    if (isReasonClause) {
      reasonTokens.push(mappedToken);
    } else {
      mainTokens.push(mappedToken);
    }
  }

  // Reorder main clause into ASL Topic-Comment / Subject-Object-Verb if applicable
  // Example: "I GO COLLEGE" -> "COLLEGE ME GO" or "ME COLLEGE GO"
  const reorderedMain = reorderToASLSyntax(mainTokens);
  const reorderedReason = reorderToASLSyntax(reasonTokens);

  // Assemble full ASL Gloss Sequence
  const glossSequence = [...timeTokens, ...reorderedMain, ...reorderedReason];

  // Assign Non-Manual Markers (NMM)
  const nonManualMarkers = glossSequence.map((token, index) => {
    if (token === 'WHY') {
      return {
        token,
        eyebrows: 'RAISED', // Rhetorical question: eyebrows raised
        headMovement: 'SLIGHT_TILT_BACK',
        mouthMorpheme: 'WHY_SHAPE',
        grammaticalRole: 'RHETORICAL_CONNECTOR'
      };
    }
    if (TIME_MARKERS.has(token)) {
      return {
        token,
        eyebrows: 'RAISED_TOPIC',
        headMovement: 'FORWARD_NOD',
        mouthMorpheme: 'NEUTRAL',
        grammaticalRole: 'TIME_INDICATOR'
      };
    }
    if (token === 'IMPORTANT') {
      return {
        token,
        eyebrows: 'FURROWED_INTENSE',
        headMovement: 'AFFIRMATIVE_NOD',
        mouthMorpheme: 'CHA_INTENSE',
        grammaticalRole: 'ADJECTIVE_EMPHASIS'
      };
    }
    return {
      token,
      eyebrows: 'NEUTRAL',
      headMovement: 'NEUTRAL',
      mouthMorpheme: 'NATURAL_SIGN_MOUTH',
      grammaticalRole: 'CONTENT_SIGN'
    };
  });

  return {
    originalText: cleanText,
    glossSequence,
    syntaxFormat: 'Time-Topic-Comment (ASL)',
    hasRhetoricalQuestion: hasRhetoricalWhy,
    linguisticStructure: {
      timeClause: timeTokens,
      mainClause: reorderedMain,
      reasonClause: reorderedReason
    },
    nonManualMarkers
  };
}

function reorderToASLSyntax(tokens) {
  if (tokens.length <= 1) return tokens;

  // If there's a motion/verb like 'GO', place destination before verb (e.g., 'COLLEGE GO')
  const verbIdx = tokens.indexOf('GOING') !== -1 ? tokens.indexOf('GOING') : tokens.indexOf('GO');
  if (verbIdx !== -1) {
    const verb = 'GO';
    const otherTokens = tokens.filter((_, idx) => idx !== verbIdx);
    // Find subject vs location
    const subject = otherTokens.find((t) => t === 'ME' || t === 'YOU' || t === 'WE' || t === 'THEY');
    const destination = otherTokens.filter((t) => t !== subject);
    
    const result = [];
    if (subject) result.push(subject);
    result.push(...destination);
    result.push(verb);
    return result;
  }

  return tokens;
}
