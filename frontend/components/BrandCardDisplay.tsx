'use client';

import BrandCard from './BrandCard';

interface BrandCardDisplayProps {
  id: string;
  name: string;
  logo_url: string;
  country_of_origin: string;
  elo: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  rank: number;
  price?: 1 | 2 | 3 | 4;
}

export default function BrandCardDisplay(props: BrandCardDisplayProps) {
  return (
    <BrandCard
      brand={props}
      onClick={() => {}}
      disabled={true}
      isRevealed={true}
      isSelected={false}
      isDisplayMode={true}
    />
  );
}

