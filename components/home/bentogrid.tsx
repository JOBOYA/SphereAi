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
  <div className="flex flex-col items-center text-left p-4 sm:p-6">
    <Icon className="w-10 h-10 text-white mb-4" />
    <h1 className="text-white text-2xl font-bold mb-2">{title}</h1>
    <p className="text-gray-400 text-lg">{description}</p>
  </div>
);

export const BentoBox1 = ({ language }: { language: Language }) => {
  const t = translations[language];
  return (
    <div className="flex justify-center items-center p-4 sm:p-6 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-5xl">
        <CardWithEffect>
          <IconCard icon={Brain} title={t.advancedAiModels} description={t.scalableInfrastructure} />
        </CardWithEffect>
        <CardWithEffect>
          <IconCard icon={Shield} title={t.privacyFirst} description={t.dataSecurity} />
        </CardWithEffect>
        <CardWithEffect>
          <IconCard icon={Cloud} title={t.apiIntegration} description={t.easyIntegration} />
        </CardWithEffect>
        <CardWithEffect>
          <IconCard icon={Zap} title={t.realTimeProcessing} description={t.optimizedPipeline} />
        </CardWithEffect>
      </div>
    </div>
  );
};

export const Bentodemo = ({ language }: { language: Language }) => (
  <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <BentoBox1 language={language} />
  </div>
);
