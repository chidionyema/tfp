// app/api/geocoding/route.ts
import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latlng = searchParams.get('latlng');

  if (!latlng) {
    return NextResponse.json({ error: 'Missing latlng parameter' }, { status: 400 });
  }

  if (!GOOGLE_PLACES_KEY) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${GOOGLE_PLACES_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Google Geocoding API error' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}