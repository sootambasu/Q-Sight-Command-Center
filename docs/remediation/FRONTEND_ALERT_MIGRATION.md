# Frontend Alert Migration

## Status
The frontend previously used local storage (`localStorage`) to hold alerts emitted via WebSockets.

## Migration
The API surface has been implemented in `api.ts` to allow the frontend to fetch from `/api/alerts` and POST to `/api/alerts/:id/acknowledge`.

The UI components (App.tsx, AlertInbox) will need to be updated to use these API calls instead of managing their own local state buffer.
