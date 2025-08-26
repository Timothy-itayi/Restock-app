import {
  isDevelopmentEnvironment
} from "./chunk-7HPDNZ3R.mjs";

// src/utils/allSettled.ts
function allSettled(iterable) {
  const promises = Array.from(iterable).map(
    (p) => p.then(
      (value) => ({ status: "fulfilled", value }),
      (reason) => ({ status: "rejected", reason })
    )
  );
  return Promise.all(promises);
}

// src/utils/logErrorInDevMode.ts
var logErrorInDevMode = (message) => {
  if (isDevelopmentEnvironment()) {
    console.error(`Clerk: ${message}`);
  }
};

// src/utils/fastDeepMerge.ts
var fastDeepMergeAndReplace = (source, target) => {
  if (!source || !target) {
    return;
  }
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== null && typeof source[key] === `object`) {
      if (target[key] === void 0) {
        target[key] = new (Object.getPrototypeOf(source[key])).constructor();
      }
      fastDeepMergeAndReplace(source[key], target[key]);
    } else if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
};
var fastDeepMergeAndKeep = (source, target) => {
  if (!source || !target) {
    return;
  }
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== null && typeof source[key] === `object`) {
      if (target[key] === void 0) {
        target[key] = new (Object.getPrototypeOf(source[key])).constructor();
      }
      fastDeepMergeAndKeep(source[key], target[key]);
    } else if (Object.prototype.hasOwnProperty.call(source, key) && target[key] === void 0) {
      target[key] = source[key];
    }
  }
};

// src/utils/uuid.ts
function generateUuid() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex = [];
    for (let i = 0; i < bytes.length; i++) {
      hex.push((bytes[i] + 256).toString(16).substring(1));
    }
    return hex[0] + hex[1] + hex[2] + hex[3] + "-" + hex[4] + hex[5] + "-" + hex[6] + hex[7] + "-" + hex[8] + hex[9] + "-" + hex[10] + hex[11] + hex[12] + hex[13] + hex[14] + hex[15];
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}

export {
  allSettled,
  logErrorInDevMode,
  fastDeepMergeAndReplace,
  fastDeepMergeAndKeep,
  generateUuid
};
//# sourceMappingURL=chunk-AM765UKU.mjs.map