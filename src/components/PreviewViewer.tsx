import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Info, Zap, Calculator, Database } from 'lucide-react';
import { TraceSource, ReviewType } from '../types/factsheet';

interface PreviewViewerProps {
  generatedHtml: string | null;
  onDownload: () => void;
  onReviewRequested?: (fieldId: string, value: string, source: string, detail: string, reviewType: ReviewType, relatedData?: string) => void;
}

interface HoverState {
  source: TraceSource;
  detail: string;
  value: string;
  fieldId: string;
  reviewType: ReviewType;
  relatedData?: string;
  rect: { top: number, left: number, right: number, bottom: number };
}

export const PreviewViewer: React.FC<PreviewViewerProps> = ({ generatedHtml, onDownload, onReviewRequested }) => {
  const [hoverData, setHoverData] = useState<HoverState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || !e.data.type) return;
      
      if (e.data.type === 'HOVER_REVIEWABLE') {
        setHoverData(e.data as HoverState);
      } else if (e.data.type === 'LEAVE_REVIEWABLE') {
        setHoverData(null);
      } else if (e.data.type === 'CLICK_REVIEWABLE') {
        const { fieldId, value, source, detail, reviewType, relatedData } = e.data;
        if (onReviewRequested) {
          onReviewRequested(fieldId, value, source, detail, reviewType, relatedData);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onReviewRequested]);

  const getSourceIcon = (source: TraceSource) => {
    switch (source) {
      case 'datasource': return <Database className="w-4 h-4 text-blue-500" />;
      case 'calculation': return <Calculator className="w-4 h-4 text-emerald-500" />;
      case 'ai_extraction': return <Zap className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSourceColor = (source: TraceSource) => {
    switch (source) {
      case 'datasource': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'calculation': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'ai_extraction': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <AnimatePresence>
      {generatedHtml && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white shadow-2xl rounded-2xl overflow-visible border border-slate-200 relative"
        >
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center z-10 relative rounded-t-2xl">
            <h2 className="text-lg font-bold text-slate-800">Factsheet Preview</h2>
            <div className="flex gap-4">
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1">
                 Hover numbers to see Data Provenance
              </span>
              <button
                onClick={onDownload}
                className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 hover:text-emerald-700 hover:border-emerald-500 font-bold text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF/HTML
              </button>
            </div>
          </div>
          <div ref={containerRef} className="w-full h-[800px] bg-slate-200 overflow-auto p-4 flex justify-center relative">
            <iframe
              title="Factsheet Preview"
              srcDoc={generatedHtml}
              className="w-[210mm] h-[297mm] bg-white shadow-lg border-none relative z-0"
              style={{ transform: 'scale(0.9)', transformOrigin: 'top center' }}
            />
            
            {/* The Floating Review Panel */}
            <AnimatePresence>
              {hoverData && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="fixed pointer-events-none z-50 bottom-8 right-8"
                >
                  <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-white/50 p-5 w-80">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Value</p>
                        <p className="text-2xl font-black text-slate-800">{hoverData.value}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${getSourceColor(hoverData.source)}`}>
                        {getSourceIcon(hoverData.source)}
                        <span className="text-[10px] font-bold uppercase tracking-wide">{hoverData.source}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                      <p className="text-xs font-bold text-slate-500 mb-1">Logic / Details</p>
                      <p className="text-sm font-medium text-slate-700 font-mono text-[11px] leading-relaxed">
                        {hoverData.detail || 'Standard Extraction'}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] font-bold text-emerald-600 animate-pulse flex items-center justify-center gap-1">
                        {hoverData.reviewType === 'statistic' ? (
                          <>
                            <Database className="w-3 h-3" /> Click to Edit Value Directly
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" /> Click to Correct via AI
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

