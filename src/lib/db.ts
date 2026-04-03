import { MonthlyReturns, CumulativeSeries, FactsheetSnapshot, LogicOverride, FactsheetSession } from '../types/factsheet';

const DB_NAME = 'FactsheetDB';
const STORE_NAME = 'snapshots';
const OVERRIDES_STORE = 'overrides';
const SESSIONS_STORE = 'sessions';
const DB_VERSION = 3;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'reportDate' });
      }
      if (!db.objectStoreNames.contains(OVERRIDES_STORE)) {
        db.createObjectStore(OVERRIDES_STORE, { keyPath: 'fieldId' });
      }
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function saveSession(session: FactsheetSession): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.put(session);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSession(id: string): Promise<FactsheetSession | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readonly');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getAllSessions(): Promise<FactsheetSession[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readonly');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function deleteSession(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function saveOverride(override: LogicOverride): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OVERRIDES_STORE], 'readwrite');
    const store = transaction.objectStore(OVERRIDES_STORE);
    const request = store.put(override);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getOverride(fieldId: string): Promise<LogicOverride | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OVERRIDES_STORE], 'readonly');
    const store = transaction.objectStore(OVERRIDES_STORE);
    const request = store.get(fieldId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getAllOverrides(): Promise<LogicOverride[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OVERRIDES_STORE], 'readonly');
    const store = transaction.objectStore(OVERRIDES_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function saveSnapshot(snapshot: FactsheetSnapshot): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(snapshot);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSnapshot(reportDate: string): Promise<FactsheetSnapshot | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(reportDate);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getPreviousSnapshot(currentDate: string): Promise<FactsheetSnapshot | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const all: FactsheetSnapshot[] = request.result;
      const previous = all
        .filter(s => s.reportDate < currentDate)
        .sort((a, b) => b.reportDate.localeCompare(a.reportDate))[0];
      resolve(previous || null);
    };
  });
}

export async function getAllSnapshots(): Promise<FactsheetSnapshot[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
export async function getGlobalPerformanceHistory(): Promise<{ monthly: MonthlyReturns, cumulative: CumulativeSeries } | null> {
  const all = await getAllSnapshots();
  if (all.length === 0) return null;

  // Merge all monthly returns from all snapshots
  const globalMonthly: MonthlyReturns = {};
  all.forEach(snapshot => {
    if (snapshot.performanceHistory?.monthly) {
      Object.keys(snapshot.performanceHistory.monthly).forEach(year => {
        globalMonthly[year] = {
          ...(globalMonthly[year] || {}),
          ...snapshot.performanceHistory!.monthly[year]
        };
      });
    }
  });

  // For cumulative, use the one from the latest snapshot (by date)
  const latestSnapshot = all.sort((a, b) => b.reportDate.localeCompare(a.reportDate))[0];
  
  return {
    monthly: globalMonthly,
    cumulative: latestSnapshot.performanceHistory?.cumulative || {
      labels: [],
      cipres: [],
      sp500: []
    }
  };
}
