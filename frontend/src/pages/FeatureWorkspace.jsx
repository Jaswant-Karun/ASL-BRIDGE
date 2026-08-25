import React, { useState } from 'react';

const FEATURE_CONFIG = {
  training: {
    kicker: 'LEARNING LAB', title: 'Finger Training Lab', description: 'Practice individual handshapes and build confidence with the articulated avatar.', icon: '✋', action: 'Open Avatar Training Lab', target: 'avatars',
    metrics: [['Lessons', '26'], ['Tracked joints', '25'], ['Progress', '68%']], steps: ['Choose a letter from the dictionary', 'Watch the avatar pose each finger', 'Repeat the shape and review your accuracy'], actions: [['Browse alphabet', 'dictionary'], ['Open avatar rig', 'avatars'], ['Start camera practice', 'camera'], ['Review progress', 'profile']]
  },
  realtime: {
    kicker: 'LIVE MONITOR', title: 'Real-time Sign Monitor', description: 'Keep a live view of recognition status, model confidence, and avatar response.', icon: '⚡', action: 'Open Live Camera ASL', target: 'camera',
    metrics: [['Input', 'Camera'], ['Mode', 'Landmarks'], ['Latency', 'Live']], steps: ['Enable your camera', 'Place your signing hand in frame', 'Review the recognized result and confidence'], actions: [['Turn on camera', 'camera'], ['Record a gesture', 'capture'], ['Open gesture audit', 'audit'], ['View analytics', 'analytics']]
  },
  accessibility: {
    kicker: 'ACCESSIBILITY', title: 'Accessibility Tools', description: 'Configure readable captions, motion pacing, contrast, and audio support for your signing workflow.', icon: '♿', action: 'Open Settings', target: 'settings',
    metrics: [['Captions', 'Ready'], ['Contrast', 'Adjustable'], ['Motion', 'Adjustable']], steps: ['Choose a comfortable theme', 'Adjust playback and caption preferences', 'Return to the studio with your settings saved'], actions: [['Theme and playback', 'settings'], ['Caption practice', 'home'], ['Camera accessibility', 'camera'], ['Profile preferences', 'profile']]
  },
  translate: {
    kicker: 'LANGUAGE WORKSPACE', title: 'Translator Console', description: 'Send natural English text through ASL grammar, gloss, and avatar motion generation.', icon: '🔄', action: 'Open Text to ASL Studio', target: 'home',
    metrics: [['Grammar', 'ASL-aware'], ['Gloss', 'Dynamic'], ['Avatar', '3D']], steps: ['Enter a sentence', 'Review the ASL-oriented gloss', 'Play the generated avatar motion'], actions: [['Write translation', 'home'], ['Use speech input', 'speech'], ['Check grammar', 'linguistics'], ['Browse signs', 'dictionary']]
  },
  audit: {
    kicker: 'QUALITY REVIEW', title: 'Gesture Audit', description: 'Review translation output, unsupported tokens, motion coverage, and recent performance signals.', icon: '✅', action: 'Open Analytics', target: 'analytics',
    metrics: [['Coverage', 'Tracked'], ['Motion', '60 FPS'], ['Review', 'Ready']], steps: ['Run a translation from the studio', 'Inspect gloss and motion units', 'Use analytics to compare recent runs'], actions: [['Run translation', 'home'], ['Check motion', 'avatars'], ['View performance', 'analytics'], ['Add feedback', 'feedback']]
  },
  coach: {
    kicker: 'PRACTICE MODE', title: 'ASL Coach', description: 'Build a repeatable practice routine from dictionary signs and manual alphabet exercises.', icon: '🏆', action: 'Open ASL Dictionary', target: 'dictionary',
    metrics: [['Vocabulary', '36 classes'], ['Practice', 'Self-paced'], ['Feedback', 'Visual']], steps: ['Select a sign or letter', 'Study the handshape description', 'Replay the 3D movement until it feels natural'], actions: [['Open dictionary', 'dictionary'], ['Practice fingerspelling', 'training'], ['Try camera recall', 'camera'], ['Save progress', 'profile']]
  },
  story: {
    kicker: 'NARRATIVE STUDIO', title: 'Storytelling Mode', description: 'Turn a story or dialogue into a sequence that can be reviewed and performed by the avatar.', icon: '📖', action: 'Open Text to ASL Studio', target: 'home',
    metrics: [['Input', 'Free text'], ['Sequence', 'Continuous'], ['Output', 'Avatar']], steps: ['Write or paste a story', 'Check the generated sequence', 'Play it in the avatar studio'], actions: [['Start story', 'home'], ['Add presentation scenes', 'presentation'], ['Review grammar', 'linguistics'], ['Save feedback', 'feedback']]
  },
  classroom: {
    kicker: 'TEACHING SPACE', title: 'Classroom Mode', description: 'Present slide content line by line with readable gloss and sequential avatar signing.', icon: '🎓', action: 'Open PPT to ASL Flow', target: 'presentation',
    metrics: [['Slides', 'Line-aware'], ['Playback', 'Sequential'], ['Output', '3D avatar']], steps: ['Upload a .pptx file', 'Select a slide line', 'Play lines sequentially for the class'], actions: [['Upload presentation', 'presentation'], ['Full-screen class view', 'presentation'], ['Open dictionary', 'dictionary'], ['Accessibility settings', 'accessibility']]
  },
  feedback: {
    kicker: 'IMPROVEMENT LOOP', title: 'Feedback Loop', description: 'Capture notes about recognition, translation quality, and avatar timing for the next practice session.', icon: '💬', action: 'Open Profile & Progress', target: 'profile',
    metrics: [['Notes', 'Personal'], ['Progress', 'Saved'], ['Review', 'Anytime']], steps: ['Record what felt unclear', 'Compare your next attempt', 'Use progress to guide practice'], actions: [['View profile', 'profile'], ['Practice again', 'coach'], ['Run gesture audit', 'audit'], ['Check analytics', 'analytics']]
  },
  capture: {
    kicker: 'CAPTURE STUDIO', title: 'Gesture Capture', description: 'Capture a camera moment for recognition review and compare it with the avatar response.', icon: '📸', action: 'Open Live Camera ASL', target: 'camera',
    metrics: [['Source', 'Webcam'], ['Review', 'Landmarks'], ['Export', 'Recording']], steps: ['Turn on the camera', 'Hold a gesture in the signing space', 'Review model output and confidence'], actions: [['Open camera', 'camera'], ['Record session', 'camera'], ['Review recognition', 'audit'], ['Open coach', 'coach']]
  },
  maps: {
    kicker: 'DISCOVERY TOOLS', title: 'ASL Maps & Resources', description: 'Find ASL learning resources, community locations, accessibility services, and practice destinations.', icon: '🗺️', action: 'Open ASL Maps', target: 'maps',
    metrics: [['Resource type', 'ASL'], ['Search', 'Map + list'], ['Access', 'Location-ready']], steps: ['Choose a resource category', 'Search or use your location', 'Open a destination and plan your visit'], actions: [['Open map', 'maps'], ['Find nearby resources', 'maps'], ['Check accessibility', 'accessibility'], ['Share feedback', 'feedback']]
  }
};

