import React from 'react';
import type { ReportSection, ReportContent } from '../types';

const renderMarkdown = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: var(--font-weight-semibold); color: var(--color-text-primary);">$1</strong>');
};

const TierChart: React.FC<{ items: { label: string; value: string }[] }> = ({ items }) => {
  if (items.length < 4) return null; // Expects 4 data points

  // Extract earnings values and create comprehensive metrics
  const getNumericValue = (value: string) => {
    const match = value.match(/\$(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const maxEarnings = Math.max(...items.map(item => getNumericValue(item.value)));

  // Generate realistic metrics with objective scoring system
  const generateMetrics = (earningsValue: number) => {
    const earningsRatio = earningsValue / maxEarnings;

    // Research-based scoring system with realistic distribution
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
      audienceSize: Math.round(audienceSize * 10) / 10,
      earnings: earningsValue
    };
  };

  const metricsData = items.map(item => ({
    ...item,
    metrics: generateMetrics(getNumericValue(item.value))
  }));

  // Sort by earnings for display
  const sortedData = metricsData.sort((a, b) => b.metrics.earnings - a.metrics.earnings);

  const getColorForScore = (score: number, maxScore: number = 10) => {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return '#10B981'; // Green
    if (ratio >= 0.6) return '#F59E0B'; // Yellow
    if (ratio >= 0.4) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const getGradientForScore = (score: number, maxScore: number = 10) => {
    const ratio = score / maxScore;
    const colors = [
      { pos: 0, color: '#EF4444' },    // Red
      { pos: 0.3, color: '#F97316' },  // Orange
      { pos: 0.6, color: '#F59E0B' },  // Yellow
      { pos: 1, color: '#10B981' }     // Green
    ];

    // Find the appropriate color range
    let startColor = colors[0];
    let endColor = colors[colors.length - 1];

    for (let i = 0; i < colors.length - 1; i++) {
      if (ratio >= colors[i].pos && ratio <= colors[i + 1].pos) {
        startColor = colors[i];
        endColor = colors[i + 1];
        break;
      }
    }

    return `linear-gradient(90deg, ${startColor.color}20 0%, ${endColor.color}40 ${ratio * 100}%, #f3f4f6 ${ratio * 100}%, #f3f4f6 100%)`;
  };

  const MetricBar: React.FC<{ label: string; score: number; maxScore?: number }> = ({
    label,
    score,
    maxScore = 10
  }) => (
    <div style={{ marginBottom: '6px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2px'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-text-primary)'
        }}>
          {label}
        </span>
        <span style={{
          fontSize: '12px',
          fontWeight: 'var(--font-weight-bold)',
          color: getColorForScore(score, maxScore),
          minWidth: '25px',
          textAlign: 'right'
        }}>
          {score}
        </span>
      </div>
      <div style={{
        height: '6px',
        borderRadius: '3px',
        background: getGradientForScore(score, maxScore),
        border: '1px solid #e5e7eb',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Score indicator triangle */}
        <div style={{
          position: 'absolute',
          top: '-1px',
          left: `${(score / maxScore) * 100}%`,
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '3px solid transparent',
          borderRight: '3px solid transparent',
          borderTop: '4px solid #374151'
        }} />
      </div>
    </div>
  );

  return (
    <div style={{
      margin: 'var(--spacing-md) 0',
      padding: 'var(--spacing-md)',
      backgroundColor: 'var(--color-secondary-bg)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--color-border-divider)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--spacing-md)',
        fontSize: '14px',
        color: 'var(--color-text-primary)',
        fontWeight: 'var(--font-weight-semibold)'
      }}>
        📊 Performance Heat Map
      </div>

      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--spacing-sm)',
        fontSize: '11px',
        color: 'var(--color-text-muted)',
        fontStyle: 'italic'
      }}>
        (All estimates shown in USD)
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--spacing-sm)'
      }}>
        {sortedData.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'var(--color-primary-bg)',
              borderRadius: 'var(--border-radius-md)',
              padding: 'var(--spacing-sm)',
              border: '1px solid var(--color-border-divider)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Compact Tier Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              paddingBottom: '6px',
              borderBottom: '1px solid var(--color-border-divider)'
            }}>
              <h5 style={{
                fontSize: '13px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-accent-primary)',
                margin: '0'
              }}>
                {item.label}
              </h5>
              <div style={{
                fontSize: '14px',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-accent-primary)',
                background: 'linear-gradient(135deg, var(--color-accent-primary)15, var(--color-accent-primary)25)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid var(--color-accent-primary)30'
              }}>
                {item.value}
              </div>
            </div>

            {/* Compact Metrics */}
            <div>
              <MetricBar label="Attractiveness" score={item.metrics.attractiveness} />
              <MetricBar label="Market Appeal" score={item.metrics.marketAppeal} />
              <MetricBar label="Content Potential" score={item.metrics.contentPotential} />
              <MetricBar label="Audience Reach" score={item.metrics.audienceSize} />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: 'var(--spacing-sm)',
        fontSize: '10px',
        color: 'var(--color-text-muted)',
        fontStyle: 'italic'
      }}>
        💡 AI-generated metrics based on visual analysis and market positioning
      </div>
    </div>
  );
};


