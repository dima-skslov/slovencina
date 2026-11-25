'use strict';
/* Slovenčina · платформа Діми й Наташі. Пілотна версія: прогрес у браузері (localStorage). */

/* Хмарний режим на GitHub Pages (і localhost для розробки); у попередньому перегляді в Claude працює локальний режим */
const CLOUD = /(^|\.)github\.io$/.test(location.hostname) || location.hostname === 'localhost';
const PILOT = !CLOUD;
let UID = null; const OTHER = {}; let SYNC = { state: 'local', err: '' };
const LESSON_FILES = ['lessons/g09.json', 'lessons/v08.json'];
const NAMES = { dima: 'Діма', natasha: 'Наташа', marina: 'Марина', vlad: 'Влад' };
/** кого не показувати у вогниках і календарі активності (переглядачі) */
const NO_STREAK = { vlad: true };
/** хто ходить на заняття курсу (вт/ср): картка заняття, розминка, перенесення, нагадування про заняття */
const ON_COURSE = { dima: true, natasha: true };
const G_TOPICS = { 1: 'Вступний курс', 2: 'Вступний курс', 3: 'Вступний курс', 4: 'Вступний курс', 5: 'Вступний курс', 7: 'Moja izba', 8: 'Moja rodina · chlap, hrdina', 9: 'Ako vyzerá môj pracovný deň?', 10: 'Ako trávim svoj voľný čas? · stroj', 11: 'žena', 12: 'ulica', 13: 'mesto, srdce' };
const V_NUMS = [1, 2, 3, 4, 5, 7, 8];
const V_TOPICS = { 1: 'Абетка, вимова, знайомство', 2: 'М\'якість, tykanie/vykanie, професії', 3: 'Kto je to? Прізвища, країни', 4: 'Дієслова, числівники', 5: 'Числівники', 7: 'Кімната, родина', 8: 'Місто' };
const DIA = ['á', 'ä', 'č', 'ď', 'é', 'í', 'ĺ', 'ľ', 'ň', 'ó', 'ô', 'ŕ', 'š', 'ť', 'ú', 'ý', 'ž'];
const SRS_IV = [0, 1, 2, 4, 8, 16, 32];

/* ---------- іконки (власні константи) ---------- */
const I = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/></svg>',
  path: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/></svg>',
  cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="14" height="12" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v10"/></svg>',
  sheet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
  trainer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h10M4 12h16M4 17h7"/><circle cx="18" cy="7" r="2"/></svg>',
  det: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4v6h6M5 10l6 6h8"/><circle cx="19" cy="16" r="2"/></svg>',
  redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6c3-1 5-1 8 1 3-2 5-2 8-1v12c-3-1-5-1-8 1-3-2-5-2-8-1z"/><path d="M12 7v12"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19l1-4 10-10 3 3-10 10z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14l4-4M9 7l2-2a4 4 0 0 1 6 6l-2 2M15 17l-2 2a4 4 0 0 1-6-6l2-2"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-3 .5-5.5 1-8.5z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  speak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  grammar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16M4 12h10M4 19h7"/></svg>',
  vocab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 10h8M8 14h5"/></svg>'
};

/* ---------- утиліти ---------- */
const $ = (s, r = document) => r.querySelector(s);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v; /* лише для власних констант-іконок */
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
const icon = (name, cls) => h('span', { class: 'svgi ' + (cls || ''), html: I[name], style: 'display:inline-flex' });
/** **жирний** → <b>, решта як текст (вміст уроків ніколи не вставляється як HTML) */
function rich(text) {
  const f = document.createDocumentFragment();
  String(text || '').split(/(\*\*[^*]+\*\*)/).forEach(part => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) f.append(h('b', null, part.slice(2, -2)));
    else if (part) f.append(document.createTextNode(part));
  });
  return f;
}
const pad = n => String(n).padStart(2, '0');
function dstr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function today() { return dstr(new Date()); }
function addDays(s, n) { const [y, m, d] = s.split('-').map(Number); const dt = new Date(y, m - 1, d); dt.setDate(dt.getDate() + n); return dstr(dt); }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function sample(a, n) { return shuffle(a).slice(0, Math.max(0, n)); }
/** зайві пробели (на початку, в кінці, подвійні, перед крапкою) і кінцеві розділові знаки не рахуються */
function norm(s) { return String(s || '').normalize('NFC').toLowerCase().replace(/[’']/g, "'").replace(/[\s\u00a0]+/g, ' ').trim().replace(/\s*[.!?,;:…]+$/, '').replace(/\s+([.!?,;:])/g, '$1').trim(); }
function strip(s) { return norm(s).normalize('NFD').replace(/[̀-ͯ]/g, ''); }
const clone = o => JSON.parse(JSON.stringify(o));
const fmtDate = s => { const [y, m, d] = s.split('-'); return d + '.' + m; };
const UA_DAYS = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const UA_MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
const UA_WD = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
function plural(n, one, few, many) { const a = n % 10, b = n % 100; if (a === 1 && b !== 11) return one; if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few; return many; }

/* ---------- сховище ---------- */
const mem = {};
const Store = {
  get(k, d) { try { const v = localStorage.getItem('skslov.' + k); if (v != null) return JSON.parse(v); } catch (e) { /* немає доступу */ } return k in mem ? clone(mem[k]) : d; },
  set(k, v) { mem[k] = clone(v); try { localStorage.setItem('skslov.' + k, JSON.stringify(v)); } catch (e) { /* лише в пам'яті */ } },
  del(k) { delete mem[k]; try { localStorage.removeItem('skslov.' + k); } catch (e) { } }
};

/* ---------- тема: світла / темна / як у системі (окремо для кожного пристрою) ---------- */
const darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const themePref = () => Store.get('theme', 'light');
const isDark = () => { const t = themePref(); return t === 'dark' || (t === 'auto' && !!darkMQ && darkMQ.matches); };
function applyTheme() {
  const dark = isDark();
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#0E1411' : '#23854B');
}
function setTheme(t) { Store.set('theme', t); applyTheme(); if (typeof render === 'function' && PROFILE && $('#player').hidden) render(); }
applyTheme();
if (darkMQ) { try { darkMQ.addEventListener('change', () => { if (themePref() === 'auto') applyTheme(); }); } catch (e) { } }

/* ---------- звуки відповідей: синтезовані у браузері, без файлів ---------- */
let AC = null;
function sfx(kind) {
  if (S && S.settings && S.settings.sound === false) return;
  const N = {
    ok: [[880, 0, .14], [1318.5, .085, .32]],
    almost: [[784, 0, .14], [880, .1, .22]],
    bad: [[220, 0, .16, 'triangle'], [174.6, .13, .3, 'triangle']],
    done: [[523.25, 0, .14], [659.25, .11, .14], [783.99, .22, .14], [1046.5, .34, .5]]
  }[kind]; if (!N) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const t0 = AC.currentTime + 0.02, out = AC.createGain(); out.gain.value = kind === 'bad' ? 0.22 : 0.16; out.connect(AC.destination);
    N.forEach(([f, st, dur, type]) => {
      [[1, 1], [2, 0.18]].forEach(([mul, vol]) => { /* основний тон + тихий обертон — звук «дзвіночка» */
        if (type && mul > 1) return;
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = type || 'sine'; o.frequency.value = f * mul;
        g.gain.setValueAtTime(0.0001, t0 + st); g.gain.exponentialRampToValueAtTime(vol, t0 + st + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + st + dur);
        o.connect(g); g.connect(out); o.start(t0 + st); o.stop(t0 + st + dur + 0.03);
      });
    });
  } catch (e) { /* без звуку — не страшно */ }
}
function newState() { return { v: 1, rev: 0, reset: {}, course: 9, done: {}, sessions: {}, daily: {}, cards: {}, mistakes: {}, texts: [], links: {}, moves: {}, classLog: [], settings: { tts: true } }; }
let PROFILE = null, S = null;
function loadProfile(p) { PROFILE = p; S = Object.assign(newState(), Store.get('p.' + p, {})); Store.set('profile', p); oneTimeFixes(); }
/** разові правки даних. streak1: Наташі +1 день до вогника (прохання Діми 24.11.2026), лише один раз */
function oneTimeFixes() {
  S.fixes = S.fixes || {};
  if (PROFILE === 'natasha' && !S.fixes.streak1 && today() <= '2026-12-01') {
    let d = today(); if (!S.sessions[d]) d = addDays(d, -1);
    while (S.sessions[d]) d = addDays(d, -1);
    S.sessions[d] = true; S.fixes.streak1 = today(); save();
  }
}
let cloudT = null;
/** злиття прогресу з двох пристроїв: нічого пройденого не губиться */
function mergeState(a, b) {
  if (!b) return a; if (!a) return b;
  const newer = (b.rev || 0) > (a.rev || 0) ? b : a, older = newer === a ? b : a;
  const out = Object.assign(newState(), clone(newer));
  out.reset = Object.assign({}, older.reset || {}, newer.reset || {});
  Object.keys(older.reset || {}).forEach(k => { if ((older.reset[k] || 0) > (out.reset[k] || 0)) out.reset[k] = older.reset[k]; });
  out.done = {};
  [older, newer].forEach(st => { const r = st.reset || {}; Object.entries(st.done || {}).forEach(([k, v]) => { const l = k.split(':')[0]; if ((r[l] || 0) >= (out.reset[l] || 0) && (!out.done[k] || v < out.done[k])) out.done[k] = v; }); });
  out.sessions = Object.assign({}, older.sessions || {}, newer.sessions || {});
  out.daily = Object.assign({}, older.daily || {}, newer.daily || {});
  out.cards = Object.assign({}, older.cards || {});
  Object.entries(newer.cards || {}).forEach(([k, c]) => { const o = out.cards[k]; if (!o || String(c.due || '') >= String(o.due || '')) out.cards[k] = c; });
  const tx = {}; (older.texts || []).forEach(t => { tx[t.id] = t; }); (newer.texts || []).forEach(t => { tx[t.id] = t; }); out.texts = Object.values(tx);
  out.links = Object.assign({}, older.links || {}, newer.links || {});
  out.fixes = Object.assign({}, older.fixes || {}, newer.fixes || {});
  out.moves = {}; [older, newer].forEach(st => Object.entries(st.moves || {}).forEach(([k, v]) => { if (!out.moves[k] || (v.ts || 0) > (out.moves[k].ts || 0)) out.moves[k] = v; }));
  const lg = {}; [older, newer].forEach(st => (st.classLog || []).forEach(e => { lg[e.ts + '|' + e.slot] = e; })); out.classLog = Object.values(lg).sort((x, y) => x.ts - y.ts).slice(-300);
  out.rev = Math.max(a.rev || 0, b.rev || 0);
  return out;
}
const progressSig = st => Object.keys(st.done || {}).length + '|' + Object.keys(st.sessions || {}).length + '|' + Object.keys(st.cards || {}).length + '|' + Object.keys(st.mistakes || {}).length + '|' + Object.values(st.moves || {}).reduce((x, m) => Math.max(x, m.ts || 0), 0);
function save() {
  S.rev = Date.now(); Store.set('p.' + PROFILE, S);
  if (CLOUD && UID && window.Cloud) { clearTimeout(cloudT); cloudT = setTimeout(pushCloud, 1500); ntSync(); }
}
function pushCloud() {
  clearTimeout(cloudT); cloudT = null;
  if (!(CLOUD && UID && window.Cloud)) return;
  SYNC.state = 'saving';
  window.Cloud.saveProgress(UID, NAMES[PROFILE], S).then(() => { SYNC = { state: 'ok', err: '', at: new Date().toLocaleTimeString('uk-UA') }; }, e => { SYNC = { state: 'err', err: e.code || e.message, at: new Date().toLocaleTimeString('uk-UA') }; toast('Прогрес не синхронізувався: ' + SYNC.err); if ($('#player').hidden) render(); });
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && cloudT) pushCloud(); });
/** усі інші профілі — для вогників і календаря */
function othersAll() { return Object.keys(NAMES).filter(p => p !== PROFILE && !NO_STREAK[p]).map(p => { if (CLOUD) return { id: p, st: OTHER[p] || null }; const st = Store.get('p.' + p, null); return { id: p, st: st ? Object.assign(newState(), st) : null }; }); }
function otherState() { const o = PROFILE === 'dima' ? 'natasha' : 'dima'; if (CLOUD) return { id: o, st: OTHER[o] || null }; const st = Store.get('p.' + o, null); return st ? { id: o, st: Object.assign(newState(), st) } : { id: o, st: null }; }

/* ---------- вміст ---------- */
const C = { lessons: {}, errors: [] };
function addLessonObj(L, src) {
  const E = validateLesson(L);
  if (E.length) { C.errors.push(src + ': ' + E[0]); return false; }
  C.lessons[L.id] = L; return true;
}
async function loadContent() {
  C.lessons = {}; C.errors = [];
  if (CLOUD) {
    const docs = await window.Cloud.loadLessons();
    docs.forEach(d => { try { addLessonObj(JSON.parse(d.json), d.id); } catch (e) { C.errors.push(d.id); } });
    return;
  }
  (Store.get('lessons.local', []) || []).forEach(L => addLessonObj(L, 'local'));
  for (const f of LESSON_FILES) {
    try {
      const r = await fetch(f, { cache: 'no-cache' });
      const L = await r.json();
      if (!C.lessons[L.id]) addLessonObj(L, f);
    } catch (e) { C.errors.push(f); }
  }
}
const lessonsOf = tr => Object.values(C.lessons).filter(L => L.track === tr).sort((a, b) => a.num - b.num);
const lid = (tr, n) => tr + pad(n);
const dayKey = (L, d) => L.id + ':' + d.n;
const isDone = (L, d) => !!S.done[dayKey(L, d)];
const cardById = (L, id) => (L.cards || []).find(c => c.id === id);
function nextDay(tr) {
  for (const L of lessonsOf(tr)) for (const d of L.days) if (!isDone(L, d)) return { L, d };
  return null;
}
function doneSummary() { const m = {}; Object.keys(S.done).forEach(k => { const [l, n] = k.split(':'); (m[l] = m[l] || []).push(+n); }); return Object.keys(m).sort().map(l => (l[0] === 'g' ? 'Г' : 'Л') + (+l.slice(1)) + ': ' + m[l].sort((a, b) => a - b).join(',')).join(' · '); }
function lessonProgress(L) { return L.days.filter(d => isDone(L, d)).length; }

/* ---------- інтервальне повторення ---------- */
function srsLearn(L, c, knew) { const k = L.id + ':' + c.id; if (S.cards[k] && !knew) { S.cards[k].b = 1; S.cards[k].due = addDays(today(), 1); return; } S.cards[k] = { b: knew ? 2 : 1, due: addDays(today(), knew ? 2 : 1) }; }
function srsReview(key, ok) { const c = S.cards[key] || { b: 1 }; c.b = ok ? Math.min(c.b + 1, 6) : 1; c.due = addDays(today(), ok ? SRS_IV[c.b] : 1); S.cards[key] = c; }
function cardFromKey(key) { const [l, id] = key.split(':'); const L = C.lessons[l]; const c = L && cardById(L, id); return c ? { L, c, key } : null; }
function dueCards() { const t = today(); return Object.keys(S.cards).filter(k => S.cards[k].due <= t).map(cardFromKey).filter(Boolean); }
/** 65% картки поточних уроків, 35% старі (40% при 10+ старих помилках) */
function pickCards(list, n) {
  const cur = new Set([lid('g', S.course), (nextDay('g') || {}).L && nextDay('g').L.id, (nextDay('v') || {}).L && nextDay('v').L.id]);
  const a = shuffle(list.filter(x => cur.has(x.L.id))), b = shuffle(list.filter(x => !cur.has(x.L.id)));
  const nb = Math.min(b.length, Math.round(n * oldShare())); const out = a.slice(0, n - nb).concat(b.slice(0, nb));
  return shuffle(out.length < n ? out.concat(b.slice(nb, nb + n - out.length)) : out);
}

/** частка минулих уроків у повторенні: 35%, а при 10+ помилках з минулих уроків — 40% */
function oldShare() { const cur = new Set([(nextDay('g') || {}).L, (nextDay('v') || {}).L].filter(Boolean).map(L => L.id)); return Object.values(S.mistakes).filter(m => m.lid && !cur.has(m.lid)).length >= 10 ? 0.4 : 0.35; }
/* ---------- помилки ---------- */
function addMistake(item) {
  if (!item.mkey) return;
  const m = S.mistakes[item.mkey] || { lid: item.L ? item.L.id : '', task: item.task, n: 0, ok: 0 };
  m.n++; m.ok = 0; m.last = today(); S.mistakes[item.mkey] = m; save();
}
function fixMistake(item) {
  const m = S.mistakes[item.mkey]; if (!m) return;
  delete S.mistakes[item.mkey]; save();
}
const mistakeCount = () => Object.keys(S.mistakes).length;

/* ---------- побудова завдань ---------- */
function expandTask(L, t, base) {
  if (t.t === 'learn') return t.cards.map(id => cardById(L, id)).filter(Boolean).map(c => ({ type: 'learn', L, card: c }));
  if (t.t === 'read') {
    const out = [{ type: 'readp', L, paras: t.p }];
    (t.qs || []).forEach(qi => { const q = L.text.qs[qi]; out.push({ type: 'choice', L, mkey: L.id + ':q' + qi, task: { t: 'choice', q: 'Питання до тексту', sk: q.q, uk: q.uk, o: q.o, a: q.a, why: q.why } }); });
    return out;
  }
  return [{ type: t.t, L, task: t, mkey: base }];
}
const GRADED = ['choice', 'input', 'match', 'det', 'tr', 'build', 'dict'];
function lessonPool(L) {
  const pool = [];
  L.days.forEach(d => { if (d.kind === 'new') d.tasks.forEach((t, i) => { if (GRADED.includes(t.t)) pool.push({ type: t.t, L, task: t, mkey: L.id + ':' + d.n + ':' + i }); }); });
  return pool;
}
function mistakeItems(filter) {
  return Object.entries(S.mistakes).filter(([k, m]) => !filter || filter(m)).map(([k, m]) => ({ type: m.task.t, L: C.lessons[m.lid] || null, task: m.task, mkey: k, fromMistakes: true }));
}
function reviewItems(L, count) {
  const nCur = Math.round(count * (1 - oldShare()));
  const cards = (L.cards || []).map(c => ({ type: 'flash', L, card: c, key: L.id + ':' + c.id, dir: Math.random() < 0.5 ? 'sk' : 'uk' }));
  const nCards = Math.min(3, cards.length);
  const cur = sample(lessonPool(L), nCur - nCards).concat(sample(cards, nCards));
  const nOld = count - nCur;
  let old = sample(mistakeItems(m => m.lid !== L.id), Math.ceil(nOld / 2));
  /** граматика й вправи з уже пройдених уроків, а не лише картки */
  const started = Object.values(C.lessons).filter(X => X.id !== L.id && X.days.some(d => isDone(X, d)));
  old = old.concat(sample(started.flatMap(X => lessonPool(X).filter(x => x.type !== 'match')), nOld - old.length));
  if (old.length < nOld) {
    const others = Object.keys(S.cards).map(cardFromKey).filter(x => x && x.L.id !== L.id).map(x => ({ type: 'flash', L: x.L, card: x.c, key: x.key, dir: 'sk' }));
    old = old.concat(sample(others, nOld - old.length));
  }
  const week = addDays(today(), -7);
  const own = sample(mistakeItems(m => m.lid === L.id), 3).concat(sample(mistakeItems(m => m.lid !== L.id && (m.last || '') >= week), 2));
  let all = cur.concat(old, own);
  if (all.length < count) all = all.concat(sample(lessonPool(L), count - all.length));
  const seen = new Set(); all = all.filter(x => !x.mkey || (seen.has(x.mkey) ? false : (seen.add(x.mkey), true)));
  return shuffle(all);
}
/** міні-повтор на початку нового дня: 3–4 вправи з того, що пройдено 1–3 дні тому */
const MINI = ['tr', 'build', 'choice', 'input', 'det'];
function miniReview(L, d) {
  const from = addDays(today(), -3), t0 = today(), pool = [];
  Object.values(C.lessons).forEach(X => X.days.forEach(dd => { const dt = S.done[dayKey(X, dd)]; if (dd.kind === 'new' && dt && dt >= from && dt < t0 && !(X.id === L.id && dd.n === d.n)) dd.tasks.forEach((t, i) => { if (MINI.includes(t.t)) pool.push({ type: t.t, L: X, task: t, mkey: X.id + ':' + dd.n + ':' + i, mini: true }); }); }));
  if (pool.length < 3) L.days.forEach(dd => { if (dd.kind === 'new' && dd.n < d.n) dd.tasks.forEach((t, i) => { if (MINI.includes(t.t)) pool.push({ type: t.t, L, task: t, mkey: L.id + ':' + dd.n + ':' + i, mini: true }); }); });
  const seen = new Set(); return sample(pool.filter(x => !seen.has(x.mkey) && seen.add(x.mkey)), d.n === 1 && !pool.length ? 0 : 4);
}
function dayItems(L, d) {
  let out = [];
  d.tasks.forEach((t, i) => { out = out.concat(expandTask(L, t, L.id + ':' + d.n + ':' + i)); });
  if (d.kind === 'review') out = reviewItems(L, d.count || 10).concat(out);
  else out = miniReview(L, d).concat(out);
  return out;
}
function flashItems(list) { return list.map(x => ({ type: 'flash', L: x.L, card: x.c, key: x.key, dir: Math.random() < 0.6 ? 'sk' : 'uk' })); }

