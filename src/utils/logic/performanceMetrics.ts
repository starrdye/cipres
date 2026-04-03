export function calculatePerformanceMetrics(series: number[], riskFreeRate: number = 0): { metrics: Record<string, string>, metadata: Record<string, any> } {
  if (!series || series.length === 0) {
    return {
      metrics: {
        oneYear: '-',
        threeYear: '-',
        fiveYear: '-',
        inception: '-',
        cagr: '-',
        sharpe: '-',
        volatility: '-'
      },
      metadata: {}
    };
  }

  const latest = series[series.length - 1];
  const n = series.length;
  const metadata: Record<string, any> = {};

  const getReturn = (periodMonths: number, field: string) => {
    if (n <= periodMonths) return '-';
    const valAtStart = series[n - 1 - periodMonths];
    if (!valAtStart) return '-';
    metadata[field] = [
      { dataset: 'Historical Performance', entity: 'Start Value (NAV)', value: valAtStart.toFixed(4) },
      { dataset: 'Historical Performance', entity: 'End Value (NAV)', value: latest.toFixed(4) }
    ];
    return ((latest / valAtStart) - 1).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 });
  };

  const inceptionReturnNum = (latest / series[0]) - 1;
  const inceptionReturn = inceptionReturnNum.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 });
  metadata['inception'] = [
    { dataset: 'Historical Performance', entity: 'Start Value (NAV)', value: series[0].toFixed(4) },
    { dataset: 'Historical Performance', entity: 'End Value (NAV)', value: latest.toFixed(4) }
  ];

  const totalMonths = n - 1;
  let cagr = '-';
  if (totalMonths > 0) {
    const years = totalMonths / 12;
    const cagrNum = Math.pow(latest / series[0], 1 / years) - 1;
    cagr = cagrNum.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 });
    metadata['cagr'] = [
       { dataset: 'Historical Performance', entity: 'Period (Years)', value: years.toFixed(2) },
       { dataset: 'Historical Performance', entity: 'Cumulative Growth', value: inceptionReturn }
    ];
  }

  const monthlyReturns: number[] = [];
  for (let i = 1; i < series.length; i++) {
    monthlyReturns.push((series[i] / series[i - 1]) - 1);
  }

  let sharpe = '-';
  let volatility = '-';
  if (monthlyReturns.length > 1) {
    const mean = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length;
    const variance = monthlyReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (monthlyReturns.length - 1);
    const stdDev = Math.sqrt(variance);
    const annualVolatility = stdDev * Math.sqrt(12);

    volatility = annualVolatility.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1 });

    if (stdDev > 0) {
      const annualizedReturn = mean * 12;
      const rfDec = riskFreeRate / 100;
      const sharpeNum = (annualizedReturn - rfDec) / annualVolatility;
      sharpe = sharpeNum.toFixed(2);
      metadata['sharpe'] = [
        { dataset: 'Risk Assumptions', entity: 'Annualized Return', value: (annualizedReturn * 100).toFixed(2) + '%' },
        { dataset: 'Risk Assumptions', entity: 'Annual Volatility', value: (annualVolatility * 100).toFixed(2) + '%' },
        { dataset: 'Risk Assumptions', entity: 'Risk-Free Rate', value: riskFreeRate + '%' }
      ];
    }
  }

  return {
    metrics: {
      oneYear: getReturn(12, 'oneYear'),
      threeYear: getReturn(36, 'threeYear'),
      fiveYear: getReturn(60, 'fiveYear'),
      inception: inceptionReturn,
      cagr: cagr,
      sharpe: sharpe,
      volatility: volatility
    },
    metadata
  };
}

