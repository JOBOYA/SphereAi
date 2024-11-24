'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { AIChat } from "@/app/models/ai-chat";
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/app/contexts/AuthContext';
import { authService } from '@/app/services/auth';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        const userData = {
          email: user.primaryEmailAddress.emailAddress,
          clerk_id: user.id
        };

        console.log('🔄 Initialisation auth dashboard...');
        const response = await authService.login(userData);

        if (response.tokens?.access) {
          console.log('✅ Token obtenu dans dashboard');
          setAccessToken(response.tokens.access);
        }
      } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
      }
    };

    if (isLoaded && user) {
      initializeAuth();
    }
  }, [user, isLoaded, setAccessToken]);

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

