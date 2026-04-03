import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TEMPLATE_REGISTRY } from '../templates/registry';
import { DataTableSchema } from '../types/template';
import { CustomDataStore } from '../hooks/useCustomData';

interface DataEditorProps {
  selectedTemplateId: string;
  store: CustomDataStore;
  updateTableData: (templateId: string, tableId: string, newData: any) => void;
}

export const DataEditor: React.FC<DataEditorProps> = ({ 
  selectedTemplateId, 
  store, 
  updateTableData
}) => {
  const activeTemplate = TEMPLATE_REGISTRY.find(t => t.id === selectedTemplateId);
  const dataTables = activeTemplate?.dataTables || [];
  
  const [selectedTableId, setSelectedTableId] = useState(dataTables[0]?.id || '');

  useEffect(() => {
    if (dataTables.length > 0 && !dataTables.find(dt => dt.id === selectedTableId)) {
      setSelectedTableId(dataTables[0].id);
    }
  }, [selectedTemplateId, dataTables, selectedTableId]);

  if (dataTables.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        This template does not require any custom data tables.
      </div>
    );
  }

  const activeSchema = dataTables.find(dt => dt.id === selectedTableId) || dataTables[0];
  const tableData = store[selectedTemplateId]?.[activeSchema.id] || activeSchema.defaultData;

  const handleSeriesUpdate = (index: number, field: string, value: string | number) => {
    const newData = { ...tableData };
    const newArray = [...newData[field]];
    newArray[index] = value;
    newData[field] = newArray;
    updateTableData(selectedTemplateId, activeSchema.id, newData);
  };

  const addSeriesRow = () => {
    const newData = { ...tableData };
    newData.labels = [...newData.labels, 'New'];
    newData.cipres = [...newData.cipres, newData.cipres[newData.cipres.length - 1] || 1.0];
    newData.sp500 = [...newData.sp500, newData.sp500[newData.sp500.length - 1] || 1.0];
    updateTableData(selectedTemplateId, activeSchema.id, newData);
  };

  const removeSeriesRow = (index: number) => {
    const newData = { ...tableData };
    newData.labels = newData.labels.filter((_: any, i: number) => i !== index);
    newData.cipres = newData.cipres.filter((_: any, i: number) => i !== index);
    newData.sp500 = newData.sp500.filter((_: any, i: number) => i !== index);
    updateTableData(selectedTemplateId, activeSchema.id, newData);
  };

  const renderSeriesEditor = () => (
    <section className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{activeSchema.title}</h3>
          <p className="text-sm text-slate-500">{activeSchema.description}</p>
        </div>
        <button 
          onClick={addSeriesRow} 
          className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4"/> Add Row
        </button>
      </div>
      <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px]">
        <table className="w-full text-left bg-white relative">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-sm font-semibold text-slate-600">Label (Period)</th>
              <th className="p-3 text-sm font-semibold text-slate-600">Cipres (Value 1)</th>
              <th className="p-3 text-sm font-semibold text-slate-600">S&P 500 (Value 2)</th>
              <th className="p-3 text-sm font-semibold text-slate-600 text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.labels?.map((label: string, i: number) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="p-2">
                  <input
                    type="text"
                    value={label}
                    onChange={e => handleSeriesUpdate(i, 'labels', e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none text-sm"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.01"
                    value={tableData.cipres[i] ?? ''}
                    onChange={e => handleSeriesUpdate(i, 'cipres', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none text-sm"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.01"
                    value={tableData.sp500[i] ?? ''}
                    onChange={e => handleSeriesUpdate(i, 'sp500', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none text-sm"
                  />
                </td>
                <td className="p-2 text-center">
                  <button 
                    onClick={() => removeSeriesRow(i)} 
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderKeyValueEditor = () => (
    <section className="space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">{activeSchema.title}</h3>
        <p className="text-sm text-slate-500">{activeSchema.description}</p>
      </div>
      <table className="w-full text-left bg-white border border-slate-200 rounded-xl overflow-hidden max-w-2xl">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-3 text-sm font-semibold text-slate-600">Key (Label)</th>
            <th className="p-3 text-sm font-semibold text-slate-600">Value (Data)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tableData.labels?.map((label: string, i: number) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="p-2">
                <input 
                  type="text" 
                  value={label} 
                  onChange={e => handleSeriesUpdate(i, 'labels', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none text-sm"
                />
              </td>
              <td className="p-2">
                <input 
                  type="number" 
                  value={tableData.data[i] ?? 0} 
                  onChange={e => handleSeriesUpdate(i, 'data', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-200 rounded focus:border-emerald-500 outline-none text-sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  const handleFormUpdate = (fieldId: string, value: string) => {
    updateTableData(selectedTemplateId, activeSchema.id, {
      ...tableData,
      [fieldId]: value
    });
  };

  const renderFormEditor = () => (
    <section className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">{activeSchema.title}</h3>
        <p className="text-sm text-slate-500">{activeSchema.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeSchema.fields?.map(field => (
          <div key={field.id} className={`space-y-2 ${field.type === 'text' ? 'md:col-span-2' : ''}`}>
            <label className="block text-sm font-semibold text-slate-700">{field.label}</label>
            {field.type === 'text' ? (
              <textarea
                rows={field.lines || 3}
                placeholder={field.placeholder}
                value={tableData[field.id] || ''}
                onChange={e => handleFormUpdate(field.id, e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-slate-700 text-sm"
              />
            ) : (
              <input
                type="text"
                placeholder={field.placeholder}
                value={tableData[field.id] || ''}
                onChange={e => handleFormUpdate(field.id, e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-slate-700 text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label className="font-bold text-slate-700 whitespace-nowrap">Edit Data Table:</label>
        <select 
          value={selectedTableId} 
          onChange={e => setSelectedTableId(e.target.value)}
          className="w-full max-w-md p-2.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-slate-800"
        >
          {dataTables.map(dt => (
            <option key={dt.id} value={dt.id}>{dt.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 border border-slate-100">
        {activeSchema.type === 'series' && renderSeriesEditor()}
        {activeSchema.type === 'keyValue' && renderKeyValueEditor()}
        {activeSchema.type === 'form' && renderFormEditor()}
      </div>
    </div>
  );
};
