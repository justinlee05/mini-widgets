'use client';

import { useEffect, useState } from 'react';

export const useSyncStorage = <T extends unknown>(
  key: string,
  inputValue: T,
  onSync: (value: T) => void
) => {
  const [isSyncing, setIsSyncing] = useState(true);

  const loadFromStorage = () => {
    const valueFromStorage = window.localStorage.getItem(key);

    if (valueFromStorage) {
      try {
        const parsedValue = JSON.parse(valueFromStorage);
        onSync(parsedValue as T);
      } catch (error) {
        console.error(`Error parsing value for key "${key}":`, error);
      }
    }
    setIsSyncing(false);
  };

  const saveToStorage = () => {
    window.localStorage.setItem(key, JSON.stringify(inputValue));
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (inputValue === undefined || inputValue === null) return;

    saveToStorage();
  }, [inputValue]);

  return {
    isSyncing,
  };
};
