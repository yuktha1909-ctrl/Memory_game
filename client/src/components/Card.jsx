import React from 'react';

/**
 * Premium 3D Flippable Memory Card with glassmorphism, glowing accents, and keyboard accessibility
 */
export function Card({
  card,
  index,
  isFlipped,
  isMatched,
  isLocked,
  isMismatch,
  onClick
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(index);
    }
  };

  const cardStatus = isMatched ? 'matched' : isFlipped ? 'flipped' : 'hidden';

  return (
    <div
      className={`memory-card ${isFlipped || isMatched ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''} ${isMismatch ? 'is-mismatch' : ''}`}
      role="button"
      tabIndex={isMatched ? -1 : 0}
      aria-label={`Card ${index + 1}: ${isFlipped || isMatched ? card.label : 'Hidden card'}`}
      aria-pressed={isFlipped || isMatched}
      onClick={() => onClick(index)}
      onKeyDown={handleKeyDown}
      style={{
        '--card-glow': card.glow,
        '--card-accent': card.color
      }}
    >
      <div className="card-inner">
        {/* Card Back (Hidden state) */}
        <div className="card-face card-back">
          <div className="card-back-pattern">
            <div className="cyber-circle"></div>
            <span className="card-logo-icon">✦</span>
          </div>
          <div className="card-back-shimmer"></div>
        </div>

        {/* Card Front (Revealed state) */}
        <div
          className="card-face card-front"
          style={{ borderColor: card.color, boxShadow: `0 0 20px ${card.glow}` }}
        >
          <div className="card-front-content">
            <span className="card-symbol" role="img" aria-label={card.label}>
              {card.symbol}
            </span>
            <span className="card-label" style={{ color: card.color }}>
              {card.label}
            </span>
          </div>
          {isMatched && (
            <div className="matched-badge" aria-hidden="true">
              ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
