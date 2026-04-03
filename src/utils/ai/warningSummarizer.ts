import { AIService } from '../../lib/ai';
import { AISettings, DataWarning } from '../../types/factsheet';
import { logger } from '../logger';

const WARNING_SUMMARIZER_PROMPT = `
You are a financial factsheet auditor. 
Below are several data gaps and warnings extracted from a factsheet generation session. 
Your task is to summarize these into professional, user-friendly warnings for a "Data Health" dashboard.

### Raw Data Gaps:
{{FINDINGS}}

### Instructions:
1. For each finding, rephrase it as a helpful explanation of what is missing and why it's a gap (e.g., "5-Year benchmark returns cannot be calculated as only 12 months of NAV history is available.")
2. Categorize each summarized warning into one of: "Performance", "Positioning", "Exposure", or "General".
3. Return the response in a structured JSON format: 
   { "warnings": [ { "section": "Performance", "message": "Example summarized message" } ] }
4. Ensure the tone is professional, concise, and helpful.
`;

export async function summarizeFactsheetWarnings(findings: string[], settings: AISettings): Promise<DataWarning[]> {
  if (findings.length === 0) return [];
  if (!settings.apiKey) {
    // Fallback: If no AI key, just map the raw findings directly
    return findings.map(f => {
      const section = f.split(':')[0] as any;
      const message = f.split(':').slice(1).join(':').trim();
      return { section: ['Performance', 'Positioning', 'Exposure'].includes(section) ? section : 'General', message };
    });
  }

  logger.info('ai', `Asking AI to summarize ${findings.length} data health findings...`);

  try {
    const prompt = WARNING_SUMMARIZER_PROMPT.replace('{{FINDINGS}}', findings.join('\n- '));
    const response = await AIService.call(prompt, settings);
    
    // Attempt to parse JSON from AI response
    try {
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      const jsonStr = response.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.warnings && Array.isArray(parsed.warnings)) {
        logger.success('ai', `Successfully summarized data health warnings.`);
        return parsed.warnings;
      }
    } catch (parseErr) {
      logger.error('ai', `Failed to parse AI response for warnings. Using fallback.`);
    }
  } catch (err: any) {
    logger.error('ai', `Failed to summarize warnings with AI: ${err.message}`);
  }

  // Fallback if AI fails or formatting is bad
  return findings.map(f => {
    const section = f.split(':')[0] as any;
    const message = f.split(':').slice(1).join(':').trim();
    return { section: ['Performance', 'Positioning', 'Exposure'].includes(section) ? section : 'General', message };
  });
}
