# Phase 0 Remaining Enterprise Gaps

This document identifies remaining engineering and security gaps that prevent the current codebase from being classified as enterprise production-ready.

## 1. Registered Enterprise Gaps

### 1.1. Telemetry Pipeline Scalability
* **Gap:** Telemetry records (aircraft, satellites, earthquakes) are received via simple memory buffers and ingested directly into Fastify memory or basic DB operations.
* **Risk:** High-rate telemetry feeds will exhaust Node event loop execution time, leading to memory leaks and connection dropouts.
* **Remediation:** Introduce a messaging layer (e.g. Redis Streams, RabbitMQ) to decouple ingestion from persistence, and implement ingestion rate limiting.

---

### 1.2. Identity Provider Authentication
* **Gap:** Symmetric HS256 tokens verify against a local symmetric `JWT_SECRET`. Production-grade OIDC/JWKS integration with asymmetric verification remains unconfigured and untested.
* **Risk:** Vulnerable to symmetric key leakage or local secret compromise.
* **Remediation:** Integrate a JWKS (JSON Web Key Set) verifier for asymmetric token validation (e.g., Auth0, Keycloak, or Okta).

---

### 1.3. Database Clustering and Persistence High Availability
* **Gap:** The Postgres DB is deployed as a single, local, non-replicated instance.
* **Risk:** Single point of failure. Loss of Postgres container leads to service outage.
* **Remediation:** Configure database replication or migration to managed high-availability cloud database instances with automated failover.

---

### 1.4. Ingestor Health and Backpressure Controls
* **Gap:** Worker ingestors lack robust retry-backoff algorithms, circuit breakers, and alert triggers when external APIs (OpenSky, USGS) go down.
* **Risk:** API failures will cause ingestion processes to stall or crash silently.
* **Remediation:** Implement standard retry backoff patterns and circuit breakers on external service calls.
