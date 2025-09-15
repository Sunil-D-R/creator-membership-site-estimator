import React, { useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import { generateEstimationReport } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ReportDisplay from './components/ReportDisplay';
import { AppIcon, SparklesIcon, DownloadIcon } from './components/icons';
import type { ReportSection } from './types';

const loadingMessages = [
  'Initializing AI model...',
  'Analyzing aesthetic features...',
  'Evaluating market positioning...',
  'Calculating income scenarios...',
  'Compiling your personalized report...',
  'Finalizing recommendations...',
];

const App: React.FC = () => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [report, setReport] = useState<ReportSection[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessage = loadingMessages[loadingMessageIndex];

  useEffect(() => {
    let intervalId: number | undefined;
    if (isLoading) {
      setLoadingMessageIndex(0); // Reset to the first message
      intervalId = window.setInterval(() => {
        setLoadingMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading]);


  const handleImagesChange = useCallback((files: File[]) => {
    setImageFiles(prevFiles => [...prevFiles, ...files]);
    
    const newUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prevUrls => [...prevUrls, ...newUrls]);
    
    setReport(null);
    setError(null);
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const items = event.clipboardData?.items;
      if (!items) return;
      
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
           handleImagesChange(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);

    return () => {
        window.removeEventListener('paste', handlePaste);
    };
  }, [handleImagesChange]);

  const handleImageRemove = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviewUrls[indexToRemove]);
    
    setImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setImagePreviewUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
  };

  const handleGenerateReport = useCallback(async () => {
    if (imageFiles.length === 0) {
      setError("Please select at least one image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const reportText = await generateEstimationReport(imageFiles, name, description);
      const parsedReport = parseReport(reportText);
      if (parsedReport.length === 0) {
        throw new Error("The AI returned an empty or malformed response. This might be due to a safety policy violation. Please try different images.");
      }
      setReport(parsedReport);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate the report. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFiles, name, description]);
  
  const handleDownloadReport = async () => {
    if (!report) return;

    setIsDownloading(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;
      const lineHeight = 6;

      // Helper function to add text with word wrapping and proper page breaks
      const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, fontStyle: string = 'normal'): number => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);

        const lines = pdf.splitTextToSize(text, maxWidth);

        // Check if we need a new page before adding content
        if (y + (lines.length * lineHeight) > pageHeight - margin - 20) { // Extra margin for footer
          pdf.addPage();
          y = margin;
        }

        lines.forEach((line: string, index: number) => {
          // Double-check each line to prevent overflow
          if (y + (index * lineHeight) > pageHeight - margin - 20) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(line, x, y + (index * lineHeight));
        });

        return y + (lines.length * lineHeight);
      };

      // Helper function to process bold text with better page break handling
      const processBoldText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        let currentX = x;
        let currentLineY = y;

        pdf.setFontSize(fontSize);

        // Check if we need a new page before starting
        if (currentLineY > pageHeight - margin - 30) {
          pdf.addPage();
          currentLineY = margin;
          currentX = x;
        }

        for (const part of parts) {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            pdf.setFont('helvetica', 'bold');
            const textWidth = pdf.getTextWidth(boldText);

            if (currentX + textWidth > x + maxWidth) {
              currentLineY += lineHeight;
              currentX = x;

              if (currentLineY > pageHeight - margin - 30) {
                pdf.addPage();
                currentLineY = margin;
              }
            }

            pdf.text(boldText, currentX, currentLineY);
            currentX += textWidth;
          } else if (part.trim()) {
            pdf.setFont('helvetica', 'normal');
            const words = part.split(' ');

            for (const word of words) {
              if (!word.trim()) continue;

              const wordWithSpace = word + ' ';
              const textWidth = pdf.getTextWidth(wordWithSpace);

              if (currentX + textWidth > x + maxWidth) {
                currentLineY += lineHeight;
                currentX = x;

                if (currentLineY > pageHeight - margin - 30) {
                  pdf.addPage();
                  currentLineY = margin;
                }
              }

              pdf.text(wordWithSpace, currentX, currentLineY);
              currentX += textWidth;
            }
          }
        }

        return currentLineY + lineHeight;
      };

      // Helper function to ensure we have enough space for content
      const checkPageSpace = (requiredSpace: number): number => {
        if (currentY + requiredSpace > pageHeight - margin - 30) {
          pdf.addPage();
          return margin;
        }
        return currentY;
      };

      // Simple, clean header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      currentY = addText('Creator Analysis & Income Estimate', margin, currentY, contentWidth, 20, 'bold');
      currentY += 8;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      currentY = addText('Membership Site Potential Report', margin, currentY, contentWidth, 12, 'normal');
      currentY += 15;

      // Simple date line
      pdf.setFontSize(10);
      pdf.setTextColor(120, 120, 120);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      currentY = addText(`Generated: ${currentDate}`, margin, currentY, contentWidth, 10);
      currentY += 10;

      // Simple separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 15;

      // Extract and display key metrics summary first
      const tierSection = report.find(section =>
        section.title.toLowerCase().includes('snapshot') ||
        section.title.toLowerCase().includes('tiered')
      );

      if (tierSection) {
        const tierChart = tierSection.content.find(item => item.type === 'tierChart');
        if (tierChart && 'items' in tierChart) {
          // Simple earnings summary
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          currentY = addText('EARNINGS POTENTIAL OVERVIEW', margin, currentY, contentWidth, 14, 'bold');
          currentY += 4;

          // Simple USD note
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(120, 120, 120);
          currentY = addText('(All estimates shown in USD)', margin, currentY, contentWidth, 9, 'italic');
          currentY += 8;

          // Sort tiers by earnings value
          const getNumericValue = (value: string) => {
            const match = value.match(/\$(\d+(?:\.\d+)?)/);
            return match ? parseFloat(match[1]) : 0;
          };

          const sortedTiers = [...tierChart.items].sort((a, b) =>
            getNumericValue(b.value) - getNumericValue(a.value)
          );

          // Simple list format
          sortedTiers.forEach((tier, index) => {
            const tierName = tier.label.replace(/^Tier \d+\s*[:-]?\s*/i, '');

            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(80, 80, 80);
            currentY = addText(`${tierName}:`, margin, currentY, contentWidth/2, 11, 'normal');

            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${tier.value} USD`, margin + 100, currentY - 6);

            currentY += 2;
          });

          currentY += 10;
        }
      }

      // Process each section with clean formatting and proper page breaks
      for (let sectionIndex = 0; sectionIndex < report.length; sectionIndex++) {
        const section = report[sectionIndex];

        // Skip sections that only contain tierChart (already handled in summary)
        const hasNonTierContent = section.content.some(item => item.type !== 'tierChart');
        if (!hasNonTierContent) {
          continue; // Skip this section entirely
        }

        // Start each new section on a new page (except the first one if we're still on the first page)
        if (sectionIndex > 0 || currentY > margin + 100) {
          pdf.addPage();
          currentY = margin;
        }

        // Simple section header
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        currentY = addText(section.title.toUpperCase(), margin, currentY, contentWidth, 14, 'bold');
        currentY += 8;

        // Section content
        let isFirstContentItem = true;
        for (const contentItem of section.content) {
          switch (contentItem.type) {
            case 'h4':
              // Start major subheadings on new page if there's already content on the current page
              if (!isFirstContentItem && currentY > margin + 50) {
                pdf.addPage();
                currentY = margin;
              } else {
                // Check space for subheading if staying on same page
                currentY = checkPageSpace(25);
              }

              pdf.setFontSize(12);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor(60, 60, 60);
              currentY = addText(contentItem.text, margin, currentY, contentWidth, 12, 'bold');
              currentY += 8;
              break;

            case 'p':
              // Check space for paragraph
              currentY = checkPageSpace(20);

              pdf.setTextColor(80, 80, 80);
              pdf.setFontSize(10);
              currentY = processBoldText(contentItem.text, margin, currentY, contentWidth, 10);
              currentY += 4;
              break;

            case 'ul':
              // Check space for list
              currentY = checkPageSpace(contentItem.items.length * 8 + 10);

              for (const item of contentItem.items) {
                // Double-check space for each list item
                if (currentY > pageHeight - margin - 40) {
                  pdf.addPage();
                  currentY = margin;
                }

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(120, 120, 120);
                pdf.text('•', margin + 3, currentY);

                pdf.setTextColor(80, 80, 80);
                currentY = processBoldText(item, margin + 8, currentY, contentWidth - 8, 10);
                currentY += 2;
              }
              currentY += 4;
              break;

            case 'tierChart':
              // Skip - already handled in summary
              break;
          }

          // Mark that we've processed the first content item
          isFirstContentItem = false;
        }

        currentY += 8;
      }

      // Add Spiciz Agency information section
      pdf.addPage();
      currentY = margin;

      // Section header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      currentY = addText('ABOUT THESE ESTIMATES', margin, currentY, contentWidth, 16, 'bold');
      currentY += 10;

      // Explanation paragraph
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const explanationText = 'These estimates are based on leveraging Spiciz Agency\'s unique marketing funnel, established audience network, and proven monetization strategies. Our comprehensive approach combines technical expertise with marketing excellence to maximize creator potential.';
      currentY = addText(explanationText, margin, currentY, contentWidth, 11);
      currentY += 15;

      // What's included section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      currentY = addText('WHAT\'S INCLUDED WITH SPICIZ AGENCY', margin, currentY, contentWidth, 14, 'bold');
      currentY += 10;

      // Service items in simple text format
      const services = [
        {
          title: 'Fully Private & Branded Website',
          description: 'Custom-built for you, not a platform. Your look, your voice, your vibe.'
        },
        {
          title: 'Built-In Membership, Payment & Email Tools',
          description: 'Monetize with no middlemen. Keep your audience in one space.'
        },
        {
          title: 'Design, Setup & Content Support',
          description: 'We handle all the technicals—including writing and visual layout if you want help.'
        },
        {
          title: 'Total Privacy Control',
          description: 'Restrict viewers by country, approve subscribers, and keep your brand safe.'
        },
        {
          title: 'Zero Upfront Cost',
          description: 'We cover all setup and design expenses. You earn, we scale.'
        }
      ];

      services.forEach((service, index) => {
        // Check space for service item
        currentY = checkPageSpace(20);

        // Service title
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(60, 60, 60);
        currentY = addText(`• ${service.title}`, margin, currentY, contentWidth, 11, 'bold');
        currentY += 4;

        // Service description
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        currentY = addText(service.description, margin + 8, currentY, contentWidth - 8, 10);
        currentY += 6;
      });

      // Contact/next steps
      currentY += 5;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      currentY = addText('READY TO GET STARTED?', margin, currentY, contentWidth, 12, 'bold');
      currentY += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      const contactText = 'Contact Spiciz Agency to discuss how we can help you achieve these income estimates through our proven system and comprehensive support.';
      currentY = addText(contactText, margin, currentY, contentWidth, 10);

      // Add footer to all pages
      const totalPages = pdf.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        const footerY = pageHeight - 20;

        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, footerY, pageWidth - margin, footerY);

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120, 120, 120);

        // Page number
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, footerY + 5);

        // Disclaimer only on first page
        if (i === 1) {
          const disclaimerText = 'This report is for informational purposes only. Results may vary based on marketing, content quality, and engagement.';
          const disclaimerLines = pdf.splitTextToSize(disclaimerText, contentWidth - 40);
          disclaimerLines.forEach((line: string, index: number) => {
            pdf.text(line, margin, footerY + 5 + (index * 3));
          });
        }
      }

      // Generate filename with creator name, date, and time
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS

      // Try to extract creator name from the first section title
      let creatorName = 'Creator';
      const firstSection = report.find(section =>
        section.title.toLowerCase().includes('report for') ||
        section.title.toLowerCase().includes('potential')
      );

      if (firstSection) {
        const match = firstSection.title.match(/report for (.+?)$/i);
        if (match) {
          creatorName = match[1].trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
        }
      }

      const filename = `${creatorName}-${dateStr}-${timeStr}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setError("Sorry, there was an error creating the PDF report.");
    } finally {
      setIsDownloading(false);
    }
  };

  const parseReport = (text: string | undefined): ReportSection[] => {
    if (!text) {
        return [];
    }
    const sections: ReportSection[] = [];
    const lines = text.split('\n').filter(line => line.trim() !== '');
    let currentSection: ReportSection | null = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('### ')) {
            if (currentSection) sections.push(currentSection);
            currentSection = { title: line.replace('### ', '').trim(), content: [] };
            continue;
        }
        if (!currentSection) continue;
        
        if (currentSection.title.toLowerCase().includes('snapshot')) {
            const chartItems: { label: string, value: string }[] = [];
            while(i < lines.length && lines[i] && lines[i].includes(':')) {
                const parts = lines[i].split(':');
                const label = parts[0].replace(/^-|\*/g, '').trim();
                const value = parts.slice(1).join(':').trim();
                if (label && value) {
                    chartItems.push({ label, value });
                }
                i++;
            }
            i--;
            if(chartItems.length > 0) {
                 currentSection.content.push({ type: 'tierChart', items: chartItems });
            }
            continue;
        }

        if (line.startsWith('#### ')) {
            currentSection.content.push({ type: 'h4', text: line.replace('#### ', '').trim() });
        } else if (line.startsWith('- ')) {
            const listItems: string[] = [];
            while (i < lines.length && lines[i] && lines[i].startsWith('- ')) {
                listItems.push(lines[i].replace(/^- \s*/, ''));
                i++;
            }
            i--; 
            currentSection.content.push({ type: 'ul', items: listItems });
        } else if (line.trim()) {
            currentSection.content.push({ type: 'p', text: line.trim() });
        }
    }
    if (currentSection) sections.push(currentSection);
    return sections;
};

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-primary-bg)',
      color: 'var(--color-text-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'var(--spacing-lg)',
    }}>
      <header style={{ width: '100%', maxWidth: '900px', marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
          <AppIcon style={{ height: '40px', width: '40px', color: 'var(--color-accent-primary)' }} />
          <h1 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', letterSpacing: '-0.05em' }}>
            AI Creator Membership Site Estimator
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
          Upload photos and optionally add a name and description to receive a personalized, AI-driven analysis of your potential.
        </p>
      </header>

      <main style={{
        width: '100%',
        maxWidth: '900px',
        backgroundColor: 'var(--color-secondary-bg)',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--box-shadow-lg)',
        padding: 'var(--spacing-xl)',
        border: '1px solid var(--color-border-divider)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-semibold)' }}>1. Upload Your Images</h2>
            <ImageUploader 
              onImagesChange={handleImagesChange}
              onImageRemove={handleImageRemove}
              imagePreviewUrls={imagePreviewUrls} 
            />

            <h2 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-semibold)', marginTop: 'var(--spacing-sm)' }}>2. Add Personal Details (Optional)</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <label htmlFor="name" style={{ display: 'block', fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Your Name (for a more personal report)
                </label>
                <input
                  type="text"
                  id="name"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-secondary-bg)',
                    border: '1px solid var(--color-border-divider)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: 'var(--spacing-sm)',
                    color: 'var(--color-text-primary)',
                    height: '40px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your name or alias"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

               <div>
                  <label htmlFor="description" style={{ display: 'block', fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Optional Context (personality, goals, etc.)
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--color-secondary-bg)',
                      border: '1px solid var(--color-border-divider)',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: 'var(--spacing-sm)',
                      color: 'var(--color-text-primary)',
                      resize: 'vertical'
                    }}
                    placeholder="Example: 'I'm a 24-year-old artist with a bubbly personality...'"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
            </div>

            <h2 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-semibold)', marginTop: 'var(--spacing-sm)' }}>3. Generate Your Report</h2>
            <button
              onClick={handleGenerateReport}
              disabled={imageFiles.length === 0 || isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-xs)',
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-secondary-bg)',
                fontWeight: 'var(--font-weight-medium)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--border-radius-md)',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color var(--transition-speed-fast) var(--transition-ease)',
                width: '100%',
                fontSize: '16px',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', marginRight: 'var(--spacing-sm)', height: '20px', width: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {loadingMessage}
                </>
              ) : (
                <>
                  <SparklesIcon style={{ height: '20px', width: '20px' }} />
                  Generate Report
                </>
              )}
            </button>
          </div>

          <div>
            {error && (
              <div style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', border: '1px solid rgba(220, 53, 69, 0.4)', color: '#DC3545', padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--spacing-md)' }} role="alert">
                <strong style={{ fontWeight: 'var(--font-weight-bold)' }}>Error: </strong>
                <span>{error}</span>
              </div>
            )}
            {!isLoading && !report && !error && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--spacing-xl)', border: '2px dashed var(--color-border-divider)', borderRadius: 'var(--border-radius-lg)' }}>
                <p>Your generated report will appear here.</p>
              </div>
            )}
            {isLoading && (
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-xl)' }}>
                <p style={{ fontSize: '18px', fontWeight: 'var(--font-weight-semibold)' }}>{loadingMessage}</p>
                <p style={{ fontSize: '14px' }}>This can take up to 30 seconds. The AI is performing a comprehensive evaluation.</p>
              </div>
            )}
            {report && (
              <>
                <ReportDisplay sections={report} />
                 <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <button
                        onClick={handleDownloadReport}
                        disabled={isDownloading}
                        style={{
                           display: 'inline-flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           gap: 'var(--spacing-xs)',
                           backgroundColor: 'var(--color-text-secondary)',
                           color: 'var(--color-secondary-bg)',
                           fontWeight: 'var(--font-weight-medium)',
                           padding: '10px 20px',
                           borderRadius: 'var(--border-radius-md)',
                           border: '1px solid transparent',
                           cursor: isDownloading ? 'wait' : 'pointer',
                           opacity: isDownloading ? 0.7 : 1,
                           transition: 'background-color var(--transition-speed-fast) var(--transition-ease)'
                        }}
                    >
                        <DownloadIcon style={{ height: '20px', width: '20px' }} />
                        {isDownloading ? 'Generating PDF...' : 'Download Report as PDF'}
                    </button>
                </div>
              </>
            )}
          </div>
        </div>
        <footer style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)', fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)' }}>
          <p>Disclaimer: This tool provides an estimation based on AI analysis of images. Real-world success depends on numerous factors including marketing, personality, content quality, and engagement. Use this for entertainment and informational purposes only.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;