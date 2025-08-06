/**
 * Minimal logger utility with consistent formatting for RemNote Focus Timer
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LOG_COLORS = {
  info: '#2196F3',
  warn: '#FF9800',
  error: '#F44336',
  debug: '#9C27B0',
} as const;

class Logger {
  private prefix = 'FocusTimer';

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toTimeString().split(' ')[0]; // HH:MM:SS format
    return `[${timestamp}] ${this.prefix} - ${level.toLocaleUpperCase()} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const formattedMessage = this.formatMessage(level, message);
    const color = LOG_COLORS[level];

    if (data !== undefined) {
      console.groupCollapsed(`%c${formattedMessage}`, `color: ${color}; font-weight: bold;`);
      console.log(data);
      console.groupEnd();
    } else {
      console.log(`%c${formattedMessage}`, `color: ${color}; font-weight: bold;`);
    }
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: any): void {
    // Only log debug messages in development
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }
}

// Export a singleton instance
export const logger = new Logger();