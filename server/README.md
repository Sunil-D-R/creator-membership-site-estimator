# Deployment API Server

This is a simple Express.js API server that handles Cloudflare Pages deployments using Wrangler CLI.

## Purpose

The React frontend cannot directly use Node.js modules like `fs` and `child_process`, so this backend server acts as a bridge between the frontend and Wrangler CLI.

## Endpoints

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/account-info
Returns Cloudflare account information from Wrangler.

**Response:**
```json
{
  "isAuthenticated": true,
  "email": "user@example.com",
  "accountId": "abc123..."
}
```

### POST /api/deploy
Deploys a site to Cloudflare Pages.

**Request Body:**
```json
{
  "projectName": "my-project",
  "files": {
    "index.html": "<html>...</html>",
    "styles.css": "body { ... }",
    "_headers": "/*\n  X-Frame-Options: DENY"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "url": "https://my-project.pages.dev",
  "projectName": "my-project"
}
```

**Response (Error):**
```json
{
  "message": "Deployment failed: ..."
}
```

## How It Works

1. Receives deployment request from frontend
2. Creates a temporary directory
3. Writes all files to the temporary directory
4. Runs `npx wrangler pages deploy <dir> --project-name=<name>`
5. Extracts the deployment URL from Wrangler's output
6. Cleans up the temporary directory
7. Returns the deployment URL to the frontend

## Running the Server

```bash
npm run api
```

The server will start on port 3001.

## Requirements

- Node.js 18+
- Wrangler CLI (installed via npx)
- Authenticated with Cloudflare (run `npx wrangler login`)

## Environment

- **Port**: 3001
- **CORS**: Enabled for all origins (development only)
- **Body Limit**: 10MB (for file uploads)

## Error Handling

The server handles various error scenarios:

- **Not logged in**: Returns error message prompting user to run `npx wrangler login`
- **Wrangler not found**: Returns error message about missing Wrangler CLI
- **Deployment failure**: Returns specific error message from Wrangler
- **File system errors**: Cleans up temporary directories even on failure

## Security Notes

- This is a development server and should not be exposed to the internet
- CORS is wide open for development convenience
- No authentication or rate limiting is implemented
- Temporary directories are cleaned up after each deployment

