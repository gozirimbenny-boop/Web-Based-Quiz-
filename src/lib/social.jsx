// Online features: sign-in, friends, friend requests, challenges (duels) and
// the leaderboard — all on Firebase Auth + Firestore.
//
// Firestore layout (see firestore.rules):
//   users/{uid}                 { name, avatar, xp, rank, code, updatedAt }
//   users/{uid}/friends/{fid}   { name, since }
//   friendRequests/{id}         { from, fromName, to, toName, status, createdAt }
//   challenges/{id}             { from, fromName, to, toName, seed, fromScore, fromMax,
//                                 toScore, toMax, status: 'open'|'done', createdAt }
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseEnabled, getFirebase } from './firebase.js';
import { useProgress, rankFor } from '../game/progress.jsx';

const Ctx = createContext(null);

export const friendCode = (uid) => uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();

export function SocialProvider({ children }) {
  const progress = useProgress();
  const [fb, setFb] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!firebaseEnabled);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [challenges, setChallenges] = useState({ incoming: [], outgoing: [] });
  const [error, setError] = useState('');

  // Load Firebase and watch the signed-in user.
  useEffect(() => {
    if (!firebaseEnabled) return undefined;
    let unsub = () => {};
    getFirebase()
      .then((f) => {
        setFb(f);
        unsub = f.authMod.onAuthStateChanged(f.auth, (u) => {
          setUser(u);
          setReady(true);
        });
      })
      .catch((e) => {
        setError(e.message);
        setReady(true);
      });
    return () => unsub();
  }, []);

  // On sign-in, adopt cloud progress if it is ahead of this device.
  useEffect(() => {
    if (!fb || !user) return;
    const { doc, getDoc } = fb.fsMod;
    getDoc(doc(fb.db, 'users', user.uid))
      .then((snap) => {
        const d = snap.data();
        if (d && d.xp > progress.xp) progress.update({ xp: d.xp, name: d.name || progress.name, avatar: d.avatar || progress.avatar });
        else if (!progress.name && user.displayName) progress.update({ name: user.displayName.split(' ')[0].slice(0, 20) });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fb, user]);

  // Push profile changes (name, avatar, xp) to Firestore.
  useEffect(() => {
    if (!fb || !user || !progress.name) return undefined;
    const t = setTimeout(() => {
      const { doc, setDoc, serverTimestamp } = fb.fsMod;
      setDoc(
        doc(fb.db, 'users', user.uid),
        {
          name: progress.name.slice(0, 24),
          avatar: progress.avatar,
          xp: Math.round(progress.xp),
          rank: rankFor(progress.xp).name,
          code: friendCode(user.uid),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      ).catch((e) => setError(e.message));
    }, 800);
    return () => clearTimeout(t);
  }, [fb, user, progress.name, progress.avatar, progress.xp]);

  // Live listeners: friend requests, friends and challenges.
  useEffect(() => {
    if (!fb || !user) {
      setRequests([]);
      setFriends([]);
      setChallenges({ incoming: [], outgoing: [] });
      return undefined;
    }
    const { collection, query, where, onSnapshot } = fb.fsMod;
    const byNewest = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    const rows = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byNewest);
    const onErr = (e) => setError(e.message);
    const unsubs = [
      onSnapshot(
        query(collection(fb.db, 'friendRequests'), where('to', '==', user.uid), where('status', '==', 'pending')),
        (s) => setRequests(rows(s)),
        onErr,
      ),
      onSnapshot(collection(fb.db, 'users', user.uid, 'friends'), (s) => setFriends(s.docs.map((d) => ({ uid: d.id, ...d.data() }))), onErr),
      onSnapshot(query(collection(fb.db, 'challenges'), where('to', '==', user.uid)), (s) => setChallenges((c) => ({ ...c, incoming: rows(s) })), onErr),
      onSnapshot(query(collection(fb.db, 'challenges'), where('from', '==', user.uid)), (s) => setChallenges((c) => ({ ...c, outgoing: rows(s) })), onErr),
    ];
    return () => unsubs.forEach((u) => u());
  }, [fb, user]);

  const run = useCallback(
    async (fn) => {
      setError('');
      try {
        return await fn(fb);
      } catch (e) {
        setError(e.message.replace('Firebase: ', ''));
        return null;
      }
    },
    [fb],
  );

  const api = useMemo(
    () => ({
      enabled: firebaseEnabled,
      ready,
      user,
      error,
      clearError: () => setError(''),
      requests,
      friends,
      challenges,
      myCode: user ? friendCode(user.uid) : '',

      signInGoogle: () => run(({ auth, authMod }) => authMod.signInWithPopup(auth, new authMod.GoogleAuthProvider())),
      signInGuest: () => run(({ auth, authMod }) => authMod.signInAnonymously(auth)),
      signOut: () => run(({ auth, authMod }) => authMod.signOut(auth)),

      leaderboard: () =>
        run(async ({ db, fsMod: { collection, query, orderBy, limit, getDocs } }) => {
          const snap = await getDocs(query(collection(db, 'users'), orderBy('xp', 'desc'), limit(25)));
          return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
        }),

      findByCode: (code) =>
        run(async ({ db, fsMod: { collection, query, where, getDocs, limit } }) => {
          const snap = await getDocs(query(collection(db, 'users'), where('code', '==', code.trim().toUpperCase()), limit(1)));
          return snap.empty ? null : { uid: snap.docs[0].id, ...snap.docs[0].data() };
        }),

      sendFriendRequest: (to) =>
        run(async ({ db, fsMod: { collection, addDoc, serverTimestamp } }) => {
          if (to.uid === user.uid) throw new Error('That’s your own code!');
          if (friends.some((f) => f.uid === to.uid)) throw new Error(`${to.name} is already your friend.`);
          await addDoc(collection(db, 'friendRequests'), {
            from: user.uid,
            fromName: progress.name,
            fromAvatar: progress.avatar,
            to: to.uid,
            toName: to.name,
            status: 'pending',
            createdAt: serverTimestamp(),
          });
          return true;
        }),

      answerRequest: (req, accept) =>
        run(async ({ db, fsMod: { doc, setDoc, updateDoc, serverTimestamp } }) => {
          if (accept) {
            await setDoc(doc(db, 'users', user.uid, 'friends', req.from), { name: req.fromName, avatar: req.fromAvatar || 'nucleus', since: serverTimestamp() });
            await setDoc(doc(db, 'users', req.from, 'friends', user.uid), { name: progress.name, avatar: progress.avatar, since: serverTimestamp() });
          }
          await updateDoc(doc(db, 'friendRequests', req.id), { status: accept ? 'accepted' : 'declined' });
          return true;
        }),

      removeFriend: (fid) =>
        run(async ({ db, fsMod: { doc, deleteDoc } }) => {
          await deleteDoc(doc(db, 'users', user.uid, 'friends', fid));
          await deleteDoc(doc(db, 'users', fid, 'friends', user.uid));
          return true;
        }),

      sendChallenge: ({ to, toName, seed, score, max }) =>
        run(async ({ db, fsMod: { collection, addDoc, serverTimestamp } }) => {
          await addDoc(collection(db, 'challenges'), {
            from: user.uid,
            fromName: progress.name,
            to,
            toName,
            seed,
            fromScore: score,
            fromMax: max,
            toScore: null,
            toMax: null,
            status: 'open',
            createdAt: serverTimestamp(),
          });
          return true;
        }),

      completeChallenge: (id, score, max) =>
        run(({ db, fsMod: { doc, updateDoc } }) => updateDoc(doc(db, 'challenges', id), { toScore: score, toMax: max, status: 'done' })),

      deleteChallenge: (id) => run(({ db, fsMod: { doc, deleteDoc } }) => deleteDoc(doc(db, 'challenges', id))),
    }),
    [ready, user, error, requests, friends, challenges, run, progress.name, progress.avatar],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useSocial = () => useContext(Ctx);
