import { useState } from 'react';
import { AISettings, AILogEntry, MappingSheet, FactsheetSession, DataWarning } from '../types/factsheet';
import { processFactsheetData } from '../utils/dataProcessor';
import { getTemplate } from '../templates/registry';
import { logger } from '../utils/logger';

export function useFactsheetGenerator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<DataWarning[]>([]);
  const [showConsole, setShowConsole] = useState(false);

  const generate = async (
    mappingData: MappingSheet[] | null,
    reportData: any[] | null,
    reportDate: string,
    aiSettings: AISettings,
    perfRawData: string,
    templateId: string,
    customData: Record<string, any>,
    onPerformanceExtracted?: (data: any) => void
  ) => {
    const template = getTemplate(templateId);
    
    // 1. Check requirements based on selected template
    const needsMapping = template.requiredInputs.includes('mapping');
    const needsReport = template.requiredInputs.includes('report');

    if ((needsMapping && !mappingData) || (needsReport && !reportData)) {
      setStatus({ 
        type: 'error', 
        message: `This template requires ${needsMapping ? 'Mapping' : ''}${needsMapping && needsReport ? ' and ' : ''}${needsReport ? 'Position Report' : ''} files.` 
      });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Processing data and generating factsheet...' });
    logger.info('system', `Starting generation for template [${templateId}]`, { mappingRows: mappingData?.length, positionRows: reportData?.length, customData });

    try {
      const { getPreviousSnapshot, getGlobalPerformanceHistory, saveSnapshot, getAllOverrides } = await import('../lib/db');
      const previousSnapshot = await getPreviousSnapshot(reportDate);
      const globalHistory = await getGlobalPerformanceHistory();
      const overrides = await getAllOverrides();
      
      let performanceData = null;
      if (perfRawData.trim() && aiSettings.apiKey) {
        logger.info('ai', `Extracting performance from unstructured text...`, { preview: perfRawData.substring(0, 100) });
        const { extractPerformanceData } = await import('../utils/ai/performanceExtractor');
        try {
          performanceData = await extractPerformanceData(perfRawData, aiSettings);
          logger.success('ai', 'Successfully extracted performance metrics via AI.', performanceData);
          if (performanceData) {
            onPerformanceExtracted?.(performanceData);
            setStatus({ type: 'info', message: 'Performance data extracted successfully. Processing exposures...' });
          }
        } catch (e: any) {
          logger.error('ai', `AI extraction failed: ${e.message}`);
          throw e;
        }
      }

      const { data, currentSnapshot } = await processFactsheetData(
        mappingData, 
        reportData, 
        reportDate, 
        aiSettings,
        performanceData,
        previousSnapshot,
        globalHistory?.monthly || null,
        customData
      );

      // Apply dynamic AI Logic Overrides
      const { applyOverrides } = await import('../utils/ai/overrideExecutor');
      const finalizedData = await applyOverrides(data, overrides, aiSettings);

      // 7. Render Template
      const html = template.generateHtml(finalizedData);

      await saveSnapshot(currentSnapshot);
      
      // 8. Save Full Session for History/Restoration
      const { saveSession } = await import('../lib/db');
      const session: FactsheetSession = {
        id: reportDate, // Use report date as primary key for now
        timestamp: new Date().toISOString(),
        templateId,
        inputs: {
          mappingData,
          reportData,
          perfRawData
        },
        customData,
        processed: finalizedData
      };
      await saveSession(session);

      setGeneratedHtml(html);
      setWarnings(finalizedData.warnings || []);
      setIsProcessing(false);
      
      const successMsg = previousSnapshot 
        ? `Factsheet generated with comparison to ${previousSnapshot.reportDate}!` 
        : 'Factsheet generated and saved to local database.';
        
      logger.success('system', successMsg);
      setStatus({ type: 'success', message: successMsg });
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      setWarnings([]);
      logger.error('system', `Generation error: ${err.message}`, err);
      setStatus({ type: 'error', message: err.message || 'Error generating factsheet. Check console for details.' });
    }
  };

  const download = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factsheet_Generated_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    isProcessing,
    status,
    generatedHtml,
    warnings,
    showConsole,
    setShowConsole,
    generate,
    download
  };
}