/* ---------- маршрутизація ---------- */
const VIEWS = {};
let ROUTE = 'today';
function go(r) { if (location.hash.slice(1) === r) render(); else location.hash = r; }
function render() {
  stopSpeech();
  ROUTE = location.hash.slice(1) || 'today';
  const [name, ...rest] = ROUTE.split('-');
  const fn = VIEWS[name] || VIEWS.today;
  const main = $('#main'); main.replaceChildren(); main.scrollTop = 0; window.scrollTo(0, 0);
  try { fn(main, rest.join('-')); } catch (e) { main.append(h('div', { class: 'note' }, 'Помилка відображення: ' + e.message)); console.error(e); }
  renderNav(name);
}
const NAV = [
  ['today', 'Сьогодні', 'home', true], ['lessons', 'Уроки', 'path', true], ['cards', 'Картки', 'cards', true], ['cheats', 'Шпаргалки', 'sheet', true],
  ['trainer', 'Тренажер форм', 'trainer'], ['det', 'Визначник', 'det'], ['mistakes', 'Помилки', 'redo'], ['reading', 'Читання', 'book'],
  ['texts', 'Мої тексти', 'pen'], ['phrases', 'Фрази', 'chat'], ['eslovak', 'e-slovak', 'link'], ['add', 'Додати урок', 'plus'], ['more', 'Налаштування', 'gear']
];
function renderNav(cur) {
  const map = { lesson: 'lessons', cheat: 'cheats', read: 'reading', text: 'texts', howto: 'add' };
  const active = map[cur] || cur;
  const side = $('#side'); side.replaceChildren(
    h('div', { class: 'logo' }, 'slovenčina'),
    PILOT ? h('div', { class: 'pilot' }, 'Пілот: прогрес зберігається лише в цьому браузері') : '',
    ...NAV.map(([r, label, ic]) => h('a', { class: 'nav' + (active === r ? ' on' : ''), href: '#' + r }, icon(ic), label, r === 'mistakes' && mistakeCount() ? h('span', { class: 'badge' }, mistakeCount()) : null)),
    h('div', { style: 'margin-top:auto;padding:14px 12px 0' }, h('button', { class: 'chip', onclick: switchProfile }, NAMES[PROFILE] + (CLOUD ? ' · вийти' : ' · змінити')))
  );
  const moreActive = !['today', 'lessons', 'cards', 'cheats'].includes(active);
  $('#bottom').replaceChildren(...NAV.filter(n => n[3]).map(([r, label, ic]) => h('a', { class: 'bnav' + (active === r ? ' on' : ''), href: '#' + r }, icon(ic), label)),
    h('a', { class: 'bnav' + (moreActive ? ' on' : ''), href: '#more' }, icon('more'), 'Ще'));
}

/* ---------- діалоги ---------- */
function dialog(title, body, buttons) {
  closeDialog();
  const box = h('div', { class: 'box', role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, h('h2', null, title), body, h('div', { class: 'row wrap', style: 'justify-content:flex-end' }, buttons.map(([label, fn, cls]) => h('button', { class: 'btn small ' + (cls || ''), onclick: () => { if (fn() !== false) closeDialog(); } }, label))));
  const d = h('div', { id: 'dlg', onclick: e => { if (e.target.id === 'dlg') closeDialog(); } }, box);
  document.body.append(d);
  const f = box.querySelector('input,textarea,button'); if (f) f.focus();
}
function closeDialog() { const d = $('#dlg'); if (d) d.remove(); }
let toastT;
function toast(msg) { let t = $('#toast'); if (!t) { t = h('div', { id: 'toast', role: 'status' }); document.body.append(t); } t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
function chooseCourse() {
  let pick = S.course;
  const grid = h('div', { class: 'numgrid' }, Array.from({ length: 35 }, (_, i) => i + 1).map(n => h('button', { class: n === pick ? 'on' : '', onclick: e => { pick = n; grid.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.textContent === n)); } }, n)));
  dialog('На якому уроці зараз курс?', h('div', { class: 'col' }, h('p', { class: 'muted small' }, 'Урок за підручником (заняття у вівторок). Нічого не перемикається саме: це лише орієнтир.'), grid), [['Скасувати', () => { }, 'ghost'], ['Зберегти', () => { S.course = pick; save(); render(); }]]);
}
function switchProfile() {
  if (CLOUD) { dialog('Вийти з акаунта?', h('p', null, 'Прогрес збережено в базі. Увійти знову можна через Google.'), [['Скасувати', () => { }, 'ghost'], ['Вийти', () => { pushCloud(); window.Cloud.signOut(); }, 'orange']]); return; }
  dialog('Хто зараз вчиться?', h('p', { class: 'muted' }, 'У кожного свій прогрес. Після підключення Firebase вхід буде через Google.'), Object.keys(NAMES).map(p => [NAMES[p], () => { loadProfile(p); render(); }, PROFILE === p ? '' : 'ghost']));
}

/* ---------- озвучка (лише якщо є словацький голос) ---------- */
let SK_VOICE = null;
function findVoice() { try { const vs = speechSynthesis.getVoices(); SK_VOICE = vs.find(v => /^sk/i.test(v.lang)) || null; } catch (e) { SK_VOICE = null; } }
function stopSpeech() { try { speechSynthesis.cancel(); } catch (e) { } }
try { findVoice(); speechSynthesis.onvoiceschanged = () => { const had = !!SK_VOICE; findVoice(); if (!had && SK_VOICE && PROFILE && $('#player').hidden) render(); }; } catch (e) { }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') stopSpeech(); });
window.addEventListener('pagehide', stopSpeech);
function speakBtn(text, light) {
  if (!SK_VOICE || S.settings.tts === false) return null;
  return h('button', { class: 'iconbtn', 'aria-label': 'Озвучити', style: light ? 'color:#fff' : null, onclick: () => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/\(.*?\)/g, '')); u.voice = SK_VOICE; u.lang = SK_VOICE.lang; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) { } } }, icon('speak'));
}

/* ---------- блоки шпаргалок ---------- */
function renderBlocks(blocks) {
  return h('div', { class: 'blocks' }, (blocks || []).map(b => {
    if (b.t === 'p') return h('p', null, rich(b.x));
    if (b.t === 'h') return h('h4', null, rich(b.x));
    if (b.t === 'trap') return h('div', { class: 'trap' }, rich(b.x));
    if (b.t === 'list') return h('ul', null, b.items.map(x => h('li', null, rich(x))));
    if (b.t === 'table') return h('div', { class: 'tablewrap' }, h('table', null, b.head ? h('thead', null, h('tr', null, b.head.map(c => h('th', null, rich(c))))) : null, h('tbody', null, b.rows.map(r => h('tr', null, r.map(c => h('td', null, rich(c))))))));
    return null;
  }));
}
const findCheat = (L, id) => L && (L.cheats || []).find(c => c.id === id);

/* =====================================================================
   ПЛЕЄР СЕСІЇ
   ===================================================================== */
const PL = { items: [], i: 0, parts: [], done: 0, total: 0, stats: { ok: 0, bad: 0, almost: 0 }, onEnd: null, cur: null, title: '', started: 0, retried: new Set() };

function startSession(opts) {
  const parts = (opts.parts || []).filter(p => p && p.items && p.items.length);
  PL.items = []; PL.parts = parts;
  parts.forEach((p, pi) => { p.left = p.items.length; p.items.forEach(it => { it.part = pi; PL.items.push(it); }); });
  if (!PL.items.length) { toast('Тут поки немає завдань'); return; }
  Object.assign(PL, { i: 0, total: PL.items.length, done: 0, stats: { ok: 0, bad: 0, almost: 0 }, onEnd: opts.onEnd || null, title: opts.title || '', started: Date.now(), retried: new Set() });
  PL.label = opts.label || opts.title || ''; PL.resumeKey = opts.resumeKey || 'misc:' + (opts.label || opts.title || 'сесія');
  openPlayer();
  showItem();
}
function openPlayer() {
  $('#player').hidden = false; document.body.style.overflow = 'hidden'; document.documentElement.style.overscrollBehavior = 'none';
  plHistPush();
}
function closePlayer(after) { $('#player').hidden = true; document.body.style.overflow = ''; document.documentElement.style.overscrollBehavior = ''; closeCheat(); render(); plHistPop(after); }
function askExit() {
  const saved = PL.i < PL.items.length;
  dialog('Вийти з сесії?', h('p', null, saved ? 'Прогрес збережено: наступного разу продовжиш з ' + Math.min(PL.done + 1, PL.total) + '-го завдання з ' + PL.total + '.' : 'Сесію завершено.'), [['Продовжити', () => { }, 'ghost'], ['Вийти', () => { closePlayer(); }, 'orange']]);
}
/* Жест «назад» на телефоні (свайп від краю) не закриває застосунок, а питає, чи вийти з сесії */
let PL_HIST = false, POP_CB = null;
function plHistPush() { if (!PL_HIST) { try { history.pushState({ pl: 1 }, ''); PL_HIST = true; } catch (e) { } } }
function plHistPop(after) { if (PL_HIST) { PL_HIST = false; POP_CB = after || (() => { }); history.back(); } else if (after) after(); }
window.addEventListener('popstate', () => {
  if (POP_CB) { const f = POP_CB; POP_CB = null; f(); return; }
  if (!$('#player').hidden) { PL_HIST = false; plHistPush(); if ($('#dlg')) closeDialog(); else askExit(); }
});

/* ---------- незавершена сесія: зберігається після кожного кроку в цьому браузері ---------- */
/* Кожна незавершена сесія — окремий «слот» за ключем (день уроку, «today», розминка…).
   Слоти лежать у браузері й у Firestore sessions/{uid}/slots/{id}, тож продовжити можна з іншого пристрою.
   Завершена або скинута сесія лишає маленьку «надгробну» позначку {gone:true}, щоб інші пристрої її не воскресили. */
const SLOT_TTL = 3 * 864e5;
const slotsKey = () => 'sess2.' + PROFILE;
function slotsGet() {
  if (!PROFILE) return {};
  const sl = Store.get(slotsKey(), null) || {};
  const old = Store.get('sess.' + PROFILE, null); // версія 2.0: один слот
  if (old && old.resumeKey && !sl[old.resumeKey]) { sl[old.resumeKey] = old; Store.set(slotsKey(), sl); }
  if (old) Store.del('sess.' + PROFILE);
  return sl;
}
function slotsSet(sl) {
  const now = Date.now();
  Object.keys(sl).forEach(k => { if (now - (sl[k].at || 0) > 14 * 864e5) delete sl[k]; });
  Store.set(slotsKey(), sl);
}
const slotId = k => String(k).toLowerCase().replace(/[^a-z0-9_-]+/g, '_').slice(0, 60) || 'x';
const slotOk = v => v && v.v === 1 && !v.gone && Array.isArray(v.items) && v.i < v.items.length && Date.now() - v.at < SLOT_TTL;
function snapSession() {
  if (!PROFILE || !PL.resumeKey || !PL.items.length || PL.i >= PL.items.length) return;
  try {
    const ser = it => { const o = {}; Object.keys(it).forEach(k => { const v = it[k]; if (typeof v !== 'function') o[k] = k === 'L' ? (v ? v.id : null) : v; }); return o; };
    const sl = slotsGet();
    sl[PL.resumeKey] = { v: 1, at: Date.now(), dev: DEV, label: PL.label, resumeKey: PL.resumeKey, title: PL.title, i: PL.i, done: PL.done, total: PL.total, stats: PL.stats, spent: Date.now() - PL.started, retried: [...PL.retried], parts: PL.parts.map(p => ({ key: p.key || null, left: p.left })), items: PL.items.map(ser) };
    slotsSet(sl); slotQueue(PL.resumeKey);
  } catch (e) { /* немає місця — не страшно */ }
}
/** з ключем — цей слот; без ключа — найсвіжіший */
function savedSession(key) {
  const sl = slotsGet();
  if (key) return slotOk(sl[key]) ? sl[key] : null;
  return Object.values(sl).filter(slotOk).sort((x, y) => y.at - x.at)[0] || null;
}
const savedList = () => Object.values(slotsGet()).filter(slotOk).sort((x, y) => y.at - x.at);
function dropSession(key) {
  if (!PROFILE || !key) return;
  const sl = slotsGet(); sl[key] = { v: 1, gone: true, at: Date.now(), resumeKey: key }; slotsSet(sl); slotQueue(key, true);
}
let SLOT_Q = new Set(), slotT = null, slotPullAt = 0;
function slotQueue(key, now) {
  if (!(CLOUD && UID && window.Cloud && window.Cloud.saveSlot)) return;
  SLOT_Q.add(key); clearTimeout(slotT); slotT = setTimeout(slotFlush, now ? 0 : 4000);
}
function slotFlush() {
  clearTimeout(slotT); slotT = null; if (!(CLOUD && UID && window.Cloud && window.Cloud.saveSlot)) return;
  const sl = slotsGet();
  SLOT_Q.forEach(k => { const v = sl[k]; if (v) window.Cloud.saveSlot(UID, slotId(k), JSON.stringify(v)).catch(() => { }); });
  SLOT_Q.clear();
}
async function slotPull(force) {
  if (!(CLOUD && UID && window.Cloud && window.Cloud.loadSlots)) return;
  if (!force && Date.now() - slotPullAt < 20000) return; slotPullAt = Date.now();
  let list; try { list = await window.Cloud.loadSlots(UID); } catch (e) { return; }
  const sl = slotsGet(); let changed = false;
  list.forEach(d => { let v; try { v = JSON.parse(d.json); } catch (e) { return; } const k = v && v.resumeKey; if (!k || SLOT_Q.has(k)) return; if (!sl[k] || (v.at || 0) > (sl[k].at || 0)) { sl[k] = v; changed = true; } });
  if (changed) { slotsSet(sl); if ($('#player').hidden && ['today', 'lessons', 'lesson'].includes(ROUTE.split('-')[0])) render(); }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { if (slotT) slotFlush(); } else if ($('#player').hidden) slotPull(); });
function resumeSession(s) {
  s = s || savedSession(); if (!s) return false;
  const items = s.items.map(o => Object.assign({}, o, { L: o.L ? C.lessons[o.L] || null : null }));
  if (items.some((it, k) => s.items[k].L && !it.L)) { dropSession(s.resumeKey); toast('Урок змінився, сесію почато заново'); return false; }
  let i = s.i; if (items[i] && items[i].answered) i++;
  PL.items = items; PL.parts = s.parts;
  Object.assign(PL, { i, total: s.total, done: s.done, stats: s.stats, onEnd: null, title: s.title, label: s.label, resumeKey: s.resumeKey, started: Date.now() - (s.spent || 0), retried: new Set(s.retried || []) });
  openPlayer(); showItem(); return true;
}
function resumeCard() {
  const list = savedList().filter(x => x.resumeKey !== 'today').slice(0, 3); if (!list.length) return null;
  const when = x => fmtDate(dstr(new Date(x.at))) + ' о ' + hm(new Date(x.at)) + (x.dev && x.dev !== DEV ? ' · з іншого пристрою' : '');
  const ask = x => dialog('Скинути незавершену сесію?', h('p', null, 'Завершені дні лишаться пройденими. Зникне лише місце, де ти зупинився в «' + (x.label || x.title) + '».'), [['Ні', () => { }, 'ghost'], ['Скинути', () => { dropSession(x.resumeKey); render(); }, 'orange']]);
  return h('div', { class: 'card raised', style: 'border-color:#E07B2E' }, h('span', { class: 'kicker' }, list.length > 1 ? 'Незавершені сесії' : 'Незавершена сесія'),
    list.map((x, n) => h('div', { class: 'col', style: 'gap:8px' + (n ? ';border-top:1px solid var(--line);padding-top:12px' : '') },
      h('div', { class: 'col', style: 'gap:2px' }, h('h3', null, x.label || x.title), h('span', { class: 'small muted' }, 'Пройдено ' + x.done + ' з ' + x.total + ' · ' + when(x))),
      h('div', { class: 'row', style: 'gap:8px' }, h('button', { class: 'btn grow' + (n ? ' ghost' : ''), onclick: () => resumeSession(x) }, 'Продовжити'), h('button', { class: 'btn ghost', onclick: () => ask(x) }, 'Скинути')))));
}

function progressUI() { $('#pl-fill').style.width = Math.round(100 * PL.done / Math.max(1, PL.total)) + '%'; $('#pl-count').textContent = Math.min(PL.done + 1, PL.total) + '/' + PL.total; }

function showItem() {
  closeCheat(); stopSpeech();
  if (PL.i >= PL.items.length) return endSession();
  const it = PL.items[PL.i]; PL.cur = it;
  progressUI();
  const cheatId = it.task && it.task.cheat;
  const cheat = findCheat(it.L, cheatId) || (it.L && it.L.cheats && it.L.cheats.length && GRADED.includes(it.type) ? it.L.cheats[0] : null);
  const cb = $('#pl-cheatbtn'); cb.hidden = !cheat; cb.onclick = () => openCheat(it.L, cheat);
  const body = $('#pl-body'); body.replaceChildren(); body.scrollTop = 0;
  const inner = h('div', { class: 'pl-inner' });
  const kick = it.L ? h('div', { class: 'kicker' + (it.L.track === 'v' ? ' v' : '') }, (it.L.track === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + it.L.num + (it.fromMistakes ? ' · помилка' : '') + (it.mini ? ' · повтор' : '') + (it.retry ? ' · ще раз' : '')) : null;
  if (kick) inner.append(kick);
  body.append(inner);
  const R = RENDER[it.type];
  if (!R) { next(); return; }
  PL.ctl = R(it, inner) || {};
  setFoot(PL.ctl.primary || null);
  snapSession();
  const fe = PL.ctl.focus; if (fe) setTimeout(() => { if (fe.isConnected) fe.focus(); }, 30);
}
/** нижня панель: кнопка дії або фідбек */
function setFoot(primary) {
  const foot = $('#pl-foot'); foot.className = 'pl-foot';
  if (!primary) { foot.replaceChildren(); foot.hidden = true; return; }
  foot.hidden = false;
  const b = h('button', { class: 'btn wide', id: 'pl-primary', onclick: primary.fn }, primary.label);
  if (primary.disabled) b.disabled = true;
  foot.replaceChildren(h('div', { class: 'in' }, h('div', { class: 'fb' }), h('div', { class: 'foot-act' }, b, h('div', { class: 'keys' }, primary.keys || 'Enter'))));
}
function enablePrimary(on) { const b = $('#pl-primary'); if (b) b.disabled = !on; }
/** показати результат. res: {status:'ok'|'almost'|'bad', answer, user, why} */
function feedback(it, res) {
  const first = !it.answered; it.answered = true;
  sfx(res.status);
  if (res.status === 'ok') { PL.stats.ok++; if (it.fromMistakes || it.retry) fixMistake(it); }
  else if (res.status === 'almost') { PL.stats.almost++; addMistake(it); }
  else { PL.stats.bad++; addMistake(it); if (!PL.retried.has(PL.i) && !it.retry) { PL.retried.add(PL.i); PL.items.push(Object.assign({}, it, { retry: true, answered: false, part: -1 })); PL.total++; } }
  const titles = { ok: ['Правильно!', 'Так!', 'Чудово!', 'Точно!'], almost: ['Майже!'], bad: ['Не зовсім'] };
  const t = titles[res.status]; const title = t[Math.floor(Math.random() * t.length)];
  const foot = $('#pl-foot'); foot.hidden = false; foot.className = 'pl-foot ' + res.status;
  const fb = h('div', { class: 'fb', role: 'status' }, h('div', { class: 't' }, title));
  if (res.status === 'almost') fb.append(h('div', null, 'Правильно: ', highlightMissing(res.answer, res.user), '. Перевір діакритику.'));
  if (res.status === 'bad' && res.answer) fb.append(h('div', null, 'Правильна відповідь: ', h('b', null, res.answer)));
  if (res.why) fb.append(h('div', null, h('b', null, 'Чому: '), rich(res.why)));
  if (res.status !== 'ok' && it.mkey) fb.append(h('div', { class: 'tiny' }, 'Це завдання повернеться в «Помилках».'));
  const nb = h('button', { class: 'btn wide ' + (res.status === 'ok' ? '' : 'orange'), id: 'pl-primary', onclick: next }, res.status === 'ok' ? 'Далі' : 'Зрозуміло');
  foot.replaceChildren(h('div', { class: 'in' }, fb, h('div', { class: 'foot-act' }, nb, h('div', { class: 'keys' }, 'Enter · далі'))));
  PL.ctl = Object.assign(PL.ctl || {}, { locked: true });
  if (first) markPart(it);
  setTimeout(() => nb.focus(), 30);
}
function highlightMissing(ans, user) {
  const a = String(ans).normalize('NFC'), u = String(user || '').normalize('NFC').toLowerCase().trim();
  const sp = h('b'); [...a].forEach((ch, i) => { if (u[i] !== undefined && ch.toLowerCase() !== u[i]) sp.append(h('span', { class: 'miss' }, ch)); else sp.append(ch); });
  return sp;
}
function markPart(it) {
  PL.done = Math.min(PL.done + 1, PL.total);
  if (it.part >= 0) { const p = PL.parts[it.part]; p.left--; if (p.left <= 0 && p.key) { S.done[p.key] = today(); save(); } }
  progressUI(); snapSession();
}
function next() { if (PL.cur && !PL.cur.answered) { PL.cur.answered = true; markPart(PL.cur); } PL.i++; showItem(); }
function endSession() {
  dropSession(PL.resumeKey);
  const mins = Math.max(1, Math.round((Date.now() - PL.started) / 60000));
  if (PL.onEnd) PL.onEnd();
  if (PL.stats.ok + PL.stats.bad + PL.stats.almost > 0 || PL.total > 0) S.sessions[today()] = true;
  if (PL.resumeKey === 'today') { S.daily = S.daily || {}; S.daily[today()] = true; }
  save();
  closeCheat(); $('#pl-cheatbtn').hidden = true;
  $('#pl-fill').style.width = '100%';
  const graded = PL.stats.ok + PL.stats.bad + PL.stats.almost;
  setTimeout(() => sfx('done'), 150);
  $('#pl-body').replaceChildren(h('div', { class: 'pl-inner endscreen' },
    h('div', { class: 'big' }, 'Готово!'),
    h('h2', null, PL.title || 'Сесію завершено'),
    graded ? h('p', { class: 'b' }, 'Правильно ' + PL.stats.ok + ' з ' + graded + (PL.stats.almost ? ' · майже: ' + PL.stats.almost : '')) : null,
    h('p', { class: 'muted' }, 'Час: ~' + mins + ' хв'),
    mistakeCount() ? h('p', { class: 'muted small' }, 'У «Помилках» зараз ' + mistakeCount() + '. Вони повернуться в днях повторення.') : null
  ));
  setFoot({ label: 'На головну', fn: () => { closePlayer(() => go('today')); } });
}

/* ---------- шпаргалка в сесії: тільки на запит ---------- */
function openCheat(L, cheat) {
  if (!cheat) return;
  const p = $('#pl-cheat');
  p.replaceChildren(h('div', { class: 'hd' }, h('h3', null, 'Шпаргалка · ' + cheat.title), h('button', { class: 'btn ghost small', onclick: closeCheat }, 'Згорнути')), h('div', { class: 'bd' }, renderBlocks(cheat.blocks), (L.cheats || []).length > 1 ? h('div', { class: 'row wrap', style: 'margin-top:16px' }, L.cheats.filter(c => c !== cheat).map(c => h('button', { class: 'chip', onclick: () => openCheat(L, c) }, c.title))) : null));
  p.hidden = false; $('#pl-scrim').hidden = false; $('#pl-cheatbtn').setAttribute('aria-expanded', 'true');
}
function closeCheat() { $('#pl-cheat').hidden = true; $('#pl-scrim').hidden = true; const b = $('#pl-cheatbtn'); if (b) b.setAttribute('aria-expanded', 'false'); }

/* ---------- рендерери завдань ---------- */
function sentence(sk, blankText) {
  const parts = String(sk).split('___');
  const el = h('div', { class: 'sent', lang: 'sk' });
  parts.forEach((p, i) => { el.append(rich(p)); if (i < parts.length - 1) el.append(h('span', { class: 'blank' }, blankText || ' ')); });
  return el;
}
function diaBar(input) {
  return h('div', { class: 'dia', 'aria-label': 'Літери з діакритикою' }, DIA.map(ch => h('button', { type: 'button', tabindex: '-1', onmousedown: e => e.preventDefault(), onclick: () => {
    const s = input.selectionStart ?? input.value.length, e2 = input.selectionEnd ?? s;
    input.value = input.value.slice(0, s) + ch + input.value.slice(e2); input.focus(); input.setSelectionRange(s + 1, s + 1); input.dispatchEvent(new Event('input'));
  } }, ch)));
}
function checkText(val, answers) {
  const v = norm(val);
  for (const a of answers) if (norm(a) === v) return { status: 'ok', answer: a };
  for (const a of answers) if (strip(a) === strip(val)) return { status: 'almost', answer: a, user: val };
  return { status: 'bad', answer: answers[0] };
}
const RENDER = {};
/** append без null/false: DOM-овий append перетворює null на текст «null» */
function put(el, ...kids) { kids.flat(Infinity).forEach(c => { if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c))); }); return el; }
/** підказка (слово словацькою + переклад) відкривається лише на запит */
function hintEl(t) {
  if (!(t.hint || t.uk)) return null;
  const body = h('div', { class: 'hint', hidden: !t.showHint }, t.hint ? h('span', null, 'Підказка: ', h('b', { lang: 'sk' }, t.hint), t.uk ? ' · ' : '') : null, t.uk ? '«' + t.uk + '»' : null);
  if (t.showHint) return body;
  const btn = h('button', { class: 'link', style: 'align-self:flex-start', onclick: () => wrap.reveal() }, 'Підказка');
  const wrap = h('div', { class: 'col', style: 'gap:4px' }, btn, body);
  wrap.reveal = () => { body.hidden = false; if (btn.isConnected) btn.remove(); };
  return wrap;
}

