import React from 'react';
import { formatCoordinate, formatAltitude, formatVelocity, formatUTC } from '../utils/formatting';

interface EntityDetailPanelProps {
  selectedObject: any | null;
  getSelectedTitle: () => string;
  setSelectedEntityInfo: (info: any) => void;
}

export const EntityDetailPanel: React.FC<EntityDetailPanelProps> = ({ selectedObject, getSelectedTitle, setSelectedEntityInfo }) => {
  if (!selectedObject) {
    return (
      <aside className="cc-details-panel">
        <div className="empty-panel-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <p style={{ fontWeight: '500', color: 'var(--text-bright)' }}>No Selection</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Select an entity on the 3D globe to view metadata details.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="cc-details-panel">
      <div>
        <div className="panel-header">
          <div>
            <span className="panel-subtitle">selected element</span>
            <h3 className="panel-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>
              {selectedObject.type.toUpperCase()}: {getSelectedTitle()}
            </h3>
          </div>
          <button
            onClick={() => setSelectedEntityInfo(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Industrial Asset details */}
        {selectedObject.type === 'asset' && (
          <div className="panel-content">
            <div className="detail-group">
              <div className="detail-label">Asset UUID</div>
              <div className="detail-value mono">{selectedObject.data.id}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Facility Name</div>
              <div className="detail-value">{selectedObject.data.name}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Type</div>
              <div className="detail-value" style={{ color: 'var(--color-asset)' }}>
                {selectedObject.data.type}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Coordinates</div>
              <div className="detail-value mono">
                Lat: {formatCoordinate(selectedObject.data.latitude)}<br />
                Lon: {formatCoordinate(selectedObject.data.longitude)}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Description</div>
              <div className="detail-value">{selectedObject.data.description || 'N/A'}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Boundary Geofence</div>
              <div className="detail-value" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {selectedObject.data.boundary ? 'Polygon boundary mapped' : 'No boundary geofence configuration.'}
              </div>
            </div>
          </div>
        )}

        {/* Aircraft details */}
        {selectedObject.type === 'aircraft' && (
          <div className="panel-content">
            <div className="detail-group">
              <div className="detail-label">ICAO24 Transponder</div>
              <div className="detail-value mono">{selectedObject.data.icao24}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Callsign</div>
              <div className="detail-value">{selectedObject.data.callsign || 'N/A'}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Origin Country</div>
              <div className="detail-value">{selectedObject.data.origin_country}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Barometric Altitude</div>
              <div className="detail-value">
                {formatAltitude(selectedObject.data.altitude_meters)}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Velocity</div>
              <div className="detail-value">
                {formatVelocity(selectedObject.data.velocity_mps)}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Heading</div>
              <div className="detail-value">
                {selectedObject.data.heading_degrees !== null && selectedObject.data.heading_degrees !== undefined
                  ? `${selectedObject.data.heading_degrees.toFixed(1)}°`
                  : 'Unavailable'}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Position Coordinates</div>
              <div className="detail-value mono">
                Lat: {formatCoordinate(selectedObject.data.latitude)}<br />
                Lon: {formatCoordinate(selectedObject.data.longitude)}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Last Transmission</div>
              <div className="detail-value">
                {typeof selectedObject.data.last_contact === 'number' 
                  ? formatUTC(selectedObject.data.last_contact * 1000)
                  : formatUTC(selectedObject.data.last_contact)}
              </div>
            </div>
          </div>
        )}

        {/* Satellite details */}
        {selectedObject.type === 'satellite' && (
          <div className="panel-content">
            <div className="detail-group">
              <div className="detail-label">NORAD Catalogue Number</div>
              <div className="detail-value mono">{selectedObject.data.norad_id}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Satellite Name</div>
              <div className="detail-value">{selectedObject.data.name}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">TLE Line 1</div>
              <div className="detail-value mono" style={{ fontSize: '10px' }}>
                {selectedObject.data.tle_line1}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">TLE Line 2</div>
              <div className="detail-value mono" style={{ fontSize: '10px' }}>
                {selectedObject.data.tle_line2}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Ground Footprint</div>
              <div className="detail-value" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {selectedObject.data.footprint ? 'Spatial signal polygon mapped' : 'No footprint polygon configured.'}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Last Orbit Ingestion</div>
              <div className="detail-value">
                {formatUTC(selectedObject.data.updated_at)}
              </div>
            </div>
          </div>
        )}

        {/* Seismic details */}
        {selectedObject.type === 'seismic' && (
          <div className="panel-content">
            <div className="detail-group">
              <div className="detail-label">USGS Event ID</div>
              <div className="detail-value mono">{selectedObject.data.usgs_id}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Epicenter Place</div>
              <div className="detail-value">{selectedObject.data.place}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Richter Magnitude</div>
              <div className="detail-value" style={{ color: 'var(--color-seismic)', fontWeight: 'bold', fontSize: '16px' }}>
                {selectedObject.data.magnitude.toFixed(1)} Mw
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Depth</div>
              <div className="detail-value">{selectedObject.data.depth_km.toFixed(1)} km</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Coordinates</div>
              <div className="detail-value mono">
                Lat: {formatCoordinate(selectedObject.data.latitude)}<br />
                Lon: {formatCoordinate(selectedObject.data.longitude)}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Event Time</div>
              <div className="detail-value">{formatUTC(selectedObject.data.event_time)}</div>
            </div>
          </div>
        )}

        {/* Camera details (Metadata-Only Shielded State) */}
        {selectedObject.type === 'camera' && (
          <div className="panel-content">
            <div className="detail-group">
              <div className="detail-label">Camera UUID</div>
              <div className="detail-value mono">{selectedObject.data.id}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Camera Description</div>
              <div className="detail-value">{selectedObject.data.name}</div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Owner Operator</div>
              <div className="detail-value">
                {selectedObject.data.protected ? (
                  <span style={{ color: 'var(--color-camera)', fontStyle: 'italic' }}>Restricted by Role</span>
                ) : (
                  selectedObject.data.owner_id || 'N/A'
                )}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Authorization Status</div>
              <div className="detail-value" style={{ color: selectedObject.data.authorization_status === 'verified' ? 'var(--color-safe)' : 'var(--color-camera)' }}>
                {selectedObject.data.authorization_status.toUpperCase()}
              </div>
            </div>
            <div className="detail-group">
              <div className="detail-label">Coordinates</div>
              <div className="detail-value mono">
                {selectedObject.data.protected ? (
                  <span style={{ color: 'var(--color-camera)', fontStyle: 'italic' }}>Hidden by Design</span>
                ) : (
                  <>
                    Lat: {formatCoordinate(selectedObject.data.latitude)}<br />
                    Lon: {formatCoordinate(selectedObject.data.longitude)}
                  </>
                )}
              </div>
            </div>

            {/* Privacy Boundary Warning Box */}
            <div className="camera-shield-state">
              <div className="camera-shield-title">Protected Stream / Hidden by Design</div>
              <div className="camera-shield-text">
                {selectedObject.data.protected 
                  ? 'Detailed coordinates and owner metadata are restricted for the Operator role. ' 
                  : ''}
                Live stream URLs and credential hashes are omitted from the client interface to protect operational endpoints and comply with privacy rules. No facial recognition or person tracking is permitted on this console.
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
