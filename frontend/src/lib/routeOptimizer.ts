/**
 * Smart Route Optimizer & Traveling Salesperson (TSP) Engine
 * Du Lịch Tri Tôn AI Project
 * 
 * Computes optimal visiting sequence for 2-10 POIs using Haversine distance,
 * mountain slope winding factors, Nearest Neighbor initialization, and 2-Opt refinement.
 */

export interface OptimizablePlace {
  id: string;
  name: string;
  commune: string;
  latitude: number;
  longitude: number;
  category?: string;
  image_url?: string;
}

export interface RouteLeg {
  from: OptimizablePlace;
  to: OptimizablePlace;
  distanceKm: number;
  estimatedMinutes: number;
  roadType: 'flat' | 'mountain_pass';
}

export interface OptimizedRouteResult {
  orderedPlaces: OptimizablePlace[];
  legs: RouteLeg[];
  originalKm: number;
  optimizedKm: number;
  savedKm: number;
  savedMinutes: number;
  totalDrivingMinutes: number;
  googleMapsMultiStopUrl: string;
}

/**
 * Haversine formula with road winding multiplier
 */
export function calculateRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  isMountainRoute: boolean = false
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  // Real world road winding coefficient: 1.28 for delta plains, 1.55 for mountain trails
  const windingFactor = isMountainRoute ? 1.55 : 1.28;
  return Number((straightLine * windingFactor).toFixed(1));
}

/**
 * Estimate travel duration in minutes based on terrain
 */
export function estimateDriveMinutes(distanceKm: number, isMountainRoute: boolean = false): number {
  if (distanceKm <= 0.1) return 2;
  // Speed: 35 km/h for plains, 20 km/h for mountain paths
  const speedKmh = isMountainRoute ? 20 : 35;
  const minutes = (distanceKm / speedKmh) * 60 + 3; // +3 min buffer for parking/traffic
  return Math.max(3, Math.round(minutes));
}

/**
 * Check if a place is located in steep mountain terrain
 */
function isMountainSpot(p: OptimizablePlace): boolean {
  const n = (p.name || '').toLowerCase();
  const cat = (p.category || '').toLowerCase();
  return (
    n.includes('núi cô tô') ||
    n.includes('vồ hội') ||
    n.includes('đồi tức dụp') ||
    n.includes('suối vàng') ||
    n.includes('ngọa long') ||
    cat.includes('mountain')
  );
}

/**
 * Compute total distance of an ordered array of places
 */
function computeTotalDistance(route: OptimizablePlace[]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const isMtn = isMountainSpot(route[i]) || isMountainSpot(route[i + 1]);
    total += calculateRoadDistanceKm(
      route[i].latitude,
      route[i].longitude,
      route[i + 1].latitude,
      route[i + 1].longitude,
      isMtn
    );
  }
  return Number(total.toFixed(1));
}

/**
 * 2-Opt Swap Algorithm to eliminate route crosses and minimize distance
 */
