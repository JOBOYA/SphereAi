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

// Ajout de la fonction de rafraîchissement du token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Pas de refresh token disponible');
    }

    const response = await fetch('https://appai.charlesagostinelli.com/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Échec du rafraîchissement du token');
    }

    const data = await response.json();
    localStorage.setItem('token', data.access);
    return data.access;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    throw error;
  }
};

// Modification de la fonction existante pour gérer le rafraîchissement
export const checkAndRefreshToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // Vérifier si le token est expiré
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Conversion en millisecondes
    
    if (Date.now() >= expirationTime) {
      // Token expiré, essayer de le rafraîchir
      const newToken = await refreshToken();
      return newToken;
    }
    
    return token;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return null;
  }
};

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