'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { MODULES } from "@/lib/constants";
import { isGenerating } from "@/lib/loading";

export function NavMain() {
  const pathname = usePathname();

  return (
    <>
      {MODULES.map((m, i) => {
        const active = pathname === m.href || pathname.startsWith(m.href + '/');
        const last = i === MODULES.length - 1;
        return (
          <SidebarMenuItem key={m.key} className={last ? '' : 'mb-4 pb-4 border-b'}>
            <SidebarMenuButton
              isActive={active}
              size="lg"
              render={
                <Link
                  href={m.href}
                  prefetch={true}
                  onClick={(e) => { if (isGenerating()) e.preventDefault(); }}
                />
              }
            >
              <m.icon className="h-7 w-7" />
              <div className="flex flex-col items-start gap-0.5 leading-none">
                <span className="text-lg font-semibold">{m.label}</span>
                <span className="text-base text-muted-foreground">{m.sub}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
