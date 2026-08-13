'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from '@/components/app-sidebar';
import { Topbar } from '@/components/topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col min-w-0">
          <Topbar />
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
