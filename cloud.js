/* Шар Firebase: вхід через Google і Firestore. Офіційний SDK з gstatic, версія зафіксована. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc, getDocs, getDocsFromCache, Timestamp, arrayUnion, query, where, collection, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDdKFk4dMekeIxn59bt_e3cOIUR9R6SxxE',
  authDomain: 'slovencina-70ab6.firebaseapp.com',
  projectId: 'slovencina-70ab6',
  storageBucket: 'slovencina-70ab6.firebasestorage.app',
  messagingSenderId: '4354573883',
  appId: '1:4354573883:web:4cb0b0070435001dd4fe1e'
};
/* Адмін (той самий, що в правилах Firestore). Решта учасників і ролей — у документі config/access,
   ним керує адмін на сторінці «Учасники». SEED — початковий список, яким адмін створює документ при першому вході. */
const ADMIN = 'saklakovdmitrij256@gmail.com';
const SEED = {
  people: {
    'saklakovdmitrij256@gmail.com': { key: 'dima', name: 'Діма' },
    'akimaaqa@gmail.com': { key: 'natasha', name: 'Наташа' },
    'marinasaklakova8@gmail.com': { key: 'marina', name: 'Марина' },
    'vlad.saklakov5@gmail.com': { key: 'vlad', name: 'Влад' }
  },
  roles: {
    'saklakovdmitrij256@gmail.com': 'admin',
    'akimaaqa@gmail.com': 'editor',
    'marinasaklakova8@gmail.com': 'viewer',
    'vlad.saklakov5@gmail.com': 'viewer'
  },
  course: 10
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let db;
try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); }
catch (e) { db = initializeFirestore(app, {}); }

const accRef = () => doc(db, 'config', 'access');
const accFrom = d => { try { return { people: JSON.parse(d.json || '{}'), roles: d.roles || {}, course: d.course || 1, courseBy: d.courseBy || '' }; } catch (e) { return null; } };

