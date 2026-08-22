import React, { useState, useEffect, useRef } from 'react';

// Fallback dictionary for all 36 characters (A-Z, 0-9)
const ALL_36_CHARACTERS = [
  { char: 'A', lower: 'a', category: 'Alphabet', handshape: 'A-Fist: Closed fist with thumb pressed upright against index finger' },
  { char: 'B', lower: 'b', category: 'Alphabet', handshape: 'Flat B: Four fingers extended vertically together, thumb folded across palm' },
  { char: 'C', lower: 'c', category: 'Alphabet', handshape: 'C-Shape: Curved fingers and thumb forming an open C contour' },
  { char: 'D', lower: 'd', category: 'Alphabet', handshape: '1-D: Index finger extended straight up, thumb touches other 3 fingers' },
  { char: 'E', lower: 'e', category: 'Alphabet', handshape: 'Claw E: All fingers bent at middle knuckles resting on curled thumb' },
  { char: 'F', lower: 'f', category: 'Alphabet', handshape: 'OK / F: Index finger and thumb tips touching to form circle, 3 fingers up' },
  { char: 'G', lower: 'g', category: 'Alphabet', handshape: 'G-Pointer: Index finger and thumb extended horizontally parallel' },
  { char: 'H', lower: 'h', category: 'Alphabet', handshape: 'H-Double: Index and middle fingers extended together horizontally' },
  { char: 'I', lower: 'i', category: 'Alphabet', handshape: 'I-Pinky: Pinky finger extended straight up, other fingers in fist' },
  { char: 'J', lower: 'j', category: 'Alphabet', handshape: 'J-Trace: Pinky extended making a downward J swoop curve' },
  { char: 'K', lower: 'k', category: 'Alphabet', handshape: 'K-Peace: Index up, middle forward, thumb tucked between them' },
  { char: 'L', lower: 'l', category: 'Alphabet', handshape: 'L-Angle: Thumb and index finger extended perpendicular in L-shape' },
  { char: 'M', lower: 'm', category: 'Alphabet', handshape: 'M-Tuck: Thumb tucked under first three fingers (index, middle, ring)' },
  { char: 'N', lower: 'n', category: 'Alphabet', handshape: 'N-Tuck: Thumb tucked under first two fingers (index, middle)' },
  { char: 'O', lower: 'o', category: 'Alphabet', handshape: 'O-Ring: All finger tips touch thumb tip creating an O-shaped circle' },
  { char: 'P', lower: 'p', category: 'Alphabet', handshape: 'P-Down: K-handshape inverted with index pointing downward' },
  { char: 'Q', lower: 'q', category: 'Alphabet', handshape: 'Q-Down: G-handshape inverted with index and thumb pointing down' },
  { char: 'R', lower: 'r', category: 'Alphabet', handshape: 'R-Cross: Index and middle fingers crossed over each other' },
  { char: 'S', lower: 's', category: 'Alphabet', handshape: 'S-Fist: Tight fist with thumb wrapped across front of fingers' },
  { char: 'T', lower: 't', category: 'Alphabet', handshape: 'T-Tuck: Thumb tucked between index and middle fingers' },
  { char: 'U', lower: 'u', category: 'Alphabet', handshape: 'U-Pair: Index and middle fingers extended straight up together' },
  { char: 'V', lower: 'v', category: 'Alphabet', handshape: 'V-Peace: Index and middle fingers spread in a V formation' },
  { char: 'W', lower: 'w', category: 'Alphabet', handshape: 'W-Three: Index, middle, and ring fingers spread upward in a W' },
  { char: 'X', lower: 'x', category: 'Alphabet', handshape: 'X-Hook: Index finger bent like a hook, other fingers in fist' },
  { char: 'Y', lower: 'y', category: 'Alphabet', handshape: 'Y-Horn: Thumb and pinky extended outward, middle 3 fingers curled' },
  { char: 'Z', lower: 'z', category: 'Alphabet', handshape: 'Z-Trace: Index finger traces a Z pattern in the air' },
  { char: '0', lower: '0', category: 'Number', handshape: 'Number 0: Oval handshape with all fingertips meeting thumb' },
  { char: '1', lower: '1', category: 'Number', handshape: 'Number 1: Index finger straight up from fist' },
  { char: '2', lower: '2', category: 'Number', handshape: 'Number 2: Index and middle fingers extended upright' },
  { char: '3', lower: '3', category: 'Number', handshape: 'Number 3: Thumb, index, and middle fingers extended' },
  { char: '4', lower: '4', category: 'Number', handshape: 'Number 4: Four fingers extended upright, thumb tucked in palm' },
  { char: '5', lower: '5', category: 'Number', handshape: 'Number 5: Open 5 handshape with all 5 digits spread wide' },
  { char: '6', lower: '6', category: 'Number', handshape: 'Number 6: Pinky touches thumb tip, 3 fingers extended' },
  { char: '7', lower: '7', category: 'Number', handshape: 'Number 7: Ring finger touches thumb tip, 3 fingers extended' },
  { char: '8', lower: '8', category: 'Number', handshape: 'Number 8: Middle finger touches thumb tip, 3 fingers extended' },
  { char: '9', lower: '9', category: 'Number', handshape: 'Number 9: Index finger touches thumb tip, 3 fingers extended' }
];

