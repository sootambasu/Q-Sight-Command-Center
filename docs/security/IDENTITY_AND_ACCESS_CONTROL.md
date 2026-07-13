# Identity and Access Control

## Architecture
Q-Sight utilizes an API-Gateway or direct backend OIDC validation mechanism for robust identity anchoring. The `@q-sight/api` validates incoming JSON Web Tokens (JWTs) against configured JWKS endpoints or symmetric keys.

## Role-Based Access Control (RBAC)
User claims (e.g., groups or custom role claims) are mapped directly to system roles:
- **operator**: Standard telemetry visualization and alert acknowledgment.
- **supervisor**: Advanced analytics and sensitive asset access.
- **auditor**: Read-only access specifically limited to audit logs. Denied operational telemetry.
- **admin**: Full system control.

## WebSocket Authentication Flow
Due to limitations with passing HTTP headers in standard browser WebSocket APIs, Q-Sight implements a ticket-based authentication flow:
1. **Request Ticket**: Client invokes `POST /ws-ticket` (with Bearer Token).
2. **Issue Ticket**: Server generates a single-use UUID valid for 60 seconds, bound to the user's role and permissions.
3. **Connect**: Client opens connection to `/ws/realtime?ticket=<uuid>`.
4. **Validate & Consume**: Server validates the ticket, extracts identity, and immediately deletes the ticket to prevent replay attacks.

## Security Policies
- **Deny-by-Default**: Missing tokens, missing roles, or unrecognized roles result in immediate denial.
- **Single-Use Tickets**: Mitigates replay attacks.
- **Short-Lived Sessions**: Tickets expire after 60 seconds if unused.
