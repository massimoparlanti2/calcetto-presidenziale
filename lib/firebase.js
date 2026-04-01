import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCQLf8iMLBX50zV7yoSbi3Zb_Yf_5Cw-oQ",
  authDomain: "calcetto-presidenziale.firebaseapp.com",
  projectId: "calcetto-presidenziale",
  storageBucket: "calcetto-presidenziale.firebasestorage.app",
  messagingSenderId: "851510214104",
  appId: "1:851510214104:web:5dab0a947ad0d999a146ad",
  measurementId: "G-YQXM8RNEHV",
  databaseURL: "https://calcetto-presidenziale-default-rtdb.europe-west1.firebasedatabase.app",
};

// Inizializza Firebase una sola volta (evita errori in hot-reload)
const firebaseApp = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
const firebaseDB = getDatabase(firebaseApp);

// ─── DB LAYER ─────────────────────────────────────────────────────────────────
// Firebase Realtime Database come storage primario.
// Fallback su localStorage se Firebase non è raggiungibile.
export const DB = {
  async get(key, fallback = null) {
    try {
      const snapshot = await get(ref(firebaseDB, key));
      return snapshot.exists() ? snapshot.val() : fallback;
    } catch (err) {
      console.warn(`[DB.get] Firebase error per "${key}", uso localStorage:`, err.message);
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    }
  },
  async set(key, val) {
    try {
      await set(ref(firebaseDB, key), val);
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    } catch (err) {
      console.warn(`[DB.set] Firebase error per "${key}", scrivo solo localStorage:`, err.message);
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }
  },
};
