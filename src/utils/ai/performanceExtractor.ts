import { AIService } from '../../lib/ai';
import { AISettings, MonthlyReturns } from '../../types/factsheet';
import { robustJsonParse } from './jsonUtils';

export interface PerformanceExtractedData {
  labels: string[];
  cipresSeries: number[];
  sp500Series: number[];
  monthlyReturns: MonthlyReturns;
}

const PERFORMANCE_EXTRACTION_PROMPT = `
You are a financial data specialist. Extract historical performance data for "Cipres" and "S&P 500".

Input Text:
{{INPUT_TEXT}}

Target Format:
Return ONLY a valid JSON object. No preamble, no explanation.
{
  "labels": ["Jan 24", "Feb 24", ...],
  "cipresSeries": [1.02, 1.05, ...],
  "sp500Series": [1.01, 1.03, ...],
  "monthlyReturns": {
     "2024": {"Jan": "2.4%", "Feb": "-1.2%"},
     "2025": {"Jan": "0.5%"}
  }
}

Rules:
1. "cipresSeries" and "sp500Series" must be cumulative values starting from 1.0.
2. If only monthly returns are available, calculate the cumulative series.
3. "monthlyReturns" should contain percentage strings for Cipres only.
4. Return ONLY the JSON. Do not include markdown code blocks.
`;

export async function extractPerformanceData(
  rawText: string, 
  settings: AISettings
): Promise<PerformanceExtractedData | null> {
  if (!rawText.trim()) return null;

  try {
    const prompt = PERFORMANCE_EXTRACTION_PROMPT.replace('{{INPUT_TEXT}}', rawText);
    const response = await AIService.call(prompt, settings);
    return robustJsonParse<PerformanceExtractedData>(response);
  } catch (error: any) {
    console.error("AI Performance Extraction failed:", error);
    // Provide a more descriptive error for the UI
    throw new Error(`AI Extraction Error: ${error.message}. Please check your input format or API settings.`);
  }
}
