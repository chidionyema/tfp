// app/api/places/autocomplete/route.ts
import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  const sessiontoken = searchParams.get('sessiontoken');

  if (!input) {
    return NextResponse.json({ error: 'Missing input parameter' }, { status: 400 });
  }

  if (!GOOGLE_PLACES_KEY) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 });
  }

  try {
    const encoded = encodeURIComponent(input);
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encoded}&key=${GOOGLE_PLACES_KEY}&types=establishment|geocode&components=country:uk`;
    
    if (sessiontoken) {
      url += `&sessiontoken=${sessiontoken}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Google Places API error' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Places Autocomplete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}