import React from 'react';
import { IconGlobe, IconLayers, IconBell, IconActivity, IconChecklist } from './icons';

export type RailTab = 'globe' | 'sources' | 'alerts' | 'audit' | 'timeline' | 'checklist';

interface MissionRailProps {
  activeTab: RailTab;
  setActiveTab: (tab: RailTab) => void;
  simulatedRole: string;
}

export const MissionRail: React.FC<MissionRailProps> = ({ 
  activeTab, 
  setActiveTab,
  simulatedRole
}) => {
  const tabs = [
    { id: 'globe', label: 'Globe', icon: <IconGlobe width={20} height={20} />, disabled: simulatedRole === 'auditor' },
    { id: 'sources', label: 'Sources & Layers', icon: <IconLayers width={20} height={20} />, disabled: simulatedRole === 'auditor' },
    { id: 'alerts', label: 'Alert Inbox', icon: <IconBell width={20} height={20} />, disabled: simulatedRole === 'auditor' },
    { id: 'timeline', label: 'Timeline', icon: <IconActivity width={20} height={20} />, disabled: false },
    { id: 'audit', label: 'Compliance Audit', icon: <IconChecklist width={20} height={20} />, disabled: simulatedRole === 'operator' || simulatedRole === 'supervisor' },
  ];

  return (
    <nav 
      className="cc-mission-rail"
      style={{
        gridRow: 3,
        gridColumn: 1,
        backgroundColor: 'var(--bg-dark)',
        borderRight: '1px solid var(--border-muted)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0',
        gap: '8px',
        zIndex: 5
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => setActiveTab(tab.id as RailTab)}
            style={{
              background: 'transparent',
              border: 'none',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              color: isActive ? 'var(--color-asset)' : tab.disabled ? 'var(--border-muted)' : 'var(--text-muted)',
              borderRadius: '8px',
              backgroundColor: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
              position: 'relative',
              transition: 'all 0.2s'
            }}
            title={tab.disabled ? `${tab.label} (Restricted by Role)` : tab.label}
          >
            {isActive && (
              <div 
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  bottom: '8px',
                  width: '3px',
                  backgroundColor: 'var(--color-asset)',
                  borderRadius: '0 4px 4px 0'
                }}
              />
            )}
            {tab.icon}
          </button>
        );
      })}
    </nav>
  );
};
