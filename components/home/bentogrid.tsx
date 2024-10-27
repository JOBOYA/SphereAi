"use client";

import React, { useState } from 'react';
import { Language, translations } from "@/components/home/translations";




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
      style={{ willChange: 'transform' }}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: '300px',
            height: '300px',
            top: mousePosition.y - 150,
            left: mousePosition.x - 150,
            background: '#5D2CA8',
            filter: 'blur(100px)',
            transform: 'translate(-0%, -0%)',
            zIndex: 10,
            willChange: 'transform, top, left',
          }}
        />
      )}
      {children}
    </div>
  );
};

const AWSIcon = ({ language }: { language: Language }) => {
  const t = translations[language];
  return (
    <div className="flex flex-col justify-center h-full items-center relative">
      <div className="text-left p-4 sm:p-6">
        <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">{t.apiIntegration}</h1>
        <p className="text-gray-400 text-base sm:text-lg">{t.easyIntegration}</p>
      </div>
    </div>
  );
};


export const BentoBox1 = ({ language }: { language: Language }) => {
  const t = translations[language];
  return (
    <div className="flex justify-center items-center p-4 sm:p-5 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
        <CardWithEffect>
          <div className="flex flex-col justify-between h-full">
            <div className="mb-4 px-4 sm:px-6 mt-4 sm:mt-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6 pb-2">
               
                <h2 className="text-white/70 text-lg sm:text-xl">{t.advancedAiModels}</h2>
                
              </div>
            </div>
            <div className="text-left p-4 sm:p-6">
              
              <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">{t.scalableInfrastructure}</h1>
              
              <p className="text-white/70 text-base sm:text-lg">{t.cloudArchitecture}</p>
            </div>
          </div>
        </CardWithEffect>
        <CardWithEffect>
          <div className="flex flex-col justify-center h-full">
            <div className="text-left p-4 sm:p-6">
              <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">{t.privacyFirst}</h1>
              <p className="text-white/70 text-base sm:text-lg">{t.dataSecurity}</p>
            </div>
          </div>
        </CardWithEffect>
        <CardWithEffect>
          <AWSIcon language={language} />
        </CardWithEffect>
        <CardWithEffect>
          <div className="flex flex-col justify-center h-full items-center relative">
            <div className="text-left p-4 sm:p-6">
              <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">{t.realTimeProcessing}</h1>
              <p className="text-white/70 text-base sm:text-lg">{t.optimizedPipeline}</p>
            </div>
          </div>
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
