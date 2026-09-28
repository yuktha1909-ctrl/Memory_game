const express = require('express');
const {
  getPlayerProfile,
  updatePlayerSettings,
  getLevelsProgress,
  recordGameCompletion,
  getPlayerStats,
  getGameHistory,
  getLeaderboard,
  resetAllProgress
} = require('./db');
const { LEVEL_CONFIGS, calculateScore } = require('./scoring');

const router = express.Router();

// Active game sessions for validation (in-memory tracker with timestamp)
const activeSessions = new Map();

// Clean up stale sessions older than 2 hours periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of activeSessions.entries()) {
    if (now - data.createdAt > 2 * 60 * 60 * 1000) {
      activeSessions.delete(sessionId);
    }
  }
}, 15 * 60 * 1000);

/**
 * GET /api/levels
 * Retrieve level layouts and configurations
 */
router.get('/levels', (req, res) => {
  res.json({
    success: true,
    levels: LEVEL_CONFIGS
  });
});

/**
 * GET /api/profile
 * Retrieve player profile and current settings
 */
router.get('/profile', (req, res) => {
  try {
    const profile = getPlayerProfile();
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve profile: ' + err.message });
  }
});

/**
 * PATCH /api/settings
 * Update settings (sound, animations, theme)
 */
router.patch('/settings', (req, res) => {
  try {
    const { sound_enabled, animations_enabled, theme } = req.body;
    const updated = updatePlayerSettings({ sound_enabled, animations_enabled, theme });
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update settings: ' + err.message });
  }
});

/**
 * GET /api/progress
 * Retrieve progress across all 10 levels
 */
router.get('/progress', (req, res) => {
  try {
    const progress = getLevelsProgress();
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve progress: ' + err.message });
  }
});

/**
 * POST /api/games/start
 * Initiate a new game session
 */
router.post('/games/start', (req, res) => {
  try {
    const { levelNumber = 1, mode = 'campaign' } = req.body;
    const lvl = Number(levelNumber);

    if (!LEVEL_CONFIGS[lvl]) {
      return res.status(400).json({ success: false, error: `Invalid level number: ${levelNumber}. Must be between 1 and 10.` });
    }

    // Check if level is unlocked if campaign mode
    if (mode === 'campaign') {
      const allProgress = getLevelsProgress();
      const currentLevelProg = allProgress.find(p => p.level_number === lvl);
      if (!currentLevelProg || !currentLevelProg.unlocked) {
        return res.status(403).json({ success: false, error: `Level ${lvl} is currently locked. Complete previous levels first.` });
      }
    }

    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    activeSessions.set(sessionId, {
      sessionId,
      levelNumber: lvl,
      mode,
      difficulty: LEVEL_CONFIGS[lvl].difficulty,
      createdAt: Date.now()
    });

    res.json({
      success: true,
      sessionId,
      levelConfig: LEVEL_CONFIGS[lvl]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to start game session: ' + err.message });
  }
});

/**
 * POST /api/games/complete
 * Submit game results with deterministic backend validation
 */
router.post('/games/complete', (req, res) => {
  try {
    const { sessionId, levelNumber, mode = 'campaign', moves, durationSeconds } = req.body;
    const lvl = Number(levelNumber);

    if (!LEVEL_CONFIGS[lvl]) {
      return res.status(400).json({ success: false, error: 'Invalid level number. Must be 1 to 10.' });
    }

    const config = LEVEL_CONFIGS[lvl];
    const safeMoves = Number(moves);
    const safeDuration = Number(durationSeconds);

    // Validation checks
    if (isNaN(safeMoves) || safeMoves < config.pairs) {
      return res.status(400).json({
        success: false,
        error: `Invalid move count: ${moves}. Must be at least ${config.pairs} moves to complete ${config.pairs} pairs.`
      });
    }

    if (isNaN(safeDuration) || safeDuration < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid duration. Completion time must be at least 1 second.'
      });
    }

    // Check session if provided to prevent duplicate submission
    if (sessionId && activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId);
      if (session.completed) {
        return res.status(409).json({ success: false, error: 'This game session has already been recorded.' });
      }
      session.completed = true;
    }

    // Calculate deterministic score & stars on the backend!
    const { score, stars, breakdown } = calculateScore(lvl, safeMoves, safeDuration);

    // Record into SQLite
    const recordResult = recordGameCompletion({
      levelNumber: lvl,
      mode,
      difficulty: config.difficulty,
      score,
      moves: safeMoves,
      durationSeconds: safeDuration,
      stars
    });

    // Fetch updated stats and progress
    const updatedStats = getPlayerStats();
    const updatedProgress = getLevelsProgress();

    res.json({
      success: true,
      result: {
        gameId: recordResult.gameId,
        levelNumber: lvl,
        score,
        stars,
        moves: safeMoves,
        durationSeconds: safeDuration,
        breakdown,
        unlockedNextLevel: recordResult.unlockedNextLevel
      },
      stats: updatedStats,
      progress: updatedProgress
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to record game completion: ' + err.message });
  }
});

/**
 * GET /api/stats
 * Dashboard aggregated player statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getPlayerStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve stats: ' + err.message });
  }
});

/**
 * GET /api/history
 * Match history with optional limit
 */
router.get('/history', (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const history = getGameHistory(limit);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve history: ' + err.message });
  }
});

/**
 * GET /api/leaderboard
 * Local high scores
 */
router.get('/leaderboard', (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const leaderboard = getLeaderboard(limit);
    res.json({
      success: true,
      leaderboard,
      note: 'Local Leaderboard (Stored offline in local SQLite database)'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve leaderboard: ' + err.message });
  }
});

/**
 * POST /api/reset
 * Reset all progress, scores, and history
 */
router.post('/reset', (req, res) => {
  try {
    const { confirm } = req.body;
    if (confirm !== true) {
      return res.status(400).json({
        success: false,
        error: 'Confirmation required. Send { confirm: true } to reset all progress.'
      });
    }

    const resetResult = resetAllProgress();
    activeSessions.clear();

    res.json({
      success: true,
      message: resetResult.message,
      stats: getPlayerStats(),
      progress: getLevelsProgress(),
      profile: getPlayerProfile()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to reset progress: ' + err.message });
  }
});

module.exports = router;
