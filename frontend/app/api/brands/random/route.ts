import { NextResponse } from 'next/server';
import { fetchJson } from '@/lib/apiClient';
import { BackendBrand } from '@/lib/backendTypes';
import { mapBackendBrandToUiBrand } from '@/lib/brandMapper';

const API_BASE_URL = process.env.TEAELO_API_BASE_URL ?? 'http://127.0.0.1:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    const url = new URL(`${API_BASE_URL}/brands/random`);
    if (country) url.searchParams.set('country', country);

    const brands = await fetchJson<BackendBrand[]>(url.toString());
    return NextResponse.json(brands.map(mapBackendBrandToUiBrand));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch random brands' },
      { status: 500 }
    );
  }
}

