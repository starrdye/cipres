import React from 'react';
import { AlertCircle, TrendingUp, Briefcase, Globe, Info } from 'lucide-react';
import { DataWarning } from '../types/factsheet';
import { motion } from 'motion/react';

interface WarningSectionProps {
  warnings: DataWarning[];
}

export function WarningSection({ warnings }: WarningSectionProps) {
  if (!warnings || warnings.length === 0) return null;

  const getIcon = (section: string) => {
    switch (section) {
      case 'Performance': return <TrendingUp className="w-5 h-5" />;
      case 'Positioning': return <Briefcase className="w-5 h-5" />;
      case 'Exposure': return <Globe className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getColor = (section: string) => {
    switch (section) {
      case 'Performance': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Positioning': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Exposure': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Group warnings by section
  const grouped = warnings.reduce((acc, w) => {
    if (!acc[w.section]) acc[w.section] = [];
    acc[w.section].push(w.message);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 pb-4"
    >
      <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 text-amber-100 -rotate-12 translate-x-4 -translate-y-4">
          <AlertCircle className="w-24 h-24" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest leading-tight">Data Health Warning</h3>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">AI-Generated Contextual Insights</p>
            </div>
          </div>

          <div className="grid gap-4">
            {Object.entries(grouped).map(([section, messages]) => (
              <div 
                key={section}
                className={`p-4 rounded-2xl border ${getColor(section)} flex gap-4`}
              >
                <div className="mt-1">{getIcon(section)}</div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black uppercase tracking-widest opacity-70">{section}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {messages.map((m, i) => (
                      <li key={i} className="text-sm font-bold leading-relaxed">{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
