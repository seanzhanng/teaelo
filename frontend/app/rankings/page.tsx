'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { slugifyBrandName } from '@/lib/api';
import { UiBrand } from '@/lib/uiTypes';
import { useLeaderboard } from '@/lib/queries';

interface Brand {
  id: string;
  name: string;
  logo_url: string;
  country_of_origin: string;
  elo: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  rank: number;
  established_date?: string;
  price?: 1 | 2 | 3 | 4;
  regions: string[];
}

const tierColors: Record<Brand['tier'], string> = {
  S: 'bg-amber-500 text-white',
  A: 'bg-purple-600 text-white',
  B: 'bg-green-600 text-white',
  C: 'bg-yellow-600 text-white',
  D: 'bg-orange-600 text-white',
  F: 'bg-red-600 text-white',
};

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
  regions: fullBrand.metadata.regions,
});

export default function RankingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const leaderboardQuery = useLeaderboard({ limit: 100 });

  const allBrands = useMemo(() => {
    const base = leaderboardQuery.data ?? [];
    const sorted = [...base].sort((a, b) => b.elo - a.elo);
    return sorted.map((brand, index) => ({
      ...brand,
      rank: brand.rank && brand.rank > 0 ? brand.rank : index + 1,
    }));
  }, [leaderboardQuery.data]);

  const displayBrands = useMemo(() => allBrands.map(convertBrand), [allBrands]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);

  const top3Brands: Brand[] = displayBrands
    .slice(0, 3)
    .sort((a, b) => a.rank - b.rank);

  const remainingBrands: Brand[] = displayBrands.slice(3);

  useEffect(() => {
    setFilteredBrands(displayBrands);
  }, [displayBrands]);

  if (leaderboardQuery.isLoading && displayBrands.length === 0) {
    return (
      <div className="h-full overflow-y-auto scrollbar-hide relative pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-milk-tea-darker">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  if (leaderboardQuery.error) {
    return (
      <div className="h-full overflow-y-auto scrollbar-hide relative pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-milk-tea-darker mb-2">Error loading leaderboard</p>
          <p className="text-red-600 text-sm">
            {leaderboardQuery.error instanceof Error 
              ? leaderboardQuery.error.message 
              : 'Failed to fetch leaderboard data'}
          </p>
          <p className="text-milk-tea-dark text-xs mt-4">
            Make sure your backend is running at http://127.0.0.1:8000
          </p>
        </div>
      </div>
    );
  }

  if (displayBrands.length === 0) {
    return (
      <div className="h-full overflow-y-auto scrollbar-hide relative pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-milk-tea-darker">
          <p>No leaderboard data available yet.</p>
          <p className="text-sm text-milk-tea-dark mt-2">
            Database may need seeding. Run: python backend/seed.py
          </p>
        </div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();
    const filtered = displayBrands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(lowerQuery) ||
        brand.country_of_origin.toLowerCase().includes(lowerQuery) ||
        brand.regions.some((region) => region.toLowerCase().includes(lowerQuery)) ||
        brand.tier.toLowerCase().includes(lowerQuery) ||
        Math.round(brand.elo).toString().includes(lowerQuery) ||
        brand.rank.toString().includes(lowerQuery) ||
        (brand.price && '$'.repeat(brand.price).toLowerCase().includes(lowerQuery))
    );
    setFilteredBrands(filtered);
  };

  const scrollToResults = () => {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide relative pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-milk-tea-darker mb-2 sm:mb-4">
          Global Leaderboard
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-milk-tea-dark/80 max-w-2xl mx-auto px-2">
          See how boba brands rank based on community votes and Elo ratings.
        </p>
      </div>
      
        {/* Podium for Top 3 */}
        {top3Brands.length >= 2 && (
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 sm:gap-3 md:gap-6 mb-8 sm:mb-12 md:mb-16 relative z-20">
          {/* 2nd Place */}
          {top3Brands.length >= 2 && (
          <Link href={`/brand/${slugifyBrandName(top3Brands[1].name)}`} className="flex flex-col items-center animate-fade-in-scale animate-delay-200 cursor-pointer group order-2 sm:order-1">
            <div className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-3 sm:p-4 md:p-6 shadow-lg mb-2 sm:mb-4 w-32 sm:w-40 md:w-52 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <div className="flex justify-center mb-2 sm:mb-3">
                {top3Brands[1].logo_url ? (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28">
                    <Image
                      src={top3Brands[1].logo_url}
                      alt={`${top3Brands[1].name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-milk-tea-medium rounded-lg flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-milk-tea-dark">
                      {top3Brands[1].name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-center text-milk-tea-darker mb-1 sm:mb-2">
                {top3Brands[1].name}
              </h3>
              <div className="text-center mb-1 sm:mb-2">
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-semibold ${tierColors[top3Brands[1].tier]}`}>
                  {top3Brands[1].tier} Tier
                </span>
              </div>
              <div className="text-center text-milk-tea-darker font-bold text-sm sm:text-base md:text-lg">
                {Math.round(top3Brands[1].elo)} <span className="text-milk-tea-dark text-xs sm:text-sm font-normal">Elo</span>
              </div>
            </div>
            <div className="bg-gradient-to-t from-milk-tea-medium to-milk-tea-light w-32 sm:w-40 md:w-52 h-20 sm:h-28 md:h-36 rounded-t-lg flex items-center justify-center shadow-lg">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-milk-tea-darker">2</span>
            </div>
          </Link>
          )}

              {/* 1st Place */}
              <Link href={`/brand/${slugifyBrandName(top3Brands[0].name)}`} className="flex flex-col items-center animate-fade-in-scale animate-delay-100 cursor-pointer group order-1 sm:order-2">
            <div className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-4 sm:p-5 md:p-7 shadow-2xl mb-2 sm:mb-4 w-36 sm:w-44 md:w-56 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="flex justify-center mb-2 sm:mb-3">
                {top3Brands[0].logo_url ? (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
                    <Image
                      src={top3Brands[0].logo_url}
                      alt={`${top3Brands[0].name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-milk-tea-medium rounded-lg flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-milk-tea-dark">
                      {top3Brands[0].name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-center text-milk-tea-darker mb-1 sm:mb-2">
                {top3Brands[0].name}
              </h3>
              <div className="text-center mb-1 sm:mb-2">
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-semibold ${tierColors[top3Brands[0].tier]}`}>
                  {top3Brands[0].tier} Tier
                </span>
              </div>
              <div className="text-center text-milk-tea-darker font-bold text-base sm:text-lg md:text-xl">
                {Math.round(top3Brands[0].elo)} <span className="text-milk-tea-dark text-xs sm:text-sm font-normal">Elo</span>
              </div>
            </div>
            <div className="bg-gradient-to-t from-milk-tea-medium to-milk-tea-light w-36 sm:w-44 md:w-56 h-24 sm:h-32 md:h-44 rounded-t-lg flex items-center justify-center shadow-xl">
              <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-milk-tea-darker">1</span>
            </div>
          </Link>

              {/* 3rd Place */}
              {top3Brands.length >= 3 && (
              <Link href={`/brand/${slugifyBrandName(top3Brands[2].name)}`} className="flex flex-col items-center animate-fade-in-scale animate-delay-300 cursor-pointer group order-3">
            <div className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-3 sm:p-4 md:p-6 shadow-lg mb-2 sm:mb-4 w-32 sm:w-40 md:w-52 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <div className="flex justify-center mb-2 sm:mb-3">
                {top3Brands[2].logo_url ? (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28">
                    <Image
                      src={top3Brands[2].logo_url}
                      alt={`${top3Brands[2].name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-milk-tea-medium rounded-lg flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-milk-tea-dark">
                      {top3Brands[2].name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-center text-milk-tea-darker mb-1 sm:mb-2">
                {top3Brands[2].name}
              </h3>
              <div className="text-center mb-1 sm:mb-2">
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-semibold ${tierColors[top3Brands[2].tier]}`}>
                  {top3Brands[2].tier} Tier
                </span>
              </div>
              <div className="text-center text-milk-tea-darker font-bold text-sm sm:text-base md:text-lg">
                {Math.round(top3Brands[2].elo)} <span className="text-milk-tea-dark text-xs sm:text-sm font-normal">Elo</span>
              </div>
            </div>
            <div className="bg-gradient-to-t from-milk-tea-medium to-milk-tea-light w-32 sm:w-40 md:w-52 h-16 sm:h-20 md:h-28 rounded-t-lg flex items-center justify-center shadow-lg">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-milk-tea-darker">3</span>
            </div>
          </Link>
          )}
        </div>
        )}

        {/* Animated Arrow - only show if there are more brands beyond the podium */}
        {displayBrands.length > 3 && (
        <div className="flex justify-center mb-8 relative z-20 animate-fade-in-up animate-delay-400">
          <button
            onClick={scrollToResults}
            className="text-milk-tea-darker hover:text-milk-tea-dark transition-colors animate-arrow-bounce"
            aria-label="Scroll to results"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        )}
      </div>

          {/* Results Section */}
          <div id="results-section" className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 relative z-10">
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in-up">
              <div className="max-w-md mx-auto px-2">
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-lg text-sm sm:text-base text-milk-tea-darker placeholder-milk-tea-dark/50 focus:outline-none focus:border-milk-tea-dark transition-all duration-300 shadow-lg focus:scale-[1.02]"
                />
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl shadow-lg overflow-hidden">
          <div className="scrollbar-hide overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-milk-tea-medium/50">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-milk-tea-darker">Rank</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-milk-tea-darker">Brand</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-milk-tea-darker">Tier</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-milk-tea-darker">Elo</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-milk-tea-darker hidden sm:table-cell">Origin</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-milk-tea-darker">Price</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-milk-tea-darker hidden md:table-cell">Regions</th>
                </tr>
              </thead>
                  <tbody className="divide-y divide-milk-tea-medium/30">
                    {filteredBrands.map((brand, index) => (
                      <tr 
                        key={brand.id} 
                        onClick={() => router.push(`/brand/${slugifyBrandName(brand.name)}`)}
                        className="hover:bg-white/20 transition-all duration-300 animate-fade-in-up cursor-pointer" 
                        style={{ animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
                      >
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base text-milk-tea-darker font-bold">#{brand.rank}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        {brand.logo_url ? (
                          <div className="relative w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 flex-shrink-0">
                            <Image
                              src={brand.logo_url}
                              alt={`${brand.name} logo`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-milk-tea-medium rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-milk-tea-dark">
                              {brand.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-xs sm:text-sm md:text-base text-milk-tea-darker font-medium truncate">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                      <span className={`px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded text-xs font-semibold ${tierColors[brand.tier]}`}>
                        {brand.tier} Tier
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base text-milk-tea-darker font-semibold">{Math.round(brand.elo)}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base text-milk-tea-dark hidden sm:table-cell">{brand.country_of_origin}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base text-milk-tea-dark">
                      {brand.price ? '$'.repeat(brand.price) : '-'}
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {brand.regions.slice(0, 2).map((region) => (
                          <span
                            key={region}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-milk-tea-medium/50 text-milk-tea-darker rounded text-xs"
                          >
                            {region}
                          </span>
                        ))}
                        {brand.regions.length > 2 && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-milk-tea-dark text-xs">
                            +{brand.regions.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}



