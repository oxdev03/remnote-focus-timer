import { usePlugin, renderWidget, AppEvents } from '@remnote/plugin-sdk';
import { useState, useEffect, useRef } from 'react';
import { getCardAverageResponseTime } from '../utils/cardUtils';
import { useTimer } from '../hooks/useTimer';
import { logger } from '../utils/logger';

export const FocusTimerWidget = () => {
  const plugin = usePlugin();
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const mountedRef = useRef(false);
  const {
    timerData,
    elapsedTime,
    countdown,
    isOverTime,
    formatTime,
    startTimer,
    stopTimer,
    resetTimer,
  } = useTimer();

  // Common timer initialization logic
  const initializeTimerForCard = async () => {
    try {
      logger.debug('🔍 Initializing timer...');

      // Get settings and current card data
      const multiplier = (await plugin.settings.getSetting<number>('target-multiplier')) || 1.2;
      const card = await plugin.queue.getCurrentCard();
      const cardAverage = await getCardAverageResponseTime(card);

      if (!mountedRef.current) return; // Component unmounted during async operation

      if (!cardAverage) {
        logger.debug('❓ No average time data available - starting timer without target');
        setAverageTime(null);
        startTimer(); // Start timer without target time
        return;
      }

      const targetTime = cardAverage * multiplier;

      logger.debug(`⏰ Target time set to: ${(targetTime / 1000).toFixed(1)}s`);

      setAverageTime(cardAverage);
      startTimer(targetTime); // Start timer with target time
    } catch (error) {
      console.error('Error initializing timer:', error);
      if (mountedRef.current) {
        setAverageTime(null);
        startTimer(); // Start timer without target time as fallback
      }
    }
  };

  // Single useEffect for all initialization and event handling
  useEffect(() => {
    const handleRevealAnswer = async () => {
      logger.debug('👁️ Answer revealed - stopping timer');
      stopTimer();
    };

    const handleQueueExit = async () => {
      logger.debug('🚪 Queue exited - resetting timer');
      resetTimer();
    };

    const handleQueueLoadCard = async () => {
      logger.debug('📥 Queue loaded new card - initializing timer for new card');
      await initializeTimerForCard();
    };

    if (!mountedRef.current) {
      // Initialize timer on mount
      initializeTimerForCard();

      mountedRef.current = true;
    }

    logger.debug('📝 Registering queue events');

    // Register event listeners
    plugin.event.addListener(AppEvents.RevealAnswer, undefined, handleRevealAnswer);
    plugin.event.addListener(AppEvents.QueueLoadCard, undefined, handleQueueLoadCard);
    plugin.event.addListener(AppEvents.QueueExit, undefined, handleQueueExit);

    return () => {
      logger.debug('🧹 Cleaning up event listeners');
      mountedRef.current = false;

      // Cleanup listeners
      plugin.event.removeListener(AppEvents.RevealAnswer, undefined);
      plugin.event.removeListener(AppEvents.QueueLoadCard, undefined);
      plugin.event.removeListener(AppEvents.QueueExit, undefined);
    };
  }, [plugin]);

  // Only show if timer is running or we have average time data
  if (!timerData.isRunning && !averageTime) {
    return null;
  }

  return (
    <div className="focus-timer-widget inline-flex items-center gap-1 px-2 py-1 text-sm w-13">
      {/* Timer Icon */}
      <div
        className={`w-2 h-2 rounded-full ${
          timerData.isRunning ? 'rn-clr-background-positive' : 'rn-clr-background-elevation-15'
        }`}
      ></div>

      {/* Countdown/Overtime Display */}

      <span
        className={`rn-fontweight-semibold rn-fontsize-small ${
          isOverTime
            ? 'rn-clr-content-negative'
            : countdown && countdown < 5000
            ? 'rn-clr-content-state-warning'
            : 'rn-clr-content-positive'
        }`}
      >
        {timerData.targetTime && timerData.isRunning ? (
          <>
            {isOverTime ? '+' : ''}
            {formatTime(isOverTime ? elapsedTime - timerData.targetTime : countdown!)}
          </>
        ) : (
          <>{formatTime(elapsedTime)}</>
        )}
      </span>
    </div>
  );
};

renderWidget(FocusTimerWidget);
