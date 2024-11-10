export type Language = 'en' | 'fr' | 'es';

type Translations = {
  [key in Language]: {
    title: string;
    subtitle: string;
    description: string;
    features: string;
    featuresTitle: string;
    pricing: string;
    pricingDescription: string;
    getStarted: string;
    getStartedDescription: string;
    dashboard: string;
    liveDemo: string;
    liveDemoDescription: string;
    ready: string;
    join: string;
    stayUpdated: string;
    newsletter: string;
    notifyMe: string;
    emailPlaceholder: string;
    pricingPlans: Array<{
      name: string;
      description: string;
      price: string;
      features: string[];
    }>;
  };
};

export const translations: Translations = {
  fr: {
    title: "Sphere AI",
    subtitle: "L'Intelligence Artificielle au service de votre créativité",
    description: "Explorez les possibilités infinies de l'IA avec notre plateforme intuitive et puissante. Créez, innovez et transformez vos idées en réalité.",
    features: "Fonctionnalités",
    featuresTitle: "Une suite complète d'outils IA",
    pricing: "Tarification",
    pricingDescription: "Des plans adaptés à tous vos besoins",
    getStarted: "Commencer",
    getStartedDescription: "Commencez à utiliser Sphere AI dès aujourd'hui et transformez vos idées en réalité",
    dashboard: "Tableau de bord",
    liveDemo: "Voir la démo",
    liveDemoDescription: "Essayez notre plateforme en temps réel et découvrez la puissance de l'IA",
    ready: "Prêt à commencer ?",
    join: "Rejoignez la révolution IA",
    stayUpdated: "Restez informé",
    newsletter: "Inscrivez-vous pour recevoir nos dernières actualités",
    notifyMe: "M'inscrire",
    emailPlaceholder: "Votre email",
    pricingPlans: [
      {
        name: "Gratuit",
        description: "Pour découvrir nos services",
        price: "0€",
        features: [
          "5 générations par jour",
          "Accès aux modèles de base",
          "Support communautaire",
          "Mises à jour régulières"
        ]
      },
      {
        name: "Pro",
        description: "Pour les professionnels",
        price: "29€",
        features: [
          "Générations illimitées",
          "Accès à tous les modèles",
          "Support prioritaire",
          "API disponible",
          "Personnalisation avancée"
        ]
      },
      {
        name: "Entreprise",
        description: "Solutions sur mesure",
        price: "Sur devis",
        features: [
          "Déploiement personnalisé",
          "Modèles sur mesure",
          "Support dédié 24/7",
          "Formation incluse",
          "SLA garanti"
        ]
      }
    ]
  },
  en: {
    title: "Sphere AI",
    subtitle: "AI-Powered Creativity at Your Fingertips",
    description: "Explore endless AI possibilities with our intuitive and powerful platform. Create, innovate, and transform your ideas into reality.",
    features: "Features",
    featuresTitle: "Powerful Features for Modern Teams",
    pricing: "Pricing",
    pricingDescription: "Select a plan that fits your needs and scale as you grow",
    getStarted: "Get Started",
    getStartedDescription: "Start using Sphere AI today and transform your ideas into reality",
    dashboard: "Dashboard",
    liveDemo: "Live Demo",
    liveDemoDescription: "Try our platform in real-time and discover the power of AI",
    ready: "Ready to Transform Your Workflow?",
    join: "Join thousands of teams already using Sphere AI.",
    stayUpdated: "Stay Updated",
    newsletter: "Get the latest news and updates delivered straight to your inbox.",
    notifyMe: "Notify me",
    emailPlaceholder: "Enter your email",
    pricingPlans: [
      {
        name: "Free",
        description: "Perfect for trying out our services",
        price: "$0",
        features: [
          "5 generations per day",
          "Access to basic models",
          "Community support",
          "Regular updates"
        ]
      },
      {
        name: "Pro",
        description: "For professionals",
        price: "$29",
        features: [
          "Unlimited generations",
          "Access to all models",
          "Priority support",
          "API access",
          "Advanced customization"
        ]
      },
      {
        name: "Enterprise",
        description: "Custom solutions for your business",
        price: "Custom",
        features: [
          "Custom deployment",
          "Custom models",
          "24/7 dedicated support",
          "Training included",
          "SLA guaranteed"
        ]
      }
    ]
  },
  es: {
    title: "Sphere AI",
    subtitle: "La Inteligencia Artificial al servicio de tu creatividad",
    description: "Explora las posibilidades infinitas de la IA con nuestra plataforma intuitiva y potente.",
    features: "Características",
    featuresTitle: "Potentes características para equipos modernos",
    pricing: "Precios",
    pricingDescription: "Selecciona un plan que se adapte a tus necesidades",
    getStarted: "Comenzar",
    getStartedDescription: "Comienza a usar Sphere AI hoy y transforma tus ideas en realidad",
    dashboard: "Panel de control",
    liveDemo: "Demo en vivo",
    liveDemoDescription: "Prueba nuestra plataforma en tiempo real y descubre el poder de la IA",
    ready: "¿Listo para transformar tu flujo de trabajo?",
    join: "Únete a miles de equipos que ya usan Sphere AI",
    stayUpdated: "Mantente actualizado",
    newsletter: "Recibe las últimas noticias y actualizaciones directamente en tu correo.",
    notifyMe: "Notificarme",
    emailPlaceholder: "Tu correo electrónico",
    pricingPlans: [
      {
        name: "Gratis",
        description: "Perfecto para probar nuestros servicios",
        price: "$0",
        features: [
          "5 generaciones por día",
          "Acceso a modelos básicos",
          "Soporte comunitario",
          "Actualizaciones regulares"
        ]
      },
      {
        name: "Pro",
        description: "Para profesionales",
        price: "$29",
        features: [
          "Generaciones ilimitadas",
          "Acceso a todos los modelos",
          "Soporte prioritario",
          "Acceso API",
          "Personalización avanzada"
        ]
      },
      {
        name: "Empresa",
        description: "Soluciones personalizadas para tu negocio",
        price: "Personalizado",
        features: [
          "Implementación personalizada",
          "Modelos personalizados",
          "Soporte dedicado 24/7",
          "Capacitación incluida",
          "SLA garantizado"
        ]
      }
    ]
  }
};

