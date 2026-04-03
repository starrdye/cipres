import React, { useEffect, useState } from 'react';
import { Clock, RotateCcw, Trash2, Calendar, FileText, ChevronRight } from 'lucide-react';
import { getAllSessions, deleteSession } from '../lib/db';
import { FactsheetSession } from '../types/factsheet';
import { logger } from '../utils/logger';

interface HistoryPanelProps {
  onRestore: (session: FactsheetSession) => void;
}

export function HistoryPanel({ onRestore }: HistoryPanelProps) {
  const [sessions, setSessions] = useState<FactsheetSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const all = await getAllSessions();
      // Sort by timestamp descending
      setSessions(all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    } catch (err) {
      logger.error('system', 'Failed to load session history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await deleteSession(id);
      logger.success('system', `Session ${id} deleted.`);
      loadSessions();
    } catch (err) {
      logger.error('system', 'Failed to delete session');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400">
        <RotateCcw className="w-8 h-8 animate-spin" />
        <p className="text-sm font-bold">Loading session history...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Clock className="w-12 h-12 opacity-20" />
        <p className="text-sm font-bold">No saved sessions yet.</p>
        <p className="text-xs text-center max-w-xs">Generate a factsheet to automatically create a persistent snapshot of your workspace.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Generation History
        </h3>
        <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
          {sessions.length} Snapshots
        </span>
      </div>

      <div className="grid gap-3">
        {sessions.map((session) => (
          <div 
            key={session.id + session.timestamp}
            className="group relative bg-white border border-slate-200 rounded-2xl p-4 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onRestore(session)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 tracking-tight">{session.id}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {new Date(session.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleDelete(e, session.id)}
                  className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                  title="Delete Snapshot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 flex items-center justify-center text-emerald-500">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-500">
                <FileText className="w-3 h-3" />
                {session.templateId.replace(/-/g, ' ')}
              </span>
              {(session.inputs.mappingData || session.inputs.reportData) && (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                  {session.inputs.mappingData ? 'Mapping' : ''}
                  {session.inputs.mappingData && session.inputs.reportData ? ' + ' : ''}
                  {session.inputs.reportData ? 'Report' : ''}
                </span>
              )}
              {session.inputs.perfRawData && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">AI Performance</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-[10px] text-center text-slate-400 font-bold mt-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        Loading a historical session will overwrite your current workspace with the data used during that specific generation.
      </p>
    </div>
  );
}
