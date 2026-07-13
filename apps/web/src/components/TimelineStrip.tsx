import React from 'react';
import { formatUTC } from '../utils/formatting';
import { WsRealtimeEvent } from '../hooks/useRealtime';
import { TimelineItem } from '../hooks/useDashboardData';

interface TimelineStripProps {
  demoModeActive: boolean;
  realtimeConnectionStatus: string;
  simulatedRole: string;
  timelineFilter: string;
  setTimelineFilter: (f: string) => void;
  skippedGeometryCount: number;
  realtimeEvents: WsRealtimeEvent[];
  activeTimelineEvents: TimelineItem[];
  getSourceDisplay: (source: string, isSat: boolean) => string;
}

export const TimelineStrip: React.FC<TimelineStripProps> = ({
  demoModeActive,
  realtimeConnectionStatus,
  simulatedRole,
  timelineFilter,
  setTimelineFilter,
  skippedGeometryCount,
  realtimeEvents,
  activeTimelineEvents,
  getSourceDisplay
}) => {
  return (
    <div 
      className="footer-panel"
      style={{
        gridRow: 4,
        gridColumn: 2,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-dark)',
        borderTop: '1px solid var(--border-muted)',
        overflow: 'hidden'
      }}
    >
      <div 
        className="footer-panel-title" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid var(--border-muted)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>
          {demoModeActive
            ? 'GUIDED SCENARIO EVENTS'
            : realtimeConnectionStatus === 'connected' && simulatedRole !== 'auditor'
            ? 'LIVE + POLLING TIMELINE'
            : 'OPERATIONAL TIMELINE FEED'}
        </span>
        <div className="timeline-filters" style={{ display: 'flex', gap: '4px' }}>
          {['All', 'Aircraft', 'Orbital', 'Seismic', 'Alerts', 'Audit'].map(f => (
            <button 
              key={f} 
              onClick={() => setTimelineFilter(f)}
              style={{
                background: timelineFilter === f ? 'var(--bg-active)' : 'transparent',
                border: '1px solid var(--border-muted)',
                color: timelineFilter === f ? 'var(--text-bright)' : 'var(--text-muted)',
                fontSize: '9px', 
                padding: '2px 8px', 
                cursor: 'pointer', 
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                borderColor: timelineFilter === f ? 'var(--border-focus)' : 'var(--border-muted)'
              }}
            >
              {f}
            </button>
          ))}
        </div>
        {skippedGeometryCount > 0 && (
          <span style={{ color: 'var(--color-warning)', fontWeight: 'bold', fontSize: '10px' }}>
            ! {skippedGeometryCount} SKIPPED
          </span>
        )}
        <span style={{ fontSize: '9px', color: 'var(--text-disabled)' }}>
          {demoModeActive ? 'DEMO FIXTURES' : 'REST + RT EVENTS'}
        </span>
      </div>

      <div 
        className="timeline-scroll-container"
        style={{
          display: 'flex',
          gap: '12px',
          padding: '12px 16px',
          overflowX: 'auto',
          flex: 1
        }}
      >
        {!demoModeActive && simulatedRole !== 'auditor' && realtimeEvents.slice(0, 5).map(ev => {
          const isAlert = ev.type.startsWith('alert.');
          const isSystem = ev.type.startsWith('system.');
          return (
            <div
              key={ev.id}
              className={`timeline-event-card rt-event-card ${
                isAlert ? 'rt-alert-card' : isSystem ? 'rt-system-card' : ''
              }`}
              style={{
                minWidth: '240px',
                maxWidth: '240px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-muted)',
                borderRadius: '6px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                borderLeft: `2px solid ${isAlert ? 'var(--color-seismic)' : isSystem ? 'var(--border-muted)' : 'var(--color-safe)'}`,
                background: isAlert ? 'rgba(249, 115, 22, 0.04)' : isSystem ? 'rgba(255, 255, 255, 0.02)' : 'rgba(34, 197, 94, 0.04)'
              }}
            >
              <div className="timeline-card-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                <span style={{
                  color: isAlert ? 'var(--color-seismic)' : isSystem ? 'var(--text-muted)' : 'var(--color-safe)',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {isAlert ? 'ALERT' : isSystem ? 'SYSTEM' : 'REALTIME'}
                </span>
                <span style={{ color: 'var(--text-disabled)' }}>
                  {formatUTC(ev.timestamp).split(' ')[1] || 'now'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-bright)', lineHeight: 1.4 }}>
                {isAlert
                  ? (ev.payload.message || ev.type)
                  : isSystem
                  ? (ev.payload.message || ev.type)
                  : `${ev.type.replace('telemetry.', '').replace('.delta', '')} update`}
              </div>
            </div>
          );
        })}

        {activeTimelineEvents.length === 0 && (!demoModeActive && realtimeEvents.length === 0) ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '11px' }}>
            No timeline records available for the current filter/state.
          </div>
        ) : (
          activeTimelineEvents
            .filter(ev => {
              if (timelineFilter === 'All') return true;
              if (timelineFilter === 'Aircraft') return ev.category === 'aircraft';
              if (timelineFilter === 'Orbital') return ev.category === 'satellite';
              if (timelineFilter === 'Seismic') return ev.category === 'seismic';
              if (timelineFilter === 'Alerts') return (ev.category as string) === 'alert';
              if (timelineFilter === 'Audit') return (ev.category as string) === 'system';
              return true;
            })
            .map(event => (
              <div 
                className="timeline-event-card" 
                key={event.id}
                style={{
                  minWidth: '240px',
                  maxWidth: '240px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '6px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ 
                    color: event.category === 'aircraft' ? 'var(--color-aircraft)' : 
                           event.category === 'satellite' ? 'var(--color-satellite)' : 
                           event.category === 'seismic' ? 'var(--color-seismic)' : 
                           event.category === 'camera' ? 'var(--color-camera)' : 'var(--color-asset)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {event.category}
                  </span>
                  <span style={{ color: 'var(--text-disabled)' }}>
                    {formatUTC(event.timestamp).split(' ')[1] || 'latest'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-bright)' }}>{event.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-normal)', lineHeight: 1.4, flex: 1 }}>{event.description}</div>
                <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {getSourceDisplay(event.source, event.category === 'satellite')}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
