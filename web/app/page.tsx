'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, BookOpen, DollarSign, HeartPulse, ArrowRight } from 'lucide-react';
import { getConfig } from '@/lib/api';

const MODULES = [
  { icon: Mail, title: 'ColdMail', sub: '开发信工厂' },
  { icon: BookOpen, title: 'CatalogX', sub: '产品目录' },
  { icon: DollarSign, title: 'PI Pilot', sub: '报价单 & PI' },
  { icon: HeartPulse, title: 'ExpoKit', sub: '展会急救包' },
];

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'setup' | 'ready'>('loading');

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        if (cfg.hasKey) { router.replace('/mail'); return; }
        setState('setup');
      })
      .catch(() => setState('setup'));
  }, [router]);

  if (state === 'loading') {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === 'ready') return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-8 py-16 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">欢迎使用 TradePilot</h1>
        <p className="text-muted-foreground">
          AI 外贸工作台：开发信 · 产品目录 · 报价单 · 展会话术
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {MODULES.map((m) => (
          <div key={m.title} className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left">
            <m.icon className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full rounded-xl border bg-card p-5 text-left space-y-2">
        <p className="font-semibold">开始使用只需 3 步：</p>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          <li>填一个 AI 服务商的 API Key（DeepSeek / OpenRouter / Claude 等都行）</li>
          <li>选模型、点「测试连接」确认能用</li>
          <li>回到任意模块开始生成</li>
        </ol>
      </div>

      <Link
        href="/settings"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        去配置 AI <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="text-xs text-muted-foreground">
        没 Key 也能先逛逛 → 会以「演示模式」返回示例内容
      </p>
    </div>
  );
}
