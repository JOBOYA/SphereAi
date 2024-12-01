'use client'

import { 
  motion, 
  useMotionValue, 
  useScroll 
} from "framer-motion";
import { useEffect } from "react";

interface ParallaxTextProps {
  children: string;
  baseVelocity?: number;
}

export const ParallaxText = ({ children, baseVelocity = 100 }: ParallaxTextProps) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    let prevScrollY = 0;
    const handleScroll = () => {
      const diff = window.scrollY - prevScrollY;
      baseX.set(baseX.get() + diff * 0.1);
      prevScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [baseX]);

  return (
    <div className="overflow-hidden whitespace-nowrap flex">
      <motion.div
        style={{ x: baseX }}
        className="flex whitespace-nowrap text-6xl font-bold opacity-10"
      >
        <span className="block mr-4">{children} </span>
        <span className="block mr-4">{children} </span>
        <span className="block mr-4">{children} </span>
      </motion.div>
    </div>
  );
}; 