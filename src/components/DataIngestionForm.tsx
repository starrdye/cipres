import React from 'react';
import { Upload, Terminal } from 'lucide-react';
import { MappingSheet } from '../types/factsheet';
import { InputRequirement } from '../types/template';

interface DataIngestionFormProps {
  reportDate: string;
  onDateChange: (date: string) => void;
  mappingData: MappingSheet[] | null;
  reportData: any[] | null;
  onFileUpload: (file: File, type: 'mapping' | 'report') => void;
  perfRawData: string;
  onPerfDataChange: (data: string) => void;
  requiredInputs: InputRequirement[];
}

export const DataIngestionForm: React.FC<DataIngestionFormProps> = ({
  reportDate,
  onDateChange,
  mappingData,
  reportData,
  onFileUpload,
  perfRawData,
  onPerfDataChange,
  requiredInputs
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'mapping' | 'report') => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file, type);
  };

  const needsMapping = requiredInputs.includes('mapping');
  const needsReport = requiredInputs.includes('report');
  const needsPerformance = requiredInputs.includes('performance_text');

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Date */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Report Month</label>
          <input
            type="month"
            value={reportDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-600"
          />
        </div>

        {needsMapping && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Mapping File (Excel)</label>
            <div className="relative group">
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => handleFileChange(e, 'mapping')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 ${mappingData ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 group-hover:border-slate-300'}`}>
                <Upload className={`w-8 h-8 mb-2 ${mappingData ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-sm font-medium text-slate-600 text-center">
                  {mappingData ? 'Mapping Loaded' : 'Upload XLSX'}
                </span>
              </div>
            </div>
          </div>
        )}

        {needsReport && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Position Report (CSV)</label>
            <div className="relative group">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e, 'report')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 ${reportData ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 group-hover:border-slate-300'}`}>
                <Upload className={`w-8 h-8 mb-2 ${reportData ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-sm font-medium text-slate-600 text-center">
                  {reportData ? 'Report Loaded' : 'Upload CSV'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {needsPerformance && (
        <div className="space-y-3 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Terminal className="w-5 h-5 text-emerald-600" />
            <span>AI Data Ingestion: History & Benchmarks</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Paste raw performance data (e.g. "Jan +2%, Feb -1%...") or monthly returns for Cipres and S&P 500. 
            AI will extract it for the charts.
          </p>
          <textarea 
            value={perfRawData}
            onChange={(e) => onPerfDataChange(e.target.value)}
            placeholder="Jan 2024: Cipres 2.4%, SP500 1.2%..."
            className="w-full h-32 p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
};

