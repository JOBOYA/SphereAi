import { useCallback } from 'react';
import { authService } from '@/app/services/auth';

export const useAuth = () => {
  const handleLogin = useCallback(async (userData: { email: string; password: string }) => {
    try {
      const response = await authService.login(userData);
      return response;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }, []);

  const handleRegister = useCallback(async (userData: { email: string; password: string }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }, []);

  return { handleLogin, handleRegister };
}; 