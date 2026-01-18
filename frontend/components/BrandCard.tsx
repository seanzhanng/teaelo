'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

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

interface BrandCardProps {
  brand: Brand;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  isRevealed?: boolean;
  isSelected?: boolean;
  isDisplayMode?: boolean; // Prevents graying out when in display mode
}

const tierColors: Record<Brand['tier'], string> = {
  S: 'bg-amber-500 text-white',
  A: 'bg-purple-600 text-white',
  B: 'bg-green-600 text-white',
  C: 'bg-yellow-600 text-white',
  D: 'bg-orange-600 text-white',
  F: 'bg-red-600 text-white',
};

const tierBorderColors: Record<Brand['tier'], string> = {
  S: 'border-amber-500',
  A: 'border-purple-600',
  B: 'border-green-600',
  C: 'border-yellow-600',
  D: 'border-orange-600',
  F: 'border-red-600',
};

const tierBorderHoverColors: Record<Brand['tier'], string> = {
  S: 'hover:border-amber-600',
  A: 'hover:border-purple-700',
  B: 'hover:border-green-700',
  C: 'hover:border-yellow-700',
  D: 'hover:border-orange-700',
  F: 'hover:border-red-700',
};

export default function BrandCard({ brand, onClick, disabled = false, isRevealed = false, isSelected = false, isDisplayMode = false }: BrandCardProps) {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });
  // Initialize with fixed values to avoid hydration mismatch, then set random values on client
  const [randomElo, setRandomElo] = useState(0);
  const [randomRank, setRandomRank] = useState(0);
  const [animatedElo, setAnimatedElo] = useState(brand.elo);
  const [isAnimatingElo, setIsAnimatingElo] = useState(false);
  const [eloChange, setEloChange] = useState<number | null>(null);
  const [rankChange, setRankChange] = useState<number | null>(null);
  const previousEloRef = useRef(brand.elo);
  const previousRankRef = useRef(brand.rank);
  const cardRef = useRef<HTMLButtonElement>(null);

  // Animate Elo when it changes
  useEffect(() => {
    if (isRevealed && brand.elo !== previousEloRef.current) {
      const oldElo = previousEloRef.current;
      const newElo = brand.elo;
      const difference = newElo - oldElo;
      const duration = 1500; // 1.5 second animation
      const startTime = Date.now();
      
      // Show the change indicator
      setEloChange(difference);
      setIsAnimatingElo(true);
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentElo = oldElo + (difference * easedProgress);
        
        setAnimatedElo(Math.round(currentElo));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimatedElo(newElo);
          setIsAnimatingElo(false);
          // Keep the change indicator visible
        }
      };
      
      requestAnimationFrame(animate);
      previousEloRef.current = newElo;
    } else if (!isRevealed) {
      // Reset animated Elo when not revealed
      setAnimatedElo(brand.elo);
      previousEloRef.current = brand.elo;
      setEloChange(null);
    }
  }, [brand.elo, isRevealed]);

  // Track rank changes
  useEffect(() => {
    if (isRevealed && brand.rank !== previousRankRef.current) {
      const difference = brand.rank - previousRankRef.current;
      // Show the change indicator (keep it visible)
      setRankChange(difference);
      previousRankRef.current = brand.rank;
    } else if (!isRevealed) {
      // Reset when not revealed
      previousRankRef.current = brand.rank;
      setRankChange(null);
    }
  }, [brand.rank, isRevealed]);

  // Initialize random numbers on client mount and update periodically if not revealed (slower)
  useEffect(() => {
    // Set initial random values on client side only
    setRandomElo(Math.floor(Math.random() * 2000) + 1000);
    setRandomRank(Math.floor(Math.random() * 100) + 1);

    if (isRevealed) return;

    const interval = setInterval(() => {
      setRandomElo(Math.floor(Math.random() * 2000) + 1000);
      setRandomRank(Math.floor(Math.random() * 100) + 1);
    }, 150); // Faster: Random interval between 200-400ms

    return () => clearInterval(interval);
  }, [isRevealed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate normalized position relative to center (-1 to 1)
    const normalizedX = (x - centerX) / centerX;
    const normalizedY = (y - centerY) / centerY;
    
    // Calculate rotation based on distance from center
    // Max rotation of 10 degrees, smoothly interpolated
    const maxRotation = 10;
    const maxLift = 12;
    
    // Smooth continuous rotation based on mouse position
    const rotateY = normalizedX * maxRotation;
    const rotateX = -normalizedY * maxRotation; // Negative for natural feel
    const translateZ = Math.min(maxLift, Math.abs(normalizedX) * maxLift + Math.abs(normalizedY) * maxLift);
    
    setTransform({ rotateX, rotateY, translateZ });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, translateZ: 0 });
  };

  // Reset transform when card becomes disabled or is no longer selected
  useEffect(() => {
    if (disabled || !isSelected) {
      setTransform({ rotateX: 0, rotateY: 0, translateZ: 0 });
    }
  }, [disabled, isSelected]);

  // Use tier color border if revealed or in display mode, otherwise use default
  const shouldUseTierBorder = isRevealed || isDisplayMode;
  const borderColor = shouldUseTierBorder 
    ? tierBorderColors[brand.tier] 
    : 'border-milk-tea-medium';
  const hoverBorderColor = shouldUseTierBorder
    ? tierBorderHoverColors[brand.tier]
    : 'hover:border-milk-tea-dark';

  return (
    <button
      ref={cardRef}
      onClick={(e) => onClick(e)}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative w-full max-w-[280px] sm:max-w-xs md:max-w-sm mx-auto
        bg-white/30 backdrop-blur-md
        border-2 ${borderColor}
        p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl
        transition-all duration-300 ease-out
        ${isSelected ? 'scale-[1.02] sm:scale-105 shadow-2xl translate-y-[-5px] sm:translate-y-[-10px] md:translate-y-[-20px] z-40' : 'shadow-lg z-10'}
        ${isRevealed && !isSelected && !isDisplayMode ? 'opacity-40 grayscale' : ''}
        ${hoverBorderColor} hover:shadow-xl
        active:scale-[0.98]
        disabled:cursor-not-allowed ${disabled && !shouldUseTierBorder ? 'disabled:hover:border-milk-tea-medium' : ''}
        focus:outline-none focus:ring-2 focus:ring-milk-tea-dark focus:ring-offset-2
        overflow-hidden
      `}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translateZ(${isSelected ? 20 : transform.translateZ}px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glint Animation - Full card sweep */}
      <div className="card-glint absolute inset-0 pointer-events-none z-10" />
      {/* Logo */}
      <div className="flex justify-center mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 relative z-20">
        {brand.logo_url ? (
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
            <Image
              src={brand.logo_url}
              alt={`${brand.name} logo`}
              fill
              className="object-contain"
              onError={(e) => {
                // Fallback to placeholder if image fails
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-milk-tea-medium rounded-lg flex items-center justify-center">
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-milk-tea-dark">
              {brand.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Brand Name */}
      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-1 sm:mb-2 relative z-20" style={{ color: 'var(--milk-tea-darker)' }}>
        {brand.name}
      </h3>

      {/* Price Indicator */}
      {brand.price && (
        <div className="flex justify-center mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 relative z-20">
          <div className="text-milk-tea-dark font-semibold text-sm sm:text-base md:text-lg lg:text-xl">
            {'$'.repeat(brand.price)}
          </div>
        </div>
      )}

      {/* Tier Badge */}
      <div className="flex justify-center mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 relative z-20">
        <span
          className={`px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded text-xs sm:text-sm font-semibold transition-opacity ${
            isRevealed 
              ? tierColors[brand.tier] 
              : 'bg-gray-300 text-gray-500 opacity-60'
          }`}
        >
          {isRevealed ? `${brand.tier} Tier` : '? Tier'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-1.5 sm:mt-2 md:mt-3 mb-1.5 sm:mb-2 md:mb-3 relative z-20">
        <div className="text-center">
          <div className="text-xs text-milk-tea-dark mb-0.5 sm:mb-1 md:mb-2">Elo</div>
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2">
            <div className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold transition-opacity ${
              isRevealed ? 'text-milk-tea-darker' : 'text-gray-400 opacity-60'
            }`}>
              {isRevealed ? Math.round(animatedElo) : (randomElo || Math.round(brand.elo))}
            </div>
            {eloChange !== null && (
              <span
                className={`text-xs sm:text-sm md:text-base lg:text-lg font-semibold transition-opacity duration-300 ${
                  eloChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}
                style={{
                  animation: 'fadeIn 0.3s ease-in',
                }}
              >
                {eloChange > 0 ? '+' : ''}{eloChange}
              </span>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-milk-tea-dark mb-0.5 sm:mb-1 md:mb-2">Rank</div>
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2">
            <div className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold transition-opacity ${
              isRevealed ? 'text-milk-tea-darker' : 'text-gray-400 opacity-60'
            }`}>
              {isRevealed ? `#${brand.rank}` : `#${randomRank || brand.rank}`}
            </div>
            {rankChange !== null && rankChange !== 0 && (
              <span
                className={`text-xs sm:text-sm md:text-base lg:text-lg font-semibold transition-opacity duration-300 ${
                  rankChange < 0 ? 'text-green-600' : 'text-red-600'
                }`}
                style={{
                  animation: 'fadeIn 0.3s ease-in',
                }}
              >
                {rankChange > 0 ? '+' : ''}{rankChange}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Country and Established Date */}
      <div className="text-center mt-1.5 sm:mt-2 md:mt-3 pt-1.5 sm:pt-2 md:pt-3 border-t border-milk-tea-medium space-y-0.5 sm:space-y-1 md:space-y-2 relative z-20">
        <div className="text-xs sm:text-sm text-milk-tea-dark">
          Origin: {brand.country_of_origin}
        </div>
        {brand.established_date && (
          <div className="text-xs text-milk-tea-dark/70">
            Est. {brand.established_date}
          </div>
        )}
      </div>
    </button>
  );
}

