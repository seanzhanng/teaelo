'use client';

import React, { useState, useRef, useEffect } from 'react';
import BrandCard from '@/components/BrandCard';
import { brands as allBrands, type Brand as FullBrand } from '@/lib/mockData';

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

// Convert full Brand schema to simplified Brand for display
const convertBrand = (fullBrand: FullBrand): Brand => ({
  id: fullBrand.id,
  name: fullBrand.name,
  logo_url: fullBrand.logo_url,
  country_of_origin: fullBrand.country_of_origin,
  elo: fullBrand.elo,
  tier: fullBrand.tier,
  rank: fullBrand.rank,
  price: fullBrand.metadata.price_category,
});

// Get random 2 brands for voting (client-side only)
const getRandomBrands = (): Brand[] => {
  const shuffled = [...allBrands].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2).map(convertBrand);
};

// Use first 2 brands for SSR to avoid hydration mismatch
const initialBrands: Brand[] = allBrands.slice(0, 2).map(convertBrand);

const emojis = ['🧋', '💜', '⭐', '✨', '🎉', '💫', '🌟', '🥤'];

export default function VotingPage() {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);

  // Randomize brands on client-side only to avoid hydration mismatch
  useEffect(() => {
    setBrands(getRandomBrands());
  }, []);
  const [isVoting, setIsVoting] = useState(false);
  const [votedBrandId, setVotedBrandId] = useState<string | null>(null);
  const [revealedBrandIds, setRevealedBrandIds] = useState<Set<string>>(new Set());
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<EmojiParticle[]>([]);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

    // Scroll selected card into view on mobile to prevent it from going behind header
    setTimeout(() => {
      const cardElement = cardRefs.current[winnerId];
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

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
      
      // After a delay, reset the vote state to allow new voting
      setTimeout(() => {
        setBrands(getRandomBrands());
        setVotedBrandId(null);
        setRevealedBrandIds(new Set());
      }, 2000);
    } catch (error) {
      console.error('Error submitting vote:', error);
      // Reset on error so user can try again
      setVotedBrandId(null);
      setRevealedBrandIds(new Set());
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="min-h-full w-full relative pt-24 sm:pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full py-4 sm:py-6 md:py-8 relative z-10">
        {/* Dual Card Layout */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-12 lg:gap-16 items-center justify-center max-w-4xl mx-auto relative min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-16rem)]">
          {brands.map((brand, index) => (
            <React.Fragment key={brand.id}>
              <div 
                ref={(el) => {
                  cardRefs.current[brand.id] = el;
                }}
                className={`flex-1 flex justify-center w-full max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-none animate-fade-in-scale`} 
                style={{ animationDelay: `${index * 0.15}s`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <BrandCard
                  brand={brand}
                  onClick={(e) => handleVote(brand.id, e)}
                  disabled={isVoting || !!votedBrandId}
                  isRevealed={revealedBrandIds.has(brand.id)}
                  isSelected={votedBrandId === brand.id}
                />
              </div>
              {index === 0 && (
                <>
                  {/* Mobile VS Indicator */}
                  <div className="md:hidden flex items-center justify-center my-2 z-30 w-full">
                    <div className="flex items-center gap-2 w-full max-w-xs">
                      <div className="h-px flex-1 bg-milk-tea-medium"></div>
                      <div className="bg-white/60 backdrop-blur-sm border-2 border-milk-tea-medium rounded-full w-12 h-12 flex items-center justify-center shadow-lg flex-shrink-0">
                        <span className="text-milk-tea-darker font-bold text-base">VS</span>
                      </div>
                      <div className="h-px flex-1 bg-milk-tea-medium"></div>
                    </div>
                  </div>
                  {/* Desktop VS Indicator */}
                  <div className="hidden md:flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2 z-30 h-full">
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <div className="w-px h-12 sm:h-16 bg-milk-tea-medium"></div>
                      <div className="bg-white/60 backdrop-blur-sm border-2 border-milk-tea-medium rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg">
                        <span className="text-milk-tea-darker font-bold text-base sm:text-lg">VS</span>
                      </div>
                      <div className="w-px h-12 sm:h-16 bg-milk-tea-medium"></div>
                    </div>
                  </div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Tie and Skip Buttons */}
        <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10 relative z-20 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
          <button
            onClick={() => {
              // Handle tie
              console.log('Tie selected');
            }}
            disabled={isVoting || !!votedBrandId}
            className="px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-lg text-milk-tea-darker font-semibold text-base sm:text-lg hover:bg-white/40 hover:border-milk-tea-dark active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-manipulation"
          >
            Tie
          </button>
          <button
            onClick={() => {
              // Handle skip
              console.log('Skip selected');
            }}
            disabled={isVoting || !!votedBrandId}
            className="px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-lg text-milk-tea-darker font-semibold text-base sm:text-lg hover:bg-white/40 hover:border-milk-tea-dark active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-manipulation"
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

