import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface StatusDisplayProps {
  status: { type: 'success' | 'error' | 'info', message: string } | null;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  return (
    <AnimatePresence mode="wait">
      {status && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`flex items-center gap-3 p-4 rounded-lg text-sm font-medium ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 
            status.type === 'error' ? 'bg-rose-50 text-rose-700' : 
            'bg-blue-50 text-blue-700'
          }`}
        >
          {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
           status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
           <Loader2 className="w-5 h-5 animate-spin" />}
          {status.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
