import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Save, X } from 'lucide-react';
import { LogicOverride } from '../types/factsheet';
import { saveOverride } from '../lib/db';
import { logger } from '../utils/logger';

interface StatisticEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldId: string;
  currentValue: string;
  source: string;
  detail: string;
  relatedData?: string;
}

export const StatisticEditModal: React.FC<StatisticEditModalProps> = ({
  isOpen,
  onClose,
  fieldId,
  currentValue,
  source,
  detail,
  relatedData
}) => {
  const [newValue, setNewValue] = useState(currentValue);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const relatedObj = relatedData ? JSON.parse(relatedData) : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (newValue === currentValue) {
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      const override: LogicOverride = {
        fieldId,
        originalLogic: detail,
        correctionPrompt: `Manual override to ${newValue}`,
        provider: 'doubao', // Default placeholder
        timestamp: new Date().toISOString(),
        actionType: 'MODIFY_DATA',
        newText: newValue
      };

      await saveOverride(override);
      logger.success('system', `Manual override saved for ${fieldId}: ${newValue}`);
      onClose();
    } catch (err: any) {
      logger.error('system', `Failed to save override: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Direct Data Override</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{fieldId}</p>
                </div>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-1">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Original Value</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-mono text-sm text-slate-400">
                    {currentValue}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">New Value</label>
                  <div className="relative">
                    <input
                      autoFocus
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold text-slate-800 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                      placeholder="Enter corrected value..."
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-[11px] font-bold text-blue-700 leading-relaxed">
                    This manual override will be saved persistently in IndexedDB and prioritized over the source data in all future generations.
                  </p>
                </div>

                {relatedObj && (
                  <div className="border-t border-slate-100 pt-6">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Historical Lineage (Source Context)</label>
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
                                <td className="px-3 py-2 text-right font-black text-emerald-600">{item.value}</td>
                              </tr>
                            ))
                          ) : (
                            Object.entries(relatedObj).map(([key, val]: [string, any]) => (
                               <tr key={key} className="hover:bg-slate-50 transition-colors">
                                <td className="px-3 py-2 text-slate-500 font-medium">{key}</td>
                                <td className="px-3 py-2 text-slate-700 font-bold">{val}</td>
                                <td className="px-3 py-2 text-right font-black text-emerald-600">-</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Override
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
