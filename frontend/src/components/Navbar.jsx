export default function Navbar({ navigate, darkMode, onToggleTheme }) {
  return (
    <nav aria-label="Main navigation">
      <strong>ASL Bridge</strong>
      <button type="button" onClick={() => navigate?.('home')}>Text</button>
      <button type="button" onClick={() => navigate?.('live')}>Live</button>
      <button type="button" onClick={() => navigate?.('presentation')}>Presentation</button>
      <button type="button" onClick={() => navigate?.('about')}>About</button>
      <button type="button" onClick={() => navigate?.('signup')}>Sign up</button>
      <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label="Toggle color theme">{darkMode ? '☼' : '◐'}</button>
    </nav>
  );
}
