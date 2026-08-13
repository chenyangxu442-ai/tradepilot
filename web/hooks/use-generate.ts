'use client';

import { useState, useCallback, useEffect } from 'react';
import { generate } from '@/lib/api';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { setGenerating } from '@/lib/loading';

export function useGenerate(module: string) {
  const [results, setResults] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const { items, save, clear } = useLocalStorage();

  // ponytail: auto-restore last result for this module on mount (survives tab switch)
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('mf_history') || '[]');
      const last = data.find((i: any) => i.module === module);
      if (last?.results) {
        setResults(last.results);
        setIsMock(!!(last.results as any)?.isMock);
      }
    } catch { /* empty */ }
  }, [module]);

  const submit = useCallback(async (inputs: Record<string, string>) => {
    setLoading(true);
    setGenerating(true);
    setError(null);
    try {
      const data = await generate(module, inputs);
      setResults(data);
      setIsMock(!!data.isMock);
      save({ module, inputs, results: data });
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : '未知错误';
      setError(msg);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }, [module, save]);

  // ponytail: restore results from a clicked history item
  const restore = useCallback((item: { results: unknown }) => {
    setResults(item.results);
    setIsMock(!!(item.results as any)?.isMock);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, loading, error, isMock, history: { items, save, clear }, submit, restore, reset };
}
