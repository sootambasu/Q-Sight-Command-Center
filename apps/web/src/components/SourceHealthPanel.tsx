import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useRealtime } from '../hooks/useRealtime';

interface SourceHealthPanelProps {
  data: ReturnType<typeof useDashboardData>;
  realtime: ReturnType<typeof useRealtime>;
  simulatedRole: string;
}

export const SourceHealthPanel: React.FC<SourceHealthPanelProps> = ({ data, realtime, simulatedRole }) => {
  return (
    <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-bright)' }}>Data Sources</h2>
      
      {simulatedRole === 'auditor' ? (
        <div style={{ padding: '16px', border: '1px dashed var(--color-warning)', borderRadius: '4px', color: 'var(--color-warning)', fontSize: '12px' }}>
          Data sources view restricted in Auditor mode.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Flight Data Source */}
          <div style={{ border: '1px solid var(--border-muted)', borderRadius: '6px', padding: '12px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-bright)' }}>Flight Data</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: realtime.connectionStatus === 'connected' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: realtime.connectionStatus === 'connected' ? 'var(--color-safe)' : 'var(--color-critical)' }}>
                {realtime.connectionStatus === 'connected' ? 'CONNECTED' : 'OFFLINE'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Provider: OpenSky Network</span>
              <span>Rate: 10s</span>
            </div>
          </div>

          {/* Orbital Source */}
          <div style={{ border: '1px solid var(--border-muted)', borderRadius: '6px', padding: '12px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-bright)' }}>Orbital Tracking</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-safe)' }}>
                CONNECTED
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Provider: SpaceTrack SGP4</span>
              <span>Rate: Static</span>
            </div>
          </div>

          {/* Seismic Source */}
          <div style={{ border: '1px solid var(--border-muted)', borderRadius: '6px', padding: '12px', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-bright)' }}>Seismic Sensors</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--color-warning)' }}>
                DEGRADED
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Provider: USGS</span>
              <span>Rate: 60s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