RENDER.rule = (it, root) => {
  const t = it.task; const opt = t.opt || /^(Підготовка|Домашнє завдання)/.test(t.title || '');
  put(root, opt ? h('div', { class: 'kicker opt' }, h('span', { class: 'badge' }, 'Необов\'язково')) : null, h('h1', null, t.title || 'Правило'), renderBlocks(t.blocks));
  return { primary: { label: opt ? 'Пропустити / Далі' : 'Зрозуміло', fn: next } };
};

RENDER.learn = (it, root) => {
  const c = it.card; let shown = false;
  const tr = h('div', { class: 'tr', hidden: true }, c.uk);
  const ex = c.ex ? h('div', { class: 'ex', lang: 'sk', hidden: true }, c.ex) : null;
  const reveal = h('button', { class: 'btn ghost small', onclick: () => show() }, 'Показати переклад');
  const knew = h('div', { class: 'row', hidden: true, style: 'width:100%' },
    h('button', { class: 'btn ghost grow', onclick: () => done(false) }, 'Ще вчу'),
    h('button', { class: 'btn grow', onclick: () => done(true) }, 'Вже знаю'));
  function show() { shown = true; tr.hidden = false; if (ex) ex.hidden = false; reveal.hidden = true; knew.hidden = false; }
  function done(k) { srsLearn(it.L, c, k); save(); next(); }
  put(root, h('h2', null, 'Нове слово'), h('div', { class: 'flash' }, h('div', { class: 'row' }, h('div', { class: 'fw', lang: 'sk' }, c.sk), speakBtn(c.sk)), tr, ex, reveal), knew);
  return { keys: e => { if (e.key === 'Enter' || e.key === ' ') { if (!shown) show(); else done(true); return true; } if (shown && e.key === '1') { done(false); return true; } if (shown && e.key === '2') { done(true); return true; } }, focus: reveal };
};

RENDER.flash = (it, root) => {
  const c = it.card; let shown = false;
  const front = it.dir === 'uk' ? c.uk : c.sk, back = it.dir === 'uk' ? c.sk : c.uk;
  const bk = h('div', { class: 'tr', hidden: true, lang: it.dir === 'uk' ? 'sk' : 'uk' }, back);
  const ex = c.ex ? h('div', { class: 'ex', lang: 'sk', hidden: true }, c.ex) : null;
  const reveal = h('button', { class: 'btn ghost small', onclick: () => show() }, 'Показати');
  const grade = h('div', { class: 'row', hidden: true, style: 'width:100%' },
    h('button', { class: 'btn ghost grow', onclick: () => done(false) }, 'Не згадав(-ла)'),
    h('button', { class: 'btn grow', onclick: () => done(true) }, 'Згадав(-ла)'));
  function show() { shown = true; bk.hidden = false; if (ex) ex.hidden = false; reveal.hidden = true; grade.hidden = false; }
  function done(ok) { srsReview(it.key, ok); save(); if (ok) PL.stats.ok++; else PL.stats.bad++; next(); }
  put(root, h('h2', null, it.dir === 'uk' ? 'Як це словацькою?' : 'Що це означає?'), h('div', { class: 'flash' }, h('div', { class: 'row' }, h('div', { class: 'fw', lang: it.dir === 'uk' ? 'uk' : 'sk' }, front), it.dir === 'sk' ? speakBtn(c.sk) : null), bk, ex, reveal), grade);
  return { keys: e => { if (e.key === 'Enter' || e.key === ' ') { if (!shown) show(); else done(true); return true; } if (shown && e.key === '1') { done(false); return true; } if (shown && e.key === '2') { done(true); return true; } }, focus: reveal };
};

RENDER.choice = (it, root) => {
  const t = it.task; let sel = -1;
  const order = shuffle(t.o.map((x, i) => i));
  const blank = h('span');
  put(root, h('h1', null, t.q || 'Обери відповідь'));
  let sentEl = null;
  if (t.sk) { sentEl = sentence(t.sk); put(root, sentEl); }
  const hw = hintEl(t); if (hw) put(root, hw);
  const btns = order.map((oi, k) => h('button', { class: 'opt', onclick: () => pick(k) }, h('span', { class: 'k' }, k + 1), h('span', { lang: 'sk' }, t.o[oi])));
  put(root, h('div', { class: 'opts' + (t.o.every(x => x.length < 22) ? ' two' : '') }, btns));
  function pick(k) { if (PL.ctl.locked) return; sel = k; btns.forEach((b, j) => b.classList.toggle('sel', j === k)); enablePrimary(true); }
  function check() {
    if (sel < 0 || PL.ctl.locked) return;
    if (hw && hw.reveal) hw.reveal();
    const ok = order[sel] === t.a;
    btns.forEach((b, j) => { b.disabled = true; b.classList.remove('sel'); if (order[j] === t.a) b.classList.add('ok'); else if (j === sel) b.classList.add('bad'); });
    if (sentEl) { const bl = sentEl.querySelector('.blank'); if (bl) { bl.textContent = t.o[t.a]; bl.classList.add(ok ? 'ok' : 'bad'); } }
    feedback(it, { status: ok ? 'ok' : 'bad', answer: ok ? null : t.o[t.a], why: t.why });
  }
  return { primary: { label: 'Перевірити', fn: check, disabled: true, keys: 'Enter · перевірити · 1–' + t.o.length + ' · варіанти' }, keys: e => { const n = parseInt(e.key, 10); if (n >= 1 && n <= btns.length) { pick(n - 1); return true; } if (e.key === 'Enter') { if (!PL.ctl.locked) { check(); return true; } } } };
};

/* ---------- слово для пропуску: переклад видно одразу, словацьке слово й переклад речення — за «Підказкою» ----------
   Беремо з поля завдання (wuk / wsk), а якщо їх немає — з карток, форм, дієслів і словника текстів уроків. */
const CYR = /[а-яіїєґ]/i;
const PRON = ['ja', 'ty', 'on', 'ona', 'ono', 'my', 'vy', 'oni', 'ony'];
const PRON_UK = ['я', 'ти', 'він', 'вона', 'воно', 'ми', 'ви', 'вони'];
const ORD_UK = ['', 'перший', 'другий', 'третій', 'четвертий', "п'ятий", 'шостий', 'сьомий', 'восьмий', "дев'ятий", 'десятий'];
const NUM_UK = ['', 'один', 'два', 'три', 'чотири', "п'ять", 'шість', 'сім', 'вісім', "дев'ять", 'десять'];
/** слова, яких немає в картках і словниках уроків */
const LEX_EXTRA = { server: 'сервер', krakov: 'Краків', cudzí: 'іноземний, чужий', vták: 'птах', čakať: 'чекати', pozerať: 'дивитися', univerzita: 'університет', koruna: 'крона', budova: 'будівля', začať: 'почати', koza: 'коза', verdi: 'Верді', sedieť: 'сидіти', povedať: 'сказати', jesť: 'їсти', buďte: 'будьте', dvoje: 'двоє', pomalé: 'повільне', vybitý: 'розряджений', kiež: 'хоч би' };
const cleanUk = x => String(x || '').split(/[:;]/)[0].replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
function lexLookup(L, key) {
  const k = String(key || '').toLowerCase().normalize('NFC').trim(); if (!k || k === 'si' || k === 'sa') return null;
  const Ls = [L].concat(Object.values(C.lessons).filter(x => x !== L));
  for (const X of Ls) {
    if (!X) continue;
    for (const f of X.forms || []) if (f.lemma.toLowerCase() === k || (f.sg || []).concat(f.pl || []).some(w => String(w).toLowerCase() === k)) return { sk: f.lemma, uk: f.uk };
    for (const v of X.verbs || []) if (v.lemma.toLowerCase() === k || (v.pres || []).concat(v.fut || []).some(w => String(w).toLowerCase() === k)) return { sk: v.lemma, uk: v.uk };
    for (const c of X.cards || []) {
      const parts = String(c.sk).toLowerCase().normalize('NFC').split(/\s*\/\s*/).map(x => x.split(/\s*[,(]\s*/)[0].trim());
      const i = parts.indexOf(k); if (i < 0) continue;
      const ukp = String(c.uk).split(/\s*\/\s*/);
      return { sk: String(c.sk).split(/\s*\/\s*/)[i] || c.sk, uk: ukp.length === parts.length ? ukp[i] : c.uk };
    }
  }
  if (LEX_EXTRA[k]) return { sk: k, uk: LEX_EXTRA[k] };
  for (const X of Ls) { const g = X && X.text && X.text.gloss; if (g && g[k]) { const m = /від\s+([a-záäčďéíĺľňóôŕšťúýž]+)/i.exec(g[k]); return { sk: m ? m[1] : null, uk: g[k] }; } }
  return null;
}
/** { uk: переклад слова (видно одразу), sk: словацька основа, note: оригінальна підказка } */
function blankWord(L, t) {
  const hint = String(t.hint || '').trim(), first = hint.replace(/\([^)]*\)/g, '').split(',')[0].trim();
  const out = { uk: t.wuk || '', sk: t.wsk || '', note: hint };
  if (!out.uk) {
    if (first && CYR.test(first) && !PRON_UK.includes(first.toLowerCase())) {
      out.uk = cleanUk(first);
      const m = /\(([^)]*[a-záäčďéíĺľňóôŕšťúýž][^)]*)\)/i.exec(hint); if (m && !out.sk) out.sk = m[1].split(',')[0].trim();
    } else if (/^\d+[.:]?\d*$/.test(first)) {
      const n = parseInt(first, 10);
      out.uk = first.includes(':') ? '' : (/\.$/.test(first) ? ORD_UK[n] : NUM_UK[n]) || first;
    } else {
      const lemma = first && !PRON.includes(first.toLowerCase()) && !PRON_UK.includes(first.toLowerCase()) ? first : '';
      const r = lexLookup(L, lemma) || lexLookup(L, (t.a || [])[0]);
      if (r) { out.uk = cleanUk(r.uk); if (!out.sk) out.sk = lemma || r.sk || ''; }
      else if (lemma && !out.sk) out.sk = lemma;
    }
    if (!out.uk) { const r = lexLookup(L, (t.a || [])[0]); if (r) out.uk = cleanUk(r.uk); }
  }
  return out;
}

RENDER.input = (it, root) => {
  const t = it.task;
  put(root, h('h1', null, t.q || 'Напиши відповідь'));
  const sentEl = sentence(t.sk); put(root, sentEl);
  const bw = String(t.sk || '').includes('___') ? blankWord(it.L, t) : null;
  if (bw && bw.uk) put(root, h('div', { class: 'wordhint' }, 'Слово: ', h('b', null, bw.uk)));
  const hw = hintEl(bw && bw.uk ? { hint: CYR.test(bw.note.replace(/\([^)]*\)/g, '').split(',')[0]) ? bw.sk : bw.note, uk: t.uk } : t); if (hw) put(root, hw);
  const inp = h('input', { class: 'answer', id: 'ans', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', lang: 'sk', 'aria-label': 'Твоя відповідь', oninput: () => enablePrimary(inp.value.trim().length > 0) });
  put(root, h('div', { class: 'col' }, h('label', { for: 'ans', class: 'small b muted' }, 'Твоя відповідь'), inp, diaBar(inp)));
  function check() {
    if (PL.ctl.locked || !inp.value.trim()) return;
    if (hw && hw.reveal) hw.reveal();
    const res = checkText(inp.value, t.a); res.why = t.why;
    inp.classList.add(res.status === 'ok' ? 'ok' : 'bad'); inp.readOnly = true;
    const bl = sentEl.querySelector('.blank'); if (bl) { bl.textContent = res.status === 'bad' ? t.a[0] : res.answer; bl.classList.add(res.status === 'ok' ? 'ok' : 'bad'); }
    feedback(it, res);
  }
  return { primary: { label: 'Перевірити', fn: check, disabled: true, keys: 'Enter · перевірити' }, focus: inp, keys: e => { if (e.key === 'Enter' && !PL.ctl.locked) { check(); return true; } } };
};

/* ---------- нові типи: переклад, складання, диктант, говоріння ---------- */
function say(text, rate) { if (!SK_VOICE || S.settings.tts === false) return false; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/\(.*?\)/g, '')); u.voice = SK_VOICE; u.lang = SK_VOICE.lang; u.rate = rate || 0.9; speechSynthesis.speak(u); return true; } catch (e) { return false; } }
const canSay = () => !!SK_VOICE && S.settings.tts !== false;
/** речення порівнюються без розділових знаків і регістру */
function normS(s) { return String(s || '').normalize('NFC').toLowerCase().replace(/[’']/g, "'").replace(/[.,!?;:„“"”«»()…–—]/g, ' ').replace(/\s-\s/g, ' ').replace(/\s+/g, ' ').trim(); }
function stripS(s) { return normS(s).normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function checkSent(val, answers) {
  const v = normS(val);
  for (const a of answers) if (normS(a) === v) return { status: 'ok', answer: a };
  for (const a of answers) if (stripS(a) === stripS(val)) return { status: 'almost', answer: a, user: val };
  return { status: 'bad', answer: answers[0] };
}
/** кнопка «мій варіант теж правильний»: переклад має багато варіантів */
function ownRight(it) {
  return h('button', { class: 'link', style: 'margin-top:6px', onclick: e => { PL.stats.bad = Math.max(0, PL.stats.bad - 1); PL.stats.ok++; if (it.mkey) { delete S.mistakes[it.mkey]; save(); } const ri = PL.items.findIndex((x, j) => j > PL.i && x.retry && x.mkey === it.mkey); if (ri > 0) { PL.items.splice(ri, 1); PL.total--; progressUI(); } e.target.replaceWith(h('span', { class: 'tiny' }, 'Зараховано. Якщо сумніваєшся — спитай викладачку.')); } }, 'Мій варіант теж правильний');
}
function sentInput(root, label) {
  const inp = h('textarea', { class: 'answer', id: 'ans', rows: 2, autocomplete: 'off', autocapitalize: 'sentences', spellcheck: 'false', lang: 'sk', 'aria-label': label, oninput: () => enablePrimary(inp.value.trim().length > 0) });
  put(root, h('div', { class: 'col' }, h('label', { for: 'ans', class: 'small b muted' }, label), inp, diaBar(inp)));
  return inp;
}
function sentCheck(it, inp, answers, extra) {
  if (PL.ctl.locked || !inp.value.trim()) return;
  const res = checkSent(inp.value, answers); res.why = it.task.why;
  inp.classList.add(res.status === 'ok' ? 'ok' : 'bad'); inp.readOnly = true;
  feedback(it, res);
  if (res.status === 'bad' && extra) { const fb = $('#pl-foot .fb'); if (fb) fb.append(extra()); }
}
const enterKeys = check => e => { if (e.key === 'Enter' && !e.shiftKey && !PL.ctl.locked) { check(); return true; } };

RENDER.tr = (it, root) => {
  const t = it.task;
  put(root, h('h1', null, t.q || 'Переклади словацькою'), h('div', { class: 'sent' }, t.uk));
  const hw = t.hint ? hintEl({ hint: t.hint }) : null; if (hw) put(root, hw);
  const inp = sentInput(root, 'Твій переклад');
  const check = () => { if (hw && hw.reveal) hw.reveal(); sentCheck(it, inp, t.a, () => ownRight(it)); };
  return { primary: { label: 'Перевірити', fn: check, disabled: true, keys: 'Enter · перевірити' }, focus: inp, keys: enterKeys(check) };
};

/** слова-плитки: речення розбивається на слова, розділові знаки лишаються при словах */
function tokens(s) { return String(s).trim().replace(/[.!?]+$/, '').split(/\s+/).filter(Boolean); }
RENDER.build = (it, root) => {
  const t = it.task; const words = tokens(t.sk); const pool = shuffle(words.concat(t.extra || []).map((w, i) => ({ w, i })));
  let line = [];
  put(root, h('h1', null, t.q || 'Склади речення'), h('div', { class: 'sent' }, t.uk));
  const lineEl = h('div', { class: 'tiles line-box', 'aria-label': 'Твоє речення' }), poolEl = h('div', { class: 'tiles' });
  put(root, lineEl, poolEl);
  function draw() {
    lineEl.replaceChildren(...(line.length ? line.map((x, k) => h('button', { class: 'wtile', lang: 'sk', onclick: () => { if (PL.ctl.locked) return; line.splice(k, 1); draw(); } }, x.w)) : [h('span', { class: 'muted small' }, 'Торкайся слів унизу по черзі')]));
    poolEl.replaceChildren(...pool.map(x => h('button', { class: 'wtile', lang: 'sk', disabled: line.includes(x), onclick: () => { if (PL.ctl.locked) return; line.push(x); draw(); } }, x.w)));
    enablePrimary(line.length > 0);
  }
  draw();
  function check() {
    if (PL.ctl.locked || !line.length) return;
    const val = line.map(x => x.w).join(' ');
    const res = checkSent(val, [t.sk].concat(t.alt || [])); if (res.status === 'almost') res.status = 'ok'; res.why = t.why;
    lineEl.classList.add(res.status === 'ok' ? 'ok' : 'bad');
    feedback(it, res);
  }
  return { primary: { label: 'Перевірити', fn: check, disabled: true, keys: 'Enter · перевірити' }, keys: e => { if (e.key === 'Enter' && !PL.ctl.locked) { check(); return true; } if (e.key === 'Backspace' && !PL.ctl.locked && line.length) { line.pop(); draw(); return true; } } };
};

RENDER.dict = (it, root) => {
  const t = it.task;
  if (!canSay()) {
    put(root, h('h1', null, 'Переклади словацькою'), h('p', { class: 'muted small' }, 'Тут був би диктант, але на цьому пристрої немає словацького голосу (див. «Налаштування»). Тому переклади речення.'), h('div', { class: 'sent' }, t.uk));
    const inp = sentInput(root, 'Твій переклад'); const check = () => sentCheck(it, inp, [t.sk].concat(t.alt || []), () => ownRight(it));
    return { primary: { label: 'Перевірити', fn: check, disabled: true, keys: 'Enter · перевірити' }, focus: inp, keys: enterKeys(check) };
  }
  put(root, h('h1', null, 'Диктант: запиши, що чуєш'),
    h('div', { class: 'row wrap' }, h('button', { class: 'btn small', onclick: () => say(t.sk, 0.9) }, icon('speak'), ' Слухати'), h('button', { class: 'btn ghost small', onclick: () => say(t.sk, 0.6) }, 'Повільніше')));
  const hw = t.uk ? hintEl({ uk: t.uk }) : null; if (hw) put(root, hw);
  const inp = sentInput(root, 'Що ти почув');
  setTimeout(() => { if (inp.isConnected) say(t.sk, 0.9); }, 350);
  const check = () => { if (hw && hw.reveal) hw.reveal(); sentCheck(it, inp, [t.sk]); };
  return { primary: { label: 'Перевірити', fn: check, disabled: true, keys: 'Enter · перевірити' }, focus: inp, keys: enterKeys(check) };
};

/** говоріння: самоперевірка, у помилки не йде */
RENDER.speak = (it, root) => {
  const t = it.task; const voice = canSay(); const hide = t.mode === 'repeat' && voice;
  put(root, h('h1', null, hide ? 'Послухай і повтори вголос' : 'Прочитай уголос'));
  const txt = h('div', { class: 'sent', lang: 'sk', hidden: hide }, t.sk);
  const uk = h('div', { class: 'muted small', hidden: true }, t.uk || '');
  put(root, txt);
  const row = h('div', { class: 'row wrap' });
  if (voice) row.append(h('button', { class: 'btn small' + (hide ? '' : ' ghost'), onclick: () => say(t.sk, 0.85) }, icon('speak'), hide ? ' Слухати' : ' Як звучить правильно'));
  if (hide) row.append(h('button', { class: 'btn ghost small', onclick: e => { txt.hidden = false; e.target.remove(); } }, 'Показати текст'));
  if (t.uk) row.append(h('button', { class: 'link', onclick: e => { uk.hidden = false; e.target.remove(); } }, 'Переклад'));
  put(root, row, uk, h('p', { class: 'muted small' }, voice ? (hide ? 'Повтори 2–3 рази, намагайся тримати темп і наголос на першому складі.' : 'Прочитай сам, потім послухай і порівняй. Наголос завжди на першому складі.') : 'Наголос завжди на першому складі; довгі голосні (á, é, í) тягни довше.'));
  if (hide) setTimeout(() => { if (txt.isConnected) say(t.sk, 0.85); }, 350);
  return { primary: { label: 'Сказав(-ла)', fn: next } };
};

RENDER.match = (it, root) => {
  const t = it.task; let selL = -1, selR = -1, left = t.pairs.length, errors = 0;
  put(root, h('h1', null, t.q || 'З\'єднай пари'));
  const L = shuffle(t.pairs.map((p, i) => i)), R = shuffle(t.pairs.map((p, i) => i));
  const lb = L.map((pi, k) => h('button', { class: 'opt', lang: 'sk', onclick: () => tap('L', k) }, t.pairs[pi][0]));
  const rb = R.map((pi, k) => h('button', { class: 'opt', onclick: () => tap('R', k) }, t.pairs[pi][1]));
  const grid = h('div', { class: 'match' }); lb.forEach((b, k) => { grid.append(b, rb[k]); });
  put(root, grid);
  function tap(side, k) {
    if (side === 'L') { selL = k; lb.forEach((b, j) => b.classList.toggle('sel', j === k)); } else { selR = k; rb.forEach((b, j) => b.classList.toggle('sel', j === k)); }
    if (selL < 0 || selR < 0) return;
    const a = lb[selL], b = rb[selR];
    if (L[selL] === R[selR]) { [a, b].forEach(x => { x.classList.remove('sel'); x.classList.add('ok', 'gone'); x.disabled = true; }); left--; }
    else { errors++; [a, b].forEach(x => { x.classList.remove('sel'); x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 600); }); }
    selL = selR = -1;
    if (left === 0) feedback(it, errors === 0 ? { status: 'ok' } : { status: 'bad', why: 'Було помилок: ' + errors + '. Пари повернуться в повторенні.' });
  }
  return {};
};

