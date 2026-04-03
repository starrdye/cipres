import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Cpu, RefreshCw, History } from 'lucide-react';

// Hooks
import { useAISettings } from './hooks/useAISettings';
import { useFileProcessor } from './hooks/useFileProcessor';
import { useCustomData } from './hooks/useCustomData';
import { useFactsheetGenerator } from './hooks/useFactsheetGenerator';
import { useSystemLogs } from './hooks/useSystemLogs';

// Components
import { Header } from './components/Header';
import { TemplateSelector } from './components/TemplateSelector';
import { AISettingsModal } from './components/AISettingsModal';
import { DataIngestionForm } from './components/DataIngestionForm';
import { StatusDisplay } from './components/StatusDisplay';
import { ExecutionConsole } from './components/ExecutionConsole';
import { PreviewViewer } from './components/PreviewViewer';
import { FooterInstructions } from './components/FooterInstructions';
import { AICorrectionModal } from './components/AICorrectionModal';
import { StatisticEditModal } from './components/StatisticEditModal';
import { DataEditor } from './components/DataEditor';
import { HistoryPanel } from './components/HistoryPanel';
import { WarningSection } from './components/WarningSection';
import { TEMPLATE_REGISTRY, getTemplate } from './templates/registry';
import { ReviewType } from './types/factsheet';
import { logger } from './utils/logger';

