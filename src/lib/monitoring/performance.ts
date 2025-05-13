const perfData: Record<string, number[]> = {};

export function startTimer(label: string) {
  return { label, start: Date.now() };
}

export function endTimer(timer: { label: string; start: number }) {
  const duration = Date.now() - timer.start;
  if (!perfData[timer.label]) perfData[timer.label] = [];
  perfData[timer.label].push(duration);
  return duration;
}

export function getPerfSummary() {
  return Object.entries(perfData).map(([label, arr]) => ({
    label,
    count: arr.length,
    avgMs: arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0,
    maxMs: arr.length ? Math.max(...arr) : 0,
    minMs: arr.length ? Math.min(...arr) : 0,
  }));
}

// DB 쿼리 성능 측정 예시
export async function measureDbQuery<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const timer = startTimer(label);
  try {
    return await fn();
  } finally {
    endTimer(timer);
  }
}

// 프론트엔드 Web Vitals 연동 구조(예시)
// export function reportWebVitals(metric: { name: string; value: number }) {
//   // perfData[metric.name] = perfData[metric.name] || [];
//   // perfData[metric.name].push(metric.value);
// } 