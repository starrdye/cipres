import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Save, X, Lightbulb } from 'lucide-react';
import { AISettings, LogicOverride } from '../types/factsheet';
import { saveOverride, getAllOverrides } from '../lib/db';
import { logger } from '../utils/logger';

interface AICorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldId: string;
  currentValue: string;
  source: string;
  detail: string;
  relatedData?: string;
  settings: AISettings;
}

export const AICorrectionModal: React.FC<AICorrectionModalProps> = ({
  isOpen,
  onClose,
  fieldId,
  currentValue,
  source,
  detail,
  relatedData,
  settings
}) => {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [existingOverride, setExistingOverride] = useState<LogicOverride | null>(null);
  
  const relatedObj = relatedData ? JSON.parse(relatedData) : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (isOpen) {
      const fetchExisting = async () => {
        const all = await getAllOverrides();
        const found = all.find(o => o.fieldId === fieldId);
        if (found) setExistingOverride(found);
      };
      fetchExisting();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fieldId, onClose]);

  const handleCorrect = async () => {
    if (!instruction.trim()) return;
    
    if (!settings.apiKey) {
      logger.error('ai', 'API Key is missing. Please configure it in AI Settings.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const { routeAction } = await import('../utils/ai/actionRouter');
      const actionResult = await routeAction(
        instruction,
        fieldId,
        currentValue,
        source,
        detail,
        settings
      );
      
      const override: LogicOverride = {
        fieldId,
        originalLogic: detail,
        correctionPrompt: instruction,
        provider: settings.provider,
        timestamp: new Date().toISOString(),
        actionType: actionResult.action,
        newLogic: actionResult.newLogic,
        newText: actionResult.newText,
        dataParams: actionResult.params,
        calculationProcess: actionResult.calculationProcess,
        relatedFields: actionResult.relatedFields,
        relatedDataJson: relatedData
      };
      
      await saveOverride(override);
      logger.success('ai', `Rule generated: [${actionResult.action}] for ${fieldId}`);
      onClose();
    } catch (err: any) {
      logger.error('ai', `Failed to generate override: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-emerald-900">AI Logic Correction</h2>
              </div>
              <button onClick={onClose} className="text-emerald-700/50 hover:text-emerald-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Field</span>
                  <span className="text-sm font-bold text-slate-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{fieldId}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Value</span>
                  <span className="text-lg font-black text-slate-800">{currentValue}</span>
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Current Logic</span>
                  <span className="text-xs text-slate-600 font-mono leading-relaxed bg-white p-2 rounded border border-slate-200">{detail || 'Standard Extraction'}</span>
                </div>

                {relatedData && (
                   <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex flex-col gap-1.5 mt-2">
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">AI Calculation Insight</span>
                       {existingOverride?.relatedFields && (
                         <div className="flex gap-1">
                           {existingOverride.relatedFields.map(f => (
                             <span key={f} className="text-[8px] bg-amber-200/50 px-1.5 py-0.5 rounded text-amber-800 font-bold">{f}</span>
                           ))}
                         </div>
                       )}
                     </div>
                     <p className="text-xs text-amber-900 leading-relaxed font-medium">
                       {existingOverride?.calculationProcess || "Components involved in the current calculation are listed below."}
                     </p>
                   </div>
                )}

                {relatedObj && (
                  <div className="border-t border-slate-200 mt-2 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 block">Formula Lineage (Related Values)</span>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <table className="w-full text-[10px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-3 py-2 text-left font-black text-slate-400 uppercase tracking-tighter">Dataset</th>
                            <th className="px-3 py-2 text-left font-black text-slate-400 uppercase tracking-tighter">Entity</th>
                            <th className="px-3 py-2 text-right font-black text-slate-400 uppercase tracking-tighter">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Array.isArray(relatedObj) ? (
                            relatedObj.map((item: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-3 py-2 text-slate-500 font-medium">{item.dataset || 'Calculation'}</td>
                                <td className="px-3 py-2 text-slate-700 font-bold">{item.entity || item.label}</td>
                                <td className="px-3 py-2 text-right font-black text-blue-600">{item.value}</td>
                              </tr>
                            ))
                          ) : (
                            Object.entries(relatedObj).map(([key, val]: [string, any]) => (
                              <tr key={key} className="hover:bg-slate-50 transition-colors">
                                <td className="px-3 py-2 text-slate-500 font-medium">Calculation</td>
                                <td className="px-3 py-2 text-slate-700 font-bold">{key}</td>
                                <td className="px-3 py-2 text-right font-black text-blue-600">{String(val)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  How should this be calculated?
                </label>
                <textarea 
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g., 'The return should use a compound formula: product of (1+r) - 1 instead of simple sum.'"
                  className="w-full p-3 h-28 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none text-sm placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleCorrect}
                  disabled={isProcessing || !instruction.trim()}
                  className="w-full py-3.5 bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Rule...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Override to IndexedDB
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 font-bold mt-3">
                  Powered by {settings.provider === 'doubao' ? 'Doubao (Ark)' : settings.provider === 'gemini' ? 'Google Gemini' : 'Anthropic Claude'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
