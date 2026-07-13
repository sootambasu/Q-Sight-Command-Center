# Q-Sight Command Center — Executive Demo Script
**Duration**: 5 - 7 Minutes

---

## 1. Opening: Context & Architecture (0:00 - 1:30)
*   **Action**: Share the Operations Console interface on screen with **Demo Mode: OFF**.
*   **Speech**: "Today, we are reviewing the Q-Sight Command Center. This is an enterprise-grade spatial intelligence platform designed for industrial asset monitoring. As you can see, our architecture is monorepo-based, combining a Fastify API backend with a high-contrast CesiumJS 3D frontend. 
    Crucially, Q-Sight is built with safety and privacy at its core: we track non-camera telemetry such as aviation transponders, orbital paths, and seismic events. Camera data is restricted to authorized registry metadata; live camera feeds, person tracking, and facial recognition are disabled by design."

---

## 2. Operations View & Role Simulator (1:30 - 3:00)
*   **Action**: Switch role simulator to `supervisor`.
*   **Speech**: "Our RBAC system enforces data separation. When logged in as a Supervisor, we can see the physical boundary lines of our North Refinery complex rendered on the map. If we switch to an Operator role, these sensitive boundaries are redacted server-side, and an access event is logged to our audit system. If we select a Camera registry point, we see its coordinates and verification status, but the feed is restricted. There are no video players or public stream scraping hooks present."

---

## 3. Scenario A: Industrial Asset Monitoring (3:00 - 4:15)
*   **Action**: Enable **Demo Mode**. Select **Industrial Asset Monitoring** scenario, click **Play**.
*   **Speech**: "We will now enable Demo Mode to demonstrate how the console handles an aviation geofence entry. In this simulated scenario, we see a transponder-equipped aircraft crossing into the restricted airspace of our North Refinery. Within seconds, a geofence warning appears in our timeline and alert registry. The operator can click the alert to inspect aircraft altitude and velocity, confirming the flight path before the aircraft safely exits our perimeter, resolving the alert."

---

## 4. Scenario B: Seismic Proximity Alert (4:15 - 5:30)
*   **Action**: Select **Seismic Proximity Awareness** scenario, click **Play**.
*   **Speech**: "Next, we present a seismic warning scenario. Here, our USGS sensor adapter registers an earthquake. An orange magnitude card is logged on our map, and because it occurred within the proximity radius of our West Storage Field asset, a proximity alarm is triggered. The operator is alerted to initiate standard facility safety checks, proving how Q-Sight correlates multiple telemetry feeds to provide spatial awareness."

---

## 5. Scenario C: Compliance Review (5:30 - 7:00)
*   **Action**: Select **Compliance Review** scenario. Switch Role to `auditor` in header. Click **Audits** tab.
*   **Speech**: "Finally, we demonstrate compliance transparency. As an Auditor, the system completely disables the operational 3D map. Instead, the auditor reviews our audit viewer tab, which pulls data directly from our database. Here we inspect logs recording every sensitive query, role switch, and denied access attempt. Q-Sight provides complete audit logs to ensure compliance, finalizing our walkthrough."
