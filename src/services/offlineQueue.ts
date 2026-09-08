import { EmergencyRequest } from '../types';

const DB_NAME = 'resqbridge_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'pending_emergencies';

export interface OfflineQueueItem {
  id: string; // emergency.id
  emergency: EmergencyRequest;
  savedAt: string;
  attempts: number;
  lastAttemptAt?: string;
  status: 'waiting' | 'syncing' | 'failed';
}

/**
 * Initializes and opens the browser's native IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists an emergency request into IndexedDB when neither internet nor SMS could be dispatched.
 */
export async function saveEmergencyOffline(emergency: EmergencyRequest): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const queueItem: OfflineQueueItem = {
        id: emergency.id,
        emergency: {
          ...emergency,
          isOfflinePending: true,
          smsStatus: 'WAITING FOR CONNECTION'
        },
        savedAt: new Date().toISOString(),
        attempts: 1,
        status: 'waiting'
      };

      const putRequest = store.put(queueItem);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch (err) {
    console.warn('IndexedDB fallback to localStorage', err);
    // Fallback if IndexedDB restricted (e.g. strict incognito)
    try {
      const existing = JSON.parse(localStorage.getItem('resqbridge_offline_queue') || '[]');
      const filtered = existing.filter((item: any) => item.id !== emergency.id);
      filtered.push({
        id: emergency.id,
        emergency: {
          ...emergency,
          isOfflinePending: true,
          smsStatus: 'WAITING FOR CONNECTION'
        },
        savedAt: new Date().toISOString(),
        attempts: 1,
        status: 'waiting'
      });
      localStorage.setItem('resqbridge_offline_queue', JSON.stringify(filtered));
    } catch (e) {
      console.error('Storage failed completely', e);
    }
  }
}

/**
 * Retrieves all pending emergencies currently stored in the offline queue.
 */
export async function getPendingEmergencies(): Promise<OfflineQueueItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  } catch (err) {
    try {
      return JSON.parse(localStorage.getItem('resqbridge_offline_queue') || '[]');
    } catch (e) {
      return [];
    }
  }
}

/**
 * Removes an emergency from the offline queue once it has successfully synchronized.
 */
export async function removeEmergencyFromQueue(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  } catch (err) {
    try {
      const existing = JSON.parse(localStorage.getItem('resqbridge_offline_queue') || '[]');
      const filtered = existing.filter((item: any) => item.id !== id);
      localStorage.setItem('resqbridge_offline_queue', JSON.stringify(filtered));
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Clears all items in the offline queue (e.g. on demo reset).
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  } catch (err) {
    localStorage.removeItem('resqbridge_offline_queue');
  }
}
