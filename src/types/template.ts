import { FactsheetSnapshot, CumulativeSeries, PerformanceMetricMetadata } from './factsheet';

export type InputRequirement = 'mapping' | 'report' | 'performance_text' | 'ai_settings';

export interface TemplateData {
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
  previousSnapshot: FactsheetSnapshot | null;
  exposureDeltas?: { label: string; delta: number }[];
  marketCapBuckets?: { label: string; percent: number }[];
  customData?: Record<string, any>;
}

export type DataTableType = 'series' | 'keyValue' | 'form';

export interface DataField {
  id: string;
  label: string;
  type: 'string' | 'number' | 'text';
  placeholder?: string;
  lines?: number;
}

export interface DataTableSchema {
  id: string;
  title: string;
  description: string;
  type: DataTableType;
  fields?: DataField[]; // Used for form types
  defaultData: any;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  requiredInputs: InputRequirement[];
  dataTables?: DataTableSchema[];
  generateHtml: (data: TemplateData) => string;
}
