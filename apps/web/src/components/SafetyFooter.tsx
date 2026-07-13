import React from 'react';
import { IconShield } from './icons';

interface SafetyFooterProps {
  demoModeActive: boolean;
}

export const SafetyFooter: React.FC<SafetyFooterProps> = ({ demoModeActive }) => {
  return (
    <footer 
      className="cc-compliance-footer" 
      style={{
        gridRow: 5,
        gridColumn: '1 / -1',
        backgroundColor: '#0a0d14',
        borderTop: '1px solid var(--border-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '10px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <IconShield width={12} height={12} />
        Authorized industrial assets only
      </span>
      <span>•</span>
      <span>No facial recognition</span>
      <span>•</span>
      <span>No person tracking</span>
      <span>•</span>
      <span>No public CCTV scraping</span>
      <span>•</span>
      <span>Camera streams disabled in this phase</span>
      {demoModeActive && (
        <>
          <span>•</span>
          <span style={{ color: 'var(--color-seismic)' }}>Demo data is simulated (Not live operational data)</span>
        </>
      )}
    </footer>
  );
};
