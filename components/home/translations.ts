
import { LinkPreview } from "@/components/ui/link-preview";

export type Language = 'en' | 'fr' | 'es';

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
  },
};
