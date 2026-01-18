import { notFound } from 'next/navigation';
import { getBrandByName, getAllBrands, slugifyBrandName } from '@/lib/api';
import BrandCardDisplay from '@/components/BrandCardDisplay';

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  const brands = getAllBrands();
  return brands.map((brand) => ({
    name: slugifyBrandName(brand.name),
  }));
}

export default async function BrandPage({ params }: PageProps) {
  const { name } = await params;
  const brand = getBrandByName(name);

  if (!brand) {
    notFound();
  }

  const priceDisplay = '$'.repeat(brand.metadata.price_category);

  // Convert full Brand schema to simplified Brand for BrandCardDisplay
  const brandCardData = {
    id: brand.id,
    name: brand.name,
    logo_url: brand.logo_url,
    country_of_origin: brand.country_of_origin,
    elo: brand.elo,
    tier: brand.tier,
    rank: brand.rank,
    price: brand.metadata.price_category,
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

            {/* Trends Section */}
            <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
              <h2 className="text-xl font-semibold text-milk-tea-darker mb-4">Trends</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-milk-tea-dark">Elo Trend</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-semibold ${
                        brand.trends.elo_trend >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {brand.trends.elo_trend >= 0 ? '+' : ''}
                      {brand.trends.elo_trend.toFixed(1)}
                    </span>
                    {brand.trends.elo_trend >= 0 ? (
                      <span className="text-green-600">↑</span>
                    ) : (
                      <span className="text-red-600">↓</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-milk-tea-dark">Rank Trend</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-semibold ${
                        brand.trends.rank_trend <= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {brand.trends.rank_trend > 0 ? '+' : ''}
                      {brand.trends.rank_trend}
                    </span>
                    {brand.trends.rank_trend <= 0 ? (
                      <span className="text-green-600">↑</span>
                    ) : (
                      <span className="text-red-600">↓</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
              <h2 className="text-xl font-semibold text-milk-tea-darker mb-4">About</h2>
              <p className="text-milk-tea-dark leading-relaxed">{brand.description}</p>
            </section>

            {/* Market Presence */}
            <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
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
                <div>
                  <span className="text-milk-tea-dark">Price Category: </span>
                  <span className="font-semibold text-milk-tea-darker">{priceDisplay}</span>
                </div>
              </div>
            </section>

            {/* Website Link */}
            <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
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

              {/* Trends and About Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Trends Section */}
                <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-5 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
                  <h2 className="text-xl font-semibold text-milk-tea-darker mb-4">Trends</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-milk-tea-medium/30">
                      <span className="text-sm text-milk-tea-dark">Elo Trend</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-semibold ${
                            brand.trends.elo_trend >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {brand.trends.elo_trend >= 0 ? '+' : ''}
                          {brand.trends.elo_trend.toFixed(1)}
                        </span>
                        {brand.trends.elo_trend >= 0 ? (
                          <span className="text-lg text-green-600">↑</span>
                        ) : (
                          <span className="text-lg text-red-600">↓</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-milk-tea-dark">Rank Trend</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-semibold ${
                            brand.trends.rank_trend <= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {brand.trends.rank_trend > 0 ? '+' : ''}
                          {brand.trends.rank_trend}
                        </span>
                        {brand.trends.rank_trend <= 0 ? (
                          <span className="text-lg text-green-600">↑</span>
                        ) : (
                          <span className="text-lg text-red-600">↓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Description */}
                <section className="bg-white/30 backdrop-blur-md border-2 border-milk-tea-medium rounded-xl p-5 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.35s', opacity: 0, animationFillMode: 'forwards' }}>
                  <h2 className="text-xl font-semibold text-milk-tea-darker mb-3">About</h2>
                  <p className="text-sm text-milk-tea-dark leading-relaxed">{brand.description}</p>
                </section>
              </div>

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
                      <span className="text-sm text-milk-tea-dark">Price Category: </span>
                      <span className="font-semibold text-milk-tea-darker text-base">{priceDisplay}</span>
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

