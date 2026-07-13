import React from 'react';
import { StatusBadge } from './StatusBadge';
import { IconBell, IconRole, IconChecklist, IconActivity } from './icons';

interface CommandBarProps {
  executiveView: boolean;
  setExecutiveView: (v: boolean) => void;
  showPilotChecklist: boolean;
  setShowPilotChecklist: (v: boolean) => void;
  demoModeActive: boolean;
  setDemoModeActive: (v: boolean) => void;
  resetScenario: () => void;
  apiOnline: boolean | null;
  dbConnected: boolean | null;
  simulatedRole: string;
  changeSimulatedRole: (role: string) => void;
  hasCesiumToken: boolean;
  envMode: string;
  realtimeConnectionStatus: string;
  realtimeEnabled: boolean;
  setRealtimeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  realtimeReconnectAttempt: number;
  manualReconnect: () => void;
  activeAlertsCount: number;
  setShowAlertsPanel: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  executiveView,
  setExecutiveView,
  showPilotChecklist,
  setShowPilotChecklist,
  demoModeActive,
  setDemoModeActive,
  resetScenario,
  apiOnline,
  dbConnected,
  simulatedRole,
  changeSimulatedRole,
  hasCesiumToken,
  envMode,
  realtimeConnectionStatus,
  realtimeEnabled,
  setRealtimeEnabled,
  realtimeReconnectAttempt,
  manualReconnect,
  activeAlertsCount,
  setShowAlertsPanel
}) => {
  return (
    <header 
      className="cc-header"
      style={{
        gridRow: 2,
        gridColumn: '1 / -1',
        backgroundColor: 'var(--bg-dark)',
        borderBottom: '1px solid var(--border-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 10
      }}
    >
      <div className="cc-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div 
          className="cc-logo-symbol"
          style={{
            fontWeight: 700,
            color: 'var(--color-asset)',
            letterSpacing: '2px',
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}
        >
          QS
        </div>
        <div 
          className="cc-logo-text"
          style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-bright)' }}
        >
          Q-SIGHT <span style={{ fontWeight: 300, color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>Command Center</span>
        </div>
      </div>

      <div className="cc-status-cluster" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Alerts Bell */}
        {activeAlertsCount > 0 && simulatedRole !== 'auditor' && (
          <button
            onClick={() => setShowAlertsPanel(v => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-seismic)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              animation: 'pulse-badge 2s infinite'
            }}
            title="View geofence alerts"
          >
            <IconBell width={14} height={14} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 'bold' }}>
              {activeAlertsCount} ALERT{activeAlertsCount !== 1 ? 'S' : ''}
            </span>
          </button>
        )}

        {/* Executive View */}
        <button
          onClick={() => setExecutiveView(!executiveView)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-muted)',
            color: executiveView ? 'var(--color-asset)' : 'var(--text-normal)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 'bold',
            borderColor: executiveView ? 'var(--color-asset)' : 'var(--border-muted)'
          }}
        >
          <IconActivity width={14} height={14} />
          {executiveView ? 'EXIT EXECUTIVE' : 'EXECUTIVE'}
        </button>

        {/* Checklist */}
        <button
          onClick={() => setShowPilotChecklist(!showPilotChecklist)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-muted)',
            color: 'var(--text-normal)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 'bold'
          }}
        >
          <IconChecklist width={14} height={14} />
          CHECKLIST
        </button>

        {/* Demo Mode Toggle */}
        <button
          onClick={() => {
            setDemoModeActive(!demoModeActive);
            if (!demoModeActive) {
              resetScenario();
            }
          }}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-muted)',
            color: demoModeActive ? 'var(--color-seismic)' : 'var(--text-normal)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 'bold',
            borderColor: demoModeActive ? 'var(--color-seismic)' : 'var(--border-muted)'
          }}
        >
          DEMO MODE: {demoModeActive ? 'ACTIVE' : 'OFF'}
        </button>

        <StatusBadge 
          label={`API: ${apiOnline === true ? 'CONNECTED' : apiOnline === false ? 'OFFLINE' : 'CHECKING...'}`}
          variant={apiOnline === true ? 'safe' : apiOnline === false ? 'danger' : 'muted'}
        />

        <StatusBadge 
          label={`DB: ${dbConnected === true ? 'CONNECTED' : 'DISCONNECTED'}`}
          variant={dbConnected === true ? 'safe' : 'danger'}
        />

        {/* RT Status */}
        {simulatedRole !== 'auditor' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <StatusBadge 
              label={`RT: ${
                realtimeConnectionStatus === 'connected' ? 'LIVE'
                : realtimeConnectionStatus === 'connecting' ? `CONN (${realtimeReconnectAttempt + 1})`
                : realtimeConnectionStatus === 'error' ? 'FAILED'
                : 'POLLING'
              }`}
              variant={realtimeConnectionStatus === 'connected' ? 'safe' : realtimeConnectionStatus === 'connecting' ? 'warning' : 'muted'}
            />
            {realtimeConnectionStatus !== 'connected' && realtimeConnectionStatus !== 'connecting' && (
              <button
                onClick={manualReconnect}
                title="Reconnect WebSocket"
                style={{
                  background: 'none', border: '1px solid var(--border-muted)', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '9px', padding: '1px 4px', borderRadius: '3px'
                }}
              >↺</button>
            )}
            <button
              onClick={() => setRealtimeEnabled(v => !v)}
              title={realtimeEnabled ? 'Disable real-time WebSocket' : 'Enable real-time WebSocket'}
              style={{
                background: 'none', border: 'none', color: realtimeEnabled ? 'var(--color-safe)' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '10px', marginLeft: '4px', fontFamily: 'var(--font-mono)'
              }}
            >
              {realtimeEnabled ? '⚡ ON' : '⏸ OFF'}
            </button>
          </div>
        )}

        <StatusBadge 
          label={`MAP: ${hasCesiumToken ? 'CESIUM ION' : 'OSM FALLBACK'}`}
          variant={hasCesiumToken ? 'safe' : 'muted'}
        />

        {/* Role Simulator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-muted)', padding: '2px 8px', borderRadius: '4px' }}>
          <IconRole width={12} height={12} color="var(--text-muted)" />
          <select
            value={simulatedRole}
            onChange={(e) => changeSimulatedRole(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-bright)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
            title="Role Context"
          >
            <option value="operator" style={{ background: 'var(--bg-dark)' }}>OPERATOR</option>
            <option value="supervisor" style={{ background: 'var(--bg-dark)' }}>SUPERVISOR</option>
            <option value="auditor" style={{ background: 'var(--bg-dark)' }}>AUDITOR</option>
            <option value="admin" style={{ background: 'var(--bg-dark)' }}>ADMIN</option>
          </select>
        </div>

        <StatusBadge 
          label={`MODE: ${envMode.toUpperCase()}`}
          variant="asset"
        />

      </div>
    </header>
  );
};
