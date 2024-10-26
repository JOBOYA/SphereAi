"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const logos = [
  "https://res.cloudinary.com/dl2adjye7/image/upload/v1716817722/Amazon_icon.svg_a4qmtg.png",
  "https://res.cloudinary.com/dl2adjye7/image/upload/v1716800282/Apple_logo_black.svg_seeetv.png",
  "https://res.cloudinary.com/dl2adjye7/image/upload/v1716800359/WISE.L-b3d3de3c_rexehe.png"
];

const lineWidth = 80;
const lineHeight = 2;

const LogoBeam = () => (
  <div className="flex items-center justify-center min-h-[208px]">
    <div className="relative flex items-center flex-wrap justify-center">
      <div className="bg-[#000] border border-white/30 rounded-2xl flex items-center justify-center w-14 h-14 p-4 m-2">
        <img src={logos[0]} alt="Logo 1" className="filter invert brightness-0" />
      </div>
      <div className="relative hidden sm:block" style={{ width: `${lineWidth}px`, height: `${lineHeight}px`, backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
        <motion.div
          className="absolute top-0 left-0 h-full w-10 bg-gradient-to-r from-transparent via-black to-transparent opacity-75"
          initial={{ x: '-40px' }}
          animate={{ x: `calc(${lineWidth}px + 40px)` }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            repeatDelay: 2.5,
            ease: 'linear',
          }}
          style={{ willChange: 'transform' }}
        />
      </div>
      <div className="relative bg-black border-2 border-white/70 rounded-2xl flex items-center justify-center w-16 h-16 p-4 overflow-hidden shadow-[0_0_15px_5px_#dbe0e2] m-2">
        <img src={logos[1]} alt="Logo 2" className="filter invert brightness-0" />
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          }}
          style={{ willChange: 'transform' }}
        />
      </div>
      <div className="relative hidden sm:block" style={{ width: `${lineWidth}px`, height: `${lineHeight}px`, backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
        <motion.div
          className="absolute top-0 right-0 h-full w-10 bg-gradient-to-r from-transparent via-black to-transparent opacity-75"
          initial={{ x: '40px' }}
          animate={{ x: `calc(-${lineWidth}px - 40px)` }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            repeatDelay: 3.5,
            ease: 'linear',
          }}
          style={{ willChange: 'transform' }}
        />
      </div>
      <div className="bg-black border border-white/30 rounded-2xl flex items-center justify-center w-14 h-14 p-4 m-2">
        <img src={logos[2]} alt="Logo 3" className="filter invert brightness-0" />
      </div>
    </div>
  </div>
);

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

const AWSIcon = () => (
  <div className="flex flex-col justify-center h-full items-center relative">
    <div className="text-left p-4 sm:p-6">
      <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">API Integration</h1>
      <p className="text-gray-400 text-base sm:text-lg">Easy integration with your existing tools and workflows.</p>
    </div>
  </div>
);

const BentoBox1 = () => (
  <div className="flex justify-center items-center p-4 sm:p-5 rounded-lg">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
      <CardWithEffect>
        <div className="flex flex-col justify-between h-full">
          <div className="mb-4 px-4 sm:px-6 mt-4 sm:mt-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6 pb-2">
              <h2 className="text-white/70 text-lg sm:text-xl">Advanced AI Models</h2>
            </div>
          </div>
          <div className="text-left p-4 sm:p-6">
            <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">Scalable Infrastructure</h1>
            <p className="text-white/70 text-base sm:text-lg">Built on cutting-edge cloud architecture that grows with you.</p>
          </div>
        </div>
      </CardWithEffect>
      <CardWithEffect>
        <div className="flex flex-col justify-center h-full">
          <div className="text-left p-4 sm:p-6">
            <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">Privacy First</h1>
            <p className="text-white/70 text-base sm:text-lg">Your data remains yours. Always encrypted, always secure.</p>
          </div>
        </div>
      </CardWithEffect>
      <CardWithEffect>
        <AWSIcon />
      </CardWithEffect>
      <CardWithEffect>
        <div className="flex flex-col justify-center h-full items-center relative">
          <div className="text-left p-4 sm:p-6">
            <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">Real-time Processing</h1>
            <p className="text-white/70 text-base sm:text-lg">Get instant results with our optimized processing pipeline.</p>
          </div>
        </div>
      </CardWithEffect>
    </div>
  </div>
);

function Bentodemo() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <BentoBox1 />
    </div>
  );
}

export default Bentodemo;