import { SecurityResult } from '../../types/factsheet';

export function calculateGeographicalExposure(results: SecurityResult[], navValue: number, cashPercent: number) {
  const geoMap: Record<string, number> = {};
  results.forEach(res => {
    if (res.theme === 'Hedges' || res.theme === 'Cash') return;
    geoMap[res.geography] = (geoMap[res.geography] || 0) + res.valueUsd;
  });

  const geos = Object.entries(geoMap).map(([label, val]) => ({
    label,
    percent: navValue > 0 ? (val / navValue) * 100 : 0
  }));

  geos.push({ label: 'Cash', percent: cashPercent });

  const sortedGeos = geos.sort((a, b) => b.percent - a.percent);
  
  return {
    labels: sortedGeos.map(g => g.label),
    data: sortedGeos.map(g => parseFloat(g.percent.toFixed(1)))
  };
}
