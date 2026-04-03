import React from 'react';
import { Layout, ChevronDown } from 'lucide-react';
import { TEMPLATE_REGISTRY } from '../templates/registry';

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  const selectedTemplate = TEMPLATE_REGISTRY.find(t => t.id === selectedId) || TEMPLATE_REGISTRY[0];

  return (
    <div className="px-8 pt-8 pb-4">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Layout className="w-4 h-4" />
        Step 1: Choose Template
      </h3>
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-4 pr-12 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer transition-all"
        >
          {TEMPLATE_REGISTRY.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500 px-1 leading-relaxed">
        {selectedTemplate.description}
      </p>
    </div>
  );
}
