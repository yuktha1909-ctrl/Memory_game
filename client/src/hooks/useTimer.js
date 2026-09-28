import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Robust game timer with visibilitychange auto-pause and precision time tracking
 */
export function useTimer() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPausedManually, setIsPausedManually] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const accumulatedTimeRef = useRef(0);

  // Start the timer (called on first card flip)
  const startTimer = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
      setIsPausedManually(false);
    }
  }, [isRunning]);

  // Pause manually (e.g. pause button clicked)
  const pauseTimer = useCallback(() => {
    if (isRunning) {
      if (startTimeRef.current) {
        accumulatedTimeRef.current += Date.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
      setIsRunning(false);
      setIsPausedManually(true);
    }
  }, [isRunning]);

  // Resume manual pause
  const resumeTimer = useCallback(() => {
    if (!isRunning && isPausedManually) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
      setIsPausedManually(false);
    }
  }, [isRunning, isPausedManually]);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    if (isRunning) {
      pauseTimer();
      return true; // now paused
    } else if (isPausedManually) {
      resumeTimer();
      return false; // now running
    }
    return false;
  }, [isRunning, isPausedManually, pauseTimer, resumeTimer]);

  // Stop timer (e.g. game won)
  const stopTimer = useCallback(() => {
    if (startTimeRef.current) {
      accumulatedTimeRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
    setIsRunning(false);
    setIsPausedManually(false);
  }, []);

  // Reset timer completely
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPausedManually(false);
    startTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    setElapsedSeconds(0);
  }, []);

  // Active interval to update elapsed seconds
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const currentTotalMs = accumulatedTimeRef.current + (Date.now() - startTimeRef.current);
          setElapsedSeconds(Math.floor(currentTotalMs / 1000));
        }
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Tab visibility change auto-pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isRunning) {
          // Pause because tab became hidden
          if (startTimeRef.current) {
            accumulatedTimeRef.current += Date.now() - startTimeRef.current;
            startTimeRef.current = null;
          }
          setIsRunning(false);
        }
      } else if (document.visibilityState === 'visible') {
        // Only resume if it wasn't manually paused by player
        if (!isPausedManually && (startTimeRef.current !== null || accumulatedTimeRef.current > 0)) {
          startTimeRef.current = Date.now();
          setIsRunning(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, isPausedManually]);

  // Format MM:SS helper
  const formatTime = useCallback((totalSeconds = elapsedSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  return {
    elapsedSeconds,
    isRunning,
    isPaused: isPausedManually,
    formattedTime: formatTime(elapsedSeconds),
    formatTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    togglePause,
    stopTimer,
    resetTimer
  };
}
