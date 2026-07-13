import * as Cesium from 'cesium';

/**
 * Validates whether latitude and longitude are valid finite numbers within WGS84 ranges.
 */
export function isValidCoordinate(latitude: any, longitude: any): boolean {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }
  if (latitude < -90 || latitude > 90) {
    return false;
  }
  if (longitude < -180 || longitude > 180) {
    return false;
  }
  return true;
}

/**
 * Converts valid latitude and longitude to a Cesium.Cartesian3 point.
 * Returns null if the coordinates are invalid.
 */
export function toCartesianPoint(latitude: number, longitude: number, height?: number): Cesium.Cartesian3 | null {
  if (!isValidCoordinate(latitude, longitude)) {
    return null;
  }
  return Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
}

/**
 * Checks if a polygon coordinate array is valid.
 * Expects an array of [longitude, latitude] coordinate pairs.
 * Minimum points required for a polygon is 3.
 */
export function hasValidPolygon(points: any[] | null | undefined): boolean {
  if (!Array.isArray(points) || points.length < 3) {
    return false;
  }
  for (const pt of points) {
    if (!Array.isArray(pt) || pt.length < 2) {
      return false;
    }
    const lon = pt[0];
    const lat = pt[1];
    if (!isValidCoordinate(lat, lon)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if a polyline coordinate array is valid.
 * Expects an array of [longitude, latitude] coordinate pairs.
 * Minimum points required for a polyline is 2.
 */
export function hasValidPolyline(points: any[] | null | undefined): boolean {
  if (!Array.isArray(points) || points.length < 2) {
    return false;
  }
  for (const pt of points) {
    if (!Array.isArray(pt) || pt.length < 2) {
      return false;
    }
    const lon = pt[0];
    const lat = pt[1];
    if (!isValidCoordinate(lat, lon)) {
      return false;
    }
  }
  return true;
}

/**
 * Converts points to a flat array of Cartesian3 coordinates for a polyline.
 * Returns null if invalid or has fewer than 2 valid points.
 */
export function toPolylinePositions(points: any[] | null | undefined): Cesium.Cartesian3[] | null {
  if (!hasValidPolyline(points)) {
    return null;
  }
  const cartesians: Cesium.Cartesian3[] = [];
  for (const pt of points!) {
    const lon = pt[0];
    const lat = pt[1];
    const height = pt[2]; // optional height
    const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, height);
    if (cartesian) {
      cartesians.push(cartesian);
    }
  }
  if (cartesians.length < 2) {
    return null;
  }
  return cartesians;
}

/**
 * Converts points to a Cesium.PolygonHierarchy.
 * Returns null if invalid or has fewer than 3 valid points.
 */
export function toPolygonHierarchy(points: any[] | null | undefined): Cesium.PolygonHierarchy | null {
  if (!hasValidPolygon(points)) {
    return null;
  }
  const cartesians: Cesium.Cartesian3[] = [];
  for (const pt of points!) {
    const lon = pt[0];
    const lat = pt[1];
    const height = pt[2]; // optional height
    const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, height);
    if (cartesian) {
      cartesians.push(cartesian);
    }
  }
  if (cartesians.length < 3) {
    return null;
  }
  return new Cesium.PolygonHierarchy(cartesians);
}
