'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { authService } from '@/app/services/auth';
import { AIChat } from "@/app/models/ai-chat";
import { useAuth } from '@/src/app/contexts/AuthContext';

export default function ChatPage({ params }: { params: { conversationId: string } }) {
  const { user, isLoaded } = useUser();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const handleAfterSignIn = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) {
        console.log('⚠️ Pas d\'email disponible dans user');
        return;
      }

      try {
        const userData = {
          email: user.primaryEmailAddress.emailAddress,
          password: user.id,
        };

        const response = await authService.login(userData);

        if (response.tokens?.access) {
          setAccessToken(response.tokens.access);
        }
      } catch (error: any) {
        console.error('💥 Erreur:', error);
      }
    };

    if (isLoaded && user) {
      handleAfterSignIn();
    }
  }, [user, isLoaded, setAccessToken]);

  return <AIChat />;
} 