export default function App() {
  const [perfRawData, setPerfRawData] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATE_REGISTRY[0].id);
  const [activeTab, setActiveTab] = useState<'generator' | 'data' | 'history'>('generator');
  const [correctionData, setCorrectionData] = useState<{ 
    fieldId: string, 
    value: string, 
    source: string, 
    detail: string, 
    reviewType: ReviewType,
    relatedData?: string
  } | null>(null);
  
  const { store, updateTableData, updateTemplateStore } = useCustomData();
  const { logs: systemLogs, clearLogs } = useSystemLogs();
  
  const { 
    aiSettings, 
    showSettings, 
    setShowSettings, 
    updateProvider, 
    updateSettings 
  } = useAISettings();

  const {
    mappingData,
    reportData,
    reportDate,
    setReportDate,
    setMappingData,
    setReportData,
    handleFileUpload
  } = useFileProcessor();

  const {
    isProcessing,
    status,
    generatedHtml,
    warnings,
    showConsole,
    setShowConsole,
    generate,
    download
  } = useFactsheetGenerator();

  const handleRestore = (session: any) => {
    setMappingData(session.inputs.mappingData);
    setReportData(session.inputs.reportData);
    setPerfRawData(session.inputs.perfRawData);
    setReportDate(session.id);
    setSelectedTemplateId(session.templateId);
    updateTemplateStore(session.templateId, session.customData);
    setActiveTab('generator');
    logger.success('system', `Restored session from ${session.id} (${new Date(session.timestamp).toLocaleDateString()})`);
  };

  const selectedTemplate = getTemplate(selectedTemplateId);
  const needsMapping = selectedTemplate.requiredInputs.includes('mapping');
  const needsReport = selectedTemplate.requiredInputs.includes('report');
  const isGenerateDisabled = isProcessing || (needsMapping && !mappingData) || (needsReport && !reportData);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200"
        >
          <Header onSettingsClick={() => setShowSettings(true)} />

          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'generator' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Generator
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'data' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Analytics Data
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              History
            </button>
          </div>

          {activeTab === 'generator' ? (
            <>
              <TemplateSelector 
                selectedId={selectedTemplateId}
                onSelect={setSelectedTemplateId}
              />

              <AISettingsModal 
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                settings={aiSettings}
                onUpdateProvider={updateProvider}
                onUpdateSettings={updateSettings}
              />

              <DataIngestionForm 
                reportDate={reportDate}
                onDateChange={setReportDate}
                mappingData={mappingData}
                reportData={reportData}
                onFileUpload={handleFileUpload}
                perfRawData={perfRawData}
                onPerfDataChange={setPerfRawData}
                requiredInputs={selectedTemplate.requiredInputs}
              />

              <div className="px-8 pb-8 space-y-6">
                <StatusDisplay status={status} />

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => generate(
                      mappingData, 
                      reportData, 
                      reportDate, 
                      aiSettings, 
                      perfRawData, 
                      selectedTemplateId, 
                      store[selectedTemplateId] || {},
                      (extracted) => {
                        // 1. Update Cumulative Series (Prices)
                        updateTableData(selectedTemplateId, 'historicalData', {
                          labels: extracted.labels,
                          cipres: extracted.cipresSeries,
                          sp500: extracted.sp500Series
                        });

                        // 2. Update Monthly Returns (Percentages)
                        const flattenedLabels: string[] = [];
                        const flattenedCipres: number[] = [];
                        const flattenedSp500: number[] = [];

                        Object.keys(extracted.monthlyReturns).sort().forEach(year => {
                          const months = extracted.monthlyReturns[year];
                          Object.entries(months).forEach(([month, val]) => {
                            const label = `${month}-${year.slice(-2)}`;
                            flattenedLabels.push(label);
                            flattenedCipres.push(parseFloat(String(val).replace('%', '')) || 0);
                            
                            // Calculate Benchmark Return from series
                            const currentIdx = extracted.labels.indexOf(label);
                            if (currentIdx > 0) {
                              const currentVal = extracted.sp500Series[currentIdx];
                              const prevVal = extracted.sp500Series[currentIdx - 1];
                              const ret = ((currentVal / prevVal) - 1) * 100;
                              flattenedSp500.push(parseFloat(ret.toFixed(2)));
                            } else {
                              flattenedSp500.push(0);
                            }
                          });
                        });

                        updateTableData(selectedTemplateId, 'monthlyReturns', {
                          labels: flattenedLabels,
                          cipres: flattenedCipres,
                          sp500: flattenedSp500
                        });
                      }
                    )}
                    disabled={isGenerateDisabled}
                    className="flex-[2] flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Terminal className="w-6 h-6" />
                        Generate Insights
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => generate(
                      mappingData, 
                      reportData, 
                      reportDate, 
                      aiSettings, 
                      perfRawData, 
                      selectedTemplateId, 
                      store[selectedTemplateId] || {},
                      (extracted) => {
                        // 1. Update Cumulative Series (Prices)
                        updateTableData(selectedTemplateId, 'historicalData', {
                          labels: extracted.labels,
                          cipres: extracted.cipresSeries,
                          sp500: extracted.sp500Series
                        });

                        // 2. Update Monthly Returns (Percentages)
                        const flattenedLabels: string[] = [];
                        const flattenedCipres: number[] = [];
                        const flattenedSp500: number[] = [];

                        Object.keys(extracted.monthlyReturns).sort().forEach(year => {
                          const months = extracted.monthlyReturns[year];
                          Object.entries(months).forEach(([month, val]) => {
                            const label = `${month}-${year.slice(-2)}`;
                            flattenedLabels.push(label);
                            flattenedCipres.push(parseFloat(String(val).replace('%', '')) || 0);
                            
                            // Calculate Benchmark Return from series
                            const currentIdx = extracted.labels.indexOf(label);
                            if (currentIdx > 0) {
                              const currentVal = extracted.sp500Series[currentIdx];
                              const prevVal = extracted.sp500Series[currentIdx - 1];
                              const ret = ((currentVal / prevVal) - 1) * 100;
                              flattenedSp500.push(parseFloat(ret.toFixed(2)));
                            } else {
                              flattenedSp500.push(0);
                            }
                          });
                        });

                        updateTableData(selectedTemplateId, 'monthlyReturns', {
                          labels: flattenedLabels,
                          cipres: flattenedCipres,
                          sp500: flattenedSp500
                        });
                      }
                    )}
                    disabled={isGenerateDisabled}
                    title="Refresh and re-calculate all fields"
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
                  >
                    {isProcessing ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Refresh
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowConsole(!showConsole)}
                    className={`py-4 px-6 border-2 font-bold rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${showConsole ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Cpu className="w-5 h-5" />
                    Console {systemLogs.length > 0 && `(${systemLogs.length})`}
                  </button>

                  {generatedHtml && (
                    <button
                      onClick={download}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg active:scale-[0.98]"
                    >
                      <Terminal className="w-6 h-6" />
                      Export Dashboard (HTML)
                    </button>
                  )}
                </div>

                {generatedHtml && warnings.length > 0 && (
                  <WarningSection warnings={warnings} />
                )}
              </div>
            </>
          ) : activeTab === 'data' ? (
            <DataEditor 
              selectedTemplateId={selectedTemplateId}
              store={store}
              updateTableData={updateTableData}
            />
          ) : (
            <HistoryPanel onRestore={handleRestore} />
          )}

          <FooterInstructions />
        </motion.div>

        <ExecutionConsole 
          isOpen={showConsole}
          logs={systemLogs}
          onClear={clearLogs}
        />

        <PreviewViewer 
          generatedHtml={generatedHtml}
          onDownload={download}
          onReviewRequested={(fieldId, value, source, detail, reviewType, relatedData) => 
            setCorrectionData({ fieldId, value, source, detail, reviewType, relatedData })}
        />

        {correctionData && correctionData.reviewType === 'logic' && (
          <AICorrectionModal
            isOpen={!!correctionData}
            onClose={() => setCorrectionData(null)}
            fieldId={correctionData.fieldId}
            currentValue={correctionData.value}
            source={correctionData.source}
            detail={correctionData.detail}
            relatedData={correctionData.relatedData}
            settings={aiSettings}
          />
        )}

        {correctionData && correctionData.reviewType === 'statistic' && (
          <StatisticEditModal
            isOpen={!!correctionData}
            onClose={() => setCorrectionData(null)}
            fieldId={correctionData.fieldId}
            currentValue={correctionData.value}
            source={correctionData.source}
            detail={correctionData.detail}
            relatedData={correctionData.relatedData}
          />
        )}
      </div>
    </div>
  );
}
