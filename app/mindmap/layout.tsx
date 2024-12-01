'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function MindmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <div className="flex-1 w-full overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
} 