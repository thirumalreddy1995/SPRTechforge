
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDoc,
  updateDoc
} from 'firebase/firestore';

const STORAGE_KEY_CONFIG = 'SPR_TECHFORGE_FIREBASE_CONFIG';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Hardcoded Default Configuration per user request
const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyDWiI7gQ-sCLiMfoNPAmbqrT_XNAH2SxL8",
  authDomain: "sprtechforge.firebaseapp.com",
  projectId: "sprtechforge",
  storageBucket: "sprtechforge.firebasestorage.app",
  messagingSenderId: "576106145208",
  appId: "1:576106145208:web:fcd3c869f30544efca2bcd",
  measurementId: "G-JN6S6L5KH5"
};

class CloudService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private isInitialized = false;

  constructor() {
    this.tryInit();
  }

  private tryInit() {
    try {
      // 1. Check for manual override in LocalStorage
      const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
      let config = DEFAULT_FIREBASE_CONFIG;

      if (storedConfig) {
        config = JSON.parse(storedConfig);
      }

      // 2. Initialize with whichever config we found (Default or Stored)
      if (config.projectId && config.apiKey) {
         try {
            this.app = initializeApp(config);
            this.db = getFirestore(this.app);
            this.isInitialized = true;
            console.log("Firebase Firestore Initialized");
         } catch (err) {
            console.error("Firebase initialization failed:", err);
            this.isInitialized = false;
         }
      }
    } catch (e) {
      console.error("Failed to initialize firebase", e);
    }
  }

  public saveConfig(config: FirebaseConfig) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    window.location.reload();
  }

  public clearConfig() {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    // On reload, it will revert to DEFAULT_FIREBASE_CONFIG
    window.location.reload();
  }

  public isConfigured(): boolean {
    return this.isInitialized && !!this.db;
  }

  public getConfig(): FirebaseConfig | null {
    const s = localStorage.getItem(STORAGE_KEY_CONFIG);
    return s ? JSON.parse(s) : DEFAULT_FIREBASE_CONFIG;
  }

  // --- Connection Testing ---
  
  public async testConfig(configString: string): Promise<{ success: boolean; error?: string }> {
    try {
      const config = JSON.parse(configString);
      
      // Validate basic fields
      if (!config.projectId || !config.apiKey || !config.appId) {
          return { success: false, error: "Invalid Configuration object. Missing projectId, apiKey, or appId." };
      }

      const tempApp = initializeApp(config, 'testApp');
      const tempDb = getFirestore(tempApp);
      
      // Try to access a dummy document to verify connection permissions
      try {
        const ref = doc(tempDb, 'system_check', 'connection_test');
        await getDoc(ref); 
      } catch (dbErr: any) {
         if (dbErr.code === 'unavailable' || dbErr.code === 'failed-precondition') {
            return { success: false, error: "Could not reach Firebase. Check your internet connection." };
         }
      }
      
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Invalid JSON format." };
    }
  }

  // --- Helper: Sanitize Data ---
  // Converts Firestore specific types (Timestamps, References) to JSON-safe primitives
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) return data;
    
    if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object') {
        // Handle Firestore Timestamps (they have a toDate method)
        if (typeof data.toDate === 'function') {
            return data.toDate().toISOString();
        }
        
        // Handle potentially raw Timestamp objects (seconds/nanoseconds)
        if ('seconds' in data && 'nanoseconds' in data && Object.keys(data).length <= 2) {
           return new Date(data.seconds * 1000).toISOString();
        }

        // Handle Firestore Document References (Circular!)
        // If it has a 'firestore' property and a 'path', it's likely a reference.
        // We convert it to a string path to break the circular dependency.
        if (data.firestore && typeof data.path === 'string') {
             return data.path; 
        }

        // Recurse for nested objects
        const cleanObj: any = {};
        Object.keys(data).forEach(key => {
            cleanObj[key] = this.sanitizeData(data[key]);
        });
        return cleanObj;
    }
    
    return data;
  }

  // Helper: Clean undefined for Firestore Write
  private cleanForSave(data: any): any {
    // JSON.stringify removes undefined keys
    return JSON.parse(JSON.stringify(data));
  }

  // --- Real-time Listeners ---

  public subscribe(tableName: string, callback: (data: any[]) => void, onError?: (error: any) => void) {
    if (!this.db) return () => {};
    
    // In Firestore, 'tableName' maps to 'Collection Name'
    const colRef = collection(this.db, tableName);

    const unsubscribe = onSnapshot(colRef, 
      (snapshot) => {
        const items: any[] = [];
        snapshot.forEach((doc) => {
            const rawData = doc.data();
            const cleanData = this.sanitizeData(rawData);
            items.push({ ...cleanData, id: doc.id });
        });
        console.log(`Sync: Received ${items.length} items from ${tableName}`);
        callback(items);
      }, 
      (error) => {
        console.error(`Error subscribing to ${tableName}:`, error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  }

  // --- CRUD Operations ---

  public async saveItem(tableName: string, item: any) {
    if (!this.db) throw new Error("DB not configured");
    if (!item.id) throw new Error("Item must have an ID");

    // Sanitize to remove undefined fields which crash Firestore
    const safeItem = this.cleanForSave(item);
    await setDoc(doc(this.db, tableName, item.id), safeItem);
  }

  public async updateItem(tableName: string, id: string, data: any) {
    if (!this.db) throw new Error("DB not configured");
    if (!id) throw new Error("ID required for update");
    
    const safeData = this.cleanForSave(data);
    const ref = doc(this.db, tableName, id);
    await updateDoc(ref, safeData);
  }

  public async deleteItem(tableName: string, id: string) {
    if (!this.db) throw new Error("DB not configured");
    await deleteDoc(doc(this.db, tableName, id));
  }

  public async uploadBatch(tableName: string, items: any[]) {
    if (!this.db) throw new Error("DB not configured");
    if (items.length === 0) return;

    const batchSize = 500;
    for (let i = 0; i < items.length; i += batchSize) {
        const chunk = items.slice(i, i + batchSize);
        const batch = writeBatch(this.db);
        
        chunk.forEach(item => {
            const ref = doc(this.db!, tableName, item.id);
            const safeItem = this.cleanForSave(item);
            batch.set(ref, safeItem);
        });

        await batch.commit();
        console.log(`Uploaded batch of ${chunk.length} to ${tableName}`);
    }
  }
  
  public getSchemaSQL() {
      return "Firestore is a NoSQL database. No Schema definition is required. Collections are created automatically when you add data.";
  }
}

export const cloudService = new CloudService();
