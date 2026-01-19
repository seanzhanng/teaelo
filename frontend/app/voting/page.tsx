'use client';

import React, { useState, useRef, useEffect } from 'react';
import BrandCard from '@/components/BrandCard';
import { UiBrand } from '@/lib/uiTypes';
import { useRandomPair, useVoteMutation } from '@/lib/queries';

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
const convertBrand = (fullBrand: UiBrand): Brand => ({
  id: fullBrand.id,
  name: fullBrand.name,
  logo_url: fullBrand.logo_url,
  country_of_origin: fullBrand.country_of_origin,
  elo: fullBrand.elo,
  tier: fullBrand.tier,
  rank: fullBrand.rank,
  price: fullBrand.metadata.price_category,
});

// Map common country names to match region names in brand data
const countryMapping: { [key: string]: string } = {
  'US': 'United States',
  'USA': 'United States',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'UK': 'United Kingdom',
  'AU': 'Australia',
  'JP': 'Japan',
  'KR': 'South Korea',
  'SG': 'Singapore',
  'MY': 'Malaysia',
  'PH': 'Philippines',
  'ID': 'Indonesia',
  'TW': 'Taiwan',
};

// Get user's country from browser locale or geolocation
const getUserCountry = async (): Promise<string | null> => {
  try {
    // Try to get country from IP geolocation (free service)
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code;
      return countryMapping[countryCode] || data.country_name || null;
    }
  } catch (error) {
    console.log('Could not detect location, defaulting to international');
  }
  
  // Fallback: try to get from browser locale
  try {
    const locale = navigator.language || (navigator as any).userLanguage;
    const countryCode = locale.split('-')[1]?.toUpperCase();
    return countryMapping[countryCode] || null;
  } catch (error) {
    return null;
  }
};

const emojis = ['🧋', '💜', '⭐', '✨', '🎉', '💫', '🌟', '🥤'];

