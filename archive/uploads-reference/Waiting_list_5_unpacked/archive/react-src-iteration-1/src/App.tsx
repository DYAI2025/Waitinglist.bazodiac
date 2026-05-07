/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import FusionRingCanvas from './components/FusionRingCanvas';
import WaitlistBentoGrid from './components/WaitlistBentoGrid';
import WaitlistForm from './components/WaitlistForm';
import ThemeToggle from './components/ThemeToggle';
import FirmamentDecor from './components/FirmamentDecor';
import { AstrologyData } from './types';

export default function App() {
  const [referrals, setReferrals] = React.useState(0);
  const [isJoined, setIsJoined] = React.useState(false);
  const [signal, setSignal] = React.useState<{ element: string; zodiac: string } | null>(null);
  const [astrologyData, setAstrologyData] = React.useState<AstrologyData | null>(null);

  const heroTitle = "fused firmaments";

  return (
    <div className="min-h-screen bg-obsidian text-foreground font-sans flex flex-col overflow-hidden border-4 border-border-dark relative transition-colors duration-500">
      <div className="film-grain" />
      <div className="ambience-glow" />
      <FirmamentDecor />
      <FusionRingCanvas />
      
      {/* Header */}
      <header className="p-6 border-b border-gold/10 flex justify-between items-center bg-obsidian/80 backdrop-blur-md relative z-40 transition-colors duration-500">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center p-1">
            <div className="w-full h-full border border-gold/40 rounded-full animate-pulse"></div>
          </div>
          <span className="text-xs tracking-[0.5em] font-light uppercase text-gold">Bazodiac</span>
        </div>
        <div className="flex items-center space-x-4 md:space-x-6">
          <span className="text-[10px] font-mono text-gold/50 tracking-widest uppercase hidden sm:inline">Confidential Beta · 2026</span>
          <div className="hidden sm:block h-4 w-[1px] bg-gold/20"></div>
          <span className="text-[10px] font-mono text-foreground/40 tracking-widest hidden md:inline">DACH REGION ORIGIN</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-12 p-8 md:p-16 relative z-10 overflow-y-auto">
        {/* Left/Central Column: Hero & Form */}
        <div className="col-span-1 md:col-span-8 flex flex-col justify-start md:justify-center space-y-16">
          <section className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="h-[1px] w-12 bg-gold/40" />
              <p className="text-[11px] font-mono text-gold tracking-[0.4em] uppercase whitespace-nowrap">
                {signal ? "Signal Captured" : "Atemporal Alignment Platform"}
              </p>
            </motion.div>
            
            <motion.h1 
              key={heroTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-extralight tracking-tight leading-[1.05] uppercase text-gold max-w-4xl"
            >
              a framework<br/>
              of the<br/>
              <span className="text-foreground dark:text-white transition-colors duration-1000">{heroTitle}</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-base text-foreground/50 max-w-lg leading-relaxed font-light"
            >
              Synthesis of Western temporal cycles and Eastern elemental vectors. 
              Precision-mapped for the modern architect of fate.
            </motion.p>
          </section>

          <section id="hero_waitlist" className="max-w-2xl">
            <WaitlistForm 
              onJoin={() => setIsJoined(true)} 
              referrals={referrals} 
              setReferrals={setReferrals} 
              onSignalChange={setSignal}
              onAstrologyData={setAstrologyData}
            />
          </section>
        </div>

        {/* Top Right Sidebar: Data Dashboard */}
        <div className="col-span-1 md:col-span-4 flex flex-col items-end">
          <div className="w-full max-w-md">
            <WaitlistBentoGrid referrals={referrals} isJoined={isJoined} astrologyData={astrologyData} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center text-[9px] font-mono text-foreground/20 tracking-[0.2em] uppercase relative z-40 bg-obsidian/80 backdrop-blur-md transition-colors duration-500">
        <div>&copy; 2026 BAZODIAC TECHNOLOGIES</div>
        <div className="flex space-x-6 md:space-x-12 mt-4 md:mt-0">
          <span>Built for thinkers, not believers.</span>
          <span className="hidden lg:inline">Computed, not retrieved.</span>
          <span className="hidden lg:inline">Privacy by mathematics.</span>
        </div>
      </footer>
    </div>
  );
}
