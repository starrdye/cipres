import { AIService } from '../../lib/ai';
import { SecurityResult, AISettings } from '../../types/factsheet';
import { robustJsonParse } from './jsonUtils';

const THEME_CLASSIFICATION_PROMPT = `
You are a financial analyst. Classify these stock tickers into allowed categories.

Allowed Categories:
- Precious Metals
- Clean Energy
- Critical Minerals
- Nuclear Energy
- Energy Infrastructure
- Agriculture
- Cash
- Hedges

Tickers: {{TICKERS}}

Return ONLY a valid JSON object. No preamble.
Example: {"GLD": "Precious Metals", "CCJ": "Nuclear Energy"}
`;

export async function classifyUnknownTickers(
  results: SecurityResult[], 
  settings: AISettings
): Promise<SecurityResult[]> {
  const unknownTickers = results
    .filter(r => r.theme === 'Unknown' && r.symbol !== 'Total')
    .map(r => r.symbol);

  if (unknownTickers.length === 0) return results;

  try {
    const prompt = THEME_CLASSIFICATION_PROMPT.replace('{{TICKERS}}', unknownTickers.join(', '));
    const response = await AIService.call(prompt, settings);
    const classifications = robustJsonParse<Record<string, string>>(response);

    return results.map(r => {
      if (r.theme === 'Unknown' && classifications[r.symbol]) {
        return { ...r, theme: classifications[r.symbol] };
      }
      return r;
    });
  } catch (error) {
    console.error("AI Theme Classification failed:", error);
    return results;
  }
}
