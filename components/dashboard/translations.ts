export type Language = 'en' | 'fr' | 'es';

type DashboardTranslations = {
  [key in Language]: {
    title: string;
    welcome: string;
    navigation: {
      dashboard: string;
      conversation: string;
      image: string;
      video: string;
      code: string;
      settings: string;
    };
    stats: {
      totalGenerations: string;
      remainingCredits: string;
      usageLimit: string;
    };
    actions: {
      newProject: string;
      upgrade: string;
      logout: string;
    };
    chat: {
      placeholder: string;
      send: string;
      regenerate: string;
      clear: string;
      thinking: string;
      errorMessage: string;
      welcomeMessage: string;
      suggestions: string[];
    };
    sidebar: {
      menu: string;
      home: string;
      projects: string;
      chat: string;
      images: string;
      videos: string;
      code: string;
      settings: string;
      logout: string;
    };
    apiLimits: {
      title: string;
      description: string;
      remaining: string;
      upgrade: string;
      unlimited: string;
      used: string;
      total: string;
      freeTitle: string;
      freeDescription: string;
      proTitle: string;
      proDescription: string;
      proFeatures: string[];
    };
  };
};

export const dashboardTranslations: DashboardTranslations = {
  fr: {
    title: "Tableau de bord",
    welcome: "Bienvenue sur votre espace",
    navigation: {
      dashboard: "Tableau de bord",
      conversation: "Conversation",
      image: "Image",
      video: "Vidéo",
      code: "Code",
      settings: "Paramètres"
    },
    stats: {
      totalGenerations: "Générations totales",
      remainingCredits: "Crédits restants",
      usageLimit: "Limite d'utilisation"
    },
    actions: {
      newProject: "Nouveau projet",
      upgrade: "Améliorer",
      logout: "Déconnexion"
    },
    chat: {
      placeholder: "Posez votre question ici...",
      send: "Envoyer",
      regenerate: "Régénérer",
      clear: "Effacer",
      thinking: "En train de réfléchir...",
      errorMessage: "Une erreur est survenue. Veuillez réessayer.",
      welcomeMessage: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      suggestions: [
        "Comment puis-je commencer avec l'IA ?",
        "Générer une image créative",
        "Aide-moi avec mon code",
        "Optimise mon texte"
      ]
    },
    sidebar: {
      menu: "Menu",
      home: "Accueil",
      projects: "Projets",
      chat: "Discussion",
      images: "Images",
      videos: "Vidéos",
      code: "Code",
      settings: "Paramètres",
      logout: "Déconnexion"
    },
    apiLimits: {
      title: "Limite d'utilisation",
      description: "Vous avez utilisé {used} sur {total} générations gratuites",
      remaining: "Générations restantes",
      upgrade: "Passer au plan Pro",
      unlimited: "Illimité",
      used: "Utilisé",
      total: "Total",
      freeTitle: "Plan Gratuit",
      freeDescription: "Vous êtes actuellement sur le plan gratuit",
      proTitle: "Plan Pro",
      proDescription: "Passez au plan Pro pour des fonctionnalités illimitées",
      proFeatures: [
        "Générations illimitées",
        "Support prioritaire",
        "Fonctionnalités avancées",
        "API disponible"
      ]
    }
  },
  en: {
    title: "Dashboard",
    welcome: "Welcome to your workspace",
    navigation: {
      dashboard: "Dashboard",
      conversation: "Conversation",
      image: "Image",
      video: "Video",
      code: "Code",
      settings: "Settings"
    },
    stats: {
      totalGenerations: "Total Generations",
      remainingCredits: "Remaining Credits",
      usageLimit: "Usage Limit"
    },
    actions: {
      newProject: "New Project",
      upgrade: "Upgrade",
      logout: "Logout"
    },
    chat: {
      placeholder: "Ask your question here...",
      send: "Send",
      regenerate: "Regenerate",
      clear: "Clear",
      thinking: "Thinking...",
      errorMessage: "An error occurred. Please try again.",
      welcomeMessage: "Hello! How can I help you today?",
      suggestions: [
        "How can I get started with AI?",
        "Generate a creative image",
        "Help me with my code",
        "Optimize my text"
      ]
    },
    sidebar: {
      menu: "Menu",
      home: "Home",
      projects: "Projects",
      chat: "Chat",
      images: "Images",
      videos: "Videos",
      code: "Code",
      settings: "Settings",
      logout: "Logout"
    },
    apiLimits: {
      title: "Usage Limit",
      description: "You've used {used} out of {total} free generations",
      remaining: "Remaining generations",
      upgrade: "Upgrade to Pro",
      unlimited: "Unlimited",
      used: "Used",
      total: "Total",
      freeTitle: "Free Plan",
      freeDescription: "You are currently on the free plan",
      proTitle: "Pro Plan",
      proDescription: "Upgrade to Pro for unlimited features",
      proFeatures: [
        "Unlimited generations",
        "Priority support",
        "Advanced features",
        "API access"
      ]
    }
  },
  es: {
    title: "Panel de control",
    welcome: "Bienvenido a tu espacio",
    navigation: {
      dashboard: "Panel",
      conversation: "Conversación",
      image: "Imagen",
      video: "Video",
      code: "Código",
      settings: "Ajustes"
    },
    stats: {
      totalGenerations: "Generaciones totales",
      remainingCredits: "Créditos restantes",
      usageLimit: "Límite de uso"
    },
    actions: {
      newProject: "Nuevo proyecto",
      upgrade: "Mejorar",
      logout: "Cerrar sesión"
    },
    chat: {
      placeholder: "Haz tu pregunta aquí...",
      send: "Enviar",
      regenerate: "Regenerar",
      clear: "Limpiar",
      thinking: "Pensando...",
      errorMessage: "Ocurrió un error. Por favor, inténtalo de nuevo.",
      welcomeMessage: "¡Hola! ¿Cómo puedo ayudarte hoy?",
      suggestions: [
        "¿Cómo puedo empezar con la IA?",
        "Generar una imagen creativa",
        "Ayúdame con mi código",
        "Optimiza mi texto"
      ]
    },
    sidebar: {
      menu: "Menú",
      home: "Inicio",
      projects: "Proyectos",
      chat: "Chat",
      images: "Imágenes",
      videos: "Videos",
      code: "Código",
      settings: "Ajustes",
      logout: "Cerrar sesión"
    },
    apiLimits: {
      title: "Límite de uso",
      description: "Has usado {used} de {total} generaciones gratuitas",
      remaining: "Generaciones restantes",
      upgrade: "Actualizar a Pro",
      unlimited: "Ilimitado",
      used: "Usado",
      total: "Total",
      freeTitle: "Plan Gratuito",
      freeDescription: "Actualmente estás en el plan gratuito",
      proTitle: "Plan Pro",
      proDescription: "Actualiza a Pro para funciones ilimitadas",
      proFeatures: [
        "Generaciones ilimitadas",
        "Soporte prioritario",
        "Funciones avanzadas",
        "Acceso API"
      ]
    }
  }
}; 