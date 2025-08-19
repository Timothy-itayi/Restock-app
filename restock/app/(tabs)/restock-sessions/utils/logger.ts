// Enhanced logging utility for restock sessions

export const Logger = {
  info: (message: string, data?: any) => {
    console.log(`[RESTOCK-SESSIONS] ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  success: (message: string, data?: any) => {
    console.log(`[RESTOCK-SESSIONS] ✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  warning: (message: string, data?: any) => {
    console.warn(`[RESTOCK-SESSIONS] ⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message: string, error?: any, context?: any) => {
    console.error(`[RESTOCK-SESSIONS] ❌ ${message}`, {
      error: error ? JSON.stringify(error, null, 2) : 'No error object',
      context: context ? JSON.stringify(context, null, 2) : 'No context',
      timestamp: new Date().toISOString(),
      stack: error?.stack || 'No stack trace'
    });
  },
  debug: (message: string, data?: any) => {
    // Debug logging is always enabled for now
    console.log(`[RESTOCK-SESSIONS] 🔍 ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};