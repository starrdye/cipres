import { useState } from 'react';
import * as XLSX from 'xlsx';
import { MappingSheet } from '../types/factsheet';
import { logger } from '../utils/logger';

export function useFileProcessor() {
  const [mappingData, setMappingData] = useState<MappingSheet[] | null>(null);
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const handleFileUpload = (file: File, type: 'mapping' | 'report') => {
    return new Promise<void>((resolve, reject) => {
      logger.info('import', `Reading uploaded ${type} file: ${file.name} (${Math.round(file.size / 1024)}KB)`);
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          
          if (type === 'mapping') {
            const sheets = wb.SheetNames.map(name => ({
              name,
              data: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1 }) as any[][]
            }));
            setMappingData(sheets);
            logger.success('parse', `Successfully parsed mapping mapping file containing ${sheets.length} sheets.`);
          } else {
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            setReportData(data as any[]);
            logger.success('parse', `Successfully parsed position report containing ${(data as any[]).length} rows.`);
          }
          resolve();
        } catch (err: any) {
          logger.error('import', `Error parsing ${type} file. Format might be invalid.`, err.message);
          reject(new Error(`Error parsing ${type} file. Please check the format.`));
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  return {
    mappingData,
    reportData,
    reportDate,
    setReportDate,
    setMappingData,
    setReportData,
    handleFileUpload
  };
}
