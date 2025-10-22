// Lightweight render tracing utility with per-key counters and timestamps
type TraceState = {
  count: number;
  lastTs: number;
};

const globalKey = '__RENDER_TRACE_STATE__';

function getStore(): Record<string, TraceState> {
  const g: any = globalThis as any;
  if (!g[globalKey]) {
    g[globalKey] = {} as Record<string, TraceState>;
  }
  return g[globalKey] as Record<string, TraceState>;
}

export function traceRender(name: string, extra?: Record<string, any>) {
  const store = getStore();
  const now = Date.now();
  const prev = store[name] || { count: 0, lastTs: now };
  const next: TraceState = { count: prev.count + 1, lastTs: now };
  store[name] = next;
  const delta = now - prev.lastTs;
  // eslint-disable-next-line no-console
  console.log(`[Trace][${name}]`, { count: next.count, deltaMs: prev.count === 0 ? 0 : delta, ...(extra || {}) });
}


