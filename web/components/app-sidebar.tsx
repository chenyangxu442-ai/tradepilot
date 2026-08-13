'use client';

import { Compass } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <div className="flex items-center gap-2 px-3 py-4">
          <Compass className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-bold leading-tight tracking-tight">TradePilot</span>
            <span className="text-sm leading-tight text-muted-foreground">AI Co-pilot for Global Trade</span>
          </div>
        </div>
        <SidebarGroup>
          <SidebarMenu>
            <NavMain />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2 text-xs text-muted-foreground">
          数据保存在本机
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
