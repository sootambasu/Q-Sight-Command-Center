import React from 'react';
import { MetricCard } from './MetricCard';

interface ExecutiveOverlayProps {
  assetCount: number;
  aircraftCount: number;
  satelliteCount: number;
  seismicCount: number;
  cameraCount: number;
  alertCount: number;
  onClose: () => void;
}

export const ExecutiveOverlay: React.FC<ExecutiveOverlayProps> = ({
  assetCount,
  aircraftCount,
  satelliteCount,
  seismicCount,
  cameraCount,
  alertCount,
  onClose
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(9, 9, 11, 0.95)',
      backdropFilter: 'blur(8px)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      padding: '48px',
      color: 'var(--text-bright)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.02em' }}>Executive Summary</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '16px' }}>Macro-level operational overview</p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-muted)',
            color: 'var(--text-bright)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Exit Executive View
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1200px'
      }}>
        <MetricCard
          label="Active Alerts"
          value={alertCount.toString()}
          subValue={alertCount > 0 ? "Requires Attention" : "Nominal"}
        />
        <MetricCard
          label="Monitored Assets"
          value={assetCount.toString()}
        />
        <MetricCard
          label="Tracked Aircraft"
          value={aircraftCount.toString()}
        />
        <MetricCard
          label="Orbital Satellites"
          value={satelliteCount.toString()}
        />
        <MetricCard
          label="Seismic Events"
          value={seismicCount.toString()}
        />
        <MetricCard
          label="Camera Feeds"
          value={cameraCount.toString()}
        />
      </div>
      
      <div style={{ marginTop: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
        Q-Sight Command Center • Executive View • Data updated in real-time
      </div>
    </div>
  );
};
