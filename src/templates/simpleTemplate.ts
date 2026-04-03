export const SIMPLE_FACTSHEET_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fund Summary - {{REPORT_PERIOD}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2563eb;
            --secondary: #64748b;
            --accent: #f59e0b;
            --bg: #f8fafc;
            --card-bg: #ffffff;
        }
        body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
            padding: 60px; 
            color: #1e293b; 
            background: var(--bg);
            line-height: 1.6;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: var(--card-bg);
            padding: 50px;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.8);
        }
        .header { 
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f1f5f9;
        }
        .brand h1 { 
            margin: 0; 
            font-size: 2.5rem; 
            font-weight: 800;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.025em;
        }
        .period {
            color: var(--secondary);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 0.875rem;
        }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 30px;
            margin-bottom: 40px;
        }
        .card { 
            background: #ffffff;
            padding: 30px; 
            border-radius: 20px;
            border: 1px solid #f1f5f9;
            transition: transform 0.2s ease;
        }
        .card:hover { transform: translateY(-4px); }
        .card h2 { 
            font-size: 1rem; 
            color: var(--secondary); 
            margin: 0 0 10px 0;
            font-weight: 600;
        }
        .metric { 
            font-size: 2.5rem; 
            font-weight: 800; 
            color: #1e293b;
            letter-spacing: -0.05em;
        }
        .highlight { color: var(--primary); }
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #f1f5f9;
            color: var(--secondary);
            font-size: 0.875rem;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            margin-bottom: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="brand">
                <span class="period">{{REPORT_PERIOD}}</span>
                <h1>Cipres Summary</h1>
            </div>
            <div style="text-align: right">
                <div class="badge">PRIVATE & CONFIDENTIAL</div>
            </div>
        </div>
        
        <div class="grid">
            <div class="card">
                <div class="badge">AUM METRIC</div>
                <h2>Net Asset Value (NAV)</h2>
                <div class="metric highlight">{{NAV}}</div>
            </div>
            <div class="card">
                <div class="badge">CONCENTRATION</div>
                <h2>Primary Theme</h2>
                <div class="metric">{{TOP_THEME}}</div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 0;">
            <h2>Strategy Snapshot</h2>
            <p style="font-size: 1.1rem; color: #475569;">
                {{COMMENTARY}}
            </p>
        </div>

        <div class="footer">
            <p>© 2026 Ternary Capital Management. All rights reserved. For professional investors only.</p>
        </div>
    </div>
</body>
</html>
`;
