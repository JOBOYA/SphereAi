interface LoginResponse {
  token?: string;
  success: boolean;
}

export const authService = {
  async login(userData: { email: string; password?: string }): Promise<LoginResponse> {
    try {
      console.log('📡 Début de la requête login');
      
      const clerkToken = await fetch('/api/auth/getToken').then(res => res.text());

      // Envoyer uniquement l'email et le token Clerk
      const requestData = {
        email: userData.email,
        password: userData.password || 'dummy-password',
        clerk_token: clerkToken,
      };

      console.log('📦 Données envoyées:', requestData);

      const response = await fetch('/api/proxy/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🚫 Erreur de réponse:', errorData);
        throw new Error(errorData.error || 'Erreur d\'authentification');
      }

      const data = await response.json();
      console.log('📥 Données reçues:', data);

      return data;
    } catch (error: any) {
      console.error('❌ Erreur détaillée:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  async register(userData: { email: string; password: string }) {
    try {
      const clerkToken = await fetch('/api/auth/getToken').then(res => res.text());
      
      console.log('🚀 Tentative d\'inscription avec:', userData.email);
      const response = await fetch('/api/proxy/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({
          ...userData,
          clerk_token: clerkToken,
        }),
      });
      const data = await response.json();
      console.log('📥 Réponse du register:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      throw error;
    }
  }
}; 