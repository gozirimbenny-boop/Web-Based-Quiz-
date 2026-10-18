// Firebase powers sign-in, friends, challenges and the leaderboard.
// The web config below is public by design (it ships in every Firebase
// website); security comes from firestore.rules. VITE_FIREBASE_* variables,
// if set, override it — e.g. to point a test build at another project.
// Firebase code is loaded lazily so players who never open Friends don't
// download it.

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyAxj7Cq7y6hYgyIcfunCPWaYEJ-1stGp8E',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'cell-quest-0.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'cell-quest-0',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'cell-quest-0.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '540107661849',
  appId: env.VITE_FIREBASE_APP_ID || '1:540107661849:web:e8c97e84a465bcc8998088',
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
