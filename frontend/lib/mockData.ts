// Cupped Brand Schema
export interface Brand {
  id: string;
  name: string;
  logo_url: string;
  country_of_origin: string;
  elo: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
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
    price_category: 1 | 2 | 3 | 4;
    total_locations: number;
    regions: string[];
  };
  description: string;
  website_url: string;
}

export const brands: Brand[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Gong Cha',
    logo_url: 'https://gong-cha-usa.com/wp-content/uploads/Gong-cha-vertical-logo-symbol-mark-540x540-opt.png',
    country_of_origin: 'Taiwan',
    elo: 2150.3,
    tier: 'S',
    rank: 1,
    stats: {
      wins: 1247,
      losses: 523,
      ties: 89,
    },
    trends: {
      elo_trend: 12.5,
      rank_trend: -2,
    },
    metadata: {
      price_category: 2,
      total_locations: 1500,
      regions: ['Taiwan', 'United States', 'Canada', 'Australia', 'United Kingdom', 'Singapore', 'Malaysia'],
    },
    description: 'Gong Cha is a premium bubble tea brand originating from Taiwan, known for its high-quality tea leaves and customizable drink options. Founded in 2006, Gong Cha has expanded globally while maintaining its commitment to authentic Taiwanese bubble tea culture.',
    website_url: 'https://gong-cha-usa.com',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Tiger Sugar',
    logo_url: 'https://assets.simon.com/tenantlogos/33375.png',
    country_of_origin: 'Taiwan',
    elo: 2080.7,
    tier: 'S',
    rank: 2,
    stats: {
      wins: 892,
      losses: 341,
      ties: 45,
    },
    trends: {
      elo_trend: 8.3,
      rank_trend: 0,
    },
    metadata: {
      price_category: 3,
      total_locations: 450,
      regions: ['Taiwan', 'United States', 'Canada', 'Australia', 'Japan', 'South Korea'],
    },
    description: 'Tiger Sugar is famous for its signature "tiger stripe" brown sugar boba milk, creating a visually striking and delicious drink. Since its founding in 2017, Tiger Sugar has become a global phenomenon, known for its Instagram-worthy beverages and premium ingredients.',
    website_url: 'https://tigersugar.com',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'The Alley',
    logo_url: 'https://www.crossironmills.com/media/v1/365/2022/08/thealleylogonew_1.png',
    country_of_origin: 'Taiwan',
    elo: 2025.1,
    tier: 'A',
    rank: 3,
    stats: {
      wins: 756,
      losses: 298,
      ties: 32,
    },
    trends: {
      elo_trend: 5.7,
      rank_trend: -1,
    },
    metadata: {
      price_category: 2,
      total_locations: 320,
      regions: ['Taiwan', 'United States', 'Canada', 'Australia', 'Singapore'],
    },
    description: 'The Alley is a premium bubble tea brand that combines traditional tea culture with modern aesthetics. Known for its artistic presentation and high-quality ingredients, The Alley has built a strong following since 2015 with its unique flavor combinations and beautiful store designs.',
    website_url: 'https://thealley.com',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Boba Guys',
    logo_url: 'https://static1.squarespace.com/static/50ce46ece4b01020c34fd52b/t/6247fba73cb3cc54675fc60a/1648884647375/bobaguys_logo_FINAL+%283%29.png?format=1500w',
    country_of_origin: 'United States',
    elo: 1950.5,
    tier: 'A',
    rank: 4,
    stats: {
      wins: 634,
      losses: 267,
      ties: 28,
    },
    trends: {
      elo_trend: 3.2,
      rank_trend: 1,
    },
    metadata: {
      price_category: 3,
      total_locations: 45,
      regions: ['United States', 'Canada'],
    },
    description: 'Boba Guys is a San Francisco-based bubble tea company that brings premium, artisanal boba to the West Coast. Founded in 2011, Boba Guys focuses on high-quality ingredients, house-made syrups, and a commitment to sustainability. Their approach has helped popularize boba culture in the United States.',
    website_url: 'https://bobaguys.com',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Chatime',
    logo_url: 'https://www.scrapehero.com/store/wp-content/uploads/2022/04/Chatime_Canada-324x324.png',
    country_of_origin: 'Taiwan',
    elo: 1920.3,
    tier: 'A',
    rank: 5,
    stats: {
      wins: 1123,
      losses: 489,
      ties: 67,
    },
    trends: {
      elo_trend: -2.1,
      rank_trend: 2,
    },
    metadata: {
      price_category: 2,
      total_locations: 1200,
      regions: ['Taiwan', 'United States', 'Canada', 'Australia', 'United Kingdom', 'Philippines', 'Indonesia'],
    },
    description: 'Chatime is one of the world\'s largest bubble tea chains, founded in Taiwan in 2005. With over 1,200 locations globally, Chatime has been instrumental in bringing bubble tea to international markets. The brand is known for its consistent quality and wide variety of customizable drink options.',
    website_url: 'https://chatime.com',
  },
];



