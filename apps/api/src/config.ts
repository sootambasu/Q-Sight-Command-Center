import * as path from 'path';
import * as dotenv from 'dotenv';

// Attempt to load environment variables from the workspace root or the current folder
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface AppConfig {
  port: number;
  nodeEnv: string;
  databaseUrl?: string;
  auditLoggingEnabled: boolean;
  liveIngestionEnabled: boolean;
  aircraftLiveEnabled: boolean;
  satelliteLiveEnabled: boolean;
  seismicLiveEnabled: boolean;
}

export const config: AppConfig = {
  port: parseInt(process.env.API_PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  auditLoggingEnabled: process.env.AUDIT_LOGGING_ENABLED !== 'false',
  liveIngestionEnabled: process.env.LIVE_INGESTION_ENABLED === 'true',
  aircraftLiveEnabled: process.env.AIRCRAFT_LIVE_ENABLED === 'true',
  satelliteLiveEnabled: process.env.SATELLITE_LIVE_ENABLED === 'true',
  seismicLiveEnabled: process.env.SEISMIC_LIVE_ENABLED === 'true',
};

