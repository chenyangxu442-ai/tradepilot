'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { MODULE_TITLES } from "@/lib/constants";
import { Settings, Moon, Sun, Info } from "lucide-react";
import { useEffect, useState } from "react";

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const key = pathname.split('/')[1] || 'mail';
  const info = MODULE_TITLES[key] ?? MODULE_TITLES.mail;

  return (
    <header className="flex items-center gap-3 border-b px-6 py-4">
      <h1 className="text-lg font-semibold tracking-tight">{info.title}</h1>
      <span className="text-sm text-muted-foreground">{info.subtitle}</span>
      <div className="ml-auto flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={theme === 'dark' ? '切换到浅色' : '切换到深色'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        )}
        <Link
          href="/about"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="关于"
        >
          <Info className="h-3.5 w-3.5" />
          <span>关于</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="AI 设置"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>AI 设置</span>
        </Link>
      </div>
    </header>
  );
}