RENDER.readp = (it, root) => {
  const L = it.L, tx = L.text;
  put(root, h('h1', null, tx.title), h('p', { class: 'muted small' }, 'Торкнись слова, щоб побачити переклад. Переклад абзацу відкривається кнопкою.'));
  const pop = h('div', { class: 'pop', hidden: true, role: 'status' });
  it.paras.forEach(pi => put(root, paraEl(tx, pi, pop)));
  put(root, pop);
  return { primary: { label: 'Далі', fn: next } };
};
/** діалог: кожна репліка, що починається з тире, з нового рядка */
function splitLines(t) { return /^\s*[–—-]\s/.test(t) ? t.split(/\s(?=[–—]\s)/) : [t]; }
function paraEl(tx, pi, pop) {
  const p = tx.paras[pi];
  const uk = h('div', { class: 'uk', hidden: true }, splitLines(p.uk).map(l => h('div', { class: 'line' }, l)));
  const sk = h('div', { class: 'sk', lang: 'sk' });
  splitLines(p.sk).forEach(line => {
    const ln = h('div', { class: 'line' });
    line.split(/(\s+)/).forEach(tok => {
      if (/^\s+$/.test(tok)) { ln.append(tok); return; }
      const m = tok.match(/^([„“"(]*)(.*?)([.,!?;:)“"”…]*)$/);
      const word = m ? m[2] : tok; const key = word.toLowerCase();
      if (!word || !tx.gloss || !tx.gloss[key]) { ln.append(tok); return; }
      const nw = h('span', { style: 'white-space:nowrap' }); if (m[1]) nw.append(m[1]);
      const b = h('button', { class: 'w', onclick: () => { document.querySelectorAll('.w.on').forEach(x => x.classList.remove('on')); b.classList.add('on'); pop.replaceChildren(h('span', null, h('b', { lang: 'sk' }, word), ' — ', tx.gloss[key]), h('div', { class: 'row', style: 'gap:4px' }, speakBtn(word, true), h('button', { class: 'iconbtn', 'aria-label': 'Закрити', style: 'color:#fff', onclick: () => { pop.hidden = true; b.classList.remove('on'); } }, icon('x')))); pop.hidden = false; } }, word);
      nw.append(b); if (m[3]) nw.append(m[3]); ln.append(nw);
    });
    sk.append(ln);
  });
  const tbtn = h('button', { class: 'link', onclick: () => { uk.hidden = !uk.hidden; tbtn.textContent = uk.hidden ? 'Переклад абзацу' : 'Сховати переклад'; } }, 'Переклад абзацу');
  const box = h('div', { class: 'para' }, sk, h('div', { class: 'row', style: 'gap:6px' }, tbtn, speakBtn(p.sk), sk.children.length > 1 ? roleBtn() : null), uk);
  /** читання діалогу вдвох: репліки A / B, можна сховати свої й згадувати */
  function roleBtn() {
    const lines = [...sk.children]; lines.forEach((l, i) => { l.classList.add(i % 2 ? 'rb' : 'ra'); l.addEventListener('click', () => l.classList.remove('hid')); });
    const set = mode => { box.classList.toggle('roles', mode > 0); lines.forEach((l, i) => l.classList.toggle('hid', (mode === 2 && i % 2 === 0) || (mode === 3 && i % 2 === 1))); bar.querySelectorAll('.chip').forEach((c, k) => c.classList.toggle('on', k + 1 === mode)); };
    const bar = h('div', { class: 'rolebar', hidden: true }, h('span', { class: 'small b muted' }, 'Ролі:'),
      h('button', { class: 'chip', onclick: () => set(1) }, 'Обидві'), h('button', { class: 'chip', onclick: () => set(2) }, 'Сховати A'), h('button', { class: 'chip', onclick: () => set(3) }, 'Сховати B'),
      h('button', { class: 'link', onclick: () => { set(0); bar.hidden = true; rb.hidden = false; } }, 'Вимкнути'));
    const rb = h('button', { class: 'link', onclick: () => { bar.hidden = false; rb.hidden = true; set(1); } }, 'За ролями');
    setTimeout(() => box.insertBefore(bar, uk), 0);
    return rb;
  }
  return box;
}

