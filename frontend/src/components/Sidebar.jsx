import React, { useState } from 'react';

/**
 * Sidebar Component
 * Left-side navigation bar with cyber blue theme, collapsible toggle,
 * user profile card, theme switcher, and streamlined multi-page routing.
 */
export default function Sidebar({
  currentPage = 'home',
  navigate,
  user,
  onSignOut,
  darkMode = true,
  onToggleTheme
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const mainWorkspaceItems = [
    { id: 'home', label: 'Text to ASL Studio', icon: '📝', tag: 'AnimateDiff' },
    { id: 'speech', label: 'Speech to ASL (Rainbow)', icon: '🎤', tag: 'AnimateDiff' }
  ];

  const linguisticsItems = [
    { id: 'linguistics', label: 'Rainbow Grammar & NMM', icon: '🌈', tag: 'Syntax' },
    { id: 'dictionary', label: 'ASL 3D Dictionary', icon: '📚', tag: 'Library' },
    { id: 'avatars', label: 'Cartoon Avatars', icon: '👥', tag: 'Wardrobe' }
  ];

  const preferencesItems = [
    { id: 'analytics', label: 'Rainbow Analytics', icon: '📊', tag: 'Metrics' },
    { id: 'presentation', label: 'Classroom Mode', icon: '🎓', tag: 'Fullscreen' },
    { id: 'settings', label: 'Blue Theme & Options', icon: '⚙️', tag: 'Setup' }
  ];

  return (
    <aside className={`app-sidebar-blue ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main Navigation Sidebar">
      {/* Sidebar Header with Brand & Collapse Toggle */}
      <div className="sidebar-top-header">
        <div
          className="sidebar-brand-group"
          onClick={() => navigate('home')}
          style={{ cursor: 'pointer' }}
          title="ASL Bridge Studio"
        >
          <div className="cyber-brand-badge">
            <span>ASL</span>
          </div>
          {!isCollapsed && (
            <div className="brand-text-group">
              <h3>ASL Bridge</h3>
              <span className="brand-badge-tag">3D CONTINUOUS MOTION</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-collapse-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav-list">
        {!isCollapsed && <span className="nav-section-title">MAIN WORKSPACE (ANIMATEDIFF)</span>}
        {mainWorkspaceItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav-btn ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
            {!isCollapsed && <span className="nav-tag">{item.tag}</span>}
          </button>
        ))}

        {!isCollapsed && <span className="nav-section-title">LINGUISTICS & ASSETS</span>}
        {linguisticsItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav-btn ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
            {!isCollapsed && <span className="nav-tag">{item.tag}</span>}
          </button>
        ))}

        {!isCollapsed && <span className="nav-section-title">PREFERENCES & TOOLS</span>}
        {preferencesItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav-btn ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
            {!isCollapsed && <span className="nav-tag">{item.tag}</span>}
          </button>
        ))}
      </nav>

      {/* Theme Switcher in Left Sidebar */}
      <div className="sidebar-theme-row">
        <button
          type="button"
          className="sidebar-theme-toggle-btn"
          onClick={onToggleTheme}
          title="Toggle Theme Mode"
        >
          <span className="theme-icon">{darkMode ? '🌙' : '☀️'}</span>
          {!isCollapsed && (
            <span>{darkMode ? 'Cyber Blue Theme' : 'Light Blue Theme'}</span>
          )}
        </button>
      </div>

      {/* User Profile Card (Shows User Info when signed in) */}
      <div className="sidebar-profile-card">
        <div
          className="profile-summary-row"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{ cursor: 'pointer' }}
        >
          <div className="profile-avatar-circle">
            <span className="avatar-initials">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'JK'}
            </span>
            <span className="profile-online-dot"></span>
          </div>

          {!isCollapsed && (
            <div className="profile-text-info">
              <strong className="profile-name">{user?.name || 'Jashwan Karan'}</strong>
              <span className="profile-badge-pro">PRO SIGNER</span>
            </div>
          )}

          {!isCollapsed && (
            <button
              type="button"
              className="profile-menu-chevron"
              title="Profile Options"
            >
              ⚙️
            </button>
          )}
        </div>

        {/* Profile Popover / Dropdown Actions */}
        {showProfileMenu && !isCollapsed && (
          <div className="profile-dropdown-menu">
            <div className="dropdown-user-email">
              <small>{user?.email || 'jashwan@aslbridge.ai'}</small>
            </div>
            <button
              type="button"
              className="dropdown-action-btn"
              onClick={() => {
                navigate('settings');
                setShowProfileMenu(false);
              }}
            >
              👤 Account Settings
            </button>
            <button
              type="button"
              className="dropdown-action-btn logout-action"
              onClick={() => {
                setShowProfileMenu(false);
                onSignOut && onSignOut();
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
