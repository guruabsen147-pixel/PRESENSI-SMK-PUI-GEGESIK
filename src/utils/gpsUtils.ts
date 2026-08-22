/**
 * GPS & Geofencing Utilities for School Attendance
 */

// Calculate Haversine distance between two coordinates in meters
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // distance in meters
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} meter`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function isLocationWithinRadius(
  userLat: number,
  userLon: number,
  schoolLat: number,
  schoolLon: number,
  allowedRadiusMeters: number
): { isWithin: boolean; distanceMeters: number } {
  const distance = calculateDistance(userLat, userLon, schoolLat, schoolLon);
  return {
    isWithin: distance <= allowedRadiusMeters,
    distanceMeters: distance,
  };
}

export function getGoogleMapsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

export function getGoogleMapsEmbedUrl(lat: number, lon: number): string {
  return `https://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed`;
}

// Approximate Indonesian address or district based on coordinates
export function getApproximateAddress(lat: number, lon: number, schoolName?: string): string {
  return `Area Sekitar ${schoolName || 'Lokasi Terdeteksi'} (Lat: ${lat.toFixed(5)}, Lng: ${lon.toFixed(5)})`;
}