export default function VotingPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLocal, setIsLocal] = useState(true);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [roundKey, setRoundKey] = useState(0);
  const voteMutation = useVoteMutation();

  // Detect user's country on mount
  useEffect(() => {
    getUserCountry().then((country) => {
      setUserCountry(country);
      setIsDetectingLocation(false);
    });
  }, []);

  const countryParam = isLocal ? userCountry ?? undefined : undefined;
  const randomPairQuery = useRandomPair(countryParam);

  useEffect(() => {
    if (!randomPairQuery.data || randomPairQuery.data.length < 2) return;
    setBrands(randomPairQuery.data.slice(0, 2).map(convertBrand));
  }, [randomPairQuery.data]);

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
      const response = await voteMutation.mutateAsync({
        winnerId,
        loserId,
        locationCountry: userCountry,
      });

      // Placeholder: Update brands with new Elo, Rank, and Tier
      // In the future, this would come from the backend response
      setBrands((prevBrands) => {
        return prevBrands.map((brand) => {
          if (brand.id === winnerId) {
            // Winner: Elo +8, rank might improve, tier might upgrade
            return {
              ...brand,
              elo: typeof response?.result === 'object' && response?.result
                ? (response.result as any).winner_new_elo ?? brand.elo + 8
                : brand.elo + 8,
              rank: Math.max(1, brand.rank - 1), // Improve rank (lower number is better)
              // Tier could upgrade if Elo crosses threshold (placeholder logic)
            };
          } else if (brand.id === loserId) {
            // Loser: Elo -8, rank might worsen, tier might downgrade
            return {
              ...brand,
              elo: typeof response?.result === 'object' && response?.result
                ? (response.result as any).loser_new_elo ?? brand.elo - 8
                : brand.elo - 8,
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
        setRoundKey((prev) => prev + 1);
        randomPairQuery.refetch();
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

  const handleTie = async () => {
    if (isVoting || votedBrandId) return;
    if (brands.length !== 2) return;

    const [brand1, brand2] = brands;

    // Reveal all cards
    setRevealedBrandIds(new Set(brands.map((b) => b.id)));

    setIsVoting(true);
    setVotedBrandId('tie'); // Use a special value to indicate tie

    try {
      await voteMutation.mutateAsync({
        winnerId: brand1.id,
        loserId: brand2.id,
        isTie: true,
        locationCountry: userCountry,
      });

      // Update brands with tie Elo changes (smaller changes for ties)
      setBrands((prevBrands) => {
        return prevBrands.map((brand) => {
          // Both brands get small Elo changes in a tie (typically no change or very small)
          // For ties, we'll give a small positive change to both
          return {
            ...brand,
            elo: brand.elo + 2, // Small positive change for both in a tie
            // Rank stays the same in a tie
          };
        });
      });

      console.log('Tie submitted successfully');
      
      // After a delay, reset the vote state to allow new voting
      setTimeout(() => {
        setRoundKey((prev) => prev + 1);
        randomPairQuery.refetch();
        setVotedBrandId(null);
        setRevealedBrandIds(new Set());
      }, 2000);
    } catch (error) {
      console.error('Error submitting tie:', error);
      // Reset on error so user can try again
      setVotedBrandId(null);
      setRevealedBrandIds(new Set());
    } finally {
      setIsVoting(false);
    }
  };

  const handleSkip = async () => {
    if (isVoting || votedBrandId) return;
    if (brands.length !== 2) return;

    // Reveal all cards
    setRevealedBrandIds(new Set(brands.map((b) => b.id)));

    setIsVoting(true);
    setVotedBrandId('skip'); // Use a special value to indicate skip

    // Don't call API, don't change Elo - just reveal and move to next
    console.log('Skip selected');
    
    // After a shorter delay, reset the vote state to allow new voting
    setTimeout(() => {
      setRoundKey((prev) => prev + 1);
      randomPairQuery.refetch();
      setVotedBrandId(null);
      setRevealedBrandIds(new Set());
      setIsVoting(false);
    }, 1500);
  };

  return (
    <div className="min-h-full w-full relative pt-24 sm:pt-20 md:pt-24 pb-8 md:h-screen md:overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 w-full py-4 sm:py-6 md:py-8 relative z-10 h-full md:flex md:flex-col md:justify-center">
        {/* Dual Card Layout */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-16 lg:gap-24 items-center justify-center w-full relative flex-1 md:min-h-0">
          {brands.map((brand, index) => (
            <React.Fragment key={`${roundKey}-${brand.id}-${index}`}>
              <div 
                ref={(el) => {
                  cardRefs.current[brand.id] = el;
                }}
                className={`w-full md:flex-1 flex ${index === 0 ? 'md:justify-end' : 'md:justify-start'} justify-center items-center min-w-0 animate-fade-in-scale`} 
                style={{ animationDelay: `${index * 0.15}s`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <BrandCard
                  brand={brand}
                  onClick={(e) => handleVote(brand.id, e)}
                  disabled={isVoting || !!votedBrandId}
                  isRevealed={revealedBrandIds.has(brand.id)}
                  isSelected={votedBrandId === brand.id || votedBrandId === 'tie'}
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
        
        {/* Tie, Skip Buttons and Local/International Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 md:mt-10 relative z-20 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex gap-3 sm:gap-4">
            <button
              onClick={handleTie}
              disabled={isVoting || !!votedBrandId}
              className="px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-lg text-milk-tea-darker font-semibold text-base sm:text-lg hover:bg-white/40 hover:border-milk-tea-dark active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-manipulation"
            >
              Tie
            </button>
            <button
              onClick={handleSkip}
              disabled={isVoting || !!votedBrandId}
              className="px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-lg text-milk-tea-darker font-semibold text-base sm:text-lg hover:bg-white/40 hover:border-milk-tea-dark active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-manipulation"
            >
              Skip
            </button>
          </div>
          
          {/* Local/International Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className={`text-sm sm:text-base font-medium transition-colors duration-300 ${!isLocal ? 'text-milk-tea-darker font-semibold' : 'text-milk-tea-dark/60'}`}>
              International
            </span>
            <button
              onClick={() => {
                setIsLocal(!isLocal);
              }}
              disabled={isDetectingLocation}
              className={`
                relative w-16 h-8 sm:w-20 sm:h-9 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-milk-tea-dark focus:ring-offset-2
                ${isLocal 
                  ? 'bg-milk-tea-medium' 
                  : 'bg-milk-tea-dark/20'
                }
                ${isDetectingLocation
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:opacity-90 active:scale-95'
                }
              `}
              aria-label={isLocal ? 'Switch to international' : 'Switch to local'}
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 sm:top-0.5 sm:left-0.5 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg transform transition-transform duration-300 ease-in-out
                  ${isLocal ? 'translate-x-8 sm:translate-x-11' : 'translate-x-0'}
                `}
              />
            </button>
            <span className={`text-sm sm:text-base font-medium transition-colors duration-300 ${isLocal ? 'text-milk-tea-darker font-semibold' : 'text-milk-tea-dark/60'}`}>
              Local
            </span>
          </div>
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

