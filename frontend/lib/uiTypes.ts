export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface UiBrand {
  id: string;
  name: string;
  logo_url: string;
  country_of_origin: string;
  elo: number;
  tier: Tier;
  rank: number;
  stats: {
    wins: number;
    losses: number;
    ties: number;
  };
  trends: {
    elo_trend: number;
    rank_trend: number;
  };
  metadata: {
    price_category?: 1 | 2 | 3 | 4;
    total_locations: number;
    regions: string[];
  };
  description: string;
  website_url: string;
}

