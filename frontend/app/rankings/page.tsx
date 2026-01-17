'use client';

import React, { useState } from 'react';
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
  price?: 1 | 2 | 3 | 4;
}

const tierColors: Record<Brand['tier'], string> = {
  S: 'bg-purple-600 text-white',
  A: 'bg-blue-600 text-white',
  B: 'bg-green-600 text-white',
  C: 'bg-yellow-600 text-white',
  D: 'bg-orange-600 text-white',
  F: 'bg-red-600 text-white',
};

// Placeholder data - top 3 for podium
const top3Brands: Brand[] = [
  {
    id: '1',
    name: 'Gong Cha',
    logo_url: 'https://gong-cha-usa.com/wp-content/uploads/Gong-cha-vertical-logo-symbol-mark-540x540-opt.png',
    country_of_origin: 'Taiwan',
    elo: 2150.3,
    tier: 'S',
    rank: 1,
    established_date: '2006',
    price: 2,
  },
  {
    id: '2',
    name: 'Chatime',
    logo_url: 'https://www.scrapehero.com/store/wp-content/uploads/2022/04/Chatime_Canada-324x324.png',
    country_of_origin: 'Taiwan',
    elo: 2080.7,
    tier: 'S',
    rank: 2,
    established_date: '2005',
    price: 2,
  },
  {
    id: '3',
    name: 'Boba Guys',
    logo_url: 'https://static1.squarespace.com/static/50ce46ece4b01020c34fd52b/t/6247fba73cb3cc54675fc60a/1648884647375/bobaguys_logo_FINAL+%283%29.png?format=1500w',
    country_of_origin: 'United States',
    elo: 1950.5,
    tier: 'A',
    rank: 3,
    established_date: '2011',
    price: 3,
  },
];

// Placeholder data for remaining brands
const remainingBrands: Brand[] = Array.from({ length: 20 }, (_, i) => ({
  id: `brand-${i + 4}`,
  name: `Brand ${i + 4}`,
  logo_url: 'https://via.placeholder.com/150/432f26/ebddd0?text=B',
  country_of_origin: ['Taiwan', 'United States', 'China', 'Japan'][i % 4],
  elo: 1900 - (i * 10),
  tier: ['S', 'A', 'B', 'C'][Math.floor(i / 5)] as Brand['tier'],
  rank: i + 4,
  established_date: String(2000 + (i % 20)),
  price: (i % 4) + 1 as 1 | 2 | 3 | 4,
}));

