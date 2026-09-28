import { useState, useEffect, useCallback, useRef } from 'react';
import { generateDeck } from '../utils/cardIcons';
import { getLevelConfig } from '../utils/levels';

/**
 * Core Game Engine hook managing card states, matching logic, move counts, and state transitions
 */
export function useGameEngine({
  levelNumber = 1,
  mode = 'campaign',
  onGameWon,
  onFirstFlip,
  sound
}) {
  const levelConfig = getLevelConfig(levelNumber);

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'paused' | 'won'
  const [score, setScore] = useState(0);

  const hasStartedRef = useRef(false);
  const flipTimeoutRef = useRef(null);

  // Initialize or restart the board
  const initializeGame = useCallback(() => {
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
    }
    const newDeck = generateDeck(levelConfig.pairs);
    setCards(newDeck);
    setFlippedIndices([]);
    setMatchedIds(new Set());
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
    setGameState('ready');
    setScore(0);
    hasStartedRef.current = false;
  }, [levelConfig.pairs]);

  // Run board initialization whenever levelNumber changes
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle card click
  const handleCardClick = useCallback((index) => {
    // Ignore clicks if game is paused or won
    if (gameState === 'paused' || gameState === 'won') return;

    // Ignore if board is locked during evaluation
    if (isLocked) return;

    // Ignore if card is already flipped or matched
    if (flippedIndices.includes(index)) return;
    const card = cards[index];
    if (!card || matchedIds.has(card.matchId)) return;

    // Trigger game start & timer on first flip
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      setGameState('playing');
      if (onFirstFlip) onFirstFlip();
    }

    // Play flip sound
    if (sound?.playFlip) sound.playFlip();

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // If this is the second card flipped in the turn
    if (newFlipped.length === 2) {
      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      const newMoves = moves + 1;
      setMoves(newMoves);

      // Check for match
      if (firstCard.matchId === secondCard.matchId) {
        // MATCH!
        const nextMatched = new Set(matchedIds);
        nextMatched.add(firstCard.matchId);
        setMatchedIds(nextMatched);

        const newMatchCount = matches + 1;
        setMatches(newMatchCount);

        // Immediate dynamic score increase
        setScore(prev => prev + 150);

        if (sound?.playMatch) {
          setTimeout(() => sound.playMatch(), 150);
        }

        // Reset flipped indices immediately since they are now part of matchedIds
        setFlippedIndices([]);

        // Check if all pairs are matched!
        if (newMatchCount === levelConfig.pairs) {
          setGameState('won');
          if (sound?.playVictory) {
            setTimeout(() => sound.playVictory(), 300);
          }
          if (onGameWon) {
            onGameWon({
              levelNumber,
              mode,
              moves: newMoves,
              pairs: levelConfig.pairs
            });
          }
        }
      } else {
        // MISMATCH!
        setIsLocked(true);
        if (sound?.playMismatch) {
          setTimeout(() => sound.playMismatch(), 200);
        }

        flipTimeoutRef.current = setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  }, [
    gameState,
    isLocked,
    flippedIndices,
    cards,
    matchedIds,
    moves,
    matches,
    levelConfig.pairs,
    levelNumber,
    mode,
    onFirstFlip,
    onGameWon,
    sound
  ]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
      }
    };
  }, []);

  return {
    cards,
    flippedIndices,
    matchedIds,
    moves,
    matches,
    totalPairs: levelConfig.pairs,
    isLocked,
    gameState,
    setGameState,
    score,
    levelConfig,
    handleCardClick,
    restartGame: initializeGame
  };
}
