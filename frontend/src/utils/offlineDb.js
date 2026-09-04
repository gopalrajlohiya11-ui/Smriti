// IndexedDB and LocalStorage Offline Engine for Smriti

const DB_NAME = 'smriti_offline_store';
const DB_VERSION = 1;
const STORE_PATIENT_CACHE = 'patient_cache';
const STORE_ACTION_QUEUE = 'action_queue';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PATIENT_CACHE)) {
        db.createObjectStore(STORE_PATIENT_CACHE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_ACTION_QUEUE)) {
        db.createObjectStore(STORE_ACTION_QUEUE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// PATIENT DATA CACHE (Profile, Reminders, Streak, Photos)
// -------------------------------------------------------------
export async function cachePatientData(patientId, data) {
  if (!patientId || !data) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_PATIENT_CACHE, 'readwrite');
    const store = tx.objectStore(STORE_PATIENT_CACHE);
    const payload = {
      id: String(patientId),
      data: JSON.parse(JSON.stringify(data)),
      cachedAt: Date.now()
    };
    store.put(payload);
  } catch (err) {
    // Fallback to localStorage
    try {
      localStorage.setItem(`smriti_cached_pat_${patientId}`, JSON.stringify({
        id: String(patientId),
        data,
        cachedAt: Date.now()
      }));
    } catch (e) {}
  }
}

export async function getCachedPatientData(patientId) {
  if (!patientId) return null;
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_PATIENT_CACHE, 'readonly');
    const store = tx.objectStore(STORE_PATIENT_CACHE);
    return new Promise((resolve) => {
      const req = store.get(String(patientId));
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data);
        } else {
          // Fallback to localStorage
          const local = localStorage.getItem(`smriti_cached_pat_${patientId}`);
          resolve(local ? JSON.parse(local).data : null);
        }
      };
      req.onerror = () => {
        const local = localStorage.getItem(`smriti_cached_pat_${patientId}`);
        resolve(local ? JSON.parse(local).data : null);
      };
    });
  } catch (err) {
    const local = localStorage.getItem(`smriti_cached_pat_${patientId}`);
    return local ? JSON.parse(local).data : null;
  }
}

// -------------------------------------------------------------
// OFFLINE ACTION QUEUE (Reminder Done taps while offline)
// -------------------------------------------------------------
export async function queueOfflineAction(action) {
  const item = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: Date.now(),
    ...action
  };

  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_ACTION_QUEUE, 'readwrite');
    tx.objectStore(STORE_ACTION_QUEUE).put(item);
  } catch (err) {
    try {
      const list = JSON.parse(localStorage.getItem('smriti_offline_action_queue') || '[]');
      list.push(item);
      localStorage.setItem('smriti_offline_action_queue', JSON.stringify(list));
    } catch (e) {}
  }

  return item;
}

export async function getQueuedOfflineActions() {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_ACTION_QUEUE, 'readonly');
    const store = tx.objectStore(STORE_ACTION_QUEUE);
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => {
        const local = localStorage.getItem('smriti_offline_action_queue');
        resolve(local ? JSON.parse(local) : []);
      };
    });
  } catch (err) {
    const local = localStorage.getItem('smriti_offline_action_queue');
    return local ? JSON.parse(local) : [];
  }
}

export async function removeQueuedOfflineAction(actionId) {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_ACTION_QUEUE, 'readwrite');
    tx.objectStore(STORE_ACTION_QUEUE).delete(actionId);
  } catch (err) {
    try {
      const list = JSON.parse(localStorage.getItem('smriti_offline_action_queue') || '[]');
      const filtered = list.filter(a => a.id !== actionId);
      localStorage.setItem('smriti_offline_action_queue', JSON.stringify(filtered));
    } catch (e) {}
  }
}
