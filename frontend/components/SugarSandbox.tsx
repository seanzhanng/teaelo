'use client';

import { useEffect, useRef } from 'react';

class SugarParticle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;

  constructor(width: number, height: number) {
    // Random home position across the canvas
    this.homeX = Math.random() * width;
    this.homeY = Math.random() * height;
    // Start at home position
    this.x = this.homeX;
    this.y = this.homeY;
    // Initial velocity
    this.vx = 0;
    this.vy = 0;
    // Fixed size for all particles
    this.size = 2;
    // All particles same color - brown sugar shade
    this.color = '#C27E33';
  }

  update(cursorX: number, cursorY: number, width: number, height: number) {
    const dx = this.x - cursorX;
    const dy = this.y - cursorY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Direct pushing when cursor is nearby - like a finger in sand
    if (distance < 100 && distance > 0) {
      const force = (100 - distance) / 100; // Normalized force (0-1)
      const angle = Math.atan2(dy, dx);
      // Much faster repulsion - stronger direct push
      const pushStrength = 1;
      this.vx += Math.cos(angle) * force * pushStrength;
      this.vy += Math.sin(angle) * force * pushStrength;
      
      // Update home position to match current position when pushed - sand stays where moved
      const homeUpdateRate = 0.1 * force; // Faster update when pushed harder
      this.homeX += (this.x - this.homeX) * homeUpdateRate;
      this.homeY += (this.y - this.homeY) * homeUpdateRate;
    }

    // Very weak return force - sand mostly stays where it is
    const springStrength = 0.005;
    const springDx = this.homeX - this.x;
    const springDy = this.homeY - this.y;
    this.vx += springDx * springStrength;
    this.vy += springDy * springStrength;

    // High friction like sand - particles settle quickly
    const friction = 0.92;
    this.vx *= friction;
    this.vy *= friction;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Keep particles within bounds (soft boundaries)
    if (this.x < 0) this.x = 0;
    if (this.x > width) this.x = width;
    if (this.y < 0) this.y = 0;
    if (this.y > height) this.y = height;
    
    // Keep home positions within bounds
    if (this.homeX < 0) this.homeX = 0;
    if (this.homeX > width) this.homeX = width;
    if (this.homeY < 0) this.homeY = 0;
    if (this.homeY > height) this.homeY = height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw sand grain as small square/rectangle for more natural look
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 1; // Fixed opacity for all particles
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}

export default function SugarSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SugarParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const cursorRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reinitialize particles if they don't exist or if dimensions changed significantly
      if (particlesRef.current.length === 0) {
        const particleCount = 2000; // 1500-2000 particles
        particlesRef.current = Array.from(
          { length: particleCount },
          () => new SugarParticle(canvas.width, canvas.height)
        );
      } else {
        // Update home positions on resize
        particlesRef.current.forEach((particle) => {
          particle.homeX = Math.random() * canvas.width;
          particle.homeY = Math.random() * canvas.height;
        });
      }
    };

    resizeCanvas();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas with milk-tea background (matching header)
      ctx.fillStyle = '#ebddd0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        particle.update(cursorRef.current.x, cursorRef.current.y, canvas.width, canvas.height);
        particle.draw(ctx);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}

