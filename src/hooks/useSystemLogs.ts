import { useState, useEffect } from 'react';
import { logger, LogEntry } from '../utils/logger';

export function useSystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Subscribe binds automatically and triggers initial state callback
    const unsubscribe = logger.subscribe(setLogs);
    return () => unsubscribe();
  }, []);

  return {
    logs,
    clearLogs: () => logger.clearLogs()
  };
}
