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

