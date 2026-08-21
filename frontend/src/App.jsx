import { useCallback, useState } from 'react';
import About from './pages/About';
import Home from './pages/Home';
import LiveTranslate from './pages/LiveTranslate';
import PresentationMode from './pages/PresentationMode';
import Signup from './pages/Signup';
import LoadingPage from './pages/LoadingPage';

export default function App() {
  const [stage, setStage] = useState('loading');
  const [page, setPage] = useState('home');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('asl-theme') === 'dark');
  const [user, setUser] = useState(null);
  const finishLoading = useCallback(() => setStage('auth'), []);
  function toggleTheme() { setDarkMode((value) => { const next = !value; localStorage.setItem('asl-theme', next ? 'dark' : 'light'); return next; }); }
  if (stage === 'loading') return <LoadingPage onComplete={finishLoading} />;
  if (stage === 'auth') return <Signup onAuthenticated={(account) => { setUser(account); setStage('dashboard'); }} darkMode={darkMode} onToggleTheme={toggleTheme} />;
  const pages = { home: Home, live: LiveTranslate, presentation: PresentationMode, about: About };
  const Page = pages[page] || Home;
  return <div className={darkMode ? 'app dark' : 'app'}><Page navigate={setPage} user={user} darkMode={darkMode} onToggleTheme={toggleTheme} /></div>;
}
