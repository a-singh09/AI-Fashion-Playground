import type { ImageFile, WardrobeItem } from '../types';

const DB_NAME = 'AIashionPlaygroundDB';
const DB_VERSION = 1;
const AVATAR_STORE = 'avatar';
const WARDROBE_STORE = 'wardrobe';

let db: IDBDatabase;

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", (event.target as any).errorCode);
      reject("IndexedDB error");
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(AVATAR_STORE)) {
        dbInstance.createObjectStore(AVATAR_STORE, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(WARDROBE_STORE)) {
        dbInstance.createObjectStore(WARDROBE_STORE, { keyPath: 'id' });
      }
    };
  });
}

// --- Avatar Functions ---

export async function saveAvatar(avatar: ImageFile): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction(AVATAR_STORE, 'readwrite');
  const store = transaction.objectStore(AVATAR_STORE);
  // Clear the store first since there's only one avatar
  const clearRequest = store.clear(); 
  return new Promise((resolve, reject) => {
    clearRequest.onsuccess = () => {
        const putRequest = store.put(avatar);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = (event) => {
            console.error("Failed to save avatar:", (event.target as any).error);
            reject("Failed to save avatar");
        };
    };
    clearRequest.onerror = (event) => {
        console.error("Failed to clear avatar store:", (event.target as any).error);
        reject("Failed to clear avatar store");
    }
  });
}

export async function getAvatar(): Promise<ImageFile | null> {
  const db = await initDB();
  const transaction = db.transaction(AVATAR_STORE, 'readonly');
  const store = transaction.objectStore(AVATAR_STORE);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      if (request.result && request.result.length > 0) {
        resolve(request.result[0] as ImageFile);
      } else {
        resolve(null);
      }
    };
    request.onerror = (event) => {
      console.error('Failed to get avatar:', (event.target as any).error);
      reject('Failed to get avatar');
    };
  });
}

// --- Wardrobe Functions ---

export async function saveWardrobe(wardrobe: WardrobeItem[]): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction(WARDROBE_STORE, 'readwrite');
    const store = transaction.objectStore(WARDROBE_STORE);
    store.clear(); // Clear old wardrobe
    wardrobe.forEach(item => store.put(item));

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => {
            console.error("Failed to save wardrobe:", (event.target as any).error);
            reject("Failed to save wardrobe");
        };
    });
}

export async function getWardrobe(): Promise<WardrobeItem[]> {
    const db = await initDB();
    const transaction = db.transaction(WARDROBE_STORE, 'readonly');
    const store = transaction.objectStore(WARDROBE_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            resolve(request.result as WardrobeItem[]);
        };
        request.onerror = (event) => {
            console.error('Failed to get wardrobe:', (event.target as any).error);
            reject('Failed to get wardrobe');
        };
    });
}