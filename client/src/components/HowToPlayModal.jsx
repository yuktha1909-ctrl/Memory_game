import React from 'react';

export function HowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="How to Play">
      <div className="modal-card modal-medium">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-title-icon">📖</span>
            <h2>How to Play MEMORY MATCH</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body instructions-content">
          <div className="instruction-step">
            <div className="step-badge">1</div>
            <div className="step-text">
              <h3>Flip Cards</h3>
              <p>Click or tap any card to reveal its secret symbol. You can also use keyboard <strong>Tab</strong> to navigate and <strong>Space / Enter</strong> to flip.</p>
            </div>
          </div>

          <div className="instruction-step">
            <div className="step-badge">2</div>
            <div className="step-text">
              <h3>Find Pairs</h3>
              <p>Flip a second card. If the symbols match, they stay face up with a victory glow! If they differ, they flip back after a brief pause.</p>
            </div>
          </div>

          <div className="instruction-step">
            <div className="step-badge">3</div>
            <div className="step-text">
              <h3>Maximize Your Score</h3>
              <p>Points are awarded based on speed and move efficiency. Finish under target time and make fewer mistakes to earn bonus points and up to <strong>3 Stars</strong>!</p>
            </div>
          </div>

          <div className="instruction-step">
            <div className="step-badge">4</div>
            <div className="step-text">
              <h3>Progress Through 10 Levels</h3>
              <p>Conquer progressively larger grids starting from 2×2 up to the gigantic 6×7 arena (42 cards). All progress is saved automatically in your local database.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary btn-block" onClick={onClose}>
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
}
