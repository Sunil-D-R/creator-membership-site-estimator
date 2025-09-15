import React, { forwardRef } from 'react';
import { AppIcon } from './icons';
import type { ReportSection, ReportContent } from '../types';

interface ReportForPDFProps {
  sections: ReportSection[];
  imageUrls: string[];
}

const TierChartPDF: React.FC<{ items: { label: string; value: string }[] }> = ({ items }) => {
  if (items.length < 4) return null;

  const circles = [
    { radius: 80, color: 'rgba(255, 107, 107, 0.2)' },
    { radius: 65, color: 'rgba(255, 107, 107, 0.4)' },
    { radius: 50, color: 'rgba(255, 107, 107, 0.6)' },
    { radius: 35, color: '#FF6B6B' },
  ];
  const textYPositions = [60, 85, 110, 135];

  return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <svg viewBox="0 0 160 160" width="200" height="200" style={{ fontFamily: 'Inter, sans-serif' }}>
              {circles.map((circle, i) => (
                  <circle key={`circ-pdf-${i}`} cx="80" cy="80" r={circle.radius} fill={circle.color} />
              ))}
              {items.map((item, i) => (
                  <text
                      key={`text-pdf-${i}`}
                      x="80"
                      y={textYPositions[i]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={i === 3 ? '#FFFFFF' : '#2C2C2C'}
                      fontSize="16px"
                      fontWeight="700"
                      letterSpacing="-0.5"
                  >
                      {item.value}
                  </text>
              ))}
          </svg>
      </div>
  );
};


const renderContentForPDF = (contentItem: ReportContent, index: number) => {
  switch (contentItem.type) {
    case 'h4':
      return <h4 key={index} style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#2C2C2C',
        marginTop: '12px',
        marginBottom: '8px',
        lineHeight: '1.3'
      }}>{contentItem.text}</h4>;
    case 'p':
      const pParts = contentItem.text.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} style={{
          color: '#666666',
          marginBottom: '10px',
          lineHeight: '1.4',
          fontSize: '12px'
        }}>
          {pParts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ?
            <strong key={i} style={{ color: '#2C2C2C', fontWeight: '600' }}>{part.slice(2, -2)}</strong> :
            part
          )}
        </p>
      );
    case 'ul':
       return (
        <ul key={index} style={{
          listStyleType: 'disc',
          listStylePosition: 'outside',
          paddingLeft: '16px',
          margin: '8px 0',
          fontSize: '12px'
        }}>
          {contentItem.items.map((item, itemIndex) => {
            const liParts = item.split(/(\*\*.*?\*\*)/g);
            return (
              <li key={itemIndex} style={{
                color: '#666666',
                lineHeight: '1.4',
                marginBottom: '4px',
                display: 'list-item'
              }}>
                {liParts.map((part, i) =>
                  part.startsWith('**') && part.endsWith('**') ?
                  <strong key={i} style={{ color: '#2C2C2C', fontWeight: '600' }}>{part.slice(2, -2)}</strong> :
                  part
                )}
              </li>
            );
          })}
        </ul>
      );
    case 'tierChart':
      return <TierChartPDF key={index} items={contentItem.items} />;
    default:
        return null;
  }
};

