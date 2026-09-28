import React from 'react';
import { LEVELS } from '../utils/levels';

export function LevelSelectModal({
  isOpen,
  onClose,
  progress = [],
  currentLevel = 1,
  mode = 'campaign',
  onSelectLevel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Select Level">
      <div className="modal-card modal-large">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-title-icon">🗺️</span>
            <div>
              <h2>Select Level</h2>
              <p className="modal-subtitle">
                {mode === 'campaign'
                  ? 'Campaign Mode: Complete each tier to unlock the next challenge'
                  : 'Free Play Mode: Jump directly into any layout'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="level-grid">
            {LEVELS.map((lvl) => {
              const prog = progress.find(p => p.level_number === lvl.level);
              // In free play, all levels can be selected; in campaign, only unlocked
              const isUnlocked = mode === 'free_play' || (prog ? Boolean(prog.unlocked) : lvl.level === 1);
              const stars = prog ? prog.stars : 0;
              const isCurrent = lvl.level === currentLevel;

              return (
                <div
                  key={lvl.level}
                  className={`level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'active-level' : ''}`}
                  onClick={() => {
                    if (isUnlocked) {
                      onSelectLevel(lvl.level);
                      onClose();
                    }
                  }}
                  role="button"
                  tabIndex={isUnlocked ? 0 : -1}
                  aria-disabled={!isUnlocked}
                >
                  <div className="level-card-header">
                    <span className="level-badge">Level {lvl.level}</span>
                    <span className={`diff-tag ${lvl.difficulty.toLowerCase()}`}>
                      {lvl.difficulty}
                    </span>
                  </div>

                  <h3 className="level-name">{lvl.name}</h3>

                  <div className="level-specs">
                    <span className="spec-item">📐 {lvl.rows} × {lvl.cols}</span>
                    <span className="spec-item">🧩 {lvl.pairs} Pairs</span>
                  </div>

                  <div className="level-stars" aria-label={`${stars} out of 3 stars`}>
                    {[1, 2, 3].map((starIndex) => (
                      <span
                        key={starIndex}
                        className={`star-icon ${starIndex <= stars ? 'star-filled' : 'star-empty'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {prog && prog.best_score > 0 && (
                    <div className="level-best-meta">
                      <span>Best: {prog.best_score} pts</span>
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="locked-overlay">
                      <span className="lock-icon">🔒</span>
                      <span className="lock-text">Locked</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
