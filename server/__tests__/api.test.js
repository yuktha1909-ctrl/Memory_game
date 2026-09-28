const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const {
  getPlayerProfile,
  updatePlayerSettings,
  getLevelsProgress,
  recordGameCompletion,
  getPlayerStats,
  getLeaderboard,
  getGameHistory,
  resetAllProgress
} = require('../db');

describe('Database and Game Progress Tests', () => {
  before(() => {
    // Reset state before tests
    resetAllProgress();
  });

  test('default profile is initialized', () => {
    const profile = getPlayerProfile();
    assert.ok(profile);
    assert.equal(profile.id, 1);
    assert.equal(profile.sound_enabled, 1);
  });

  test('levels are initialized with Level 1 unlocked and others locked', () => {
    const progress = getLevelsProgress();
    assert.equal(progress.length, 10);
    assert.equal(progress[0].level_number, 1);
    assert.equal(progress[0].unlocked, 1);
    assert.equal(progress[1].unlocked, 0);
  });

  test('completing level 1 records stats and unlocks level 2', () => {
    const result = recordGameCompletion({
      levelNumber: 1,
      mode: 'campaign',
      difficulty: 'easy',
      score: 500,
      moves: 2,
      durationSeconds: 8,
      stars: 3
    });

    assert.ok(result.gameId);
    assert.equal(result.unlockedNextLevel, true);

    const progress = getLevelsProgress();
    assert.equal(progress[0].completed, 1);
    assert.equal(progress[0].stars, 3);
    assert.equal(progress[0].best_score, 500);
    assert.equal(progress[1].unlocked, 1); // Level 2 unlocked!
  });

  test('updating player settings persists correctly', () => {
    const updated = updatePlayerSettings({ sound_enabled: 0, theme: 'deep-space' });
    assert.equal(updated.sound_enabled, 0);
    assert.equal(updated.theme, 'deep-space');

    const fetched = getPlayerProfile();
    assert.equal(fetched.sound_enabled, 0);
    assert.equal(fetched.theme, 'deep-space');
  });

  test('player statistics and history reflect games played', () => {
    const stats = getPlayerStats();
    assert.equal(stats.totalGames, 1);
    assert.equal(stats.totalWins, 1);
    assert.equal(stats.bestScore, 500);

    const history = getGameHistory();
    assert.equal(history.length, 1);
    assert.equal(history[0].level_number, 1);

    const leaderboard = getLeaderboard();
    assert.equal(leaderboard.length, 1);
  });

  test('resetAllProgress clears history and locks levels 2-10', () => {
    const resetRes = resetAllProgress();
    assert.equal(resetRes.success, true);

    const stats = getPlayerStats();
    assert.equal(stats.totalGames, 0);
    assert.equal(stats.bestScore, 0);

    const progress = getLevelsProgress();
    assert.equal(progress[0].unlocked, 1);
    assert.equal(progress[1].unlocked, 0);
    assert.equal(progress[0].completed, 0);
  });
});