export function optimizeRouteTSP(
  places: OptimizablePlace[],
  fixedStartId?: string
): OptimizedRouteResult {
  if (!places || places.length === 0) {
    return {
      orderedPlaces: [],
      legs: [],
      originalKm: 0,
      optimizedKm: 0,
      savedKm: 0,
      savedMinutes: 0,
      totalDrivingMinutes: 0,
      googleMapsMultiStopUrl: '',
    };
  }

  if (places.length <= 2) {
    const originalKm = computeTotalDistance(places);
    const isMtn = places.length === 2 && (isMountainSpot(places[0]) || isMountainSpot(places[1]));
    const legs: RouteLeg[] =
      places.length === 2
        ? [
            {
              from: places[0],
              to: places[1],
              distanceKm: originalKm,
              estimatedMinutes: estimateDriveMinutes(originalKm, isMtn),
              roadType: isMtn ? 'mountain_pass' : 'flat',
            },
          ]
        : [];
    const totalMin = legs.reduce((acc, l) => acc + l.estimatedMinutes, 0);

    return {
      orderedPlaces: places,
      legs,
      originalKm,
      optimizedKm: originalKm,
      savedKm: 0,
      savedMinutes: 0,
      totalDrivingMinutes: totalMin,
      googleMapsMultiStopUrl: buildGoogleMapsMultiStopUrl(places),
    };
  }

  const originalKm = computeTotalDistance(places);

  // Step 1: Nearest Neighbor Heuristic Construction
  const unvisited = [...places];
  let startIdx = 0;
  if (fixedStartId) {
    const foundIdx = unvisited.findIndex((p) => p.id === fixedStartId);
    if (foundIdx >= 0) startIdx = foundIdx;
  }

  let currentRoute: OptimizablePlace[] = [unvisited.splice(startIdx, 1)[0]];

  while (unvisited.length > 0) {
    const last = currentRoute[currentRoute.length - 1];
    let nearestIdx = 0;
    let minDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const isMtn = isMountainSpot(last) || isMountainSpot(unvisited[i]);
      const dist = calculateRoadDistanceKm(
        last.latitude,
        last.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude,
        isMtn
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }

    currentRoute.push(unvisited.splice(nearestIdx, 1)[0]);
  }

  // Step 2: 2-Opt Optimization Iterations
  let bestRoute = [...currentRoute];
  let bestDistance = computeTotalDistance(bestRoute);
  let improved = true;
  let iterations = 0;
  const maxIterations = 60;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    // Iterate all pairs (keeping start point fixed if requested)
    const startRange = fixedStartId ? 1 : 0;
    for (let i = startRange; i < bestRoute.length - 1; i++) {
      for (let k = i + 1; k < bestRoute.length; k++) {
        // 2-Opt Swap: reverse sequence from i to k
        const newRoute = [
          ...bestRoute.slice(0, i),
          ...bestRoute.slice(i, k + 1).reverse(),
          ...bestRoute.slice(k + 1),
        ];

        const newDistance = computeTotalDistance(newRoute);
        if (newDistance < bestDistance - 0.05) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  // Step 3: Build legs & summary metrics
  const legs: RouteLeg[] = [];
  let totalDrivingMinutes = 0;

  for (let i = 0; i < bestRoute.length - 1; i++) {
    const isMtn = isMountainSpot(bestRoute[i]) || isMountainSpot(bestRoute[i + 1]);
    const legKm = calculateRoadDistanceKm(
      bestRoute[i].latitude,
      bestRoute[i].longitude,
      bestRoute[i + 1].latitude,
      bestRoute[i + 1].longitude,
      isMtn
    );
    const legMin = estimateDriveMinutes(legKm, isMtn);
    totalDrivingMinutes += legMin;

    legs.push({
      from: bestRoute[i],
      to: bestRoute[i + 1],
      distanceKm: legKm,
      estimatedMinutes: legMin,
      roadType: isMtn ? 'mountain_pass' : 'flat',
    });
  }

  const savedKm = Math.max(0, Number((originalKm - bestDistance).toFixed(1)));
  const savedMinutes = Math.max(0, Math.round((savedKm / 35) * 60));

  return {
    orderedPlaces: bestRoute,
    legs,
    originalKm,
    optimizedKm: Number(bestDistance.toFixed(1)),
    savedKm,
    savedMinutes,
    totalDrivingMinutes,
    googleMapsMultiStopUrl: buildGoogleMapsMultiStopUrl(bestRoute),
  };
}

/**
 * Generate Google Maps Multi-Stop directions link
 */
export function buildGoogleMapsMultiStopUrl(places: OptimizablePlace[]): string {
  if (!places || places.length === 0) return 'https://www.google.com/maps';
  if (places.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(places[0].name + ' Tri Tôn An Giang')}`;
  }

  const origin = `${places[0].latitude},${places[0].longitude}`;
  const destination = `${places[places.length - 1].latitude},${places[places.length - 1].longitude}`;

  if (places.length === 2) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  }

  const waypoints = places
    .slice(1, -1)
    .map((p) => `${p.latitude},${p.longitude}`)
    .join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
}
