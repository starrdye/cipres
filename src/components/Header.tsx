import React from 'react';
import { FileText, Settings } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500 rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
            Cipres Analytics
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Business Intelligence Dashboard
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onSettingsClick}
          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
          title="AI Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-slate-600 tracking-tight">V1.2 LIVE</span>
        </div>
      </div>
    </div>
  );
};
