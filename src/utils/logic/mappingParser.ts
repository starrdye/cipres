import { SecurityMapping } from '../../types/factsheet';

export function parseSecurityMappings(mappingData: any[]): Record<string, SecurityMapping> {
  const themeMapping: Record<string, SecurityMapping> = {};
  try {
    const themeSheet = mappingData.find((s: any) => 
      s.name.toLowerCase() === 'sheet' || s.name.toLowerCase() === 'theme'
    );
    
    if (themeSheet) {
      const rows = themeSheet.data;
      if (rows.length > 0) {
        let headerRowIdx = 0;
        let headers: string[] = [];
        
        // Find header row
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i].map((h: any) => String(h || '').toLowerCase());
          if (row.includes('stock') || row.includes('symbol')) {
            headerRowIdx = i;
            headers = row;
            break;
          }
        }

        if (headers.length === 0) headers = rows[0].map((h: any) => String(h || '').toLowerCase());

        const stockIdx = headers.indexOf('stock');
        const symbolIdx = headers.indexOf('symbol');
        // The 'Stock' column contains descriptions; the ticker symbol is one column before it (index 0)
        const sIdx = symbolIdx > -1 ? symbolIdx : (stockIdx > 0 ? stockIdx - 1 : 0);
        const tIdx = headers.indexOf('theme') > -1 ? headers.indexOf('theme') : 3;
        const gIdx = headers.indexOf('location') > -1 ? headers.indexOf('location') : (headers.indexOf('geography') > -1 ? headers.indexOf('geography') : 4);

        rows.forEach((row: any, idx: number) => {
          if (idx <= headerRowIdx) return;
          const sym = String(row[sIdx] || '').trim();
          if (sym) {
            themeMapping[sym] = {
              theme: String(row[tIdx] || 'Unknown').trim(),
              geography: String(row[gIdx] || 'Unknown').trim()
            };
          }
        });
      }
    }
  } catch (e) {
    console.error("Theme mapping failed", e);
  }
  return themeMapping;
}
