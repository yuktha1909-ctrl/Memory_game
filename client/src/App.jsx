import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { GameBoard } from './components/GameBoard';
import { StatsDashboard } from './components/StatsDashboard';
import { DifficultySelector } from './components/DifficultySelector';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';

import { useSound } from './hooks/useSound';
import { useTimer } from './hooks/useTimer';
import { useGameEngine } from './hooks/useGameEngine';
import { LEVELS, DIFFICULTY_PRESETS, getLevelConfig } from './utils/levels';
import { api } from './utils/api';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'game'
  const [gameMode, setGameMode] = useState('campaign'); // 'campaign' | 'free_play'
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');

  // Backend Persisted Data
  const [profile, setProfile] = useState({ sound_enabled: 1, animations_enabled: 1, theme: 'midnight' });
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Modals State
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });

  // Victory Result State
  const [victoryData, setVictoryData] = useState(null);

  // Sound Engine
  const soundEnabled = Boolean(profile.sound_enabled);
  const sound = useSound(soundEnabled);

  // Game Timer
  const timer = useTimer();

  // Load Initial Data from SQLite backend
  const loadInitialData = useCallback(async () => {
    try {
      const [profRes, progRes, statsRes] = await Promise.all([
        api.getProfile(),
        api.getProgress(),
        api.getStats()
      ]);
      if (profRes.profile) setProfile(profRes.profile);
      if (progRes.progress) setProgress(progRes.progress);
      if (statsRes.stats) setStats(statsRes.stats);

      // Auto-select highest unlocked level in campaign
      if (statsRes.stats?.highestUnlockedLevel) {
        setSelectedLevel(statsRes.stats.highestUnlockedLevel);
      }
    } catch (err) {
      console.error('Error connecting to backend:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Apply Theme & Animation Classes to Body
  useEffect(() => {
    document.body.className = `theme-${profile.theme || 'midnight'} ${profile.animations_enabled ? 'animations-on' : 'animations-off'}`;
  }, [profile.theme, profile.animations_enabled]);

  // Callback when first card is flipped in round
  const handleFirstFlip = useCallback(() => {
    timer.startTimer();
  }, [timer]);

  // Callback when all pairs are matched
  const handleGameWon = useCallback(async ({ levelNumber, mode, moves }) => {
    timer.stopTimer();
    const durationSeconds = Math.max(1, timer.elapsedSeconds);

    try {
      const res = await api.completeGame({
        sessionId: activeSessionId,
        levelNumber,
        mode,
        moves,
        durationSeconds
      });

      if (res.success) {
        setVictoryData({
          levelNumber,
          score: res.result.score,
          stars: res.result.stars,
          moves: res.result.moves,
          durationSeconds: res.result.durationSeconds,
          breakdown: res.result.breakdown,
          unlockedNextLevel: res.result.unlockedNextLevel
        });
        if (res.stats) setStats(res.stats);
        if (res.progress) setProgress(res.progress);
      }
    } catch (err) {
      console.error('Failed to submit game completion to backend:', err);
      // Fallback local calculation
      const config = getLevelConfig(levelNumber);
      const fallbackScore = Math.max(50, Math.round(config.pairs * 150 + Math.max(0, 300 - moves * 10)));
      setVictoryData({
        levelNumber,
        score: fallbackScore,
        stars: 2,
        moves,
        durationSeconds,
        breakdown: { baseScore: config.pairs * 150, timeBonus: 50, moveBonus: 50 },
        unlockedNextLevel: false
      });
    }

    setShowVictory(true);
  }, [timer, activeSessionId]);

  // Game Engine Hook
  const game = useGameEngine({
    levelNumber: selectedLevel,
    mode: gameMode,
    onGameWon: handleGameWon,
    onFirstFlip: handleFirstFlip,
    sound
  });

  // Start Playing Game
  const handleStartGame = async (levelToPlay = selectedLevel, modeToPlay = gameMode) => {
    try {
      const res = await api.startGame(levelToPlay, modeToPlay);
      if (res.sessionId) {
        setActiveSessionId(res.sessionId);
      }
    } catch (err) {
      console.warn('Starting offline session:', err.message);
    }

    setSelectedLevel(levelToPlay);
    setGameMode(modeToPlay);
    timer.resetTimer();
    game.restartGame();
    setShowVictory(false);
    setCurrentView('game');
  };

  // Change Difficulty
  const handleDifficultyChange = (diff) => {
    setSelectedDifficulty(diff);
    const levelsForDiff = DIFFICULTY_PRESETS[diff] || [1];
    setSelectedLevel(levelsForDiff[0]);
  };

  // Toggle Sound Setting
  const handleToggleSound = async () => {
    const nextState = !soundEnabled;
    try {
      const res = await api.updateSettings({ sound_enabled: nextState });
      if (res.settings) setProfile(res.settings);
    } catch (_) {
      setProfile(prev => ({ ...prev, sound_enabled: nextState ? 1 : 0 }));
    }
  };

  // Update Settings from Settings Modal
  const handleUpdateSettings = async (newSettings) => {
    try {
      const res = await api.updateSettings(newSettings);
      if (res.settings) setProfile(res.settings);
    } catch (err) {
      console.error('Settings update error:', err);
    }
  };

  // Trigger Reset Flow
  const handleTriggerReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset All Progress?',
      message: 'This will erase all high scores, reset your level progress back to Level 1, and clear all history from your SQLite database. This action cannot be undone.',
      confirmText: 'Yes, Wipe Everything',
      cancelText: 'Keep My Progress',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await api.resetAll();
          if (res.success) {
            if (res.stats) setStats(res.stats);
            if (res.progress) setProgress(res.progress);
            if (res.profile) setProfile(res.profile);
            setSelectedLevel(1);
          }
        } catch (err) {
          alert('Error resetting: ' + err.message);
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowSettings(false);
        }
      }
    });
  };

  // Safe Navigation to Home (Confirms if game is actively in progress)
  const handleHomeClick = () => {
    if (currentView === 'game' && game.moves > 0 && game.gameState !== 'won') {
      setConfirmDialog({
        isOpen: true,
        title: 'Abandon Match?',
        message: 'You have a match in progress. Returning home will discard your current round.',
        confirmText: 'Abandon Game',
        cancelText: 'Keep Playing',
        isDanger: false,
        onConfirm: () => {
          timer.resetTimer();
          setCurrentView('home');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      timer.resetTimer();
      setCurrentView('home');
    }
  };

  // Restart Current Game
  const handleRestart = () => {
    timer.resetTimer();
    game.restartGame();
    setShowVictory(false);
  };

  // Next Level Flow
  const handleNextLevel = () => {
    if (selectedLevel < 10) {
      const nextLvl = selectedLevel + 1;
      setSelectedLevel(nextLvl);
      handleStartGame(nextLvl, gameMode);
    }
  };

  const currentLevelConfig = getLevelConfig(selectedLevel);

  return (
    <div className="app-root">
      {/* Background Ambient Glows */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-glow bg-glow-3"></div>

      {/* Main Top Navigation */}
      <Navbar
        currentView={currentView}
        levelNumber={selectedLevel}
        mode={gameMode}
        moves={game.moves}
        matches={game.matches}
        totalPairs={game.totalPairs}
        score={game.score}
        formattedTime={timer.formattedTime}
        isPaused={timer.isPaused}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onTogglePause={timer.togglePause}
        onRestart={handleRestart}
        onHome={handleHomeClick}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
      />

      <main className="main-content">
        {/* VIEW 1: HOME DASHBOARD */}
        {currentView === 'home' && (
          <div className="home-view">
            {/* Hero Section */}
            <section className="hero-banner">
              <div className="hero-badge">
                <span className="pulsing-dot"></span>
                <span>INDIE BRAIN TRAINER</span>
              </div>
              <h2 className="hero-title">
                Sharpen Your Memory With <span className="gradient-text">Precision</span>
              </h2>
              <p className="hero-subtitle">
                Master 10 progressively challenging spatial layouts from 2×2 up to 6×7. Track your cognitive reflexes with permanent local SQLite persistence.
              </p>

              {/* Mode Switcher */}
              <div className="mode-toggle-group">
                <button
                  className={`mode-btn ${gameMode === 'campaign' ? 'active' : ''}`}
                  onClick={() => setGameMode('campaign')}
                >
                  <span className="mode-icon">🚀</span>
                  <span>Campaign (Level 1-10)</span>
                </button>
                <button
                  className={`mode-btn ${gameMode === 'free_play' ? 'active' : ''}`}
                  onClick={() => setGameMode('free_play')}
                >
                  <span className="mode-icon">⚡</span>
                  <span>Free Play</span>
                </button>
              </div>

              {/* Campaign Level Card Preview */}
              {gameMode === 'campaign' ? (
                <div className="level-preview-card" onClick={() => setShowLevelSelect(true)}>
                  <div className="preview-meta">
                    <span className="preview-sub">Selected Challenge</span>
                    <h3 className="preview-level-name">
                      Level {selectedLevel}: {currentLevelConfig.name}
                    </h3>
                    <div className="preview-specs">
                      <span>📐 {currentLevelConfig.rows} × {currentLevelConfig.cols} Grid</span>
                      <span>🧩 {currentLevelConfig.pairs} Pairs</span>
                      <span className={`diff-pill ${currentLevelConfig.difficulty.toLowerCase()}`}>
                        {currentLevelConfig.difficulty}
                      </span>
                    </div>
                  </div>
                  <button className="btn-select-map" title="View all levels">
                    Change Level ➔
                  </button>
                </div>
              ) : (
                <div className="free-play-controls">
                  <span className="free-play-title">Choose Difficulty:</span>
                  <DifficultySelector
                    selected={selectedDifficulty}
                    onChange={handleDifficultyChange}
                  />
                  <div className="free-play-meta">
                    Playing <strong>Level {selectedLevel} ({currentLevelConfig.rows}×{currentLevelConfig.cols})</strong>
                  </div>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="hero-actions">
                <button
                  className="btn btn-primary btn-hero glow-btn"
                  onClick={() => handleStartGame(selectedLevel, gameMode)}
                >
                  <span className="play-icon">▶</span> Play Now
                </button>
                <button
                  className="btn btn-secondary btn-hero"
                  onClick={() => setShowHowToPlay(true)}
                >
                  How to Play
                </button>
              </div>
            </section>

            {/* Dashboard Statistics Section */}
            <section className="stats-section">
              <div className="section-header">
                <h3>Personal Performance Dashboard</h3>
                <span className="stats-sub-note">Synchronized with local SQLite storage</span>
              </div>
              <StatsDashboard stats={stats} />
            </section>
          </div>
        )}

        {/* VIEW 2: ACTIVE GAMEBOARD */}
        {currentView === 'game' && (
          <div className="game-view">
            <div className="game-top-bar">
              <div className="game-level-info">
                <span className="game-level-badge">Level {selectedLevel}</span>
                <span className="game-level-title">{currentLevelConfig.name}</span>
                <span className="game-dim-badge">
                  {currentLevelConfig.rows} × {currentLevelConfig.cols} ({currentLevelConfig.pairs} Pairs)
                </span>
              </div>
              <div className="game-actions-group">
                <button className="btn btn-small btn-secondary" onClick={() => setShowLevelSelect(true)}>
                  Levels
                </button>
                <button className="btn btn-small btn-secondary" onClick={handleRestart}>
                  Restart
                </button>
              </div>
            </div>

            {/* The Responsive Grid */}
            <GameBoard
              cards={game.cards}
              rows={currentLevelConfig.rows}
              cols={currentLevelConfig.cols}
              flippedIndices={game.flippedIndices}
              matchedIds={game.matchedIds}
              isLocked={game.isLocked}
              isPaused={timer.isPaused}
              onResume={timer.resumeTimer}
              onCardClick={game.handleCardClick}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            <strong>MEMORY MATCH</strong> &bull; 100% Offline Single-Player Experience &bull; Native SQLite &bull; Web Audio API
          </p>
        </div>
      </footer>

      {/* Modals */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      <LevelSelectModal
        isOpen={showLevelSelect}
        onClose={() => setShowLevelSelect(false)}
        progress={progress}
        currentLevel={selectedLevel}
        mode={gameMode}
        onSelectLevel={(lvl) => {
          setSelectedLevel(lvl);
          if (currentView === 'game') {
            handleStartGame(lvl, gameMode);
          }
        }}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={profile}
        onUpdateSettings={handleUpdateSettings}
        onTriggerReset={handleTriggerReset}
        sound={sound}
      />

      <VictoryModal
        isOpen={showVictory}
        levelNumber={victoryData?.levelNumber || selectedLevel}
        score={victoryData?.score || 0}
        stars={victoryData?.stars || 1}
        moves={victoryData?.moves || 0}
        durationSeconds={victoryData?.durationSeconds || 0}
        breakdown={victoryData?.breakdown}
        unlockedNextLevel={victoryData?.unlockedNextLevel}
        isMaxLevel={selectedLevel >= 10}
        onNextLevel={handleNextLevel}
        onReplay={handleRestart}
        onHome={handleHomeClick}
      />

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
