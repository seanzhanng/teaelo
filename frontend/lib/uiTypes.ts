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
  metadata: {
    total_locations: number;
    regions: string[];
  };
  description: string;
  website_url: string;
}

