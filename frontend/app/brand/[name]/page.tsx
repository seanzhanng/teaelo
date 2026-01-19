import { notFound } from 'next/navigation';
import { slugifyBrandName } from '@/lib/api';
import BrandCardDisplay from '@/components/BrandCardDisplay';
import { BackendBrand } from '@/lib/backendTypes';
import { mapBackendBrandToUiBrand } from '@/lib/brandMapper';
import { UiBrand } from '@/lib/uiTypes';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ name: string }>;
}

const API_BASE_URL = process.env.TEAELO_API_BASE_URL ?? 'http://127.0.0.1:8000';

const fetchBrands = async (): Promise<UiBrand[]> => {
  const response = await fetch(`${API_BASE_URL}/brands?limit=200`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as BackendBrand[];
  return data.map(mapBackendBrandToUiBrand);
};

const getBrandBySlug = async (slug: string): Promise<UiBrand | null> => {
  const brands = await fetchBrands();
  return brands.find((brand) => slugifyBrandName(brand.name) === slug) ?? null;
};

export default async function BrandPage({ params }: PageProps) {
  const { name } = await params;
  const brand = await getBrandBySlug(name);

  if (!brand) {
    notFound();
  }

  // Convert full Brand schema to simplified Brand for BrandCardDisplay
  const brandCardData = {
    id: brand.id,
    name: brand.name,
    logo_url: brand.logo_url,
    country_of_origin: brand.country_of_origin,
    elo: brand.elo,
    tier: brand.tier,
    rank: brand.rank,
  };

  return (
    <div className="min-h-full w-full pt-20 pb-48 relative z-10 lg:h-screen lg:overflow-y-auto lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10 lg:h-full lg:flex lg:flex-col lg:justify-center">
        {/* Mobile: Stacked Layout */}
        <div className="lg:hidden space-y-8">
          {/* Side Card - Mobile */}
          <div className="flex justify-center mt-8 animate-fade-in-scale" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <BrandCardDisplay {...brandCardData} />
          </div>

          {/* Main Content - Mobile */}
          <div className="space-y-8">
            {/* Stats Section */}
            <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <h2 className="text-xl font-semibold text-milk-tea-darker mb-4">Statistics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{brand.stats.wins}</div>
                  <div className="text-sm text-milk-tea-dark">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{brand.stats.losses}</div>
                  <div className="text-sm text-milk-tea-dark">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-milk-tea-darker">{brand.stats.ties}</div>
                  <div className="text-sm text-milk-tea-dark">Ties</div>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
              <h2 className="text-xl font-semibold text-milk-tea-darker mb-4">About</h2>
              <p className="text-milk-tea-dark leading-relaxed text-base">{brand.description}</p>
              {brand.description && brand.description.length < 300 && (
                <p className="text-milk-tea-dark leading-relaxed text-base mt-4">
                  This brand has made a significant impact on the global boba tea scene, contributing to the growing popularity of bubble tea culture worldwide. Through their commitment to quality ingredients and innovative flavors, they have earned their place in the competitive beverage market.
                </p>
              )}
            </section>

            {/* Market Presence */}
            <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
              <h2 className="text-xl font-semibold text-milk-tea-darker mb-4">Market Presence</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-milk-tea-dark">Total Locations: </span>
                  <span className="font-semibold text-milk-tea-darker">
                    {brand.metadata.total_locations.toLocaleString()}
                  </span>
                </div>
                <div>
                  <div className="text-milk-tea-dark mb-2">Regions:</div>
                  <div className="flex flex-wrap gap-2">
                    {brand.metadata.regions.map((region) => (
                      <span
                        key={region}
                        className="px-3 py-1 bg-milk-tea-medium/50 text-milk-tea-darker rounded text-sm"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Website Link */}
            <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
              <a
                href={brand.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-milk-tea-darker hover:text-milk-tea-dark font-semibold transition-colors"
              >
                Visit Website
                <span>→</span>
              </a>
            </section>
          </div>
        </div>

        {/* Desktop: Split View Layout */}
        <div className="hidden lg:flex lg:gap-6 lg:items-stretch">
          {/* Sticky Side Card */}
          <div className="w-1/3 flex-shrink-0 flex flex-col animate-fade-in-scale" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <BrandCardDisplay {...brandCardData} />
          </div>

          {/* Main Content Area - Sections that align with card */}
          <div className="flex-1">
            <div className="space-y-4">
              {/* Stats Section */}
              <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-5 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
                <h2 className="text-xl font-semibold text-milk-tea-darker mb-4">Statistics</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{brand.stats.wins}</div>
                    <div className="text-xs text-milk-tea-dark mt-1">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{brand.stats.losses}</div>
                    <div className="text-xs text-milk-tea-dark mt-1">Losses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-milk-tea-darker">{brand.stats.ties}</div>
                    <div className="text-xs text-milk-tea-dark mt-1">Ties</div>
                  </div>
                </div>
              </section>

              {/* About Section - Full Width */}
              <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-5 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
                <h2 className="text-xl font-semibold text-milk-tea-darker mb-3">About</h2>
                <p className="text-sm text-milk-tea-dark leading-relaxed">{brand.description}</p>
                {brand.description && brand.description.length < 300 && (
                  <p className="text-sm text-milk-tea-dark leading-relaxed mt-3">
                    This brand has made a significant impact on the global boba tea scene, contributing to the growing popularity of bubble tea culture worldwide. Through their commitment to quality ingredients and innovative flavors, they have earned their place in the competitive beverage market.
                  </p>
                )}
              </section>

              {/* Market Presence and Regions Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Market Presence */}
                <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-5 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
                  <h2 className="text-xl font-semibold text-milk-tea-darker mb-4">Market Presence</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-milk-tea-dark">Total Locations: </span>
                      <span className="font-semibold text-milk-tea-darker text-base">
                        {brand.metadata.total_locations.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <a
                        href={brand.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-milk-tea-darker hover:text-milk-tea-dark font-semibold transition-colors underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                </section>

                {/* Regions */}
                <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-5 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.45s', opacity: 0, animationFillMode: 'forwards' }}>
                  <h2 className="text-xl font-semibold text-milk-tea-darker mb-4">Regions</h2>
                  <div className="flex flex-wrap gap-2">
                    {brand.metadata.regions.map((region) => (
                      <span
                        key={region}
                        className="px-3 py-1 bg-milk-tea-medium/50 text-milk-tea-darker rounded text-sm"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

