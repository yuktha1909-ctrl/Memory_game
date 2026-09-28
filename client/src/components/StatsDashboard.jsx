import React from 'react';

/**
 * High-impact statistics dashboard for player achievements and records
 */
export function StatsDashboard({ stats }) {
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="stats-dashboard" aria-label="Player Statistics">
      <div className="stat-card">
        <div className="stat-icon-wrapper cyan-glow">
          <span className="stat-icon">🎮</span>
        </div>
        <div className="stat-meta">
          <span className="stat-label">Games Played</span>
          <span className="stat-value">{stats?.totalGames || 0}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper emerald-glow">
          <span className="stat-icon">🏆</span>
        </div>
        <div className="stat-meta">
          <span className="stat-label">Total Wins</span>
          <span className="stat-value">{stats?.totalWins || 0}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper amber-glow">
          <span className="stat-icon">⚡</span>
        </div>
        <div className="stat-meta">
          <span className="stat-label">Best Score</span>
          <span className="stat-value">
            {stats?.bestScore ? stats.bestScore.toLocaleString() : '0'}
          </span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper purple-glow">
          <span className="stat-icon">⏱️</span>
        </div>
        <div className="stat-meta">
          <span className="stat-label">Best Time</span>
          <span className="stat-value">{formatTime(stats?.bestTimeSeconds)}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper pink-glow">
          <span className="stat-icon">⭐</span>
        </div>
        <div className="stat-meta">
          <span className="stat-label">Stars Earned</span>
          <span className="stat-value">
            {stats?.totalStars || 0} <span className="stat-sub">/ 30</span>
          </span>
        </div>
      </div>
    </div>
  );
}
