import { NativeModules, Platform } from 'react-native';

declare global {
  // Provided by React Native internally
  // eslint-disable-next-line no-var
  var nativeLoggingHook: undefined | ((message: string, level?: number) => void);
}

const { NativeLogger } = NativeModules as {
  NativeLogger?: { log: (message: string) => void };
};

export function nativeLog(message: string) {
  const formatted = `[RESTOCK_NATIVE] ${message}`;

  if (Platform.OS === 'ios') {
    if (NativeLogger?.log) {
      try {
        NativeLogger.log(formatted);
        return;
      } catch {
        // fall through to RN hook / console
      }
    }
    if (typeof global.nativeLoggingHook === 'function') {
      try {
        global.nativeLoggingHook(formatted, 0);
        return;
      } catch {
        // fall through to console.log below
      }
    }
  }

  console.log(formatted);
}

