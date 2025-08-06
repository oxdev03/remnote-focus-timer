import { Card } from '@remnote/plugin-sdk';
import { logger } from './logger';

/*
 * Get the weighted average response time for a specific card
 * @param card - The RemNote card object with repetition history, or null
 * @returns Promise<number | null> - The weighted average response time in milliseconds, or null if no data
 */
export const getCardAverageResponseTime = async (card: Card | undefined): Promise<number | null> => {
  try {
    if (!card) {
      logger.debug('📝 No card provided');
      return null;
    }

    if (!card.repetitionHistory || card.repetitionHistory.length === 0) {
      logger.debug('📊 No repetition history found for card');
      return null;
    }

    const responseTimeData = card.repetitionHistory
      .filter((rep: any) => rep.responseTime && rep.responseTime > 0)
      .map((rep: any) => ({
        responseTime: rep.responseTime,
        date: rep.date,
      }))
      .sort((a, b) => {
        // Sort by date to get most recent first
        const dateA = typeof a.date === 'number' ? a.date : new Date(a.date).getTime();
        const dateB = typeof b.date === 'number' ? b.date : new Date(b.date).getTime();
        return dateB - dateA;
      });

    if (responseTimeData.length === 0) {
      logger.debug('📊 No valid response times found for current card');
      return null;
    }

    // Take the last 10 response times for this card (most recent)
    const recentResponseTimes = responseTimeData.slice(0, 10).map((data) => data.responseTime);

    // Apply exponential weighting to favor recent times
    const weights = recentResponseTimes.map((_, index) => Math.pow(0.9, index));
    const weightedSum = recentResponseTimes.reduce(
      (sum: number, time: number, index: number) => sum + time * weights[index],
      0
    );
    const totalWeight = weights.reduce((sum: number, weight: number) => sum + weight, 0);
    const weightedAverage = weightedSum / totalWeight;

    logger.debug(
      `📊 Found ${responseTimeData.length} response times for card, weighted average: ${(
        weightedAverage / 1000
      ).toFixed(1)}s`
    );

    return weightedAverage;
  } catch (error) {
    logger.debug('❌ Error accessing card response time data:', error);
    return null;
  }
};
