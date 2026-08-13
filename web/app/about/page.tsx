import { Compass, ExternalLink, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-xl border bg-card p-6 flex items-center gap-4">
        <Compass className="h-10 w-10 text-primary" />
        <div>
          <p className="text-xl font-bold">TradePilot</p>
          <p className="text-sm text-muted-foreground">AI 外贸工作台 · 桌面版</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">功能</h2>
        <p>
          ColdMail 开发信工厂 · CatalogX 产品目录 · PI Pilot 报价单 · ExpoKit 展会话术。
          内置 5 大行业知识库，自动注入行业术语与认证。
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">隐私</h2>
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            API Key 与公司信息仅保存在本机，AI 请求直接发给你选择的模型服务商，
            不经过任何第三方服务器。
          </p>
        </div>
        <p className="text-xs">
          卸载软件后，数据会留在本机的用户目录
          （<code className="rounded bg-muted px-1">%APPDATA%/tradepilot</code>），
          如需彻底清除请手动删除该文件夹。
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">开源</h2>
        <p>本项目基于 MIT 协议开源，可自由使用、修改、商用。</p>
        <Link
          href="https://github.com"
          target="_blank"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          GitHub 仓库
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground">版本 1.0.0</p>
    </div>
  );
}
