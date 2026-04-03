export type LogCategory = 'system' | 'import' | 'parse' | 'calculation' | 'ai';
export type LogType = 'info' | 'success' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  category: LogCategory;
  type: LogType;
  message: string;
  details?: any;
}

class SystemLogger {
  private logs: LogEntry[] = [];
  private listeners: Set<(logs: LogEntry[]) => void> = new Set();
  private readonly STORAGE_KEY = 'factsheet-automator-logs';
  private readonly MAX_LOGS = 500; // Prevent unbounded growth

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse persistent logs', e);
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to save persistent logs', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  public subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.add(listener);
    // Immediately send current logs
    listener([...this.logs]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  private _add(category: LogCategory, type: LogType, message: string, details?: any) {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      category,
      type,
      message,
      details
    };

    this.logs.push(entry);
    
    // Prune if overgrown
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(this.logs.length - this.MAX_LOGS);
    }
    
    this.saveLogs();
  }

  public info(category: LogCategory, message: string, details?: any) {
    this._add(category, 'info', message, details);
  }

  public success(category: LogCategory, message: string, details?: any) {
    this._add(category, 'success', message, details);
  }

  public warn(category: LogCategory, message: string, details?: any) {
    this._add(category, 'warn', message, details);
  }

  public error(category: LogCategory, message: string, details?: any) {
    this._add(category, 'error', message, details);
  }
}

export const logger = new SystemLogger();
