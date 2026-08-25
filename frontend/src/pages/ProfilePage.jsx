import React from 'react';

export default function ProfilePage({ user }) {
  const displayName = user?.name || 'Studio Member';
  const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="profile-page">
      <header className="page-header-banner">
        <div className="banner-left">
          <span className="rainbow-kicker">ACCOUNT IDENTITY</span>
          <h2>Your ASL Bridge profile</h2>
          <p>Your personal identity for saved signing sessions and classroom access.</p>
        </div>
      </header>

      <section className="profile-hero-card">
        <div className="profile-large-avatar">{initials || 'S'}</div>
        <div>
          <span className="profile-badge-pro">ACTIVE SIGNER</span>
          <h3>{displayName}</h3>
          <p>{user?.email || 'Guest mode'}</p>
        </div>
      </section>

      <section className="profile-details-grid">
        <div className="settings-card">
          <span className="rainbow-kicker">PUBLIC USERNAME</span>
          <strong className="profile-detail-value">@{user?.username || 'studio_guest'}</strong>
          <p>This username is generated once and stays unique to your account.</p>
        </div>
        <div className="settings-card">
          <span className="rainbow-kicker">PERSONAL ACCESS ID</span>
          <strong className="profile-detail-value">{user?.publicId || 'guest-session'}</strong>
          <p>Use this ID when connecting your personal account to this project.</p>
        </div>
      </section>
    </div>
  );
}
