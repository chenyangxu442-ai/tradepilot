'use client';

import { useEffect } from 'react';
import { Compass } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm text-center">
        <Compass className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="text-lg font-semibold mb-2">页面出错了</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || '发生了未知错误，请刷新页面重试'}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          重试
        </button>
      </div>
    </div>
  );
}
