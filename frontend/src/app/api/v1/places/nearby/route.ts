import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import localMasterPois from '@/data/triton_pois_full.json';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knmlbwsmfljlabhvqfid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Haversine formula helper for exact distance computation
function calculateHaversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius') || '5';
    const limitParam = searchParams.get('limit') || '12';
    const categoryParam = searchParams.get('category');

    // Default center: Thị trấn Tri Tôn (10.4244, 105.0028)
    const userLat = latParam ? parseFloat(latParam) : 10.4244;
    const userLng = lngParam ? parseFloat(lngParam) : 105.0028;
    const radiusKm = Math.min(Math.max(parseFloat(radiusParam) || 5, 0.5), 50);
    const limit = Math.min(Math.max(parseInt(limitParam, 10) || 12, 1), 50);

    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { success: false, error: 'Tọa độ GPS (lat, lng) không hợp lệ.' },
        { status: 400 }
      );
    }

    // 1. Attempt PostGIS RPC execution on Supabase
    try {
      const rpcPromise = supabase.rpc('get_nearby_places', {
        user_lat: userLat,
        user_lng: userLng,
        radius_km: radiusKm,
        limit_count: limit,
      });

      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('PostGIS RPC timeout') }), 2500)
      );

      const { data: dbPlaces, error } = await Promise.race([rpcPromise, timeoutPromise]);

      if (!error && Array.isArray(dbPlaces) && dbPlaces.length > 0) {
        let filtered = dbPlaces;
        if (categoryParam && categoryParam !== 'ALL') {
          filtered = filtered.filter((p) => p.category?.toLowerCase().includes(categoryParam.toLowerCase()));
        }

        const formatted = filtered.map((p) => ({
          ...p,
          distance_meters: Math.round(p.distance_meters),
          distance_formatted: formatDistance(p.distance_meters),
        }));

        return NextResponse.json({
          success: true,
          user_location: { lat: userLat, lng: userLng },
          radius_km: radiusKm,
          total: formatted.length,
          places: formatted,
          source: 'postgis_rpc',
        });
      }
    } catch (rpcErr) {
      console.warn('[PostGIS RPC Warning]: Falling back to local spatial calculation', rpcErr);
    }

    // 2. High-precision Local Haversine Spatial Engine (0% Mock / Always Available)
    const masterList = localMasterPois as any[];
    const maxMeters = radiusKm * 1000;

    const nearbyList = masterList
      .map((poi) => {
        const poiLat = parseFloat(poi.latitude);
        const poiLng = parseFloat(poi.longitude);
        const distanceMeters = calculateHaversineDistanceMeters(userLat, userLng, poiLat, poiLng);
        return {
          id: poi.id,
          slug: poi.slug || poi.id,
          name: poi.name,
          name_en: poi.name_en || null,
          commune: poi.commune,
          category: poi.category,
          image_url: poi.image_url,
          rating: poi.rating || 4.8,
          latitude: poiLat,
          longitude: poiLng,
          address: poi.address,
          distance_meters: distanceMeters,
          distance_formatted: formatDistance(distanceMeters),
        };
      })
      .filter((poi) => {
        if (poi.distance_meters > maxMeters) return false;
        if (categoryParam && categoryParam !== 'ALL') {
          return poi.category?.toLowerCase().includes(categoryParam.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => a.distance_meters - b.distance_meters)
      .slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        user_location: { lat: userLat, lng: userLng },
        radius_km: radiusKm,
        total: nearbyList.length,
        places: nearbyList,
        source: 'local_haversine',
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  } catch (err: any) {
    console.error('[Nearby API Error]:', err);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi tính toán khoảng cách địa điểm: ' + (err?.message || 'Unknown') },
      { status: 500 }
    );
  }
}
