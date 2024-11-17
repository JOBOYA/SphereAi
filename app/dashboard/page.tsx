'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { authService } from '@/app/services/auth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AIChat } from "@/app/models/ai-chat";
import { useAuth } from '@/app/contexts/AuthContext';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const handleAfterSignIn = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) {
        console.log('⚠️ Pas d\'email disponible dans user');
        return;
      }

      console.log('👤 Utilisateur détecté:', user.primaryEmailAddress.emailAddress);

      try {
        const userData = {
          email: user.primaryEmailAddress.emailAddress,
          password: user.id,
        };

        console.log('🔄 Préparation de l\'appel API avec:', userData);
        const response = await authService.login(userData);

        if (response.tokens?.access) {
          setAccessToken(response.tokens.access);
          console.log('🔑 Token d\'accès stocké');
        }

        console.log('✅ Réponse complète:', {
          message: response.message,
          data: response,
        });
      } catch (error: any) {
        console.error('💥 Erreur détaillée:', {
          message: error.message,
          error: error
        });
      }
    };

    if (isLoaded && user) {
      console.log('🚀 Démarrage handleAfterSignIn');
      handleAfterSignIn();
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

