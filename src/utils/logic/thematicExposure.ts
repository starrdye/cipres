import { SecurityResult } from '../../types/factsheet';

export function calculateThematicExposure(results: SecurityResult[], navValue: number) {
  const thematicMap: Record<string, number> = {};
  results.forEach(res => {
    if (res.theme === 'Hedges') return;
    thematicMap[res.theme] = (thematicMap[res.theme] || 0) + res.valueUsd;
  });

  const finalThemes = Object.entries(thematicMap).map(([label, val]) => ({
    label,
    percent: navValue > 0 ? (val / navValue) * 100 : 0
  }));

  const cashTheme = finalThemes.find(t => t.label === 'Cash');
  const cashPercent = cashTheme ? cashTheme.percent : 0;

  const sortedThemes = finalThemes.sort((a, b) => b.percent - a.percent);
  
  return {
    labels: sortedThemes.map(t => t.label),
    data: sortedThemes.map(t => parseFloat(t.percent.toFixed(1))),
    cashPercent
  };
}
