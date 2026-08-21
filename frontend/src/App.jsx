import { useState } from 'react';
import About from './pages/About';
import Home from './pages/Home';
import LiveTranslate from './pages/LiveTranslate';
import PresentationMode from './pages/PresentationMode';
import Signup from './pages/Signup';

export default function App() {
  const [page, setPage] = useState('home');
  const pages = { home: Home, live: LiveTranslate, presentation: PresentationMode, about: About, signup: Signup };
  const Page = pages[page] || Home;
  return <Page navigate={setPage} />;
}
