/**
 * Cloudflare Pages Deployment Service
 * Uses backend API that calls Wrangler CLI
 */

export interface DeploymentResult {
  success: boolean;
  url?: string;
  projectName?: string;
  error?: string;
}

export interface AccountInfo {
  email: string;
  accountId: string;
  isAuthenticated: boolean;
}

/**
 * Sanitize project name for URL safety
 */
export function sanitizeProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 58); // Cloudflare Pages limit
}

/**
 * Deploy a site to Cloudflare Pages via backend API
 * @param projectName - The name for the Cloudflare Pages project (from form)
 * @param files - Map of file paths to file contents
 */
export async function deployToCloudflarePages(
  projectName: string,
  files: Map<string, string>
): Promise<DeploymentResult> {
  try {
    // Sanitize project name for URL safety
    const sanitizedName = sanitizeProjectName(projectName);

    if (!sanitizedName) {
      throw new Error('Invalid project name');
    }

    // Convert Map to object for JSON serialization
    const filesObject: Record<string, string> = {};
    files.forEach((content, path) => {
      filesObject[path] = content;
    });

    // Call backend API endpoint
    const response = await fetch('/api/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName: sanitizedName,
        files: filesObject,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Deployment failed');
    }

    const result = await response.json();

    return {
      success: true,
      url: result.url,
      projectName: sanitizedName,
    };
  } catch (error) {
    console.error('Cloudflare deployment error:', error);

    let errorMessage = 'Deployment failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get Cloudflare account information from backend
 */
export async function getAccountInfo(): Promise<AccountInfo> {
  try {
    const response = await fetch('/api/account-info');

    if (!response.ok) {
      return {
        email: '',
        accountId: '',
        isAuthenticated: false,
      };
    }

    const data = await response.json();
    return {
      email: data.email || '',
      accountId: data.accountId || '',
      isAuthenticated: data.isAuthenticated || false,
    };
  } catch {
    return {
      email: '',
      accountId: '',
      isAuthenticated: false,
    };
  }
}

