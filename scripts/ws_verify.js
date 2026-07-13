/**
 * V0.6 WebSocket verification script
 * Tests the /ws/realtime endpoint, subscription flow, and RBAC channel enforcement.
 */

const { WebSocket } = require('ws');

const WS_URL = 'ws://localhost:4000/ws/realtime';
const RESULTS = { passed: [], failed: [], total: 0 };

function pass(name) {
  RESULTS.passed.push(name);
  RESULTS.total++;
  console.log(`  ✅ PASS: ${name}`);
}

function fail(name, reason) {
  RESULTS.failed.push({ name, reason });
  RESULTS.total++;
  console.error(`  ❌ FAIL: ${name} — ${reason}`);
}

function testWebSocket(role, channelsToRequest, expectDenied) {
  return new Promise((resolve) => {
    const url = `${WS_URL}?role=${encodeURIComponent(role)}&user_id=test_${role}`;
    const ws = new WebSocket(url);
    const received = [];
    let connectionAcked = false;
    let subscribeAcked = false;
    let subscribeSent = false;

    const timer = setTimeout(() => {
      ws.close();
      if (!connectionAcked) fail(`[${role}] Connection received system.websocket.connected`, 'Timeout');
      resolve();
    }, 5000);

    ws.on('open', () => {
      // Send subscribe request
      ws.send(JSON.stringify({ type: 'subscribe', channels: channelsToRequest }));
      subscribeSent = true;
    });

    ws.on('message', (data) => {
      let msg;
      try { msg = JSON.parse(data.toString()); } catch { return; }

      received.push(msg.type);

      if (msg.type === 'system.websocket.connected') {
        connectionAcked = true;
        pass(`[${role}] Connected — system.websocket.connected received`);
        
        if (msg.payload.role === role) {
          pass(`[${role}] Role correctly set to '${role}' in connected payload`);
        } else {
          fail(`[${role}] Role in payload`, `Expected '${role}', got '${msg.payload.role}'`);
        }

        // Check auditor has no allowed_channels
        if (role === 'auditor') {
          const allowed = msg.payload.allowed_channels || [];
          if (allowed.length === 0) {
            pass(`[${role}] Auditor has no allowed channels (correct RBAC enforcement)`);
          } else {
            fail(`[${role}] Auditor allowed channels`, `Expected empty, got [${allowed.join(',')}]`);
          }
        }
      }

      if (msg.type === 'subscribe.ack') {
        subscribeAcked = true;
        const denied = msg.payload.denied || [];
        
        if (expectDenied) {
          if (denied.length > 0) {
            pass(`[${role}] Subscription denied channels as expected: [${denied.map(d => d.channel || d).join(',')}]`);
          } else {
            fail(`[${role}] Expected channel denial`, 'No channels were denied');
          }
        } else {
          const granted = msg.payload.granted || [];
          if (granted.length > 0) {
            pass(`[${role}] Subscription granted channels: [${granted.join(',')}]`);
          }
        }

        clearTimeout(timer);
        ws.close();
        resolve();
      }

      if (msg.type === 'system.websocket.error' && received.length <= 3) {
        // Only warn early errors
        console.warn(`  ℹ️  WS error received for [${role}]: ${msg.payload.message}`);
      }
    });

    ws.on('error', (err) => {
      fail(`[${role}] WebSocket connection`, err.message);
      clearTimeout(timer);
      resolve();
    });

    ws.on('close', () => {
      if (!subscribeAcked && !connectionAcked) {
        fail(`[${role}] Connection`, 'Never received connected or ack message');
      }
    });
  });
}

async function runTests() {
  console.log('\n=== Q-Sight V0.6 WebSocket Verification ===\n');
  
  // Test 1: Operator can connect and subscribe to telemetry channels
  console.log('Test 1: Operator connection and subscription...');
  await testWebSocket('operator', ['telemetry.aircraft', 'telemetry.satellite', 'telemetry.seismic', 'alerts.geofence'], false);

  // Small delay between connections
  await new Promise(r => setTimeout(r, 500));

  // Test 2: Auditor is blocked from operational channels
  console.log('\nTest 2: Auditor RBAC channel denial...');
  await testWebSocket('auditor', ['telemetry.aircraft', 'alerts.geofence'], true);

  await new Promise(r => setTimeout(r, 500));

  // Test 3: Admin can connect with all channels
  console.log('\nTest 3: Admin full access...');
  await testWebSocket('admin', ['telemetry.aircraft', 'telemetry.satellite', 'telemetry.seismic', 'alerts.geofence'], false);

  // Test 4: HTTP telemetry endpoints still work
  console.log('\nTest 4: REST API telemetry still functional...');
  try {
    const http = require('http');
    const getJson = (url, headers) => new Promise((resolve, reject) => {
      const req = http.get(url, { headers }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Request timeout')));
    });

    const health = await getJson('http://localhost:4000/health', {});
    if (health.body.status === 'ok' || health.body.status === 'healthy') {
      pass('[REST] /health endpoint returns ok status');
    } else {
      fail('[REST] /health endpoint', `Status: ${health.body.status}`);
    }

    const aircraft = await getJson('http://localhost:4000/api/telemetry/aircraft', { 'x-q-sight-role': 'operator' });
    if (aircraft.status === 200 && aircraft.body.items) {
      pass(`[REST] /api/telemetry/aircraft returns ${aircraft.body.items.length} records`);
    } else {
      fail('[REST] /api/telemetry/aircraft', `HTTP ${aircraft.status}`);
    }

    // Verify auditor cannot access telemetry via REST
    const auditorAircraft = await getJson('http://localhost:4000/api/telemetry/aircraft', { 'x-q-sight-role': 'auditor' });
    if (auditorAircraft.status === 403) {
      pass('[REST] Auditor correctly blocked from /api/telemetry/aircraft (403)');
    } else {
      fail('[REST] Auditor RBAC on aircraft', `Expected 403, got ${auditorAircraft.status}`);
    }
  } catch (err) {
    fail('[REST] HTTP endpoint test', err.message);
  }

  // Test 5: Verify no camera data in WS
  console.log('\nTest 5: Verify camera channels are absent from WS allowed channels...');
  await new Promise((resolve) => {
    const ws = new WebSocket(`${WS_URL}?role=admin&user_id=test_camera_check`);
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'system.websocket.connected') {
        const allowed = msg.payload.allowed_channels || [];
        const cameraChannelExists = allowed.some(ch => ch.toLowerCase().includes('camera'));
        if (!cameraChannelExists) {
          pass('[SAFETY] No camera channels in WebSocket allowed_channels (privacy guardrail)');
        } else {
          fail('[SAFETY] Camera channels in WS', `Found: ${allowed.filter(ch => ch.includes('camera')).join(',')}`);
        }
        ws.close();
        resolve();
      }
    });
    ws.on('error', (e) => { fail('[SAFETY] Camera check connection', e.message); resolve(); });
    setTimeout(() => { ws.close(); resolve(); }, 5000);
  });

  // Summary
  console.log('\n========================================');
  console.log(`RESULTS: ${RESULTS.passed.length} passed, ${RESULTS.failed.length} failed out of ${RESULTS.total} tests`);
  if (RESULTS.failed.length > 0) {
    console.log('\nFailed tests:');
    RESULTS.failed.forEach(f => console.error(`  ❌ ${f.name}: ${f.reason}`));
    process.exit(1);
  } else {
    console.log('\n🎉 All V0.6 WebSocket tests passed!');
  }
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
