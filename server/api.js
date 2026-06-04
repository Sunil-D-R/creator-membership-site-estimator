/**
 * Simple Express API server for Cloudflare Pages deployment
 * Uses Wrangler CLI to deploy sites
 */

import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const app = express();
const PORT = 3001;

app.use(express.json({ limit: '10mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * GET /api/account-info
 * Returns Cloudflare account information from Wrangler
 */
app.get('/api/account-info', async (req, res) => {
  try {
    const { stdout } = await execAsync('npx wrangler whoami');
    
    // Extract email
    const emailMatch = stdout.match(/associated with the email ([^\s]+)/);
    const email = emailMatch ? emailMatch[1] : '';
    
    // Extract account ID
    const accountIdMatch = stdout.match(/│\s+([a-f0-9]{32})\s+│/);
    const accountId = accountIdMatch ? accountIdMatch[1] : '';
    
    res.json({
      isAuthenticated: !!(email && accountId),
      email,
      accountId,
    });
  } catch (error) {
    res.json({
      isAuthenticated: false,
      email: '',
      accountId: '',
    });
  }
});

/**
 * POST /api/deploy
 * Deploys a site to Cloudflare Pages using Wrangler
 */
app.post('/api/deploy', async (req, res) => {
  const { projectName, files } = req.body;
  
  if (!projectName || !files) {
    return res.status(400).json({ message: 'Missing projectName or files' });
  }

  const tempDir = path.join(__dirname, `temp-deploy-${Date.now()}`);
  
  try {
    // Create temporary directory
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write all files to temporary directory
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(tempDir, filePath);
      await fs.writeFile(fullPath, content, 'utf-8');
    }
    
    console.log(`Deploying ${projectName} from ${tempDir}...`);
    
    // Deploy using Wrangler
    const deployCommand = `npx wrangler pages deploy ${tempDir} --project-name=${projectName}`;
    const { stdout, stderr } = await execAsync(deployCommand);
    
    console.log('Wrangler output:', stdout);
    if (stderr) console.error('Wrangler stderr:', stderr);
    
    // Extract URL from Wrangler output
    const urlMatch = stdout.match(/https:\/\/[^\s]+\.pages\.dev/);
    const deploymentUrl = urlMatch ? urlMatch[0] : `https://${projectName}.pages.dev`;
    
    // Clean up temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
    
    res.json({
      success: true,
      url: deploymentUrl,
      projectName,
    });
  } catch (error) {
    // Clean up on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
    
    console.error('Deployment error:', error);
    
    let message = 'Deployment failed';
    if (error.message) {
      message = error.message;
      
      if (message.includes('not logged in')) {
        message = 'Not logged in to Wrangler. Please run: npx wrangler login';
      } else if (message.includes('ENOENT')) {
        message = 'Wrangler CLI not found. Please install it.';
      }
    }
    
    res.status(500).json({ message });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Deployment API server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/account-info - Get Cloudflare account info`);
  console.log(`   POST /api/deploy - Deploy to Cloudflare Pages`);
});

