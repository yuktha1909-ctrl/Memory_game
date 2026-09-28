/**
 * Deterministic scoring and level configuration for MEMORY MATCH
 */

const LEVEL_CONFIGS = {
  1: { rows: 2, cols: 2, pairs: 2, name: 'Genesis', difficulty: 'easy', targetTime: 15, max3StarMoves: 3, max2StarMoves: 5 },
  2: { rows: 2, cols: 3, pairs: 3, name: 'Novice', difficulty: 'easy', targetTime: 25, max3StarMoves: 5, max2StarMoves: 8 },
  3: { rows: 4, cols: 2, pairs: 4, name: 'Apprentice', difficulty: 'easy', targetTime: 35, max3StarMoves: 7, max2StarMoves: 11 },
  4: { rows: 4, cols: 3, pairs: 6, name: 'Adept', difficulty: 'medium', targetTime: 50, max3StarMoves: 10, max2StarMoves: 15 },
  5: { rows: 4, cols: 4, pairs: 8, name: 'Expert', difficulty: 'medium', targetTime: 70, max3StarMoves: 13, max2StarMoves: 20 },
  6: { rows: 4, cols: 5, pairs: 10, name: 'Master', difficulty: 'medium', targetTime: 95, max3StarMoves: 17, max2StarMoves: 26 },
  7: { rows: 4, cols: 6, pairs: 12, name: 'Grandmaster', difficulty: 'medium', targetTime: 120, max3StarMoves: 20, max2StarMoves: 31 },
  8: { rows: 5, cols: 6, pairs: 15, name: 'Champion', difficulty: 'hard', targetTime: 160, max3StarMoves: 25, max2StarMoves: 39 },
  9: { rows: 6, cols: 6, pairs: 18, name: 'Legend', difficulty: 'hard', targetTime: 200, max3StarMoves: 30, max2StarMoves: 48 },
  10: { rows: 6, cols: 7, pairs: 21, name: 'Mythic Deity', difficulty: 'hard', targetTime: 240, max3StarMoves: 36, max2StarMoves: 56 }
};

/**
 * Calculate score breakdown and stars deterministically
 * @param {number} levelNum Level number 1-10
 * @param {number} moves Total card pair attempts
 * @param {number} durationSeconds Time elapsed in seconds
 * @returns {object} { score, stars, breakdown }
 */
function calculateScore(levelNum, moves, durationSeconds) {
  const config = LEVEL_CONFIGS[levelNum];
  if (!config) {
    throw new Error(`Invalid level number: ${levelNum}`);
  }

  const { pairs, targetTime, max3StarMoves, max2StarMoves } = config;
  const safeMoves = Math.max(pairs, Number(moves) || pairs);
  const safeDuration = Math.max(1, Number(durationSeconds) || 1);

  // Difficulty multiplier
  const multiplier = config.difficulty === 'hard' ? 1.5 : (config.difficulty === 'medium' ? 1.25 : 1.0);

  // Base match score: each matched pair grants base points
  const baseScore = Math.round(pairs * 150 * multiplier);

  // Move efficiency bonus
  const extraMoves = Math.max(0, safeMoves - pairs);
  const maxPossibleMoveBonus = Math.round(pairs * 100 * multiplier);
  const movePenalty = Math.round(extraMoves * 20 * multiplier);
  const moveBonus = Math.max(0, maxPossibleMoveBonus - movePenalty);

  // Time bonus (awarded for finishing under target time)
  let timeBonus = 0;
  if (safeDuration < targetTime) {
    timeBonus = Math.round((targetTime - safeDuration) * 15 * multiplier);
  }

  // Calculate total score (guaranteed >= 50, never negative)
  const totalScore = Math.max(50, baseScore + moveBonus + timeBonus);

  // Calculate stars: 3, 2, or 1 star
  let stars = 1;
  if (safeMoves <= max3StarMoves && safeDuration <= targetTime * 1.1) {
    stars = 3;
  } else if (safeMoves <= max2StarMoves && safeDuration <= targetTime * 1.5) {
    stars = 2;
  } else {
    stars = 1;
  }

  return {
    score: totalScore,
    stars,
    breakdown: {
      baseScore,
      moveBonus,
      timeBonus,
      extraMoves,
      targetTime,
      totalMoves: safeMoves,
      durationSeconds: safeDuration
    }
  };
}

module.exports = {
  LEVEL_CONFIGS,
  calculateScore
};