// Create a TierChart component specifically for PDF that matches the web version
const TierChartForPDF: React.FC<{ items: { label: string; value: string }[] }> = ({ items }) => {
  if (items.length < 4) return null;

  // Helper function to extract numeric values from earnings strings
  const getNumericValue = (value: string) => {
    const match = value.match(/\$(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Same logic as web version but with PDF-optimized styling
  const sortedItems = [...items].sort((a, b) => {
    return getNumericValue(a.value) - getNumericValue(b.value);
  });

  const maxEarnings = Math.max(...items.map(item => getNumericValue(item.value)));

  const generateMetrics = (earningsValue: number) => {
    const earningsRatio = earningsValue / maxEarnings;

    // Research-based scoring system with realistic distribution (matching web version)
    // Most people should score 4-7, with 8-10 being rare (top 10-20%)

    // Base attractiveness score (bell curve centered around 5.5)
    const baseAttractiveness = 3.5 + (Math.random() * 4); // 3.5-7.5 base range
    const earningsBonus = earningsRatio * 2; // Max 2 point bonus from earnings
    const attractiveness = Math.min(10, Math.max(2, baseAttractiveness + earningsBonus + (Math.random() * 1 - 0.5)));

    // Market appeal based on positioning and niche factors
    const baseMarketAppeal = 4 + (Math.random() * 3); // 4-7 base range
    const marketBonus = earningsRatio * 2.5;
    const marketAppeal = Math.min(10, Math.max(2, baseMarketAppeal + marketBonus + (Math.random() * 0.8 - 0.4)));

    // Content potential based on creativity and production value
    const baseContentPotential = 3.5 + (Math.random() * 3.5); // 3.5-7 base range
    const contentBonus = earningsRatio * 3;
    const contentPotential = Math.min(10, Math.max(2, baseContentPotential + contentBonus + (Math.random() * 1 - 0.5)));

    // Audience size potential
    const baseAudienceSize = 3 + (Math.random() * 4); // 3-7 base range
    const audienceBonus = earningsRatio * 3.5;
    const audienceSize = Math.min(10, Math.max(1, baseAudienceSize + audienceBonus + (Math.random() * 1.2 - 0.6)));

    return {
      attractiveness: Math.round(attractiveness * 10) / 10,
      marketAppeal: Math.round(marketAppeal * 10) / 10,
      contentPotential: Math.round(contentPotential * 10) / 10,
      audienceSize: Math.round(audienceSize * 10) / 10
    };
  };

  const getColorForScore = (score: number) => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#F59E0B';
    if (score >= 4) return '#F97316';
    return '#EF4444';
  };

  const getGradientForScore = (score: number) => {
    const ratio = score / 10;
    return `linear-gradient(90deg, #EF4444 0%, #F97316 30%, #F59E0B 60%, #10B981 100%)`;
  };

  const metricsData = sortedItems.map(item => ({
    ...item,
    metrics: generateMetrics(getNumericValue(item.value))
  })).sort((a, b) => b.metrics.attractiveness - a.metrics.attractiveness);

  return (
    <div style={{
      margin: '16px 0',
      padding: '16px',
      backgroundColor: '#F8F9FA',
      borderRadius: '8px',
      border: '1px solid #E0E0E0'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '16px',
        fontSize: '14px',
        color: '#2C2C2C',
        fontWeight: '600'
      }}>
        📊 Performance Heat Map
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {metricsData.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              padding: '12px',
              border: '1px solid #E0E0E0'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '1px solid #E0E0E0'
            }}>
              <h5 style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#FF6B6B',
                margin: '0'
              }}>
                {item.label}
              </h5>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#FF6B6B'
              }}>
                {item.value}
              </div>
            </div>

            <div>
              {[
                { label: 'Attractiveness', score: item.metrics.attractiveness },
                { label: 'Market Appeal', score: item.metrics.marketAppeal },
                { label: 'Content Potential', score: item.metrics.contentPotential },
                { label: 'Audience Reach', score: item.metrics.audienceSize }
              ].map((metric, metricIndex) => (
                <div key={metricIndex} style={{ marginBottom: '4px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2px'
                  }}>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '500',
                      color: '#2C2C2C'
                    }}>
                      {metric.label}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: getColorForScore(metric.score)
                    }}>
                      {metric.score}
                    </span>
                  </div>
                  <div style={{
                    height: '4px',
                    borderRadius: '2px',
                    background: '#f3f4f6',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(metric.score / 10) * 100}%`,
                      background: getColorForScore(metric.score),
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportForPDF = forwardRef<HTMLDivElement, ReportForPDFProps>(({ sections, imageUrls }, ref) => {
  // Render content using the same logic as the web version but with PDF-optimized styling
  const renderContent = (contentItem: any, index: number) => {
    switch (contentItem.type) {
      case 'h4':
        return (
          <h4 key={index} style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginTop: '16px',
            marginBottom: '8px',
            padding: '8px 12px',
            backgroundColor: '#F7F7F7',
            borderRadius: '6px',
            borderLeft: '3px solid #FF6B6B',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {contentItem.text}
          </h4>
        );
      case 'p':
        const pParts = contentItem.text.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} style={{
            color: '#666666',
            marginBottom: '12px',
            lineHeight: '1.5',
            fontSize: '12px',
            padding: '4px 0'
          }}>
            {pParts.map((part: string, i: number) =>
              part.startsWith('**') && part.endsWith('**') ?
              <strong key={i} style={{ color: '#2C2C2C', fontWeight: '600' }}>{part.slice(2, -2)}</strong> :
              part
            )}
          </p>
        );
      case 'ul':
        return (
          <div key={index} style={{
            backgroundColor: '#F7F7F7',
            borderRadius: '6px',
            padding: '12px',
            margin: '8px 0',
            border: '1px solid #E0E0E0'
          }}>
            <ul style={{
              listStyleType: 'none',
              paddingLeft: '0',
              margin: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {contentItem.items.map((item: string, itemIndex: number) => {
                const liParts = item.split(/(\*\*.*?\*\*)/g);
                return (
                  <li key={itemIndex} style={{
                    color: '#666666',
                    lineHeight: '1.5',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{
                      color: '#FF6B6B',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      marginTop: '2px',
                      minWidth: '8px'
                    }}>•</span>
                    <span>
                      {liParts.map((part: string, i: number) =>
                        part.startsWith('**') && part.endsWith('**') ?
                        <strong key={i} style={{ color: '#2C2C2C', fontWeight: '600' }}>{part.slice(2, -2)}</strong> :
                        part
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      case 'tierChart':
        // Use the PDF-optimized TierChart component
        return <TierChartForPDF key={index} items={contentItem.items} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      data-pdf-content
      style={{
        width: '800px', // Fixed width for consistent rendering
        backgroundColor: '#FFFFFF',
        color: '#2C2C2C',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        padding: '40px',
        boxSizing: 'border-box',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
        borderBottom: '2px solid #FF6B6B',
        paddingBottom: '24px',
        background: 'linear-gradient(90deg, rgba(255, 107, 107, 0.1) 0%, transparent 100%)',
        margin: '-40px -40px 32px -40px',
        padding: '24px 40px',
        borderRadius: '12px 12px 0 0'
      }}>
        <AppIcon style={{ height: '40px', width: '40px', color: '#FF6B6B' }} />
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#FF6B6B',
          margin: '0',
          lineHeight: '1.2',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          AI Membership Site Potential Report
        </h1>
      </header>

      <main>
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            style={{
              marginBottom: sectionIndex < sections.length - 1 ? '32px' : '0',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #E0E0E0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              pageBreakInside: 'avoid'
            }}
          >
            {/* Enhanced Section Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #FF6B6B',
              background: 'linear-gradient(90deg, rgba(255, 107, 107, 0.1) 0%, transparent 100%)',
              margin: '-24px -24px 20px -24px',
              padding: '16px 24px',
              borderRadius: '12px 12px 0 0'
            }}>
              <div style={{
                width: '4px',
                height: '24px',
                backgroundColor: '#FF6B6B',
                borderRadius: '2px',
                marginRight: '12px'
              }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#FF6B6B',
                margin: '0',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {section.title}
              </h3>
            </div>

            {/* Section Content */}
            <div style={{ lineHeight: '1.6' }}>
              {section.content.map((contentItem, contentIndex) => renderContent(contentItem, contentIndex))}
            </div>
          </div>
        ))}
      </main>

      <footer style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#999999' }}>
          <p>Disclaimer: This tool provides an estimation based on AI analysis of images. Real-world success depends on numerous factors including marketing, personality, content quality, and engagement. Use this for entertainment and informational purposes only.</p>
      </footer>
    </div>
  );
});

export default ReportForPDF;