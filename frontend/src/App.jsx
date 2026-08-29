import React, { useCallback, useState } from 'react';
import Sidebar from './components/Sidebar';
import LoadingPage from './pages/LoadingPage';
import Signup from './pages/Signup';

import Home from './pages/Home';
import SpeechStudio from './pages/SpeechStudio';
import LinguisticsPage from './pages/LinguisticsPage';
import DictionaryPage from './pages/DictionaryPage';
import AvatarCustomizerPage from './pages/AvatarCustomizerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PresentationMode from './pages/PresentationMode';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import About from './pages/About';
import CameraMode from './pages/CameraMode';
import MapsPage from './pages/MapsPage';

// ── New fully-built feature pages ──────────────────────────────────────
import FingerTrainingLab  from './pages/FingerTrainingLab';
import RealtimeSignMonitor from './pages/RealtimeSignMonitor';
import AccessibilityTools from './pages/AccessibilityTools';
import TranslatorConsole  from './pages/TranslatorConsole';
import GestureAudit       from './pages/GestureAudit';
import ASLCoach           from './pages/ASLCoach';
import StorytellingMode   from './pages/StorytellingMode';
import ClassroomMode      from './pages/ClassroomMode';
import FeedbackLoop       from './pages/FeedbackLoop';
import GestureCapture     from './pages/GestureCapture';
import AvatarDesignerPage from './pages/AvatarDesignerPage';

import { recordEngagement } from './utils/engagementTracker';

export default function App() {
  const [stage, setStage] = useState('loading'); // 'loading' | 'auth' | 'dashboard'
  const [page, setPage] = useState('home');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('asl-theme') !== 'light');
  const [user, setUser] = useState({ name: 'Jashwan Karan', email: 'jashwan@aslbridge.ai' });

  const finishLoading = useCallback(() => setStage('auth'), []);

  const toggleTheme = () => {
    setDarkMode((val) => {
      const next = !val;
      localStorage.setItem('asl-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  React.useEffect(() => {
    if (stage === 'dashboard') recordEngagement(user);
  }, [stage, page, user]);

  if (stage === 'loading') {
    return <LoadingPage onComplete={finishLoading} />;
  }

  if (stage === 'auth') {
    return (
      <Signup
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onAuthenticated={(account) => {
          setUser(account);
          setStage('dashboard');
        }}
        onGuestMode={() => {
          setUser({ name: 'Studio Guest', email: 'guest@aslbridge.ai' });
          setStage('dashboard');
        }}
      />
    );
  }

  const renderCurrentPage = () => {
    switch (page) {
      case 'home':
        return <Home navigate={setPage} user={user} darkMode={darkMode} onToggleTheme={toggleTheme} />;
      case 'speech':
        return <SpeechStudio navigate={setPage} user={user} />;
      case 'linguistics':
        return <LinguisticsPage />;
      case 'dictionary':
        return <DictionaryPage />;
      case 'avatars':
        return <AvatarCustomizerPage />;
      case 'designer':
        return <AvatarDesignerPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'presentation':
        return <PresentationMode navigate={setPage} user={user} />;
      case 'camera':
        return <CameraMode />;
      case 'maps':
        return <MapsPage />;
      case 'settings':
        return <SettingsPage darkMode={darkMode} onToggleTheme={toggleTheme} />;
      case 'profile':
        return <ProfilePage user={user} />;
      case 'about':
        return <About navigate={setPage} />;
      case 'training':     return <FingerTrainingLab />;
      case 'realtime':     return <RealtimeSignMonitor />;
      case 'accessibility': return <AccessibilityTools />;
      case 'translate':    return <TranslatorConsole />;
      case 'audit':        return <GestureAudit />;
      case 'coach':        return <ASLCoach />;
      case 'story':        return <StorytellingMode />;
      case 'classroom':    return <ClassroomMode />;
      case 'feedback':     return <FeedbackLoop />;
      case 'capture':      return <GestureCapture />;
      default:
        return <Home navigate={setPage} user={user} darkMode={darkMode} onToggleTheme={toggleTheme} />;
    }
  };

  return (
    <div className={`app-root ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="app-layout-container">
        {/* Left Sidebar Navigation */}
        <Sidebar
          currentPage={page}
          navigate={setPage}
          user={user}
          onSignOut={() => setStage('auth')}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />

        {/* Main Dashboard Content Viewport */}
        <main className="app-main-viewport">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}
