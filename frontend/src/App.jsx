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
import FeatureWorkspace from './pages/FeatureWorkspace';
import MapsPage from './pages/MapsPage';
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
      case 'training':
        return <FeatureWorkspace feature="training" navigate={setPage} />;
      case 'realtime':
        return <FeatureWorkspace feature="realtime" navigate={setPage} />;
      case 'accessibility':
        return <FeatureWorkspace feature="accessibility" navigate={setPage} />;
      case 'translate':
        return <FeatureWorkspace feature="translate" navigate={setPage} />;
      case 'audit':
        return <FeatureWorkspace feature="audit" navigate={setPage} />;
      case 'coach':
        return <FeatureWorkspace feature="coach" navigate={setPage} />;
      case 'story':
        return <FeatureWorkspace feature="story" navigate={setPage} />;
      case 'classroom':
        return <FeatureWorkspace feature="classroom" navigate={setPage} />;
      case 'feedback':
        return <FeatureWorkspace feature="feedback" navigate={setPage} />;
      case 'capture':
        return <FeatureWorkspace feature="capture" navigate={setPage} />;
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
