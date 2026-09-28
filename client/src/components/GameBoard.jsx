import React from 'react';
import { Card } from './Card';

/**
 * GameBoard component with responsive dynamic grid based on level dimensions
 */
export function GameBoard({
  cards,
  rows,
  cols,
  flippedIndices,
  matchedIds,
  isLocked,
  isPaused,
  onResume,
  onCardClick
}) {
  // Check if current 2 flipped cards are mismatched
  const isMismatch = isLocked && flippedIndices.length === 2;

  return (
    <div className="board-wrapper">
      <div
        className="game-board"
        style={{
          '--grid-rows': rows,
          '--grid-cols': cols
        }}
        data-rows={rows}
        data-cols={cols}
      >
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx);
          const isMatched = matchedIds.has(card.matchId);

          return (
            <Card
              key={card.uniqueId}
              card={card}
              index={idx}
              isFlipped={isFlipped}
              isMatched={isMatched}
              isLocked={isLocked}
              isMismatch={isMismatch && isFlipped}
              onClick={onCardClick}
            />
          );
        })}
      </div>

      {/* Paused Overlay */}
      {isPaused && (
        <div className="pause-overlay" role="dialog" aria-modal="true" aria-label="Game Paused">
          <div className="pause-card">
            <div className="pause-icon">⏸️</div>
            <h2>Game Paused</h2>
            <p>Take a breath. The clock is resting.</p>
            <button
              className="btn btn-primary btn-large glow-btn"
              onClick={onResume}
              autoFocus
            >
              Resume Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
