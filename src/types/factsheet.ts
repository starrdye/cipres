export type AIProvider = 'gemini' | 'claude' | 'doubao' | 'doubao-coding';

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: 'gemini-1.5-pro',
  claude: 'claude-3-5-sonnet-20240620',
  doubao: 'doubao-pro-4k',
  'doubao-coding': 'doubao-seed-2.0-lite',
};

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  financialAssumptions?: {
    riskFreeRate: number;
  };
}

export interface SecurityMapping {
  theme: string;
  geography: string;
}

export interface SecurityResult {
  symbol: string;
  theme: string;
  geography: string;
  valueUsd: number;
}

export interface MonthlyReturns {
  [year: string]: {
    [month: string]: string;
  };
}

export interface CumulativeSeries {
  labels: string[];
  cipres: number[];
  sp500: number[];
}

export interface FactsheetSnapshot {
  reportDate: string; // YYYY-MM
  thematic: {
    labels: string[];
    data: number[];
    cashPercent?: number;
  };
  geographical: {
    labels: string[];
    data: number[];
  };
  nav: number;
  performanceHistory?: {
    monthly: MonthlyReturns;
    cumulative: CumulativeSeries;
  };
}

export interface AILogEntry {
  timestamp: string;
  type: 'req' | 'res' | 'err';
  content: string;
}

export interface PerformanceMetricMetadata {
  [key: string]: {
    startValue?: number;
    endValue?: number;
    annReturn?: number;
    volatility?: number;
    rfRate?: number;
    periodMonths?: number;
    components?: { label: string; value: string }[];
  };
}

export interface ProcessedFactsheetData {
  reportDate: string;
  reportDateFormatted: string;
  nav: number;
  thematic: { labels: string[], data: number[], cashPercent: number };
  geographical: { labels: string[], data: number[] };
  performanceTable: string;
  consolidatedCumulative: CumulativeSeries;
  performanceMetrics: Record<string, string>;
  performanceMetricsSp500: Record<string, string>;
  performanceMetadata?: PerformanceMetricMetadata;
  performanceMetadataSp500?: PerformanceMetricMetadata;
  performanceHistory?: {
    monthly: MonthlyReturns;
    cumulative: CumulativeSeries;
  };
  previousSnapshot: FactsheetSnapshot | null;
  exposureDeltas?: { label: string; delta: number }[];
  marketCapBuckets?: { label: string; percent: number }[];
  customData?: Record<string, any>;
  warnings?: DataWarning[];
}

export interface DataWarning {
  section: 'Performance' | 'Positioning' | 'Exposure' | 'General';
  message: string;
}

export interface MappingSheet {
  name: string;
  data: any[][];
}

export type TraceSource = 'datasource' | 'calculation' | 'ai_extraction' | 'template_default' | 'user_override';
export type ReviewType = 'statistic' | 'logic';

export interface TraceableValue<T> {
  value: T;
  source: TraceSource;
  reviewType: ReviewType;
  detail?: string; // Formula, cell reference, or AI prompt
  relatedData?: any; // Component values (logics) or source row (statistics)
}

export interface LogicOverride {
  fieldId: string;
  originalLogic: string;
  correctionPrompt: string;
  provider: AIProvider;
  timestamp: string;
  actionType?: 'MODIFY_DATA' | 'MODIFY_LOGIC' | 'MODIFY_RATIONALE';
  newLogic?: string;
  newText?: string;
  dataParams?: any;
  calculationProcess?: string;
  relatedFields?: string[];
  relatedDataJson?: string;
}

export interface FactsheetSession {
  id: string;             // Typically Report Date (YYYY-MM) or UID
  timestamp: string;      
  templateId: string;
  
  // Raw Inputs (to reconstruct the generation)
  inputs: {
    mappingData: any[] | null;   // Raw JSON from XLSX Mapping
    reportData: any[] | null;    // Raw JSON from XLSX Report
    perfRawData: string;  // Raw text pasted by user
  };
  
  // Custom Overrides (Data Tab state)
  customData: Record<string, any>;
  
  // Processed Results (For quick preview)
  processed: ProcessedFactsheetData;
}
