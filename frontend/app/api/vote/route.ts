import { NextResponse } from 'next/server';
import { fetchJson } from '@/lib/apiClient';
import { MatchResult } from '@/lib/backendTypes';

const API_BASE_URL = process.env.TEAELO_API_BASE_URL ?? 'http://127.0.0.1:8000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { winnerId, loserId, isTie, locationCountry, locationCity } = body;

    // Validate request
    if (!winnerId || !loserId) {
      return NextResponse.json(
        { error: 'Missing winnerId or loserId' },
        { status: 400 }
      );
    }

    if (isTie) {
      return NextResponse.json(
        { 
          success: true,
          message: 'Tie recorded client-side (no backend update yet)',
          winnerId,
          loserId,
          isTie,
        },
        { status: 200 }
      );
    }

    const result = await fetchJson<MatchResult>(`${API_BASE_URL}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        winner_id: winnerId,
        loser_id: loserId,
        location_country: locationCountry,
        location_city: locationCity,
      }),
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Vote recorded successfully',
        winnerId,
        loserId,
        isTie: false,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

