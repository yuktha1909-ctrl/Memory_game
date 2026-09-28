import React from 'react';

/**
 * Top Navigation & In-Game Control Bar
 */
export function Navbar({
  currentView,
  levelNumber,
  mode,
  moves,
  matches,
  totalPairs,
  score,
  formattedTime,
  isPaused,
  soundEnabled,
  onToggleSound,
  onTogglePause,
  onRestart,
  onHome,
  onOpenHowToPlay,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenLevelSelect
}) {
  const isPlayingGame = currentView === 'game';

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand / Logo */}
        <div className="brand-group" onClick={onHome} role="button" tabIndex={0}>
          <div className="logo-badge">
            <span className="logo-sparkle">✦</span>
            <div className="logo-icon">🎴</div>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">
              MEMORY <span className="highlight-text">MATCH</span>
            </h1>
            <p className="brand-subtitle">Train your brain. Beat your best.</p>
          </div>
        </div>

        {/* In-Game Live HUD */}
        {isPlayingGame && (
          <div className="game-hud" aria-label="Game Progress">
            <div className="hud-pill level-pill" onClick={onOpenLevelSelect} title="Change Level">
              <span className="hud-icon">🎯</span>
              <span className="hud-label">Lv {levelNumber}</span>
              <span className="hud-mode-sub">({mode === 'free_play' ? 'Free' : 'Campaign'})</span>
            </div>

            <div className="hud-pill timer-pill">
              <span className="hud-icon">⏱️</span>
              <span className="hud-value timer-text">{formattedTime}</span>
            </div>

            <div className="hud-pill moves-pill">
              <span className="hud-icon">🔄</span>
              <span className="hud-label">Moves:</span>
              <span className="hud-value">{moves}</span>
            </div>

            <div className="hud-pill matches-pill">
              <span className="hud-icon">🧩</span>
              <span className="hud-label">Pairs:</span>
              <span className="hud-value">{matches}/{totalPairs}</span>
            </div>

            <div className="hud-pill score-pill">
              <span className="hud-icon">⚡</span>
              <span className="hud-label">Score:</span>
              <span className="hud-value text-accent">{score}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="header-actions">
          {isPlayingGame && (
            <>
              <button
                className={`icon-btn ${isPaused ? 'btn-paused' : ''}`}
                onClick={onTogglePause}
                title={isPaused ? 'Resume Game' : 'Pause Game'}
                aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
              >
                {isPaused ? '▶️' : '⏸️'}
              </button>

              <button
                className="icon-btn"
                onClick={onRestart}
                title="Restart Game"
                aria-label="Restart Game"
              >
                🔄
              </button>

              <button
                className="icon-btn"
                onClick={onHome}
                title="Return to Home"
                aria-label="Return to Home"
              >
                🏠
              </button>
            </>
          )}

          <button
            className={`icon-btn ${soundEnabled ? 'sound-active' : 'sound-muted'}`}
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            aria-label={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {!isPlayingGame && (
            <>
              <button
                className="icon-btn"
                onClick={onOpenHowToPlay}
                title="How to Play"
                aria-label="How to Play"
              >
                ❓
              </button>

              <button
                className="icon-btn"
                onClick={onOpenLeaderboard}
                title="Local Leaderboard"
                aria-label="Local Leaderboard"
              >
                🏆
              </button>

              <button
                className="icon-btn"
                onClick={onOpenSettings}
                title="Settings"
                aria-label="Settings"
              >
                ⚙️
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