window.Cloud = {
  ADMIN,
  seedAccess() { return JSON.parse(JSON.stringify(SEED)); },
  email: null,
  async loadAccess() { const s = await getDoc(accRef()); return s.exists() ? accFrom(s.data()) : null; },
  /** лише адмін: увесь список учасників, ролі й номер уроку курсу */
  saveAccess(acc) {
    return setDoc(accRef(), { json: JSON.stringify(acc.people), roles: acc.roles, course: acc.course || 1, courseBy: acc.courseBy || auth.currentUser.email, updatedBy: auth.currentUser.email, updatedAt: serverTimestamp() });
  },
  /** адмін або редактор: лише номер уроку курсу */
  saveCourse(n) { return updateDoc(accRef(), { course: n, courseBy: auth.currentUser.email, updatedAt: serverTimestamp() }); },
  /** аналітика: пачка подій дописується в документ користувача за день */
  logEvents(uid, day, name, v, evs) {
    return setDoc(doc(db, 'events', uid + '_' + day), { uid, email: auth.currentUser.email, name, day, v, ev: arrayUnion(...evs), updatedAt: serverTimestamp() }, { merge: true });
  },
  /** лише адмін: усі події з дня from (YYYY-MM-DD) включно */
  async loadEvents(from) { const snap = await getDocs(query(collection(db, 'events'), where('day', '>=', from))); return snap.docs.map(d => d.data()); },
  /** повідомлення про проблему: кожен створює своє; читає свої, адмін — усі */
  sendReport(r) {
    return addDoc(collection(db, 'reports'), { uid: auth.currentUser.uid, email: auth.currentUser.email, name: r.name, text: r.text, ctx: r.ctx, v: r.v, status: 'new', ts: serverTimestamp() });
  },
  /** mine=true — лише свої (для учасника), false — усі (лише адмін). cb отримує список з ts/doneAt у мілісекундах */
  watchReports(mine, cb, onErr) {
    const q = mine ? query(collection(db, 'reports'), where('uid', '==', auth.currentUser.uid)) : collection(db, 'reports');
    const ms = t => (t && t.toMillis ? t.toMillis() : Date.now());
    return onSnapshot(q, snap => cb(snap.docs.map(d => { const x = d.data(); return Object.assign({}, x, { id: d.id, ts: ms(x.ts), doneAt: x.doneAt ? ms(x.doneAt) : 0 }); })), onErr);
  },
  /** лише адмін: статус (new | done) і відповідь автору */
  answerReport(id, status, reply) { return updateDoc(doc(db, 'reports', id), { status, reply: reply || '', doneAt: serverTimestamp() }); },
  deleteReport(id) { return deleteDoc(doc(db, 'reports', id)); },
  watchAccess(cb, onErr) { return onSnapshot(accRef(), s => cb(s.exists() ? accFrom(s.data()) : null), onErr); },
  onUser(cb) { return onAuthStateChanged(auth, cb); },
  signIn() { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return signInWithPopup(auth, p); },
  signOut() { return signOut(auth); },
  /** уроки: повністю — раз на 7 днів або якщо локальна копія неповна; інакше з бази лише змінені після останнього разу
     (решта — з копії Firestore на пристрої). Економить ~50 читань на кожен запуск. lessonReads — скільки прочитано з бази. */
  lessonReads: 0,
  async loadLessons() {
    const col = collection(db, 'lessons'), KEY = 'sk.lessonsSync', mapD = d => ({ id: d.id, ...d.data() });
    const ms = d => (d.updatedAt && d.updatedAt.toMillis ? d.updatedAt.toMillis() : 0);
    const keep = (docs, full) => { try { localStorage.setItem(KEY, JSON.stringify({ n: docs.length, at: Math.max(0, ...docs.map(ms)), full })); } catch (e) { } };
    const fullLoad = async () => { const s = await getDocs(col); const docs = s.docs.map(mapD); if (!s.metadata.fromCache) keep(docs, Date.now()); this.lessonReads = docs.length; return docs; };
    let meta = null; try { meta = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { }
    if (!meta || !meta.at || !meta.n || Date.now() - (meta.full || 0) > 7 * 86400000) return fullLoad();
    try {
      const cached = (await getDocsFromCache(col)).docs.map(mapD);
      if (cached.length < meta.n) return fullLoad();
      const fresh = await getDocs(query(col, where('updatedAt', '>=', Timestamp.fromMillis(meta.at))));
      if (fresh.metadata.fromCache) return cached;
      const byId = {}; cached.forEach(d => { byId[d.id] = d; }); fresh.docs.forEach(d => { byId[d.id] = mapD(d); });
      const docs = Object.values(byId); keep(docs, meta.full); this.lessonReads = Math.max(1, fresh.size); return docs;
    } catch (e) { return fullLoad(); }
  },
  saveLesson(L) {
    return setDoc(doc(db, 'lessons', L.id), { json: JSON.stringify(L), track: L.track, num: L.num, title: L.title, schema: 1, updatedBy: auth.currentUser.email, updatedAt: serverTimestamp() });
  },
  async loadProgress(uid) { const s = await getDoc(doc(db, 'progress', uid)); return s.exists() ? s.data() : null; },
  saveProgress(uid, name, state) {
    return setDoc(doc(db, 'progress', uid), { json: JSON.stringify(state), name, email: auth.currentUser.email, updatedAt: serverTimestamp() });
  },
  async loadNotify(uid) { const s = await getDoc(doc(db, 'notify', uid)); return s.exists() ? s.data() : null; },
  saveNotify(uid, json) { return setDoc(doc(db, 'notify', uid), { json, email: auth.currentUser.email, updatedAt: serverTimestamp() }); },
  async loadSlots(uid) { const snap = await getDocs(collection(db, 'sessions', uid, 'slots')); return snap.docs.map(d => ({ id: d.id, json: d.data().json })); },
  saveSlot(uid, id, json) { return setDoc(doc(db, 'sessions', uid, 'slots', id), { json, email: auth.currentUser.email, updatedAt: serverTimestamp() }); },
  watchProgress(cb, onErr) { return onSnapshot(collection(db, 'progress'), snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), onErr); }
};
window.dispatchEvent(new Event('cloud-ready'));
