'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AIChat } from "@/components/models/ai-chat";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <div className="flex-none p-4 border-b lg:hidden">
            <SidebarTrigger />
          </div>
          <div className="flex-1 w-full">
            <AIChat />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

