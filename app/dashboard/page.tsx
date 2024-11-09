'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { authService } from '@/app/services/auth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Dashboard() {
  const { user, isLoaded } = useUser();

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
          password: user.id, // Utiliser l'ID de l'utilisateur comme mot de passe
        };

        console.log('🔄 Préparation de l\'appel API avec:', userData);
        const response = await authService.login(userData);

        console.log('✅ Réponse complète:', {
          status: response.success,
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
  }, [user, isLoaded]);

  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main className="max-w-[75rem] w-full mx-auto">
          <SidebarTrigger />
          <div className="grid grid-cols-[1fr_20.5rem] gap-10 pb-10">
            <div>
              <header className="flex items-center justify-between w-full h-16 gap-4">
                <div className="flex items-center gap-2">
                  {user?.primaryEmailAddress?.emailAddress && (
                    <p>Connecté en tant que : {user.primaryEmailAddress.emailAddress}</p>
                  )}
                </div>
              </header>
            </div>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}

