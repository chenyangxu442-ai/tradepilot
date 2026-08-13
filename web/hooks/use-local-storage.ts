'use client';
import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'mf_history';
const MAX_ITEMS = 50;

interface HistoryItem {
  id: string;
  module: string;
  inputs: Record<string, string>;
  results: unknown;
  timestamp: string;
}

export function useLocalStorage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')); }
    catch { /* empty */ }
  }, []);

  const save = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const entry: HistoryItem = { ...item, id: Date.now().toString(), timestamp: new Date().toISOString() };
    setItems(prev => {
      const next = [entry, ...prev].slice(0, MAX_ITEMS);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.setItem(HISTORY_KEY, '[]');
    setItems([]);
  }, []);

  return { items, save, clear };
}
