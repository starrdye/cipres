import { useState } from 'react';
import { TEMPLATE_REGISTRY } from '../templates/registry';

export type CustomDataStore = Record<string, Record<string, any>>;

export function useCustomData() {
  const [store, setStore] = useState<CustomDataStore>(() => {
    const initialStore: CustomDataStore = {};
    
    // Seed the store with defaultData from every template's dataTables
    TEMPLATE_REGISTRY.forEach(t => {
      initialStore[t.id] = {};
      t.dataTables?.forEach(dt => {
        initialStore[t.id][dt.id] = dt.defaultData;
      });
    });
    
    return initialStore;
  });

  const updateTableData = (templateId: string, tableId: string, newData: any) => {
    setStore(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [tableId]: newData
      }
    }));
  };

  const updateTemplateStore = (templateId: string, newStore: Record<string, any>) => {
    setStore(prev => ({
      ...prev,
      [templateId]: newStore
    }));
  };

  return { store, updateTableData, updateTemplateStore };
}
