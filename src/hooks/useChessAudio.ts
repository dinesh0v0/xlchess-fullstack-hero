import { useState, useCallback, useEffect, useRef } from 'react';

export function useChessAudio() {
  const [isMuted, setIsMuted] = useState(false);

  const moveAudio = useRef<HTMLAudioElement | null>(null);
  const captureAudio = useRef<HTMLAudioElement | null>(null);
  const checkAudio = useRef<HTMLAudioElement | null>(null);
  const gameEndAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    moveAudio.current = new Audio('/sounds/move.mp3');
    captureAudio.current = new Audio('/sounds/capture.mp3');
    checkAudio.current = new Audio('/sounds/check.mp3');
    gameEndAudio.current = new Audio('/sounds/game-end.mp3');

    // Preload them
    if (moveAudio.current) moveAudio.current.load();
    if (captureAudio.current) captureAudio.current.load();
    if (checkAudio.current) checkAudio.current.load();
    if (gameEndAudio.current) gameEndAudio.current.load();
  }, []);

  const playSound = useCallback((audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (isMuted || !audioRef.current) return;
    
    // Reset the audio to the beginning before playing
    audioRef.current.currentTime = 0;
    
    // Catch potential playback errors (e.g., if user hasn't interacted with page yet)
    audioRef.current.play().catch((err) => {
      console.warn('Audio playback failed:', err);
    });
  }, [isMuted]);

  const playMove = useCallback(() => playSound(moveAudio), [playSound]);
  const playCapture = useCallback(() => playSound(captureAudio), [playSound]);
  const playCheck = useCallback(() => playSound(checkAudio), [playSound]);
  const playGameEnd = useCallback(() => playSound(gameEndAudio), [playSound]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    isMuted,
    toggleMute,
    playMove,
    playCapture,
    playCheck,
    playGameEnd,
  };
}
