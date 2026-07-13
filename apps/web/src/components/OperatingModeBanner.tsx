import React from 'react';

interface OperatingModeBannerProps {
  demoModeActive: boolean;
  simulatedRole: string;
  realtimeConnectionStatus: string;
  realtimeEnabled: boolean;
  sources: Record<string, string>;
}

export const OperatingModeBanner: React.FC<OperatingModeBannerProps> = ({
  demoModeActive,
  simulatedRole,
  realtimeConnectionStatus,
  realtimeEnabled,
  sources
}) => {
  const isSourceDegraded = Object.values(sources).some(
    (s) => s.includes('mock') || s.includes('fallback') || s.includes('disabled')
  );

  let bgColor = 'var(--color-safe)';
  let message = 'LIVE DATABASE MODE';

  if (demoModeActive) {
    bgColor = 'var(--color-seismic)';
    message = 'DEMO MODE - SIMULATED DATA';
  } else if (simulatedRole === 'auditor') {
    bgColor = 'var(--text-disabled)';
    message = 'AUDITOR COMPLIANCE MODE - OPERATIONAL DATA REDACTED';
  } else if (realtimeConnectionStatus !== 'connected' && realtimeEnabled) {
    bgColor = 'var(--color-warning)';
    message = 'POLLING FALLBACK - WEBSOCKET OFFLINE';
  } else if (isSourceDegraded) {
    bgColor = 'var(--color-warning)';
    message = 'LIVE SOURCE DEGRADED - USING FALLBACK';
  }

  return (
    <div 
      className="global-mode-banner" 
      style={{
        backgroundColor: bgColor,
        color: '#fff', 
        textAlign: 'center', 
        padding: '4px', 
        fontSize: '11px', 
        fontWeight: 'bold', 
        fontFamily: 'var(--font-mono)', 
        letterSpacing: '1px',
        gridRow: '1',
        gridColumn: '1 / -1',
        zIndex: 1001
      }}
    >
      {message}
    </div>
  );
};
