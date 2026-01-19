import { BackendBrand } from './backendTypes';
import { Tier, UiBrand } from './uiTypes';

const VALID_TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D', 'F'];

const normalizeTier = (tier: string | null | undefined): Tier => {
  if (!tier) return 'C';
  return VALID_TIERS.includes(tier as Tier) ? (tier as Tier) : 'C';
};

export const mapBackendBrandToUiBrand = (brand: BackendBrand): UiBrand => {
  return {
    id: brand.id,
    name: brand.name,
    logo_url: brand.logo_url ?? '',
    country_of_origin: brand.country_of_origin ?? 'Unknown',
    elo: brand.elo ?? 1200,
    tier: normalizeTier(brand.tier),
    rank: brand.rank ?? 0,
    stats: {
      wins: brand.wins ?? 0,
      losses: brand.losses ?? 0,
      ties: brand.ties ?? 0,
    },
    metadata: {
      total_locations: brand.total_locations ?? 0,
      regions: brand.regions_present ?? [],
    },
    description: brand.description ?? '',
    website_url: brand.website_url ?? '',
  };
};