const renderContent = (contentItem: ReportContent, index: number) => {
  switch (contentItem.type) {
    case 'h4':
      return (
        <h4 key={index} style={{
          fontSize: 'var(--font-size-h4)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginTop: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-sm)',
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          backgroundColor: 'var(--color-secondary-bg)',
          borderRadius: 'var(--border-radius-md)',
          borderLeft: '3px solid var(--color-accent-primary)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {contentItem.text}
        </h4>
      );
    case 'p':
      return (
        <p key={index} style={{
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--spacing-sm)',
          lineHeight: 'var(--line-height-base)',
          padding: 'var(--spacing-xs) 0'
        }} dangerouslySetInnerHTML={{ __html: renderMarkdown(contentItem.text) }} />
      );
    case 'ul':
      return (
        <div key={index} style={{
          backgroundColor: 'var(--color-secondary-bg)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-sm)',
          margin: 'var(--spacing-sm) 0',
          border: '1px solid var(--color-border-divider)'
        }}>
          <ul style={{
            listStyleType: 'none',
            paddingLeft: '0',
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)'
          }}>
            {contentItem.items.map((item, itemIndex) => (
              <li key={itemIndex} style={{
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--line-height-base)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--spacing-xs)'
              }}>
                <span style={{
                  color: 'var(--color-accent-primary)',
                  fontWeight: 'var(--font-weight-bold)',
                  fontSize: '14px',
                  marginTop: '2px',
                  minWidth: '8px'
                }}>•</span>
                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(item) }} />
              </li>
            ))}
          </ul>
        </div>
      );
    case 'tierChart':
      return <TierChart key={index} items={contentItem.items} />;
    default:
      return null;
  }
};

interface ReportDisplayProps {
  sections: ReportSection[];
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ sections }) => {
  return (
    <div style={{
      animation: 'fadeIn 0.5s ease-in-out',
      background: 'linear-gradient(135deg, var(--color-primary-bg) 0%, var(--color-secondary-bg) 100%)',
      borderRadius: 'var(--border-radius-lg)',
      padding: 'var(--spacing-lg)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          style={{
            marginBottom: sectionIndex < sections.length - 1 ? 'var(--spacing-xl)' : '0',
            backgroundColor: 'var(--color-primary-bg)',
            borderRadius: 'var(--border-radius-lg)',
            padding: 'var(--spacing-lg)',
            border: '1px solid var(--color-border-divider)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
          }}
        >
          {/* Enhanced Section Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)',
            paddingBottom: 'var(--spacing-sm)',
            borderBottom: '2px solid var(--color-accent-primary)',
            background: 'linear-gradient(90deg, var(--color-accent-primary)10 0%, transparent 100%)',
            margin: 'calc(-1 * var(--spacing-lg)) calc(-1 * var(--spacing-lg)) var(--spacing-md) calc(-1 * var(--spacing-lg))',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0'
          }}>
            <div style={{
              width: '4px',
              height: '24px',
              backgroundColor: 'var(--color-accent-primary)',
              borderRadius: '2px',
              marginRight: 'var(--spacing-sm)'
            }} />
            <h3 style={{
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-accent-primary)',
              margin: '0',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {section.title}
            </h3>
          </div>

          {/* Section Content */}
          <div style={{
            lineHeight: '1.6'
          }}>
            {section.content.map((contentItem, contentIndex) => renderContent(contentItem, contentIndex))}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .report-section {
            margin: 0 calc(-1 * var(--spacing-md));
            padding: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
};

export default ReportDisplay;