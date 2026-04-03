<div align="center">
  <img src="banner.svg" alt="Financial Statement Factsheet Automator" width="800">
</div>

# Cipres Factsheet Automator

A high-performance React application designed for Ternary Cypress Fund to automate the creation of professional financial factsheets. It processes client-side data (Excel mapping and IBKR CSV position reports) to generate high-quality, print-ready PDF-style factsheets with dynamic charts.

**Privacy-First Architecture:** The application **starts off entirely offline**, meaning all data processing and PDF-style preview generation happens locally in your browser. No sensitive financial data leaves your machine by default. Users can optionally enable advanced AI features by supplying their own API keys.

## Features

- **Automated Data Processing**: Effortlessly aggregate exposures from IBKR CSV reports using custom Excel mapping.
- **Dynamic Charting**: High-fidelity charts for Thematic Exposure, Geographical Exposure, Market Cap, and Liquidity metrics.
- **Multi-Template Support**: Dynamically handle different factsheet layouts and requirements, including custom 'Simple Summary' templates.
- **Persistent Data Layer (IndexedDB)**: 
  - **Historical Tracking**: Store previous months' returns and exposure data locally.
  - **Automatic Consolidation**: Automatically compare new monthly reports with previous data to calculate performance deltas and trends.
- **AI-Driven Data Ingestion (Optional)**:
  - Integrate carefully scoped Google Gemini AI prompts to transform unstructured inputs into structured factsheet elements.
  - Automatically summarize strategy overviews, map unknown tickers to themes, and highlight historical returns.
  - Schema-driven extraction ensures predictable JSON outputs mapped directly into factsheet templates.
- **Self-Correcting AI Dashboard (Dual-Wrapper Architecture)**:
  - **Interactive Review Panel**: Instant hover traceability into the PEDIGREE of every number (Datasource vs. Calculation vs. AI-generated). 
  - **Contextual Lineage**: Surfacing raw CSV sources and formula components within the review modal to ensure data auditability.
  - **Statistical Review (`review-type="statistic"`)**: Click on static numerical data points (e.g., monthly returns) to toggle **Direct Edit Mode**. Type manual overrides to instantly correct data via `MODIFY_DATA` actions.
  - **Logic & Rationale Review (`review-type="logic"`)**: For complex math or text commentary, click to prompt AI models (Doubao/Gemini) to rewrite rules on-the-fly via `MODIFY_LOGIC` or `MODIFY_RATIONALE` actions.

## 🌊 Workflow Architecture

The application follows a modular "Agentic Analyst" pipeline that transforms raw data into interactive, audit-ready factsheets.

```mermaid
graph TD
    subgraph Ingestion
        A1[IBKR CSV Report] --> B[Data Parser]
        A2[Excel Security Mapping] --> B
    end
    
    subgraph Intelligence
        B --> C[dataProcessor]
        C --> D{AI Orchestrator}
        D -- Fetches --> E[(IndexedDB: Overrides)]
        D -- Executes --> F[Data, Logic & Rationale Adjustments]
    end
    
    subgraph Population
        F --> G[Layout Synthesis & Metrics Generator]
        G --> H[Template Registry]
        H -- Injects --> I[Interactive Factsheet HTML]
        I -- Review Action --> J{Review Panel}
        J -- Feedback Loop --> E
    end
```


## Run Locally

**Prerequisites:** Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up API Key (Optional):**
   Create a `.env.local` file and add your Gemini API key (or configuring custom endpoints within the app) for AI-enhanced features:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
3. **Run the app:**
   ```bash
   npm run dev
   ```

## Usage

1. Upload your **Excel mapping file** (`Data_Preparation.xlsx`).
2. Upload your **monthly IBKR CSV position report**.
3. (Optional) Provide context text/PDFs for AI summarization.
4. Select your preferred template.
5. View the automatically generated factsheet preview and print/save as PDF.

## 🚀 Roadmap: Dynamic AI Orchestrator Integration

- **Phase 7: AI-Generated Component Architecture**:
  - Transition from static templates to dynamic components using the "Template Triad" (Elements, DBs, Logics).
  - Implement a backend orchestration loop where the AI processes saved IndexedDB override logic and dynamically renders the UI schema.
