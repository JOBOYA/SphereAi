'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { checkAndRefreshToken } from '../services/auth';

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('accessToken');
      console.log('🔄 Token initial:', savedToken ? 'Présent' : 'Absent');
      return savedToken;
    }
    return null;
  });

  useEffect(() => {
    const initToken = async () => {
      const token = await checkAndRefreshToken();
      setAccessToken(token);
    };

    initToken();
  }, []);

  useEffect(() => {
    console.log('🔐 État du token d\'accès:', accessToken ? 'Présent' : 'Absent');
    if (accessToken) {
      console.log('🔑 Début du token:', accessToken.substring(0, 20) + '...');
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [accessToken]);

  const handleSetAccessToken = (token: string | null) => {
    console.log('🔄 Mise à jour du token:', token ? 'Nouveau token reçu' : 'Token supprimé');
    setAccessToken(token);
  };

  const value = {
    accessToken,
    setAccessToken: handleSetAccessToken,
  };

  console.log('🏗️ AuthProvider rendu avec token:', accessToken ? 'Présent' : 'Absent');

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('❌ useAuth appelé en dehors du AuthProvider');
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  console.log('🎣 useAuth hook appelé, token:', context.accessToken ? 'Présent' : 'Absent');
  return context;
} 