import { SecurityMapping, SecurityResult } from '../../types/factsheet';

export function parsePositionReport(
  reportData: any[], 
  themeMapping: Record<string, SecurityMapping>
): SecurityResult[] {
  const results: SecurityResult[] = [];
  let inOpenSection = false;
  let csvHeaders: string[] = [];

  reportData.forEach((row: any) => {
    const section = String(row[0] || '');
    const type = String(row[1] || '');

    if (section === 'Open Position Summary' && type === 'Header') {
      inOpenSection = true;
      csvHeaders = row.map((h: any) => String(h).trim());
      return;
    }

    if (inOpenSection) {
      if (type === 'Data') {
        const data: Record<string, any> = {};
        csvHeaders.forEach((h, i) => { data[h] = row[i]; });

        const symbol = String(data['Symbol'] || '').trim();
        if (!symbol || symbol === 'Total') return;

        const valueFcy = parseFloat(String(data['Value'] || '0').replace(/,/g, ''));
        const fxRate = parseFloat(String(data['FXRateToBase'] || '1').replace(/,/g, ''));
        const valueUsd = isNaN(valueFcy) || isNaN(fxRate) ? 0 : valueFcy * fxRate;

        const mapping = themeMapping[symbol] || { theme: 'Unknown', geography: 'Unknown' };
        
        let theme = mapping.theme;
        // Cash detection logic
        if (data['Sector'] === 'Cash' || isCashSymbol(symbol)) {
          theme = 'Cash';
        }

        results.push({
          symbol,
          theme,
          geography: mapping.geography,
          valueUsd
        });
      } else if (type === 'Total' || (section !== 'Open Position Summary' && section !== '')) {
        if (section !== 'Open Position Summary' && section !== '') {
          inOpenSection = false;
        }
      }
    }
  });

  return results;
}

function isCashSymbol(symbol: string): boolean {
  const cashSymbols = ['USD', 'AUD', 'CAD', 'EUR', 'GBP', 'HKD', 'JPY', 'NOK', 'SEK', 'SGD'];
  return cashSymbols.includes(symbol);
}
