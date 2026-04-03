import { MonthlyReturns } from '../../types/factsheet';

export function generatePerformanceTableHtml(history: MonthlyReturns): string {
  const years = Object.keys(history).sort((a, b) => parseInt(a) - parseInt(b));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (years.length === 0) return '<p>No historical data available.</p>';

  let html = `
    <table class="table-returns">
      <tr>
        <th>Year</th>${months.map(m => `<th>${m}</th>`).join('')}<th>YTD</th>
      </tr>
  `;

  years.forEach(year => {
    let ytd = 1.0;
    let hasValidReturns = false;
    const components: { label: string, value: string }[] = [];
    const row = months.map((month, idx) => {
      const valStr = history[year][month];
      if (valStr) {
        const val = parseFloat(valStr.replace('%', ''));
        if (!isNaN(val)) {
          ytd *= (1 + val / 100);
          hasValidReturns = true;
          components.push({ label: month, value: valStr });
          const sourceInfo = JSON.stringify([
            { dataset: 'Historical Performance', entity: `${year} ${month}`, value: valStr }
          ]);
          return `<td class="reviewable" data-source="datasource" data-review-type="statistic" data-field-id="monthly_${year}_${month}" data-value="${valStr}" data-detail="Historical Monthly Return for ${month} ${year}" data-related='${sourceInfo}'>${valStr}</td>`;
        }
      }
      return '<td></td>';
    });

    const ytdVal = ((ytd - 1) * 100).toFixed(1) + '%';
    const relatedJson = JSON.stringify(components.map(c => ({ 
      dataset: 'Historical Performance', 
      entity: `${year} ${c.label}`, 
      value: c.value 
    })));
    const ytdStr = hasValidReturns 
      ? `<span class="reviewable" data-source="calculation" data-review-type="logic" data-field-id="ytd_${year}" data-value="${ytdVal}" data-detail="YTD = Product(1 + Monthly Returns) - 1" data-related='${relatedJson}'>${ytdVal}</span>` 
      : '';
    html += `<tr><td>${year}</td>${row.join('')}<td>${ytdStr}</td></tr>`;
  });

  html += '</table>';
  return html;
}