export default function FeatureWorkspace({ feature, navigate }) {
  const config = FEATURE_CONFIG[feature] || FEATURE_CONFIG.translate;
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  return (
    <div className="feature-workspace-page">
      <header className="feature-hero">
        <div className="feature-hero-icon" aria-hidden="true">{config.icon}</div>
        <div>
          <p className="eyebrow">{config.kicker}</p>
          <h1>{config.title}</h1>
          <p className="dashboard-intro">{config.description}</p>
        </div>
      </header>

      <section className="feature-metric-grid">
        {config.metrics.map(([label, value]) => <div className="feature-metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </section>

      <div className="feature-content-grid">
        <section className="feature-panel">
          <p className="panel-kicker">WORKFLOW</p>
          <h2>Make this feature part of your next signing session</h2>
          <div className="feature-step-list">
            {config.steps.map((step, index) => <div className="feature-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></div>)}
          </div>
          <button type="button" className="feature-primary-action" onClick={() => navigate(config.target)}>{config.action} →</button>
          <div className="feature-action-grid">
            {config.actions.map(([label, target]) => <button type="button" key={`${label}-${target}`} onClick={() => navigate(target)}>{label} <span>→</span></button>)}
          </div>
        </section>

        <section className="feature-panel feature-note-panel">
          <p className="panel-kicker">SESSION NOTE</p>
          <h2>Keep a note for your next review</h2>
          <textarea value={note} onChange={(event) => { setNote(event.target.value); setSaved(false); }} placeholder="Write a short practice or review note..." rows="6" />
          <button type="button" className="feature-secondary-action" onClick={() => setSaved(true)} disabled={!note.trim()}>{saved ? 'Note saved for this session' : 'Save session note'}</button>
        </section>
      </div>
    </div>
  );
}