/* ---------- покроковий визначник ---------- */
const PAT = {
  chlap: { g: 'm', sg: ['—', '-a', '-ovi', '-a', '-ovi', '-om'], pl: ['-i / -ia / -ovia', '-ov', '-om', '-ov', '-och', '-mi'] },
  hrdina: { g: 'm', sg: ['-a', '-u', '-ovi', '-u', '-ovi', '-om'], pl: ['-ovia', '-ov', '-om', '-ov', '-och', '-ami'] },
  dub: { g: 'm', sg: ['—', '-a / -u', '-u', '— (= N)', '-e / -u / -i', '-om'], pl: ['-y', '-ov', '-om', '-y', '-och', '-mi / -ami'] },
  stroj: { g: 'm', sg: ['—', '-a', '-u', '— (= N)', '-i', '-om'], pl: ['-e', '-ov', '-om', '-e', '-och', '-mi'] },
  žena: { g: 'f', sg: ['-a', '-y', '-e', '-u', '-e', '-ou'], pl: ['-y', '— (žien)', '-ám', '-y', '-ách', '-ami'] },
  ulica: { g: 'f', sg: ['-a', '-e', '-i', '-u', '-i', '-ou'], pl: ['-e', '— (ulíc)', '-iam', '-e', '-iach', '-ami'] },
  dlaň: { g: 'f', sg: ['—', '-e', '-i', '—', '-i', '-ou'], pl: ['-e', '-í', '-iam', '-e', '-iach', '-ami'] },
  kosť: { g: 'f', sg: ['—', '-i', '-i', '—', '-i', '-ou'], pl: ['-i', '-í', '-iam', '-i', '-iach', '-ami'] },
  mesto: { g: 'n', sg: ['-o', '-a', '-u', '-o', '-e / -u', '-om'], pl: ['-á', '— (miest)', '-ám', '-á', '-ách', '-ami'] },
  srdce: { g: 'n', sg: ['-e', '-a', '-u', '-e', '-i', '-om'], pl: ['-ia', '— (sŕdc)', '-iam', '-ia', '-iach', '-ami'] },
  vysvedčenie: { g: 'n', sg: ['-ie', '-ia', '-iu', '-ie', '-í', '-ím'], pl: ['-ia', '-í', '-iam', '-ia', '-iach', '-iami'] },
  dievča: { g: 'n', sg: ['-a', '-aťa', '-aťu', '-a', '-ati', '-aťom'], pl: ['-atá', '-at', '-atám', '-atá', '-atách', '-atami'] }
};
const GN = { m: 'чоловічий', f: 'жіночий', n: 'середній' };
const CASES = [
  ['N', 'N · Kto? Čo?'], ['G', 'G · Koho? Čoho? · do, z, bez, od, u'], ['D', 'D · Komu? Čomu? · k / ku, proti, vďaka'],
  ['A', 'A · Koho? Čo? · cez, pre, na / za (куди?)'], ['L', 'L · o kom? o čom? · o, v, na (де?), po, pri'], ['I', 'I · s kým? s čím? · s, pred, za, pod, nad, medzi (де?)']
];
const CI = { N: 0, G: 1, D: 2, A: 3, L: 4, I: 5 };
const PREP_CASE = { do: 'G', z: 'G', zo: 'G', bez: 'G', od: 'G', u: 'G', okrem: 'G', počas: 'G', vedľa: 'G', blízko: 'G', k: 'D', ku: 'D', proti: 'D', oproti: 'D', vďaka: 'D', cez: 'A', pre: 'A', pri: 'L', s: 'I', so: 'I', v: ['L', 'A'], vo: ['L', 'A'], na: ['L', 'A'], o: ['L', 'A'], po: ['L', 'A'], za: ['A', 'I'], pred: ['I', 'A'], nad: ['I', 'A'], pod: ['I', 'A'], medzi: ['I', 'A'] };
const PREP_NOTE = { v: 'де? → L, куди? → A (рідко)', vo: 'де? → L', na: 'де? → L, куди? → A', o: 'про що? → L, о котрій / за що? → A', po: 'по чому / після → L, по що (піти по) → A', za: 'куди? → A, де? → I', pred: 'де? → I, куди? → A', nad: 'де? → I, куди? → A', pod: 'де? → I, куди? → A', medzi: 'де? → I, куди? → A' };
const CNAME = { N: 'називний (N)', G: 'родовий (G)', D: 'давальний (D)', A: 'знахідний (A)', L: 'місцевий (L)', I: 'орудний (I)' };
function endOptions(g, anim) {
  if (g === 'm' && anim) return [['chlap', 'на приголосний (chlap)'], ['hrdina', 'на -a (hrdina)']];
  if (g === 'm') return [['dub', 'на твердий або нейтральний приголосний (dub)'], ['stroj', 'на м\'який приголосний: c, č, ď, ť, ň, ľ, j, š, ž (stroj)']];
  if (g === 'f') return [['žena', 'на -a після твердого (žena)'], ['ulica', 'на -a після м\'якого: -ca, -ia, -ňa… (ulica)'], ['dlaň', 'на м\'який приголосний: -ň, -ľ, -c… (dlaň)'], ['kosť', 'на -sť (kosť)']];
  return [['mesto', 'на -o (mesto)'], ['srdce', 'на -e (srdce)'], ['vysvedčenie', 'на -ie (vysvedčenie)'], ['dievča', 'на -a / -ä, малі істоти (dievča)']];
}
RENDER.det = (it, root) => {
  const t = it.task; const st = { errors: 0 };
  const prepKey = t.prep ? norm(t.prep) : ''; const caseRight = t.case || PREP_CASE[prepKey];
  const isRight = (f, v) => f.right === undefined || (Array.isArray(f.right) ? f.right.includes(v) : f.right === v);
  put(root, h('h1', null, t.q || 'Визначник: крок за кроком'));
  let sentEl = null;
  if (t.sk) { sentEl = sentence(t.sk); put(root, sentEl); }
  put(root, h('div', { class: 'hint' }, 'Слово: ', h('b', { lang: 'sk' }, t.word), t.wuk ? ' (' + t.wuk + ')' : '', t.prep ? ' · прийменник: ' : '', t.prep ? h('b', null, t.prep) : null));
  const steps = h('div', { class: 'steps' }); put(root, steps);
  const ans = {};
  const flow = [
    { k: 'g', q: 'Який рід?', opts: () => [['m', 'чоловічий'], ['f', 'жіночий'], ['n', 'середній']], right: t.g, why: () => '«' + t.word + '»: ' + GN[t.g] + ' рід.', label: v => 'Рід: ' + GN[v] },
    { k: 'anim', q: 'Це істота (людина, тварина)?', when: () => ans.g === 'm', opts: () => [['1', 'так, істота'], ['0', 'ні, неістота']], right: t.g ? (t.anim ? '1' : '0') : undefined, why: () => '«' + t.word + '»: ' + (t.anim ? 'істота' : 'неістота') + '.', label: v => v === '1' ? 'Істота' : 'Неістота' },
    { k: 'vzor', q: 'Як закінчується «' + t.word + '»? (від цього залежить взор)', opts: () => endOptions(ans.g, ans.anim === '1'), right: t.vzor, why: () => '«' + t.word + '» відмінюється за взором ' + t.vzor + '.', label: v => 'Взор: ' + v },
    { k: 'case', q: t.prep ? 'Який відмінок вимагає «' + t.prep + '»?' : 'Який відмінок потрібен у реченні?', opts: () => CASES.filter(c => c[0] !== 'N'), right: caseRight, why: () => (t.prep ? '«' + t.prep + '» вимагає ' : 'Тут потрібен ') + (Array.isArray(caseRight) ? caseRight.map(c => CNAME[c]).join(' або ') + (PREP_NOTE[prepKey] ? ' (' + PREP_NOTE[prepKey] + ')' : '') : CNAME[caseRight]) + '.', label: v => 'Відмінок: ' + CNAME[v] },
    { k: 'num', q: 'Однина чи множина?', opts: () => [['sg', 'однина'], ['pl', 'множина']], right: t.num, why: () => 'Тут ' + (t.num === 'sg' ? 'однина' : 'множина') + '.', label: v => v === 'sg' ? 'Однина' : 'Множина' }
  ];
  let si = 0, curBtns = [];
  const inp = h('input', { class: 'answer', id: 'detans', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', lang: 'sk', 'aria-label': 'Форма слова', oninput: () => enablePrimary(inp.value.trim().length > 0) });
  function step() {
    while (si < flow.length && flow[si].when && !flow[si].when()) si++;
    if (si >= flow.length) return finalStep();
    const f = flow[si];
    const note = h('div', { class: 'note', hidden: true });
    curBtns = f.opts().map(([v, l], k) => h('button', { class: 'opt', style: 'font-size:16px', onclick: () => choose(f, v, note) }, h('span', { class: 'k' }, k + 1), l));
    steps.append(h('div', { class: 'step', id: 'detstep' }, h('div', { class: 'q' }, f.q), h('div', { class: 'opts' }, curBtns), note));
  }
  function choose(f, v, note) {
    if (!isRight(f, v)) { st.errors++; note.hidden = false; note.textContent = 'Ще раз: ' + f.why(); return; }
    ans[f.k] = v; $('#detstep').replaceWith(h('div', { class: 'done-step' }, icon('check'), f.label(v))); si++; step();
  }
  function finalStep() {
    curBtns = [];
    const pat = PAT[ans.vzor]; const end = pat ? pat[ans.num][CI[ans.case]] : '?';
    steps.append(h('div', { class: 'endbox' }, 'Закінчення за взором ' + ans.vzor + ' (' + CNAME[ans.case] + ', ' + (ans.num === 'sg' ? 'однина' : 'множина') + '): ' + end));
    if (t.a || t.forms) {
      steps.append(h('div', { class: 'col' }, h('label', { for: 'detans', class: 'small b muted' }, 'Тепер напиши форму слова'), inp, diaBar(inp)));
      setTimeout(() => inp.focus(), 30);
    } else {
      steps.append(h('p', { class: 'muted' }, 'Додай закінчення до основи. Пам\'ятай про чергування (ô → o, випадне e/o) і перевір у словнику або в чаті.'));
      setFoot({ label: 'Готово', fn: next });
    }
  }
  function check() {
    if (PL.ctl.locked || !inp.value.trim()) return;
    const answers = t.a || String(t.forms[ans.num][CI[ans.case]]).split('/');
    const res = checkText(inp.value, answers);
    if (res.status === 'ok' && st.errors) { res.status = 'bad'; res.why = 'Форму написано правильно, але на кроках були помилки (' + st.errors + '). ' + (t.why || ''); res.answer = null; }
    else res.why = t.why || '';
    inp.classList.add(res.status === 'ok' ? 'ok' : 'bad'); inp.readOnly = true;
    if (sentEl) { const bl = sentEl.querySelector('.blank'); if (bl) { bl.textContent = answers[0]; bl.classList.add(res.status === 'ok' ? 'ok' : 'bad'); } }
    feedback(it, res);
  }
  step();
  return { primary: { label: 'Перевірити', fn: check, disabled: true, keys: 'Enter · перевірити · 1–6 · варіанти' }, keys: e => { const n = parseInt(e.key, 10); if (document.activeElement !== inp && n >= 1 && n <= curBtns.length) { curBtns[n - 1].click(); return true; } if (e.key === 'Enter' && document.activeElement === inp && !PL.ctl.locked) { check(); return true; } } };
};

/* ---------- клавіатура ---------- */
document.addEventListener('keydown', e => {
  if ($('#dlg')) { if (e.key === 'Escape') closeDialog(); return; }
  if ($('#player').hidden) return;
  if (e.key === 'Escape') { if (!$('#pl-cheat').hidden) closeCheat(); else askExit(); e.preventDefault(); return; }
  const typing = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
  if (PL.ctl && PL.ctl.locked) { if (e.key === 'Enter') { e.preventDefault(); next(); } return; }
  if (typing && e.key !== 'Enter') return;
  if (e.target && e.target.tagName === 'BUTTON' && e.key === 'Enter' && !(PL.ctl && PL.ctl.keys)) return;
  if (PL.ctl && PL.ctl.keys && PL.ctl.keys(e)) { e.preventDefault(); return; }
  if (e.key === 'Enter') { const b = $('#pl-primary'); if (b && !b.disabled) { e.preventDefault(); b.click(); } }
});

/* =====================================================================
   ЕКРАНИ
   ===================================================================== */
function streakOf(st) { if (!st) return 0; let d = today(); if (!st.sessions[d]) d = addDays(d, -1); let n = 0; while (st.sessions[d]) { n++; d = addDays(d, -1); } return n; }
function todayParts() {
  const parts = [];
  const due = pickCards(dueCards(), 6);
  if (due.length) parts.push({ label: 'Картки на повтор', sub: due.length + ' ' + plural(due.length, 'слово', 'слова', 'слів'), ico: 'o', items: flashItems(due) });
  const g = nextDay('g'), v = nextDay('v');
  if (g) parts.push({ key: dayKey(g.L, g.d), label: 'Граматика · урок ' + g.L.num + ', день ' + g.d.n, sub: g.d.title, ico: 'g', items: dayItems(g.L, g.d) });
  if (v) parts.push({ key: dayKey(v.L, v.d), label: 'Лексика · урок ' + v.L.num + ', день ' + v.d.n, sub: v.d.title, ico: 'v', items: dayItems(v.L, v.d) });
  return parts;
}
function estMin(items) { let s = 0; items.forEach(it => { s += it.type === 'readp' ? 90 : it.type === 'rule' ? 50 : it.type === 'learn' || it.type === 'flash' ? 15 : it.type === 'det' ? 70 : it.type === 'match' ? 40 : 30; }); return Math.max(1, Math.round(s / 60)); }
function startToday() {
  const sv = savedSession('today'); if (sv && resumeSession(sv)) return;
  const parts = todayParts();
  startSession({ title: 'Сесію на сьогодні пройдено', label: 'Сесія на сьогодні', resumeKey: 'today', parts });
}
function startDay(L, d) {
  const sv = savedSession(dayKey(L, d)); if (sv && resumeSession(sv)) return;
  const t = (L.track === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + L.num + ', день ' + d.n;
  startSession({ title: t, label: t, resumeKey: dayKey(L, d), parts: [{ key: dayKey(L, d), items: dayItems(L, d) }] });
}

function dayPath(L) {
  const nd = nextDay(L.track); const curKey = nd && nd.L.id === L.id ? dayKey(nd.L, nd.d) : null;
  return h('div', { class: 'path' }, L.days.map(d => {
    const done = isDone(L, d), cur = dayKey(L, d) === curKey, rev = d.kind === 'review';
    return h('button', { class: 'node ' + (L.track === 'v' ? 'v ' : '') + (done ? 'done ' : '') + (cur ? 'cur ' : '') + (rev ? 'rev' : ''), title: d.title, 'aria-label': 'День ' + d.n + ': ' + d.title + (done ? ' (пройдено)' : ''), onclick: () => startDay(L, d) },
      h('span', { class: 'dot' }, done ? icon('check') : rev ? icon('redo') : String(d.n)), h('span', { class: 'lbl' }, cur ? 'зараз' : rev ? 'повтор' : done ? '' : '\u00a0'));
  }));
}
function calendarRow(name, st) {
  const cells = []; for (let i = 13; i >= 0; i--) { const d = addDays(today(), -i); cells.push(h('i', { class: (st && st.sessions[d] ? 'on' : '') + (i === 0 ? ' today' : ''), title: fmtDate(d) })); }
  return [h('span', { class: 'nm' }, name), ...cells, h('span', { class: 'n' }, st ? streakOf(st) : '—')];
}

/* ---------- розклад занять: вт 17:00 граматика, ср 17:00 лексика ----------
   Перенесення: S.moves['YYYY-MM-DD|g'] = { to:'YYYY-MM-DDTHH:MM' | off:true | reg:true, ts, by }.
   Ключ — день і трек звичайного заняття. Діма й Наташа бачать перенесення одне одного (діє найновіше).
   S.classLog — історія змін. */
const CLASSES = [[2, 'g'], [3, 'v']];
const CLASS_TIME = [17, 0];
const TR_NAME = { g: 'Граматика', v: 'Лексика' };
const hm = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
const fmtWhen = d => UA_DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + UA_MONTHS[d.getMonth()] + ' о ' + hm(d);
const fmtShort = d => UA_DAYS[d.getDay()] + ' ' + fmtDate(dstr(d)) + ' ' + hm(d);
function parseLocal(s) { const [a, b] = s.split('T'); const [y, m, d] = a.split('-').map(Number); const [H, M] = (b || '0:0').split(':').map(Number); return new Date(y, m - 1, d, H, M); }
function allMoves() {
  const out = {}; const o = otherState().st;
  [o && o.moves, S.moves].forEach(m => Object.entries(m || {}).forEach(([k, v]) => { if (!out[k] || (v.ts || 0) > (out[k].ts || 0)) out[k] = v; }));
  return out;
}
function allClassLog() {
  const o = otherState().st; const lg = {};
  [o && o.classLog, S.classLog].forEach(a => (a || []).forEach(e => { lg[e.ts + '|' + e.slot] = e; }));
  return Object.values(lg).sort((x, y) => y.ts - x.ts);
}
/** усі звичайні заняття між двома датами (YYYY-MM-DD) з урахуванням перенесень */
function classSlots(from, to) {
  const mv = allMoves(), out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const base = parseLocal(d + 'T' + pad(CLASS_TIME[0]) + ':' + pad(CLASS_TIME[1]));
    const c = CLASSES.find(x => x[0] === base.getDay()); if (!c) continue;
    const key = d + '|' + c[1], m = mv[key];
    const moved = m && m.to && !m.reg, off = !!(m && m.off && !m.reg);
    out.push({ key, tr: c[1], base, at: moved ? parseLocal(m.to) : base, moved, off, by: m && !m.reg ? m.by : null });
  }
  return out;
}
function nextClass() {
  const now = new Date();
  return classSlots(addDays(today(), -14), addDays(today(), 21)).filter(x => !x.off && x.at > now).sort((a, b) => a.at - b.at)[0] || null;
}
function classLesson(tr) {
  if (tr === 'g' && C.lessons[lid('g', S.course)]) return C.lessons[lid('g', S.course)];
  const all = lessonsOf(tr); return all[all.length - 1] || null; // крайній урок, а не той, де ти зараз на платформі
}
function warmupItems(L) {
  const mist = sample(mistakeItems(m => m.lid && m.lid[0] === L.track), 4);
  const speak = []; L.days.forEach(d => d.tasks.forEach(t => { if (t.t === 'speak') speak.push({ type: 'speak', L, task: t }); }));
  const flash = sample((L.cards || []).map(c => ({ type: 'flash', L, card: c, key: L.id + ':' + c.id, dir: 'uk' })), 3);
  return sample(lessonPool(L).filter(x => x.type !== 'match'), 4).concat(mist, flash, sample(speak, 2));
}
function whenLabel(at) {
  const t = today(), d = dstr(at);
  return d === t ? 'сьогодні о ' + hm(at) : d === addDays(t, 1) ? 'завтра о ' + hm(at) : fmtWhen(at);
}
const moveBtn = () => h('button', { class: 'link small', onclick: () => moveDialog() }, 'перенести');
function classCard() {
  const c = nextClass(); if (!c) return null;
  const movedNote = c.moved ? h('span', { class: 'tiny muted' }, 'перенесено з ' + fmtShort(c.base) + (c.by ? ' · ' + NAMES[c.by] : '')) : null;
  const hrs = (c.at - new Date()) / 36e5;
  if (hrs > 30) return h('div', { class: 'soft spread' }, h('div', { class: 'col', style: 'gap:0' }, h('span', null, h('span', { class: 'b' }, 'Наступне заняття: '), TR_NAME[c.tr].toLowerCase() + ', ' + fmtWhen(c.at)), movedNote), moveBtn());
  const L = classLesson(c.tr);
  return h('div', { class: 'card' }, h('div', { class: 'spread', style: 'align-items:flex-start' }, h('div', { class: 'col', style: 'gap:2px' }, h('span', { class: 'kicker' + (c.tr === 'v' ? ' v' : '') }, 'Заняття ' + whenLabel(c.at)), h('h3', null, TR_NAME[c.tr] + (L ? ' · урок ' + L.num + ': ' + L.title : '')), movedNote), moveBtn()),
    h('p', { class: 'small muted' }, 'Розминка перед заняттям: вправи цього уроку, твої помилки, кілька слів і фраза вголос. ~5 хв.'),
    L ? h('button', { class: 'btn ghost wide', onclick: () => startSession({ title: 'Розминку пройдено', parts: [{ items: shuffle(warmupItems(L)) }] }) }, 'Розминка') : null);
}
function setMove(slot, val, what) {
  S.moves = S.moves || {}; S.classLog = S.classLog || [];
  const prev = slot.off ? 'не буде' : fmtShort(slot.at);
  S.moves[slot.key] = Object.assign({ ts: Date.now(), by: PROFILE }, val);
  S.classLog.push({ ts: Date.now(), by: PROFILE, slot: slot.key, tr: slot.tr, from: prev, to: what });
  S.classLog = S.classLog.slice(-300);
  save(); render(); toast(TR_NAME[slot.tr] + ': ' + what);
}
function moveDialog(pickKey) {
  const now = new Date();
  const slots = classSlots(addDays(today(), -14), addDays(today(), 28)).filter(x => x.at > now || x.base > now || (x.off && x.base > addDaysDate(now, -1)));
  if (!slots.length) { toast('Немає найближчих занять'); return; }
  let cur = slots.find(x => x.key === pickKey) || slots.find(x => !x.off) || slots[0];
  const sel = h('select', { class: 'txt', 'aria-label': 'Яке заняття' }, slots.map(x => h('option', { value: x.key, selected: x === cur }, TR_NAME[x.tr] + ' · ' + fmtShort(x.base) + (x.off ? ' → не буде' : x.moved ? ' → ' + fmtShort(x.at) : ''))));
  const dIn = h('input', { type: 'date', class: 'txt', 'aria-label': 'Нова дата' });
  const tIn = h('input', { type: 'time', class: 'txt', step: 300, 'aria-label': 'Новий час' });
  const fill = () => { cur = slots.find(x => x.key === sel.value); dIn.value = dstr(cur.at); tIn.value = hm(cur.at); };
  sel.onchange = fill; fill();
  const body = h('div', { class: 'col', style: 'gap:10px' },
    h('label', { class: 'col small b', style: 'gap:4px' }, 'Яке заняття', sel),
    h('div', { class: 'row', style: 'gap:8px' }, h('label', { class: 'col small b grow', style: 'gap:4px' }, 'Нова дата', dIn), h('label', { class: 'col small b', style: 'gap:4px;width:120px' }, 'Час', tIn)),
    h('p', { class: 'tiny muted', style: 'margin:0' }, 'Перенесення побачите обоє. Звичайний час — вт і ср о ' + pad(CLASS_TIME[0]) + ':' + pad(CLASS_TIME[1]) + '.'),
    h('button', { class: 'link small', style: 'align-self:flex-start', onclick: () => { closeDialog(); historyDialog(); } }, 'Історія занять'));
  const btns = [['Скасувати', () => { }, 'ghost'], ['Заняття не буде', () => setMove(cur, { off: true }, 'не буде'), 'ghost']];
  btns.push(['Звичайний час', () => { if (!cur.moved && !cur.off) { toast('Це заняття й так у звичайний час'); return false; } setMove(cur, { reg: true }, fmtShort(cur.base) + ' (звичайний час)'); }, 'ghost']);
  btns.push(['Зберегти', () => {
    if (!dIn.value || !tIn.value) { toast('Вкажи дату й час'); return false; }
    const to = dIn.value + 'T' + tIn.value, at = parseLocal(to);
    if (at < new Date(Date.now() - 36e5)) { toast('Цей час уже минув'); return false; }
    if (to === dstr(cur.base) + 'T' + hm(cur.base)) return setMove(cur, { reg: true }, fmtShort(cur.base) + ' (звичайний час)');
    setMove(cur, { to }, fmtShort(at));
  }]);
  dialog('Перенести заняття', body, btns);
}
function addDaysDate(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function historyDialog() {
  const now = new Date(); const o = otherState().st;
  const seen = Object.keys(S.sessions || {}).concat(Object.keys((o && o.sessions) || {})).sort();
  const from = !seen.length ? today() : seen[0] > addDays(today(), -182) ? seen[0] : addDays(today(), -182);
  const past = classSlots(from, today()).filter(x => (x.off ? x.base : x.at) <= now).reverse();
  const log = allClassLog();
  const body = h('div', { class: 'col', style: 'gap:14px' },
    h('div', { class: 'col', style: 'gap:6px' }, h('h3', { style: 'margin:0' }, 'Проведені заняття'),
      past.length ? h('ul', { class: 'small', style: 'margin:0;padding-left:20px;line-height:1.6' }, past.map(x => h('li', null, h('span', { class: 'b' }, TR_NAME[x.tr]), ' · ', x.off ? fmtShort(x.base) + ' — не було' : fmtShort(x.at), x.moved ? h('span', { class: 'muted' }, ' (замість ' + fmtShort(x.base) + ')') : null))) : h('p', { class: 'small muted', style: 'margin:0' }, 'Поки немає.')),
    h('div', { class: 'col', style: 'gap:6px' }, h('h3', { style: 'margin:0' }, 'Зміни розкладу'),
      log.length ? h('ul', { class: 'small', style: 'margin:0;padding-left:20px;line-height:1.6' }, log.map(e => h('li', null, h('span', { class: 'muted' }, fmtDate(dstr(new Date(e.ts))) + ' · ' + (NAMES[e.by] || '') + ': '), TR_NAME[e.tr] + ': ' + e.from + ' → ' + e.to))) : h('p', { class: 'small muted', style: 'margin:0' }, 'Перенесень ще не було.')),
    h('p', { class: 'tiny muted', style: 'margin:0' }, 'Список рахується від першого дня на платформі: звичайні заняття за розкладом плюс усі перенесення й скасування. ' + 'До 23.11.2026 у платформі стояв час 17:30 — це було помилкою, насправді заняття о 17:00.'));
  dialog('Історія занять', body, [['Перенести заняття', () => { setTimeout(() => moveDialog(), 0); }, 'ghost'], ['Закрити', () => { }]]);
}
VIEWS.today = main => {
  const now = new Date();
  const o = otherState();
  const parts = todayParts();
  const doneToday = !!(S.daily || {})[today()] || (!parts.length && !!S.sessions[today()]);
  const allItems = parts.flatMap(p => p.items);
  const g = nextDay('g');
  const svT = !doneToday ? savedSession('today') : null, rc = resumeCard();
  main.append(h('div', { class: 'stack' },
    h('div', { class: 'hello' }, h('div', { class: 'col', style: 'gap:2px' }, h('span', { class: 'muted b small' }, UA_WD[now.getDay()] + ', ' + now.getDate() + ' ' + UA_MONTHS[now.getMonth()]), h('h1', null, 'Привіт, ' + NAMES[PROFILE] + '!')), h('div', { class: 'row', style: 'gap:8px' }, h('button', { class: 'avatar themebtn', 'aria-label': isDark() ? 'Світла тема' : 'Темна тема', title: isDark() ? 'Світла тема' : 'Темна тема', onclick: () => setTheme(isDark() ? 'light' : 'dark'), html: isDark() ? I.sun : I.moon }), h('button', { class: 'avatar', 'aria-label': 'Змінити профіль', onclick: switchProfile }, NAMES[PROFILE][0]))),
    rc,
    CLOUD && SYNC.state === 'err' ? h('div', { class: 'note' }, 'Прогрес не зберігається в базі: ' + SYNC.err + '. Зроби скриншот і надішли Дімі.') : null,
    h('div', { class: 'grid2' },
      h('div', { class: 'stack' },
        h('div', { class: 'card raised' },
          h('div', { class: 'spread' }, h('h2', null, doneToday ? 'Сесію пройдено' : 'Сесія на сьогодні'), allItems.length ? h('span', { class: 'b muted small' }, '~' + estMin(allItems) + ' хв') : null),
          doneToday ? h('p', { class: 'muted' }, 'На сьогодні все. Завтра платформа продовжить з наступного дня.') : null,
          parts.length ? h('div', { class: 'plan' }, parts.map(p => h('div', { class: 'planrow' }, h('div', { class: 'ico ' + p.ico, html: p.ico === 'g' ? I.grammar : p.ico === 'v' ? I.vocab : I.cards }), h('div', { class: 'col grow', style: 'gap:0' }, h('span', { class: 'b' }, p.label), h('span', { class: 'small muted' }, p.sub)), h('span', { class: 'small b muted' }, estMin(p.items) + ' хв')))) : h('p', { class: 'muted' }, C.errors.length ? 'Не вдалося завантажити уроки.' : 'Усі доступні дні пройдено. Нові уроки з\'являться після додавання.'),
          !doneToday && parts.length ? h('button', { class: 'btn wide', onclick: startToday }, svT ? 'Продовжити · ' + svT.done + '/' + svT.total : 'Почати') : null,
          doneToday && PILOT && parts.length ? h('button', { class: 'btn ghost wide', onclick: startToday }, 'Пілот: пройти наступну сесію') : null
        ),
        ON_COURSE[PROFILE] ? classCard() : null,
        !ON_COURSE[PROFILE] ? null : h('div', { class: 'soft spread' }, h('span', { class: 'b' }, 'Ми на курсі зараз: ', h('span', null, 'урок ' + S.course)), h('button', { class: 'link', onclick: chooseCourse }, 'змінити')),
        ON_COURSE[PROFILE] && g && g.L.num < S.course ? h('div', { class: 'note spread' }, h('span', null, 'Курс уже на уроці ' + S.course + '. Платформа чекає на тебе на уроці ' + g.L.num + '.'), C.lessons[lid('g', S.course)] ? h('button', { class: 'btn small orange', onclick: () => go('lesson-' + lid('g', S.course)) }, 'Урок ' + S.course) : null) : null,
        ...['g', 'v'].map(tr => { const nd = nextDay(tr) || (lessonsOf(tr).length ? { L: lessonsOf(tr)[lessonsOf(tr).length - 1] } : null); if (!nd) return null; const L = nd.L; return h('div', { class: 'card' }, h('div', { class: 'col', style: 'gap:2px' }, h('h3', null, (tr === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + L.num), h('a', { href: '#lesson-' + L.id, class: 'small b', lang: 'sk' }, L.title)), dayPath(L), PILOT ? h('p', { class: 'tiny muted' }, 'Пілот: будь-який день можна відкрити тапом.') : null); })
      ),
      h('div', { class: 'stack' },
        h('div', { class: 'streaks' }, [...(NO_STREAK[PROFILE] ? [] : [[PROFILE, S]]), ...othersAll().map(x => [x.id, x.st])].map(([id, st]) => h('div', { class: 'streak' }, icon('flame'), h('div', { class: 'col', style: 'gap:0' }, h('span', { class: 'small b muted' }, NAMES[id]), h('span', { class: 'n' }, st ? streakOf(st) + ' ' + plural(streakOf(st), 'день', 'дні', 'днів') : '—'))))),
        h('div', { class: 'card' }, h('h3', null, 'Активність за 2 тижні'), h('div', { class: 'cal' }, NO_STREAK[PROFILE] ? null : calendarRow(NAMES[PROFILE], S), othersAll().map(x => calendarRow(NAMES[x.id], x.st)))),
        CLOUD && ON_COURSE[PROFILE] && !Object.keys(S.done).length && !Object.keys(S.cards).length ? h('div', { class: 'card' }, h('h3', null, 'Є прогрес з пілоту?'), h('p', { class: 'small muted' }, 'У пілоті: Налаштування → «Скопіювати копію». Тут: Налаштування → «Відновити з копії».'), h('button', { class: 'btn ghost small', onclick: importDialog }, 'Відновити з копії')) : null,
        !Object.keys(C.lessons).length ? h('a', { class: 'card', href: '#add', style: 'text-decoration:none;color:inherit' }, h('h3', null, 'Уроків ще немає'), h('p', { class: 'small muted' }, 'Додай перший урок: розділ «Додати урок».')) : null,
        mistakeCount() ? h('a', { class: 'card', href: '#mistakes', style: 'text-decoration:none;color:inherit' }, h('div', { class: 'spread' }, h('span', { class: 'b' }, 'Помилки до повторення'), h('span', { class: 'badge' }, mistakeCount()))) : null
      )
    )
  ));
};

VIEWS.lessons = main => {
  const tile = (tr, n, topic) => {
    const L = C.lessons[lid(tr, n)];
    const p = L ? lessonProgress(L) : 0;
    return h('button', { class: 'tile ' + (L ? 'has' : 'empty') + (tr === 'g' && n === S.course ? ' now' : ''), onclick: () => go('lesson-' + lid(tr, n)) },
      h('span', { class: 'b' }, 'Урок ' + n), h('span', { class: 'small muted' }, L ? L.title : (topic || 'ще не додано')),
      L ? h('div', { class: 'bar' }, h('i', { style: 'width:' + Math.round(100 * p / 7) + '%' })) : h('span', { class: 'tiny' }, 'ще не додано'));
  };
  main.append(h('div', { class: 'stack' }, h('h1', null, 'Уроки'),
    h('p', { class: 'muted' }, 'Дві доріжки. Можна відкрити будь-який урок і день, навіть якщо попередні не пройдені.'),
    h('h2', null, 'Граматика'), h('div', { class: 'tiles' }, Array.from({ length: 35 }, (_, i) => tile('g', i + 1, G_TOPICS[i + 1]))),
    h('h2', null, 'Лексика'), h('div', { class: 'tiles' }, V_NUMS.map(n => tile('v', n, V_TOPICS[n])))));
};

VIEWS.lesson = (main, id) => {
  const L = C.lessons[id];
  const back = h('a', { href: '#lessons', class: 'small b' }, '← Усі уроки');
  if (!L) {
    main.append(h('div', { class: 'stack' }, back, h('h1', null, 'Урок ще не додано'), h('p', { class: 'muted' }, 'Після 1 грудня уроки додаються через шаблон у безкоштовному чаті Claude і кнопку «Додати урок» (буде в наступному кроці).')));
    return;
  }
  main.append(h('div', { class: 'stack' }, back,
    h('div', { class: 'col', style: 'gap:4px' }, h('span', { class: 'kicker' + (L.track === 'v' ? ' v' : '') }, (L.track === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + L.num), h('h1', { lang: 'sk' }, L.title), h('p', { class: 'muted' }, L.topic), L.source ? h('p', { class: 'tiny muted' }, L.source) : null),
    h('div', { class: 'card' }, dayPath(L)),
    h('div', { class: 'card' }, h('h3', null, 'Дні уроку'), h('div', { class: 'list' }, L.days.map(d => h('div', { class: 'dayrow' },
      h('div', { class: 'col grow', style: 'gap:0' }, h('span', { class: 'b' }, 'День ' + d.n + ' · ' + d.title), h('span', { class: 'small muted' }, isDone(L, d) ? 'пройдено ' + fmtDate(S.done[dayKey(L, d)]) : d.kind === 'review' ? 'повторення: ' + Math.round((1 - oldShare()) * 100) + '% цей урок, ' + Math.round(oldShare() * 100) + '% минулі' : 'новий матеріал')),
      h('button', { class: 'btn small ' + (isDone(L, d) ? 'ghost' : ''), onclick: () => startDay(L, d) }, isDone(L, d) ? 'Ще раз' : 'Почати'))))),
    (L.cheats || []).length ? h('div', { class: 'card' }, h('h3', null, 'Шпаргалки'), h('div', { class: 'row wrap' }, L.cheats.map(c => h('a', { class: 'chip', href: '#cheat-' + L.id + '-' + c.id }, c.title)))) : null,
    L.text ? h('a', { class: 'card', href: '#read-' + L.id, style: 'text-decoration:none;color:inherit' }, h('div', { class: 'spread' }, h('span', { class: 'b' }, 'Текст: ', h('span', { lang: 'sk' }, L.text.title)), icon('book'))) : null,
    h('div', { class: 'row wrap' }, h('button', { class: 'btn ghost small', onclick: () => dialog('Скинути прогрес уроку?', h('p', null, 'Усі 7 днів уроку ' + L.num + ' знову стануть непройденими. Картки й помилки залишаться.'), [['Скасувати', () => { }, 'ghost'], ['Скинути', () => { L.days.forEach(d => delete S.done[dayKey(L, d)]); S.reset = S.reset || {}; S.reset[L.id] = Date.now(); save(); render(); toast('Прогрес уроку скинуто'); }, 'orange']]) }, 'Перезапустити урок'))
  ));
};

VIEWS.cards = main => {
  const due = dueCards();
  const total = Object.keys(S.cards).length;
  main.append(h('div', { class: 'stack' }, h('h1', null, 'Картки'),
    h('div', { class: 'card raised' }, h('div', { class: 'spread' }, h('h2', null, 'На повтор зараз'), h('span', { class: 'badge' }, due.length)),
      h('p', { class: 'muted small' }, 'Складні слова повертаються частіше: «не згадав» → завтра, «згадав» → через 2, 4, 8… днів. ' + Math.round((1 - oldShare()) * 100) + '% поточні уроки, ' + Math.round(oldShare() * 100) + '% старі (40%, якщо накопичилось 10+ помилок з минулих уроків).'),
      h('button', { class: 'btn wide', disabled: !due.length, onclick: () => startSession({ title: 'Картки повторено', parts: [{ items: flashItems(pickCards(due, 20)) }] }) }, due.length ? 'Повторити' : 'Поки нічого')),
    h('p', { class: 'muted small' }, 'Вивчено слів: ' + total + '. Нові слова додаються в днях уроків.'),
    Object.values(C.lessons).sort((a, b) => a.track.localeCompare(b.track) || a.num - b.num).map(L => h('div', { class: 'card' },
      h('div', { class: 'spread' }, h('h3', null, (L.track === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + L.num), h('button', { class: 'btn ghost small', onclick: () => startSession({ title: 'Картки уроку ' + L.num, parts: [{ items: flashItems(L.cards.map(c => ({ L, c, key: L.id + ':' + c.id }))).slice(0, 25) }] }) }, 'Пройти всі')),
      h('div', { class: 'list' }, L.cards.map(c => { const s = S.cards[L.id + ':' + c.id]; return h('div', { class: 'li' }, h('span', { class: 'b grow', lang: 'sk' }, c.sk), h('span', { class: 'muted small grow' }, c.uk), h('span', { class: 'tiny muted' }, s ? 'рівень ' + s.b : 'нове')); }))))));
};

VIEWS.cheats = main => {
  main.append(h('div', { class: 'stack' }, h('h1', null, 'Шпаргалки'), h('p', { class: 'muted' }, 'Правило уроку на одному екрані: таблиця, порівняння з українською, пастки.'),
    Object.values(C.lessons).sort((a, b) => a.track.localeCompare(b.track) || a.num - b.num).filter(L => (L.cheats || []).length).map(L => h('div', { class: 'card' }, h('h3', null, (L.track === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + L.num), h('div', { class: 'row wrap' }, L.cheats.map(c => h('a', { class: 'chip', href: '#cheat-' + L.id + '-' + c.id }, c.title)))))));
};
VIEWS.cheat = (main, rest) => {
  const [l, ...cid] = rest.split('-'); const L = C.lessons[l]; const c = findCheat(L, cid.join('-'));
  if (!c) { main.append(h('p', null, 'Шпаргалку не знайдено.')); return; }
  main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('a', { href: '#cheats', class: 'small b' }, '← Усі шпаргалки'), h('span', { class: 'kicker' }, 'Урок ' + L.num), h('h1', null, c.title), renderBlocks(c.blocks)));
};

/* тренажер форм */
const CASE_Q = { N: 'N · Kto? Čo?', G: 'G · do / bez … (Koho? Čoho?)', D: 'D · k / ku … (Komu? Čomu?)', A: 'A · vidím … (Koho? Čo?)', L: 'L · o / v … (o kom? o čom?)', I: 'I · s / pred … (s kým? s čím?)' };
const PERS = ['ja', 'ty', 'on / ona', 'my', 'vy', 'oni'];
function trainerItems(mode, n) {
  const out = [];
  const forms = Object.values(C.lessons).flatMap(L => (L.forms || []).map(f => ({ L, f })));
  const verbs = Object.values(C.lessons).flatMap(L => (L.verbs || []).map(v => ({ L, v })));
  for (let i = 0; i < n; i++) {
    if ((mode === 'nouns' || (mode === 'mix' && Math.random() < 0.6)) && forms.length) {
      const { L, f } = forms[Math.floor(Math.random() * forms.length)];
      const num = Math.random() < 0.55 ? 'sg' : 'pl'; const cs = 'NGDALI'[1 + Math.floor(Math.random() * 5)];
      const a = String(f[num][CI[cs]]).split('/');
      out.push({ type: 'input', L, mkey: 'tr:' + f.lemma + ':' + num + cs, task: { t: 'input', showHint: true, q: 'Яка форма?', sk: f.lemma + ' → ___', hint: CASE_Q[cs] + ', ' + (num === 'sg' ? 'однина' : 'множина'), uk: f.uk, a, why: 'Взор **' + f.vzor + '**, ' + CNAME[cs] + ' ' + (num === 'sg' ? 'однини' : 'множини') + ': закінчення ' + PAT[f.vzor][num][CI[cs]] + '. Форма: **' + a.join(' / ') + '**.', cheat: f.vzor } });
    } else if (verbs.length) {
      const { L, v } = verbs[Math.floor(Math.random() * verbs.length)];
      const tense = ['pres', 'past', 'fut'][Math.floor(Math.random() * 3)]; const p = Math.floor(Math.random() * 6);
      const fem = tense === 'past' && p < 3 && Math.random() < 0.5;
      const raw = (fem ? v.pastf : v[tense])[p];
      const a = tense === 'past' ? raw.split(' ')[0].split('/').map(x => x + (raw.includes(' ') ? ' ' + raw.split(' ').slice(1).join(' ') : '')) : [raw];
      const tn = { pres: 'теперішній', past: 'минулий', fut: 'майбутній' }[tense];
      out.push({ type: 'input', L, mkey: 'tr:' + v.lemma + ':' + tense + p + (fem ? 'f' : ''), task: { t: 'input', showHint: true, q: 'Яка форма дієслова?', sk: PERS[p] + ' ___', hint: v.lemma + ' · ' + tn + ' час' + (tense === 'past' && p < 3 ? (fem ? ' (жін.)' : ' (чол.)') : ''), uk: v.uk, a, why: v.lemma + ', ' + tn + ': **' + a.join(' / ') + '**.', cheat: 'ist' } });
    }
  }
  return out;
}
VIEWS.trainer = main => {
  const has = Object.values(C.lessons).some(L => (L.forms || []).length || (L.verbs || []).length);
  main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('h1', null, 'Тренажер форм'), h('p', { class: 'muted' }, 'Відмінки, рід, -a/-u, дієвідміни. 10 завдань з миттєвою перевіркою. Помилки потрапляють у «Помилки».'),
    has ? h('div', { class: 'col' },
      h('button', { class: 'btn wide', onclick: () => startSession({ title: 'Тренування завершено', parts: [{ items: trainerItems('nouns', 10) }] }) }, 'Іменники (dub)'),
      h('button', { class: 'btn blue wide', onclick: () => startSession({ title: 'Тренування завершено', parts: [{ items: trainerItems('verbs', 10) }] }) }, 'Дієслово ísť'),
      h('button', { class: 'btn ghost wide', onclick: () => startSession({ title: 'Тренування завершено', parts: [{ items: trainerItems('mix', 10) }] }) }, 'Усе впереміш')) : h('p', null, 'Поки немає форм для тренування.'),
    h('p', { class: 'tiny muted' }, 'Набір слів зростатиме з кожним новим уроком.')));
};

/* визначник окремо */
VIEWS.det = main => {
  const bank = Object.values(C.lessons).flatMap(L => (L.forms || []).map(f => ({ L, f })));
  const inp = h('input', { class: 'txt', id: 'detword', lang: 'sk', placeholder: 'наприклад: chlieb', autocomplete: 'off' });
  const prepInp = h('input', { class: 'txt', id: 'detprep', lang: 'sk', placeholder: 'наприклад: do, k, bez, v', autocomplete: 'off' });
  function run(word) {
    word = word.trim(); if (!word) { inp.focus(); return; }
    const hit = bank.find(x => norm(x.f.lemma) === norm(word));
    const prep = prepInp.value.trim() || undefined;
    const task = hit ? { t: 'det', word: hit.f.lemma, wuk: hit.f.uk, g: PAT[hit.f.vzor].g, anim: ['chlap', 'hrdina'].includes(hit.f.vzor), vzor: hit.f.vzor, forms: hit.f, prep } : { t: 'det', word, prep };
    startSession({ title: 'Визначник', parts: [{ items: [{ type: 'det', L: hit ? hit.L : null, task, mkey: null }] }] });
  }
  main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('h1', null, 'Покроковий визначник'),
    h('p', { class: 'muted' }, 'Для домашки: рід → істота? → закінчення в N sg → взор → відмінок → число → закінчення. Так ти вчишся робити це сам.'),
    h('div', { class: 'card' }, h('label', { for: 'detword', class: 'b' }, 'Слово (як у словнику)'), inp, diaBar(inp), h('label', { for: 'detprep', class: 'b' }, 'Прийменник з речення (якщо є)'), prepInp, h('button', { class: 'btn wide', onclick: () => run(inp.value) }, 'Визначити'),
      h('p', { class: 'tiny muted' }, 'Для слів з уроків платформа перевіряє кожен крок і форму. Для інших слів веде по кроках і показує закінчення.')),
    bank.length ? h('div', { class: 'col' }, h('span', { class: 'b small' }, 'Слова з уроків:'), h('div', { class: 'row wrap' }, bank.map(x => h('button', { class: 'chip', lang: 'sk', onclick: () => run(x.f.lemma) }, x.f.lemma)))) : null));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(inp.value); });
  prepInp.addEventListener('keydown', e => { if (e.key === 'Enter') run(inp.value); });
};

