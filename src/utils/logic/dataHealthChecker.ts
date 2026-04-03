import { CumulativeSeries, DataWarning, ProcessedFactsheetData } from '../../types/factsheet';

/**
 * Rules-based engine to identify gaps and potential issues in the factsheet data.
 * Returns a list of "Raw Findings" that will be summarized by AI.
 */
export function checkFactsheetHealth(data: ProcessedFactsheetData): string[] {
  const findings: string[] = [];

  // 1. Performance Gaps
  const n = data.consolidatedCumulative.cipres.length;
  if (n < 12) {
    findings.push(`Performance: Portfolio has only ${n} months of history. 1Y, 3Y, and 5Y returns cannot be calculated.`);
  } else if (n < 36) {
    findings.push(`Performance: Portfolio has ${n} months of history. 3Y and 5Y returns cannot be calculated.`);
  } else if (n < 60) {
    findings.push(`Performance: Portfolio has ${n} months of history. 5Y returns cannot be calculated.`);
  }

  // Check for S&P 500 benchmark data gaps
  const sp500Len = data.consolidatedCumulative.sp500.filter(v => v !== 0).length;
  if (sp500Len < n) {
    findings.push(`Performance: Benchmark (S&P 500) data is missing for ${n - sp500Len} months.`);
  }

  // 2. Exposure & Positioning Gaps
  const totalThematic = data.thematic.data.reduce((a, b) => a + b, 0);
  const totalGeographical = data.geographical.data.reduce((a, b) => a + b, 0);

  if (Math.abs(totalThematic - 100) > 1) {
    findings.push(`Exposure: Thematic exposures sum to ${totalThematic.toFixed(1)}%, which deviates from the expected 100%.`);
  }

  if (Math.abs(totalGeographical - 100) > 5) { // More lenient for geo if cash/other is excluded
    findings.push(`Exposure: Geographical exposures sum to ${totalGeographical.toFixed(1)}%, which deviates significantly from 100%.`);
  }

  // Check for Unmapped Tickers/Themes
  const otherThemeIdx = data.thematic.labels.findIndex(l => l.toLowerCase() === 'other' || l.toLowerCase() === 'unmapped');
  if (otherThemeIdx >= 0) {
    const otherPercent = data.thematic.data[otherThemeIdx];
    if (otherPercent > 5) {
      findings.push(`Positioning: ${otherPercent.toFixed(1)}% of the portfolio is classified as 'Other' or 'Unmapped'.`);
    }
  }

  return findings;
}
