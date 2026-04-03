import React from 'react';

export const FooterInstructions: React.FC = () => {
  return (
    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Instructions</h3>
      <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
        <li>Upload the <strong>Excel mapping file</strong> (Data_Preparation.xlsx).</li>
        <li>Upload the <strong>monthly IBKR CSV position report</strong>.</li>
        <li>The app will aggregate exposures and generate a preview below.</li>
      </ul>
    </div>
  );
};