VIEWS.mistakes = main => {
  const items = Object.entries(S.mistakes);
  main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('h1', null, 'Помилки'),
    h('p', { class: 'muted' }, 'Кожне завдання повертається один раз: відповіси правильно, і воно зникне. Помилки також потрапляють у дні повторення.'),
    h('button', { class: 'btn wide', disabled: !items.length, onclick: () => startSession({ title: 'Помилки пройдено', parts: [{ items: shuffle(mistakeItems()).slice(0, 15) }] }) }, items.length ? 'Пройти помилки (' + Math.min(15, items.length) + ')' : 'Помилок немає'),
    items.length ? h('div', { class: 'card' }, h('div', { class: 'list' }, items.map(([k, m]) => h('div', { class: 'li' }, h('div', { class: 'col grow', style: 'gap:0' }, h('span', { class: 'b', lang: 'sk' }, m.task.sk || m.task.word || m.task.q || 'Завдання'), h('span', { class: 'tiny muted' }, (m.task.q || '') + ' · помилок: ' + m.n + '')))))) : null));
};

VIEWS.reading = main => {
  main.append(h('div', { class: 'stack' }, h('h1', null, 'Читання'), h('p', { class: 'muted' }, 'Тексти уроків абзацами: словацька, переклад за кнопкою, слово за тапом.'),
    Object.values(C.lessons).filter(L => L.text).map(L => h('a', { class: 'card', href: '#read-' + L.id, style: 'text-decoration:none;color:inherit' }, h('span', { class: 'kicker' }, 'Урок ' + L.num), h('h2', { lang: 'sk' }, L.text.title), h('span', { class: 'small muted' }, L.text.paras.length + ' абзаців · ' + (L.text.qs || []).length + ' питань')))));
};
VIEWS.read = (main, id) => {
  const L = C.lessons[id]; if (!L || !L.text) { main.append(h('p', null, 'Текст не знайдено.')); return; }
  const tx = L.text; const pop = h('div', { class: 'pop', hidden: true, role: 'status' });
  main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('a', { href: '#reading', class: 'small b' }, '← Читання'), h('h1', { lang: 'sk' }, tx.title), h('p', { class: 'muted small' }, 'Торкнись слова, щоб побачити переклад.'),
    h('div', null, tx.paras.map((p, i) => paraEl(tx, i, pop))), pop,
    (tx.qs || []).length ? h('button', { class: 'btn wide', onclick: () => startSession({ title: 'Питання до тексту', parts: [{ items: tx.qs.map((q, qi) => ({ type: 'choice', L, mkey: L.id + ':q' + qi, task: { t: 'choice', q: 'Питання до тексту', sk: q.q, uk: q.uk, o: q.o, a: q.a, why: q.why } })) }] }) }, 'Питання на розуміння') : null));
};

VIEWS.texts = main => {
  main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('h1', null, 'Мої тексти'),
    h('p', { class: 'muted' }, 'Домашні розповіді після перевірки в чаті. Читай їх перед заняттям.'),
    h('button', { class: 'btn wide', onclick: () => go('text-new') }, 'Додати текст'),
    S.texts.length ? h('div', { class: 'card' }, h('div', { class: 'list' }, S.texts.slice().reverse().map(t => h('a', { class: 'li', href: '#text-' + t.id, style: 'text-decoration:none;color:inherit' }, h('div', { class: 'col grow', style: 'gap:0' }, h('span', { class: 'b' }, t.title || 'Без назви'), h('span', { class: 'tiny muted' }, fmtDate(t.date))), icon('pen'))))) : h('p', { class: 'muted small' }, 'Поки порожньо.')));
};
VIEWS.text = (main, id) => {
  const t = id === 'new' ? { id: 'new', title: '', body: '', date: today() } : S.texts.find(x => x.id === id);
  if (!t) { main.append(h('p', null, 'Текст не знайдено.')); return; }
  let editing = id === 'new';
  const draw = () => {
    main.replaceChildren();
    if (!editing) {
      main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('a', { href: '#texts', class: 'small b' }, '← Мої тексти'), h('h1', null, t.title || 'Без назви'),
        h('div', { lang: 'sk', style: 'font-size:21px;line-height:1.8;white-space:pre-wrap' }, t.body),
        h('div', { class: 'row wrap' }, h('button', { class: 'btn ghost small', onclick: () => { editing = true; draw(); } }, 'Редагувати'),
          h('button', { class: 'btn ghost small', onclick: () => dialog('Видалити текст?', h('p', null, '«' + (t.title || 'Без назви') + '» буде видалено з цього браузера.'), [['Скасувати', () => { }, 'ghost'], ['Видалити', () => { S.texts = S.texts.filter(x => x.id !== t.id); save(); go('texts'); }, 'orange']]) }, 'Видалити'))));
      return;
    }
    const ti = h('input', { class: 'txt', id: 'ttitle', value: t.title, placeholder: 'Наприклад: Môj pracovný deň' });
    const ta = h('textarea', { class: 'txt', id: 'tbody', lang: 'sk', spellcheck: 'false' }); ta.value = t.body;
    main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('a', { href: '#texts', class: 'small b' }, '← Мої тексти'), h('h1', null, id === 'new' ? 'Новий текст' : 'Редагування'),
      h('label', { for: 'ttitle', class: 'b' }, 'Назва'), ti, h('label', { for: 'tbody', class: 'b' }, 'Текст (вже перевірений)'), ta, diaBar(ta),
      h('button', { class: 'btn wide', onclick: () => {
        if (!ta.value.trim()) { toast('Текст порожній'); return; }
        if (t.id === 'new') { t.id = 't' + Date.now(); S.texts.push(t); }
        t.title = ti.value.trim(); t.body = ta.value; t.date = today(); save(); editing = false; if (location.hash.slice(1) === 'text-' + t.id) draw(); else location.hash = 'text-' + t.id;
      } }, 'Зберегти')));
  };
  draw();
};

const PHRASES = [
  ['На занятті', [
    ['Prepáčte, nerozumiem.', 'Вибачте, я не розумію.'], ['Môžete to zopakovať, prosím?', 'Можете повторити, будь ласка?'], ['Môžete hovoriť pomalšie, prosím?', 'Можете говорити повільніше, будь ласка?'],
    ['Ešte raz, prosím.', 'Ще раз, будь ласка.'], ['Ako sa povie po slovensky …?', 'Як сказати словацькою …?'], ['Čo znamená slovo …?', 'Що означає слово …?'],
    ['Ako sa to píše?', 'Як це пишеться?'], ['Je to správne?', 'Це правильно?'], ['Mám otázku.', 'У мене питання.'], ['Na ktorej strane sme?', 'На якій ми сторінці?'],
    ['Nepočujem vás dobre.', 'Я вас погано чую.'], ['Nevidím obrazovku.', 'Я не бачу екран.'], ['Prepáčte, meškám.', 'Вибачте, я запізнююсь.']
  ]],
  ['Листування з викладачкою', [
    ['Dobrý deň, pani učiteľka,', 'Добрий день, пані вчителько,'], ['Mohli by ste nám, prosím, poslať prezentáciu z dnešnej hodiny?', 'Чи могли б ви, будь ласка, надіслати нам презентацію з сьогоднішнього заняття?'],
    ['Posielam domácu úlohu.', 'Надсилаю домашнє завдання.'], ['Nerozumiem úlohe číslo …', 'Я не розумію завдання номер …'], ['Dnes sa nemôžem zúčastniť hodiny.', 'Сьогодні я не можу бути на занятті.'],
    ['Ďakujem za hodinu.', 'Дякую за заняття.'], ['S pozdravom', 'З повагою']
  ]]
];
VIEWS.phrases = main => {
  const copyBtn = sk => h('button', { class: 'btn ghost small', onclick: () => { try { navigator.clipboard.writeText(sk).then(() => toast('Скопійовано'), () => toast('Не вдалося скопіювати')); } catch (e) { toast('Не вдалося скопіювати'); } } }, 'Копіювати');
  const row = ([sk, uk]) => h('div', { class: 'li' }, h('div', { class: 'col grow', style: 'gap:0' }, h('span', { class: 'b', lang: 'sk' }, sk), h('span', { class: 'small muted' }, uk)), speakBtn(sk), copyBtn(sk));
  const group = ([title, list]) => h('div', { class: 'card' }, h('h2', null, title), h('div', { class: 'list' }, list.map(row)));
  main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('h1', null, 'Фрази'), PHRASES.map(group)));
};

VIEWS.eslovak = main => {
  const all = Object.values(C.lessons).sort((a, b) => a.track.localeCompare(b.track) || a.num - b.num);
  main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('h1', null, 'e-slovak'),
    h('p', { class: 'muted' }, 'Вправи на e-slovak не копіюємо: тут посилання на блоки, які задала викладачка. Додай пряме посилання, коли воно в тебе є.'),
    h('p', null, h('a', { href: 'https://www.e-slovak.sk/', target: '_blank', rel: 'noopener' }, 'Відкрити e-slovak.sk')),
    all.map(L => {
      const links = (L.eslovak || []).concat(S.links[L.id] || []);
      const t = h('input', { class: 'txt', placeholder: 'Назва блоку, напр. Blok 4 – E2, E3', 'aria-label': 'Назва блоку' });
      const u = h('input', { class: 'txt', placeholder: 'https://…', 'aria-label': 'Посилання' });
      return h('div', { class: 'card' }, h('h3', null, (L.track === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + L.num),
        links.length ? h('div', { class: 'list' }, links.map(x => h('div', { class: 'li' }, h('a', { href: x.url, target: '_blank', rel: 'noopener', class: 'grow b' }, x.title)))) : h('p', { class: 'small muted' }, 'Посилань поки немає.'),
        h('details', null, h('summary', { class: 'b small', style: 'cursor:pointer;padding:8px 0' }, 'Додати посилання'), h('div', { class: 'col' }, t, u, h('button', { class: 'btn small', onclick: () => {
          const url = u.value.trim(); if (!/^https:\/\//.test(url)) { toast('Посилання має починатися з https://'); return; }
          (S.links[L.id] = S.links[L.id] || []).push({ title: t.value.trim() || url, url }); save(); render();
        } }, 'Додати'))));
    })));
};

VIEWS.more = main => {
  main.append(h('div', { class: 'stack', style: 'max-width:760px' }, h('h1', null, 'Ще'),
    h('div', { class: 'card' }, h('div', { class: 'list' }, NAV.slice(4, 12).map(([r, label, ic]) => h('a', { class: 'li', href: '#' + r, style: 'text-decoration:none;color:inherit' }, h('span', { class: 'ico g', html: I[ic] }), h('span', { class: 'b grow' }, label), r === 'mistakes' && mistakeCount() ? h('span', { class: 'badge' }, mistakeCount()) : null)))),
    h('h2', null, 'Налаштування'),
    h('div', { class: 'card' },
      h('div', { class: 'spread' }, h('span', null, 'Профіль: ', h('b', null, NAMES[PROFILE]), CLOUD && window.Cloud ? ' (' + (window.Cloud.email || '') + ')' : ''), h('button', { class: 'btn ghost small', onclick: switchProfile }, CLOUD ? 'Вийти' : 'Змінити')),
      CLOUD ? h('div', { class: 'spread' }, h('span', null, 'Синхронізація: ', h('b', null, { ok: 'збережено', saving: 'зберігаю…', err: 'помилка (' + SYNC.err + ')', local: 'очікує' }[SYNC.state] || SYNC.state)), h('button', { class: 'btn ghost small', onclick: () => { pushCloud(); toast('Зберігаю…'); } }, 'Зберегти зараз')) : null,
      !ON_COURSE[PROFILE] ? null : h('div', { class: 'spread' }, h('span', null, 'Курс зараз на уроці: ', h('b', null, S.course)), h('button', { class: 'btn ghost small', onclick: chooseCourse }, 'Змінити')),
      h('div', { class: 'spread' }, h('span', null, 'Озвучка: ', h('b', null, SK_VOICE ? (S.settings.tts === false ? 'вимкнено' : 'увімкнено (' + SK_VOICE.name + ')') : 'немає словацького голосу в системі')), SK_VOICE ? h('button', { class: 'btn ghost small', onclick: () => { S.settings.tts = S.settings.tts === false; save(); render(); } }, S.settings.tts === false ? 'Увімкнути' : 'Вимкнути') : null),
      h('div', { class: 'spread' }, h('span', null, 'Звуки відповідей: ', h('b', null, S.settings.sound === false ? 'вимкнено' : 'увімкнено')), h('button', { class: 'btn ghost small', onclick: () => { S.settings.sound = S.settings.sound === false; save(); render(); if (S.settings.sound !== false) sfx('ok'); } }, S.settings.sound === false ? 'Увімкнути' : 'Вимкнути')),
      h('div', { class: 'spread wrap' }, h('span', null, 'Тема'), h('div', { class: 'row', style: 'gap:6px' }, [['light', 'Світла'], ['dark', 'Темна'], ['auto', 'Як у системі']].map(([v, l]) => h('button', { class: 'chip' + (themePref() === v ? ' on' : ''), 'aria-pressed': themePref() === v ? 'true' : 'false', onclick: () => setTheme(v) }, l))))),
    notifyCard(),
    h('div', { class: 'card' }, h('h3', null, 'Резервна копія прогресу'), h('p', { class: 'small muted' }, CLOUD ? 'Прогрес зберігається в базі. Сюди можна вставити копію з пілоту, щоб перенести пройдене.' : 'Поки немає Firebase, прогрес лежить лише в цьому браузері. Копію можна зберегти як текст.'),
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn ghost small', onclick: () => { const txt = JSON.stringify({ profile: PROFILE, state: S }); try { navigator.clipboard.writeText(txt).then(() => toast('Копію скопійовано'), () => showExport(txt)); } catch (e) { showExport(txt); } } }, 'Скопіювати копію'),
        h('button', { class: 'btn ghost small', onclick: importDialog }, 'Відновити з копії'),
        h('button', { class: 'btn ghost small', onclick: () => dialog('Скинути весь прогрес?', h('p', null, 'Буде видалено пройдені дні, картки, помилки й тексти профілю «' + NAMES[PROFILE] + '» у цьому браузері.'), [['Скасувати', () => { }, 'ghost'], ['Скинути', () => { S = newState(); save(); render(); toast('Прогрес скинуто'); }, 'orange']]) }, 'Скинути все'))),
    h('div', { class: 'card' }, h('h3', null, 'Діагностика'), h('div', { class: 'small', style: 'line-height:1.7' },
      h('div', null, 'Адреса: ', h('b', null, location.host || 'локально')),
      h('div', null, 'Режим: ', h('b', null, CLOUD ? 'база Firebase' : 'лише цей браузер (пілот)')),
      CLOUD ? h('div', null, 'Акаунт: ', h('b', null, (window.Cloud && window.Cloud.email) || '—')) : null,
      CLOUD ? h('div', null, 'Остання синхронізація: ', h('b', null, (SYNC.at || '—') + ' · ' + ({ ok: 'успішно', err: 'ПОМИЛКА ' + SYNC.err, saving: 'триває', local: 'ще не було' }[SYNC.state] || SYNC.state))) : null,
      h('div', null, 'Пройдено днів: ', h('b', null, Object.keys(S.done).length), ' · карток: ', h('b', null, Object.keys(S.cards).length), ' · серія: ', h('b', null, streakOf(S))),
      h('div', null, 'Дні: ', h('b', null, doneSummary() || '—')))),
    h('p', { class: 'tiny muted' }, (CLOUD ? 'Версія: 2.7 (25.11)' : 'Версія: пілот 0.5') + ' · уроків завантажено: ' + Object.keys(C.lessons).length + (C.errors.length ? ' · помилка завантаження: ' + C.errors.join(', ') : ''))));
};
function showExport(txt) { const ta = h('textarea', { class: 'txt', readonly: true, 'aria-label': 'Копія прогресу' }); ta.value = txt; dialog('Копія прогресу', h('div', { class: 'col' }, h('p', { class: 'small' }, 'Виділи весь текст і скопіюй.'), ta), [['Готово', () => { }]]); }
function importDialog() {
  const ta = h('textarea', { class: 'txt', 'aria-label': 'Встав копію' });
  dialog('Відновити з копії', h('div', { class: 'col' }, h('p', { class: 'small' }, 'Встав текст копії. Поточний прогрес профілю буде замінено.'), ta), [['Скасувати', () => { }, 'ghost'], ['Відновити', () => {
    try { const o = JSON.parse(ta.value); if (!o.state || typeof o.state.done !== 'object') throw 0; S = Object.assign(newState(), o.state); save(); render(); toast('Прогрес відновлено'); }
    catch (e) { toast('Це не схоже на копію прогресу'); return false; }
  }]]);
}


