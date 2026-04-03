export const DASHBOARD_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Intelligence Dashboard - {{REPORT_PERIOD}}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary: #2563eb;
            --secondary: #64748b;
            --accent: #f59e0b;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --border: #e2e8f0;
        }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            background-color: #f1f5f9;
            padding: 40px;
        }
        .page {
            background: #fff;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 30px auto;
            padding: 20mm;
            box-sizing: border-box;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            page-break-after: always;
            border-radius: 8px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--border);
        }
        .header-title h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            color: #0f172a;
            letter-spacing: -0.025em;
        }
        .header-title p {
            margin: 4px 0 0;
            color: var(--secondary);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 10px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--border);
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 25px;
        }
        .card {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }
        .kpi-card {
            background: var(--bg);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }
        .kpi-label {
            font-size: 9px;
            font-weight: 600;
            color: var(--secondary);
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .kpi-value {
            font-size: 18px;
            font-weight: 800;
            color: var(--primary);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        th {
            text-align: left;
            padding: 10px;
            background: #f8fafc;
            border-bottom: 2px solid var(--border);
            color: #475569;
            font-weight: 700;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid var(--border);
        }
        .chart-container {
            height: 220px;
            position: relative;
        }
        .pie-chart-container {
            height: 300px;
            position: relative;
        }
        .footer {
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid var(--border);
            text-align: center;
            font-size: 9px;
            color: var(--secondary);
        }
        @media print {
            body { background: none; padding: 0; }
            .page { box-shadow: none; margin: 0; width: 100%; height: 100%; }
        }
        
        .reviewable {
            cursor: help;
            border-bottom: 1px dotted #2196F3;
            transition: background-color 0.2s;
            position: relative;
        }
        .reviewable:hover {
            background-color: rgba(33, 150, 243, 0.2);
        }
    </style>
    <script>
        document.addEventListener('mouseover', (e) => {
            const el = e.target.closest('.reviewable');
            if (el) {
                const rect = el.getBoundingClientRect();
                window.parent.postMessage({
                    type: 'HOVER_REVIEWABLE',
                    source: el.getAttribute('data-source'),
                    detail: el.getAttribute('data-detail'),
                    value: el.getAttribute('data-value'),
                    fieldId: el.getAttribute('data-field-id'),
                    reviewType: el.getAttribute('data-review-type') || 'logic',
                    relatedData: el.getAttribute('data-related'),
                    rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom }
                }, '*');
            }
        });

        document.addEventListener('mouseout', (e) => {
            const el = e.target.closest('.reviewable');
            if (el) {
                window.parent.postMessage({ type: 'LEAVE_REVIEWABLE' }, '*');
            }
        });

        document.addEventListener('click', (e) => {
            const el = e.target.closest('.reviewable');
            if (el) {
                window.parent.postMessage({
                    type: 'CLICK_REVIEWABLE',
                    source: el.getAttribute('data-source'),
                    detail: el.getAttribute('data-detail'),
                    value: el.getAttribute('data-value'),
                    fieldId: el.getAttribute('data-field-id'),
                    reviewType: el.getAttribute('data-review-type') || 'logic',
                    relatedData: el.getAttribute('data-related'),
                }, '*');
            }
        });
    </script>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="header-title">
                <h1>CIPRES ANALYTICS</h1>
                <p>Business Operations Report &bull; {{REPORT_PERIOD}}</p>
            </div>
            <div style="background: #0f172a; color: #fff; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 10px;">
                CONFIDENTIAL
            </div>
        </div>

        <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="card">
                <p style="font-size: 12px; color: #334155; margin: 0;">
                    Overall business performance for {{REPORT_PERIOD}} shows consistent growth in key operational segments. Our optimization strategies in core regions have yielded a composite efficiency increase of 12.4% year-over-year. Moving into the next quarter, we remain focused on resource allocation and regional expansion metrics.
                </p>
            </div>
        </div>

        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-label">Operational Index</div>
                <div class="kpi-value">{{CIPRES_1Y}}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Efficiency CAGR</div>
                <div class="kpi-value">{{CIPRES_CAGR}}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Risk Multiplier</div>
                <div class="kpi-value">{{CIPRES_SHARPE}}</div>
            </div>
        </div>

        <div class="grid-2">
            <div>
                <div class="section-title">Operational Productivity Growth</div>
                <div class="card">
                    <div class="chart-container">
                        <canvas id="growthChart"></canvas>
                    </div>
                </div>
            </div>
            <div>
                <div class="section-title">Key Projects</div>
                <div class="card" style="padding: 10px;">
                    <table>
                        <thead>
                            <tr><th>Segment</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Supply Chain</td><td style="color: #059669; font-weight: 700;">ON TRACK</td></tr>
                            <tr><td>Infrastructure</td><td style="color: #059669; font-weight: 700;">ON TRACK</td></tr>
                            <tr><td>Cloud Ops</td><td style="color: #d97706; font-weight: 700;">REVIEW</td></tr>
                            <tr><td>R&D Phase II</td><td style="color: #059669; font-weight: 700;">ON TRACK</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="footer">
            Generated by Cipres Business Intelligence Engine &bull; Internal Use Only
        </div>
    </div>

    <!-- PAGE 2 -->
    <div class="page">
        <div class="header">
            <div class="header-title">
                <h1>OPERATIONS BREAKDOWN</h1>
                <p>Regional & Departmental Distribution &bull; {{REPORT_PERIOD}}</p>
            </div>
        </div>

        <div class="grid-2">
            <div>
                <div class="section-title">Expense Distribution by Department</div>
                <div class="card">
                    <div class="pie-chart-container">
                        <canvas id="deptChart"></canvas>
                    </div>
                </div>
            </div>
            <div>
                <div class="section-title">Revenue by Region</div>
                <div class="card">
                    <div class="pie-chart-container">
                        <canvas id="regionChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <div class="section" style="margin-top: 30px;">
            <div class="section-title">Historical Operating Metrics</div>
            {{HISTORICAL_RETURNS_TABLE}}
        </div>

        <div class="footer">
            Generated by Cipres Business Intelligence Engine &bull; Internal Use Only
        </div>
    </div>

    <script>
        const setupChart = () => {
            // Growth Chart (Repurposing Performance line chart)
            new Chart(document.getElementById('growthChart'), {
                type: 'line',
                data: {
                    labels: {{PERF_LABELS}},
                    datasets: [{
                        label: 'Operational Productivity',
                        data: {{CIPRES_PERF}},
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { 
                            beginAtZero: false,
                            grid: { color: '#f1f5f9' },
                            ticks: { font: { size: 9 } }
                        },
                        x: { grid: { display: false }, ticks: { font: { size: 9 } } }
                    }
                }
            });

            // Department breakdown (Repurposing Thematic Pie)
            new Chart(document.getElementById('deptChart'), {
                type: 'doughnut',
                data: {
                    labels: {{THEME_LABELS}},
                    datasets: [{
                        data: {{THEME_DATA}},
                        backgroundColor: ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#16a34a', '#0891b2'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 9 } } }
                    },
                    cutout: '70%'
                }
            });

            // Regional breakdown (Repurposing Geographical Pie)
            new Chart(document.getElementById('regionChart'), {
                type: 'pie',
                data: {
                    labels: {{GEO_LABELS}},
                    datasets: [{
                        data: {{GEO_DATA}},
                        backgroundColor: ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 9 } } }
                    }
                }
            });
        };

        window.onload = setupChart;
    </script>
</body>
</html>
`;
