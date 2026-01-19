export interface BackendBrand {
  id: string;
  name: string;
  description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  country_of_origin?: string | null;
  established_date?: string | null;
  regions_present?: string[] | null;
  total_locations?: number | null;
  elo: number;
  wins: number;
  losses: number;
  ties?: number | null;
  tier: string;
  rank?: number | null;
  elo_trend?: number | null;
  rank_trend?: number | null;
}

export interface MatchCreateRequest {
  winner_id: string;
  loser_id: string;
  location_country?: string;
  location_city?: string;
}

export interface MatchResult {
  winner_id: string;
  winner_new_elo: number;
  winner_elo_change: number;
  loser_id: string;
  loser_new_elo: number;
  loser_elo_change: number;
}

