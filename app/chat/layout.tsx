'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="lg:hidden p-4 border-b flex-none">
            <SidebarTrigger />
          </div>
          <main className="flex-1 relative">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 