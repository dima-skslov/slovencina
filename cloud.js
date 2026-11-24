/* Шар Firebase: вхід через Google і Firestore. Офіційний SDK з gstatic, версія зафіксована. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, getDocs, collection, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDdKFk4dMekeIxn59bt_e3cOIUR9R6SxxE',
  authDomain: 'slovencina-70ab6.firebaseapp.com',
  projectId: 'slovencina-70ab6',
  storageBucket: 'slovencina-70ab6.firebasestorage.app',
  messagingSenderId: '4354573883',
  appId: '1:4354573883:web:4cb0b0070435001dd4fe1e'
};
/* Той самий білий список, що й у правилах Firestore. Справжній захист у правилах, тут лише зручність. */
const ALLOWED = { 'saklakovdmitrij256@gmail.com': 'dima', 'akimaaqa@gmail.com': 'natasha', 'marinasaklakova8@gmail.com': 'marina', 'vlad.saklakov5@gmail.com': 'vlad' };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let db;
try { db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); }
catch (e) { db = initializeFirestore(app, {}); }

window.Cloud = {
  ALLOWED,
  email: null,
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
