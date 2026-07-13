import {
  IndustrialAsset,
  AircraftPosition,
  SatelliteOrbitPoint,
  SeismicEvent,
  SensorRegistryEntry,
  AuditLogEvent
} from '@q-sight/shared';





export interface ApiResponse<T> {
  source: 'database' | 'mock' | 'live';
  count: number;
  timestamp: string;
  items: T[];
  ingestion_status?: {
    enabled: boolean;
    write_to_db: boolean;
    interval_ms: number;
  };
}


export interface HealthResponse {
  status: string;
  timestamp: string;
  app: string;
}

export interface DbHealthResponse {
  status: string;
  database: 'connected' | 'disconnected';
  postgis?: string;
  reason?: string;
  error?: string;
}

export interface AuditSummaryItem {
  group_type: 'action' | 'target_type' | 'role';
  key: string;
  count: number;
}

const BASE_URL = ''; // Relative path utilizes Vite proxy in dev mode
const DEFAULT_TIMEOUT_MS = 8000;

// Helper to fetch with AbortController timeout protection and automatic role header injection
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  
  // Inject simulated role and user ID headers from localStorage
  const role = localStorage.getItem('q-sight-simulated-role') || 'operator';
  const userId = localStorage.getItem('q-sight-simulated-user-id') || `dev_${role}`;

  const headers = {
    'x-q-sight-role': role,
    'x-q-sight-user-id': userId,
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timer);
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetchWithTimeout(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('API Offline');
  return res.json();
}

export async function fetchDbHealth(): Promise<DbHealthResponse> {
  const res = await fetchWithTimeout(`${BASE_URL}/health/db`);
  if (!res.ok) {
    try {
      return await res.json();
    } catch {
      return { status: 'error', database: 'disconnected', reason: 'Failed to query database health' };
    }
  }
  return res.json();
}

export async function fetchAssets(): Promise<ApiResponse<IndustrialAsset>> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/assets`);
  if (!res.ok) throw new Error('Failed to fetch assets');
  return res.json();
}

export async function fetchAircrafts(): Promise<ApiResponse<AircraftPosition>> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/telemetry/aircraft`);
  if (!res.ok) throw new Error('Failed to fetch aircraft telemetry');
  return res.json();
}

export async function fetchSatellites(): Promise<ApiResponse<SatelliteOrbitPoint>> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/telemetry/satellites`);
  if (!res.ok) throw new Error('Failed to fetch satellite telemetry');
  return res.json();
}

export async function fetchSeismicEvents(): Promise<ApiResponse<SeismicEvent>> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/telemetry/seismic`);
  if (!res.ok) throw new Error('Failed to fetch seismic events');
  return res.json();
}

export async function fetchSensors(): Promise<ApiResponse<SensorRegistryEntry>> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/sensors/registry`);
  if (!res.ok) throw new Error('Failed to fetch sensor registry');
  return res.json();
}

export async function fetchAlerts(): Promise<ApiResponse<Alert>> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/alerts/${alertId}/acknowledge`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to acknowledge alert');
  return res.json();
}

export async function fetchAuditLogs(filters?: { limit?: number; action?: string; target_type?: string }): Promise<ApiResponse<AuditLogEvent>> {
  let url = `${BASE_URL}/api/audit/logs`;
  const params = new URLSearchParams();
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.action) params.append('action', filters.action);
  if (filters?.target_type) params.append('target_type', filters.target_type);
  
  const queryStr = params.toString();
  if (queryStr) {
    url += `?${queryStr}`;
  }

  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchAuditSummary(): Promise<ApiResponse<AuditSummaryItem>> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/audit/summary`);
  if (!res.ok) throw new Error('Failed to fetch audit summary');
  return res.json();
}

