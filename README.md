# Foundation Protocol MVP

A minimal, open-source "social internet" MVP where users create a self-owned cryptographic identity, post signed messages, and view a global feed over a relay-based network. This is the first working slice of the Foundation Protocol: universal messages + sovereign identity + pluggable network layer.

## Features

- **Self-Sovereign Identity**: Generate and manage cryptographic keypairs locally in your browser
- **Signed Messages**: All messages are cryptographically signed and immutable
- **Global Feed**: View messages from all users in reverse chronological order
- **Threading**: Reply to messages and view conversation threads
- **AI Summarization**: Optional AI-powered feed summarization (mock or real provider)
- **Admin Logs**: View system logs with admin authentication
- **No Accounts**: No email, no passwords, just cryptographic keys

## Tech Stack

- **Next.js 14** - Full-stack React framework
- **TypeScript** - Type-safe development
- **SQLite** - Simple database for messages and logs
- **Web Crypto API** - Cryptographic operations
- **React** - UI framework

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TheUnitedNationsofTheEarth
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
PORT=3000
NODE_ENV=development
ADMIN_TOKEN=your-secure-random-token-here
ENABLE_AI_SUMMARY=true
```

4. Seed the database (optional):
```bash
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating an Identity

1. Navigate to `/identity`
2. Click "Create Identity"
3. A cryptographic keypair will be generated and stored locally in your browser
4. You can edit your display name at any time

### Posting Messages

1. Navigate to `/feed`
2. Type your message in the composer
3. Optionally add tags (comma-separated)
4. Click "Post"

### Viewing Threads

1. Click "View thread" on any message
2. See the root message and all replies
3. Reply directly from the thread page

### AI Summarization

1. On the feed page, click "Summarize Feed (AI)"
2. The last 20 messages will be summarized
3. Works with mock provider (default) or real AI API (if configured)

### Admin Logs

1. Navigate to `/admin/logs`
2. Enter your admin token (set in `ADMIN_TOKEN` env var)
3. View system logs with filtering options

## API Endpoints

### `POST /api/messages`
Publish a new message.

**Request:**
```json
{
  "message": {
    "id": "string",
    "authorPublicKey": "string",
    "timestamp": 1234567890,
    "contentType": "text",
    "contentBody": "string",
    "references": [],
    "tags": [],
    "signature": "string"
  }
}
```

### `GET /api/messages`
List messages.

**Query Parameters:**
- `limit` (optional, default: 50, max: 200)
- `before` (optional, timestamp for pagination)

### `GET /api/messages/:id`
Get a specific message by ID.

### `GET /api/messages/:id/replies`
Get all replies to a message.

### `GET /api/admin/logs`
Get system logs (requires admin token).

**Headers:**
- `X-Admin-Token`: Admin authentication token

**Query Parameters:**
- `level` (optional: "info" | "error")
- `source` (optional: "api" | "worker")
- `limit` (optional, default: 100)
- `before` (optional, timestamp for pagination)

### `POST /api/ai/summarize-feed`
Summarize a list of messages.

**Request:**
```json
{
  "messages": [...],
  "maxWords": 100
}
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development | production)
- `ADMIN_TOKEN` - Admin authentication token (required)
- `AI_API_KEY` - Optional AI provider API key
- `AI_API_URL` - Optional AI provider URL (default: https://api.openai.com/v1)
- `ENABLE_AI_SUMMARY` - Enable/disable AI summarization (default: true)
- `DATABASE_PATH` - Path to SQLite database (default: ./data/foundation.db)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── identity/          # Identity page
│   ├── feed/              # Feed page
│   ├── message/[id]/      # Thread page
│   └── admin/logs/        # Admin logs page
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── crypto.ts          # Cryptographic functions
│   ├── db.ts              # Database layer
│   ├── identity.ts        # Identity management
│   ├── message.ts         # Message utilities
│   ├── ai-provider.ts     # AI summarization
│   └── logger.ts          # Logging utilities
├── types/                 # TypeScript type definitions
└── scripts/               # Utility scripts
```

## Security Notes

- Private keys are stored only in browser localStorage (never sent to server)
- All messages are cryptographically signed and verified
- Message IDs are computed from content (immutable)
- Admin endpoints require token authentication
- HTTPS should be used in production

## Development

### Running Tests

The project includes acceptance criteria defined in the spec. Manual testing should verify:

1. Identity creation and persistence
2. Message posting and verification
3. Feed loading and display
4. Thread viewing and replies
5. AI summarization (mock and real)
6. Admin log access control
7. Error handling

### Database

The SQLite database is created automatically on first run. To reset:

1. Delete `data/foundation.db`
2. Restart the server

## Next Steps

Future iterations may include:

- Real P2P networking to replace/complement relay
- Constitutional constraints
- Reputation layer (Bayesian legitimacy scores)
- Multi-device identity sync via encrypted backup
- Richer content types (JSON payloads, attachments)

## License

Open source - see LICENSE file for details.

## Contributing

Contributions welcome! Please read the spec document for full requirements and architecture details.
