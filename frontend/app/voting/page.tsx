'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  price?: 1 | 2 | 3 | 4; // $ to $$$$
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
    logo_url: 'https://static1.squarespace.com/static/50ce46ece4b01020c34fd52b/t/6247fba73cb3cc54675fc60a/1648884647375/bobaguys_logo_FINAL+%283%29.png?format=1500w',
    country_of_origin: 'United States',
    elo: 1850.5,
    tier: 'A',
    rank: 12,
    established_date: '2011',
    price: 3, // $$$
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Gong Cha',
    logo_url: 'https://gong-cha-usa.com/wp-content/uploads/Gong-cha-vertical-logo-symbol-mark-540x540-opt.png',
    country_of_origin: 'Taiwan',
    elo: 1920.3,
    tier: 'S',
    rank: 8,
    established_date: '2006',
    price: 2, // $$
  },
];

const emojis = ['🧋', '💜', '⭐', '✨', '🎉', '💫', '🌟', '🥤'];

export default function VotingPage() {
  const [brands, setBrands] = useState<Brand[]>(placeholderBrands);
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

      // Placeholder: Update brands with new Elo, Rank, and Tier
      // In the future, this would come from the backend response
      setBrands((prevBrands) => {
        return prevBrands.map((brand) => {
          if (brand.id === winnerId) {
            // Winner: Elo +8, rank might improve, tier might upgrade
            return {
              ...brand,
              elo: brand.elo + 8,
              rank: Math.max(1, brand.rank - 1), // Improve rank (lower number is better)
              // Tier could upgrade if Elo crosses threshold (placeholder logic)
            };
          } else if (brand.id === loserId) {
            // Loser: Elo -8, rank might worsen, tier might downgrade
            return {
              ...brand,
              elo: brand.elo - 8,
              rank: brand.rank + 1, // Worsen rank
              // Tier could downgrade if Elo crosses threshold (placeholder logic)
            };
          }
          return brand;
        });
      });

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 relative z-10">
        {/* Dual Card Layout */}
        <div className="flex flex-col md:flex-row gap-20 md:gap-24 items-center justify-center max-w-5xl mx-auto relative">
          {brands.map((brand, index) => (
            <React.Fragment key={brand.id}>
              <div className="flex-1 w-full max-w-md">
                <BrandCard
                  brand={brand}
                  onClick={(e) => handleVote(brand.id, e)}
                  disabled={isVoting || !!votedBrandId}
                  isRevealed={revealedBrandIds.has(brand.id)}
                  isSelected={votedBrandId === brand.id}
                />
              </div>
              {index === 0 && (
                <div className="hidden md:flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2 z-30 h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-px h-16 bg-milk-tea-medium"></div>
                    <div className="bg-white/60 backdrop-blur-sm border-2 border-milk-tea-medium rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      <span className="text-milk-tea-darker font-bold text-lg">VS</span>
                    </div>
                    <div className="w-px h-16 bg-milk-tea-medium"></div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Tie and Skip Buttons */}
        <div className="flex justify-center gap-4 mt-8 relative z-20">
          <button
            onClick={() => {
              // Handle tie
              console.log('Tie selected');
            }}
            disabled={isVoting || !!votedBrandId}
            className="px-6 py-3 bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-lg text-milk-tea-darker font-semibold hover:bg-white/40 hover:border-milk-tea-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Tie
          </button>
          <button
            onClick={() => {
              // Handle skip
              console.log('Skip selected');
            }}
            disabled={isVoting || !!votedBrandId}
            className="px-6 py-3 bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-lg text-milk-tea-darker font-semibold hover:bg-white/40 hover:border-milk-tea-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Skip
          </button>
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

