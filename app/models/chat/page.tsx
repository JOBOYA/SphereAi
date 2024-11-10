'use client';

import { AIChat } from "@/components/models/ai-chat";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ChatPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="lg:hidden">
              <SidebarTrigger />
            </div>
          </div>
          <div className="flex-1 w-full">
            <AIChat />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
} 