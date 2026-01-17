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
}

interface BrandCardProps {
  brand: Brand;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  isRevealed?: boolean;
  isSelected?: boolean;
}

const tierColors: Record<Brand['tier'], string> = {
  S: 'bg-purple-600 text-white',
  A: 'bg-blue-600 text-white',
  B: 'bg-green-600 text-white',
  C: 'bg-yellow-600 text-white',
  D: 'bg-orange-600 text-white',
  F: 'bg-red-600 text-white',
};

export default function BrandCard({ brand, onClick, disabled = false, isRevealed = false, isSelected = false }: BrandCardProps) {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });
  // Initialize with fixed values to avoid hydration mismatch, then set random values on client
  const [randomElo, setRandomElo] = useState(0);
  const [randomRank, setRandomRank] = useState(0);
  const cardRef = useRef<HTMLButtonElement>(null);

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

  return (
    <button
      ref={cardRef}
      onClick={(e) => onClick(e)}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative w-full max-w-md mx-auto
        bg-white/80 backdrop-blur-sm
        border-2 ${isSelected ? 'border-milk-tea-dark' : 'border-milk-tea-medium'}
        p-8 rounded-lg
        transition-all duration-300 ease-out
        ${isSelected ? 'scale-105 shadow-2xl translate-y-[-20px]' : ''}
        ${isRevealed && !isSelected ? 'opacity-40 grayscale' : ''}
        hover:border-milk-tea-dark hover:shadow-xl
        active:scale-[0.98]
        disabled:cursor-not-allowed disabled:hover:border-milk-tea-medium
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
      <div className="flex justify-center mb-3 relative z-20">
        {brand.logo_url ? (
          <div className="relative w-56 h-56">
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
          <div className="w-56 h-56 bg-milk-tea-medium rounded-lg flex items-center justify-center">
            <span className="text-5xl font-bold text-milk-tea-dark">
              {brand.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Brand Name */}
      <h3 className="text-3xl font-semibold text-center mb-3 relative z-20" style={{ color: 'var(--milk-tea-darker)' }}>
        {brand.name}
      </h3>

      {/* Tier Badge */}
      <div className="flex justify-center mb-3 relative z-20">
        <span
          className={`px-4 py-2 rounded text-sm font-semibold transition-opacity ${
            isRevealed 
              ? tierColors[brand.tier] 
              : 'bg-gray-300 text-gray-500 opacity-60'
          }`}
        >
          {isRevealed ? `${brand.tier} Tier` : '? Tier'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mt-3 mb-3 relative z-20">
        <div className="text-center">
          <div className="text-sm text-milk-tea-dark mb-2">Elo</div>
          <div className={`text-2xl font-bold transition-opacity ${
            isRevealed ? 'text-milk-tea-darker' : 'text-gray-400 opacity-60'
          }`}>
            {isRevealed ? Math.round(brand.elo) : (randomElo || Math.round(brand.elo))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-milk-tea-dark mb-2">Rank</div>
          <div className={`text-2xl font-bold transition-opacity ${
            isRevealed ? 'text-milk-tea-darker' : 'text-gray-400 opacity-60'
          }`}>
            {isRevealed ? `#${brand.rank}` : `#${randomRank || brand.rank}`}
          </div>
        </div>
      </div>

      {/* Country and Established Date */}
      <div className="text-center mt-3 pt-3 border-t border-milk-tea-medium space-y-2 relative z-20">
        <div className="text-sm text-milk-tea-dark">
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

