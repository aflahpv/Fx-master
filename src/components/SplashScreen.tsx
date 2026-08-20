import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
  theme?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar over exactly 2500ms (to match delay_ms)
    const totalDuration = 2500;
    const intervalTime = 50;
    const totalSteps = totalDuration / intervalTime;
    const increment = 100 / totalSteps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    // Auto redirect after 2500ms
    const timer = setTimeout(() => {
      setFading(true);
      const closeTimer = setTimeout(() => {
        onFinish();
      }, 500);
      return () => clearTimeout(closeTimer);
    }, totalDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      onFinish();
    }, 250);
  };

  return (
    <div 
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between cursor-pointer transition-opacity duration-500 select-none bg-[#080F1D] text-white p-6 overflow-hidden ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      id="splash-screen-container"
    >
      {/* Cinematic 3D Trading Floor Background Image with Gentle Zoom */}
      <motion.div 
        initial={{ scale: 1, opacity: 0.15 }}
        animate={{ scale: 1.05, opacity: 0.28 }}
        transition={{ duration: 2.8, ease: "easeOut" }}
        className="absolute inset-0 z-0"
        id="splash-bg-wrapper"
      >
        <img 
          src="/splash.jpg" 
          alt="Trading Floor Background" 
          className="w-full h-full object-cover filter contrast-110 brightness-95 blur-[1px]"
          referrerPolicy="no-referrer"
        />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080F1D] via-transparent to-[#080F1D] opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-lg w-full text-center px-4 mt-8">
        
        {/* Central Subject: Head Profile Candlestick Neural Hybrid SVG Logo */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
          id="splash-logo-container"
        >
          {/* Radial Glowing Background Pulse */}
          <div className="absolute -inset-6 bg-gradient-to-r from-[#D4AF37]/10 via-[#00C853]/5 to-[#D50000]/10 rounded-full blur-2xl animate-pulse" />
          
          <svg 
            viewBox="0 0 240 240" 
            className="w-48 h-48 drop-shadow-[0_0_25px_rgba(212,175,55,0.35)]"
            id="splash-hybrid-svg"
          >
            {/* Outline of Human Head in Profile facing right */}
            <path 
              d="M 75,195 
                 C 70,175 68,155 68,135 
                 C 68,85 102,45 145,45 
                 C 185,45 195,80 195,100 
                 C 195,105 200,107 203,110 
                 C 207,114 204,120 199,122 
                 C 196,128 197,133 192,137 
                 C 189,140 191,144 189,148 
                 C 185,155 177,162 173,169 
                 C 167,176 165,183 165,195" 
              fill="none" 
              stroke="#D4AF37" 
              strokeWidth="4.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            
            {/* Neural Brain Network Connections */}
            <g stroke="#D4AF37" strokeWidth="1.2" opacity="0.65">
              <line x1="125" y1="65" x2="150" y2="75" />
              <line x1="150" y1="75" x2="165" y2="100" />
              <line x1="125" y1="65" x2="135" y2="95" />
              <line x1="135" y1="95" x2="165" y2="100" />
              <line x1="135" y1="95" x2="120" y2="115" />
              <line x1="165" y1="100" x2="155" y2="130" />
              <line x1="120" y1="115" x2="155" y2="130" />
              <line x1="150" y1="75" x2="120" y2="115" />
            </g>
            
            {/* Neural Nodes (Brain Nodes) */}
            <g fill="#D4AF37">
              <circle cx="125" cy="65" r="4.5" className="animate-ping" style={{ animationDuration: '3s' }} />
              <circle cx="125" cy="65" r="4.5" />
              <circle cx="150" cy="75" r="4" />
              <circle cx="165" cy="100" r="4.5" />
              <circle cx="135" cy="95" r="4" />
              <circle cx="120" cy="115" r="4.5" />
              <circle cx="155" cy="130" r="4" />
            </g>
            
            {/* Candlestick Charts (Trading Left Half) */}
            {/* Candle 1 (Green) */}
            <line x1="88" y1="90" x2="88" y2="140" stroke="#00C853" strokeWidth="1.5" />
            <rect x="84" y="102" width="8" height="26" fill="#00C853" rx="1.5" />
            
            {/* Candle 2 (Red) */}
            <line x1="104" y1="105" x2="104" y2="160" stroke="#D50000" strokeWidth="1.5" />
            <rect x="100" y="115" width="8" height="32" fill="#D50000" rx="1.5" />
            
            {/* Candle 3 (Green) */}
            <line x1="120" y1="125" x2="120" y2="170" stroke="#00C853" strokeWidth="1.5" />
            <rect x="116" y="135" width="8" height="24" fill="#00C853" rx="1.5" />

            {/* Breakout Arrow (Up & Right) */}
            <path 
              d="M 140,55 L 175,20 M 175,20 L 160,20 M 175,20 L 175,35" 
              fill="none" 
              stroke="#D4AF37" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </motion.div>

        {/* Brand App Name Header with Montserrat Bold */}
        <motion.h1 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-4xl sm:text-5xl tracking-normal select-none"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}
          id="splash-title"
        >
          <span className="text-white" id="splash-prefix">FX</span>
          <span className="text-[#D48C2E] ml-2" id="splash-suffix">MASTER</span>
        </motion.h1>

        {/* Tagline text */}
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 0.85 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-3 text-xs sm:text-sm tracking-[0.25em] font-medium text-[#2E8B9A] uppercase"
          id="splash-tagline"
        >
          AI-POWERED INTELLIGENCE
        </motion.p>
      </div>

      {/* Elegant Glowing Progress bar */}
      <div className="relative z-10 w-full max-w-sm pb-10 px-4">
        <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-full p-1.5 shadow-2xl backdrop-blur-md">
          <div className="w-full bg-slate-900/60 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#D48C2E] via-emerald-500 to-[#2E8B9A] h-full rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
              id="splash-progress-indicator"
            />
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-2 tracking-widest uppercase">
          Initializing Terminal...
        </p>
      </div>
    </div>
  );
};
