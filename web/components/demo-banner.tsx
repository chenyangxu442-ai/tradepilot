import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// 演示模式横幅：未配置 AI Key 时生成的是示例内容，避免用户误当真邮件/报价发出去
export function DemoBanner() {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div>
        <p className="font-medium text-amber-600 dark:text-amber-400">
          演示模式 · 当前显示的是示例内容
        </p>
        <p className="text-muted-foreground">
          还没配置 AI Key，以下内容不能直接使用。
          <Link href="/settings" className="ml-1 text-primary hover:underline">
            去配置 AI →
          </Link>
        </p>
      </div>
    </div>
  );
}