export default function ASLGestureDatasetViewer({
  text = '',
  gloss = [],
  datasetData = null,
  isSpeaking = false,
  currentSpokenWord = '',
  activeSignIndex = 0
}) {
  const [activeGestureIndex, setActiveGestureIndex] = useState(0);
  const [isPlayingStream, setIsPlayingStream] = useState(false);
  const [streamSpeed, setStreamSpeed] = useState(1.0);
  const [selectedSampleNum, setSelectedSampleNum] = useState('1');
  const [filterCat, setFilterCat] = useState('all'); // 'all' | 'alphabet' | 'number'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManualChar, setSelectedManualChar] = useState(null);

  const streamTimerRef = useRef(null);

  // Compute Word & Letter sequences from active text if datasetData is not passed
  const activeSentence = text.trim() || (gloss.length > 0 ? gloss.join(' ') : 'TOMORROW COLLEGE REVIEW');

  const parsedData = React.useMemo(() => {
    if (datasetData?.wordGestures && datasetData?.flatGestureStream) {
      return datasetData;
    }

    const words = activeSentence.split(/\s+/).filter(Boolean);
    let cumulative = 0;
    const wordGestures = [];
    const flatGestureStream = [];

    words.forEach((w, wIdx) => {
      const cleanW = w.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!cleanW) return;

      const letters = [];
      cleanW.split('').forEach((ch, chIdx) => {
        const lower = ch.toLowerCase();
        const found = ALL_36_CHARACTERS.find((c) => c.lower === lower) || {
          char: ch,
          lower,
          category: 'Alphabet',
          handshape: `ASL Gesture for ${ch}`
        };

        const item = {
          id: `gst_${wIdx}_${chIdx}_${ch}`,
          index: cumulative,
          wordIndex: wIdx,
          charIndexInWord: chIdx,
          char: ch,
          lowerChar: lower,
          word: cleanW,
          imageUrl: `/dataset-image/${lower}`,
          sampleUrls: [
            `/dataset-image/${lower}?sample=0`,
            `/dataset-image/${lower}?sample=1`,
            `/dataset-image/${lower}?sample=2`,
            `/dataset-image/${lower}?sample=3`
          ],
          category: found.category,
          handshape: found.handshape
        };

        letters.push(item);
        flatGestureStream.push(item);
        cumulative++;
      });

      const isSignConcept = ['HELLO', 'WELCOME', 'THANK YOU', 'STUDENT', 'TEACHER', 'CLASS', 'COMPUTER', 'SCIENCE'].includes(cleanW);

      wordGestures.push({
        word: cleanW,
        wordIndex: wIdx,
        isSignConcept,
        signVideoUrl: isSignConcept ? `/asl/${cleanW.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4` : null,
        letters,
        totalLetters: letters.length
      });
    });

    return {
      totalWords: wordGestures.length,
      totalGestures: flatGestureStream.length,
      wordGestures,
      flatGestureStream
    };
  }, [activeSentence, datasetData]);

  const flatList = parsedData.flatGestureStream || [];
  const currentGesture = flatList[activeGestureIndex] || flatList[0] || {
    char: 'A',
    lowerChar: 'a',
    word: 'HELLO',
    imageUrl: '/dataset-image/a',
    sampleUrls: ['/dataset-image/a?sample=0', '/dataset-image/a?sample=1', '/dataset-image/a?sample=2', '/dataset-image/a?sample=3'],
    handshape: 'A-Fist ASL Gesture',
    category: 'Alphabet'
  };


  // Sync with current spoken word if avatar speech is active
  useEffect(() => {
    if (currentSpokenWord && parsedData.wordGestures) {
      const cleanSpoken = currentSpokenWord.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const foundWord = parsedData.wordGestures.find((wg) => wg.word === cleanSpoken);
      if (foundWord && foundWord.letters.length > 0) {
        setActiveGestureIndex(foundWord.letters[0].index);
      }
    }
  }, [currentSpokenWord, parsedData.wordGestures]);

  // Stream Player Loop
  useEffect(() => {
    if (isPlayingStream && flatList.length > 0) {
      const intervalMs = Math.max(200, Math.floor(800 / streamSpeed));
      streamTimerRef.current = setInterval(() => {
        setActiveGestureIndex((prev) => (prev + 1) % flatList.length);
      }, intervalMs);
    } else {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    }

    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isPlayingStream, streamSpeed, flatList.length]);

  const togglePlay = () => {
    setIsPlayingStream(!isPlayingStream);
  };

  const stepGesture = (forward = true) => {
    setIsPlayingStream(false);
    if (flatList.length === 0) return;
    if (forward) {
      setActiveGestureIndex((prev) => (prev + 1) % flatList.length);
    } else {
      setActiveGestureIndex((prev) => (prev - 1 + flatList.length) % flatList.length);
    }
  };

  // Filtered 36-gesture reference chart
  const filteredLibrary = ALL_36_CHARACTERS.filter((item) => {
    const matchesCat =
      filterCat === 'all' ||
      (filterCat === 'alphabet' && item.category === 'Alphabet') ||
      (filterCat === 'number' && item.category === 'Number');

    const matchesSearch =
      !searchQuery ||
      item.char.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.handshape.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const activeDisplayChar = selectedManualChar || currentGesture;
  const sampleMap = { '1': 0, '10': 1, '100': 2, '1000': 3 };
  const targetChar = (activeDisplayChar?.lowerChar || activeDisplayChar?.lower || 'a').toLowerCase();
  const activeImageUrl = `/dataset-image/${targetChar}?sample=${sampleMap[selectedSampleNum] ?? 0}`;

  return (
    <div className="asl-dataset-viewer" aria-label="ASL Gesture Dataset Recognition Viewer">
      {/* Top Banner with Real-Time Recognition Status */}
      <div className="dataset-header-card">
        <div className="header-left">
          <div className="dataset-status-pill">
            <span className="live-pulse-dot"></span>
            <span>AMERICAN ASL GESTURE DATASET (A-Z, 0-9)</span>
          </div>
          <h3>Speech & Text to ASL Gesture Image Recognition</h3>
          <p className="dataset-sub">
            Recognizes speech and text inputs, breaking down words and letters into verified ASL dataset gestures with synchronized stream playback.
          </p>
        </div>

        <div className="header-stats">
          <div className="stat-pill">
            <span>Recognized Words:</span>
            <strong>{parsedData.totalWords}</strong>
          </div>
          <div className="stat-pill highlight">
            <span>Letter Gestures:</span>
            <strong>{parsedData.totalGestures} Signs</strong>
          </div>
          <div className="stat-pill">
            <span>Dataset Library:</span>
            <strong>36 Characters</strong>
          </div>
        </div>
      </div>

      {/* Recognized Input Sentence Display */}
      <div className="recognized-sentence-box">
        <div className="rec-box-top">
          <span className="rec-label">📝 RECOGNIZED SENTENCE STREAM:</span>
          <span className="rec-gesture-count">{flatList.length} ASL Gesture Frames</span>
        </div>
        <p className="rec-sentence-text">
          "{activeSentence}"
        </p>
      </div>

      {/* Main Split Viewer */}
      <div className="dataset-main-grid">
        {/* Left Side: Cinematic Gesture Inspector & Stream Controller */}
        <div className="dataset-inspector-panel">
          <div className="cinema-card">
            <div className="cinema-top">
              <div className="char-badge-group">
                <span className="char-badge">{activeDisplayChar.char}</span>
                <div className="char-meta">
                  <h4>{activeDisplayChar.category || 'Alphabet'} Gesture</h4>
                  <small>Word: <strong>{activeDisplayChar.word || activeDisplayChar.char}</strong></small>
                </div>
              </div>

              <span className="dataset-source-tag">📂 Dataset/American/{activeDisplayChar.lowerChar || activeDisplayChar.lower}</span>
            </div>

            {/* Gesture Image Preview Container */}
            <div className="gesture-image-viewport">
              <img
                src={activeImageUrl}
                alt={`ASL gesture for ${activeDisplayChar.char}`}
                className="cinema-gesture-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `/dataset-image/${targetChar}`;
                }}
              />

              <div className="image-overlay-info">
                <span className="gesture-handshape-pill">🖐️ {activeDisplayChar.handshape}</span>
              </div>
            </div>


            {/* Sample Image Variant Switcher */}
            <div className="sample-variations-bar">
              <span className="var-label">Dataset Sample Angle:</span>
              <div className="var-buttons">
                {['1', '10', '100', '1000'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    className={`var-btn ${selectedSampleNum === sample ? 'active' : ''}`}
                    onClick={() => setSelectedSampleNum(sample)}
                    title={`View sample ${sample}.jpg`}
                  >
                    Sample #{sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Gesture Stream Player Controls */}
            <div className="gesture-player-controls">
              <div className="ctrl-buttons">
                <button
                  type="button"
                  className="player-btn primary"
                  onClick={togglePlay}
                  title={isPlayingStream ? 'Pause Gesture Stream' : 'Play Gesture Stream'}
                >
                  {isPlayingStream ? '⏸ Pause Stream' : '▶ Play Gesture Stream'}
                </button>
                <button
                  type="button"
                  className="player-btn"
                  onClick={() => stepGesture(false)}
                  title="Previous Letter"
                >
                  ⏮ Prev
                </button>
                <button
                  type="button"
                  className="player-btn"
                  onClick={() => stepGesture(true)}
                  title="Next Letter"
                >
                  Next ⏭
                </button>
              </div>

              {/* Speed Controls */}
              <div className="speed-controller">
                <span className="speed-label">Speed:</span>
                {[0.5, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`speed-btn ${streamSpeed === s ? 'active' : ''}`}
                    onClick={() => setStreamSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Word-by-Word ASL Gesture Stream Deck */}
        <div className="dataset-stream-deck">
          <div className="deck-header">
            <h4>Word & Letter ASL Gesture Breakdown</h4>
            <span className="deck-instruction">Click any gesture image below to inspect</span>
          </div>

          <div className="word-cards-container">
            {parsedData.wordGestures?.map((wg, wIdx) => {
              const isWordSpoken =
                currentSpokenWord &&
                wg.word.toLowerCase() === currentSpokenWord.toLowerCase();

              return (
                <div
                  key={`${wg.word}-${wIdx}`}
                  className={`word-gesture-group ${isWordSpoken ? 'spoken-word-active' : ''}`}
                >
                  <div className="word-group-header">
                    <div className="word-title-row">
                      <span className="word-index-pill">0{wIdx + 1}</span>
                      <strong className="word-text-label">{wg.word}</strong>
                      <span className="word-count-badge">{wg.totalLetters} letters</span>
                    </div>

                    {wg.isSignConcept && (
                      <span className="concept-sign-badge">
                        🎬 ASL Concept Sign Recognized
                      </span>
                    )}
                  </div>

                  {/* Horizontal Gesture Thumbnails for Letters in Word */}
                  <div className="letter-thumbnails-row">
                    {wg.letters.map((ltr) => {
                      const isActive =
                        !selectedManualChar && ltr.index === activeGestureIndex;

                      return (
                        <div
                          key={ltr.id}
                          className={`letter-thumb-card ${isActive ? 'active-gesture' : ''}`}
                          onClick={() => {
                            setSelectedManualChar(null);
                            setActiveGestureIndex(ltr.index);
                          }}
                          title={`Letter ${ltr.char}: ${ltr.handshape}`}
                        >
                          <div className="thumb-img-wrapper">
                            <img
                              src={ltr.imageUrl || `/dataset-image/${ltr.lowerChar}`}
                              alt={ltr.char}
                              className="thumb-gesture-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `/dataset-image/${ltr.lowerChar}`;
                              }}
                            />
                            {isActive && <span className="active-thumb-glow"></span>}
                          </div>
                          <span className="thumb-char-tag">{ltr.char}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Complete 36-Gesture A-Z & 0-9 Reference Library */}
      <section className="dataset-full-library-section">
        <div className="library-header-row">
          <div className="title-group">
            <span className="rainbow-badge-chip">📚 ASL DATASET REFERENCE GALLERY</span>
            <h4>Browse Complete 36-Gesture Dataset (A–Z, 0–9)</h4>
          </div>

          {/* Filter & Search Bar */}
          <div className="library-filter-bar">
            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-btn ${filterCat === 'all' ? 'active' : ''}`}
                onClick={() => setFilterCat('all')}
              >
                All (36)
              </button>
              <button
                type="button"
                className={`filter-btn ${filterCat === 'alphabet' ? 'active' : ''}`}
                onClick={() => setFilterCat('alphabet')}
              >
                Alphabets A-Z (26)
              </button>
              <button
                type="button"
                className={`filter-btn ${filterCat === 'number' ? 'active' : ''}`}
                onClick={() => setFilterCat('number')}
              >
                Digits 0-9 (10)
              </button>
            </div>

            <div className="search-input-box">
              <input
                type="text"
                placeholder="Search letter/digit (e.g. A, 5)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="library-search-input"
              />
            </div>
          </div>
        </div>

        {/* 36-Gesture Grid */}
        <div className="library-gesture-grid">
          {filteredLibrary.map((item) => {
            const isSelected =
              selectedManualChar?.char === item.char ||
              (!selectedManualChar && currentGesture.char === item.char);

            return (
              <div
                key={item.char}
                className={`lib-gesture-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedManualChar(item);
                }}
              >
                <div className="lib-img-box">
                  <img
                    src={`/dataset-image/${item.lower}`}
                    alt={`ASL sign for ${item.char}`}
                    className="lib-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/dataset-image/${item.lower}`;
                    }}
                  />
                  <span className="lib-char-badge">{item.char}</span>
                </div>
                <div className="lib-info">
                  <strong>{item.char}</strong>
                  <p>{item.handshape.split(':')[0]}</p>
                </div>

              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
