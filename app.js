'use strict';
/* Slovenčina · платформа Діми й Наташі. Пілотна версія: прогрес у браузері (localStorage). */

/* Хмарний режим на GitHub Pages (і localhost для розробки); у попередньому перегляді в Claude працює локальний режим */
const CLOUD = /(^|\.)github\.io$/.test(location.hostname) || location.hostname === 'localhost';
const PILOT = !CLOUD;
let UID = null; const OTHER = {}; let SYNC = { state: 'local', err: '' };
const LESSON_FILES = ['lessons/g09.json', 'lessons/v08.json'];
const NAMES = { dima: 'Діма', natasha: 'Наташа' };
const G_TOPICS = { 1: 'Вступний курс', 2: 'Вступний курс', 3: 'Вступний курс', 4: 'Вступний курс', 5: 'Вступний курс', 7: 'Moja izba', 8: 'Moja rodina · chlap, hrdina', 9: 'Ako vyzerá môj pracovný deň?', 10: 'Ako trávim svoj voľný čas? · stroj', 11: 'žena', 12: 'ulica', 13: 'mesto, srdce' };
const V_NUMS = [1, 2, 3, 4, 5, 7, 8];
const V_TOPICS = { 1: 'Абетка, вимова, знайомство', 2: 'М\'якість, tykanie/vykanie, професії', 3: 'Kto je to? Прізвища, країни', 4: 'Дієслова, числівники', 5: 'Числівники', 7: 'Кімната, родина', 8: 'Місто' };
const DIA = ['á', 'ä', 'č', 'ď', 'é', 'í', 'ĺ', 'ľ', 'ň', 'ó', 'ô', 'ŕ', 'š', 'ť', 'ú', 'ý', 'ž'];
const SRS_IV = [0, 1, 2, 4, 8, 16, 32];

