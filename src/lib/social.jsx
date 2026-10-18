// Online features: sign-in, friends, friend requests, challenges (duels) and
// the leaderboard — all on Firebase Auth + Firestore.
//
// Firestore layout (see firestore.rules):
//   users/{uid}                 { name, avatar, xp, rank, code, updatedAt }
//   users/{uid}/friends/{fid}   { name, since }
//   friendRequests/{id}         { from, fromName, to, toName, status, createdAt }
//   challenges/{id}             { from, fromName, to, toName, seed, fromScore, fromMax,
//                                 toScore, toMax, status: 'open'|'done', createdAt }
//   classes/{id}                { name, teacher, teacherName, code, createdAt }
//   classes/{id}/members/{uid}  { name, avatar, xp, games, correct, answered,
//                                 bestCombo, streak, mistakes[], joinedAt, updatedAt }
//   users/{uid}.classes         ids of classes the player joined
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseEnabled, getFirebase } from './firebase.js';
import { useProgress, rankFor } from '../game/progress.jsx';

const Ctx = createContext(null);

export const friendCode = (uid) => uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();

// Class join codes skip look-alike characters (0/O, 1/I/L) so they're easy
// to read off a whiteboard.
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeClassCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

export function SocialProvider({ children }) {
  const progress = useProgress();
  const [fb, setFb] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!firebaseEnabled);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [challenges, setChallenges] = useState({ incoming: [], outgoing: [] });
  const [error, setError] = useState('');
  const [classIds, setClassIds] = useState([]); // classes I've joined as a student
  const [classes, setClasses] = useState([]); // their details
  const [teaching, setTeaching] = useState([]); // classes I teach

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

  // Classes: the ones I joined (listed on my user doc) and the ones I teach.
  useEffect(() => {
    if (!fb || !user) {
      setClassIds([]);
      setTeaching([]);
      return undefined;
    }
    const { collection, doc, query, where, onSnapshot } = fb.fsMod;
    const onErr = (e) => setError(e.message);
    const unsubs = [
      onSnapshot(doc(fb.db, 'users', user.uid), (s) => setClassIds(s.data()?.classes || []), onErr),
      onSnapshot(query(collection(fb.db, 'classes'), where('teacher', '==', user.uid)), (s) => setTeaching(s.docs.map((d) => ({ id: d.id, ...d.data() }))), onErr),
    ];
    return () => unsubs.forEach((u) => u());
  }, [fb, user]);

  useEffect(() => {
    if (!fb || !classIds.length) {
      setClasses([]);
      return;
    }
    const { doc, getDoc } = fb.fsMod;
    Promise.all(classIds.map((id) => getDoc(doc(fb.db, 'classes', id)).then((s) => (s.exists() ? { id, ...s.data() } : null))))
      .then((list) => setClasses(list.filter(Boolean)))
      .catch(() => {});
  }, [fb, classIds]);

  // Keep my progress up to date in every class I belong to, so the teacher
  // dashboard is live. Only stats and mistake ids are shared.
  const stats = {
    name: progress.name.slice(0, 24),
    avatar: progress.avatar,
    xp: Math.round(progress.xp),
    games: progress.games,
    correct: progress.correct,
    answered: progress.answered,
    bestCombo: progress.bestCombo,
    streak: progress.daily.streak,
    mistakes: progress.mistakes.slice(0, 20),
  };
  const statsKey = JSON.stringify(stats);
  useEffect(() => {
    if (!fb || !user || !classIds.length || !progress.name) return undefined;
    const t = setTimeout(() => {
      const { doc, setDoc, serverTimestamp } = fb.fsMod;
      classIds.forEach((cid) =>
        setDoc(doc(fb.db, 'classes', cid, 'members', user.uid), { ...JSON.parse(statsKey), updatedAt: serverTimestamp() }, { merge: true }).catch(() => {}),
      );
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fb, user, classIds, statsKey]);

  // Student side: assignments and live rooms in my classes, plus my own
  // submission for each assignment (for "to do" / "done" status).
  const [assignments, setAssignments] = useState([]);
  const [liveRooms, setLiveRooms] = useState([]);
  const [mySubs, setMySubs] = useState({});
  useEffect(() => {
    if (!fb || !user || !classes.length) {
      setAssignments([]);
      setLiveRooms([]);
      return undefined;
    }
    const { collection, onSnapshot } = fb.fsMod;
    const byClass = { assignments: {}, rooms: {} };
    const flush = () => {
      setAssignments(Object.values(byClass.assignments).flat().sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLiveRooms(Object.values(byClass.rooms).flat());
    };
    const unsubs = classes.flatMap((c) => [
      onSnapshot(
        collection(fb.db, 'classes', c.id, 'assignments'),
        (s) => {
          byClass.assignments[c.id] = s.docs.map((d) => ({ id: d.id, cid: c.id, className: c.name, ...d.data() }));
          flush();
        },
        () => {},
      ),
      onSnapshot(
        collection(fb.db, 'classes', c.id, 'rooms'),
        (s) => {
          byClass.rooms[c.id] = s.docs.map((d) => ({ id: d.id, cid: c.id, className: c.name, ...d.data() })).filter((r) => r.state !== 'ended');
          flush();
        },
        () => {},
      ),
    ]);
    return () => unsubs.forEach((u) => u());
  }, [fb, user, classes]);

  const assignmentKey = assignments.map((a) => `${a.cid}/${a.id}`).join(',');
  useEffect(() => {
    if (!fb || !user || !assignments.length) {
      setMySubs({});
      return undefined;
    }
    const { doc, onSnapshot } = fb.fsMod;
    const unsubs = assignments.map((a) =>
      onSnapshot(
        doc(fb.db, 'classes', a.cid, 'assignments', a.id, 'submissions', user.uid),
        (s) => setMySubs((m) => ({ ...m, [a.id]: s.exists() ? s.data() : null })),
        () => {},
      ),
    );
    return () => unsubs.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fb, user, assignmentKey]);

  // A clean slate after signing in or out (e.g. drop a stale popup error).
  useEffect(() => setError(''), [user]);

  const run = useCallback(
    async (fn) => {
      setError('');
      let timer;
      try {
        // If the database can't be reached, Firestore retries forever;
        // give up after 15s so the player sees a message instead of a spinner.
        const timeout = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Couldn’t reach the online database. Check your connection and try again.')), 15000);
        });
        return await Promise.race([fn(fb), timeout]);
      } catch (e) {
        // Closing the Google window (or double-clicking) isn't an error.
        if (!/popup-closed-by-user|cancelled-popup-request/.test(e.code || e.message)) setError(e.message.replace('Firebase: ', ''));
        return null;
      } finally {
        clearTimeout(timer);
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

      // ---------- Classes ----------
      classes,
      teaching,

      createClass: (name) =>
        run(async ({ db, fsMod: { collection, addDoc, getDocs, query, where, limit, serverTimestamp } }) => {
          let code;
          for (let i = 0; i < 5; i++) {
            code = makeClassCode();
            const clash = await getDocs(query(collection(db, 'classes'), where('code', '==', code), limit(1)));
            if (clash.empty) break;
          }
          await addDoc(collection(db, 'classes'), { name: name.trim().slice(0, 40), teacher: user.uid, teacherName: progress.name, code, createdAt: serverTimestamp() });
          return code;
        }),

      joinClass: (code) =>
        run(async ({ db, fsMod: { collection, doc, getDocs, setDoc, query, where, limit, arrayUnion, serverTimestamp } }) => {
          const snap = await getDocs(query(collection(db, 'classes'), where('code', '==', code.trim().toUpperCase()), limit(1)));
          if (snap.empty) throw new Error('No class with that code. Check the letters with your teacher.');
          const cls = { id: snap.docs[0].id, ...snap.docs[0].data() };
          if (cls.teacher === user.uid) throw new Error('That’s your own class — you’re the teacher!');
          await setDoc(doc(db, 'classes', cls.id, 'members', user.uid), { ...JSON.parse(statsKey), joinedAt: serverTimestamp(), updatedAt: serverTimestamp() });
          await setDoc(doc(db, 'users', user.uid), { name: progress.name.slice(0, 24), xp: Math.round(progress.xp), classes: arrayUnion(cls.id) }, { merge: true });
          return cls;
        }),

      leaveClass: (cid) =>
        run(async ({ db, fsMod: { doc, deleteDoc, setDoc, arrayRemove } }) => {
          await deleteDoc(doc(db, 'classes', cid, 'members', user.uid));
          await setDoc(doc(db, 'users', user.uid), { name: progress.name.slice(0, 24), xp: Math.round(progress.xp), classes: arrayRemove(cid) }, { merge: true });
          return true;
        }),

      // Teacher: live list of a class's students. Returns an unsubscribe fn.
      watchMembers: (cid, cb) => {
        if (!fb) return () => {};
        const { collection, onSnapshot } = fb.fsMod;
        return onSnapshot(
          collection(fb.db, 'classes', cid, 'members'),
          (s) => cb(s.docs.map((d) => ({ uid: d.id, ...d.data() }))),
          (e) => setError(e.message),
        );
      },

      removeMember: (cid, uid) => run(({ db, fsMod: { doc, deleteDoc } }) => deleteDoc(doc(db, 'classes', cid, 'members', uid))),

      // ---------- Assignments ----------
      assignments,
      mySubs,

      // Live listener on any doc or collection path; returns unsubscribe.
      watch: (path, cb) => {
        if (!fb) return () => {};
        const { collection, doc, onSnapshot } = fb.fsMod;
        const isDoc = path.length % 2 === 0;
        const ref = isDoc ? doc(fb.db, ...path) : collection(fb.db, ...path);
        return onSnapshot(
          ref,
          (s) => cb(isDoc ? (s.exists() ? { id: s.id, ...s.data() } : null) : s.docs.map((d) => ({ id: d.id, ...d.data() }))),
          (e) => setError(e.message),
        );
      },

      createAssignment: (cid, data) =>
        run(async ({ db, fsMod: { collection, addDoc, serverTimestamp } }) => {
          const ref = await addDoc(collection(db, 'classes', cid, 'assignments'), { ...data, status: 'open', createdAt: serverTimestamp() });
          return ref.id;
        }),

      updateAssignment: (cid, aid, patch) => run(({ db, fsMod: { doc, updateDoc } }) => updateDoc(doc(db, 'classes', cid, 'assignments', aid), patch)),

      deleteAssignment: (cid, aid) =>
        run(async ({ db, fsMod: { collection, doc, getDocs, deleteDoc } }) => {
          const subs = await getDocs(collection(db, 'classes', cid, 'assignments', aid, 'submissions'));
          await Promise.all(subs.docs.map((s) => deleteDoc(s.ref)));
          await deleteDoc(doc(db, 'classes', cid, 'assignments', aid));
          return true;
        }),

      // Students save their own submission (merged, so it can be saved
      // after every answer and the teacher sees progress live).
      saveSubmission: (cid, aid, data) =>
        run(({ db, fsMod: { doc, setDoc, serverTimestamp } }) =>
          setDoc(
            doc(db, 'classes', cid, 'assignments', aid, 'submissions', user.uid),
            { name: progress.name.slice(0, 24), avatar: progress.avatar, ...data, updatedAt: serverTimestamp() },
            { merge: true },
          ),
        ),

      resetSubmission: (cid, aid, uid) => run(({ db, fsMod: { doc, deleteDoc } }) => deleteDoc(doc(db, 'classes', cid, 'assignments', aid, 'submissions', uid))),

      // ---------- Live rooms ----------
      liveRooms,

      createRoom: (cid, data) =>
        run(async ({ db, fsMod: { collection, addDoc, serverTimestamp } }) => {
          const ref = await addDoc(collection(db, 'classes', cid, 'rooms'), { ...data, state: 'lobby', index: 0, host: user.uid, createdAt: serverTimestamp() });
          return ref.id;
        }),

      // Host moves the room on. 'question' also stamps the start time.
      setRoomState: (cid, rid, patch) =>
        run(({ db, fsMod: { doc, updateDoc, serverTimestamp } }) =>
          updateDoc(doc(db, 'classes', cid, 'rooms', rid), { ...patch, ...(patch.state === 'question' ? { startedAt: serverTimestamp() } : {}) }),
        ),

      deleteRoom: (cid, rid) =>
        run(async ({ db, fsMod: { collection, doc, getDocs, deleteDoc } }) => {
          const players = await getDocs(collection(db, 'classes', cid, 'rooms', rid, 'players'));
          await Promise.all(players.docs.map((p) => deleteDoc(p.ref)));
          await deleteDoc(doc(db, 'classes', cid, 'rooms', rid));
          return true;
        }),

      joinRoom: (cid, rid) =>
        run(async ({ db, fsMod: { doc, getDoc, setDoc, serverTimestamp } }) => {
          const ref = doc(db, 'classes', cid, 'rooms', rid, 'players', user.uid);
          const existing = await getDoc(ref);
          if (!existing.exists()) await setDoc(ref, { name: progress.name.slice(0, 24), avatar: progress.avatar, score: 0, answers: {}, joinedAt: serverTimestamp() });
          return true;
        }),

      answerRoom: (cid, rid, index, answer, integrity) =>
        run(({ db, fsMod: { doc, updateDoc, increment } }) =>
          updateDoc(doc(db, 'classes', cid, 'rooms', rid, 'players', user.uid), {
            [`answers.${index}`]: answer,
            score: increment(answer.points),
            ...integrity,
          }),
        ),

      // Removes everything this player has online: class memberships,
      // friend links, profile, then the sign-in account itself. (Their
      // answers inside a teacher's assignments stay with the teacher.)
      deleteAccount: () =>
        run(async ({ db, auth, authMod, fsMod: { collection, doc, getDocs, deleteDoc } }) => {
          for (const cid of classIds) await deleteDoc(doc(db, 'classes', cid, 'members', user.uid)).catch(() => {});
          const fr = await getDocs(collection(db, 'users', user.uid, 'friends'));
          for (const f of fr.docs) {
            await deleteDoc(doc(db, 'users', f.id, 'friends', user.uid)).catch(() => {});
            await deleteDoc(f.ref);
          }
          await deleteDoc(doc(db, 'users', user.uid));
          try {
            await authMod.deleteUser(auth.currentUser);
          } catch (e) {
            // Google accounts must have signed in recently to be deleted.
            if (String(e.code).includes('requires-recent-login')) {
              await authMod.signOut(auth);
              throw new Error('Your data was deleted. To remove the sign-in itself, sign in again and press Delete once more.');
            }
            throw e;
          }
          return true;
        }),

      deleteClass: (cid) =>
        run(async ({ db, fsMod: { collection, doc, getDocs, deleteDoc } }) => {
          const members = await getDocs(collection(db, 'classes', cid, 'members'));
          await Promise.all(members.docs.map((m) => deleteDoc(m.ref)));
          await deleteDoc(doc(db, 'classes', cid));
          return true;
        }),
    }),
    [ready, user, error, requests, friends, challenges, run, progress.name, progress.avatar, progress.xp, classes, classIds, teaching, statsKey, fb, assignments, mySubs, liveRooms],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useSocial = () => useContext(Ctx);
