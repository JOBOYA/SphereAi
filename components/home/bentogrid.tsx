"use client";

import React, { useState } from 'react';
import { Language, translations } from "@/components/home/translations";
import { Brain, Shield, Cloud, Zap } from 'lucide-react';

const CardWithEffect = ({ children }: { children: React.ReactNode }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      className="relative bg-[#000] rounded-xl border border-white/30 p-4 overflow-hidden h-full min-h-[250px] flex-1"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute rounded-full transition duration-300"
          style={{
            width: '300px',
            height: '300px',
            top: mousePosition.y - 150,
            left: mousePosition.x - 150,
            background: '#5D2CA8',
            filter: 'blur(100px)',
            transform: 'translate(-0%, -0%)',
            zIndex: 10,
          }}
        />
      )}
      {children}
    </div>
  );
};

const IconCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex flex-col items-center text-left p-4 sm:p-6 relative z-20">
    <Icon className="w-10 h-10 text-white mb-4" />
    <h1 className="text-white text-2xl font-bold mb-2">{title}</h1>
    <p className="text-gray-400 text-lg">{description}</p>
  </div>
);

export const BentoBox1 = ({ language }: { language: Language }) => {
  const t = translations[language];
  
  const features = {
    fr: [
      {
        icon: Brain,
        title: "Intelligence Artificielle",
        description: "Modèles d'IA avancés pour des résultats optimaux"
      },
      {
        icon: Shield,
        title: "Sécurité Maximale",
        description: "Protection de vos données et confidentialité assurée"
      },
      {
        icon: Cloud,
        title: "Cloud Computing",
        description: "Infrastructure cloud performante et évolutive"
      },
      {
        icon: Zap,
        title: "Haute Performance",
        description: "Traitement rapide et résultats instantanés"
      }
    ],
    en: [
      {
        icon: Brain,
        title: "Artificial Intelligence",
        description: "Advanced AI models for optimal results"
      },
      {
        icon: Shield,
        title: "Maximum Security",
        description: "Data protection and privacy assured"
      },
      {
        icon: Cloud,
        title: "Cloud Computing",
        description: "Scalable and powerful cloud infrastructure"
      },
      {
        icon: Zap,
        title: "High Performance",
        description: "Fast processing and instant results"
      }
    ],
    es: [
      {
        icon: Brain,
        title: "Inteligencia Artificial",
        description: "Modelos de IA avanzados para resultados óptimos"
      },
      {
        icon: Shield,
        title: "Seguridad Máxima",
        description: "Protección de datos y privacidad garantizada"
      },
      {
        icon: Cloud,
        title: "Computación en la Nube",
        description: "Infraestructura cloud escalable y potente"
      },
      {
        icon: Zap,
        title: "Alto Rendimiento",
        description: "Procesamiento rápido y resultados instantáneos"
      }
    ]
  };

  return (
    <div className="flex justify-center items-center p-4 sm:p-6 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-5xl">
        {features[language].map((feature, index) => (
          <CardWithEffect key={index}>
            <IconCard 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description} 
            />
          </CardWithEffect>
        ))}
      </div>
    </div>
  );
};

export const Bentodemo = ({ language }: { language: Language }) => (
  <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <BentoBox1 language={language} />
  </div>
);
