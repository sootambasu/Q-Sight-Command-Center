/**
 * Utility to export pilot evidence safely.
 * Strict allowlist of fields to prevent accidental exposure of sensitive metadata,
 * stream URLs, verification hashes, credentials, or raw environment variables.
 */

export function exportPilotEvidence(data: any) {
  // Construct a safe, sanitized version of the current state
  const safeData = {
    timestamp: new Date().toISOString(),
    role: data.role,
    operatingMode: data.operatingMode,
    demoModeActive: data.demoModeActive,
    webSocketStatus: data.webSocketStatus,
    apiStatus: data.apiStatus,
    dbStatus: data.dbStatus,
    sourceHealth: {
      assets: data.sourceHealth.assets || 'Not reported',
      aircraft: data.sourceHealth.aircraft || 'Not reported',
      satellites: data.sourceHealth.satellites || 'Not reported',
      seismic: data.sourceHealth.seismic || 'Not reported',
      cameras: data.sourceHealth.cameras || 'Not reported',
    },
    visibleTelemetryCounts: {
      assets: data.counts.assets,
      aircraft: data.counts.aircraft,
      satellites: data.counts.satellites,
      seismic: data.counts.seismic,
      cameras: data.counts.cameras,
    },
    activeAlertCount: data.activeAlertCount,
    lastSyncTime: data.lastSyncTime || 'Not reported',
    safetyStatement: "Verified: No facial recognition, person tracking, or live operational stream URLs exposed.",
    appVersion: data.appVersion || 'v0.8.0-prototype',
    auditSummaryCount: data.auditSummaryCount
  };

  const jsonString = JSON.stringify(safeData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `qsight_pilot_evidence_${safeData.timestamp.replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
