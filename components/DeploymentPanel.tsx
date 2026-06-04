import React, { useState, useEffect } from 'react';
import { ReportSection } from '../types';
import { generateStaticSite } from '../services/siteGeneratorService';
import { deployToCloudflarePages, getAccountInfo, sanitizeProjectName, type AccountInfo } from '../services/cloudflareService';

interface DeploymentPanelProps {
  creatorName: string;
  reportSections: ReportSection[];
  timestamp: string;
}

const DeploymentPanel: React.FC<DeploymentPanelProps> = ({ creatorName, reportSections, timestamp }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);

  // Load account info on mount
  useEffect(() => {
    const loadAccountInfo = async () => {
      setIsLoadingAccount(true);
      const info = await getAccountInfo();
      setAccountInfo(info);
      setIsLoadingAccount(false);
    };
    loadAccountInfo();
  }, []);

  const handleDeploy = async () => {
    if (!accountInfo?.isAuthenticated) {
      setDeploymentResult({
        success: false,
        error: 'Not authenticated with Cloudflare. Please run: npx wrangler login',
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      // Generate the static site files
      const files = generateStaticSite({
        creatorName,
        reportSections,
        timestamp,
      });

      // Deploy to Cloudflare Pages via backend API
      const result = await deployToCloudflarePages(creatorName, files);

      setDeploymentResult(result);
    } catch (error) {
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div style={{
      marginTop: '2rem',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 217, 61, 0.1) 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 107, 107, 0.2)',
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
        🚀 Deploy to Cloudflare Pages
      </h3>

      <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
        Create a beautiful one-page site with this report and deploy it to Cloudflare Pages.
        The site will be available at: <strong>{sanitizeProjectName(creatorName)}.pages.dev</strong>
      </p>

      {isLoadingAccount ? (
        <p style={{ color: '#666', fontSize: '0.875rem' }}>⏳ Checking Cloudflare authentication...</p>
      ) : accountInfo?.isAuthenticated ? (
        <>
          <div style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#666'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              ✅ <strong>Authenticated as:</strong> {accountInfo.email}
            </div>
            <div>
              🆔 <strong>Account ID:</strong> {accountInfo.accountId}
            </div>
          </div>

          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            style={{
              padding: '0.75rem 1.5rem',
              background: isDeploying ? '#ccc' : 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isDeploying ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => !isDeploying && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isDeploying ? '⏳ Deploying...' : '🚀 Deploy Now'}
          </button>
        </>
      ) : (
        <div style={{
          background: '#fff3cd',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #ffc107',
          color: '#856404'
        }}>
          <strong>⚠️ Not Authenticated</strong>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Please run the following command in your terminal to authenticate with Cloudflare:
          </p>
          <code style={{
            display: 'block',
            marginTop: '0.5rem',
            padding: '0.5rem',
            background: '#fff',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            npx wrangler login
          </code>
        </div>
      )}

      {deploymentResult && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: deploymentResult.success ? '#d4edda' : '#f8d7da',
          color: deploymentResult.success ? '#155724' : '#721c24',
          borderRadius: '8px',
          border: `1px solid ${deploymentResult.success ? '#c3e6cb' : '#f5c6cb'}`,
        }}>
          {deploymentResult.success ? (
            <>
              <strong>✅ Deployment Successful!</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Your site is live at: <a href={deploymentResult.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>{deploymentResult.url}</a>
              </p>
            </>
          ) : (
            <>
              <strong>❌ Deployment Failed</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{deploymentResult.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DeploymentPanel;

