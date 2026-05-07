import { useState, useEffect, useCallback, useRef } from 'react';

export const useCountdown = (initialSeconds: number, onComplete?: () => void) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            if (onCompleteRef.current) onCompleteRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback((newSeconds?: number) => {
    setIsRunning(false);
    setSeconds(newSeconds ?? initialSeconds);
  }, [initialSeconds]);

  const formattedTime = useCallback(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [seconds]);

  return { 
    seconds, 
    isRunning, 
    start, 
    pause, 
    reset, 
    formattedTime: formattedTime(),
    setSeconds 
  };
};
