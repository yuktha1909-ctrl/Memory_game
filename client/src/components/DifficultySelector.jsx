import React from 'react';

/**
 * Modern difficulty segmented control
 */
export function DifficultySelector({ selected, onChange, disabled }) {
  const options = [
    { id: 'Easy', label: 'Easy', badge: 'Lv 1-3', desc: '4 to 8 cards' },
    { id: 'Medium', label: 'Medium', badge: 'Lv 4-7', desc: '12 to 24 cards' },
    { id: 'Hard', label: 'Hard', badge: 'Lv 8-10', desc: '30 to 42 cards' }
  ];

  return (
    <div className="difficulty-container" role="radiogroup" aria-label="Game Difficulty">
      <div className="difficulty-tabs">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              className={`difficulty-pill ${isSelected ? 'active ' + opt.id.toLowerCase() : ''}`}
              onClick={() => onChange(opt.id)}
            >
              <span className="diff-title">{opt.label}</span>
              <span className="diff-badge">{opt.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
