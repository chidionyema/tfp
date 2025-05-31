// app/api/places/details/route.ts
import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const place_id = searchParams.get('place_id');
  const sessiontoken = searchParams.get('sessiontoken');

  if (!place_id) {
    return NextResponse.json({ error: 'Missing place_id parameter' }, { status: 400 });
  }

  if (!GOOGLE_PLACES_KEY) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 });
  }

  try {
    let url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=formatted_address,geometry,name,place_id&key=${GOOGLE_PLACES_KEY}`;
    
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
    console.error('Place Details API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}