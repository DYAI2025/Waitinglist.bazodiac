import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export default function FusionRingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    const particles: Particle[] = [];
    const particleCount = 60;
    const connectionDistance = 150;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      initParticles();
    };

    const initParticles = () => {
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                size: Math.random() * 1.2 + 0.5
            });
        }
    };

    const getGoldColor = (alpha: number) => {
        const style = getComputedStyle(document.body);
        const gold = style.getPropertyValue('--gold').trim();
        // If gold is in hex format, we might need to convert it to rgba for alpha
        if (gold.startsWith('#')) {
            const r = parseInt(gold.slice(1, 3), 16);
            const g = parseInt(gold.slice(3, 5), 16);
            const b = parseInt(gold.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return gold; // fallback if already rgba or name
    };

    const draw = () => {
      if (!prefersReducedMotion) {
        time += 0.002;
      }
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const radius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
      const gold = getGoldColor(1);

      // Draw Connection Lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < connectionDistance) {
                  const alpha = (1 - dist / connectionDistance) * 0.15 * (0.5 + Math.sin(time * 5 + i) * 0.5);
                  ctx.strokeStyle = getGoldColor(alpha);
                  ctx.beginPath();
                  ctx.moveTo(particles[i].x, particles[i].y);
                  ctx.lineTo(particles[j].x, particles[j].y);
                  ctx.stroke();
              }
          }
      }

      // Draw Particles
      particles.forEach((p, i) => {
        const twinkle = Math.sin(time * 10 + i) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = getGoldColor(0.25 * twinkle);
        ctx.fill();

        if (!prefersReducedMotion) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = window.innerWidth;
            if (p.x > window.innerWidth) p.x = 0;
            if (p.y < 0) p.y = window.innerHeight;
            if (p.y > window.innerHeight) p.y = 0;
        }
      });

      ctx.save();
      ctx.translate(centerX, centerY);

      // Main Ring
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const animOffset = prefersReducedMotion ? 0 : Math.sin(time + i) * 10;
        ctx.arc(0, 0, radius + animOffset, 0, Math.PI * 2);
        ctx.strokeStyle = getGoldColor(0.1 - i * 0.02);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Rotating Segments
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12 + (prefersReducedMotion ? 0 : time);
        const x = Math.cos(angle) * (radius + (prefersReducedMotion ? 0 : Math.sin(time * 2) * 5));
        const y = Math.sin(angle) * (radius + (prefersReducedMotion ? 0 : Math.sin(time * 2) * 5));

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x * 1.05, y * 1.05);
        ctx.strokeStyle = getGoldColor(0.3);
        ctx.lineWidth = 2;
        ctx.stroke();

        if (i % 3 === 0) {
            ctx.fillStyle = getGoldColor(0.4);
            ctx.beginPath();
            ctx.arc(x * 1.05, y * 1.05, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      ctx.restore();
      animationFrameId = window.requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none opacity-60 mix-blend-screen [.light_&]:mix-blend-multiply transition-opacity duration-500"
      aria-hidden="true"
    />
  );
}
