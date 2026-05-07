import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export default function FirmamentDecor() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20 select-none" aria-hidden="true">
      {/* Orbital Ring 1 */}
      <motion.div
        animate={!shouldReduceMotion ? { rotate: 360 } : {}}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-gold/10 rounded-full"
      />
      
      {/* Orbital Ring 2 */}
      <motion.div
        animate={!shouldReduceMotion ? { rotate: -360 } : {}}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-gold/5 rounded-[45%]"
      />

      {/* Pulsing Core behind Hero */}
      <motion.div
        animate={!shouldReduceMotion ? { scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 blur-[100px] rounded-full"
      />

      {/* Static Sparkle points */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.1 }}
          animate={!shouldReduceMotion ? { opacity: [0.1, 0.4, 0.1], scale: [1, 1.2, 1] } : {}}
          transition={{ 
            duration: 4 + i, 
            repeat: Infinity, 
            delay: i * 0.5,
            ease: "easeInOut" 
          }}
          style={{
            top: `${20 + i * 12}%`,
            left: `${15 + (i % 3) * 20}%`,
          }}
          className="absolute w-1 h-1 bg-gold rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
}
