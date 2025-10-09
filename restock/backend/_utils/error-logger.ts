/**
 * Comprehensive Error Logging Utility
 * Provides structured logging for debugging and error tracking across the app
 */

export interface LogContext {
  userId?: string;
  operation?: string;
  component?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string;
  status?: number;
  [key: string]: any;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private static readonly MAX_LOGS = 1000; // Maximum number of logs to keep
  private logs: Array<{
    level: 'info' | 'success' | 'warning' | 'error' | 'debug';
    message: string;
    data?: any;
    context?: LogContext;
    timestamp: string;
  }> = [];

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private addLogEntry(logEntry: any) {
    const logger = ErrorLogger.getInstance();
    logger.logs.push(logEntry);
    
    // Remove oldest log if we exceed the maximum
    if (logger.logs.length > ErrorLogger.MAX_LOGS) {
      logger.logs.shift();
    }
  }

  /**
   * Log informational messages
   */
  static info(message: string, data?: any, context?: LogContext) {
    const logger = ErrorLogger.getInstance();
    const logEntry = {
      level: 'info' as const,
      message,
      data,
      context: { ...context, timestamp: new Date().toISOString() },
    };
    
    logger.addLogEntry(logEntry);
    console.log(`[${context?.component || 'APP'}] ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    
    return logEntry;
  }

  /**
   * Log success messages
   */
  static success(message: string, data?: any, context?: LogContext) {
    const logger = ErrorLogger.getInstance();
    const logEntry = {
      level: 'success' as const,
      message,
      data,
      context: { ...context, timestamp: new Date().toISOString() },
    };
    
    logger.addLogEntry(logEntry);
    console.log(`[${context?.component || 'APP'}] ✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    
    return logEntry;
  }

  /**
   * Log warning messages
   */
  static warning(message: string, data?: any, context?: LogContext) {
    const logger = ErrorLogger.getInstance();
    const logEntry = {
      level: 'warning' as const,
      message,
      data,
      context: { ...context, timestamp: new Date().toISOString() },
    };
    
    logger.addLogEntry(logEntry);
    console.warn(`[${context?.component || 'APP'}] ⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    
    return logEntry;
  }

  /**
   * Log error messages with detailed error information
   */
  static error(message: string, error?: any, context?: LogContext) {
    const logger = ErrorLogger.getInstance();
    
    const errorDetails: ErrorDetails = {
      message: error?.message || 'No error message',
      stack: error?.stack || 'No stack trace',
      code: error?.code || 'No error code',
      status: error?.status || 'No status',
    };

    const logEntry = {
      level: 'error' as const,
      message,
      data: {
        error: errorDetails,
        context: context ? JSON.stringify(context, null, 2) : 'No context',
      },
      context: { ...context, timestamp: new Date().toISOString() },
    };
    
    logger.addLogEntry(logEntry);
    console.error(`[${context?.component || 'APP'}] ❌ ${message}`, {
      error: errorDetails,
      context: context ? JSON.stringify(context, null, 2) : 'No context',
      timestamp: new Date().toISOString(),
    });
    
    return logEntry;
  }

  /**
   * Log debug messages (only in development)
   */
  static debug(message: string, data?: any, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      const logger = ErrorLogger.getInstance();
      const logEntry = {
        level: 'debug' as const,
        message,
        data,
        context: { ...context, timestamp: new Date().toISOString() },
      };
      
      logger.addLogEntry(logEntry);
      console.log(`[${context?.component || 'APP'}] 🔍 ${message}`, data ? JSON.stringify(data, null, 2) : '');
      
      return logEntry;
    }
    return null;
  }

  /**
   * Get all logs (useful for debugging)
   */
  static getLogs() {
    return ErrorLogger.getInstance().logs;
  }

  /**
   * Clear logs (useful for memory management)
   */
  static clearLogs() {
    ErrorLogger.getInstance().logs = [];
  }

  /**
   * Get logs by level
   */
  static getLogsByLevel(level: 'info' | 'success' | 'warning' | 'error' | 'debug') {
    return ErrorLogger.getInstance().logs.filter(log => log.level === level);
  }

  /**
   * Get recent logs (last N entries)
   */
  static getRecentLogs(count: number = 50) {
    const logs = ErrorLogger.getInstance().logs;
    return logs.slice(-count);
  }

  /**
   * Export logs for debugging
   */
  static exportLogs() {
    const logs = ErrorLogger.getInstance().logs;
    return JSON.stringify(logs, null, 2);
  }
}

/**
 * Error Handler Utility
 * Provides common error handling patterns
 */
export class ErrorHandler {
  /**
   * Private helper method to standardize error responses
   */
  private static createErrorResponse(error: any, operation: string, errorType: string, context?: LogContext) {
    ErrorLogger.error(`${errorType} ${operation} failed`, error, { ...context, operation });
    return {
      success: false,
      error: `${errorType} ${operation} failed: ${error?.message || 'Unknown error'}`
    };
  }

  /**
   * Handle AsyncStorage errors
   */
  static handleAsyncStorageError(error: any, operation: string, context?: LogContext) {
    return this.createErrorResponse(error, operation, 'AsyncStorage', context);
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: any, operation: string, context?: LogContext) {
    return this.createErrorResponse(error, operation, 'Database', context);
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: any, operation: string, context?: LogContext) {
    ErrorLogger.error(`Network ${operation} failed`, error, { ...context, operation });
    return {
      success: false,
      error: `Network error during ${operation}: ${error?.message || 'Connection failed'}`
    };
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(field: string, value: any, rule: string, context?: LogContext) {
    ErrorLogger.warning(`Validation failed for ${field}`, { field, value, rule }, context);
    return `Invalid ${field}: ${rule}`;
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any, operation: string, context?: LogContext) {
    return this.createErrorResponse(error, operation, 'Authentication', context);
  }

  /**
   * Handle API errors
   */
  static handleApiError(error: any, endpoint: string, context?: LogContext) {
    ErrorLogger.error(`API call to ${endpoint} failed`, error, { ...context, endpoint });
    return {
      success: false,
      error: `API call failed: ${error?.message || 'Unknown error'}`
    };
  }

  /**
   * Generic error handler
   */
  static handleError(error: any, operation: string, context?: LogContext) {
    return this.createErrorResponse(error, operation, '', context);
  }
}

/**
 * Performance Logger
 * For tracking performance metrics
 */
export class PerformanceLogger {
  private static timers: Map<string, number> = new Map();
  private static readonly MAX_TIMERS = 100; // Maximum number of timers to keep
  private static readonly TIMER_TIMEOUT = 30000; // 30 seconds timeout for timers

  /**
   * Start a performance timer
   */
  static startTimer(name: string) {
    // Clean up old timers if we exceed the limit
    if (PerformanceLogger.timers.size >= PerformanceLogger.MAX_TIMERS) {
      const oldestTimer = PerformanceLogger.timers.keys().next().value;
      if (oldestTimer) {
        PerformanceLogger.timers.delete(oldestTimer);
        ErrorLogger.warning(`Performance timer limit reached, removed oldest timer: ${oldestTimer}`);
      }
    }

    PerformanceLogger.timers.set(name, Date.now());
    
    // Set a timeout to automatically clean up this timer
    setTimeout(() => {
      if (PerformanceLogger.timers.has(name)) {
        PerformanceLogger.timers.delete(name);
        ErrorLogger.warning(`Performance timer timed out and was cleaned up: ${name}`);
      }
    }, PerformanceLogger.TIMER_TIMEOUT);

    ErrorLogger.debug(`Performance timer started: ${name}`);
  }

  /**
   * End a performance timer and log the duration
   */
  static endTimer(name: string, context?: LogContext) {
    const startTime = PerformanceLogger.timers.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      PerformanceLogger.timers.delete(name);
      ErrorLogger.info(`Performance: ${name} completed in ${duration}ms`, { duration }, context);
      return duration;
    }
    ErrorLogger.warning(`Performance timer not found: ${name}`);
    return null;
  }

  /**
   * Measure async operation performance
   */
  static async measureAsync<T>(
    name: string, 
    operation: () => Promise<T>, 
    context?: LogContext
  ): Promise<T> {
    PerformanceLogger.startTimer(name);
    try {
      const result = await operation();
      PerformanceLogger.endTimer(name, context);
      return result;
    } catch (error) {
      PerformanceLogger.endTimer(name, context);
      throw error;
    }
  }
}

/**
 * User Action Logger
 * For tracking user interactions
 */
export class UserActionLogger {
  /**
   * Log user action
   */
  static logAction(action: string, data?: any, context?: LogContext) {
    ErrorLogger.info(`User action: ${action}`, data, { ...context, actionType: 'user_action' });
  }

  /**
   * Log screen navigation
   */
  static logNavigation(from: string, to: string, context?: LogContext) {
    ErrorLogger.info(`Navigation: ${from} → ${to}`, null, { ...context, actionType: 'navigation' });
  }

  /**
   * Log form submission
   */
  static logFormSubmission(formName: string, data?: any, context?: LogContext) {
    ErrorLogger.info(`Form submitted: ${formName}`, data, { ...context, actionType: 'form_submission' });
  }

  /**
   * Log button click
   */
  static logButtonClick(buttonName: string, context?: LogContext) {
    ErrorLogger.debug(`Button clicked: ${buttonName}`, null, { ...context, actionType: 'button_click' });
  }
}

// Export convenience functions
export const log = ErrorLogger;
export const perf = PerformanceLogger;
export const userAction = UserActionLogger;
export const handleError = ErrorHandler; 