import React, { useMemo } from 'react';
import { dateKeyFromOffset, getEngagement, getStreakStats, getMonthlyStats } from '../utils/engagementTracker';

export default function ProfilePage({ user }) {
  const displayName = user?.name || 'Studio Member';
  const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const engagement = useMemo(() => getEngagement(user), [user]);
  const { currentStreak, longestStreak } = getStreakStats(engagement);
  const monthly = getMonthlyStats(engagement);
  const calendarDays = Array.from({ length: 28 }, (_, index) => {
    const key = dateKeyFromOffset(27 - index);
    return { key, activity: engagement.days[key] || null };
  });
  const level = Math.floor(engagement.totalXp / 100) + 1;
  const levelProgress = engagement.totalXp % 100;

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

      <section className="engagement-dashboard">
        <div className="engagement-header">
          <div>
            <span className="rainbow-kicker">YOUR SIGNING JOURNEY</span>
            <h3>Streaks, XP, and practice consistency</h3>
          </div>
          <div className="xp-level-badge"><strong>LEVEL {level}</strong><span>{engagement.totalXp} XP</span></div>
        </div>

        <div className="engagement-stat-grid">
          <div><span>Current streak</span><strong>{currentStreak} days</strong><small>Keep using ASL Bridge daily</small></div>
          <div><span>Longest streak</span><strong>{longestStreak} days</strong><small>Your best run so far</small></div>
          <div><span>Sessions</span><strong>{engagement.totalSessions}</strong><small>Feature visits recorded</small></div>
          <div><span>Next level</span><strong>{100 - levelProgress} XP</strong><small>{levelProgress}% progress</small></div>
        </div>

        <div className="xp-progress-track" aria-label={`${levelProgress}% to next level`}><span style={{ width: `${levelProgress}%` }} /></div>

        <div className="monthly-xp-panel">
          <div className="monthly-xp-heading"><div><span className="rainbow-kicker">MONTHLY CHALLENGE</span><h4>Monthly XP limit</h4></div><strong>{monthly.xp} / {monthly.limit} XP</strong></div>
          <div className="monthly-xp-track"><span style={{ width: `${Math.min(100, (monthly.xp / monthly.limit) * 100)}%` }} /></div>
          <p>{monthly.capped ? 'Monthly limit reached. Your unique badge has been awarded!' : `${monthly.remaining} XP remaining this month. Reach 500 XP to unlock your monthly badge.`}</p>
        </div>

        <div className="badge-shelf">
          <div className="calendar-title-row"><h4>Achievement badges</h4><span>{engagement.badges.length} earned</span></div>
          {engagement.badges.length > 0 ? <div className="badge-list">{engagement.badges.slice().reverse().map((badge) => <div className="achievement-badge" key={badge.id}><span>★</span><div><strong>Monthly Master</strong><small>Month of {badge.month || badge.week}</small></div></div>)}</div> : <p className="empty-badge-message">Complete the monthly XP challenge to earn your first unique badge.</p>}
        </div>

        <div className="calendar-section">
          <div className="calendar-title-row"><h4>Activity calendar</h4><span>Last 28 days</span></div>
          <div className="activity-calendar" aria-label="ASL Bridge activity calendar">
            {calendarDays.map((day) => <div key={day.key} className={`activity-day activity-${Math.min(4, day.activity?.visits || 0)}`} title={`${day.key}: ${day.activity ? `${day.activity.visits} session${day.activity.visits === 1 ? '' : 's'}` : 'No sessions'}`} />)}
          </div>
          <div className="calendar-legend"><span>Less</span><i className="activity-0" /><i className="activity-1" /><i className="activity-2" /><i className="activity-3" /><i className="activity-4" /><span>More</span></div>
        </div>
      </section>
    </div>
  );
}
