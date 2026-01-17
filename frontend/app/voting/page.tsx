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

  // Generate random irregular shapes for background with animation delays
  const backgroundShapes = [
    { top: '15%', left: '10%', width: '400px', height: '350px', clipPath: 'polygon(20% 0%, 80% 0%, 100% 40%, 85% 70%, 50% 100%, 15% 80%, 0% 50%)', opacity: 0.3, morphDelay: '0s', floatDelay: '0s', morphAnimation: 'blobMorph1' },
    { top: '60%', left: '5%', width: '350px', height: '400px', clipPath: 'polygon(30% 10%, 90% 5%, 100% 50%, 75% 95%, 25% 100%, 0% 60%, 5% 30%)', opacity: 0.25, morphDelay: '2s', floatDelay: '1s', morphAnimation: 'blobMorph2' },
    { top: '25%', left: '70%', width: '450px', height: '380px', clipPath: 'polygon(10% 15%, 85% 10%, 95% 45%, 80% 80%, 40% 95%, 5% 70%, 0% 35%)', opacity: 0.28, morphDelay: '4s', floatDelay: '2s', morphAnimation: 'blobMorph3' },
    { top: '70%', left: '75%', width: '380px', height: '420px', clipPath: 'polygon(25% 5%, 75% 0%, 100% 35%, 90% 75%, 60% 100%, 20% 90%, 0% 55%)', opacity: 0.22, morphDelay: '1s', floatDelay: '3s', morphAnimation: 'blobMorph4' },
    { top: '5%', left: '45%', width: '320px', height: '300px', clipPath: 'polygon(15% 20%, 80% 15%, 95% 50%, 70% 85%, 30% 90%, 5% 60%, 0% 30%)', opacity: 0.2, morphDelay: '3s', floatDelay: '1.5s', morphAnimation: 'blobMorph5' },
    { top: '45%', left: '25%', width: '360px', height: '340px', clipPath: 'polygon(20% 10%, 90% 5%, 100% 40%, 85% 75%, 45% 95%, 10% 80%, 0% 45%)', opacity: 0.26, morphDelay: '5s', floatDelay: '2.5s', morphAnimation: 'blobMorph6' },
    { top: '80%', left: '50%', width: '340px', height: '360px', clipPath: 'polygon(30% 0%, 70% 5%, 95% 40%, 80% 80%, 50% 100%, 15% 85%, 0% 50%)', opacity: 0.24, morphDelay: '1.5s', floatDelay: '4s', morphAnimation: 'blobMorph7' },
  ];

  return (
    <div className="h-full overflow-hidden flex items-center justify-center relative">
      {/* Random irregular shapes background */}
      {backgroundShapes.map((shape, index) => (
        <div
          key={index}
          className="fixed pointer-events-none z-0"
          style={{
            top: shape.top,
            left: shape.left,
            width: shape.width,
            height: shape.height,
            clipPath: shape.clipPath,
            background: `radial-gradient(ellipse at center, rgba(180, 160, 140, ${shape.opacity}) 0%, rgba(180, 160, 140, ${shape.opacity * 0.6}) 50%, transparent 100%)`,
            filter: 'blur(80px)',
            animation: `${shape.morphAnimation} ${15 + index * 2}s cubic-bezier(0.4, 0, 0.2, 1) infinite ${shape.morphDelay}, blobFloat ${20 + index * 3}s ease-in-out infinite ${shape.floatDelay}`,
          }}
        />
      ))}
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