/* ---------- іконки (власні константи) ---------- */
const I = {
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
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="#B4560A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-3 .5-5.5 1-8.5z"/></svg>',
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
function norm(s) { return String(s || '').normalize('NFC').toLowerCase().replace(/[’']/g, "'").replace(/[.!?,;:]+$/, '').replace(/\s+/g, ' ').trim(); }
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
function newState() { return { v: 1, rev: 0, reset: {}, course: 9, done: {}, sessions: {}, cards: {}, mistakes: {}, texts: [], links: {}, settings: { tts: true } }; }
let PROFILE = null, S = null;
function loadProfile(p) { PROFILE = p; S = Object.assign(newState(), Store.get('p.' + p, {})); Store.set('profile', p); }
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
  out.cards = Object.assign({}, older.cards || {});
  Object.entries(newer.cards || {}).forEach(([k, c]) => { const o = out.cards[k]; if (!o || String(c.due || '') >= String(o.due || '')) out.cards[k] = c; });
  const tx = {}; (older.texts || []).forEach(t => { tx[t.id] = t; }); (newer.texts || []).forEach(t => { tx[t.id] = t; }); out.texts = Object.values(tx);
  out.links = Object.assign({}, older.links || {}, newer.links || {});
  out.rev = Math.max(a.rev || 0, b.rev || 0);
  return out;
}
const progressSig = st => Object.keys(st.done || {}).length + '|' + Object.keys(st.sessions || {}).length + '|' + Object.keys(st.cards || {}).length + '|' + Object.keys(st.mistakes || {}).length;
function save() {
  S.rev = Date.now(); Store.set('p.' + PROFILE, S);
  if (CLOUD && UID && window.Cloud) { clearTimeout(cloudT); cloudT = setTimeout(pushCloud, 1500); }
}
function pushCloud() {
  clearTimeout(cloudT); cloudT = null;
  if (!(CLOUD && UID && window.Cloud)) return;
  SYNC.state = 'saving';
  window.Cloud.saveProgress(UID, NAMES[PROFILE], S).then(() => { SYNC = { state: 'ok', err: '', at: new Date().toLocaleTimeString('uk-UA') }; }, e => { SYNC = { state: 'err', err: e.code || e.message, at: new Date().toLocaleTimeString('uk-UA') }; toast('Прогрес не синхронізувався: ' + SYNC.err); if ($('#player').hidden) render(); });
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && cloudT) pushCloud(); });
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
/** 75% картки поточних уроків, 25% старі */
function pickCards(list, n) {
  const cur = new Set([lid('g', S.course), (nextDay('g') || {}).L && nextDay('g').L.id, (nextDay('v') || {}).L && nextDay('v').L.id]);
  const a = shuffle(list.filter(x => cur.has(x.L.id))), b = shuffle(list.filter(x => !cur.has(x.L.id)));
  const nb = Math.min(b.length, Math.round(n * 0.25)); const out = a.slice(0, n - nb).concat(b.slice(0, nb));
  return shuffle(out.length < n ? out.concat(b.slice(nb, nb + n - out.length)) : out);
}

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
const GRADED = ['choice', 'input', 'match', 'det'];
function lessonPool(L) {
  const pool = [];
  L.days.forEach(d => { if (d.kind === 'new') d.tasks.forEach((t, i) => { if (GRADED.includes(t.t)) pool.push({ type: t.t, L, task: t, mkey: L.id + ':' + d.n + ':' + i }); }); });
  return pool;
}
function mistakeItems(filter) {
  return Object.entries(S.mistakes).filter(([k, m]) => !filter || filter(m)).map(([k, m]) => ({ type: m.task.t, L: C.lessons[m.lid] || null, task: m.task, mkey: k, fromMistakes: true }));
}
function reviewItems(L, count) {
  const nCur = Math.round(count * 0.75);
  const cards = (L.cards || []).map(c => ({ type: 'flash', L, card: c, key: L.id + ':' + c.id, dir: Math.random() < 0.5 ? 'sk' : 'uk' }));
  const nCards = Math.min(3, cards.length);
  const cur = sample(lessonPool(L), nCur - nCards).concat(sample(cards, nCards));
  let old = sample(mistakeItems(m => m.lid !== L.id), count - nCur);
  if (old.length < count - nCur) {
    const others = Object.keys(S.cards).map(cardFromKey).filter(x => x && x.L.id !== L.id).map(x => ({ type: 'flash', L: x.L, card: x.c, key: x.key, dir: 'sk' }));
    old = old.concat(sample(others, count - nCur - old.length));
  }
  const own = sample(mistakeItems(m => m.lid === L.id), 3);
  let all = cur.concat(old, own);
  if (all.length < count) all = all.concat(sample(lessonPool(L), count - all.length));
  const seen = new Set(); all = all.filter(x => !x.mkey || (seen.has(x.mkey) ? false : (seen.add(x.mkey), true)));
  return shuffle(all);
}
function dayItems(L, d) {
  let out = [];
  d.tasks.forEach((t, i) => { out = out.concat(expandTask(L, t, L.id + ':' + d.n + ':' + i)); });
  if (d.kind === 'review') out = reviewItems(L, d.count || 10).concat(out);
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
  dialog('Хто зараз вчиться?', h('p', { class: 'muted' }, 'У кожного свій прогрес. Після підключення Firebase вхід буде через Google.'), [['Діма', () => { loadProfile('dima'); render(); }, PROFILE === 'dima' ? '' : 'ghost'], ['Наташа', () => { loadProfile('natasha'); render(); }, PROFILE === 'natasha' ? '' : 'ghost']]);
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
  $('#player').hidden = false; document.body.style.overflow = 'hidden';
  showItem();
}
function closePlayer() { $('#player').hidden = true; document.body.style.overflow = ''; closeCheat(); render(); }
function askExit() {
  dialog('Вийти з сесії?', h('p', null, 'Дні, які ти вже завершив у цій сесії, збережені. Решту можна пройти пізніше.'), [['Продовжити', () => { }, 'ghost'], ['Вийти', () => { closePlayer(); }, 'orange']]);
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
  const kick = it.L ? h('div', { class: 'kicker' + (it.L.track === 'v' ? ' v' : '') }, (it.L.track === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + it.L.num + (it.fromMistakes ? ' · помилка' : '') + (it.retry ? ' · ще раз' : '')) : null;
  if (kick) inner.append(kick);
  body.append(inner);
  const R = RENDER[it.type];
  if (!R) { next(); return; }
  PL.ctl = R(it, inner) || {};
  setFoot(PL.ctl.primary || null);
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
  progressUI();
}
function next() { if (PL.cur && !PL.cur.answered) { PL.cur.answered = true; markPart(PL.cur); } PL.i++; showItem(); }
function endSession() {
  const mins = Math.max(1, Math.round((Date.now() - PL.started) / 60000));
  if (PL.onEnd) PL.onEnd();
  if (PL.stats.ok + PL.stats.bad + PL.stats.almost > 0 || PL.total > 0) S.sessions[today()] = true;
  save();
  closeCheat(); $('#pl-cheatbtn').hidden = true;
  $('#pl-fill').style.width = '100%';
  const graded = PL.stats.ok + PL.stats.bad + PL.stats.almost;
  $('#pl-body').replaceChildren(h('div', { class: 'pl-inner endscreen' },
    h('div', { class: 'big' }, 'Готово!'),
    h('h2', null, PL.title || 'Сесію завершено'),
    graded ? h('p', { class: 'b' }, 'Правильно ' + PL.stats.ok + ' з ' + graded + (PL.stats.almost ? ' · майже: ' + PL.stats.almost : '')) : null,
    h('p', { class: 'muted' }, 'Час: ~' + mins + ' хв'),
    mistakeCount() ? h('p', { class: 'muted small' }, 'У «Помилках» зараз ' + mistakeCount() + '. Вони повернуться в днях повторення.') : null
  ));
  setFoot({ label: 'На головну', fn: () => { closePlayer(); go('today'); } });
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
  root.append(opt ? h('div', { class: 'kicker opt' }, h('span', { class: 'badge' }, 'Необов\'язково')) : null, h('h1', null, t.title || 'Правило'), renderBlocks(t.blocks));
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
  root.append(h('h2', null, 'Нове слово'), h('div', { class: 'flash' }, h('div', { class: 'row' }, h('div', { class: 'fw', lang: 'sk' }, c.sk), speakBtn(c.sk)), tr, ex, reveal), knew);
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
  root.append(h('h2', null, it.dir === 'uk' ? 'Як це словацькою?' : 'Що це означає?'), h('div', { class: 'flash' }, h('div', { class: 'row' }, h('div', { class: 'fw', lang: it.dir === 'uk' ? 'uk' : 'sk' }, front), it.dir === 'sk' ? speakBtn(c.sk) : null), bk, ex, reveal), grade);
  return { keys: e => { if (e.key === 'Enter' || e.key === ' ') { if (!shown) show(); else done(true); return true; } if (shown && e.key === '1') { done(false); return true; } if (shown && e.key === '2') { done(true); return true; } }, focus: reveal };
};

RENDER.choice = (it, root) => {
  const t = it.task; let sel = -1;
  const order = shuffle(t.o.map((x, i) => i));
  const blank = h('span');
  root.append(h('h1', null, t.q || 'Обери відповідь'));
  let sentEl = null;
  if (t.sk) { sentEl = sentence(t.sk); root.append(sentEl); }
  const hw = hintEl(t); if (hw) root.append(hw);
  const btns = order.map((oi, k) => h('button', { class: 'opt', onclick: () => pick(k) }, h('span', { class: 'k' }, k + 1), h('span', { lang: 'sk' }, t.o[oi])));
  root.append(h('div', { class: 'opts' + (t.o.every(x => x.length < 22) ? ' two' : '') }, btns));
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

RENDER.input = (it, root) => {
  const t = it.task;
  root.append(h('h1', null, t.q || 'Напиши відповідь'));
  const sentEl = sentence(t.sk); root.append(sentEl);
  const hw = hintEl(t); if (hw) root.append(hw);
  const inp = h('input', { class: 'answer', id: 'ans', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', lang: 'sk', 'aria-label': 'Твоя відповідь', oninput: () => enablePrimary(inp.value.trim().length > 0) });
  root.append(h('div', { class: 'col' }, h('label', { for: 'ans', class: 'small b muted' }, 'Твоя відповідь'), inp, diaBar(inp)));
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

RENDER.match = (it, root) => {
  const t = it.task; let selL = -1, selR = -1, left = t.pairs.length, errors = 0;
  root.append(h('h1', null, t.q || 'З\'єднай пари'));
  const L = shuffle(t.pairs.map((p, i) => i)), R = shuffle(t.pairs.map((p, i) => i));
  const lb = L.map((pi, k) => h('button', { class: 'opt', lang: 'sk', onclick: () => tap('L', k) }, t.pairs[pi][0]));
  const rb = R.map((pi, k) => h('button', { class: 'opt', onclick: () => tap('R', k) }, t.pairs[pi][1]));
  const grid = h('div', { class: 'match' }); lb.forEach((b, k) => { grid.append(b, rb[k]); });
  root.append(grid);
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
  root.append(h('h1', null, tx.title), h('p', { class: 'muted small' }, 'Торкнись слова, щоб побачити переклад. Переклад абзацу відкривається кнопкою.'));
  const pop = h('div', { class: 'pop', hidden: true, role: 'status' });
  it.paras.forEach(pi => root.append(paraEl(tx, pi, pop)));
  root.append(pop);
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
  return h('div', { class: 'para' }, sk, h('div', { class: 'row', style: 'gap:6px' }, tbtn, speakBtn(p.sk)), uk);
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
  root.append(h('h1', null, t.q || 'Визначник: крок за кроком'));
  let sentEl = null;
  if (t.sk) { sentEl = sentence(t.sk); root.append(sentEl); }
  root.append(h('div', { class: 'hint' }, 'Слово: ', h('b', { lang: 'sk' }, t.word), t.wuk ? ' (' + t.wuk + ')' : '', t.prep ? ' · прийменник: ' : '', t.prep ? h('b', null, t.prep) : null));
  const steps = h('div', { class: 'steps' }); root.append(steps);
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
  const due = pickCards(dueCards(), 4);
  if (due.length) parts.push({ label: 'Картки на повтор', sub: due.length + ' ' + plural(due.length, 'слово', 'слова', 'слів'), ico: 'o', items: flashItems(due) });
  const g = nextDay('g'), v = nextDay('v');
  if (g) parts.push({ key: dayKey(g.L, g.d), label: 'Граматика · урок ' + g.L.num + ', день ' + g.d.n, sub: g.d.title, ico: 'g', items: dayItems(g.L, g.d) });
  if (v) parts.push({ key: dayKey(v.L, v.d), label: 'Лексика · урок ' + v.L.num + ', день ' + v.d.n, sub: v.d.title, ico: 'v', items: dayItems(v.L, v.d) });
  return parts;
}
function estMin(items) { let s = 0; items.forEach(it => { s += it.type === 'readp' ? 90 : it.type === 'rule' ? 50 : it.type === 'learn' || it.type === 'flash' ? 15 : it.type === 'det' ? 70 : it.type === 'match' ? 40 : 30; }); return Math.max(1, Math.round(s / 60)); }
function startToday() {
  const parts = todayParts();
  startSession({ title: 'Сесію на сьогодні пройдено', parts, onEnd: () => { S.sessions[today()] = true; save(); } });
}
function startDay(L, d) { startSession({ title: (L.track === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + L.num + ', день ' + d.n, parts: [{ key: dayKey(L, d), items: dayItems(L, d) }] }); }

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
  return [h('span', null, name), ...cells, h('span', { class: 'n' }, st ? streakOf(st) : '—')];
}

VIEWS.today = main => {
  const now = new Date();
  const o = otherState();
  const parts = todayParts();
  const doneToday = !!S.sessions[today()];
  const allItems = parts.flatMap(p => p.items);
  const g = nextDay('g');
  main.append(h('div', { class: 'stack' },
    h('div', { class: 'hello' }, h('div', { class: 'col', style: 'gap:2px' }, h('span', { class: 'muted b small' }, UA_WD[now.getDay()] + ', ' + now.getDate() + ' ' + UA_MONTHS[now.getMonth()]), h('h1', null, 'Привіт, ' + NAMES[PROFILE] + '!')), h('button', { class: 'avatar', 'aria-label': 'Змінити профіль', onclick: switchProfile }, NAMES[PROFILE][0])),
    CLOUD && SYNC.state === 'err' ? h('div', { class: 'note' }, 'Прогрес не зберігається в базі: ' + SYNC.err + '. Зроби скриншот і надішли Дімі.') : null,
    h('div', { class: 'grid2' },
      h('div', { class: 'stack' },
        h('div', { class: 'card raised' },
          h('div', { class: 'spread' }, h('h2', null, doneToday ? 'Сесію пройдено' : 'Сесія на сьогодні'), allItems.length ? h('span', { class: 'b muted small' }, '~' + estMin(allItems) + ' хв') : null),
          doneToday ? h('p', { class: 'muted' }, 'На сьогодні все. Завтра платформа продовжить з наступного дня.') : null,
          parts.length ? h('div', { class: 'plan' }, parts.map(p => h('div', { class: 'planrow' }, h('div', { class: 'ico ' + p.ico, html: p.ico === 'g' ? I.grammar : p.ico === 'v' ? I.vocab : I.cards }), h('div', { class: 'col grow', style: 'gap:0' }, h('span', { class: 'b' }, p.label), h('span', { class: 'small muted' }, p.sub)), h('span', { class: 'small b muted' }, estMin(p.items) + ' хв')))) : h('p', { class: 'muted' }, C.errors.length ? 'Не вдалося завантажити уроки.' : 'Усі доступні дні пройдено. Нові уроки з\'являться після додавання.'),
          !doneToday && parts.length ? h('button', { class: 'btn wide', onclick: startToday }, 'Почати') : null,
          doneToday && PILOT && parts.length ? h('button', { class: 'btn ghost wide', onclick: startToday }, 'Пілот: пройти наступну сесію') : null
        ),
        h('div', { class: 'soft spread' }, h('span', { class: 'b' }, 'Ми на курсі зараз: ', h('span', null, 'урок ' + S.course)), h('button', { class: 'link', onclick: chooseCourse }, 'змінити')),
        g && g.L.num < S.course ? h('div', { class: 'note spread' }, h('span', null, 'Курс уже на уроці ' + S.course + '. Платформа чекає на тебе на уроці ' + g.L.num + '.'), C.lessons[lid('g', S.course)] ? h('button', { class: 'btn small orange', onclick: () => go('lesson-' + lid('g', S.course)) }, 'Урок ' + S.course) : null) : null,
        ...['g', 'v'].map(tr => { const nd = nextDay(tr) || (lessonsOf(tr).length ? { L: lessonsOf(tr)[lessonsOf(tr).length - 1] } : null); if (!nd) return null; const L = nd.L; return h('div', { class: 'card' }, h('div', { class: 'col', style: 'gap:2px' }, h('h3', null, (tr === 'g' ? 'Граматика' : 'Лексика') + ' · урок ' + L.num), h('a', { href: '#lesson-' + L.id, class: 'small b', lang: 'sk' }, L.title)), dayPath(L), PILOT ? h('p', { class: 'tiny muted' }, 'Пілот: будь-який день можна відкрити тапом.') : null); })
      ),
      h('div', { class: 'stack' },
        h('div', { class: 'streaks' }, [[PROFILE, S], [o.id, o.st]].map(([id, st]) => h('div', { class: 'streak' }, icon('flame'), h('div', { class: 'col', style: 'gap:0' }, h('span', { class: 'small b muted' }, NAMES[id]), h('span', { class: 'n' }, st ? streakOf(st) + ' ' + plural(streakOf(st), 'день', 'дні', 'днів') : '—'))))),
        h('div', { class: 'card' }, h('h3', null, 'Активність за 2 тижні'), h('div', { class: 'cal' }, calendarRow(NAMES[PROFILE], S), calendarRow(NAMES[o.id], o.st)), !o.st ? h('p', { class: 'tiny muted' }, NAMES[o.id] + ': з\'явиться після підключення Firebase (або якщо ' + (o.id === 'natasha' ? 'вона' : 'він') + ' вчиться в цьому ж браузері).') : null),
        CLOUD && !Object.keys(S.done).length && !Object.keys(S.cards).length ? h('div', { class: 'card' }, h('h3', null, 'Є прогрес з пілоту?'), h('p', { class: 'small muted' }, 'У пілоті: Налаштування → «Скопіювати копію». Тут: Налаштування → «Відновити з копії».'), h('button', { class: 'btn ghost small', onclick: importDialog }, 'Відновити з копії')) : null,
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
      h('div', { class: 'col grow', style: 'gap:0' }, h('span', { class: 'b' }, 'День ' + d.n + ' · ' + d.title), h('span', { class: 'small muted' }, isDone(L, d) ? 'пройдено ' + fmtDate(S.done[dayKey(L, d)]) : d.kind === 'review' ? 'повторення: 75% цей урок, 25% минулі' : 'новий матеріал')),
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
      h('p', { class: 'muted small' }, 'Складні слова повертаються частіше: «не згадав» → завтра, «згадав» → через 2, 4, 8… днів. 75% поточні уроки, 25% старі.'),
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
      h('div', { class: 'spread' }, h('span', null, 'Курс зараз на уроці: ', h('b', null, S.course)), h('button', { class: 'btn ghost small', onclick: chooseCourse }, 'Змінити')),
      h('div', { class: 'spread' }, h('span', null, 'Озвучка: ', h('b', null, SK_VOICE ? (S.settings.tts === false ? 'вимкнено' : 'увімкнено (' + SK_VOICE.name + ')') : 'немає словацького голосу в системі')), SK_VOICE ? h('button', { class: 'btn ghost small', onclick: () => { S.settings.tts = S.settings.tts === false; save(); render(); } }, S.settings.tts === false ? 'Увімкнути' : 'Вимкнути') : null)),
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
    h('p', { class: 'tiny muted' }, (CLOUD ? 'Версія: 1.4 (23.11)' : 'Версія: пілот 0.5') + ' · уроків завантажено: ' + Object.keys(C.lessons).length + (C.errors.length ? ' · помилка завантаження: ' + C.errors.join(', ') : ''))));
};
function showExport(txt) { const ta = h('textarea', { class: 'txt', readonly: true, 'aria-label': 'Копія прогресу' }); ta.value = txt; dialog('Копія прогресу', h('div', { class: 'col' }, h('p', { class: 'small' }, 'Виділи весь текст і скопіюй.'), ta), [['Готово', () => { }]]); }
function importDialog() {
  const ta = h('textarea', { class: 'txt', 'aria-label': 'Встав копію' });
  dialog('Відновити з копії', h('div', { class: 'col' }, h('p', { class: 'small' }, 'Встав текст копії. Поточний прогрес профілю буде замінено.'), ta), [['Скасувати', () => { }, 'ghost'], ['Відновити', () => {
    try { const o = JSON.parse(ta.value); if (!o.state || typeof o.state.done !== 'object') throw 0; S = Object.assign(newState(), o.state); save(); render(); toast('Прогрес відновлено'); }
    catch (e) { toast('Це не схоже на копію прогресу'); return false; }
  }]]);
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
  const file = h('input', { type: 'file', accept: '.json,application/json,text/plain', id: 'lessonfile' });
  const out = h('div', { class: 'col' });
  file.addEventListener('change', () => { const f = file.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { ta.value = String(r.result); check(); }; r.readAsText(f); });
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
- "text", "forms", "verbs" для лексики не потрібні (можна не писати).
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
    h('button', { class: 'btn wide', onclick: () => pickP('dima') }, 'Діма'), h('button', { class: 'btn blue wide', onclick: () => pickP('natasha') }, 'Наташа'));
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
    if (remoteOk && (!remote || progressSig(S) !== progressSig(Object.assign(newState(), remote)))) pushCloud();
    SYNC.state = remoteOk ? 'ok' : 'err';
    try { await loadContent(); } catch (e) { C.errors.push('уроки: ' + (e.code || e.message)); }
    Cl.watchProgress(list => {
      let changed = false;
      list.forEach(d => {
        const p2 = Cl.ALLOWED[String(d.email || '').toLowerCase()]; if (!p2) return;
        let st; try { st = Object.assign(newState(), JSON.parse(d.json)); } catch (e) { return; }
        if (p2 !== PROFILE) { OTHER[p2] = st; return; }
        if (d.id !== UID) return;
        const before = progressSig(S); S = mergeState(S, st); Store.set('p.' + PROFILE, S);
        if (progressSig(S) !== before) changed = true;
        if (progressSig(S) !== progressSig(st)) { clearTimeout(cloudT); cloudT = setTimeout(pushCloud, 1500); }
      });
      if (!changed && !list.length) return;
      if ($('#player').hidden && ['today', ''].includes(ROUTE)) render();
    }, () => { });
    ungate(); render();
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
