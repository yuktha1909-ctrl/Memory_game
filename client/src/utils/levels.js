/**
 * Complete definition for all 10 progressively challenging levels
 */
export const LEVELS = [
  {
    level: 1,
    rows: 2,
    cols: 2,
    pairs: 2,
    name: 'Genesis',
    difficulty: 'Easy',
    description: 'A gentle 2×2 warm-up to ignite your memory.',
    targetTime: 15,
    max3StarMoves: 3,
    max2StarMoves: 5
  },
  {
    level: 2,
    rows: 2,
    cols: 3,
    pairs: 3,
    name: 'Novice',
    difficulty: 'Easy',
    description: 'A 2×3 grid introducing extra patterns.',
    targetTime: 25,
    max3StarMoves: 5,
    max2StarMoves: 8
  },
  {
    level: 3,
    rows: 4,
    cols: 2,
    pairs: 4,
    name: 'Apprentice',
    difficulty: 'Easy',
    description: 'A tall 4×2 layout testing vertical recall.',
    targetTime: 35,
    max3StarMoves: 7,
    max2StarMoves: 11
  },
  {
    level: 4,
    rows: 4,
    cols: 3,
    pairs: 6,
    name: 'Adept',
    difficulty: 'Medium',
    description: '12 cards in a balanced 4×3 grid.',
    targetTime: 50,
    max3StarMoves: 10,
    max2StarMoves: 15
  },
  {
    level: 5,
    rows: 4,
    cols: 4,
    pairs: 8,
    name: 'Expert',
    difficulty: 'Medium',
    description: 'The classic 4×4 memory matrix with 8 pairs.',
    targetTime: 70,
    max3StarMoves: 13,
    max2StarMoves: 20
  },
  {
    level: 6,
    rows: 4,
    cols: 5,
    pairs: 10,
    name: 'Master',
    difficulty: 'Medium',
    description: 'A 4×5 panoramic layout with 10 pairs.',
    targetTime: 95,
    max3StarMoves: 17,
    max2StarMoves: 26
  },
  {
    level: 7,
    rows: 4,
    cols: 6,
    pairs: 12,
    name: 'Grandmaster',
    difficulty: 'Medium',
    description: 'A wide 4×6 challenge pushing your working memory.',
    targetTime: 120,
    max3StarMoves: 20,
    max2StarMoves: 31
  },
  {
    level: 8,
    rows: 5,
    cols: 6,
    pairs: 15,
    name: 'Champion',
    difficulty: 'Hard',
    description: '30 cards in a 5×6 arena demanding sharp focus.',
    targetTime: 160,
    max3StarMoves: 25,
    max2StarMoves: 39
  },
  {
    level: 9,
    rows: 6,
    cols: 6,
    pairs: 18,
    name: 'Legend',
    difficulty: 'Hard',
    description: 'A massive 6×6 grid featuring 18 distinct pairs.',
    targetTime: 200,
    max3StarMoves: 30,
    max2StarMoves: 48
  },
  {
    level: 10,
    rows: 6,
    cols: 7,
    pairs: 21,
    name: 'Mythic Deity',
    difficulty: 'Hard',
    description: 'The ultimate 42-card test of superhuman recall.',
    targetTime: 240,
    max3StarMoves: 36,
    max2StarMoves: 56
  }
];

export const DIFFICULTY_PRESETS = {
  Easy: [1, 2, 3],
  Medium: [4, 5, 6, 7],
  Hard: [8, 9, 10]
};

export function getLevelConfig(levelNumber) {
  const num = Number(levelNumber);
  return LEVELS.find(l => l.level === num) || LEVELS[0];
}
