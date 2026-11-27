/* Шар Firebase: вхід через Google і Firestore. Офіційний SDK з gstatic, версія зафіксована. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, updateDoc, getDocs, collection, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

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
  watchAccess(cb, onErr) { return onSnapshot(accRef(), s => cb(s.exists() ? accFrom(s.data()) : null), onErr); },
  onUser(cb) { return onAuthStateChanged(auth, cb); },
  signIn() { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return signInWithPopup(auth, p); },
  signOut() { return signOut(auth); },
  async loadLessons() { const snap = await getDocs(collection(db, 'lessons')); return snap.docs.map(d => ({ id: d.id, ...d.data() })); },
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
