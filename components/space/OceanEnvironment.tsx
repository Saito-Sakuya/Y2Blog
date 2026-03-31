'use client';

import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

// A simple deterministic pseudo-random generator
function lcg(seed: number) {
  return function () {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  baseOp: number;
  pulseSpeed: number;
  life: number;

  constructor(w: number, h: number, random: () => number) {
    this.x = random() * w;
    this.y = random() * h;
    // Ocean current drift: mostly upward and slightly rightward
    this.vx = (random() - 0.5) * 0.3 + 0.1; 
    this.vy = (random() - 0.5) * 0.3 - 0.5; 
    
    // Mix of 1px and 2px particles, rarely 3px
    const sizeRoll = random();
    this.size = sizeRoll > 0.9 ? 3 : sizeRoll > 0.5 ? 2 : 1; 

    // Harmonic Morandi pixel palette
    const palette = [
      '139, 122, 171', // accent-purple
      '201, 164, 184', // accent-pink
      '232, 196, 206', // accent-rose
      '168, 154, 184', // muted purple
      '144, 124, 166', // deep purple
    ];
    this.color = palette[Math.floor(random() * palette.length)];
    
    this.baseOp = random() * 0.2 + 0.1; // 0.1 to 0.3 base opacity
    this.pulseSpeed = random() * 0.02 + 0.005; // Different pulse rates
    this.life = random() * Math.PI * 2; // random sine wave phase
  }

  update(w: number, h: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.life += this.pulseSpeed;

    if (this.x < -10) this.x = w + 10;
    else if (this.x > w + 10) this.x = -10;

    if (this.y < -10) this.y = h + 10;
    else if (this.y > h + 10) this.y = -10;
  }
}

export default function OceanEnvironment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { particleEnabled, theme } = useAppStore();
  
  const isDarkRef = useRef(false);
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchEnd = () => {
      mousePos.current = { x: -1000, y: -1000 }; // Reset when finger leaves screen
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
      isDarkRef.current = theme === 'system' ? mediaQuery.matches : theme === 'dark';
    };
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [theme]);

  useEffect(() => {
    if (!particleEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', handleResize);

    const random = lcg(12345);
    // Doubled density again: 1 particle per 1000px^2 area. Under dark mode, fully rendered!
    const particleCount = w < 768 ? 400 : Math.floor((w * h) / 1000); 
    const particles = Array.from({ length: particleCount }, () => new Particle(w, h, random));

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      
      const isDark = isDarkRef.current;
      const renderCount = isDark ? particles.length : Math.floor(particles.length * 0.5);

      // Performance Optimization: Group by rendering color string to batch draw calls
      const buckets: Record<string, Particle[]> = {};

      for (let i = 0; i < renderCount; i++) {
        const p = particles[i];
        p.update(w, h);
        
        const pulse = Math.sin(p.life) * 0.1;
        let finalOp = p.baseOp + pulse;
        if (isDark) finalOp *= 3.5; 

        const dx = mousePos.current.x - p.x;
        const dy = mousePos.current.y - p.y;
        
        // Fast square distance check
        const distSq = dx * dx + dy * dy;
        if (distSq < 14400) { // 120^2
          const dist = Math.sqrt(distSq);
          finalOp += (120 - dist) * 0.02; 
          // Boost retreat speed and sensitivity significantly
          p.x -= (dx / dist) * 2.5;
          p.y -= (dy / dist) * 2.5;
        }

        // Quantize opacity to fewer steps (reduce number of unique color strings to max ~10 per color)
        let op = Math.max(0, Math.min(1, finalOp));
        op = Math.round(op * 10) / 10;

        if (op <= 0) continue;

        const colorStr = `rgba(${p.color}, ${op})`;
        let bucket = buckets[colorStr];
        if (!bucket) {
          bucket = [];
          buckets[colorStr] = bucket;
        }
        bucket.push(p);
      }

      // Execute batched rendering (fillRect is generally faster than paths for 1px/2px items)
      for (const colorStr in buckets) {
        ctx.fillStyle = colorStr;
        const pts = buckets[colorStr];
        for (let j = 0; j < pts.length; j++) {
          const p = pts[j];
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleEnabled]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: particleEnabled ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
}
