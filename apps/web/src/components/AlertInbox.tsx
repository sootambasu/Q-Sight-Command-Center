import React from 'react';
import { formatUTC } from '../utils/formatting';
import { LocalAlert } from '../hooks/useAlertInbox';

interface AlertInboxProps {
  alerts: LocalAlert[];
  clearAll: () => void;
  markViewed: (id: string) => void;
  onClose: () => void;
}

export const AlertInbox: React.FC<AlertInboxProps> = ({ alerts, clearAll, markViewed, onClose }) => {
  return (
    <div className="alerts-panel-overlay" style={{
      position: 'absolute',
      top: '60px',
      right: '340px',
      width: '320px',
      backgroundColor: 'var(--bg-panel)',
      border: '1px solid var(--border-muted)',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '60vh'
    }}>
      <div className="alerts-panel-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-muted)'
      }}>
        <span style={{ fontWeight: 'bold', color: 'var(--text-bright)' }}>🔔 Local Alert Inbox</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={clearAll}
            style={{
              background: 'transparent', border: '1px solid var(--border-muted)',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px',
              padding: '2px 6px', borderRadius: '3px'
            }}
          >
            Clear All
          </button>
          <button
            onClick={() => {
              const dataObj = { alerts };
              const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'alerts_export.json';
              link.click();
            }}
            style={{
              background: 'transparent', border: '1px solid var(--color-safe)',
              color: 'var(--color-safe)', cursor: 'pointer', fontSize: '10px',
              padding: '2px 6px', borderRadius: '3px'
            }}
          >
            Export JSON
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '14px', marginLeft: '4px'
            }}
          >✕</button>
        </div>
      </div>
      <div className="alerts-panel-body" style={{
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>
            No alerts in current session.
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`alert-card severity-${alert.severity} ${alert.viewed ? 'viewed' : 'new'}`}
              style={{
                opacity: alert.viewed ? 0.7 : 1,
                border: `1px solid ${
                  alert.severity === 'warning' ? 'var(--color-critical)' :
                  alert.severity === 'watch' ? 'var(--color-warning)' :
                  'var(--color-asset)'
                }`,
                background: alert.severity === 'warning' ? 'rgba(239, 68, 68, 0.1)' :
                            alert.severity === 'watch' ? 'rgba(234, 179, 8, 0.1)' :
                            'rgba(6, 182, 212, 0.1)',
                padding: '10px',
                borderRadius: '6px'
              }}
            >
              <div className="alert-card-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                marginBottom: '6px',
                fontFamily: 'var(--font-mono)'
              }}>
                <span className={`alert-severity-badge ${alert.severity}`} style={{
                  color: alert.severity === 'warning' ? 'var(--color-critical)' :
                         alert.severity === 'watch' ? 'var(--color-warning)' :
                         'var(--color-asset)',
                  fontWeight: 'bold'
                }}>
                  {alert.severity === 'warning' ? '⚠️' : alert.severity === 'watch' ? '👁' : 'ℹ️'} {alert.severity.toUpperCase()}
                </span>
                <span className="alert-source-type" style={{ color: 'var(--text-muted)' }}>{alert.sourceType?.toUpperCase()}</span>
                <span className="alert-time" style={{ color: 'var(--text-disabled)' }}>{formatUTC(alert.timestamp).split(' ')[1] || ''}</span>
              </div>
              <div className="alert-message" style={{ fontSize: '12px', color: 'var(--text-bright)', marginBottom: '8px', lineHeight: 1.4 }}>{alert.message}</div>
              <div className="alert-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>Asset: <strong style={{ color: 'var(--text-normal)' }}>{alert.assetName || 'N/A'}</strong> · ID: {alert.sourceId || 'N/A'}</span>
                {!alert.viewed && (
                  <button onClick={() => markViewed(alert.id)} style={{
                    background: 'transparent', border: '1px solid var(--border-muted)',
                    color: 'var(--text-muted)', fontSize: '9px', padding: '2px 6px',
                    cursor: 'pointer', borderRadius: '4px'
                  }}>Mark Viewed</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
