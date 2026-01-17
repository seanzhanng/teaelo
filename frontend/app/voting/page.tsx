'use client';

import { useState, useRef, useEffect } from 'react';
import BrandCard from '@/components/BrandCard';

interface Brand {
  id: string;
  name: string;
  logo_url: string;
  country_of_origin: string;
  elo: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  rank: number;
  established_date?: string;
}

interface EmojiParticle {
  id: string;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
}

// Placeholder brand data
const placeholderBrands: Brand[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Boba Guys',
    logo_url: 'https://via.placeholder.com/150/432f26/ebddd0?text=BG',
    country_of_origin: 'United States',
    elo: 1850.5,
    tier: 'A',
    rank: 12,
    established_date: '2011',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Gong Cha',
    logo_url: 'https://via.placeholder.com/150/432f26/ebddd0?text=GC',
    country_of_origin: 'Taiwan',
    elo: 1920.3,
    tier: 'S',
    rank: 8,
    established_date: '2006',
  },
];

const emojis = ['🧋', '💜', '⭐', '✨', '🎉', '💫', '🌟', '🥤'];

export default function VotingPage() {
  const [brands] = useState<Brand[]>(placeholderBrands);
  const [isVoting, setIsVoting] = useState(false);
  const [votedBrandId, setVotedBrandId] = useState<string | null>(null);
  const [revealedBrandIds, setRevealedBrandIds] = useState<Set<string>>(new Set());
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<EmojiParticle[]>([]);

  // Update particles ref when particles state changes
  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  // Animation loop for particles
  useEffect(() => {
    const animate = () => {
      setParticles((prev) => {
        const updated = prev
          .map((p) => {
            const newY = p.y + p.vy;
            const newX = p.x + p.vx;
            const newVy = p.vy + 0.5; // Gravity
            const newRotation = p.rotation + p.rotationSpeed;
            
            // Remove particles that fall off screen
            if (newY > window.innerHeight + 50) {
              return null;
            }
            
            return {
              ...p,
              x: newX,
              y: newY,
              vy: newVy,
              rotation: newRotation,
            };
          })
          .filter((p): p is EmojiParticle => p !== null);
        
        return updated;
      });
      
      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (particles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length]);

  const createParticles = (x: number, y: number) => {
    const newParticles: EmojiParticle[] = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = -5 - Math.random() * 3; // Initial upward velocity
      
      newParticles.push({
        id: `${Date.now()}-${i}`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x,
        y,
        vx,
        vy,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    
    setParticles((prev) => [...prev, ...newParticles]);
  };

  const handleVote = async (winnerId: string, event: React.MouseEvent) => {
    if (isVoting || votedBrandId) return;

    const loserId = brands.find((b) => b.id !== winnerId)?.id;
    if (!loserId) return;

    // Create particles at click position
    createParticles(event.clientX, event.clientY);

    // Reveal all cards when one is clicked
    setRevealedBrandIds(new Set(brands.map((b) => b.id)));

    setIsVoting(true);
    setVotedBrandId(winnerId);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId,
          loserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Vote failed');
      }

      // In the future, this would fetch new brands or show success message
      console.log('Vote submitted successfully');
    } catch (error) {
      console.error('Error submitting vote:', error);
      // Reset on error so user can try again
      setVotedBrandId(null);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="h-full overflow-hidden flex items-center justify-center relative">
      {/* Gradient Background - Splotchy darker milk tea in the middle */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(212, 196, 176, 0.7) 0%, transparent 50%),
            radial-gradient(circle at 48% 52%, rgba(196, 178, 154, 0.8) 0%, transparent 45%),
            radial-gradient(circle at 52% 48%, rgba(180, 160, 140, 0.6) 0%, transparent 55%),
            radial-gradient(circle at 50% 50%, rgba(212, 196, 176, 0.65) 0%, transparent 48%)
          `,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 relative z-10">
        {/* Dual Card Layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center max-w-5xl mx-auto -mt-16">
          {brands.map((brand) => (
            <div key={brand.id} className="flex-1 w-full max-w-md">
              <BrandCard
                brand={brand}
                onClick={(e) => handleVote(brand.id, e)}
                disabled={isVoting || !!votedBrandId}
                isRevealed={revealedBrandIds.has(brand.id)}
                isSelected={votedBrandId === brand.id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Emoji Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed pointer-events-none text-2xl z-50"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: `rotate(${particle.rotation}deg)`,
            transition: 'none',
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}