export default function RankingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const allBrands = [...top3Brands, ...remainingBrands];
  const [filteredBrands, setFilteredBrands] = useState(allBrands);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = allBrands.filter(
      (brand) =>
        brand.name.toLowerCase().includes(query.toLowerCase()) ||
        brand.country_of_origin.toLowerCase().includes(query.toLowerCase())
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
    <div className="h-full overflow-y-auto scrollbar-hide relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-milk-tea-darker mb-4">
          Global Leaderboard
        </h1>
        <p className="text-lg text-milk-tea-dark/80 max-w-2xl mx-auto">
          See how boba brands rank based on community votes and Elo ratings.
        </p>
      </div>
      
        {/* Podium for Top 3 */}
        <div className="flex items-end justify-center gap-6 mb-16 relative z-20">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg mb-4 w-52">
              <div className="flex justify-center mb-3">
                {top3Brands[1].logo_url ? (
                  <div className="relative w-28 h-28">
                    <Image
                      src={top3Brands[1].logo_url}
                      alt={`${top3Brands[1].name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-milk-tea-medium rounded-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-milk-tea-dark">
                      {top3Brands[1].name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-center text-milk-tea-darker mb-2">
                {top3Brands[1].name}
              </h3>
              <div className="text-center mb-2">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${tierColors[top3Brands[1].tier]}`}>
                  {top3Brands[1].tier} Tier
                </span>
              </div>
              <div className="text-center text-milk-tea-darker font-bold text-lg">
                {Math.round(top3Brands[1].elo)} <span className="text-milk-tea-dark text-sm font-normal">Elo</span>
              </div>
            </div>
            <div className="bg-gradient-to-t from-milk-tea-medium to-milk-tea-light w-52 h-36 rounded-t-lg flex items-center justify-center shadow-lg">
              <span className="text-5xl font-bold text-milk-tea-darker">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-7 shadow-2xl mb-4 w-56">
              <div className="flex justify-center mb-3">
                {top3Brands[0].logo_url ? (
                  <div className="relative w-32 h-32">
                    <Image
                      src={top3Brands[0].logo_url}
                      alt={`${top3Brands[0].name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-milk-tea-medium rounded-lg flex items-center justify-center">
                    <span className="text-4xl font-bold text-milk-tea-dark">
                      {top3Brands[0].name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-center text-milk-tea-darker mb-2">
                {top3Brands[0].name}
              </h3>
              <div className="text-center mb-2">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${tierColors[top3Brands[0].tier]}`}>
                  {top3Brands[0].tier} Tier
                </span>
              </div>
              <div className="text-center text-milk-tea-darker font-bold text-xl">
                {Math.round(top3Brands[0].elo)} <span className="text-milk-tea-dark text-sm font-normal">Elo</span>
              </div>
            </div>
            <div className="bg-gradient-to-t from-milk-tea-medium to-milk-tea-light w-56 h-44 rounded-t-lg flex items-center justify-center shadow-xl">
              <span className="text-6xl font-bold text-milk-tea-darker">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg mb-4 w-52">
              <div className="flex justify-center mb-3">
                {top3Brands[2].logo_url ? (
                  <div className="relative w-28 h-28">
                    <Image
                      src={top3Brands[2].logo_url}
                      alt={`${top3Brands[2].name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-milk-tea-medium rounded-lg flex items-center justify-center">
                    <span className="text-3xl font-bold text-milk-tea-dark">
                      {top3Brands[2].name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-center text-milk-tea-darker mb-2">
                {top3Brands[2].name}
              </h3>
              <div className="text-center mb-2">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${tierColors[top3Brands[2].tier]}`}>
                  {top3Brands[2].tier} Tier
                </span>
              </div>
              <div className="text-center text-milk-tea-darker font-bold text-lg">
                {Math.round(top3Brands[2].elo)} <span className="text-milk-tea-dark text-sm font-normal">Elo</span>
              </div>
            </div>
            <div className="bg-gradient-to-t from-milk-tea-medium to-milk-tea-light w-52 h-28 rounded-t-lg flex items-center justify-center shadow-lg">
              <span className="text-5xl font-bold text-milk-tea-darker">3</span>
            </div>
          </div>
        </div>

        {/* Animated Arrow */}
        <div className="flex justify-center mb-8 relative z-20">
          <button
            onClick={scrollToResults}
            className="animate-bounce text-milk-tea-darker hover:text-milk-tea-dark transition-colors"
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
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-lg text-milk-tea-darker placeholder-milk-tea-dark/50 focus:outline-none focus:border-milk-tea-dark transition-colors shadow-lg"
            />
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl shadow-lg overflow-hidden">
          <div className="scrollbar-hide">
            <table className="w-full">
              <thead className="bg-milk-tea-medium/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-milk-tea-darker">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-milk-tea-darker">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-milk-tea-darker">Tier</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-milk-tea-darker">Elo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-milk-tea-darker">Origin</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-milk-tea-darker">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-milk-tea-medium/30">
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-white/20 transition-colors">
                    <td className="px-6 py-4 text-milk-tea-darker font-bold">#{brand.rank}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {brand.logo_url ? (
                          <div className="relative w-10 h-10">
                            <Image
                              src={brand.logo_url}
                              alt={`${brand.name} logo`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-milk-tea-medium rounded flex items-center justify-center">
                            <span className="text-sm font-bold text-milk-tea-dark">
                              {brand.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-milk-tea-darker font-medium">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${tierColors[brand.tier]}`}>
                        {brand.tier} Tier
                      </span>
                    </td>
                    <td className="px-6 py-4 text-milk-tea-darker font-semibold">{Math.round(brand.elo)}</td>
                    <td className="px-6 py-4 text-milk-tea-dark">{brand.country_of_origin}</td>
                    <td className="px-6 py-4 text-milk-tea-dark">
                      {brand.price ? '$'.repeat(brand.price) : '-'}
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
