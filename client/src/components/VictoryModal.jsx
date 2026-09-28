import React, { useEffect } from 'react';
import { fireConfetti } from '../utils/confetti';

export function VictoryModal({
  isOpen,
  levelNumber,
  score,
  stars,
  moves,
  durationSeconds,
  breakdown,
  unlockedNextLevel,
  isMaxLevel,
  onNextLevel,
  onReplay,
  onHome
}) {
  useEffect(() => {
    if (isOpen) {
      const cleanup = fireConfetti(2200);
      return cleanup;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="modal-backdrop victory-backdrop" role="dialog" aria-modal="true" aria-label="Victory">
      <div className="modal-card victory-card">
        {/* Animated Trophy Banner */}
        <div className="victory-badge-wrapper">
          <div className="victory-icon-glow">
            <span className="trophy-emoji">🏆</span>
          </div>
          <h2 className="victory-title">LEVEL {levelNumber} CLEARED!</h2>
          <p className="victory-subtitle">Outstanding Recall & Precision!</p>
        </div>

        {/* 3-Star Rating Animation */}
        <div className="victory-stars" aria-label={`Earned ${stars} of 3 stars`}>
          {[1, 2, 3].map((starIndex) => (
            <span
              key={starIndex}
              className={`victory-star ${starIndex <= stars ? 'earned' : 'unearned'}`}
              style={{ animationDelay: `${starIndex * 0.25}s` }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Primary Metrics Grid */}
        <div className="victory-stats-grid">
          <div className="victory-stat-item">
            <span className="v-label">Final Score</span>
            <span className="v-value highlight-score">{score?.toLocaleString() || 0}</span>
          </div>
          <div className="victory-stat-item">
            <span className="v-label">Time Taken</span>
            <span className="v-value">{formatTime(durationSeconds || 0)}</span>
          </div>
          <div className="victory-stat-item">
            <span className="v-label">Total Moves</span>
            <span className="v-value">{moves || 0}</span>
          </div>
        </div>

        {/* Detailed Deterministic Breakdown */}
        {breakdown && (
          <div className="breakdown-card">
            <h4 className="breakdown-title">Score Breakdown</h4>
            <div className="breakdown-row">
              <span>Base Pair Matches</span>
              <span className="breakdown-val">+{breakdown.baseScore || 0}</span>
            </div>
            <div className="breakdown-row">
              <span>Speed / Time Bonus</span>
              <span className="breakdown-val text-cyan">+{breakdown.timeBonus || 0}</span>
            </div>
            <div className="breakdown-row">
              <span>Move Accuracy Bonus</span>
              <span className="breakdown-val text-emerald">+{breakdown.moveBonus || 0}</span>
            </div>
          </div>
        )}

        {unlockedNextLevel && (
          <div className="unlock-alert">
            <span className="unlock-icon">🔓</span>
            <span>Level {levelNumber + 1} Unlocked!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="victory-actions">
          <button className="btn btn-secondary" onClick={onHome}>
            🏠 Home
          </button>
          <button className="btn btn-secondary" onClick={onReplay}>
            🔄 Replay
          </button>
          <button
            className="btn btn-primary btn-large glow-btn"
            onClick={onNextLevel}
            disabled={isMaxLevel}
            title={isMaxLevel ? 'All 10 levels completed!' : 'Proceed to next level'}
          >
            {isMaxLevel ? '🎉 Campaign Mastered!' : 'Next Level ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}
