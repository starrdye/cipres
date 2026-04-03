import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Eye, Terminal, Save } from 'lucide-react';
import { AISettings, AIProvider, DEFAULT_MODELS } from '../types/factsheet';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onUpdateProvider: (provider: AIProvider) => void;
  onUpdateSettings: (updates: Partial<AISettings>) => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateProvider, 
  onUpdateSettings 
}) => {
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">AI Configuration</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Provider</label>
                <select 
                  value={settings.provider}
                  onChange={(e) => onUpdateProvider(e.target.value as AIProvider)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="claude">Anthropic Claude</option>
                  <option value="doubao">Doubao (Ark) - General</option>
                  <option value="doubao-coding">Doubao (Ark) - Coding</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">API Key</label>
                <div className="relative">
                  <input 
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => onUpdateSettings({ apiKey: e.target.value })}
                    placeholder={`Enter ${settings.provider} API key`}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none pr-10"
                  />
                  <Terminal className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">
                  * Keys are stored locally in your browser and never sent to our servers.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Model ID / Endpoint ID</label>
                <input 
                  type="text"
                  value={settings.model || ''}
                  onChange={(e) => onUpdateSettings({ model: e.target.value })}
                  placeholder={DEFAULT_MODELS[settings.provider]}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                {(settings.provider === 'doubao' || settings.provider === 'doubao-coding') && (
                  <p className="text-[10px] text-amber-600 font-medium">
                    * Doubao usually requires an <strong>Endpoint ID</strong> (e.g. ep-2024...) instead of a model name. 
                    {settings.provider === 'doubao-coding' && " For coding, use 'doubao-seed-2.0-lite' if available."}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Custom Base URL (Optional)</label>
                <input 
                  type="text"
                  value={settings.baseUrl || ''}
                  onChange={(e) => onUpdateSettings({ baseUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Financial Assumptions</h3>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Risk-Free Rate (%)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={settings.financialAssumptions?.riskFreeRate ?? 0}
                    onChange={(e) => onUpdateSettings({ financialAssumptions: { riskFreeRate: parseFloat(e.target.value) || 0 } })}
                    placeholder="e.g. 4.2"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    * Used for benchmark comparisons like the Sharpe Ratio.
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
