# Foundation Protocol MVP - Implementation Notes

This document provides implementation details for the Foundation Protocol MVP built for the United Nations of the Earth project.

## Architecture Overview

The Foundation Protocol MVP is a full-stack Next.js application implementing:

1. **Cryptographic Identity System**: Users generate ECDSA keypairs locally using Web Crypto API
2. **Signed Message Protocol**: All messages are cryptographically signed and verified
3. **Relay-Based Network**: Centralized relay for MVP (designed to be replaceable with P2P)
4. **SQLite Database**: Simple append-only storage for messages and logs
5. **Admin System**: Token-based authentication for admin endpoints

## Key Implementation Details

### Cryptographic Operations

- **Key Generation**: ECDSA P-256 curve using Web Crypto API
- **Message Signing**: SHA-256 hash of canonical JSON payload, signed with ECDSA
- **Message ID**: SHA-256 hash of canonical payload (ensures immutability)
- **Signature Verification**: All messages verified on receipt

### Message Structure

Messages follow a canonical format:
```json
{
  "authorPublicKey": "hex string",
  "timestamp": 1234567890,
  "contentType": "text",
  "contentBody": "message content",
  "references": ["msg-id-1", "msg-id-2"],
  "tags": ["tag1", "tag2"]
}
```

The canonical payload is JSON.stringify'd with sorted arrays, then hashed and signed.

### Database Schema

**Messages Table:**
- `id` (TEXT PRIMARY KEY) - Message hash
- `authorPublicKey` (TEXT) - Author's public key
- `authorDisplayName` (TEXT) - Optional display name
- `timestamp` (INTEGER) - Unix timestamp in ms
- `contentType` (TEXT) - Currently "text"
- `contentBody` (TEXT) - Message content
- `references` (TEXT) - JSON array of message IDs
- `tags` (TEXT) - JSON array of tags
- `signature` (TEXT) - Cryptographic signature
- `relayReceivedAt` (INTEGER) - When relay received message
- `relaySourceIp` (TEXT) - Optional source IP

**Logs Table:**
- `id` (TEXT PRIMARY KEY) - Log entry ID
- `timestamp` (INTEGER) - Unix timestamp in ms
- `level` (TEXT) - "info" or "error"
- `source` (TEXT) - "api" or "worker"
- `message` (TEXT) - Log message
- `meta` (TEXT) - Optional JSON metadata

### API Endpoints

All endpoints return JSON with `{ status: "ok" | "error", ... }` format.

#### POST /api/messages
- Validates message structure
- Verifies signature
- Checks message ID matches computed hash
- Stores message append-only
- Returns `{ status: "ok", id: string }`

#### GET /api/messages
- Query params: `limit` (default 50, max 200), `before` (timestamp)
- Returns `{ status: "ok", messages: StoredMessage[] }`
- Ordered by timestamp DESC

#### GET /api/messages/:id
- Returns single message or 404

#### GET /api/messages/:id/replies
- Returns all messages where `references` contains `:id`

#### GET /api/admin/logs
- Requires `X-Admin-Token` header
- Query params: `level`, `source`, `limit`, `before`
- Returns `{ status: "ok", logs: LogEntry[] }`

#### POST /api/ai/summarize-feed
- Accepts `{ messages: Message[], maxWords?: number }`
- Uses mock provider if `AI_API_KEY` not set
- Returns `{ status: "ok", summary: string }`

### Frontend Pages

#### /identity
- Create new identity (generates keypair)
- View/edit display name
- View public key and creation timestamp
- Redirects to /feed after creation

#### /feed
- Global message feed (reverse chronological)
- Message composer at top
- "Summarize Feed" button (AI)
- Refresh button
- Redirects to /identity if no identity exists

#### /message/:id
- Shows root message
- Shows all replies
- Reply composer
- Back to feed button

#### /admin/logs
- Admin token authentication
- Filter by level and source
- Table view of logs with metadata

### Security Considerations

1. **Private Keys**: Never sent to server, stored only in browser localStorage
2. **Message Verification**: All messages verified before storage
3. **Admin Auth**: Token-based, should be strong random string
4. **HTTPS**: Required in production
5. **Input Validation**: All API inputs validated
6. **SQL Injection**: Parameterized queries used throughout

### Development Setup

1. Install dependencies: `npm install`
2. Set environment variables (see `.env.example`)
3. Run seed script: `npm run db:seed` (optional)
4. Start dev server: `npm run dev`
5. Open http://localhost:3000

### Testing Checklist

Based on acceptance criteria:

- [x] Identity creation and persistence
- [x] Message posting with signature
- [x] Feed loading and display
- [x] Thread viewing and replies
- [x] AI summarization (mock)
- [x] Admin log access control
- [x] Error handling and display
- [x] Network failure handling

### Known Limitations (MVP)

1. **Relay is centralized**: Designed to be replaceable with P2P
2. **No message deletion**: Append-only by design
3. **Simple storage**: SQLite, not distributed
4. **No encryption**: Messages are public (by design)
5. **Single device**: Identity stored locally only
6. **No reputation system**: All identities equal

### Future Enhancements

As outlined in the spec:
- Real P2P networking
- Constitutional constraints
- Reputation layer
- Multi-device sync
- Richer content types

## Deployment

### Environment Variables Required

- `PORT` - Server port
- `ADMIN_TOKEN` - Strong random string for admin access
- `AI_API_KEY` - Optional, for real AI provider
- `NODE_ENV` - "production" for production

### Production Checklist

- [ ] Set strong `ADMIN_TOKEN`
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Configure `AI_API_KEY` if using real provider
- [ ] Set up database backups
- [ ] Configure logging/monitoring
- [ ] Set up rate limiting (future)

## License

Open source - see LICENSE file.

