const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { LEVEL_CONFIGS, calculateScore } = require('../scoring');

describe('Scoring & Level Config Tests', () => {
  test('all 10 levels are defined with exact dimensions', () => {
    assert.equal(Object.keys(LEVEL_CONFIGS).length, 10);

    // Verify user specified layouts
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[1].rows, cols: LEVEL_CONFIGS[1].cols, pairs: LEVEL_CONFIGS[1].pairs },
      { rows: 2, cols: 2, pairs: 2 }
    );
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[2].rows, cols: LEVEL_CONFIGS[2].cols, pairs: LEVEL_CONFIGS[2].pairs },
      { rows: 2, cols: 3, pairs: 3 }
    );
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[3].rows, cols: LEVEL_CONFIGS[3].cols, pairs: LEVEL_CONFIGS[3].pairs },
      { rows: 4, cols: 2, pairs: 4 }
    );
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[4].rows, cols: LEVEL_CONFIGS[4].cols, pairs: LEVEL_CONFIGS[4].pairs },
      { rows: 4, cols: 3, pairs: 6 }
    );
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[5].rows, cols: LEVEL_CONFIGS[5].cols, pairs: LEVEL_CONFIGS[5].pairs },
      { rows: 4, cols: 4, pairs: 8 }
    );
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[6].rows, cols: LEVEL_CONFIGS[6].cols, pairs: LEVEL_CONFIGS[6].pairs },
      { rows: 4, cols: 5, pairs: 10 }
    );
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[7].rows, cols: LEVEL_CONFIGS[7].cols, pairs: LEVEL_CONFIGS[7].pairs },
      { rows: 4, cols: 6, pairs: 12 }
    );
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[8].rows, cols: LEVEL_CONFIGS[8].cols, pairs: LEVEL_CONFIGS[8].pairs },
      { rows: 5, cols: 6, pairs: 15 }
    );
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[9].rows, cols: LEVEL_CONFIGS[9].cols, pairs: LEVEL_CONFIGS[9].pairs },
      { rows: 6, cols: 6, pairs: 18 }
    );
    assert.deepEqual(
      { rows: LEVEL_CONFIGS[10].rows, cols: LEVEL_CONFIGS[10].cols, pairs: LEVEL_CONFIGS[10].pairs },
      { rows: 6, cols: 7, pairs: 21 }
    );
  });

  test('calculateScore calculates deterministic positive score and 3 stars for flawless play', () => {
    const result = calculateScore(1, 2, 5); // 2 pairs in 2 moves, 5 seconds
    assert.ok(result.score > 0);
    assert.equal(result.stars, 3);
    assert.ok(result.breakdown.timeBonus > 0);
    assert.equal(result.breakdown.extraMoves, 0);
  });

  test('calculateScore never awards negative score even with high moves and time', () => {
    const result = calculateScore(1, 50, 500); // 50 moves, 500s
    assert.ok(result.score >= 50);
    assert.equal(result.stars, 1);
    assert.equal(result.breakdown.timeBonus, 0);
  });

  test('throws error for invalid level number', () => {
    assert.throws(() => calculateScore(99, 10, 20), /Invalid level number/);
  });
});
