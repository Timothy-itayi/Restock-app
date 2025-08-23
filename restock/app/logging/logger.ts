const isDev = process.env.NODE_ENV === 'development';

export const createLogger = (namespace: string) => ({
  log: (...args: any[]) => 
    isDev && console.log(`LOG  [${namespace}]`, ...args),
  warn: (...args: any[]) => 
    isDev && console.warn(`WARN [${namespace}]`, ...args),
  error: (...args: any[]) => 
    console.error(`ERR  [${namespace}]`, ...args),
  info: (...args: any[]) => 
    isDev && console.info(`INFO [${namespace}]`, ...args),
  debug: (...args: any[]) => 
    isDev && console.debug(`DEBUG [${namespace}]`, ...args),
});

// Convenience loggers for common namespaces
export const authLogger = createLogger('Auth');
export const profileLogger = createLogger('Profile');
export const clerkLogger = createLogger('Clerk');
export const supabaseLogger = createLogger('Supabase');
export const sessionLogger = createLogger('Session');
export const guardLogger = createLogger('Guard');
