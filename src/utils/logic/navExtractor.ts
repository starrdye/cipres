export function extractNav(mappingData: any[]): number {
  let navValue = 10000000.0; // Default
  try {
    const navSheet = mappingData.find((s: any) => s.name.toLowerCase() === 'nav');
    if (navSheet) {
      const navRows = navSheet.data;
      if (navRows.length > 0) {
        const headers = navRows[0].map((h: any) => String(h).toLowerCase());
        const valIdx = headers.indexOf('value');
        const navIdx = headers.indexOf('nav');
        
        if (valIdx > -1 && navRows[1] && navRows[1][valIdx]) {
          navValue = parseFloat(navRows[1][valIdx]);
        } else if (navIdx > -1 && navRows[1] && navRows[1][navIdx]) {
          navValue = parseFloat(navRows[1][navIdx]);
        } else {
          // Fallback: look for any large number
          for (let i = 0; i < navRows.length; i++) {
            for (let j = 0; j < navRows[i].length; j++) {
              const v = parseFloat(navRows[i][j]);
              if (!isNaN(v) && v > 100000) {
                navValue = v;
                break;
              }
            }
            if (navValue !== 10000000.0) break;
          }
        }
      }
    }
  } catch (e) {
    console.warn("NAV retrieval failed, using default", e);
  }
  return navValue;
}
