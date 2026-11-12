<<<<<<< HEAD
# cinebook-backend
=======
# CineBook Backend

Azure Functions v4 / Node.js 22 starter using Cosmos DB, Blob Storage, Key Vault and Service Bus SDKs with Managed Identity.

## Local setup
1. Install Node.js 22, Azure Functions Core Tools v4 and Azurite.
2. `npm install`
3. Copy `local.settings.example.json` to `local.settings.json` and set values.
4. For local Azure resources, sign in with `az login`; your identity needs the relevant data-plane roles.
5. `npm start`

## Cosmos DB data model
Create database `cinebook`, container `appdata`, partition key `/id` for this starter. Create documents:
- Movie: `{ "id":"movie-001", "type":"movie", "title":"Example", "posterUrl":"https://...", "genre":"Drama", "language":"Tamil", "isActive":true }`
- Show: `{ "id":"show-001", "type":"show", "movieId":"movie-001", "theatreName":"Demo Cinemas", "date":"2026-12-01", "time":"18:30" }`

## Required configuration
Set Function App application settings from the example file. `SERVICE_BUS_CONNECTION` is required by the trigger extension; use a Service Bus namespace connection string in app settings (or configure an identity-based trigger connection following the current Functions Service Bus extension docs). For SDK publishing, grant the Function App managed identity **Azure Service Bus Data Sender**. For consuming, grant **Azure Service Bus Data Receiver**.

Assign managed identity roles:
- Cosmos DB: **Cosmos DB Built-in Data Contributor** on the account/database.
- Storage: **Storage Blob Data Contributor** on the storage account/container.
- Key Vault: **Key Vault Secrets User**.
- Service Bus: Sender and Receiver roles as above.

## Important production hardening
This is a deployable learning starter, not a certified production ticketing/payment platform. Before public launch:
- Implement atomic seat inventory/reservation (Cosmos transactional batch with all booking/seat docs in the same logical partition, or Azure SQL transactions/unique constraints). The sample conflict query alone is not race-safe under simultaneous booking.
- Add idempotency keys and a transactional outbox/retry mechanism so a saved booking cannot lose its event.
- Add payment provider integration and only confirm tickets after verified payment webhooks.
- Enforce role/claim authorization for admin APIs; add validation, rate limits, abuse protection and audit logging.
- Configure APIM JWT validation with the exact External ID issuer/audience and restrict Function App inbound access to APIM/private networking.
- Do not expose Function keys, connection strings or secrets in frontend code.
- Add tests, alerting, backup/restore, deployment slots and CI/CD.

## API routes
- `GET /api/movies`
- `GET /api/movies/{id}`
- `GET /api/shows?movieId=...`
- `GET /api/shows/{showId}/seats`
- `POST /api/bookings` (Bearer token required)
- `GET /api/bookings` (Bearer token required)
- `POST /api/admin/movies` (Bearer token required; add admin-role enforcement before production)
>>>>>>> 9a91c7f (new)
