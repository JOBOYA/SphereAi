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
      
      // Tenter d'abord le login
      let response = await fetch("/api/proxy/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userData.email
        })
      });

      // Si l'utilisateur n'existe pas, on tente de le créer
      if (response.status === 404) {
        console.log("👤 Utilisateur non trouvé, tentative d'inscription");
        
        response = await fetch("/api/proxy/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: userData.email,
            first_name: "",
            last_name: ""
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Erreur inscription:", errorData);
          throw new Error(errorData.detail || "Erreur lors de l'inscription");
        }

        // Une fois inscrit, on retente le login
        response = await fetch("/api/proxy/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: userData.email
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur login:", errorData);
        throw new Error(errorData.detail || "Erreur d'authentification");
      }

      const data = await response.json();
      console.log("✅ Login réussi");
      return data;
    } catch (error: any) {
      console.error("🚨 Erreur d'authentification:", error);
      throw error;
    }
  },

  async register(userData: { email: string; first_name?: string; last_name?: string }) {
    try {
      console.log("🔄 Début du processus d'inscription");
      
      const response = await fetch("/api/proxy/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.first_name || "",
          last_name: userData.last_name || ""
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