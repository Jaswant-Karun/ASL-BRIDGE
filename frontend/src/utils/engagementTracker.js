const STORAGE_PREFIX = 'asl-bridge-engagement:';

function storageKey(user) {
  return `${STORAGE_PREFIX}${user?.publicId || user?.email || user?.username || 'guest-session'}`;
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function emptyRecord() {
  return { totalXp: 0, totalSessions: 0, lastVisit: '', days: {} };
}

export function getEngagement(user) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(user)) || 'null');
    return { ...emptyRecord(), ...(saved || {}) };
  } catch {
    return emptyRecord();
  }
}

export function recordEngagement(user) {
  const record = getEngagement(user);
  const date = todayKey();
  const previous = record.days[date] || { visits: 0, xp: 0 };
  const dailyBonus = previous.visits === 0 ? 20 : 0;
  const eventXp = 5;
  const next = {
    ...record,
    totalXp: record.totalXp + eventXp + dailyBonus,
    totalSessions: record.totalSessions + 1,
    lastVisit: date,
    days: { ...record.days, [date]: { visits: previous.visits + 1, xp: previous.xp + eventXp + dailyBonus } }
  };
  localStorage.setItem(storageKey(user), JSON.stringify(next));
  return next;
}

export function dateKeyFromOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return todayKey(date);
}

export function getStreakStats(record) {
  let currentStreak = 0;
  while (record.days[dateKeyFromOffset(currentStreak)]) currentStreak += 1;
  let longestStreak = 0;
  let running = 0;
  for (let offset = Object.keys(record.days).length + 365; offset >= 0; offset -= 1) {
    if (record.days[dateKeyFromOffset(offset)]) running += 1;
    else running = 0;
    longestStreak = Math.max(longestStreak, running);
  }
  return { currentStreak, longestStreak };
}

export { todayKey };
