/**
 * PostGIS Route Engine & Travel Time Calculator for Tri Ton Tourism AI
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface RouteSegment {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  distanceKm: number;
  travelTimeMinutes: number;
}

export interface ItinerarySummary {
  totalDistanceKm: number;
  totalTravelTimeMinutes: number;
  totalVisitTimeMinutes: number;
  totalTripTimeMinutes: number;
  segments: RouteSegment[];
}

/**
 * Calculate Haversine distance between two lat/lng coordinates in kilometers
 */
export function calculateHaversineDistance(pt1: GeoPoint, pt2: GeoPoint): number {
  const R = 6371; // Earth's radius in km
  const dLat = (pt2.latitude - pt1.latitude) * (Math.PI / 180);
  const dLng = (pt2.longitude - pt1.longitude) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pt1.latitude * (Math.PI / 180)) *
      Math.cos(pt2.latitude * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return Number(distanceKm.toFixed(1));
}

/**
 * Estimate motorbike travel time in minutes based on 30km/h average speed in Tri Ton
 */
export function estimateMotorbikeTime(distanceKm: number): number {
  if (distanceKm <= 0.2) return 2;
  const minutes = (distanceKm / 30.0) * 60;
  return Math.max(3, Math.round(minutes));
}

/**
 * Calculate full route summary for an array of POIs with lat/lng
 */
export function calculateItineraryRoute(
  pois: Array<{ id: string; name: string; latitude?: number; longitude?: number; visitTimeMinutes?: number }>
): ItinerarySummary {
  let totalDistanceKm = 0;
  let totalTravelTimeMinutes = 0;
  let totalVisitTimeMinutes = 0;
  const segments: RouteSegment[] = [];

  for (let i = 0; i < pois.length; i++) {
    const current = pois[i];
    totalVisitTimeMinutes += current.visitTimeMinutes || 60;

    if (i < pois.length - 1) {
      const next = pois[i + 1];
      if (
        current.latitude &&
        current.longitude &&
        next.latitude &&
        next.longitude
      ) {
        const dist = calculateHaversineDistance(
          { latitude: current.latitude, longitude: current.longitude },
          { latitude: next.latitude, longitude: next.longitude }
        );
        const timeMin = estimateMotorbikeTime(dist);

        totalDistanceKm += dist;
        totalTravelTimeMinutes += timeMin;

        segments.push({
          fromId: current.id,
          fromName: current.name,
          toId: next.id,
          toName: next.name,
          distanceKm: dist,
          travelTimeMinutes: timeMin,
        });
      }
    }
  }

  return {
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalTravelTimeMinutes,
    totalVisitTimeMinutes,
    totalTripTimeMinutes: totalTravelTimeMinutes + totalVisitTimeMinutes,
    segments,
  };
}
