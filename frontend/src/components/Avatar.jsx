import React from 'react';

export default function Avatar({
  avatar = {
    id: 'sarah',
    name: 'Sarah',
    role: 'Studio ASL Interpreter',
    badge: 'Photorealistic',
    avatarImage: '/assets/avatars/sarah.png',
    accentColor: '#e26d4d'
  },
  isSigning = false,
  size = 'medium'
}) {
  const sizeClasses = {
    small: 'avatar-badge-sm',
    medium: 'avatar-badge-md',
    large: 'avatar-badge-lg'
  };

  return (
    <div className={`asl-avatar-widget ${sizeClasses[size] || 'avatar-badge-md'}`} aria-label={`${avatar.name} ASL avatar`}>
      <div className="avatar-portrait-wrap" style={{ borderColor: avatar.accentColor }}>
        <img src={avatar.avatarImage || '/assets/avatars/sarah.png'} alt={avatar.name} className="avatar-portrait-img" />
        {isSigning && <span className="signing-pulse-indicator" style={{ backgroundColor: avatar.accentColor }}></span>}
      </div>
      <div className="avatar-meta">
        <strong className="avatar-name">{avatar.name}</strong>
        <span className="avatar-role">{avatar.role || 'ASL Interpreter'}</span>
      </div>
    </div>
  );
}
