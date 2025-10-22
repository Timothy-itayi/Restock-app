// Ensure RNGH is initialized before any navigation code
import 'react-native-gesture-handler';

// Early boot diagnostics
try {
  // Better stack traces in development
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('source-map-support/register');
} catch {}

// Early boot diagnostics
try {
  // eslint-disable-next-line no-undef
  if (global && global.ErrorUtils && typeof global.ErrorUtils.setGlobalHandler === 'function') {
    // eslint-disable-next-line no-undef
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      // Avoid crashing silently
      // eslint-disable-next-line no-console
      console.error('🚨 [entry] Global JS error', { isFatal, message: error?.message, stack: error?.stack });
    });
  }
} catch {}

// eslint-disable-next-line no-console
console.log('🧭 [entry] Loading expo-router entry...');
require('expo-router/entry');
// eslint-disable-next-line no-console
console.log('🧭 [entry] expo-router entry loaded');
