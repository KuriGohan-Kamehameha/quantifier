import { useState, useEffect, useCallback } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`quantifier_${key}`);
      if (stored !== null) return JSON.parse(stored);
    } catch {}
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`quantifier_${key}`, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  const setPersistedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(value);
  }, []);

  return [state, setPersistedState];
}
