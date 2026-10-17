// Firebase is optional. If the VITE_FIREBASE_* variables are not set, the
// game runs fully offline and the Friends page explains how to switch it on.
// Firebase code is loaded lazily so offline players never download it.

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

let services;

export async function getFirebase() {
  if (!firebaseEnabled) return null;
  if (!services) {
    services = (async () => {
      const [{ initializeApp }, authMod, fsMod] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ]);
      const app = initializeApp(config);
      return { app, auth: authMod.getAuth(app), db: fsMod.getFirestore(app), authMod, fsMod };
    })();
  }
  return services;
}
