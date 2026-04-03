import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu } from 'lucide-react';
import { LogEntry } from '../utils/logger';

interface ExecutionConsoleProps {
  isOpen: boolean;
  logs: LogEntry[];
  onClear: () => void;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({ isOpen, logs, onClear }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, height: 0 }}
          animate={{ opacity: 1, scale: 1, height: 'auto' }}
          exit={{ opacity: 0, scale: 0.98, height: 0 }}
          className="mt-6 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden"
        >
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">System Execution Console</span>
            </div>
            <button 
              onClick={onClear}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
            >
              CLEAR
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-3 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic">No system events recorded yet...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">[{log.timestamp}]</span>
                    <span className={`font-bold px-1.5 rounded text-[10px] ${
                      log.category === 'ai' ? 'bg-indigo-500/20 text-indigo-400' : 
                      log.category === 'import' ? 'bg-cyan-500/20 text-cyan-400' : 
                      log.category === 'calculation' ? 'bg-amber-500/20 text-amber-400' : 
                      log.category === 'parse' ? 'bg-lime-500/20 text-lime-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {log.category.toUpperCase()}
                    </span>
                    <span className={`font-bold ${
                      log.type === 'info' ? 'text-blue-400' : 
                      log.type === 'success' ? 'text-emerald-400' : 
                      log.type === 'warn' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {log.type.toUpperCase()}
                    </span>
                  </div>
                  <pre className={`whitespace-pre-wrap pl-4 border-l border-slate-800 ${
                    log.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {log.message}
                    {log.details && (
                      <div className="mt-1 text-slate-500 text-[10px]">
                        {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
                      </div>
                    )}
                  </pre>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
