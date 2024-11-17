interface LoginResponse {
  message: string;
  tokens: {
    access: string;
    refresh: string;
  };
  user: {
    id: number;
    email: string;
    api_calls_remaining: number;
  };
}

export const authService = {
  async getClerkToken() {
    const response = await fetch("/api/auth/getToken");
    const data = await response.json();
    if (!response.ok || !data.token) {
      throw new Error("Impossible de récupérer le token");
    }
    return data.token;
  },

  async login(userData: { email: string; password?: string }): Promise<LoginResponse> {
    try {
      console.log("🔄 Début du processus de login");
      
      // Vérifier si on a déjà un token valide
      const existingToken = localStorage.getItem('accessToken');
      if (existingToken) {
        console.log("✅ Token existant trouvé, pas besoin de login");
        return {
          message: "Déjà connecté",
          tokens: {
            access: existingToken,
            refresh: ""
          },
          user: {
            id: 0,
            email: userData.email,
            api_calls_remaining: 0
          }
        };
      }
      
      // Récupérer le clerk token
      const clerkToken = await this.getClerkToken();
      
      // Faire directement le login sans register
      const response = await fetch("/api/proxy/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${clerkToken}`
        },
        body: JSON.stringify({
          email: userData.email
        })
      });

      if (!response.ok) {
        // Si l'utilisateur n'existe pas, alors faire le register
        if (response.status === 404) {
          await this.register({ email: userData.email });
          return this.login(userData); // Réessayer le login après register
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur d'authentification");
      }

      const data = await response.json();
      console.log("✅ Login réussi");
      
      localStorage.setItem('accessToken', data.tokens.access);
      return data;
    } catch (error: any) {
      console.error("🚨 Erreur d'authentification:", error);
      throw error;
    }
  },

  async register(userData: { email: string }) {
    try {
      console.log("🔄 Début du processus d'inscription");
      
      const clerkToken = await this.getClerkToken();
      
      const response = await fetch("/api/proxy/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${clerkToken}`
        },
        body: JSON.stringify({
          email: userData.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur inscription:", errorData);
        throw new Error(errorData.detail || "Erreur lors de l'inscription");
      }

      const data = await response.json();
      console.log("✅ Inscription réussie");
      return data;
    } catch (error) {
      console.error("🚨 Erreur lors de l'inscription:", error);
      throw error;
    }
  }
}; 