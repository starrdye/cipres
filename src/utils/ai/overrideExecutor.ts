import { AIService } from '../../lib/ai';
import { AISettings, LogicOverride, ProcessedFactsheetData } from '../../types/factsheet';
import { logger } from '../logger';

const OVERRIDE_EXECUTION_PROMPT = `
You are a financial factsheet data processing agent.
You are given a target field, its currently computed value, and a strict rule/logic override provided by the user.

Target Field: {{FIELD_ID}}
Current Generated Value: {{CURRENT_VALUE}}
Override Logic/Instruction: "{{INSTRUCTION}}"
Available Component Data (JSON): {{RELATED_DATA}}

Calculate, reformat, or rewrite the value strictly according to the Override Logic, using the Current Generated Value and Available Component Data as your base point.

Rules:
1. Return ONLY the final transformed value as plain text. 
2. Do not include any explanation.
3. If it's a number/percentage, keep the standard financial formatting (e.g. "12.4%").
4. If it's rationale/text, return the exact rewritten paragraphs.
`;

export async function applyOverrides(
  data: ProcessedFactsheetData,
  overrides: LogicOverride[],
  settings: AISettings
): Promise<ProcessedFactsheetData> {
  if (!settings.apiKey || overrides.length === 0) return data;

  logger.info('ai', `Executing ${overrides.length} saved AI logic overrides...`);

  const updatedData = { ...data };
  if (data.performanceMetrics) updatedData.performanceMetrics = { ...data.performanceMetrics };
  if (data.performanceMetricsSp500) updatedData.performanceMetricsSp500 = { ...data.performanceMetricsSp500 };

  // Helper to deep get/set object properties based on fieldId
  const getFieldValue = (fieldId: string): string => {
    // 1. Check Standard Metrics
    if (fieldId === 'cipres_1y') return data.performanceMetrics.oneYear || '';
    if (fieldId === 'cipres_3y') return data.performanceMetrics.threeYear || '';
    if (fieldId === 'cipres_5y') return data.performanceMetrics.fiveYear || '';
    if (fieldId === 'cipres_incept') return data.performanceMetrics.inception || '';
    if (fieldId === 'cipres_cagr') return data.performanceMetrics.cagr || '';
    if (fieldId === 'cipres_sharpe') return data.performanceMetrics.sharpe || '';
    if (fieldId === 'sp500_1y') return data.performanceMetricsSp500.oneYear || '';
    if (fieldId === 'sp500_cagr') return data.performanceMetricsSp500.cagr || '';
    if (fieldId === 'sp500_sharpe') return data.performanceMetricsSp500.sharpe || '';

    // 2. Extract from Performance Table HTML (for YTD and Monthly)
    if (fieldId.startsWith('ytd_') || fieldId.startsWith('monthly_')) {
      const regex = new RegExp(`data-field-id="${fieldId}"[^>]*>([^<]+)</(?:span|td)>`);
      const match = data.performanceTable.match(regex);
      if (match && match[1]) return match[1];
    }

    return '';
  };

  const updateTableHtmlWithValue = (html: string, fieldId: string, newValue: string): string => {
    // Update data-value attribute
    let updatedHtml = html.replace(
      new RegExp(`(data-field-id="${fieldId}"[^>]*data-value=")([^"]+)(")`, 'g'),
      `$1${newValue}$3`
    );
    // Update inner text
    updatedHtml = updatedHtml.replace(
      new RegExp(`(data-field-id="${fieldId}"[^>]*>)([^<]+)(</(?:span|td)>)`, 'g'),
      `$1${newValue}$3`
    );
    return updatedHtml;
  };

  const updateTableHtmlWithLogic = (html: string, fieldId: string, newLogicLabel: string): string => {
    const regex = new RegExp(`(data-field-id="${fieldId}"[^>]*data-detail=")([^"]+)(")`, 'g');
    return html.replace(regex, `$1${newLogicLabel}$3`);
  };

  const tasks = overrides.map(async (override) => {
    // 1. Handle Direct Data Overwrites (Static Review)
    if (override.actionType === 'MODIFY_DATA' && override.newText) {
      const val = override.newText;
      
      // Handle monthly return pattern: monthly_2024_Jan
      if (override.fieldId.startsWith('monthly_') && updatedData.performanceHistory) {
         const parts = override.fieldId.split('_');
         if (parts.length === 3) {
           const [_, year, month] = parts;
           if (!updatedData.performanceHistory.monthly[year]) {
             updatedData.performanceHistory.monthly[year] = {};
           }
           updatedData.performanceHistory.monthly[year][month] = val;
           updatedData.performanceTable = updateTableHtmlWithValue(updatedData.performanceTable, override.fieldId, val);
           logger.success('system', `Applied static override to Monthly Return [${year} ${month}]: ${val}`);
           return;
         }
      }

      // Handle YTD pattern: ytd_2024
      if (override.fieldId.startsWith('ytd_')) {
        updatedData.performanceTable = updateTableHtmlWithValue(updatedData.performanceTable, override.fieldId, val);
        logger.success('system', `Applied static override to YTD [${override.fieldId}]: ${val}`);
        return;
      }

      // Handle standard performance metrics
      if (override.fieldId === 'cipres_1y') updatedData.performanceMetrics.oneYear = val;
      else if (override.fieldId === 'cipres_3y') updatedData.performanceMetrics.threeYear = val;
      else if (override.fieldId === 'cipres_5y') updatedData.performanceMetrics.fiveYear = val;
      else if (override.fieldId === 'cipres_incept') updatedData.performanceMetrics.inception = val;
      else if (override.fieldId === 'cipres_cagr') updatedData.performanceMetrics.cagr = val;
      else if (override.fieldId === 'cipres_sharpe') updatedData.performanceMetrics.sharpe = val;
      else if (override.fieldId === 'sp500_1y') updatedData.performanceMetricsSp500.oneYear = val;
      else if (override.fieldId === 'sp500_cagr') updatedData.performanceMetricsSp500.cagr = val;
      else if (override.fieldId === 'sp500_sharpe') updatedData.performanceMetricsSp500.sharpe = val;
      
      logger.success('system', `Applied static override to ${override.fieldId}: ${val}`);
      return;
    }

    // 2. Handle Logic/Rationale Overwrites (AI Assistant)
    try {
      const targetValue = getFieldValue(override.fieldId);
      if (!targetValue && !override.fieldId.startsWith('ytd_')) {
        logger.warn('ai', `No base value found for override target: ${override.fieldId}`);
      }

        const prompt = OVERRIDE_EXECUTION_PROMPT
        .replace('{{FIELD_ID}}', override.fieldId)
        .replace('{{CURRENT_VALUE}}', targetValue || 'Unknown')
        .replace('{{INSTRUCTION}}', override.newLogic || override.newText || override.correctionPrompt)
        .replace('{{RELATED_DATA}}', override.relatedDataJson || 'None');

      const response = await AIService.call(prompt, settings);
      const correctedValue = response.trim();

      // Apply the corrected value back
      if (override.fieldId === 'cipres_1y') updatedData.performanceMetrics.oneYear = correctedValue;
      else if (override.fieldId === 'cipres_3y') updatedData.performanceMetrics.threeYear = correctedValue;
      else if (override.fieldId === 'cipres_5y') updatedData.performanceMetrics.fiveYear = correctedValue;
      else if (override.fieldId === 'cipres_incept') updatedData.performanceMetrics.inception = correctedValue;
      else if (override.fieldId === 'cipres_cagr') updatedData.performanceMetrics.cagr = correctedValue;
      else if (override.fieldId === 'cipres_sharpe') updatedData.performanceMetrics.sharpe = correctedValue;
      else if (override.fieldId === 'sp500_1y') updatedData.performanceMetricsSp500.oneYear = correctedValue;
      else if (override.fieldId === 'sp500_cagr') updatedData.performanceMetricsSp500.cagr = correctedValue;
      else if (override.fieldId === 'sp500_sharpe') updatedData.performanceMetricsSp500.sharpe = correctedValue;
      else if (override.fieldId.startsWith('ytd_') || override.fieldId.startsWith('monthly_')) {
        updatedData.performanceTable = updateTableHtmlWithValue(updatedData.performanceTable, override.fieldId, correctedValue);
        if (override.newLogic) {
          updatedData.performanceTable = updateTableHtmlWithLogic(updatedData.performanceTable, override.fieldId, override.newLogic);
        }
      }

      logger.success('ai', `Applied logic override to ${override.fieldId}: ${targetValue} -> ${correctedValue}`);
    } catch (err: any) {
      logger.error('ai', `Failed to apply override for ${override.fieldId}: ${err.message}`);
    }
  });

  await Promise.all(tasks);

  return updatedData;
}