/* ---------- сповіщення (web push) ----------
   Налаштування й підписки пристроїв лежать у notify/{uid} (читає лише власник і воркер Cloudflare).
   Воркер щохвилини читає ці документи й шле нагадування. Тут лише налаштування й підписка. */
const VAPID_PUBLIC = 'BIbo5zh4DcK8Mnsqxdyt2cBd3T84U-p5OL5uzRgLofKcVeir7KkXMTCB0N-ZI9fT4IxMa3mhLR9w71iuT5C3z3g';
const NT_DEF = { on: true, daily: '20:00', dailyOn: true, cls: 60, devices: {}, test: 0 };
let NT = clone(NT_DEF), NT_LAST = '', ntT = null;
const DEV = (() => { let d = Store.get('dev', null); if (!d) { d = Math.random().toString(36).slice(2, 10); Store.set('dev', d); } return d; })();
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
function devLabel() {
  const u = navigator.userAgent;
  const os = /Android/.test(u) ? 'Android' : /iPhone|iPad/.test(u) ? 'iPhone' : /Windows/.test(u) ? 'Windows' : /Mac OS/.test(u) ? 'Mac' : /Linux/.test(u) ? 'Linux' : 'пристрій';
  const br = /Edg\//.test(u) ? 'Edge' : /OPR\//.test(u) ? 'Opera' : /SamsungBrowser/.test(u) ? 'Samsung' : /Firefox\//.test(u) ? 'Firefox' : /Chrome\//.test(u) ? 'Chrome' : /Safari\//.test(u) ? 'Safari' : '';
  return os + (br ? ' · ' + br : '');
}
function ntDoc() {
  const next = ['g', 'v'].map(tr => { const nd = nextDay(tr); return nd ? TR_NAME[tr].toLowerCase() + ', урок ' + nd.L.num + ', день ' + nd.d.n : null; }).filter(Boolean).join(' · ');
  const lessons = {}; ['g', 'v'].forEach(tr => { const L = classLesson(tr); if (L) lessons[tr] = TR_NAME[tr] + ' · урок ' + L.num + ': ' + L.title; });
  const sess = Object.keys(S.daily || {}).sort(), cut = addDays(today(), -60), moves = {};
  Object.entries(allMoves()).forEach(([k, v]) => { if (k >= cut) moves[k] = v; });
  let tz = 'Europe/Kyiv'; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; } catch (e) { }
  return { v: 1, name: PROFILE, tz, on: !!NT.on, daily: NT.dailyOn ? NT.daily : '', cls: ON_COURSE[PROFILE] ? NT.cls || 0 : 0, devices: NT.devices, done: sess[sess.length - 1] || '', next, lessons, sched: { days: CLASSES, h: CLASS_TIME[0], m: CLASS_TIME[1] }, moves, test: NT.test || 0, sts: NT.sts || 0 };
}
/* Документ сповіщень спільний для всіх твоїх пристроїв. Щоб застосунок, який довго висів у фоні,
   не затер свіжі налаштування чи підписки інших пристроїв, перед записом читаємо документ із бази й зливаємо:
   налаштування — новіші за часом (sts), пристрої — чужі з бази, свій — із цього пристрою. */
const NT_KEYS = ['on', 'daily', 'dailyOn', 'cls'];
function ntAdopt(r) {
  if (!r) return;
  if ((r.sts || 0) > (NT.sts || 0)) Object.assign(NT, { on: r.on !== false, dailyOn: !!r.daily, daily: r.daily || NT.daily, cls: r.cls || 0, sts: r.sts || 0 });
  const dev = Object.assign({}, r.devices || {});
  if (NT.devices[DEV]) dev[DEV] = NT.devices[DEV]; else delete dev[DEV];
  NT.devices = dev; NT.test = Math.max(NT.test || 0, r.test || 0);
}
let ntBusy = false;
function ntSync(now) {
  if (!(CLOUD && UID && window.Cloud && window.Cloud.saveNotify && NT.loaded)) return;
  clearTimeout(ntT); ntT = setTimeout(async () => {
    if (ntBusy) { ntSync(); return; } ntBusy = true;
    try {
      try { const d = await window.Cloud.loadNotify(UID); if (d && d.json && d.json !== NT_LAST) { ntAdopt(JSON.parse(d.json)); Store.set('nt.' + PROFILE, NT); } } catch (e) { /* офлайн — пишемо як є */ }
      const json = JSON.stringify(ntDoc());
      if (json !== NT_LAST) { await window.Cloud.saveNotify(UID, json); NT_LAST = json; }
    } catch (e) { toast('Налаштування сповіщень не збереглися: ' + (e.code || e.message)); }
    ntBusy = false;
  }, now ? 0 : 2500);
}
function ntSet(patch, now) { Object.assign(NT, patch); if (NT_KEYS.some(k => k in patch)) NT.sts = Date.now(); Store.set('nt.' + PROFILE, NT); ntSync(now); }
async function ntLoad() {
  NT = Object.assign(clone(NT_DEF), Store.get('nt.' + PROFILE, {}));
  try { const d = await window.Cloud.loadNotify(UID); if (d && d.json) { const r = JSON.parse(d.json); NT_LAST = d.json; if (!NT.sts && !r.sts) NT.sts = -1; ntAdopt(r); } } catch (e) { /* офлайн — беремо локальну копію */ }
  NT.loaded = true; Store.set('nt.' + PROFILE, NT);
  if (NT.devices[DEV]) { try { await ntRefreshSub(); } catch (e) { } }
  ntSync();
}
/* застосунок повернувся з фону — підтягнути свіжі налаштування сповіщень */
let ntPullAt = 0;
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible' || !NT.loaded || !(CLOUD && UID && window.Cloud) || Date.now() - ntPullAt < 30000) return;
  ntPullAt = Date.now();
  try { const d = await window.Cloud.loadNotify(UID); if (d && d.json && d.json !== NT_LAST) { ntAdopt(JSON.parse(d.json)); NT_LAST = d.json; Store.set('nt.' + PROFILE, NT); if (ROUTE === 'more' && $('#player').hidden) render(); } } catch (e) { }
});
const vapidBytes = () => { const s = VAPID_PUBLIC.replace(/-/g, '+').replace(/_/g, '/'); const b = atob(s + '='.repeat((4 - s.length % 4) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };
async function ntSubscribe() {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (sub) { const k = sub.options && sub.options.applicationServerKey; if (k && btoa(String.fromCharCode(...new Uint8Array(k))) !== btoa(String.fromCharCode(...vapidBytes()))) { await sub.unsubscribe(); sub = null; } }
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidBytes() });
  return sub;
}
/** підписка цього пристрою жива й та сама, що в базі */
async function ntRefreshSub() {
  if (!pushSupported() || Notification.permission !== 'granted') { if (NT.devices[DEV]) { const d = Object.assign({}, NT.devices); delete d[DEV]; ntSet({ devices: d }); } return; }
  const sub = await ntSubscribe(), j = sub.toJSON(), cur = NT.devices[DEV];
  if (!cur || cur.sub.endpoint !== j.endpoint) ntSet({ devices: Object.assign({}, NT.devices, { [DEV]: { sub: { endpoint: j.endpoint, keys: j.keys }, ua: devLabel(), ts: Date.now() } }) });
}
async function ntEnableHere() {
  if (!pushSupported()) { toast('Цей браузер не підтримує сповіщення'); return; }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { toast(perm === 'denied' ? 'Сповіщення заблоковані в браузері' : 'Дозвіл не надано'); render(); return; }
    const sub = await ntSubscribe(), j = sub.toJSON();
    ntSet({ on: true, devices: Object.assign({}, NT.devices, { [DEV]: { sub: { endpoint: j.endpoint, keys: j.keys }, ua: devLabel(), ts: Date.now() } }) }, true);
    (await navigator.serviceWorker.ready).showNotification('Сповіщення увімкнено', { body: 'На цьому пристрої тепер будуть нагадування.', icon: 'icon-192.png', tag: 'enabled', lang: 'uk' });
    toast('Сповіщення увімкнено');
  } catch (e) { toast('Не вдалося увімкнути: ' + (e.message || e)); }
  render();
}
async function ntDisableHere() {
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch (e) { }
  const d = Object.assign({}, NT.devices); delete d[DEV]; ntSet({ devices: d }, true); toast('На цьому пристрої сповіщення вимкнено'); render();
}
function notifyCard() {
  if (!CLOUD) return null;
  const sup = pushSupported(), here = !!NT.devices[DEV], nDev = Object.keys(NT.devices).length;
  const denied = sup && Notification.permission === 'denied';
  const chk = (on, fn, label) => h('label', { class: 'row', style: 'gap:10px;align-items:center;cursor:pointer' }, h('input', { type: 'checkbox', checked: !!on, style: 'width:22px;height:22px;accent-color:var(--green)', onchange: e => fn(e.target.checked) }), h('span', null, label));
  const tIn = h('input', { type: 'time', class: 'txt', step: 300, value: NT.daily, 'aria-label': 'Час щоденного нагадування', style: 'width:130px;padding:8px 10px', disabled: !NT.dailyOn || !NT.on, onchange: e => { if (e.target.value) ntSet({ daily: e.target.value }); toast('Щоденне нагадування о ' + e.target.value); } });
  const cSel = h('select', { class: 'txt', 'aria-label': 'За скільки хвилин', style: 'width:130px;padding:8px 10px', disabled: !NT.cls || !NT.on, onchange: e => { ntSet({ cls: +e.target.value }); toast('Нагадування за ' + e.target.value + ' хв до заняття'); } }, [15, 30, 60, 90, 120].map(m => h('option', { value: m, selected: m === (NT.cls || 60) }, m < 60 ? m + ' хв' : m === 60 ? '1 год' : m === 90 ? '1,5 год' : '2 год')));
  return h('div', { class: 'card' }, h('h3', null, 'Сповіщення'),
    !sup ? h('p', { class: 'small muted' }, 'Цей браузер не підтримує сповіщення. На iPhone вони запрацюють пізніше, через «На екран Додому».') :
      h('div', { class: 'spread' }, h('span', null, 'Цей пристрій (' + devLabel() + '): ', h('b', null, here ? 'увімкнено' : 'вимкнено')), h('button', { class: 'btn small ' + (here ? 'ghost' : ''), onclick: here ? ntDisableHere : ntEnableHere }, here ? 'Вимкнути тут' : 'Увімкнути тут')),
    denied ? h('div', { class: 'note small' }, 'Браузер заблокував сповіщення для цього сайту. Дозволь їх у налаштуваннях сайту (значок біля адреси → Сповіщення → Дозволити), потім натисни «Увімкнути тут».') : null,
    h('div', { class: 'col', style: 'gap:12px;opacity:' + (NT.on ? 1 : .55) },
      h('div', { class: 'spread wrap', style: 'gap:8px' }, chk(NT.dailyOn, v => { ntSet({ dailyOn: v }); render(); }, 'Щоденне нагадування о'), tIn),
      h('p', { class: 'tiny muted', style: 'margin:-6px 0 0' }, 'Не прийде, якщо день на сьогодні вже пройдено.'),
      ON_COURSE[PROFILE] ? h('div', { class: 'spread wrap', style: 'gap:8px' }, chk(NT.cls > 0, v => { ntSet({ cls: v ? 60 : 0 }); render(); }, 'Про заняття за'), cSel) : null,
      ON_COURSE[PROFILE] ? h('p', { class: 'tiny muted', style: 'margin:-6px 0 0' }, 'Враховує перенесення й скасування.') : null),
    chk(!NT.on, v => { ntSet({ on: !v }, true); render(); toast(v ? 'Усі сповіщення вимкнено' : 'Сповіщення знову увімкнено'); }, 'Вимкнути всі сповіщення'),
    h('div', { class: 'spread' }, h('span', { class: 'small muted' }, nDev ? 'Пристроїв зі сповіщеннями: ' + nDev + ' (' + Object.values(NT.devices).map(d => d.ua).join(', ') + ')' : 'Сповіщення ще не увімкнено на жодному пристрої.'),
      h('button', { class: 'btn ghost small', disabled: !nDev || !NT.on, onclick: () => { ntSet({ test: Date.now() }, true); toast('Тестове сповіщення прийде протягом хвилини'); } }, 'Перевірити')));
}

/* ---------- перевірка формату уроку (той самий формат дає шаблон для безкоштовного чату) ---------- */
function validateLesson(L) {
  const E = [];
  const isStr = x => typeof x === 'string' && x.length > 0 && x.length < 20000;
  if (!L || typeof L !== 'object' || Array.isArray(L)) return ['Це не JSON-об\'єкт уроку'];
  if (L.schema !== 1) E.push('schema має бути 1');
  if (!['g', 'v'].includes(L.track)) E.push('track має бути "g" (граматика) або "v" (лексика)');
  if (!Number.isInteger(L.num) || L.num < 1 || L.num > 40) E.push('num: номер уроку від 1 до 40');
  if (L.id !== String(L.track) + pad(L.num)) E.push('id має бути "' + L.track + pad(L.num) + '"');
  if (!isStr(L.title)) E.push('немає title');
  const cards = new Set();
  (L.cards || []).forEach((c, i) => { if (!c || !isStr(c.id) || !isStr(c.sk) || !isStr(c.uk)) E.push('картка ' + (i + 1) + ': потрібні id, sk, uk'); else if (cards.has(c.id)) E.push('картка ' + c.id + ' повторюється'); else cards.add(c.id); });
  const cheats = new Set();
  (L.cheats || []).forEach((c, i) => { if (!c || !/^[a-z0-9]+$/.test(c.id || '')) E.push('шпаргалка ' + (i + 1) + ': id лише малі латинські літери й цифри'); else cheats.add(c.id); if (!c || !Array.isArray(c.blocks)) E.push('шпаргалка ' + (i + 1) + ': немає blocks'); });
  const paras = L.text && Array.isArray(L.text.paras) ? L.text.paras : null;
  if (L.text && !paras) E.push('text.paras має бути списком абзаців');
  if (!Array.isArray(L.days) || L.days.length !== 7) E.push('days: потрібно рівно 7 днів');
  (Array.isArray(L.days) ? L.days : []).forEach((d, di) => {
    const at = 'день ' + (di + 1);
    if (!d || d.n !== di + 1) E.push(at + ': n має бути ' + (di + 1));
    if (!d || !['new', 'review'].includes(d.kind)) E.push(at + ': kind має бути "new" або "review"');
    if (!d || !Array.isArray(d.tasks)) { E.push(at + ': немає tasks'); return; }
    if (d.kind === 'new' && !d.tasks.length) E.push(at + ': порожній день');
    d.tasks.forEach((t, ti) => {
      const w = at + ', завдання ' + (ti + 1) + ' (' + (t && t.t) + ')';
      if (!t) { E.push(w + ': порожнє'); return; }
      if (t.cheat && !cheats.has(t.cheat)) E.push(w + ': немає шпаргалки "' + t.cheat + '"');
      if (t.t === 'learn') { if (!Array.isArray(t.cards) || !t.cards.length) E.push(w + ': немає cards'); else t.cards.forEach(id => { if (!cards.has(id)) E.push(w + ': немає картки "' + id + '"'); }); }
      else if (t.t === 'rule') { if (!Array.isArray(t.blocks)) E.push(w + ': немає blocks'); }
      else if (t.t === 'choice') { if (!Array.isArray(t.o) || t.o.length < 2 || !Number.isInteger(t.a) || t.a < 0 || t.a >= t.o.length) E.push(w + ': потрібні o (варіанти) і a (номер правильного, з 0)'); }
      else if (t.t === 'input') { if (!Array.isArray(t.a) || !t.a.length || !isStr(t.sk)) E.push(w + ': потрібні sk і a (список правильних відповідей)'); }
      else if (t.t === 'match') { if (!Array.isArray(t.pairs) || t.pairs.length < 2 || t.pairs.some(x => !Array.isArray(x) || x.length !== 2)) E.push(w + ': pairs — список пар [словацькою, українською]'); }
      else if (t.t === 'read') { if (!paras || !Array.isArray(t.p) || t.p.some(x => !paras[x]) || (t.qs || []).some(x => !L.text.qs || !L.text.qs[x])) E.push(w + ': неправильні p або qs'); }
      else if (t.t === 'det') { if (!isStr(t.word) || !PAT[t.vzor] || !(t.case in CI) || !['sg', 'pl'].includes(t.num) || !Array.isArray(t.a)) E.push(w + ': потрібні word, vzor, case, num, a'); }
      else if (t.t === 'tr') { if (!isStr(t.uk) || !Array.isArray(t.a) || !t.a.length) E.push(w + ': потрібні uk і a (список правильних перекладів)'); }
      else if (t.t === 'build') { if (!isStr(t.sk) || !isStr(t.uk) || tokens(t.sk).length < 2) E.push(w + ': потрібні sk (речення) і uk'); }
      else if (t.t === 'dict' || t.t === 'speak') { if (!isStr(t.sk)) E.push(w + ': потрібне sk'); }
      else E.push(w + ': невідомий тип завдання');
    });
  });
  if (JSON.stringify(L).length > 850000) E.push('урок завеликий');
  return E;
}
/** знаходить усі JSON-об'єкти верхнього рівня (відповідь може бути з 2 частин) і зливає їх */
function parseLessonText(text) {
  const objs = []; let depth = 0, start = -1, inStr = false, esc = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"' && depth > 0) { inStr = true; continue; }
    if (ch === '{') { if (depth === 0) start = i; depth++; }
    else if (ch === '}' && depth > 0) { depth--; if (depth === 0) { objs.push(text.slice(start, i + 1)); start = -1; } }
  }
  if (!objs.length) throw new Error(depth > 0 ? 'JSON обірвався: схоже, відповідь скопійована не повністю (або Claude не дописав її — напиши йому «продовж»)' : 'не знайдено JSON');
  const out = {}; let parts = 0;
  objs.forEach(o => { let x; try { x = JSON.parse(o); } catch (e) { return; } if (x && typeof x === 'object' && !Array.isArray(x)) { parts++; delete x.part; Object.assign(out, x); } });
  if (!parts) throw new Error(depth > 0 ? 'JSON обірвався: схоже, відповідь скопійована не повністю' : 'JSON з помилкою синтаксису');
  return { lesson: out, parts };
}
function saveLessonEverywhere(L) {
  if (CLOUD) return window.Cloud.saveLesson(L).then(() => { C.lessons[L.id] = L; });
  const list = (Store.get('lessons.local', []) || []).filter(x => x.id !== L.id); list.push(L); Store.set('lessons.local', list); C.lessons[L.id] = L; return Promise.resolve();
}

