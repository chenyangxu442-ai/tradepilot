import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm text-center">
        <Compass className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="text-lg font-semibold mb-2">页面不存在</h1>
        <p className="text-sm text-muted-foreground mb-6">
          您访问的页面不存在或已被移除
        </p>
        <Link
          href="/mail"
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
