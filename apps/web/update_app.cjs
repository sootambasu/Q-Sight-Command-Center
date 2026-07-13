const fs = require('fs');
const path = require('path');
const p = path.resolve('d:/Q-Sight Command Center/apps/web/src/App.tsx');
let content = fs.readFileSync(p, 'utf-8');

const returnIndex = content.indexOf('return (\n    <div className={`cc-container');
if (returnIndex === -1) throw new Error('Return block not found');

const afterReturn = `return (
    <div className={\`cc-container \${executiveView ? 'executive-mode' : ''}\`}>
      <OperatingModeBanner 
        demoModeActive={demoScenario.demoModeActive}
        simulatedRole={data.simulatedRole}
        realtimeConnectionStatus={realtime.connectionStatus}
        realtimeEnabled={realtimeEnabled}
        sources={data.sources as Record<string, string>}
      />
      <CommandBar 
        executiveView={executiveView}
        setExecutiveView={setExecutiveView}
        showPilotChecklist={showPilotChecklist}
        setShowPilotChecklist={setShowPilotChecklist}
        demoModeActive={demoScenario.demoModeActive}
        setDemoModeActive={demoScenario.setDemoModeActive}
        resetScenario={demoScenario.resetScenario}
        apiOnline={data.apiOnline}
        dbConnected={data.dbConnected}
        simulatedRole={data.simulatedRole}
        changeSimulatedRole={data.changeSimulatedRole}
        hasCesiumToken={hasCesiumToken}
        envMode={envMode}
        realtimeConnectionStatus={realtime.connectionStatus}
        realtimeEnabled={realtimeEnabled}
        setRealtimeEnabled={setRealtimeEnabled}
        realtimeReconnectAttempt={realtime.reconnectAttempt}
        manualReconnect={realtime.manualReconnect}
        activeAlertsCount={activeAlerts.length}
        setShowAlertsPanel={setShowAlertsPanel}
      />
      <MissionRail 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        simulatedRole={data.simulatedRole}
      />
      <main className="cc-map-container" style={{ position: 'relative', gridRow: '3', gridColumn: '2' }}>
        {!hasCesiumToken && (
          <div className="map-notification-overlay">
            <span>ℹ️ Map Keyless: Fallback OpenStreetMap Tiles enabled</span>
          </div>
        )}
        {demoScenario.demoModeActive && (
          <div className="map-notification-overlay demo-mode-indicator" style={{ color: 'var(--color-seismic)', border: '1px solid var(--color-seismic)', background: 'rgba(249, 115, 22, 0.15)', top: '50px' }}>
            <span>⚠️ Demo Mode: Simulated non-camera telemetry (Not live operational data)</span>
          </div>
        )}
        <div ref={mapContainerRef} className="cesium-viewer-container" />
        {showAlertsPanel && data.simulatedRole !== 'auditor' && (
          <AlertInbox 
            alerts={alertInbox.alerts}
            clearAll={alertInbox.clearAll}
            markViewed={alertInbox.markViewed}
            onClose={() => setShowAlertsPanel(false)}
          />
        )}
        {executiveView && (
          <ExecutiveOverlay 
            assetCount={activeAssets.length}
            aircraftCount={activeAircrafts.length}
            satelliteCount={activeSatellites.length}
            seismicCount={activeSeismicEvents.length}
            cameraCount={data.cameras.length}
            alertCount={activeAlerts.length}
            onClose={() => setExecutiveView(false)}
          />
        )}
      </main>
      
      {activeTab === 'globe' && !executiveView && (
        <EntityDetailPanel 
          selectedObject={selectedObject}
          getSelectedTitle={getSelectedTitle}
          setSelectedEntityInfo={setSelectedEntityInfo}
        />
      )}
      
      {activeTab === 'sources' && !executiveView && (
        <aside className="cc-details-panel">
          <SourceHealthPanel 
            data={data}
            realtime={realtime}
            simulatedRole={data.simulatedRole}
          />
        </aside>
      )}

      {activeTab === 'alerts' && !executiveView && (
        <aside className="cc-details-panel">
          <AlertInbox 
            alerts={alertInbox.alerts}
            clearAll={alertInbox.clearAll}
            markViewed={alertInbox.markViewed}
            onClose={() => setActiveTab('globe')}
          />
        </aside>
      )}

      {activeTab === 'timeline' && !executiveView && (
        <aside className="cc-details-panel">
          <div style={{ padding: '16px' }}>Timeline events full view (WIP)</div>
        </aside>
      )}

      {!executiveView && (
        <TimelineStrip 
          demoModeActive={demoScenario.demoModeActive}
          realtimeConnectionStatus={realtime.connectionStatus}
          simulatedRole={data.simulatedRole}
          timelineFilter={timelineFilter}
          setTimelineFilter={setTimelineFilter}
          skippedGeometryCount={skippedGeometryCount}
          realtimeEvents={realtime.realtimeEvents}
          activeTimelineEvents={activeTimelineEvents}
          getSourceDisplay={getSourceDisplay}
        />
      )}

      <SafetyFooter 
        apiOnline={data.apiOnline}
        dbConnected={data.dbConnected}
        simulatedRole={data.simulatedRole}
        polling={polling}
        demoScenario={demoScenario}
        isRefreshing={data.isRefreshing}
        lastUpdated={data.lastUpdated}
        lastRefreshResult={data.lastRefreshResult}
        envMode={envMode}
      />
    </div>
  );
}
`;

const newContent = content.substring(0, returnIndex) + afterReturn;
fs.writeFileSync(p, newContent, 'utf-8');
console.log('App.tsx updated');
