# Proxy Service

A minimal TypeScript proxy service for Vercel that forwards requests to OpenAI and Telegram APIs.

## Features

- Proxies requests to OpenAI API (`/api/openai/*` → `https://api.openai.com/*`)
- Proxies requests to Telegram API (`/api/telegram/*` → `https://api.telegram.org/*`)
- Internal authentication via `X-Internal-Token` header
- Proper error handling and logging
- TypeScript with full type safety

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Set the following environment variable in Vercel:

- `INTERNAL_PROXY_TOKEN`: A secret token used to authenticate requests to the proxy

#### Setting Environment Variables in Vercel

1. Go to your project settings in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `INTERNAL_PROXY_TOKEN`
   - **Value**: Your secret token (e.g., generate a random string)
   - **Environment**: Production, Preview, Development (as needed)
4. Click **Save**

### 3. Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### 4. Custom Domain

Configure `proxy.filmnet.dev` as a custom domain in your Vercel project settings.

## Usage

### OpenAI API Proxy

```bash
curl -X POST https://proxy.filmnet.dev/api/openai/v1/chat/completions \
  -H "X-Internal-Token: your-internal-token" \
  -H "Authorization: Bearer your-openai-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Telegram API Proxy

```bash
curl -X POST https://proxy.filmnet.dev/api/telegram/bot<token>/sendMessage \
  -H "X-Internal-Token: your-internal-token" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": 123456789,
    "text": "Hello from proxy!"
  }'
```

### Example: List OpenAI Models

```bash
curl https://proxy.filmnet.dev/api/openai/v1/models \
  -H "X-Internal-Token: your-internal-token" \
  -H "Authorization: Bearer your-openai-api-key"
```

### Example: Get Telegram Bot Info

```bash
curl https://proxy.filmnet.dev/api/telegram/bot<token>/getMe \
  -H "X-Internal-Token: your-internal-token"
```

## Authentication

All requests must include the `X-Internal-Token` header with the value set in your `INTERNAL_PROXY_TOKEN` environment variable. Requests without this header or with an invalid token will receive a `401 Unauthorized` response.

## Error Responses

The proxy returns standard HTTP status codes. In case of upstream errors, you'll receive a JSON response:

```json
{
  "ok": false,
  "error": "UPSTREAM_ERROR",
  "message": "Error message from upstream service"
}
```

## Security

- The proxy never stores or logs API keys (OpenAI, Telegram, etc.)
- Only the presence of the `Authorization` header is logged, not its value
- Only `/api/openai/*` and `/api/telegram/*` paths are supported; all other paths return `404`
- Internal authentication is required for all requests

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
.
├── app/
│   └── api/
│       ├── openai/
│       │   └── [...path]/
│       │       └── route.ts    # OpenAI proxy handler
│       ├── telegram/
│       │   └── [...path]/
│       │       └── route.ts    # Telegram proxy handler
│       └── route.ts             # Root API handler (404)
├── lib/
│   └── proxy-utils.ts          # Shared proxy utilities
├── package.json
├── tsconfig.json
└── README.md
```

