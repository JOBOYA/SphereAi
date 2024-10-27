import { Language } from "prism-react-renderer";



export const translations: Record<Language, {
  title: string;
  subtitle: string;
  description: string;
  getStarted: string;
  dashboard: string;
  liveDemo: string;
  features: string;
  featuresTitle: string;
  pricing: string;
  pricingDescription: string;
  ready: string;
  join: string;
  stayUpdated: string;
  newsletter: string;
  notifyMe: string;
  emailPlaceholder: string;
  apiIntegration: string;
  easyIntegration: string;
  advancedAiModels: string;
  scalableInfrastructure: string;
  cloudArchitecture: string;
  privacyFirst: string;
  dataSecurity: string;
  realTimeProcessing: string;
  optimizedPipeline: string;
  pricingPlans: Array<{ name: string; price: string; description: string; features: string[] }>;
}> = {
  en: {
    title: "Transform Your Workflow with",
    subtitle: "AI-Powered Intelligence",
    description: "Harness the power of artificial intelligence to automate tasks, optimize processes, and make data-driven decisions fast for modern teams.",
    getStarted: "Get Started",
    dashboard: "Dashboard",
    liveDemo: "Live Demo",
    features: "Features",
    featuresTitle: "Powerful Features for Modern Teams",
    pricing: "Choose the Perfect Plan for Your Team",
    pricingDescription: "Select a plan that fits your needs and scale as you grow",
    ready: "Ready to Transform Your Workflow?",
    join: "Join thousands of teams already using AISpere.",
    stayUpdated: "Stay Updated",
    newsletter: "Get the latest news and updates from AISpere delivered straight to your inbox.",
    notifyMe: "Notify me",
    emailPlaceholder: "Enter your email",
    apiIntegration: "API Integration",
    easyIntegration: "Easy integration with your existing tools and workflows",
    advancedAiModels: "Advanced AI Models",
    scalableInfrastructure: "Scalable Infrastructure",
    cloudArchitecture: "Cloud Architecture",
    privacyFirst: "Privacy First",
    dataSecurity: "Data Security",
    realTimeProcessing: "Real-Time Processing",
    optimizedPipeline: "Optimized Pipeline",
    pricingPlans: [
      {
        name: "Starter",
        price: "$29",
        description: "Perfect for small teams and startups",
        features: ["Up to 5 team members", "Basic AI assistance", "10 GB storage", "Email support"]
      },
      {
        name: "Pro",
        price: "$99",
        description: "Ideal for growing businesses",
        features: ["Up to 20 team members", "Advanced AI features", "50 GB storage", "Priority support"]
      },
      {
        name: "Enterprise",
        price: "Custom",
        description: "For large organizations with specific needs",
        features: ["Unlimited team members", "Custom AI solutions", "Unlimited storage", "24/7 dedicated support"]
      },
    ]
  },
  fr: {
    title: "Transformez votre flux de travail avec",
    subtitle: "Intelligence alimentée par l'IA",
    description: "Exploitez la puissance de l'intelligence artificielle pour automatiser les tâches, optimiser les processus et prendre des décisions basées sur les données rapidement pour les équipes modernes.",
    getStarted: "Commencer",
    dashboard: "Tableau de bord",
    liveDemo: "Démo en direct",
    features: "Fonctionnalités",
    featuresTitle: "Fonctionnalités puissantes pour les équipes modernes",
    pricing: "Choisissez le plan parfait pour votre équipe",
    pricingDescription: "Sélectionnez un plan qui correspond à vos besoins et évoluez à mesure que vous grandissez",
    ready: "Prêt à transformer votre flux de travail ?",
    join: "Rejoignez des milliers d'équipes qui utilisent déjà AISpere.",
    stayUpdated: "Restez informé",
    newsletter: "Recevez les dernières nouvelles et mises à jour d'AISpere directement dans votre boîte de réception.",
    notifyMe: "Me notifier",
    emailPlaceholder: "Entrez votre email",
    apiIntegration: "Intégration API",
    easyIntegration: "Intégration facile avec vos outils et workflows existants",
    advancedAiModels: "Modèles d'IA avancés",
    scalableInfrastructure: "Infrastructure évolutive",
    cloudArchitecture: "Architecture en cloud",
    privacyFirst: "Confidentialité d'abord",
    dataSecurity: "Sécurité des données",
    realTimeProcessing: "Traitement en temps réel",
    optimizedPipeline: "Pipeline optimisé",
    pricingPlans: [
      {
        name: "Débutant",
        price: "29€",
        description: "Parfait pour les petites équipes et les startups",
        features: ["Jusqu'à 5 membres d'équipe", "Assistance IA de base", "10 Go de stockage", "Support par e-mail"]
      },
      {
        name: "Pro",
        price: "99€",
        description: "Idéal pour les entreprises en croissance",
        features: ["Jusqu'à 20 membres d'équipe", "Fonctionnalités avancées d'IA", "50 Go de stockage", "Support prioritaire"]
      },
      {
        name: "Entreprise",
        price: "Personnalisé",
        description: "Pour les grandes organisations ayant des besoins spécifiques",
        features: ["Membres illimités", "Solutions IA sur mesure", "Stockage illimité", "Support dédié 24/7"]
      },
    ]
  },
  es: {
    title: "Transforma tu flujo de trabajo con",
    subtitle: "Inteligencia impulsada por IA",
    description: "Aprovecha el poder de la inteligencia artificial para automatizar tareas, optimizar procesos y tomar decisiones basadas en datos rápidamente para equipos modernos.",
    getStarted: "Comenzar",
    dashboard: "Panel de control",
    liveDemo: "Demo en vivo",
    features: "Características",
    featuresTitle: "Potentes características para equipos modernos",
    pricing: "Elige el plan perfecto para tu equipo",
    pricingDescription: "Selecciona un plan que se adapte a tus necesidades y escala a medida que creces",
    ready: "¿Listo para transformar tu flujo de trabajo?",
    join: "Únete a miles de equipos que ya usan AISpere.",
    stayUpdated: "Mantente actualizado",
    newsletter: "Recibe las últimas noticias y actualizaciones de AISpere directamente en tu bandeja de entrada.",
    notifyMe: "Notificarme",
    emailPlaceholder: "Ingresa tu correo electrónico",
    apiIntegration: "Integración de API",
    easyIntegration: "Integración fácil con tus herramientas y flujos de trabajo existentes",
    advancedAiModels: "Modelos de IA avanzados",
    scalableInfrastructure: "Infraestructura escalable",
    cloudArchitecture: "Arquitectura en la nube",
    privacyFirst: "Privacidad primero",
    dataSecurity: "Seguridad de datos",
    realTimeProcessing: "Procesamiento en tiempo real",
    optimizedPipeline: "Pipeline optimizado",
    pricingPlans: [
      {
        name: "Inicial",
        price: "$29",
        description: "Perfecto para equipos pequeños y startups",
        features: ["Hasta 5 miembros de equipo", "Asistencia de IA básica", "10 GB de almacenamiento", "Soporte por correo electrónico"]
      },
      {
        name: "Pro",
        price: "$99",
        description: "Ideal para empresas en crecimiento",
        features: ["Hasta 20 miembros de equipo", "Funciones avanzadas de IA", "50 GB de almacenamiento", "Soporte prioritario"]
      },
      {
        name: "Empresa",
        price: "Personalizado",
        description: "Para grandes organizaciones con necesidades específicas",
        features: ["Miembros ilimitados", "Soluciones de IA personalizadas", "Almacenamiento ilimitado", "Soporte dedicado 24/7"]
      },
    ]
  }
};
export type { Language };

