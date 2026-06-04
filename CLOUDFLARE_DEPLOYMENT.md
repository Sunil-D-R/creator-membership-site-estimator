# Cloudflare Pages Deployment Feature

## Overview

The Creator Membership Site Estimator now includes automatic deployment of report pages to Cloudflare Pages. After generating a report, you can deploy it as a beautiful one-page site with a single click.

## Features

- **One-Click Deployment**: Deploy your generated report to Cloudflare Pages instantly
- **Custom Subdomain**: Uses the creator name from the form as the subdomain (e.g., `jane-doe.pages.dev`)
- **Static Site Generation**: Converts your report into a fast, responsive static HTML site
- **Wrangler Integration**: Uses Cloudflare's official CLI for reliable deployments
- **No Manual Configuration**: Authentication handled via OAuth

## Setup Instructions

### 1. Authenticate with Cloudflare

Run the following command in your terminal to authenticate with Cloudflare:

```bash
npx wrangler login
```

This will:
1. Open your browser to Cloudflare's OAuth login page
2. Ask you to authorize Wrangler
3. Save your credentials securely

You only need to do this once. Wrangler will remember your authentication.

### 2. Start the Servers

The deployment feature requires both the frontend and backend servers to be running.

**Option A: Run both servers together (recommended)**
```bash
npm run dev:all
```

**Option B: Run servers separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend API):
```bash
npm run api
```

### 3. Deploy a Report

1. Make sure both servers are running (see step 2)
2. Generate a report with a creator name in the app
3. Scroll to the "Deploy to Cloudflare Pages" section
4. You should see your Cloudflare account info (email and account ID)
5. Review the subdomain that will be created (based on the creator name)
6. Click "🚀 Deploy Now"
7. Wait for the deployment to complete (usually 10-30 seconds)
8. Click the provided link to view your deployed site!

## How It Works

### Site Generation

When you click "Deploy Now", the app:

1. **Generates Static Files**:
   - `index.html`: The main report page with all sections
   - `styles.css`: Responsive styling for the report
   - `_headers`: Security headers for Cloudflare Pages

2. **Sanitizes the Project Name**:
   - Converts the creator name to a URL-safe format
   - Example: "Jane Doe" → "jane-doe"

3. **Deploys to Cloudflare**:
   - Uses the Cloudflare Pages API
   - Creates a new project (or updates existing one)
   - Returns the live URL

### URL Structure

Your deployed sites will be available at:
```
https://[creator-name].pages.dev
```

For example:
- Creator name: "Exotic Bloom" → `https://exotic-bloom.pages.dev`
- Creator name: "Jane Doe" → `https://jane-doe.pages.dev`

## Security & Privacy

- **API Credentials**: Stored only in your browser's local storage (never sent to our servers)
- **HTTPS**: All deployed sites use HTTPS by default
- **Security Headers**: Deployed sites include security headers to prevent clickjacking and XSS

## Troubleshooting

### "Not authenticated with Cloudflare"
- Run `npx wrangler login` in your terminal
- Complete the OAuth authentication in your browser
- Restart the API server (`npm run api`)

### "Cannot connect to API server"
- Make sure the API server is running on port 3001
- Check that you started it with `npm run api` or `npm run dev:all`
- Verify no other process is using port 3001

### "Deployment failed"
- **Check authentication**: Run `npx wrangler whoami` to verify you're logged in
- **Check project name**: Make sure the creator name is valid (letters, numbers, hyphens only)
- **Check logs**: Look at the API server terminal for detailed error messages

### "Invalid project name"
- Make sure you've entered a creator name in the form
- The name will be automatically sanitized to be URL-safe
- Project names must be 1-58 characters long

## Advanced Usage

### Custom Domains

After deploying to Cloudflare Pages, you can add a custom domain:

1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Go to "Custom domains"
4. Add your custom domain (e.g., `report.yourdomain.com`)

### Updating a Deployed Site

To update an existing deployed site:
1. Generate a new report with the same creator name
2. Click "Deploy Now" again
3. The existing site will be updated with the new content

## Technical Details

### Architecture

The deployment feature uses a client-server architecture:

1. **Frontend (React)**: Generates static site files and sends them to the backend API
2. **Backend (Express)**: Receives files, writes them to a temporary directory, and calls Wrangler CLI
3. **Wrangler CLI**: Handles authentication and deployment to Cloudflare Pages

### Files Generated

- **index.html**: Complete HTML page with embedded report data
- **styles.css**: Responsive CSS with gradient backgrounds and modern styling
- **_headers**: Cloudflare Pages headers for security

### API Endpoints

- **GET /api/health**: Health check endpoint
- **GET /api/account-info**: Returns Cloudflare account information from Wrangler
- **POST /api/deploy**: Deploys site files to Cloudflare Pages

### Deployment Flow

1. User clicks "Deploy Now" in the React app
2. Frontend generates static HTML/CSS files
3. Frontend sends files to `/api/deploy` endpoint
4. Backend writes files to temporary directory
5. Backend runs `npx wrangler pages deploy <dir> --project-name=<name>`
6. Wrangler uploads files to Cloudflare Pages
7. Backend extracts deployment URL from Wrangler output
8. Backend cleans up temporary directory
9. Frontend displays success message with live URL

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- No localStorage needed (authentication handled by Wrangler)

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your Cloudflare credentials are correct
3. Ensure you have a stable internet connection
4. Try regenerating the report and deploying again

## Future Enhancements

Planned features:
- [ ] Custom template selection
- [ ] Analytics integration
- [ ] Password protection for deployed sites
- [ ] Batch deployment of multiple reports
- [ ] Export deployment history

