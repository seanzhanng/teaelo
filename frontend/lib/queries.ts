import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchJson } from './apiClient';
import { UiBrand } from './uiTypes';

export const useRandomPair = (country?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['brands', 'random', country],
    queryFn: async () => {
      const url = country ? `/api/brands/random?country=${encodeURIComponent(country)}` : '/api/brands/random';
      return fetchJson<UiBrand[]>(url);
    },
    enabled, // Only run query when enabled (prevents double fetch during location detection)
    refetchOnWindowFocus: false, // Don't refresh cards when user switches back to tab
    staleTime: Infinity, // Keep the same random pair until explicitly refetched
  });
};

export const useLeaderboard = (params?: { limit?: number; offset?: number; search?: string }) => {
  return useQuery({
    queryKey: ['brands', 'leaderboard', params],
    queryFn: async () => {
      const url = new URL('/api/brands/leaderboard', window.location.origin);
      if (params?.limit !== undefined) url.searchParams.set('limit', String(params.limit));
      if (params?.offset !== undefined) url.searchParams.set('offset', String(params.offset));
      if (params?.search) url.searchParams.set('search', params.search);
      return fetchJson<UiBrand[]>(url.toString());
    },
  });
};

export const useVoteMutation = () => {
  return useMutation({
    mutationFn: async (payload: {
      winnerId: string;
      loserId: string;
      isTie?: boolean;
      locationCountry?: string | null;
      locationCity?: string | null;
    }) => {
      return fetchJson<{ success: boolean; result?: unknown }>('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    },
  });
};