VIEWS.add = main => {
  const ta = h('textarea', { class: 'txt', id: 'lessonjson', spellcheck: 'false', placeholder: 'Встав сюди відповідь Claude з JSON уроку…', style: 'min-height:180px;font-family:monospace;font-size:14px' });
  const file = h('input', { type: 'file', accept: '.json,application/json,text/plain', id: 'lessonfile', multiple: true });
  const out = h('div', { class: 'col' });
  file.addEventListener('change', () => {
    const fs = [...file.files]; if (!fs.length) return;
    if (fs.length === 1) { const r = new FileReader(); r.onload = () => { ta.value = String(r.result); check(); }; r.readAsText(fs[0]); return; }
    Promise.all(fs.map(f => f.text().then(txt => { try { const L = parseLessonText(txt).lesson; const E = validateLesson(L); return { name: f.name, L, E }; } catch (e) { return { name: f.name, E: ['не JSON'] }; } }))).then(list => {
      const ok = list.filter(x => !x.E.length);
      out.replaceChildren(h('div', { class: 'card' }, h('h3', null, 'Файлів: ' + list.length + ' · готові: ' + ok.length),
        h('ul', { class: 'small', style: 'margin:0;padding-left:20px;line-height:1.6' }, list.map(x => h('li', null, x.L && x.L.id ? (x.L.track === 'g' ? 'Граматика ' : 'Лексика ') + x.L.num + ' · ' + x.L.title : x.name, x.E.length ? h('span', { style: 'color:var(--orange-t)' }, ' — ' + x.E.slice(0, 2).join('; ')) : (C.lessons[x.L.id] ? ' (замінить наявний)' : ' (новий)')))),
        ok.length ? h('button', { class: 'btn wide', onclick: async e => { e.target.disabled = true; let n = 0; for (const x of ok) { try { await saveLessonEverywhere(x.L); n++; e.target.textContent = 'Збережено ' + n + ' з ' + ok.length; } catch (err) { toast(x.L.id + ': ' + (err.code || err.message)); } } toast('Збережено уроків: ' + n); go('lessons'); } }, 'Зберегти всі (' + ok.length + ')') : null));
    });
  });
  function check() {
    let L;
    let parts = 1;
    try { const r = parseLessonText(ta.value); L = r.lesson; parts = r.parts; } catch (e) { out.replaceChildren(h('div', { class: 'note' }, 'Не вдалося прочитати JSON: ' + e.message + '. Скопіюй відповідь Claude повністю.')); return; }
    const E = validateLesson(L);
    if (E.length) {
      const onlyPart1 = !Array.isArray(L.days);
      const msg = 'Платформа знайшла помилки в JSON уроку ' + (L.id || '') + ':\n' + E.map(x => '- ' + x).join('\n') + '\n\nВиправ їх і дай повний JSON ще раз (за тією самою схемою, можна у 2 частинах).';
      out.replaceChildren(h('div', { class: 'note' }, h('b', null, onlyPart1 ? 'Схоже, тут лише частина 1. Напиши в чаті «далі» і встав частину 2 у це ж поле під першою.' : 'Знайдено проблеми (' + E.length + '):'), onlyPart1 ? null : h('ul', null, E.slice(0, 25).map(x => h('li', null, x)))),
        onlyPart1 ? null : h('button', { class: 'btn ghost small', style: 'align-self:flex-start', onclick: () => copyText(msg, 'Помилки скопійовано: встав у чат з Claude') }, 'Скопіювати помилки'));
      return;
    }
    const tasks = L.days.reduce((n, d) => n + d.tasks.length, 0);
    const exists = !!C.lessons[L.id];
    out.replaceChildren(h('div', { class: 'card raised' },
      h('span', { class: 'kicker' + (L.track === 'v' ? ' v' : '') }, (L.track === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + L.num + ' · попередній перегляд'),
      h('h2', { lang: 'sk' }, L.title), L.topic ? h('p', { class: 'muted' }, L.topic) : null,
      h('p', { class: 'small' }, 'Днів: 7 · завдань: ' + tasks + ' · карток: ' + (L.cards || []).length + ' · шпаргалок: ' + (L.cheats || []).length + (L.text ? ' · абзаців тексту: ' + L.text.paras.length : '')),
      h('div', { class: 'list' }, L.days.map(d => h('div', { class: 'li' }, h('span', { class: 'b grow' }, 'День ' + d.n + ' · ' + (d.title || '')), h('button', { class: 'btn ghost small', onclick: () => startDay(L, d) }, 'Спробувати')))),
      exists ? h('div', { class: 'note' }, 'Урок ' + L.id + ' уже є. Збереження замінить його вміст. Твій прогрес залишиться.') : null,
      h('button', { class: 'btn wide', onclick: e => { e.target.disabled = true; saveLessonEverywhere(L).then(() => { toast('Урок збережено'); go('lesson-' + L.id); }, err => { e.target.disabled = false; toast('Не вдалося зберегти: ' + (err.code || err.message)); }); } }, exists ? 'Замінити урок' : 'Зберегти урок')));
  }
  main.append(h('div', { class: 'stack', style: 'max-width:820px' }, h('h1', null, 'Додати урок'),
    h('p', { class: 'muted' }, 'Встав JSON уроку, який дав Claude за шаблоном (можна обидві частини разом), або вибери файл .json. Платформа перевірить формат і покаже урок перед збереженням.'),
    h('a', { class: 'card', href: '#howto', style: 'text-decoration:none;color:inherit' }, h('div', { class: 'spread' }, h('div', { class: 'col', style: 'gap:2px' }, h('span', { class: 'b' }, 'Як отримати урок у безкоштовному чаті Claude'), h('span', { class: 'small muted' }, 'Покрокова інструкція і шаблони запиту')), icon('book'))),
    h('div', { class: 'card' }, h('label', { for: 'lessonjson', class: 'b' }, 'JSON уроку'), ta, h('div', { class: 'row wrap' }, h('button', { class: 'btn', onclick: check }, 'Перевірити'), h('label', { class: 'btn ghost small', style: 'display:inline-flex;align-items:center' }, 'Вибрати файл', file))),
    out));
  file.style.display = 'none';
};


/* ---------- як додати урок: шаблони для безкоштовного чату Claude ---------- */
const BOOK_START = [11, 22, 31, 39, 45, 51, 62, 74, 88, 101, 114, 126, 138, 150, 164, 179, 192, 203, 216, 227, 238, 253, 264, 277, 289, 302, 314, 327, 339, 353, 364, 376, 390, 403, 416, 429];
const pdfPage = b => Math.floor((b + 6) / 2);
function pdfRange(n) { const a = BOOK_START[n - 1], b = BOOK_START[n] - 1; return [pdfPage(a), pdfPage(b), a, b]; }
const SCHEMA_TXT = `СХЕМА (строго дотримуйся):
{"schema":1,"id":"ID","track":"TRACK","num":NUM,"title":"назва уроку словацькою","topic":"коротко українською, про що урок","source":"звідки матеріал",
 "cheats":[{"id":"латиницею","title":"...","blocks":[{"t":"p","x":"абзац"},{"t":"h","x":"підзаголовок"},{"t":"list","items":["..."]},{"t":"table","head":["...","..."],"rows":[["...","..."]]},{"t":"trap","x":"пастка для українця"}]}],
 "cards":[{"id":"латиницею","sk":"слово або вираз","uk":"переклад","ex":"приклад речення словацькою (необов'язково)"}],
 "forms":[{"lemma":"іменник","uk":"переклад","vzor":"dub","sg":["N","G","D","A","L","I"],"pl":["N","G","D","A","L","I"]}],
 "verbs":[{"lemma":"дієслово","uk":"переклад","pres":["ja","ty","on","my","vy","oni"],"past":["6 форм, чол. рід, напр. robil som"],"pastf":["6 форм, жін. рід"],"fut":["6 форм"]}],
 "text":{"title":"...","paras":[{"sk":"абзац","uk":"переклад абзацу"}],"gloss":{"слово з тексту в нижньому регістрі":"переклад (для форм: «зуби (A pl від zub)»)"},"qs":[{"q":"питання словацькою","uk":"переклад питання","o":["правильна відповідь","хибна","хибна","хибна"],"a":0,"why":"пояснення"}]},
 "days":[{"n":1,"kind":"new","title":"...","tasks":[...]}, ... {"n":6,"kind":"review","title":"Повторення 1","count":12,"tasks":[]},{"n":7,"kind":"review","title":"Повторення 2","count":12,"tasks":[]}]}

ТИПИ ЗАВДАНЬ (поле "t"):
{"t":"learn","cards":["id картки","..."]}  — нові слова (5–9 на день)
{"t":"rule","title":"...","cheat":"id шпаргалки","blocks":[як у cheats]}  — коротке правило перед вправами. Завдання «напиши текст / домашнє» — теж rule, але з "opt":true (необов'язкове)
{"t":"choice","q":"інструкція українською","sk":"речення з ___ на місці пропуску","hint":"слово в початковій формі","uk":"переклад речення","o":["правильна","хибна","хибна","хибна"],"a":0,"why":"чому так","cheat":"id шпаргалки"}
{"t":"input","q":"...","sk":"речення з ___","hint":"...","uk":"...","a":["правильна відповідь","інший допустимий варіант"],"why":"...","cheat":"..."}
{"t":"match","q":"З'єднай пари","pairs":[["словацькою","українською"], 4–6 пар]}
{"t":"read","p":[номери абзаців з 0],"qs":[номери питань з 0]}
{"t":"det","sk":"речення з ___","uk":"переклад","word":"іменник у N sg","wuk":"переклад","g":"m|f|n","anim":false,"vzor":"chlap|hrdina|dub|stroj|žena|ulica|dlaň|kosť|mesto|srdce|vysvedčenie|dievča","case":"G|D|A|L|I","num":"sg|pl","prep":"прийменник з речення (якщо є)","a":["правильна форма"],"why":"..."}
{"t":"tr","uk":"речення українською","a":["переклад словацькою","інший правильний варіант"],"hint":"(необов'язково) ключове слово","why":"..."}  — переклад речення
{"t":"build","sk":"речення словацькою (4–10 слів)","uk":"переклад","extra":["(необов'язково) зайве слово-пастка"],"why":"..."}  — скласти речення з перемішаних слів
{"t":"dict","sk":"речення словацькою","uk":"переклад"}  — диктант через озвучку
{"t":"speak","sk":"речення словацькою","uk":"переклад","mode":"read|repeat"}  — прочитати / повторити вголос
СХОДИНКИ: у кожен новий день (1–5) наприкінці додай 1–2 "tr" на граматику дня, 1 "build", 1 "dict", 1 "speak" (у дні з діалогом — "mode":"repeat"). Для build, dict і speak бери речення з тексту уроку.

ТЕХНІЧНІ ПРАВИЛА:
- "a" у choice — номер правильного варіанта, рахуючи з 0. Платформа сама перемішує варіанти.
- id карток і шпаргалок — лише малі латинські літери й цифри (напр. "kupelna", "dub"). Кожен id з "learn" має бути в "cards", кожен "cheat" — у "cheats".
- Рівно 7 днів, "n" від 1 до 7. Дні 6–7: "kind":"review", "count":12, "tasks" порожні або 1–2 завдання "read".
- У текстах можна виділяти **жирним**. Жодного HTML.
- Відповідай ТІЛЬКИ JSON у блоці коду, без пояснень до чи після.
- Якщо все не вміщується в одне повідомлення: частина 1 = {"schema":1,"part":1,"id":"ID", ... усе, крім "days"}; потім зупинись і напиши «Напиши: далі». Частина 2 = {"schema":1,"part":2,"id":"ID","days":[...]}.`;
function templateGrammar(n) {
  const [p1, p2, b1, b2] = pdfRange(n);
  return `Ти допомагаєш двом українцям (Дімі й Наташі) вчити словацьку на рівень B1. Рідна мова українська. Прикріплено скан уроку ${n} з підручника Пахомова, Джоґанік «Словацька мова» (с. ${b1}–${b2}). На кожній сторінці PDF два книжкові розвороти.

Зроби з нього урок для нашої навчальної платформи у форматі JSON (схема нижче).

ЗМІСТ:
- 7 днів по ~10 хв. Дні 1–5 "new": день 1 — нові слова + перші абзаци тексту уроку з питаннями; дні 2–5 — граматика уроку по частинах: спочатку коротке "rule", потім 8–11 вправ від простих до складніших (choice, input, match, det). Решту абзаців тексту розподіли по днях 2–7 через "read".
- Нові слова з розділу «Слова і вирази» та з тексту розподіли по днях 1–5 (learn, 5–8 на день).
- "cheats": кожне правило уроку на одному екрані: таблиця закінчень, порівняння з українською, пастки (типові помилки українців). Стиль коротко і по суті.
- "why" — коротке пояснення українською, ключове закінчення **жирним**.
- "text": текст уроку з підручника абзацами (дослівно, з правильною діакритикою) + переклад; "gloss" — КОЖНЕ слово тексту в нижньому регістрі з перекладом; "qs" — 6–10 питань на розуміння.
- "forms": 8–12 іменників уроку з усіма формами; "verbs": дієслова уроку з таблицями (якщо в уроці є дієслова).
- Словацька має бути бездоганною: перевір діакритику (á ä č ď é í ĺ ľ ň ó ô ŕ š ť ú ý ž) і всі форми. Скан може бути нечітким — обирай правильну словацьку форму.
- Не вигадуй правил, яких немає в уроці. Приклади речень можна свої, прості, побутові.

ID = "g${pad(n)}", TRACK = "g", NUM = ${n}, source = "Пахомова, Джоґанік, с. ${b1}–${b2}".

${SCHEMA_TXT}`;
}
function templateVocab(n) {
  return `Ти допомагаєш двом українцям (Дімі й Наташі) вчити словацьку на рівень B1. Рідна мова українська. Прикріплено презентацію викладачки до заняття з лексики №${n} (таблиці слів, картинки, вправи).

Зроби з неї лексичний урок для нашої навчальної платформи у форматі JSON (схема нижче).

ЗМІСТ:
- "cards": УСІ слова й вирази з презентації — і з таблиць, і з картинок/скриншотів, — з правильним перекладом українською. Якщо слово на слайді без перекладу, переклади сам.
- 7 днів по ~5 хв. Дні 1–5 "new": кожен день = одна тема з презентації: "learn" (6–10 карток) + "match" (5 пар) + 2–3 "choice" (значення слова / як сказати словацькою) + 1–2 "input" (напиши словацькою; "sk" = українське слово, без ___). Дні 6–7 "review", "count":8, "tasks":[].
- Якщо в презентації є граматика або розмовні фрази — додай "cheats" і короткий "rule" у відповідний день.
- "why" — коротке пояснення українською (пастки на кшталт «byt = квартира, а не "бути"»).
- Якщо в презентації згадано блоки e-slovak, додай "eslovak":[{"title":"назва блоку і вправи","url":"https://www.e-slovak.sk/"}].
- "text": 2–3 короткі діалоги або текст (по 4–8 речень) зі словами уроку, простою мовою, з "gloss" для КОЖНОГО слова тексту і 4–6 "qs". У день 5 додай {"t":"read","p":[0,1,2],"qs":[...]}. "forms" і "verbs" для лексики не потрібні.
- Сходинки (див. нижче) теж додай: 1 "tr", 1 "build", 1 "dict", 1 "speak" на день, речення з цими словами.
- Словацька має бути бездоганною: перевір діакритику.

ID = "v${pad(n)}", TRACK = "v", NUM = ${n}, source = "Презентація викладачки, заняття ${n}".

${SCHEMA_TXT}`;
}
function copyText(txt, okMsg) {
  try { navigator.clipboard.writeText(txt).then(() => toast(okMsg || 'Скопійовано'), () => showCopy(txt)); } catch (e) { showCopy(txt); }
}
function showCopy(txt) { const ta = h('textarea', { class: 'txt', readonly: true, 'aria-label': 'Текст для копіювання' }); ta.value = txt; dialog('Скопіюй вручну', h('div', { class: 'col' }, h('p', { class: 'small' }, 'Виділи весь текст (Ctrl+A) і скопіюй (Ctrl+C).'), ta), [['Готово', () => { }]]); setTimeout(() => { ta.focus(); ta.select(); }, 50); }

VIEWS.howto = main => {
  const gSel = h('select', { class: 'txt', id: 'gnum', style: 'max-width:200px' }, Array.from({ length: 35 }, (_, i) => h('option', { value: i + 1, selected: i + 1 === Math.min(35, S.course + 1) }, 'Урок ' + (i + 1))));
  const rangeOut = h('p', { class: 'b' });
  const upd = () => { const n = +gSel.value; const [p1, p2, b1, b2] = pdfRange(n); rangeOut.textContent = 'Книжкові сторінки ' + b1 + '–' + b2 + ' → сторінки PDF: ' + p1 + '–' + p2; };
  gSel.addEventListener('change', upd); upd();
  const vNum = h('input', { class: 'txt', id: 'vnum', type: 'number', min: '1', max: '40', value: String(S.course), style: 'max-width:200px' });
  const step = (n, title, ...body) => h('div', { class: 'li', style: 'align-items:flex-start' }, h('span', { class: 'ico g', style: 'font-weight:900' }, n), h('div', { class: 'col grow', style: 'gap:4px' }, h('span', { class: 'b' }, title), ...body.map(x => typeof x === 'string' ? h('span', { class: 'small' }, rich(x)) : x)));
  main.append(h('div', { class: 'stack', style: 'max-width:820px' },
    h('a', { href: '#add', class: 'small b' }, '← Додати урок'),
    h('h1', null, 'Як додати урок'),
    h('p', { class: 'muted' }, 'Працює з безкоштовним Claude. Один урок займає ~10 хвилин. Робить будь-хто з вас: урок одразу з\'явиться в обох.'),
    h('div', { class: 'card' }, h('h2', null, 'Граматика (з підручника)'),
      h('div', { class: 'row wrap' }, h('label', { for: 'gnum', class: 'b' }, 'Номер уроку:'), gSel), rangeOut,
      h('div', { class: 'list' },
        step(1, 'Виріж сторінки з PDF', 'Відкрий PDF підручника в Chrome → **Ctrl+P** → Принтер: **«Зберегти як PDF»** → Сторінки: **«Власні»** → впиши діапазон сторінок PDF, показаний вище → **Зберегти**.'),
        step(2, 'Новий чат з Claude', 'На claude.ai почни **новий чат**, прикріпи збережений PDF.'),
        step(3, 'Встав шаблон', h('button', { class: 'btn small', style: 'align-self:flex-start', onclick: () => copyText(templateGrammar(+gSel.value), 'Шаблон скопійовано: встав у чат') }, 'Скопіювати шаблон'), 'Номер уроку вже підставлено. Встав (**Ctrl+V**) і надішли.'),
        step(4, 'Якщо відповідь з двох частин', 'Після першої частини напиши **далі**. Скопіюй обидві частини (кнопка Copy під кожним повідомленням).'),
        step(5, 'Перевір на платформі', 'Розділ **«Додати урок»** → встав відповідь (обидві частини в одне поле) → **Перевірити**.'),
        step(6, 'Якщо є помилки', 'Натисни **«Скопіювати помилки»** і надішли їх у той самий чат: Claude виправить. Потім знову крок 5.'),
        step(7, 'Збережи', 'Натисни **«Спробувати»** на одному дні, і якщо все гаразд, **«Зберегти урок»**.'))),
    h('div', { class: 'card' }, h('h2', null, 'Лексика (з презентації)'),
      h('div', { class: 'row wrap' }, h('label', { for: 'vnum', class: 'b' }, 'Номер заняття:'), vNum),
      h('div', { class: 'list' },
        step(1, 'Перетвори презентацію на PDF', 'Відкрий .pptx у PowerPoint або Google Slides → **Файл → Зберегти як / Завантажити → PDF**.'),
        step(2, 'Новий чат з Claude', 'Почни **новий чат**, прикріпи PDF презентації.'),
        step(3, 'Встав шаблон', h('button', { class: 'btn small blue', style: 'align-self:flex-start', onclick: () => copyText(templateVocab(Math.max(1, Math.min(40, +vNum.value || 1))), 'Шаблон скопійовано: встав у чат') }, 'Скопіювати шаблон'), 'Встав і надішли.'),
        step(4, 'Далі як для граматики', 'Кроки 4–7 вище: «Додати урок» → Перевірити → Зберегти.'))),
    h('div', { class: 'card' }, h('h3', null, 'Підказки'), h('ul', { style: 'margin:0;padding-left:20px;line-height:1.6' },
      h('li', null, 'Один урок = один новий чат. Так Claude не плутається і менше витрачає ліміт.'),
      h('li', null, 'Якщо ліміт безкоштовного чату закінчився посеред уроку, продовж наступного дня в тому самому чаті: «далі».'),
      h('li', null, 'Якщо урок із таким номером уже є, нова версія замінить його вміст, а прогрес залишиться.'),
      h('li', null, 'Перевіряй словацьку в уроці на занятті: якщо викладачка каже інакше, виправ урок у чаті й збережи ще раз.')))));
};

/* ---------- старт ---------- */
function gate(...kids) {
  let g = $('#gate'); if (!g) { g = h('div', { class: 'picker', id: 'gate' }); document.body.append(g); }
  $('#app').hidden = true; $('#bottom').hidden = true;
  g.replaceChildren(h('div', { class: 'box' }, h('div', { class: 'logo', style: 'font-size:30px' }, 'slovenčina'), ...kids));
}
function ungate() { const g = $('#gate'); if (g) g.remove(); $('#app').hidden = false; $('#bottom').hidden = false; }
function waitCloud(ms) {
  return new Promise((res, rej) => {
    if (window.Cloud) return res(window.Cloud);
    const t = setTimeout(() => rej(new Error('timeout')), ms);
    window.addEventListener('cloud-ready', () => { clearTimeout(t); res(window.Cloud); }, { once: true });
  });
}
function profilePicker() {
  gate(h('h1', null, 'Хто вчиться?'), h('p', { class: 'muted' }, 'У кожного свій прогрес.'),
    h('button', { class: 'btn wide', onclick: () => pickP('dima') }, 'Діма'), h('button', { class: 'btn blue wide', onclick: () => pickP('natasha') }, 'Наташа'), h('button', { class: 'btn ghost wide', onclick: () => pickP('marina') }, 'Марина'), h('button', { class: 'btn ghost wide', onclick: () => pickP('vlad') }, 'Влад'));
  function pickP(p) { ungate(); loadProfile(p); render(); }
}
async function cloudBoot() {
  gate(h('p', { class: 'muted' }, 'Завантаження…'));
  const sc = document.createElement('script'); sc.type = 'module'; sc.src = 'cloud.js'; document.head.append(sc);
  let Cl;
  try { Cl = await waitCloud(20000); } catch (e) { gate(h('h2', null, 'Не вдалося завантажити Firebase'), h('p', { class: 'muted' }, 'Перевір інтернет і онови сторінку.')); return; }
  if ('serviceWorker' in navigator) { const hadCtrl = !!navigator.serviceWorker.controller; navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => { }); let rl = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtrl && !rl && $('#player').hidden) { rl = true; location.reload(); } }); }
  let started = false;
  Cl.onUser(async user => {
    if (!user) {
      UID = null; started = false;
      gate(h('h1', null, 'Вхід'), h('p', { class: 'muted' }, 'Платформа відкрита лише для Діми й Наташі.'),
        h('button', { class: 'btn wide', onclick: () => Cl.signIn().catch(e => { if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') toast('Вхід не вдався: ' + (e.code || e.message)); }) }, 'Увійти через Google'));
      return;
    }
    const prof = Cl.ALLOWED[String(user.email || '').toLowerCase()];
    if (!prof || !user.emailVerified) {
      gate(h('h2', null, 'Немає доступу'), h('p', null, 'Акаунт ' + (user.email || '') + ' не має доступу до платформи.'), h('button', { class: 'btn ghost wide', onclick: () => Cl.signOut() }, 'Увійти іншим акаунтом'));
      return;
    }
    if (started) return; started = true;
    gate(h('p', { class: 'muted' }, 'Завантажую прогрес…'));
    UID = user.uid; Cl.email = user.email; PROFILE = prof;
    const local = Store.get('p.' + prof, null);
    let remote = null, remoteOk = true;
    try { const d = await Cl.loadProgress(UID); if (d && d.json) remote = JSON.parse(d.json); } catch (e) { remoteOk = false; }
    S = Object.assign(newState(), mergeState(local ? Object.assign(newState(), local) : null, remote ? Object.assign(newState(), remote) : null) || {});
    Store.set('p.' + prof, S);
    if (remoteOk) oneTimeFixes();
    if (remoteOk && (!remote || progressSig(S) !== progressSig(Object.assign(newState(), remote)))) pushCloud();
    SYNC.state = remoteOk ? 'ok' : 'err';
    try { await loadContent(); } catch (e) { C.errors.push('уроки: ' + (e.code || e.message)); }
    Cl.watchProgress(list => {
      let changed = false;
      list.forEach(d => {
        const p2 = Cl.ALLOWED[String(d.email || '').toLowerCase()]; if (!p2) return;
        let st; try { st = Object.assign(newState(), JSON.parse(d.json)); } catch (e) { return; }
        if (p2 !== PROFILE) { OTHER[p2] = st; ntSync(); return; }
        if (d.id !== UID) return;
        const before = progressSig(S); S = mergeState(S, st); Store.set('p.' + PROFILE, S);
        if (progressSig(S) !== before) changed = true;
        if (progressSig(S) !== progressSig(st)) { clearTimeout(cloudT); cloudT = setTimeout(pushCloud, 1500); }
      });
      if (!changed && !list.length) return;
      if ($('#player').hidden && ['today', ''].includes(ROUTE)) render();
    }, () => { });
    ungate(); render();
    ntLoad().then(() => { if (ROUTE === 'more') render(); });
    slotPull(true);
  });
}
async function boot() {
  $('#pl-close').addEventListener('click', askExit);
  $('#pl-scrim').addEventListener('click', closeCheat);
  window.addEventListener('hashchange', () => { if ($('#player').hidden && PROFILE) render(); });
  if (CLOUD) return cloudBoot();
  await loadContent();
  const p = Store.get('profile', null);
  if (p && NAMES[p]) { loadProfile(p); render(); } else profilePicker();
}
boot();
