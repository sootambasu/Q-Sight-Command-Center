import { useEffect, useState, useRef } from 'react';

const DEFAULT_POLL_INTERVAL_MS = 15000;
const MIN_POLL_INTERVAL_MS = 10000;

export function usePolling(onPoll: () => Promise<void>) {
  // Read environment variable with fallback
  const envVal = import.meta.env.VITE_POLL_INTERVAL_MS;
  const parsedEnv = envVal ? parseInt(envVal, 10) : DEFAULT_POLL_INTERVAL_MS;
  const intervalMs = isNaN(parsedEnv) ? DEFAULT_POLL_INTERVAL_MS : Math.max(MIN_POLL_INTERVAL_MS, parsedEnv);

  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(Math.ceil(intervalMs / 1000));
  const onPollRef = useRef(onPoll);

  // Keep callback reference updated to avoid stale closures in setInterval
  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  // Effect to handle ticking countdown every second
  useEffect(() => {
    if (!isPollingActive) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Trigger the poll callback asynchronously
          onPollRef.current().catch((err) => console.error('Polling error:', err));
          return Math.ceil(intervalMs / 1000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPollingActive, intervalMs]);

  // Manual trigger
  const triggerRefresh = async () => {
    setSecondsRemaining(Math.ceil(intervalMs / 1000));
    await onPollRef.current();
  };

  return {
    isPollingActive,
    setIsPollingActive,
    secondsRemaining,
    totalSeconds: Math.ceil(intervalMs / 1000),
    triggerRefresh,
    intervalMs
  };
}
