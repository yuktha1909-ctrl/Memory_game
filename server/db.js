const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');
const { LEVEL_CONFIGS } = require('./scoring');

// Resolve database storage location
// Configurable via DB_PATH, DATA_DIR, or defaults to /var/data/memory_game.db in production
const isProduction = process.env.NODE_ENV === 'production';
const defaultProdPath = '/var/data/memory_game.db';
const defaultDevPath = path.join(__dirname, 'memory_game.db');

let DB_PATH;
if (process.env.DB_PATH) {
  DB_PATH = process.env.DB_PATH;
} else if (process.env.DATA_DIR) {
  DB_PATH = path.join(process.env.DATA_DIR, 'memory_game.db');
} else if (fs.existsSync('/var/data')) {
  DB_PATH = defaultProdPath;
} else if (isProduction && process.platform !== 'win32') {
  try {
    if (!fs.existsSync('/var/data')) {
      fs.mkdirSync('/var/data', { recursive: true });
    }
    DB_PATH = defaultProdPath;
  } catch (_) {
    DB_PATH = defaultDevPath;
  }
} else {
  DB_PATH = defaultDevPath;
}

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency and performance
try {
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
} catch (e) {
  console.warn('Notice: SQLite PRAGMA configuration:', e.message);
}

/**
 * Initialize all database tables and seed defaults
 */
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_profile (
      id INTEGER PRIMARY KEY,
      player_name TEXT NOT NULL DEFAULT 'Player One',
      sound_enabled INTEGER NOT NULL DEFAULT 1,
      animations_enabled INTEGER NOT NULL DEFAULT 1,
      theme TEXT NOT NULL DEFAULT 'midnight',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS level_progress (
      level_number INTEGER PRIMARY KEY,
      unlocked INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      stars INTEGER NOT NULL DEFAULT 0,
      best_score INTEGER NOT NULL DEFAULT 0,
      best_time_seconds INTEGER NOT NULL DEFAULT 0,
      best_moves INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level_number INTEGER NOT NULL,
      mode TEXT NOT NULL DEFAULT 'campaign',
      difficulty TEXT NOT NULL,
      score INTEGER NOT NULL,
      moves INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL,
      stars INTEGER NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Ensure default player profile exists
  const existingProfile = db.prepare('SELECT id FROM player_profile WHERE id = 1').get();
  if (!existingProfile) {
    db.prepare(`
      INSERT INTO player_profile (id, player_name, sound_enabled, animations_enabled, theme)
      VALUES (1, 'Player One', 1, 1, 'midnight')
    `).run();
  }

  // Ensure all 10 levels exist in level_progress (Level 1 unlocked by default)
  for (let lvl = 1; lvl <= 10; lvl++) {
    const existingLevel = db.prepare('SELECT level_number FROM level_progress WHERE level_number = ?').get(lvl);
    if (!existingLevel) {
      db.prepare(`
        INSERT INTO level_progress (level_number, unlocked, completed, stars, best_score, best_time_seconds, best_moves)
        VALUES (?, ?, 0, 0, 0, 0, 0)
      `).run(lvl, lvl === 1 ? 1 : 0);
    }
  }
}

// Run DB initialization immediately on load
initDb();

/**
 * Get player profile and settings
 */
function getPlayerProfile() {
  return db.prepare('SELECT * FROM player_profile WHERE id = 1').get();
}

/**
 * Update player settings
 */
function updatePlayerSettings({ sound_enabled, animations_enabled, theme }) {
  const current = getPlayerProfile();
  const newSound = sound_enabled !== undefined ? (sound_enabled ? 1 : 0) : current.sound_enabled;
  const newAnimations = animations_enabled !== undefined ? (animations_enabled ? 1 : 0) : current.animations_enabled;
  const newTheme = theme !== undefined ? String(theme) : current.theme;

  db.prepare(`
    UPDATE player_profile
    SET sound_enabled = ?, animations_enabled = ?, theme = ?
    WHERE id = 1
  `).run(newSound, newAnimations, newTheme);

  return getPlayerProfile();
}

/**
 * Get all levels progress
 */
function getLevelsProgress() {
  const rows = db.prepare('SELECT * FROM level_progress ORDER BY level_number ASC').all();
  return rows.map(row => ({
    ...row,
    config: LEVEL_CONFIGS[row.level_number] || null
  }));
}

/**
 * Get highest unlocked level
 */
function getHighestUnlockedLevel() {
  const row = db.prepare(`
    SELECT MAX(level_number) as max_level FROM level_progress WHERE unlocked = 1
  `).get();
  return row ? (row.max_level || 1) : 1;
}

/**
 * Record a game completion, update level progress, unlock next level, and save history
 */
function recordGameCompletion({ levelNumber, mode, difficulty, score, moves, durationSeconds, stars }) {
  const level = Number(levelNumber);
  const now = new Date().toISOString();

  // 1. Insert into game history
  const insertHistory = db.prepare(`
    INSERT INTO game_history (level_number, mode, difficulty, score, moves, duration_seconds, stars, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const historyResult = insertHistory.run(level, mode, difficulty, score, moves, durationSeconds, stars, now);

  let unlockedNextLevel = false;

  // 2. If campaign mode, update level progress
  if (level >= 1 && level <= 10) {
    const currentProgress = db.prepare('SELECT * FROM level_progress WHERE level_number = ?').get(level);

    if (currentProgress) {
      const newBestScore = Math.max(currentProgress.best_score || 0, score);
      const newBestTime = (currentProgress.best_time_seconds > 0)
        ? Math.min(currentProgress.best_time_seconds, durationSeconds)
        : durationSeconds;
      const newBestMoves = (currentProgress.best_moves > 0)
        ? Math.min(currentProgress.best_moves, moves)
        : moves;
      const newStars = Math.max(currentProgress.stars || 0, stars);

      db.prepare(`
        UPDATE level_progress
        SET completed = 1,
            stars = ?,
            best_score = ?,
            best_time_seconds = ?,
            best_moves = ?,
            updated_at = ?
        WHERE level_number = ?
      `).run(newStars, newBestScore, newBestTime, newBestMoves, now, level);

      // Unlock next level if level < 10
      if (level < 10) {
        const nextLevel = level + 1;
        const nextProg = db.prepare('SELECT unlocked FROM level_progress WHERE level_number = ?').get(nextLevel);
        if (nextProg && nextProg.unlocked === 0) {
          db.prepare('UPDATE level_progress SET unlocked = 1, updated_at = ? WHERE level_number = ?').run(now, nextLevel);
          unlockedNextLevel = true;
        }
      }
    }
  }

  return {
    gameId: historyResult.lastInsertRowid,
    unlockedNextLevel
  };
}

/**
 * Get aggregated dashboard statistics
 */
function getPlayerStats() {
  const totalGamesRow = db.prepare('SELECT COUNT(*) as count FROM game_history').get();
  const totalGames = totalGamesRow ? totalGamesRow.count : 0;

  // All completed games recorded in history represent wins (since they match all pairs)
  const totalWins = totalGames;

  const bestScoreRow = db.prepare('SELECT MAX(score) as max_score FROM game_history').get();
  const bestScore = bestScoreRow && bestScoreRow.max_score ? bestScoreRow.max_score : 0;

  const bestTimeRow = db.prepare('SELECT MIN(duration_seconds) as min_time FROM game_history WHERE duration_seconds > 0').get();
  const bestTimeSeconds = bestTimeRow && bestTimeRow.min_time ? bestTimeRow.min_time : 0;

  const starsRow = db.prepare('SELECT SUM(stars) as total_stars FROM level_progress').get();
  const totalStars = starsRow && starsRow.total_stars ? starsRow.total_stars : 0;

  const levelsCompletedRow = db.prepare('SELECT COUNT(*) as completed_count FROM level_progress WHERE completed = 1').get();
  const levelsCompleted = levelsCompletedRow ? levelsCompletedRow.completed_count : 0;

  return {
    totalGames,
    totalWins,
    winRate: totalGames > 0 ? 100 : 0,
    bestScore,
    bestTimeSeconds,
    totalStars,
    levelsCompleted,
    highestUnlockedLevel: getHighestUnlockedLevel()
  };
}

/**
 * Get game history (recent matches)
 */
function getGameHistory(limit = 20) {
  return db.prepare(`
    SELECT id, level_number, mode, difficulty, score, moves, duration_seconds, stars, completed_at
    FROM game_history
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);
}

/**
 * Get local leaderboard (highest scores)
 */
function getLeaderboard(limit = 10) {
  return db.prepare(`
    SELECT id, level_number, mode, difficulty, score, moves, duration_seconds, stars, completed_at
    FROM game_history
    ORDER BY score DESC, duration_seconds ASC, moves ASC
    LIMIT ?
  `).all(limit);
}

/**
 * Reset all player progress and history back to default state
 */
function resetAllProgress() {
  db.exec(`
    DELETE FROM game_history;
    UPDATE level_progress SET
      unlocked = CASE WHEN level_number = 1 THEN 1 ELSE 0 END,
      completed = 0,
      stars = 0,
      best_score = 0,
      best_time_seconds = 0,
      best_moves = 0,
      updated_at = datetime('now');
    UPDATE player_profile SET
      sound_enabled = 1,
      animations_enabled = 1,
      theme = 'midnight'
    WHERE id = 1;
  `);

  return { success: true, message: 'All player progress and history have been successfully reset.' };
}

module.exports = {
  db,
  DB_PATH,
  initDb,
  getPlayerProfile,
  updatePlayerSettings,
  getLevelsProgress,
  getHighestUnlockedLevel,
  recordGameCompletion,
  getPlayerStats,
  getGameHistory,
  getLeaderboard,
  resetAllProgress
};
