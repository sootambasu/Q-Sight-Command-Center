/**
 * Standard data formatting utilities for the Q-Sight Command Center dashboard.
 */

/**
 * Formats a coordinate float to a fixed decimal length.
 */
export function formatCoordinate(val: number | null | undefined, precision: number = 6): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return val.toFixed(precision);
}

/**
 * Formats speed in meters per second to kilometers per hour (km/h).
 */
export function formatVelocity(mps: number | null | undefined): string {
  if (mps === null || mps === undefined || isNaN(mps)) return 'Unavailable';
  const kmh = mps * 3.6;
  return `${kmh.toFixed(1)} km/h (${mps.toFixed(1)} m/s)`;
}

/**
 * Formats altitude in meters to a readable string with local separators.
 */
export function formatAltitude(meters: number | null | undefined): string {
  if (meters === null || meters === undefined || isNaN(meters)) return 'Ground / Offline';
  return `${Math.round(meters).toLocaleString()} m`;
}

/**
 * Formats a date string or timestamp into a compact, standardized UTC output: YYYY-MM-DD HH:mm:ss UTC.
 */
export function formatUTC(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return 'N/A';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const pad = (n: number) => String(n).padStart(2, '0');
    
    const year = d.getUTCFullYear();
    const month = pad(d.getUTCMonth() + 1);
    const day = pad(d.getUTCDate());
    const hours = pad(d.getUTCHours());
    const minutes = pad(d.getUTCMinutes());
    const seconds = pad(d.getUTCSeconds());
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
  } catch {
    return 'Error';
  }
}
