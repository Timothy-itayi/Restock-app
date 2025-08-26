// utils/logger.ts
export const log = {
    debug: (...args: any[]) => { if (__DEV__) return; }, // suppress verbose debug
    info: (...args: any[]) => { if (__DEV__) console.info('[INFO]', ...args); },
    warn: (...args: any[]) => { if (__DEV__) console.warn('[WARN]', ...args); },
    error: (...args: any[]) => { console.error('[ERROR]', ...args); } // always show
  };
  