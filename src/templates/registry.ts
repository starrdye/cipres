import { Template } from '../types/template';
import { SIMPLE_FACTSHEET_TEMPLATE } from './simpleTemplate';
import { STANDARD_FACTSHEET_TEMPLATE } from './factsheetTemplate';
import { DASHBOARD_TEMPLATE } from './dashboardTemplate';

export const TEMPLATE_REGISTRY: Template[] = [
  {
    id: 'cipres-analytics-dashboard',
    name: 'Business Intelligence Dashboard',
    description: 'Modern 2-page dashboard for company performance, project status, and regional distribution.',
    requiredInputs: ['mapping', 'report', 'ai_settings'],
    generateHtml: (data) => {
      let html = DASHBOARD_TEMPLATE;
      
      const wrapReview = (val: string, fieldId: string, desc: string, source: string = 'calculation', type: string = 'logic', related: string = '') => 
        `<span class="reviewable" data-source="${source}" data-field-id="${fieldId}" data-detail="${desc}" data-value="${val}" data-review-type="${type}" data-related='${related}'>${val}</span>`;

      const replacements: Record<string, string> = {
        '{{REPORT_PERIOD}}': data.reportDateFormatted,
        '{{PREVIOUS_SNAPSHOT}}': JSON.stringify(data.previousSnapshot || null),
        '{{HISTORICAL_RETURNS_TABLE}}': data.performanceTable,
        '{{PERF_LABELS}}': JSON.stringify(data.consolidatedCumulative.labels),
        '{{CIPRES_PERF}}': JSON.stringify(data.consolidatedCumulative.cipres),
        '{{SP500_PERF}}': JSON.stringify(data.consolidatedCumulative.sp500),
        '{{THEME_LABELS}}': JSON.stringify(data.thematic.labels),
        '{{THEME_DATA}}': JSON.stringify(data.thematic.data),
        '{{GEO_LABELS}}': JSON.stringify(data.geographical.labels),
        '{{GEO_DATA}}': JSON.stringify(data.geographical.data),
        '{{MARKET_CAP_LABELS}}': JSON.stringify(data.marketCapBuckets?.map(b => b.label) || ['<2b', '2-10b', '>10b']),
        '{{MARKET_CAP_DATA}}': JSON.stringify(data.marketCapBuckets?.map(b => b.percent) || [40, 35, 25]),
        '{{LIQUIDITY_LABELS}}': JSON.stringify(data.customData?.liquidity.labels || ['0-10', '11-30']),
        '{{LIQUIDITY_DATA}}': JSON.stringify(data.customData?.liquidity.data || [80, 20]),
        '{{CIPRES_1Y}}': wrapReview(data.performanceMetrics.oneYear, 'cipres_1y', 'Annualized Return (1 Year)', 'calculation', 'logic', JSON.stringify(data.performanceMetadata?.oneYear || [])),
        '{{CIPRES_3Y}}': wrapReview(data.performanceMetrics.threeYear, 'cipres_3y', 'Annualized Return (3 Years)', 'calculation', 'logic', JSON.stringify(data.performanceMetadata?.threeYear || [])),
        '{{CIPRES_5Y}}': wrapReview(data.performanceMetrics.fiveYear, 'cipres_5y', 'Annualized Return (5 Years)', 'calculation', 'logic', JSON.stringify(data.performanceMetadata?.fiveYear || [])),
        '{{CIPRES_INCEPT}}': wrapReview(data.performanceMetrics.inception, 'cipres_incept', 'Cumulative Return since Inception', 'calculation', 'logic', JSON.stringify(data.performanceMetadata?.inception || [])),
        '{{CIPRES_CAGR}}': wrapReview(data.performanceMetrics.cagr, 'cipres_cagr', 'Compound Annual Growth Rate', 'calculation', 'logic', JSON.stringify(data.performanceMetadata?.cagr || [])),
        '{{CIPRES_SHARPE}}': wrapReview(data.performanceMetrics.sharpe, 'cipres_sharpe', 'Risk-adjusted return vs Risk-Free Rate', 'calculation', 'logic', JSON.stringify(data.performanceMetadata?.sharpe || [])),
        '{{SP500_1Y}}': wrapReview(data.performanceMetricsSp500.oneYear, 'sp500_1y', 'Annualized Return (1 Year)', 'calculation', 'logic', JSON.stringify(data.performanceMetadataSp500?.oneYear || [])),
        '{{SP500_3Y}}': wrapReview(data.performanceMetricsSp500.threeYear, 'sp500_3y', 'Annualized Return (3 Years)', 'calculation', 'logic', JSON.stringify(data.performanceMetadataSp500?.threeYear || [])),
        '{{SP500_5Y}}': wrapReview(data.performanceMetricsSp500.fiveYear, 'sp500_5y', 'Annualized Return (5 Years)', 'calculation', 'logic', JSON.stringify(data.performanceMetadataSp500?.fiveYear || [])),
        '{{SP500_INCEPT}}': wrapReview(data.performanceMetricsSp500.inception, 'sp500_incept', 'Cumulative Return since Inception', 'calculation', 'logic', JSON.stringify(data.performanceMetadataSp500?.inception || [])),
        '{{SP500_CAGR}}': wrapReview(data.performanceMetricsSp500.cagr, 'sp500_cagr', 'Compound Annual Growth Rate', 'calculation', 'logic', JSON.stringify(data.performanceMetadataSp500?.cagr || [])),
        '{{SP500_SHARPE}}': wrapReview(data.performanceMetricsSp500.sharpe, 'sp500_sharpe', 'Risk-adjusted return vs Risk-Free Rate', 'calculation', 'logic', JSON.stringify(data.performanceMetadataSp500?.sharpe || [])),
        '{{L1M_SP500}}': data.performanceMetricsSp500.oneMonth || '-'
      };

      for (const [key, value] of Object.entries(replacements)) {
        html = html.replace(new RegExp(key, 'g'), String(value));
      }
      return html;
    },
    dataTables: [
      {
        id: 'historicalData',
        title: 'Historical Performance',
        description: 'Cumulative return series used for the performance charts and metrics calculations.',
        type: 'series',
        defaultData: {
          labels: ['Jan-23', 'Feb-23', 'Mar-23', 'Apr-23', 'May-23', 'Jun-23', 'Jul-23', 'Aug-23', 'Sep-23', 'Oct-23', 'Nov-23', 'Dec-23', 'Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25'],
          cipres: [1.0, 1.05, 1.08, 1.12, 1.15, 1.22, 1.28, 1.35, 1.42, 1.50, 1.58, 1.65, 1.72, 1.80, 1.88, 1.95, 2.05, 2.15, 2.25, 2.35, 2.45, 2.55, 2.65, 2.75, 2.85, 3.0, 3.15],
          sp500: [1.0, 1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.16, 1.18, 1.20, 1.22, 1.24, 1.26, 1.28, 1.30, 1.32, 1.34, 1.36, 1.38, 1.40, 1.42, 1.44, 1.46, 1.48, 1.50, 1.52]
        }
      },
      {
        id: 'monthlyReturns',
        title: 'Operational Productivity (%)',
        description: 'Raw percentage growth for the operations performance grid.',
        type: 'series',
        defaultData: {
          labels: ['Jan-24', 'Feb-24', 'Mar-24'],
          cipres: [2.5, 3.8, 4.2],
          sp500: [1.2, 1.8, 0.5]
        }
      },
      {
        id: 'marketCap',
        title: 'Departmental Distribution (%)',
        description: 'Configure departmental resource allocation.',
        type: 'keyValue',
        defaultData: { labels: ['Operations', 'R&D', 'Marketing', 'Infrastructure'], data: [40, 25, 20, 15] }
      },
      {
        id: 'liquidity',
        title: 'Days to Liquidate (%)',
        description: 'Configure liquidity distribution percentages.',
        type: 'keyValue',
        defaultData: { labels: ['0-10', '11-30'], data: [80, 20] }
      }
    ]
  },
  {
    id: 'simple-summary',
    name: 'Simple Summary',
    description: 'A minimal one-page summary highlighting key performance and exposure metrics.',
    requiredInputs: ['report'],
    generateHtml: (data) => {
      const topTheme = data.customData?.simpleSummary.themeOverride || 
        (data.thematic.labels.length > 0 ? `${data.thematic.labels[0]} (${data.thematic.data[0]}%)` : 'N/A');
        
      const navText = data.customData?.simpleSummary.navOverride || `$${data.nav.toLocaleString()}`;
      
      const commentary = (data.customData?.simpleSummary.commentary || '')
        .replace(/{{REPORT_PERIOD}}/g, data.reportDateFormatted);

      return SIMPLE_FACTSHEET_TEMPLATE
        .replace(/{{REPORT_PERIOD}}/g, data.reportDateFormatted)
        .replace(/{{NAV}}/g, navText)
        .replace(/{{TOP_THEME}}/g, topTheme)
        .replace(/{{COMMENTARY}}/g, commentary);
    },
    dataTables: [
      {
        id: 'simpleSummary',
        title: 'Summary Overrides',
        description: 'Provide manual text overrides to the standard AI ingestion logic.',
        type: 'form',
        fields: [
          { id: 'navOverride', label: 'NAV Override', type: 'string', placeholder: 'e.g. $12,345,678' },
          { id: 'themeOverride', label: 'Primary Theme Override', type: 'string', placeholder: 'e.g. Precious Metals (45%)' },
          { id: 'commentary', label: 'Strategy Snapshot Paragraph', type: 'text', lines: 4 }
        ],
        defaultData: {
          navOverride: '', 
          themeOverride: '', 
          commentary: 'The fund maintains a disciplined approach to thematic investing. In {{REPORT_PERIOD}}, the portfolio remained focused on core conviction areas, ensuring balanced exposure across key geographies while optimizing for risk-adjusted returns.'
        }
      }
    ]
  }
];

export const getTemplate = (id: string) => TEMPLATE_REGISTRY.find(t => t.id === id) || TEMPLATE_REGISTRY[0];
