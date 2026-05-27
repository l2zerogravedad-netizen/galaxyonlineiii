# Railway Auth Setup

## Status
Railway CLI v4.65.0 is installed and MCP is configured.

## What you need to do (ONE TIME ONLY)

### Option 1: Generate a Token (Fastest - 30 seconds)

1. Go to: https://railway.app/account/tokens
2. Click "New Token"
3. Name it: "go3-mcp-token"
4. Copy the token
5. Paste it below in .env file:

```bash
# .env file in project root
RAILWAY_TOKEN=your_token_here
```

### Option 2: Manual Login

If you have Railway CLI installed locally:
```bash
railway login
# Then copy the auth token from ~/.railway/config.json
```

## After adding the token

The agent will automatically pick it up. No restart needed.

## Verify

Once token is set, run:
```bash
npm run railway:whoami
```
