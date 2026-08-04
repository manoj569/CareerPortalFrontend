import { useCallback, useEffect, useState } from 'react';

export const useOtpCooldown = (initialSeconds = 0) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [secondsRemaining]);

  const restart = useCallback((seconds = 60) => {
    setSecondsRemaining(Math.max(0, Math.ceil(seconds)));
  }, []);

  return { restart, secondsRemaining };
};
