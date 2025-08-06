import { useState, useEffect, useRef } from 'react';

export interface TimerData {
  startTime: number;
  isRunning: boolean;
  targetTime?: number; // Target time in milliseconds
}

export interface UseTimerReturn {
  timerData: TimerData;
  currentTime: number;
  elapsedTime: number;
  countdown: number | null;
  isOverTime: boolean;
  formatTime: (timeMs: number) => string;
  startTimer: (targetTime?: number) => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useTimer = (): UseTimerReturn => {
  const [timerData, setTimerData] = useState<TimerData>({
    startTime: Date.now(),
    isRunning: false,
  });
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update current time every 100ms for smooth countdown
  useEffect(() => {
    if (timerData.isRunning) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(Date.now());
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerData.isRunning]);

  // Calculate elapsed time
  const elapsedTime = currentTime - timerData.startTime;

  // Calculate countdown time (if target time is set)
  let countdown = null;
  let isOverTime = false;
  if (timerData.targetTime) {
    if (timerData.isRunning) {
      countdown = Math.max(0, timerData.targetTime - elapsedTime);
    }
    isOverTime = elapsedTime > timerData.targetTime;
  }

  // Format time as MM:SS
  const formatTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer control functions
  const startTimer = (targetTime?: number) => {
    const now = Date.now();
    setTimerData({
      startTime: now,
      isRunning: true,
      targetTime,
    });
    setCurrentTime(now);
  };

  const stopTimer = () => {
    setTimerData((prev) => ({ ...prev, isRunning: false }));
  };

  const resetTimer = () => {
    const now = Date.now();
    setTimerData({
      startTime: now,
      isRunning: false,
    });
    setCurrentTime(now);
  };

  return {
    timerData,
    currentTime,
    elapsedTime,
    countdown,
    isOverTime,
    formatTime,
    startTimer,
    stopTimer,
    resetTimer,
  };
};
