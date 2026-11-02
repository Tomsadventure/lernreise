/* Lernreise – Lern-App für Kinder von 7 bis 11 mit Gian, dem Steinbock (bis 2026-11-01: Mungg, das Murmeltier).
   Eine Seite, kein Framework. Der Kern (kern/lernen.js) kennt die Module; jedes Modul (module/<name>/) bringt seine Daten und
   Aufgaben mit. Hier stehen nur die Bildschirme: Kinder (Profile), Reisekarte, Modul, Thema, Runde, Ergebnis, Entdecken,
   Spiel-Uhr, Memory, Album und Sammelbuch. Der Fortschritt gehört jedem Kind und bleibt auf dem Gerät (localStorage). */
(() => {
'use strict';
const K = window.Kern;
const MODULE = K.MODULE;
const STICKER = Object.fromEntries(K.alleSticker().map(s => [s.id, s]));
const img = n => `img/${n}.webp`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* Farbe mischen: t = 0 … 1 Richtung `to` – jedes Modul und Thema färbt seine Seiten mit --f, --f-hell, --f-mitte, --f-tief */
const mix = (hex, to, t) => '#' + [1, 3, 5].map(i => {
  const a = parseInt(hex.substr(i, 2), 16), b = parseInt(to.substr(i, 2), 16);
  return Math.round(a + (b - a) * t).toString(16).padStart(2, '0');
}).join('');
const farben = f => `--f:${f};--f-hell:${mix(f, '#ffffff', 0.86)};--f-mitte:${mix(f, '#ffffff', 0.6)};--f-tief:${mix(f, '#000000', 0.28)}`;
// Themenseiten: Farben und bei Sprachen die Sprache (für die Schrift, z. B. Pinyin in Andika – style.css)
const themaStil = t => `style="${farben(t.farbe)}"${t.sprache ? ` data-sprache="${t.sprache}"` : ''}`;
const AVATARE = [['fuchs', 'Fuchs'], ['igel', 'Igel'], ['eule', 'Eule'], ['hase', 'Hase'], ['eichhoernchen', 'Eichhörnchen'],
  ['steinbock', 'Steinbock'], ['baer', 'Bär'], ['pinguin', 'Pinguin'], ['frosch', 'Frosch'], ['tiger', 'Tiger'], ['panda', 'Panda']];
const ALTER = [6, 7, 8, 9, 10, 11, 12];
/* Sammelbuch (wie beim Rechentiger): Seite 0 = Umschlag, 1 = »Dieses Buch gehört«, 2 = Titelseite, dann 17 gemalte Doppelseiten
   (aus dem Rechentiger übernommen). Neue Seiten immer ans Ende, damit eingeklebte Sticker auf ihren Seiten bleiben. */
const SZENEN = [['dschungel', 'Im Dschungel'], ['meer', 'Am Meer'], ['berge', 'In den Bergen'], ['unterwasser', 'Unter Wasser'],
  ['winter', 'Im Winter'], ['nacht', 'In der Nacht'], ['burg', 'In der Burg'], ['gipfel', 'Auf dem Gipfel'], ['haus', 'Zu Hause'],
  ['see', 'Am See'], ['insel', 'Auf der Insel'], ['regen', 'Im Regen'], ['buehne', 'Auf der Bühne'], ['weihnachten', 'An Weihnachten'],
  ['herbst', 'Im Herbst'], ['wanderweg', 'Auf dem Wanderweg'], ['garten', 'Im Garten']];
const BUCH_SEITEN = 3 + 2 * SZENEN.length;

/* ================================================================ Speicher */
const KEY = 'lernreise.v1';
const neueId = () => Math.random().toString(36).slice(2, 9);
function buchLaden(b) {
  b = b && typeof b === 'object' ? b : {};
  return { placed: Array.isArray(b.placed) ? b.placed.filter(x => x && STICKER[x.s]) : [], p: Math.max(0, Math.min(BUCH_SEITEN - 1, +b.p || 0)), seen: !!b.seen };
}
function profilLaden(p) {
  const alter = ALTER.includes(+p.alter) ? +p.alter : 7;
  return {
    id: String(p.id || neueId()), name: String(p.name || '').slice(0, 20), alter,
    stufe: [1, 2, 3].includes(p.stufe) ? p.stufe : K.stufeVonAlter(alter),
    avatar: AVATARE.some(a => a[0] === p.avatar) ? p.avatar : AVATARE[0][0],
    sterne: p.sterne && typeof p.sterne === 'object' ? p.sterne : {},
    sticker: Array.isArray(p.sticker) ? p.sticker.filter(s => STICKER[s]) : [],
    neu: Array.isArray(p.neu) ? p.neu.filter(s => STICKER[s]) : [],
    buch: buchLaden(p.buch), runden: +p.runden || 0, gesehen: p.gesehen && typeof p.gesehen === 'object' ? p.gesehen : {},
  };
}
function laden() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
  d = d && typeof d === 'object' ? d : {};
  const profile = Array.isArray(d.profile) ? d.profile.filter(p => p && typeof p === 'object').map(profilLaden) : [];
  return { profile, aktiv: profile.some(p => p.id === d.aktiv) ? d.aktiv : null, settings: Object.assign({ sounds: true, voice: true }, d.settings || {}) };
}
let S = laden();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* voll oder privat */ } }
const P = () => S.profile.find(p => p.id === S.aktiv) || null;
const sternKey = (m, t, u, s = P().stufe) => `${m}/${t}/${u}@${s}`;
const sterneVon = (m, t, u) => P().sterne[sternKey(m, t, u)] || 0;
const avatarBild = p => img(`avatar_${p.avatar}`);
const stufeName = s => K.STUFEN[s - 1].name;

/* ================================================================== Icons */
const I = p => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICON = {
  gear: I('<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.1z"/>'),
  close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
  back: I('<path d="M15 18l-6-6 6-6"/>'),
  fwd: I('<path d="M9 18l6-6-6-6"/>'),
  next: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  speaker: I('<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  again: I('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  minus: I('<path d="M5 12h14"/>'),
  star: I('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'),
  sticker: I('<path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6"/><path d="M20 12l-8 8c0-4.4 3.6-8 8-8z"/><path d="M8.5 10.5l1.2 1.2 2.6-3"/>'),
  book: I('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>'),
  eye: I('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  users: I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5a5 5 0 0 1 6 5"/>'),
  pencil: I('<path d="M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4z"/><path d="M14 7l3 3"/>'),
  rotL: I('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
  rotR: I('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>'),
  peel: I('<path d="M5 4h9l5 5v11H5z"/><path d="M14 4v5h5"/><path d="M9 14l2 2 4-4"/>'),
  wappen: I('<path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z"/><path d="M12 8v8M8.5 12h7"/>'),
  choose: I('<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><path d="M14.5 17l2 2 3.5-4"/>'),
  memory: I('<rect x="3" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8"/><path d="M6.7 6.7h.1M17.2 17.2h.1"/>'),
  stadt: I('<path d="M3 21h18M5 21V10l4-3 4 3v11M13 21V6l3-2 3 2v15"/><path d="M8 13h2M8 16h2M15.5 9h1M15.5 12h1M15.5 15h1"/>'),
  karte: I('<path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>'),
  pin: I('<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
  auto: I('<path d="M5 17H3v-5l2.2-5h13.6L21 12v5h-2"/><path d="M3 12h18"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>'),
  pokal: I('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8.5 21h7M10 17h4v4h-4z"/>'),
  uhr: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  zeiger: I('<circle cx="12" cy="12" r="9"/><path d="M12 12L9 7.5M12 12h5"/>'),
  digital: I('<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M7 9.5v5M10.5 9.5h2.5v2.5h-2.5v2.5H13M16 9.5v2.5h2.5M18.5 9.5v5"/>'),
  sanduhr: I('<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>'),
  kalender: I('<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7.5 14h2M11 14h2M14.5 14h2M7.5 17.5h2M11 17.5h2"/>'),
  reihe: I('<rect x="2.5" y="6" width="5" height="8" rx="1.3"/><rect x="9.5" y="6" width="5" height="8" rx="1.3"/><rect x="16.5" y="6" width="5" height="8" rx="1.3"/><path d="M4 18.5h15M16.5 16l2.5 2.5-2.5 2.5"/>'),
  blatt: I('<path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z"/><path d="M5 19c4-5 7-8 10-10"/>'),
  faust: I('<path d="M7 11V8a1.5 1.5 0 0 1 3 0v2M10 10V6.5a1.5 1.5 0 0 1 3 0V10M13 10V7.5a1.5 1.5 0 0 1 3 0V11M16 11V9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 5 14.5V13a2 2 0 0 1 2-2"/>'),
  ohr: I('<path d="M6 9a6 6 0 1 1 12 0c0 3-2 4.2-3 5.5S14 17 14 18.5a3 3 0 0 1-6 .3"/><path d="M9.5 9.5a2.5 2.5 0 1 1 5 0c0 1.6-1.6 2-1.6 3.5"/>'),
  zahlen: I('<path d="M4 8.5L6 7v10M10 9a2 2 0 0 1 3.6 1.2c0 1.8-3.6 3.6-3.6 6.8h4M17 7h3.5l-2.2 3.5a2.4 2.4 0 1 1-2.3 4.2"/>'),
  sprechblase: I('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'),
  trash: I('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
};
/* Flaggen (selbst gezeichnet, wie in Wörtli-Frosch) */
const FLAG = {
  fr: ['0 0 30 20', '<rect width="10" height="20" fill="#002395"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ED2939"/>'],
  en: ['0 0 30 20', '<rect width="30" height="20" fill="#fff"/><rect x="12.5" width="5" height="20" fill="#CF142B"/><rect y="7.5" width="30" height="5" fill="#CF142B"/>'],
  it: ['0 0 30 20', '<rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#CE2B37"/>'],
  es: ['0 0 30 20', '<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>'],
  ch: ['0 0 32 32', '<rect width="32" height="32" fill="#D52B1E"/><path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#fff"/>'],
};
const FLAGGE_VON = { nl: 'nl', zh: 'cn', ja: 'jp', hu: 'hu' };             // Sprache -> Flagge aus src/flaggen (Scripts/flaggen.mjs)
const flagHTML = id => (FLAG[id] ? `<svg class="flag" viewBox="${FLAG[id][0]}" aria-hidden="true">${FLAG[id][1]}</svg>`
  : FLAGGE_VON[id] ? `<img class="flag" src="flaggen/${FLAGGE_VON[id]}.svg" alt="">` : '');
const sterneHTML = (n, cls = '') => `<span class="sterne ${cls}" aria-label="${n} von 3 Sternen">${[1, 2, 3].map(i => `<i class="${i <= n ? 'an' : ''}">${ICON.star}</i>`).join('')}</span>`;

/* ============================================================== Ton */
Ton.klaenge = () => S.settings.sounds;
const sfx = Ton.sfx;
const stimmeAn = () => S.settings.voice;
/* Gian (oder der Freund) spricht nur, wenn eingeschaltet. Inhalte zum Hören (Fremdwörter) spielen immer. */
function sprich(names, append, danach) { if (stimmeAn()) Ton.say(names, append, danach); else if (danach) danach(); }
const rnd = n => 1 + Math.floor(Math.random() * n);
const pad2 = n => String(n).padStart(2, '0');
const SATZ = { hallo: () => `hallo_${pad2(rnd(3))}`, lob: () => `lob_${pad2(rnd(12))}`, fast: () => `fast_${pad2(rnd(4))}`,
  fertig: () => `fertig_${pad2(rnd(3))}`, los: () => `los_${pad2(rnd(2))}`, loesung: () => `loesung_${pad2(rnd(2))}` };

/* ================================================================ Bildschirm */
const app = document.getElementById('app');
const sheetRoot = document.getElementById('sheet-root');
const fxRoot = document.getElementById('fx');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let view = { name: 'start' };
let Q = null;           // laufende Runde
let M = null;           // laufendes Memory
let E = null;           // Entdecken
let timer = null;
let reloadPending = false;
const LAUFEND = ['runde', 'memory'];

function nav(name, params = {}, push = true) {
  closeSheet(true);
  clearTimeout(timer);
  const from = view.name;
  if (LAUFEND.includes(from) && !['runde', 'ergebnis', 'memory'].includes(name)) { Q = null; M = null; Ton.stop(); }
  if (from === 'buch') buchAufraeumen();
  view = Object.assign({ name }, params);
  if (push) { try { history.pushState({ name, m: view.m, t: view.t }, ''); } catch (e) { /* file:// */ } }
  render();
  window.scrollTo(0, 0);
  if (['start', 'wer'].includes(name) && reloadPending) location.reload();
}
window.addEventListener('popstate', e => {
  const s = e.state || { name: 'start' };
  clearTimeout(timer);
  const from = view.name;
  if (LAUFEND.includes(from) || from === 'ergebnis') { Q = null; M = null; Ton.stop(); }
  if (from === 'buch') buchAufraeumen();
  view = ['start', 'wer', 'modul', 'thema', 'album', 'buch'].includes(s.name) ? { name: s.name, m: s.m, t: s.t } : { name: 'start' };
  if (!P() && view.name !== 'wer') view = { name: 'wer' };
  closeSheet(true);
  render();
});
function render() {
  if (!P() && view.name !== 'wer') view = { name: 'wer' };
  document.body.dataset.view = view.name;
  const R = { wer: werHTML, start: startHTML, modul: modulHTML, thema: themaHTML, ergebnis: () => ergebnisHTML(view.res), album: albumHTML,
    entdecken: entdeckenHTML, spieluhr: spieluhrHTML, memory: memoryHTML };
  if (view.name === 'runde') { app.innerHTML = rundeHTML(); zeigeAufgabe(); return; }
  if (view.name === 'buch') { app.innerHTML = buchHTML(); buchZeigen(); return; }
  app.innerHTML = R[view.name]();
  if (view.name === 'memory') { memoryLayout(); requestAnimationFrame(memoryLayout); }      // nochmals, wenn die Seite fertig gescrollt ist
  if (view.name === 'entdecken') entdeckenZeigen();
  if (view.name === 'album' && P().neu.length) { P().neu = []; save(); }
}
const mt = () => K.finde(view.m, view.t);

/* ================================================================ Kinder (Profile) */
function werHTML() {
  const ps = S.profile;
  return `<div class="screen wer">
    <div class="wer-kopf">
      <button class="wer-mungg" data-act="gian" aria-label="Gian"><img src="${img('figur_hallo')}" alt=""></button>
      <div class="bubble"><b>${ps.length ? 'Wer reist heute mit?' : 'Hoi! Ich bin Gian.'}</b>
        <span>${ps.length ? 'Tipp auf dein Bild.' : 'Ich nehme dich mit auf eine Lernreise durch die Schweiz, die Zeit und viele Sprachen. Wie heisst du?'}</span></div>
    </div>
    <div class="profil-grid">
      ${ps.map(p => `<button class="profil" data-act="profil-wahl" data-id="${esc(p.id)}">
        <img src="${avatarBild(p)}" alt=""><b>${esc(p.name)}</b><small>${p.alter} Jahre · ${stufeName(p.stufe)}</small>
        <span class="profil-stand">${ICON.sticker}${p.sticker.length}</span></button>`).join('')}
      <button class="profil neu" data-act="profil-neu"><span class="neu-plus">${ICON.plus}</span><b>${ps.length ? 'Neues Kind' : 'Los geht’s!'}</b><small>Profil anlegen</small></button>
    </div>
    <p class="wer-fuss">Lernreise · jedes Kind hat seinen eigenen Fortschritt</p>
  </div>`;
}
let profilEntwurf = null;
function profilSheetHTML() {
  const d = profilEntwurf, neu = !d.id;
  return `<div class="sheet-head"><h2>${neu ? 'Neues Kind' : 'Profil ändern'}</h2><button class="icon-btn" data-act="close-sheet" aria-label="Schliessen">${ICON.close}</button></div>
  <div class="sheet-body">
    <section class="set-group"><h3>Name</h3>
      <input class="name-in" id="name-in" type="text" maxlength="20" autocomplete="off" placeholder="Wie heisst du?" value="${esc(d.name)}"></section>
    <section class="set-group"><h3>Wie alt bist du?</h3>
      <div class="alter-wahl">${ALTER.map(a => `<button class="${d.alter === a ? 'an' : ''}" data-act="alter" data-v="${a}">${a}</button>`).join('')}</div>
      <p class="set-note" id="stufe-note">${stufeText(K.stufeVonAlter(d.alter))}</p></section>
    <section class="set-group"><h3>Dein Tier</h3>
      <div class="avatar-wahl">${AVATARE.map(([id, n]) => `<button class="${d.avatar === id ? 'an' : ''}" data-act="avatar" data-v="${id}" aria-label="${n}"><img src="${img(`avatar_${id}`)}" alt=""></button>`).join('')}</div></section>
    <div class="confirm-actions">
      ${neu ? '' : `<button class="btn danger" data-act="profil-loeschen">${ICON.trash}<span>Löschen</span></button>`}
      <button class="btn primary" data-act="profil-ok" id="profil-ok" ${d.name.trim() ? '' : 'disabled'}>${ICON.check}<span>${neu ? 'Los geht’s!' : 'Speichern'}</span></button>
    </div>
  </div>`;
}
const stufeText = s => `Stufe «${stufeName(s)}» – ${K.STUFEN[s - 1].text}.`;
function profilOeffnen(p) {
  profilEntwurf = p ? { id: p.id, name: p.name, alter: p.alter, avatar: p.avatar } : { id: null, name: '', alter: 7, avatar: AVATARE[S.profile.length % AVATARE.length][0] };
  openSheet('profil', profilSheetHTML());
  if (!p) sprich('neu_profil');
  setTimeout(() => { const i = document.getElementById('name-in'); if (i && !p && window.matchMedia('(pointer: fine)').matches) i.focus(); }, 300);
}
function profilSpeichern() {
  const d = profilEntwurf;
  if (!d || !d.name.trim()) return;
  if (d.id) {
    const p = S.profile.find(x => x.id === d.id);
    if (p.alter !== d.alter) p.stufe = K.stufeVonAlter(d.alter);
    Object.assign(p, { name: d.name.trim(), alter: d.alter, avatar: d.avatar });
  } else {
    const p = profilLaden({ name: d.name.trim(), alter: d.alter, avatar: d.avatar });
    S.profile.push(p);
    S.aktiv = p.id;
  }
  save();
  closeSheet(true);
  if (d.id) render(); else { nav('start', {}, false); sprich(SATZ.hallo()); }
}

/* ================================================================ Reisekarte (Start) */
function modulStand(m) {
  let s = 0, max = 0;
  m.themen.forEach(t => t.uebungen.forEach(u => { max += 3; s += sterneVon(m.id, t.id, u.id); }));
  const st = m.themen.flatMap(t => (t.sticker || []).map(x => x[0]));
  return { s, max, st: st.filter(x => P().sticker.includes(x)).length, stMax: st.length };
}
const kopfHTML = (titel, zurueck, ohneAlbum) => `<header class="bar">
  ${zurueck ? `<button class="icon-btn" data-act="${zurueck}" aria-label="Zurück">${ICON.back}</button>` : `<button class="ich" data-act="wer" aria-label="Kind wechseln"><img src="${avatarBild(P())}" alt=""><span>${esc(P().name)}</span></button>`}
  ${titel ? `<h1 class="bar-title">${titel}</h1>` : ''}
  <div class="bar-right">
    ${ohneAlbum ? '' : `<button class="pill ${P().neu.length ? 'has-new' : ''}" data-act="album" aria-label="Album">${ICON.sticker}<span class="pill-t">Album</span><b>${P().sticker.length}</b></button>`}
    ${zurueck ? '' : `<button class="icon-btn" data-act="settings" aria-label="Einstellungen">${ICON.gear}</button>`}
  </div></header>`;
function startHTML() {
  const p = P();
  return `<div class="screen start">
    ${kopfHTML('', null)}
    <section class="hero" style="background-image:url(${img('banner_reise')})">
      <button class="hero-mungg" data-act="gian" aria-label="Gian"><img src="${img('figur_karte')}" alt=""></button>
      <div class="bubble"><b>Hallo ${esc(p.name)}!</b><span>Wohin reisen wir heute?</span></div>
    </section>
    <h2 class="abschnitt">Reiseziele</h2>
    <div class="ziele">${MODULE.map(m => {
      const st = modulStand(m);
      return `<button class="ziel" data-act="modul" data-m="${m.id}" style="${farben(m.farbe)}">
        <span class="ziel-bild" style="background-image:url(${img(m.banner)})"></span>
        <img class="ziel-figur" src="${img(m.figur)}" alt="">
        <span class="ziel-text"><b>${esc(m.titel)}</b><small>${esc(m.untertitel)}</small>
          <span class="ziel-stand">${ICON.star}<span>${st.s} von ${st.max}</span>${ICON.sticker}<span>${st.st} von ${st.stMax}</span></span></span>
      </button>`;
    }).join('')}</div>
    ${buchKnopfHTML()}
  </div>`;
}

/* ================================================================ Modul und Thema */
function modulHTML() {
  const { m } = mt();
  return `<div class="screen modul" style="${farben(m.farbe)}">
    ${kopfHTML(esc(m.titel), 'start')}
    <section class="kopf" style="background-image:url(${img(m.banner)})">
      <img class="kopf-figur" src="${img(m.figur)}" alt="">
      <div class="bubble"><b>${esc(m.titel)}</b><span>${esc(m.untertitel)}</span></div>
    </section>
    <div class="themen">${m.themen.map(t => {
      const st = { s: 0, max: 0 };
      t.uebungen.forEach(u => { st.max += 3; st.s += sterneVon(m.id, t.id, u.id); });
      const haben = (t.sticker || []).filter(x => P().sticker.includes(x[0])).length;
      return `<button class="thema-karte" data-act="thema" data-m="${m.id}" data-t="${t.id}" style="${farben(t.farbe)}">
        <span class="tk-bild" style="background-image:url(${img(t.banner)})"></span>
        <img class="tk-figur" src="${img(t.figur)}" alt="">
        <span class="tk-text"><b>${t.sprache ? flagHTML(t.sprache) : ''}${esc(t.titel)}</b><small>${esc(t.untertitel)}</small>
          <span class="ziel-stand">${ICON.star}<span>${st.s} von ${st.max}</span>${ICON.sticker}<span>${haben} von ${(t.sticker || []).length}</span></span></span>
      </button>`;
    }).join('')}</div>
  </div>`;
}
function oeffneModul(mid) {
  const m = MODULE.find(x => x.id === mid);
  if (m.themen.length === 1) { oeffneThema(m.id, m.themen[0].id); return; }
  nav('modul', { m: m.id });
  if (!P().gesehen[m.id]) { P().gesehen[m.id] = true; save(); sprich(m.intro); }
}
function oeffneThema(mid, tid) {
  const { m, t } = K.finde(mid, tid);
  nav('thema', { m: m.id, t: t.id });
  const key = `${m.id}/${t.id}`;
  if (!P().gesehen[key]) { P().gesehen[key] = true; save(); sprich(t.intro || m.intro); }
}
function empfohlen(m, t) {
  const s = P().stufe;
  const u = t.uebungen.find(x => x.ab <= s && sterneVon(m.id, t.id, x.id) < 2);
  return u ? u.id : null;
}
function themaHTML() {
  const { m, t } = mt();
  const s = P().stufe, emp = empfohlen(m, t), zurueck = m.themen.length > 1 ? 'zum-modul' : 'start';
  const st = t.sticker || [];
  const figur = t.freund ? t.freund.hallo : t.figur;
  return `<div class="screen thema" ${themaStil(t)}>
    ${kopfHTML(`${t.sprache ? flagHTML(t.sprache) : ''}${esc(t.titel)}`, zurueck)}
    <section class="kopf" style="background-image:url(${img(t.banner)})">
      <button class="kopf-figur" data-act="intro" aria-label="Noch einmal hören"><img src="${img(figur)}" alt=""></button>
      <div class="bubble"><b>${esc(t.titel)}</b><span>${esc(t.untertitel)}</span></div>
    </section>
    <button class="entdecken-knopf" data-act="entdecken">
      <span class="ek-ic">${t.entdecken === 'uhr' ? ICON.uhr : ICON.eye}</span>
      <span class="ek-text"><b>${t.entdecken === 'uhr' ? 'Spiel-Uhr' : 'Entdecken'}</b><small>${t.entdecken === 'uhr' ? 'Dreh die Zeiger und hör, wie spät es ist' : 'Schau dir alles in Ruhe an und hör zu'}</small></span>${ICON.fwd}
    </button>
    <h2 class="abschnitt">Üben <small>Stufe «${stufeName(s)}»</small></h2>
    <div class="uebungen">${t.uebungen.map(u => {
      const n = sterneVon(m.id, t.id, u.id);
      return `<button class="ueb${u.id === emp ? ' empfohlen' : ''}${u.ab > s ? ' gross' : ''}" data-act="ueben" data-u="${u.id}">
        <span class="ueb-ic">${ICON[u.icon] || ICON.choose}</span>
        <span class="ueb-text"><b>${esc(u.titel)}</b><small>${esc(u.text)}</small></span>
        ${u.ab > s ? `<span class="ab">ab ${K.STUFEN[u.ab - 1].ab}</span>` : ''}
        ${u.id === emp ? '<span class="tipp">Tipp</span>' : ''}
        ${sterneHTML(n)}
      </button>`;
    }).join('')}</div>
    ${st.length ? `<section class="sticker-leiste"><h3>Sticker auf dieser Reise <span>${st.filter(x => P().sticker.includes(x[0])).length} von ${st.length}</span></h3>
      <div>${st.map(([id, titel]) => (P().sticker.includes(id)
        ? `<button class="mini-st" data-act="sticker" data-id="${id}"><img src="${img(id)}" alt="${esc(titel)}"></button>`
        : '<span class="mini-st leer">?</span>')).join('')}</div></section>` : ''}
  </div>`;
}

/* ================================================================ Inhalte zeichnen
   Ein Inhalt (Frage, Antwort, Lernkarte, Memory-Karte) kann haben: text, bild, wappen, flagge, uhr {h, m}, digital, zahl, wort,
   schild (Autokennzeichen), karte {zeige} (mit welt 'eu' die Europakarte), woche (Tag hervorheben). gross = für die Frage. */
function inhaltHTML(x, gross = false) {
  let h = '';
  if (x.karte) h += karteSVG({ zeige: x.karte.zeige, see: x.karte.see, fluss: x.karte.fluss, welt: x.karte.welt, klein: !gross });
  if (x.wappen) h += `<img class="wappen" src="wappen/${x.wappen}.svg" alt="">`;
  if (x.flagge) h += `<img class="wappen flagge" src="flaggen/${x.flagge}.svg" alt="">`;
  if (x.bild) h += `<img class="bild" src="${img(x.bild)}" alt="">`;
  if (x.uhr) h += uhrSVG(x.uhr.h, x.uhr.m);
  if (x.zahl != null) h += zahlHTML(x.zahl, gross);
  if (x.schild) h += schildHTML(x.schild, x.nummer);
  if (x.digital) h += `<span class="digital">${esc(x.digital)}</span>`;
  if (x.wort) h += `<span class="wort fremd">${esc(x.wort)}${schriftHTML(x)}</span>`;
  return h;
}
/* Chinesisch und Japanisch: gross die Lautschrift (Pinyin, Romaji), klein darunter die Schriftzeichen */
const schriftHTML = x => (x.schrift ? `<small class="schrift" lang="${x.lang || ''}">${esc(x.schrift)}</small>` : '');
const zahlHTML = (n, gross) => `<span class="zahl${gross ? ' mit-punkten' : ''}"><b>${n}</b>${gross ? `<span class="punkte" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<i class="${i < n ? 'an' : ''}"></i>`).join('')}</span>` : ''}</span>`;
const schildHTML = (k, nr) => `<span class="schild"><span class="schild-ch">${flagHTML('ch')}</span><b>${esc(k)}</b><span>${nr ? `${String(nr).slice(0, 2)} ${String(nr).slice(2)}` : '·'}</span></span>`;

/* Analoge Uhr: Ziffern 1–12, Minutenstriche, kurzer roter Stundenzeiger, langer blauer Minutenzeiger */
function uhrSVG(h, m, { zieh = false, minuten = false } = {}) {
  const striche = Array.from({ length: 60 }, (_, i) => {
    const a = i * 6 * Math.PI / 180, lang = i % 5 === 0, r1 = lang ? 80 : 84;
    return `<line x1="${(100 + r1 * Math.sin(a)).toFixed(1)}" y1="${(100 - r1 * Math.cos(a)).toFixed(1)}" x2="${(100 + 89 * Math.sin(a)).toFixed(1)}" y2="${(100 - 89 * Math.cos(a)).toFixed(1)}" class="${lang ? 'lang' : ''}"/>`;
  }).join('');
  const ziffern = Array.from({ length: 12 }, (_, i) => {
    const z = i + 1, a = z * 30 * Math.PI / 180;
    return `<text x="${(100 + 66 * Math.sin(a)).toFixed(1)}" y="${(100 - 66 * Math.cos(a) + 7).toFixed(1)}">${z}</text>`;
  }).join('');
  const minZ = minuten ? Array.from({ length: 12 }, (_, i) => {
    const a = i * 30 * Math.PI / 180;
    return `<text class="min" x="${(100 + 97 * Math.sin(a)).toFixed(1)}" y="${(100 - 97 * Math.cos(a) + 3).toFixed(1)}">${pad2(i * 5)}</text>`;
  }).join('') : '';
  return `<svg class="uhr${zieh ? ' zieh' : ''}" viewBox="${minuten ? '-8 -8 216 216' : '0 0 200 200'}" role="img" aria-label="Uhr">
    <circle cx="100" cy="100" r="96" class="rand"/><circle cx="100" cy="100" r="90" class="blatt"/>
    <g class="striche">${striche}</g><g class="ziffern">${ziffern}</g>${minZ}
    <g class="zeiger-h" style="transform:rotate(${((h % 12) + m / 60) * 30}deg)"><line x1="100" y1="108" x2="100" y2="56"/>${zieh ? '<circle cx="100" cy="62" r="13" class="griff"/>' : ''}</g>
    <g class="zeiger-m" style="transform:rotate(${m * 6}deg)"><line x1="100" y1="112" x2="100" y2="22"/>${zieh ? '<circle cx="100" cy="30" r="13" class="griff"/>' : ''}</g>
    <circle cx="100" cy="100" r="6" class="mitte"/></svg>`;
}
function uhrSetzen(svg, h, m) {
  if (!svg) return;
  svg.querySelector('.zeiger-h').style.transform = `rotate(${((h % 12) + m / 60) * 30}deg)`;
  svg.querySelector('.zeiger-m').style.transform = `rotate(${m * 6}deg)`;
}
/* Schweizer Karte (module/schweiz/karte.js): zeige = leuchtender Kanton; see / fluss = leuchtender See bzw. Fluss (Modul «Seen und
   Flüsse»: dann mit allen Seen einzeln und allen Flüssen, abgeschnitten an der Landesgrenze); ebene 'see' = man tippt auf Seen */
let karteNr = 0;
function karteSVG({ zeige, see, fluss, klein = false, tippen = false, ebene, welt } = {}) {
  if (welt === 'eu') return europaSVG({ zeige, klein, tippen });
  const KC = window.KARTE_CH;
  if (!KC) return '';
  const wasser = see || fluss || ebene === 'see', clip = `land-${++karteNr}`;
  const ring = (p, r) => `<circle class="ring" cx="${p[0]}" cy="${p[1]}" r="${Math.max(r, p[2] * 1.6)}"/>`;
  return `<svg class="karte${klein ? ' klein' : ''}${tippen ? ' tippen' : ''}${wasser ? ' wasser' : ''}" viewBox="0 0 ${KC.breite} ${KC.hoehe}" role="img" aria-label="Karte der Schweiz">
    ${Object.entries(KC.kantone).map(([k, d]) => `<path data-k="${wasser ? '' : k}" class="kt${k === zeige ? ' leuchtet' : ''}" d="${d}"/>`).join('')}
    ${wasser ? `<defs><clipPath id="${clip}"><path d="${KC.land}"/></clipPath></defs>
      <g class="fluesse" clip-path="url(#${clip})">${Object.entries(KC.fluesse).map(([k, d]) => `<path data-fluss="${k}" class="fluss${k === fluss ? ' leuchtet' : ''}" d="${d}"/>`).join('')}</g>
      ${Object.entries(KC.seenEinzeln).map(([k, d]) => `<path data-see="${k}" class="see${k === see ? ' leuchtet' : ''}" d="${d}"/>`).join('')}`
    : `<path class="seen" d="${KC.seen}"/>`}
    ${zeige ? ring(KC.punkte[zeige], 22) : see ? ring(KC.seenPunkte[see], 26) : ''}
  </svg>`;
}
/* Europakarte (module/europa/karte.js): Meer, übriges Land grau, die Länder des Moduls; um kleine Länder ein Ring */
function europaSVG({ zeige, klein, tippen }) {
  const KE = window.KARTE_EU;
  if (!KE) return '';
  const p = zeige && KE.punkte[zeige];
  return `<svg class="karte europa${klein ? ' klein' : ''}${tippen ? ' tippen' : ''}" viewBox="0 0 ${KE.breite} ${KE.hoehe}" role="img" aria-label="Karte von Europa">
    <rect class="meer" width="${KE.breite}" height="${KE.hoehe}"/><path class="rest" d="${KE.rest}"/>
    ${Object.entries(KE.laender).map(([k, d]) => `<path data-k="${k}" class="kt${k === zeige ? ' leuchtet' : ''}" d="${d}"/>`).join('')}
    ${p && p[2] < 14 ? `<circle class="ring" cx="${p[0]}" cy="${p[1]}" r="${Math.max(14, p[2] * 2)}"/>` : ''}
  </svg>`;
}
/* Wie heisst, was man auf der Karte angetippt hat? (Kanton aus dem Modul Schweiz, sonst aus der Aufgabe) */
function kartenName(a, k) {
  if (a.karte && a.karte.namen) return { name: a.karte.namen[k], ton: a.karte.toene && a.karte.toene[k] };
  const kt = K.MODULE.find(m => m.id === 'schweiz').daten.KT[k];
  return { name: kt && kt.name, ton: `ch_k_${k}` };
}

/* ================================================================ Runde */
function starteUebung(uid) {
  const { m, t } = mt(), u = t.uebungen.find(x => x.id === uid);
  sfx.tap();
  if (u.paare) { starteMemory(m, t, u); return; }
  const aufgaben = u.runde(P().stufe, K.zufall());
  Q = { m, t, u, aufgaben, i: 0, versuch: 0, erst: 0, total: aufgaben.length, serie: 0, wdh: 0, gesperrt: false };
  Ton.preload(aufgaben.slice(0, 3).flatMap(a => a.frage.ton || []));
  nav('runde', { m: m.id, t: t.id });
}
function figurBild(pose) {
  const f = Q && Q.t.freund;
  if (f) return img(pose === 'jubel' ? f.jubel : f.hallo);
  return img({ jubel: 'figur_jubel', mut: 'figur_mut', denkt: 'figur_denkt' }[pose] || 'figur_denkt');
}
function figur(pose) {
  const el = document.getElementById('runde-figur');
  if (!el) return;
  el.src = figurBild(pose);
  if (!reduced()) { el.classList.remove('bounce'); void el.offsetWidth; el.classList.add('bounce'); }
}
function rundeHTML() {
  return `<div class="screen runde" ${themaStil(Q.t)}>
    <header class="runde-kopf">
      <button class="icon-btn" data-act="abbrechen" aria-label="Beenden">${ICON.close}</button>
      <div class="fortschritt" aria-hidden="true"><i id="fortschritt"></i></div>
      <span class="zaehler" id="zaehler"></span>
    </header>
    <div class="aufgabe" id="aufgabe"></div>
  </div>`;
}
const aktuell = () => Q.aufgaben[Q.i];
function zeigeAufgabe() {
  const a = aktuell();
  Q.versuch = 0; Q.gesperrt = false; Q.reihe = []; Q.stellen = null;
  const n = Math.min(Q.i, Q.total), w = Math.round(100 * Q.i / Q.aufgaben.length);
  document.getElementById('fortschritt').style.width = `${w}%`;
  document.getElementById('zaehler').textContent = a.wdh ? 'Nochmal' : `${n + 1}/${Q.total}`;
  const box = document.getElementById('aufgabe');
  box.className = `aufgabe art-${a.art}`;
  const f = a.frage;
  const kannHoeren = (f.ton && f.ton.length) || f.hoeren;
  box.innerHTML = `<div class="frage-karte">
      <div class="frage-zeile">
        <img class="runde-figur" id="runde-figur" src="${figurBild('denkt')}" alt="">
        <p class="frage-text">${esc(f.text)}</p>
        ${kannHoeren ? `<button class="snd" data-act="vorlesen" aria-label="Noch einmal hören">${f.hoeren ? ICON.ohr : ICON.speaker}</button>` : ''}
      </div>
      <div class="frage-inhalt${f.klein ? ' klein' : ''}">${a.art === 'uhr' ? '' : inhaltHTML(f, true)}${f.hoeren && !f.wort ? `<button class="hoer-knopf" data-act="hoeren" aria-label="Noch einmal hören">${ICON.ohr}<span>Nochmal hören</span></button>` : ''}</div>
    </div>
    <div class="antwort-bereich" id="antwort">${antwortHTML(a)}</div>
    <div class="rueck" id="rueck" aria-live="polite"></div>`;
  if (a.art === 'uhr') {
    Q.stellen = { h: 12, m: 0 };
    if (a.ziel.h % 12 === 0 && a.ziel.m === 0) Q.stellen = { h: 3, m: 0 };
  }
  vorlesen(true);
  if (Q.aufgaben[Q.i + 1]) Ton.preload(Q.aufgaben[Q.i + 1].frage.ton || []);
}
function vorlesen(auto) {
  const f = aktuell().frage;
  if (stimmeAn() && f.ton && f.ton.length) Ton.say(f.ton);
  else if (f.hoeren) Ton.say(f.hoeren);
  if (!auto) sfx.tap();
}
function antwortHTML(a) {
  if (a.art === 'wahl') {
    const bilder = a.optionen.some(o => o.bild || ((o.wappen || o.flagge) && !o.klein) || o.uhr || o.zahl != null || o.schild || o.digital);
    const sp = a.spalten || (bilder ? (a.optionen.length === 3 ? 3 : 2) : 1);
    return `<div class="optionen sp-${sp} n-${a.optionen.length}${bilder ? ' mit-inhalt' : ''}">${a.optionen.map(o => `<button class="opt${o.klein ? ' klein' : ''}" data-act="wahl" data-id="${esc(o.id)}">
      ${inhaltHTML(o)}${o.text ? `<span class="opt-text${o.fremd ? ' fremd' : ''}">${esc(o.text)}${schriftHTML(o)}</span>` : ''}</button>`).join('')}</div>`;
  }
  if (a.art === 'karte') return `<div class="karte-box">${karteSVG({ tippen: true, ebene: a.karte && a.karte.ebene, welt: a.karte && a.karte.welt })}<span class="karte-name" id="karte-name"></span></div>`;
  if (a.art === 'reihe') {
    return `<div class="reihe-plaetze" id="plaetze">${a.reihenfolge.map((_, i) => `<span class="platz" data-i="${i}">${i + 1}</span>`).join('')}</div>
      <div class="reihe-teile" id="teile">${a.teile.map(x => `<button class="teil${x.fremd ? ' fremd' : ''}" data-act="teil" data-id="${esc(x.id)}">${esc(x.text)}${schriftHTML(x)}</button>`).join('')}</div>`;
  }
  if (a.art === 'uhr') {
    const s = a.ziel.h % 12 === 0 && a.ziel.m === 0 ? { h: 3, m: 0 } : { h: 12, m: 0 };
    return `<div class="stell-box">
      <div class="stell-uhr" id="stell-uhr">${uhrSVG(s.h, s.m, { zieh: true, minuten: P().stufe < 3 })}</div>
      <div class="stell-knoepfe">
        <div class="stell-paar"><button class="icon-btn" data-act="stell" data-was="h" data-d="-1" aria-label="Eine Stunde zurück">${ICON.minus}</button><span>Stunde</span><button class="icon-btn" data-act="stell" data-was="h" data-d="1" aria-label="Eine Stunde vor">${ICON.plus}</button></div>
        <div class="stell-paar"><button class="icon-btn" data-act="stell" data-was="m" data-d="-1" aria-label="Minuten zurück">${ICON.minus}</button><span>Minuten</span><button class="icon-btn" data-act="stell" data-was="m" data-d="1" aria-label="Minuten vor">${ICON.plus}</button></div>
        ${a.frage.digital ? `<span class="digital klein">${esc(a.frage.digital)}</span>` : ''}
        <button class="btn primary" data-act="stell-fertig">${ICON.check}<span>Fertig</span></button>
      </div></div>`;
  }
  return '';
}
function rueck(cls, html) { const r = document.getElementById('rueck'); if (r) { r.className = `rueck ${cls}`; r.innerHTML = html; } }

/* ---- richtig / falsch ---- */
function richtig(el) {
  const a = aktuell();
  if (Q.gesperrt) return;
  Q.gesperrt = true;
  if (Q.versuch === 0 && !a.wdh) Q.erst++;
  Q.serie = Q.versuch === 0 ? Q.serie + 1 : 0;
  sfx.right(Q.serie);
  burst(el, 16);
  figur('jubel');
  const serie = { 3: 'serie_3', 5: 'serie_5', 10: 'serie_10' }[Q.serie];
  const f = Q.t.freund, lob = f && Math.random() < 0.5 ? f.lob[rnd(f.lob.length) - 1] : SATZ.lob();
  rueck('gut', `${ICON.check}<span>${Q.versuch ? 'Jetzt stimmt’s!' : 'Richtig!'}</span>`);
  const t0 = Date.now(), weiterNach = () => { clearTimeout(timer); timer = setTimeout(weiter, Math.max(250, 1100 - (Date.now() - t0))); };
  const nachher = a.nachher || [];
  if (nachher.length) Ton.say([...nachher, { pause: 200 }], false, () => sprich([serie || lob], true, weiterNach));
  else sprich([serie || lob], false, weiterNach);
  timer = setTimeout(weiter, 7000);
}
function falsch(el, extra) {
  const a = aktuell();
  Q.serie = 0;
  sfx.wrong();
  nope(el);
  if (Q.versuch === 0) {
    Q.versuch = 1;
    figur('mut');
    rueck('fast', `<span>${extra ? `${esc(extra)} ` : ''}Fast! Versuch es nochmal.</span>`);
    const satz = a.art === 'uhr' ? 'uhr_falsch' : a.art === 'reihe' ? 'reihe_falsch' : SATZ.fast();
    sprich(extra && a.art === 'karte' && Q.getippt ? [(a.karte && a.karte.dasIst) || 'ch_das_ist', kartenName(a, Q.getippt).ton, { pause: 250 }, satz] : [satz]);
    return;
  }
  Q.versuch = 2;
  Q.gesperrt = true;
  if (!a.wdh && Q.wdh < 3) { Q.aufgaben.push(Object.assign({}, a, { wdh: true })); Q.wdh++; }
  zeigeLoesung();
}
function zeigeLoesung() {
  const a = aktuell();
  figur('mut');
  if (a.art === 'wahl') {
    document.querySelectorAll('#antwort .opt').forEach(b => { b.disabled = true; b.classList.toggle('loesung', b.dataset.id === a.richtig); });
  } else if (a.art === 'karte') {
    const p = document.querySelector(`#antwort .karte path[data-${a.karte && a.karte.ebene === 'see' ? 'see' : 'k'}="${a.richtig}"]`);
    if (p) p.classList.add('loesung');
  } else if (a.art === 'reihe') {
    const pl = document.getElementById('plaetze');
    pl.innerHTML = a.reihenfolge.map(id => `<span class="platz voll loesung">${esc(a.teile.find(x => x.id === id).text)}</span>`).join('');
    document.getElementById('teile').innerHTML = '';
  } else if (a.art === 'uhr') {
    Q.stellen = { h: a.ziel.h, m: a.ziel.m };
    uhrSetzen(document.querySelector('#stell-uhr svg'), a.ziel.h, a.ziel.m);
    document.querySelectorAll('.stell-knoepfe button').forEach(b => { b.disabled = true; });
  }
  rueck('loesung', `<span>${esc(a.loesung.text)}</span><button class="btn primary" data-act="weiter" id="weiter-btn">Weiter${ICON.next}</button>`);
  sprich([SATZ.loesung(), { pause: 200 }, ...(a.loesung.ton || [])]);
}
function weiter() {
  clearTimeout(timer);
  if (!Q) return;
  Q.i++;
  if (Q.i >= Q.aufgaben.length) { rundeFertig(); return; }
  zeigeAufgabe();
}

/* ---- Auswahl ---- */
function waehle(id, btn) {
  const a = aktuell();
  if (Q.gesperrt || btn.disabled) return;
  if (id === a.richtig) { btn.classList.add('richtig'); richtig(btn); return; }
  btn.classList.add('falsch');
  btn.disabled = true;
  falsch(btn);
}
/* ---- Karte: auf den Kanton (oder See) tippen – kleine zählen auch knapp daneben ---- */
function karteTipp(e) {
  const a = aktuell(), svg = e.target.closest('svg.karte');
  if (!svg || Q.gesperrt) return;
  const KC = svg.classList.contains('europa') ? window.KARTE_EU : window.KARTE_CH, ctm = svg.getScreenCTM(), see = a.karte && a.karte.ebene === 'see', attr = see ? 'see' : 'k';
  const punkte = see ? KC.seenPunkte : KC.punkte;
  let k = (e.target.closest(`[data-${attr}]`) || { dataset: {} }).dataset[attr] || '';
  if (see && k && !a.karte.namen[k]) k = '';                        // kleine Seen, die nicht dran sind, zählen nicht
  if (ctm) {
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse()), z = punkte[a.richtig];
    const px = Math.hypot(pt.x - z[0], pt.y - z[1]) * ctm.a;           // Abstand in Bildschirm-Pixeln
    if (px < Math.max(18, z[2] * ctm.a)) k = a.richtig;
  }
  if (!k) return;
  const pfad = svg.querySelector(`path[data-${attr}="${k}"]`);
  if (k === a.richtig) { pfad.classList.add('richtig'); richtig(pfad); return; }
  const { name } = kartenName(a, k);
  pfad.classList.add('falsch');
  setTimeout(() => pfad.classList.remove('falsch'), 1400);
  const nm = document.getElementById('karte-name');
  if (nm) { nm.textContent = `Das ist ${see ? 'der ' : ''}${name}`; nm.classList.add('zeigen'); }
  Q.getippt = k;
  falsch(pfad, `Das ist ${see ? 'der ' : ''}${name}.`);
}
/* ---- Reihe: der Reihe nach antippen ---- */
function reiheTipp(id, btn) {
  const a = aktuell();
  if (Q.gesperrt) return;
  const t = a.teile.find(x => x.id === id);
  if (t.ton) Ton.say(t.ton);
  else sfx.tap();
  Q.reihe.push(id);
  btn.classList.add('weg');
  btn.disabled = true;
  zeichnePlaetze();
  if (Q.reihe.length === a.reihenfolge.length) setTimeout(reihePruefen, 350);
}
function reiheZurueck(i) {
  if (Q.gesperrt || i >= Q.reihe.length) return;
  const [id] = Q.reihe.splice(i, 1);
  const b = document.querySelector(`#teile .teil[data-id="${CSS.escape(id)}"]`);
  if (b) { b.classList.remove('weg'); b.disabled = false; }
  sfx.tap();
  zeichnePlaetze();
}
function zeichnePlaetze(markiere) {
  const a = aktuell(), pl = document.getElementById('plaetze');
  pl.innerHTML = a.reihenfolge.map((ok, i) => {
    const id = Q.reihe[i];
    if (!id) return `<span class="platz">${i + 1}</span>`;
    const t = a.teile.find(x => x.id === id), cls = markiere ? (id === ok ? ' gut' : ' falsch') : '';
    return `<button class="platz voll${t.fremd ? ' fremd' : ''}${cls}" data-act="platz" data-i="${i}">${esc(t.text)}</button>`;
  }).join('');
}
function reihePruefen() {
  const a = aktuell();
  if (!Q || Q.reihe.length !== a.reihenfolge.length) return;
  if (Q.reihe.every((id, i) => id === a.reihenfolge[i])) { zeichnePlaetze(true); richtig(document.getElementById('plaetze')); return; }
  zeichnePlaetze(true);
  falsch(document.getElementById('plaetze'));
  if (Q.versuch === 1) {             // die falschen Teile zurück in den Vorrat, die richtigen bleiben
    Q.gesperrt = true;
    setTimeout(() => {
      if (!Q || aktuell() !== a) return;
      Q.reihe = Q.reihe.map((id, i) => (id === a.reihenfolge[i] ? id : null));
      document.querySelectorAll('#teile .teil').forEach(b => { if (!Q.reihe.includes(b.dataset.id)) { b.classList.remove('weg'); b.disabled = false; } });
      const vorne = []; let luecke = false;
      Q.reihe.forEach(id => { if (id && !luecke) vorne.push(id); else luecke = true; });
      Q.reihe = vorne;            // nur der richtige Anfang bleibt liegen, damit man der Reihe nach weitermacht
      document.querySelectorAll('#teile .teil').forEach(b => { const drin = vorne.includes(b.dataset.id); b.classList.toggle('weg', drin); b.disabled = drin; });
      Q.gesperrt = false;
      zeichnePlaetze();
    }, 1300);
  }
}
/* ---- Uhr stellen: Zeiger ziehen oder mit den Knöpfen ---- */
function stellen(was, d) {
  const a = aktuell(), sch = a.schritt || 5;
  if (Q.gesperrt) return;
  let { h, m } = Q.stellen;
  if (was === 'h') h = ((h - 1 + d + 12) % 12) + 1;
  else {
    m += d * sch;
    if (m >= 60) { m -= 60; h = (h % 12) + 1; }
    if (m < 0) { m += 60; h = ((h + 10) % 12) + 1; }
  }
  Q.stellen = { h, m };
  sfx.tick();
  uhrSetzen(document.querySelector('#stell-uhr svg'), h, m);
}
function stellFertig() {
  const a = aktuell(), z = Q.stellen;
  if (Q.gesperrt) return;
  const box = document.getElementById('stell-uhr');
  if (z.h % 12 === a.ziel.h % 12 && z.m === a.ziel.m) richtig(box);
  else falsch(box);
}
/* Zeiger ziehen (Runde «Uhr stellen» und Spiel-Uhr): der Minutenzeiger nimmt die Stunde mit, der Stundenzeiger springt um ganze Stunden */
let UZ = null;
function uhrZiehStart(e) {
  const svg = e.target.closest('svg.uhr.zieh');
  if (!svg) return false;
  const state = view.name === 'spieluhr' ? E.zeit : Q && Q.stellen;
  if (!state || (Q && view.name === 'runde' && Q.gesperrt)) return false;
  const hand = e.target.closest('.zeiger-h') ? 'h' : 'm';
  UZ = { svg, hand, id: e.pointerId, state, schritt: view.name === 'runde' ? (aktuell().schritt || 5) : 5 };
  svg.classList.add('zieht');
  e.preventDefault();
  uhrZiehen(e);
  return true;
}
function uhrZiehen(e) {
  if (!UZ || e.pointerId !== UZ.id) return;
  const r = UZ.svg.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let grad = Math.atan2(e.clientX - cx, cy - e.clientY) * 180 / Math.PI;
  if (grad < 0) grad += 360;
  const s = UZ.state;
  let { h, m } = s;
  if (UZ.hand === 'h') {
    h = Math.round(grad / 30) % 12 || 12;
  } else {
    const neu = (Math.round(grad / 6 / UZ.schritt) * UZ.schritt) % 60;
    if (m >= 45 && neu < 15) h = (h % 12) + 1;
    else if (m < 15 && neu >= 45) h = ((h + 10) % 12) + 1;
    m = neu;
  }
  if (h !== s.h || m !== s.m) { s.h = h; s.m = m; sfx.tick(); uhrSetzen(UZ.svg, h, m); if (view.name === 'spieluhr') spieluhrText(false); }
}
function uhrZiehEnde(e) {
  if (!UZ || e.pointerId !== UZ.id) return;
  UZ.svg.classList.remove('zieht');
  UZ = null;
  if (view.name === 'spieluhr') spieluhrText(true);
}

/* ---- Ende der Runde ---- */
function rundeFertig() {
  const { m, t, u } = Q, p = P();
  const sterne = K.sterne(Q.erst, Q.total), key = sternKey(m.id, t.id, u.id), vorher = p.sterne[key] || 0;
  if (sterne > vorher) p.sterne[key] = sterne;
  p.runden++;
  const st = K.neuerSticker(m, t, p.sticker, K.zufall());
  if (st) { p.sticker.push(st); p.neu.push(st); }
  save();
  const res = { sterne, erst: Q.erst, total: Q.total, sticker: st, rekord: sterne > vorher && vorher > 0, m: m.id, t: t.id, u: u.id, art: 'runde' };
  Q = null;
  zeigeErgebnis(res);
}
function zeigeErgebnis(res) {
  nav('ergebnis', { res, m: res.m, t: res.t });
  sfx.done();
  if (res.sterne === 3 && !reduced()) confetti(60);
  const satz = res.art === 'memory' ? 'memory_fertig' : res.sterne === 3 ? 'sterne_3' : SATZ.fertig();
  sprich([satz, ...(res.sticker ? [{ pause: 300 }, 'sticker'] : [])]);
  if (res.sticker) setTimeout(() => { sfx.sticker(); burst(document.querySelector('.neu-sticker img'), 22); }, 900);
}
function ergebnisHTML(res) {
  const { t } = K.finde(res.m, res.t), f = t.freund;
  return `<div class="screen ergebnis" ${themaStil(t)}>
    <div class="erg-karte">
      <img class="erg-figur" src="${img(f ? f.jubel : 'figur_jubel')}" alt="">
      <h1>${res.sterne === 3 ? 'Wow, perfekt!' : res.sterne >= 1 ? 'Geschafft!' : 'Gut gemacht!'}</h1>
      ${sterneHTML(res.sterne, 'gross')}
      <p class="erg-text">${res.art === 'memory' ? `Alle ${res.total} Paare gefunden${res.erst < res.total ? ` – ${res.total - res.erst} davon erst beim zweiten Mal` : ' – ganz ohne Fehler'}.`
        : `${res.erst} von ${res.total} beim ersten Mal richtig.`}${res.rekord ? ' <b>Neuer Rekord!</b>' : ''}</p>
      ${res.sticker ? `<button class="neu-sticker" data-act="sticker" data-id="${res.sticker}"><img src="${img(res.sticker)}" alt=""><span><small>Neuer Sticker!</small><b>${esc(STICKER[res.sticker].titel)}</b></span></button>`
        : '<p class="erg-text klein">Du hast schon alle Sticker – super Sammlung!</p>'}
    </div>
    <div class="erg-knoepfe">
      <button class="btn" data-act="nochmal" data-u="${res.u}">${ICON.again}<span>Nochmal</span></button>
      ${res.sticker ? `<button class="btn" data-act="buch">${ICON.book}<span>Einkleben</span></button>` : ''}
      <button class="btn primary" data-act="zum-thema">Weiter${ICON.next}</button>
    </div>
  </div>`;
}

/* ================================================================ Memory
   Wie beim Rechentiger: ein Fehler zählt nur, wenn die passende Karte schon einmal offen war (sonst ist es Pech). */
function starteMemory(m, t, u) {
  const R = K.zufall(), paare = u.paare(P().stufe, R);
  const karten = R.mischen(paare.flatMap(p => [{ pid: p.id, x: p.a }, { pid: p.id, x: p.b }]));
  M = { m, t, u, karten, offen: [], gefunden: new Set(), gesehen: new Set(), fehler: new Set(), paare: paare.length, gesperrt: false, hilfe: 0 };
  nav('memory', { m: m.id, t: t.id });
  sprich('memory_start');
}
function memoryHTML() {
  return `<div class="screen memory" ${themaStil(M.t)}>
    <header class="runde-kopf">
      <button class="icon-btn" data-act="abbrechen" aria-label="Beenden">${ICON.close}</button>
      <h1 class="bar-title">${esc(M.u.titel)}</h1>
      <span class="zaehler" id="mem-zaehler">${M.gefunden.size}/${M.paare}</span>
    </header>
    <div class="mem-grid" id="mem-grid">${M.karten.map((k, i) => `<button class="mem-karte" data-act="mem" data-i="${i}" aria-label="Karte ${i + 1}">
      <span class="mem-vorne">${inhaltHTML(k.x)}${k.x.text ? `<span class="opt-text${k.x.fremd ? ' fremd' : ''}">${esc(k.x.text)}${schriftHTML(k.x)}</span>` : ''}</span>
      <span class="mem-hinten"></span></button>`).join('')}</div>
    <div class="rueck" id="rueck" aria-live="polite"></div>
  </div>`;
}
/* Karten so gross wie möglich, ohne zu scrollen */
function memoryLayout() {
  const g = document.getElementById('mem-grid');
  if (!g) return;
  const vh = Math.min(window.innerHeight, document.documentElement.clientHeight || Infinity, window.visualViewport ? window.visualViewport.height : Infinity);
  const n = M.karten.length, W = g.clientWidth, H = Math.max(240, vh - (g.getBoundingClientRect().top + window.scrollY) - 70);   // nav scrollt erst danach nach oben
  let best = { s: 0, c: 4 };
  for (let c = 2; c <= 8; c++) {
    const r = Math.ceil(n / c), s = Math.min((W - (c - 1) * 10) / c, (H - (r - 1) * 10) / r);
    if (s > best.s) best = { s, c };
  }
  g.style.setProperty('--sp', best.c);
  g.style.setProperty('--gr', `${Math.floor(Math.min(best.s, 220))}px`);
}
window.addEventListener('resize', () => { if (view.name === 'memory') memoryLayout(); });
function memTipp(i) {
  if (!M || M.gesperrt) return;
  const k = M.karten[i], el = document.querySelector(`.mem-karte[data-i="${i}"]`);
  if (M.gefunden.has(k.pid) || M.offen.includes(i)) return;
  if (M.offen.length === 2) memZudecken();
  M.offen.push(i);
  el.classList.add('offen');
  sfx.flip();
  if (k.x.ton) Ton.say(k.x.ton);
  if (M.offen.length < 2) { M.gesehen.add(i); return; }
  const [a, b] = M.offen.map(j => M.karten[j]);
  if (a.pid === b.pid) {
    M.gefunden.add(a.pid);
    M.offen.forEach(j => document.querySelector(`.mem-karte[data-i="${j}"]`).classList.add('paar'));
    M.offen = [];
    sfx.right(M.gefunden.size);
    burst(el, 12);
    document.getElementById('mem-zaehler').textContent = `${M.gefunden.size}/${M.paare}`;
    rueck('', '');
    if (M.gefunden.size === M.paare) { M.gesperrt = true; timer = setTimeout(memoryFertig, 900); }
    else if (!k.x.ton) sprich(SATZ.lob());
    return;
  }
  // Fehler nur, wenn die passende Karte zu einer der beiden schon einmal offen war
  const partnerGesehen = c => M.karten.some((x, j) => x.pid === c.pid && j !== M.karten.indexOf(c) && M.gesehen.has(j));
  const schuld = [a, b].filter(partnerGesehen);
  M.gesehen.add(i);
  M.offen.forEach(j => document.querySelector(`.mem-karte[data-i="${j}"]`).classList.add('nein'));
  if (schuld.length) {
    schuld.forEach(c => M.fehler.add(c.pid));
    M.hilfe++;
    if (M.hilfe === 1) { rueck('fast', '<span>Die passende Karte hast du schon gesehen!</span>'); sprich('memory_merken'); }
  }
  timer = setTimeout(memZudecken, 1700);
}
function memZudecken() {
  clearTimeout(timer);
  M.offen.forEach(j => { const e = document.querySelector(`.mem-karte[data-i="${j}"]`); if (e) e.classList.remove('offen', 'nein'); });
  M.offen = [];
}
function memoryFertig() {
  const { m, t, u } = M, p = P();
  const ohne = M.paare - M.fehler.size, sterne = K.sterne(ohne, M.paare), key = sternKey(m.id, t.id, u.id), vorher = p.sterne[key] || 0;
  if (sterne > vorher) p.sterne[key] = sterne;
  p.runden++;
  const st = K.neuerSticker(m, t, p.sticker, K.zufall());
  if (st) { p.sticker.push(st); p.neu.push(st); }
  save();
  const res = { sterne, erst: ohne, total: M.paare, sticker: st, rekord: sterne > vorher && vorher > 0, m: m.id, t: t.id, u: u.id, art: 'memory' };
  M = null;
  zeigeErgebnis(res);
}

/* ================================================================ Entdecken (Lernkarten) und Spiel-Uhr */
function oeffneEntdecken() {
  const { m, t } = mt();
  sfx.tap();
  if (t.entdecken === 'uhr') {
    E = { zeit: { h: 3, m: 0 } };
    nav('spieluhr', { m: m.id, t: t.id });
    sprich('zeit_spieluhr');
    return;
  }
  E = { karten: t.karten(), i: 0 };
  nav('entdecken', { m: m.id, t: t.id });
  sprich(['entdecken', { pause: 300 }, ...E.karten[0].ton], false);
}
function entdeckenHTML() {
  const { t } = mt();
  return `<div class="screen entdecken" ${themaStil(t)}>
    ${kopfHTML(`${t.sprache ? flagHTML(t.sprache) : ''}Entdecken`, 'zum-thema')}
    <div class="lernkarte" id="lernkarte"></div>
    <nav class="karten-nav">
      <button class="icon-btn" data-act="karte-zurueck" aria-label="Zurück">${ICON.back}</button>
      <span class="karten-wo" id="karten-wo"></span>
      <button class="icon-btn" data-act="karte-vor" aria-label="Weiter">${ICON.fwd}</button>
    </nav>
  </div>`;
}
function entdeckenZeigen() {
  const k = E.karten[E.i], box = document.getElementById('lernkarte');
  if (!box) return;
  const bild = k.wappen || k.flagge || k.bild || k.zahl != null || k.karte;
  box.innerHTML = `<div class="lk-bild${k.karte && (k.wappen || k.flagge) ? ' doppelt' : ''}">${bild ? inhaltHTML(Object.assign({}, k, { karte: k.karte, zahl: k.zahl }), true) : ''}
      ${k.liste ? `<ol class="lk-liste">${k.liste.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}</div>
    <div class="lk-text">
      <h2 class="${k.fremd ? 'fremd' : ''}"><span>${esc(k.titel)}${schriftHTML(k)}</span><button class="snd" data-act="karte-ton" aria-label="Anhören">${ICON.speaker}</button></h2>
      ${k.unter ? `<p class="lk-unter">${esc(k.unter)}</p>` : ''}
      ${k.zeilen ? `<dl>${k.zeilen.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>` : ''}
      ${k.text ? `<p class="lk-info">${esc(k.text)}</p>` : ''}
    </div>`;
  document.getElementById('karten-wo').textContent = `${E.i + 1} von ${E.karten.length}`;
}
function karteBlaettern(d) {
  E.i = (E.i + d + E.karten.length) % E.karten.length;
  sfx.flip();
  entdeckenZeigen();
  const box = document.getElementById('lernkarte');
  if (box && !reduced()) { box.classList.remove('rein-l', 'rein-r'); void box.offsetWidth; box.classList.add(d > 0 ? 'rein-r' : 'rein-l'); }
  Ton.say(E.karten[E.i].ton);
}
function spieluhrHTML() {
  const { t } = mt();
  return `<div class="screen spieluhr" style="${farben(t.farbe)}">
    ${kopfHTML('Spiel-Uhr', 'zum-thema')}
    <div class="spieluhr-box">
      <div class="stell-uhr gross" id="spiel-uhr">${uhrSVG(E.zeit.h, E.zeit.m, { zieh: true, minuten: true })}</div>
      <div class="spieluhr-text">
        <p class="su-wort" id="su-wort"></p>
        <p class="su-digital"><span class="digital" id="su-12"></span><span class="digital" id="su-24"></span></p>
        <p class="set-note">Morgens und nachmittags sieht die Uhr gleich aus. Die Digitaluhr zeigt am Nachmittag 12 Stunden mehr.</p>
        <div class="stell-paar"><button class="icon-btn" data-act="su" data-was="h" data-d="-1" aria-label="Eine Stunde zurück">${ICON.minus}</button><span>Stunde</span><button class="icon-btn" data-act="su" data-was="h" data-d="1" aria-label="Eine Stunde vor">${ICON.plus}</button></div>
        <div class="stell-paar"><button class="icon-btn" data-act="su" data-was="m" data-d="-1" aria-label="5 Minuten zurück">${ICON.minus}</button><span>5 Minuten</span><button class="icon-btn" data-act="su" data-was="m" data-d="1" aria-label="5 Minuten vor">${ICON.plus}</button></div>
        <button class="btn" data-act="su-sag">${ICON.speaker}<span>Wie spät ist es?</span></button>
      </div>
    </div>
  </div>`;
}
const ZEIT = () => MODULE.find(m => m.id === 'zeit').daten;
function spieluhrText(sagen) {
  const z = E.zeit, D = ZEIT(), wort = D.zeitText(z.h, z.m);
  const w = document.getElementById('su-wort');
  if (!w) return;
  w.textContent = `Es ist ${wort}.`;
  document.getElementById('su-12').textContent = D.digital(z.h, z.m);
  document.getElementById('su-24').textContent = D.digital((z.h % 12) + 12, z.m);
  if (sagen) Ton.say(['zeit_es_ist', D.zeitTon(z.h, z.m)]);
}

/* ================================================================ Album */
function albumHTML() {
  const p = P(), alle = K.alleSticker();
  return `<div class="screen album">
    ${kopfHTML('Mein Album', 'start', true)}
    <p class="album-zahl">${p.sticker.length} von ${alle.length} Stickern gesammelt</p>
    ${buchKnopfHTML('small')}
    ${MODULE.map(m => `<section class="album-seite" style="${farben(m.farbe)}">
      <h2>${esc(m.titel)}</h2>
      ${m.themen.filter(t => (t.sticker || []).length).map(t => `<h3>${t.sprache ? flagHTML(t.sprache) : ''}${esc(t.titel)}</h3>
        <div class="album-grid">${t.sticker.map(([id, titel]) => (p.sticker.includes(id)
          ? `<button class="slot voll" data-act="sticker" data-id="${id}"><img src="${img(id)}" alt=""><span>${esc(titel)}</span></button>`
          : '<span class="slot leer"><i>?</i></span>')).join('')}</div>`).join('')}
    </section>`).join('')}
  </div>`;
}
function stickerSheetHTML(id) {
  const s = STICKER[id], m = MODULE.find(x => x.id === s.modul), t = m.themen.find(x => x.id === s.thema);
  return `<div class="sheet-head"><h2>${esc(s.titel)}</h2><button class="icon-btn" data-act="close-sheet" aria-label="Schliessen">${ICON.close}</button></div>
    <div class="sheet-body center"><img class="sheet-sticker" src="${img(id)}" alt=""><p class="set-note">Aus «${esc(m.titel)} · ${esc(t.titel)}»</p></div>`;
}

/* ----------------------------------------------------------- Sammelbuch
   Aus Wörtli-Frosch übernommen (2026-11-01, Stand 2026-10-28: Blättern ohne Flackern, Sticker ohne Aufblitzen, Ziehen mit dem
   Finger auf iPhone/iPad). Neu: jedes Kind hat sein eigenes Buch (P().buch); alle Sticker der Lernreise kommen hinein. */
const BK = { busy: false, pend: null, drag: null, swipe: null, roll: null, rollRaf: 0, sel: null, L: null, from: 'start', nr: 0, schluck: false };
const STICKER_BREITE = 0.32;                  // Anteil der Seitenbreite (gleich wie .pst in style.css)
const stickerBild = s => img(s);
const stickerName = s => STICKER[s].titel;
const eingeklebt = () => P().buch.placed.filter(x => P().sticker.includes(x.s));
const buchAlle = () => P().sticker;
const freieSticker = () => buchAlle().filter(s => !P().buch.placed.some(x => x.s === s)).reverse();      // der neuste zuerst
const buchStand = () => (buchAlle().length ? `${eingeklebt().length} von ${buchAlle().length} Stickern eingeklebt` : 'Hier klebst du deine Sticker ein');
const buchKnopfHTML = (cls = '') => `<button class="book-banner ${cls}" data-act="buch">
  <span class="bb-book" aria-hidden="true">${ICON.book}</span><span class="bb-text"><b>Mein Sammelbuch</b><small>${buchStand()}</small></span>${ICON.fwd}</button>`;
function seiteInfo(p) {
  if (p === 0) return { art: 'umschlag' };
  if (p === 1) return { art: 'exlibris' };
  if (p === 2) return { art: 'titel' };
  return { art: 'szene', szene: Math.floor((p - 3) / 2), links: (p - 3) % 2 === 0, nr: p - 2 };
}
/* Doppelseiten: 0 = zu (nur der Umschlag, rechts), 1 = Seiten 1 + 2, 2 = 3 + 4 … */
const blattVon = p => (p === 0 ? 0 : Math.ceil(p / 2));
const seitenVon = s => (s === 0 ? [null, 0] : [2 * s - 1, 2 * s]);
const LETZTES_BLATT = blattVon(BUCH_SEITEN - 1);
const knoten = html => { const d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; };   // lädt die Bilder schon
const pstEl = s => document.querySelector(`#book .spread .pst[data-s="${CSS.escape(s)}"]`);

function buchHTML() {
  return `<div class="screen buch" id="buch">
    <header class="bar">
      <button class="icon-btn" data-act="buch-zu" aria-label="Zurück">${ICON.back}</button>
      <h1 class="bar-title">Sammelbuch</h1>
      <span class="count" id="buch-count"></span>
    </header>
    <div class="stage" id="stage"><div class="book" id="book"></div></div>
    <nav class="buch-nav">
      <button class="icon-btn" data-act="blatt" data-d="-1" id="blatt-zurueck" aria-label="Zurückblättern">${ICON.back}</button>
      <span class="buch-wo" id="buch-wo"></span>
      <button class="icon-btn" data-act="blatt" data-d="1" id="blatt-vor" aria-label="Weiterblättern">${ICON.fwd}</button>
    </nav>
    <section class="tray" id="tray" aria-label="Deine Sticker zum Einkleben"></section>
    <div class="st-tools" id="st-tools" hidden>
      <button data-act="st-rot" data-d="-15" aria-label="Nach links drehen">${ICON.rotL}</button>
      <button data-act="st-rot" data-d="15" aria-label="Nach rechts drehen">${ICON.rotR}</button>
      <button class="weg" data-act="st-weg">${ICON.peel}<span>Ablösen</span></button>
    </div>
  </div>`;
}
function oeffneBuch() {
  BK.from = ['album', 'ergebnis'].includes(view.name) ? view.name : 'start';
  BK.res = view.res;
  Ton.preload(['blaettern', 'kleben', 'abloesen', 'buch_start', 'buch_klebt', 'buch_leer']);
  nav('buch');
  if (!P().buch.seen) { P().buch.seen = true; save(); sprich('buch_start'); }
  else if (buchAlle().length && !freieSticker().length) sprich('buch_leer');
}
function buchZeigen() { zeichneStapel(); zeichneBuch(); }          // zuerst der Stapel: seine Höhe bestimmt die Buchgrösse
function buchAufraeumen() {
  if (BK.drag) BK.drag.g.remove();
  stoppeRollen();
  Object.assign(BK, { drag: null, pend: null, swipe: null, roll: null, sel: null, busy: false, nr: BK.nr + 1 });
}
/* Wie gross wird eine Seite? Seiten sind 3 : 4 (hoch). Doppelseite, wenn genug Breite da ist (iPad quer, PC). */
function buchMasse() {
  const st = document.getElementById('stage'), W = st.clientWidth, H = st.clientHeight - 20;
  const doppel = W >= 640 && W / H >= 1.15;
  const pw = Math.floor(Math.max(120, doppel ? Math.min(W / 2 - 16, H * 0.75) : Math.min(W - 20, H * 0.75)));
  return { doppel, pw, ph: Math.round(pw / 0.75) };
}
const masseNeu = () => { const L = buchMasse(); return !BK.L || L.pw !== BK.L.pw || L.doppel !== BK.L.doppel; };
/* Das ganze Buch neu – nur beim Öffnen, bei einer neuen Bildschirmgrösse und ohne Animationen; sonst wird nur verschoben */
function zeichneBuch() {
  const book = document.getElementById('book');
  if (!book) return;
  const L = BK.L = buchMasse(), s = blattVon(P().buch.p);
  const [l, r] = L.doppel ? seitenVon(s) : [null, P().buch.p];
  book.className = `book ${L.doppel ? 'doppel' : 'einzel'}${L.doppel && s === 0 ? ' zu' : ''}`;
  book.style.setProperty('--pw', `${L.pw}px`);
  book.style.setProperty('--ph', `${L.ph}px`);
  book.innerHTML = `<div class="spread">${L.doppel ? seiteHTML(l, 'links') : ''}${seiteHTML(r, L.doppel ? 'rechts' : 'solo')}</div>`;
  buchLeiste();
}
/* Pfeile, »Seite … · …«, Zähler oben rechts und Werkzeug – passend zur aufgeschlagenen Seite */
function buchLeiste() {
  const L = BK.L, s = blattVon(P().buch.p);
  document.getElementById('blatt-vor').disabled = L.doppel ? s >= LETZTES_BLATT : P().buch.p >= BUCH_SEITEN - 1;
  document.getElementById('blatt-zurueck').disabled = P().buch.p === 0;
  document.getElementById('buch-wo').textContent = woText(L.doppel, s);
  const n = eingeklebt().length, c = document.getElementById('buch-count');
  c.textContent = `${n}/${buchAlle().length}`;
  c.setAttribute('aria-label', `${n} von ${buchAlle().length} Stickern eingeklebt`);
  if (BK.sel != null && !pstEl(BK.sel)) BK.sel = null;
  zeigeWerkzeug();
}
function woText(doppel, s) {
  const p = P().buch.p;
  if (p === 0) return 'Umschlag';
  if (doppel ? s === 1 : p <= 2) return doppel ? 'Vorne im Buch' : p === 1 ? 'Dieses Buch gehört …' : 'Titelseite';
  const a = seiteInfo(doppel ? 2 * s - 1 : p);
  return doppel ? `Seite ${a.nr}–${a.nr + 1} · ${SZENEN[a.szene][1]}` : `Seite ${a.nr} von ${2 * SZENEN.length} · ${SZENEN[a.szene][1]}`;
}
const pstHTML = x => `<img class="pst${BK.sel === x.s ? ' sel' : ''}" data-act="pst" data-s="${x.s}" src="${stickerBild(x.s)}" alt="${esc(stickerName(x.s))}" draggable="false" style="left:${x.x}%;top:${x.y}%;--r:${x.r}deg">`;
/* Eine Seite mit ihren Stickern (zuletzt geklebt = zuoberst) */
function seiteHTML(p, seite) {
  if (p == null) return `<div class="page ${seite} leer"></div>`;
  const a = seiteInfo(p);
  if (a.art === 'umschlag') {
    return `<div class="page ${seite} umschlag" data-act="buch-auf" style="background-image:url(${img('buch_umschlag')})">
      <span class="u-titel"><small>Mein</small><b>Reise-Sammelbuch</b></span>
      <span class="u-bild"><img src="${img('figur_hallo')}" alt=""></span>
      <span class="u-name">${esc(P().name)}</span>
    </div>`;
  }
  let inhalt = '', stil = '', cls = a.art;
  if (a.art === 'exlibris') {
    inhalt = `<div class="exlibris-rahmen"><img src="${img(`avatar_${P().avatar}`)}" alt=""><span class="ex-klein">Dieses Buch gehört</span>
      <span class="ex-name">${esc(P().name) || '…………'}</span><span class="ex-deko">${ICON.star}${ICON.star}${ICON.star}</span></div>`;
  } else if (a.art === 'titel') {
    inhalt = `<div class="titel-inhalt"><span class="t-klein">Mein</span><span class="t-gross">Reise-Sammelbuch</span><img src="${img('figur_jubel')}" alt="">
      <span class="t-text">Zieh deine Sticker von unten auf eine Seite und kleb sie ein, wo du willst. Tippst du einen an, kannst du ihn drehen oder ablösen.</span></div>`;
  } else {
    stil = ` style="background-image:url(${img('seite_' + SZENEN[a.szene][0])})"`;
    cls += a.links ? ' halb-l' : ' halb-r';
    inhalt = `${a.links ? `<span class="szene-name">${SZENEN[a.szene][1]}</span>` : ''}<span class="seiten-nr">${a.nr}</span>`;
  }
  const st = P().buch.placed.filter(x => x.p === p && P().sticker.includes(x.s));
  return `<div class="page ${seite} ${cls}" data-p="${p}"${stil}>${inhalt}${st.map(pstHTML).join('')}<i class="falz" aria-hidden="true"></i></div>`;
}
const stapelKnopfHTML = s => `<button class="tray-st" data-act="tray-st" data-s="${s}" aria-label="${esc(stickerName(s))} einkleben"><img src="${stickerBild(s)}" alt="" draggable="false"></button>`;
function zeichneStapel() {
  const t = document.getElementById('tray');
  if (!t) return;
  const frei = freieSticker();
  t.innerHTML = frei.length
    ? `<div class="tray-kopf"><b>Deine Sticker (${frei.length})</b><span>Nach oben auf eine Seite ziehen oder antippen</span></div>
      <div class="tray-row">${frei.map(stapelKnopfHTML).join('')}</div>`
    : `<p class="tray-leer">${buchAlle().length ? 'Alle deine Sticker sind eingeklebt. Neue bekommst du auf deiner Lernreise.' : 'Noch keine Sticker. Übe mit Gian – dann bekommst du den ersten!'}</p>`;
}
/* Stapel ohne ihn neu zu zeichnen: einen Sticker herausnehmen / zurücklegen (bild = sein <img>, wird wiederverwendet) */
function stapelWeg(s) {
  const b = document.querySelector(`#tray .tray-st[data-s="${CSS.escape(s)}"]`), n = freieSticker().length;
  if (b) b.remove();
  if (!n || !b) { zeichneStapel(); if (masseNeu()) zeichneBuch(); return; }
  document.querySelector('#tray .tray-kopf b').textContent = `Deine Sticker (${n})`;
}
function stapelDazu(s, bild) {
  const row = document.querySelector('#tray .tray-row'), frei = freieSticker();
  if (!row) { zeichneStapel(); if (masseNeu()) zeichneBuch(); return; }
  const b = knoten(stapelKnopfHTML(s)), i = frei.indexOf(s), nach = frei.slice(i + 1).map(x => row.querySelector(`.tray-st[data-s="${CSS.escape(x)}"]`)).find(Boolean);
  if (bild) {
    ['class', 'style', 'data-act', 'data-s'].forEach(a => bild.removeAttribute(a));
    bild.alt = '';
    b.firstElementChild.replaceWith(bild);
  }
  row.insertBefore(b, nach || null);
  document.querySelector('#tray .tray-kopf b').textContent = `Deine Sticker (${frei.length})`;
}

/* ---- Blättern: das Blatt hebt sich vom Buchrücken, steht senkrecht und legt sich auf die andere Seite (zwei flache Hälften
   nacheinander, keine 3D-Karte mit Rückseite – die zeigte Safari durchscheinend). Neue Seiten werden vorher fertig geladen. ---- */
const BLATT_MS = 700;                          // beide Hälften zusammen (style.css: je .35s)
function blaettern(d, danach) {
  if (BK.busy || BK.drag || !BK.L) return;
  const L = BK.L, p0 = P().buch.p;
  let p1;
  if (L.doppel) {
    const s1 = blattVon(p0) + d;
    if (s1 < 0 || s1 > LETZTES_BLATT) return;
    p1 = s1 === 0 ? 0 : 2 * s1 - 1;
  } else {
    p1 = p0 + d;
    if (p1 < 0 || p1 >= BUCH_SEITEN) return;
  }
  waehleSt(null);
  P().buch.p = p1;
  save();
  if (reduced()) { Ton.fx('blaettern'); zeichneBuch(); if (danach) danach(); return; }
  BK.busy = true;
  const nr = ++BK.nr, book = document.getElementById('book'), spread = book.querySelector('.spread');
  book.classList.add('blaettert');
  let hoch = null, unten = null, runter = null, ersetzt = null, art;
  if (L.doppel) {
    const [l1, r1] = seitenVon(blattVon(p1)), [links, rechts] = spread.children;
    if (d > 0) { art = 'vor'; hoch = rechts; unten = knoten(seiteHTML(r1, 'rechts')); runter = knoten(seiteHTML(l1, 'links')); ersetzt = links; }
    else { art = 'zurueck'; hoch = links; unten = knoten(seiteHTML(l1, 'links')); runter = knoten(seiteHTML(r1, 'rechts')); ersetzt = rechts; }
  } else if (d > 0) { art = 'weg'; hoch = spread.firstElementChild; unten = knoten(seiteHTML(p1, 'solo')); }
  else { art = 'her'; runter = knoten(seiteHTML(p1, 'solo')); ersetzt = spread.firstElementChild; }
  bilderBereit([unten, runter]).then(() => {
    if (nr !== BK.nr || !book.isConnected) return;
    Ton.fx('blaettern');
    const leaf = document.createElement('div');
    leaf.className = `leaf ${art}`;
    if (hoch) { hoch.replaceWith(unten); leaf.appendChild(document.createElement('div')).className = 'halb hoch'; leaf.lastChild.appendChild(hoch); }
    if (runter) { leaf.appendChild(document.createElement('div')).className = 'halb runter'; leaf.lastChild.appendChild(runter); }
    book.appendChild(leaf);
    if (L.doppel) book.classList.toggle('zu', blattVon(p1) === 0);
    document.getElementById('buch-wo').textContent = woText(L.doppel, blattVon(p1));
    let fertig = false;
    const ende = () => {
      if (fertig || nr !== BK.nr) return;
      fertig = true;
      if (runter) ersetzt.replaceWith(runter);
      leaf.remove();
      book.classList.remove('blaettert');
      BK.busy = false;
      buchLeiste();
      if (danach && view.name === 'buch') danach();
    };
    const letzte = leaf.lastChild;
    leaf.addEventListener('animationend', e => { if (e.target === letzte && e.animationName.startsWith('halb')) ende(); });
    setTimeout(ende, BLATT_MS + 250);
  });
}
function bilderBereit(seiten, ms = 400) {
  const warte = i => (i.decode ? i.decode().catch(() => {}) : Promise.resolve());
  const jobs = [];
  seiten.filter(Boolean).forEach(e => {
    e.querySelectorAll('img').forEach(i => jobs.push(warte(i)));
    const bg = /url\(["']?([^"')]+)/.exec(e.style.backgroundImage || '');
    if (bg) { const i = new Image(); i.src = bg[1]; jobs.push(warte(i)); }
  });
  return Promise.race([Promise.all(jobs), new Promise(res => setTimeout(res, ms))]);
}
/* ---- Einkleben, auswählen, drehen, ablösen – ohne das Buch neu zu zeichnen ---- */
function einkleben(s, p, x, y, r, bild) {
  const pl = P().buch.placed, alt = pl.findIndex(i => i.s === s), neu = alt < 0;
  const item = neu ? { s } : pl.splice(alt, 1)[0];
  Object.assign(item, { p, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, r: Math.round(r) });
  pl.push(item);
  save();
  Ton.fx('kleben');
  BK.sel = null;
  const e = pstEl(s) || (bild && bild.tagName === 'IMG' ? bild : knoten(pstHTML(item)));
  e.className = 'pst';
  e.style.cssText = `left:${item.x}%;top:${item.y}%;--r:${item.r}deg`;
  Object.assign(e.dataset, { act: 'pst', s });
  e.alt = stickerName(s);
  e.draggable = false;
  const seite = document.querySelector(`#book .spread .page[data-p="${p}"]`);
  if (seite) seite.insertBefore(e, seite.querySelector('.falz'));
  if (neu) stapelWeg(s);
  if (!reduced()) { void e.offsetWidth; e.classList.add('klebt'); }
  buchLeiste();
  if (neu && eingeklebt().length === 1) sprich('buch_klebt');
}
function antippenEinkleben(s) {
  if (BK.schluck) { BK.schluck = false; return; }
  if (BK.busy || BK.drag) return;
  if (P().buch.p === 0) { blaettern(1, () => antippenEinkleben(s)); return; }
  const ziel = [...document.querySelectorAll('#book .spread .page[data-p]')].map(e => +e.dataset.p).filter(p => p > 0)
    .map(p => ({ p, n: P().buch.placed.filter(x => x.p === p).length })).sort((a, b) => a.n - b.n || b.p - a.p)[0];
  const b = document.querySelector(`#tray .tray-st[data-s="${CSS.escape(s)}"] img`);
  if (ziel) einkleben(s, ziel.p, 30 + Math.random() * 40, 30 + Math.random() * 40, Math.random() * 20 - 10, b);
}
function waehleSt(s) {
  BK.sel = s;
  document.querySelectorAll('#book .pst.sel').forEach(e => e.classList.remove('sel'));
  const el = s != null && pstEl(s);
  if (el) el.classList.add('sel'); else BK.sel = null;
  zeigeWerkzeug();
}
function zeigeWerkzeug() {
  const t = document.getElementById('st-tools');
  if (!t) return;
  const el = BK.sel != null && pstEl(BK.sel);
  t.hidden = !el;
  if (!el) return;
  const r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth;
  let top = r.top - t.offsetHeight - 10;
  if (top < 8) top = r.bottom + 10;
  t.style.left = `${Math.max(8, Math.min(vw - t.offsetWidth - 8, r.left + r.width / 2 - t.offsetWidth / 2))}px`;
  t.style.top = `${top}px`;
}
function drehen(d) {
  const x = P().buch.placed.find(i => i.s === BK.sel);
  if (!x) return;
  x.r = ((x.r + d + 540) % 360) - 180;
  save();
  sfx.tap();
  const el = pstEl(BK.sel);
  if (el) el.style.setProperty('--r', `${x.r}deg`);
  zeigeWerkzeug();
}
function abloesen(s, leise) {
  const pl = P().buch.placed, k = pl.findIndex(i => i.s === s);
  if (k < 0) return;
  pl.splice(k, 1);
  save();
  if (leise) sfx.tap(); else Ton.fx('abloesen');
  BK.sel = null;
  const e = pstEl(s);
  stapelDazu(s, e);
  if (e && e.closest('#book')) e.remove();
  buchLeiste();
}
/* ---- Ziehen: mit einem Finger (oder der Maus) verschieben, ein zweiter Finger dreht. Der Stapel scrollt selbst
   (touch-action: none), sonst bricht Safari das Ziehen nach oben ab. ---- */
const punkt = e => ({ x: e.clientX, y: e.clientY });
app.addEventListener('pointerdown', e => {
  if (['runde', 'spieluhr'].includes(view.name)) { if (uhrZiehStart(e)) return; }
  if (view.name === 'entdecken' && e.target.closest('#lernkarte')) { E.swipe = { id: e.pointerId, ...punkt(e) }; return; }
  if (view.name !== 'buch') return;
  BK.schluck = false;
  if (BK.busy) return;
  if (BK.drag) {
    if (e.pointerType === 'touch' && BK.drag.ptr.size === 1) { BK.drag.ptr.set(e.pointerId, punkt(e)); BK.drag.w0 = null; }
    return;
  }
  if (BK.roll) return;
  stoppeRollen();
  const tray = e.target.closest('.tray-st'), pst = e.target.closest('#book .spread .pst'), row = e.target.closest('.tray-row');
  if (tray) BK.pend = { art: 'neu', s: tray.dataset.s, el: tray, row, id: e.pointerId, ...punkt(e) };
  else if (pst) { BK.pend = { art: 'zug', s: pst.dataset.s, el: pst, id: e.pointerId, ...punkt(e) }; e.preventDefault(); }
  else if (row) rollStart({ row, id: e.pointerId, ...punkt(e) });
  else if (e.target.closest('#book')) BK.swipe = { id: e.pointerId, ...punkt(e) };
  if (!e.target.closest('.st-tools, #book .pst')) waehleSt(null);
});
window.addEventListener('pointermove', e => {
  if (UZ) { uhrZiehen(e); return; }
  if (view.name !== 'buch') return;
  const pd = BK.pend;
  if (pd && e.pointerId === pd.id) {
    const dx = e.clientX - pd.x, dy = e.clientY - pd.y;
    if (pd.art === 'neu') {
      const weit = Math.hypot(dx, dy), scrollt = pd.row && pd.row.scrollWidth > pd.row.clientWidth + 2;
      if (weit > 8 && (!scrollt || -dy >= Math.abs(dx) * 0.35 || (weit > 24 && dy < 0))) ziehStart(pd, e);
      else if ((Math.abs(dx) > 10 && Math.abs(dy) < Math.abs(dx) * 0.35) || weit > 24) { BK.pend = null; rollStart(pd); }
    } else if (Math.hypot(dx, dy) > 6) ziehStart(pd, e);
  }
  if (BK.roll && e.pointerId === BK.roll.id) rollen(e);
  const dr = BK.drag;
  if (dr && dr.ptr.has(e.pointerId)) { dr.ptr.set(e.pointerId, punkt(e)); ziehBewegen(); }
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (UZ && e.cancelable) { e.preventDefault(); return; }
  if (view.name === 'buch' && (BK.pend || BK.drag || BK.roll || BK.swipe) && e.cancelable) e.preventDefault();
}, { passive: false });
function rollStart(pd) { BK.roll = { id: pd.id, row: pd.row, x: pd.x, left: pd.row.scrollLeft, lx: pd.x, t: performance.now(), v: 0 }; }
function rollen(e) {
  const ro = BK.roll, t = performance.now(), dt = t - ro.t;
  if (dt > 0) ro.v = 0.7 * ((ro.lx - e.clientX) / dt) + 0.3 * ro.v;
  ro.t = t; ro.lx = e.clientX;
  ro.row.scrollLeft = ro.left - (e.clientX - ro.x);
}
function rollEnde() {
  const ro = BK.roll;
  BK.roll = null;
  BK.schluck = true;
  let v = performance.now() - ro.t > 90 ? 0 : ro.v, t0 = performance.now();
  const schritt = t => {
    const dt = t - t0; t0 = t;
    ro.row.scrollLeft += v * dt;
    v *= Math.pow(0.995, dt);
    BK.rollRaf = Math.abs(v) > 0.02 && ro.row.isConnected ? requestAnimationFrame(schritt) : 0;
  };
  if (Math.abs(v) > 0.05) BK.rollRaf = requestAnimationFrame(schritt);
}
function stoppeRollen() { if (BK.rollRaf) cancelAnimationFrame(BK.rollRaf); BK.rollRaf = 0; }
function ziehStart(pd, e) {
  BK.pend = null;
  const zug = pd.art === 'zug', x = zug && P().buch.placed.find(i => i.s === pd.s);
  if (zug && !x) return;
  const size = BK.L.pw * STICKER_BREITE;
  let off = { x: 0, y: size * 0.3 };
  if (zug) {
    const r = pd.el.getBoundingClientRect();
    off = { x: pd.x - (r.left + r.width / 2), y: pd.y - (r.top + r.height / 2) };
    pd.el.style.visibility = 'hidden';
  } else pd.el.classList.add('weg');
  const g = document.createElement('img');
  g.className = 'ghost'; g.alt = ''; g.draggable = false; g.src = stickerBild(pd.s);
  g.style.width = `${size}px`;
  fxRoot.appendChild(g);
  BK.drag = { art: pd.art, s: pd.s, el: pd.el, g, off, r: zug ? x.r : Math.round(Math.random() * 16 - 8),
    ptr: new Map([[pd.id, punkt(e)]]), haupt: pd.id, w0: null, r0: 0, cx: 0, cy: 0 };
  waehleSt(null);
  Ton.fx('abloesen');
  ziehBewegen();
}
function ziehBewegen() {
  const dr = BK.drag, pts = [...dr.ptr.values()];
  if (pts.length >= 2) {
    const w = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) * 180 / Math.PI;
    if (dr.w0 == null) { dr.w0 = w; dr.r0 = dr.r; }
    dr.r = Math.round(dr.r0 + w - dr.w0);
  }
  const h = dr.ptr.get(dr.haupt) || pts[0];
  dr.cx = h.x - dr.off.x; dr.cy = h.y - dr.off.y;
  dr.g.style.transform = `translate3d(${dr.cx}px, ${dr.cy}px, 0) translate(-50%, -50%) rotate(${dr.r}deg) scale(1.08)`;
  const ziel = zielBei(dr.cx, dr.cy, dr.art);
  document.querySelectorAll('#buch .ziel').forEach(e => { if (e !== ziel) e.classList.remove('ziel'); });
  if (ziel) ziel.classList.add('ziel');
}
function zielBei(x, y, art) {
  for (const e of document.elementsFromPoint(x, y)) {
    if (e.closest('#tray')) return art === 'zug' ? document.getElementById('tray') : null;
    const p = e.closest('#book .spread .page[data-p]');
    if (p && +p.dataset.p > 0) return p;
  }
  return null;
}
function loslassen(e) {
  if (UZ) { uhrZiehEnde(e); return; }
  if (view.name === 'entdecken' && E && E.swipe && e.pointerId === E.swipe.id) {
    const dx = e.clientX - E.swipe.x, dy = e.clientY - E.swipe.y;
    E.swipe = null;
    if (e.type === 'pointerup' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) karteBlaettern(dx < 0 ? 1 : -1);
    return;
  }
  if (view.name !== 'buch') return;
  if (BK.pend && e.pointerId === BK.pend.id) BK.pend = null;
  if (BK.roll && e.pointerId === BK.roll.id) rollEnde();
  const sw = BK.swipe;
  if (sw && e.pointerId === sw.id) {
    BK.swipe = null;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (e.type === 'pointerup' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) blaettern(dx < 0 ? 1 : -1);
  }
  const dr = BK.drag;
  if (!dr || !dr.ptr.has(e.pointerId)) return;
  dr.ptr.delete(e.pointerId);
  dr.w0 = null;
  if (e.pointerId === dr.haupt && dr.ptr.size) {
    const [id, p] = [...dr.ptr.entries()][0];
    dr.haupt = id; dr.off = { x: p.x - dr.cx, y: p.y - dr.cy };
  }
  if (!dr.ptr.size) ziehEnde(e.type === 'pointercancel');
}
window.addEventListener('pointerup', loslassen);
window.addEventListener('pointercancel', loslassen);
function ziehEnde(abbruch) {
  const dr = BK.drag;
  BK.drag = null;
  BK.schluck = true;
  document.querySelectorAll('#buch .ziel').forEach(e => e.classList.remove('ziel'));
  const ziel = abbruch ? null : zielBei(dr.cx, dr.cy, dr.art);
  if (ziel && ziel.dataset.p) {
    const r = ziel.getBoundingClientRect(), fit = v => Math.min(94, Math.max(6, v));
    if (dr.art === 'zug') dr.g.remove();
    einkleben(dr.s, +ziel.dataset.p, fit((dr.cx - r.left) / r.width * 100), fit((dr.cy - r.top) / r.height * 100), dr.r, dr.art === 'zug' ? dr.el : dr.g);
    return;
  }
  dr.g.remove();
  if (ziel && dr.art === 'zug') abloesen(dr.s, true);
  else {
    dr.el.style.visibility = '';
    dr.el.classList.remove('weg');
    sfx.tap();
  }
}
window.addEventListener('resize', () => { if (view.name === 'buch' && !BK.busy && !BK.drag && masseNeu()) zeichneBuch(); });

/* --------------------------------------------------------- Einstellungen */
let sheetOpen = null;
function openSheet(n, html) {
  sheetOpen = n;
  sheetRoot.innerHTML = `<div class="sheet-bg" data-act="close-sheet"></div><div class="sheet sheet-${n}" role="dialog" aria-modal="true">${html}</div>`;
  requestAnimationFrame(() => sheetRoot.classList.add('open'));
}
function closeSheet(now) {
  if (!sheetOpen) return;
  sheetOpen = null;
  sheetRoot.classList.remove('open');
  if (now) sheetRoot.innerHTML = ''; else setTimeout(() => { if (!sheetOpen) sheetRoot.innerHTML = ''; }, 260);
}
const sw = (key, label, sub) => `<div class="set-row"><div><div class="set-label">${label}</div>${sub ? `<div class="set-sub">${sub}</div>` : ''}</div>
  <button class="switch" role="switch" aria-checked="${!!S.settings[key]}" data-act="toggle" data-key="${key}" aria-label="${label}"><i></i></button></div>`;
const istIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function settingsHTML() {
  const p = P();
  return `<div class="sheet-head"><h2>Einstellungen</h2><button class="icon-btn" data-act="close-sheet" aria-label="Schliessen">${ICON.close}</button></div>
  <div class="sheet-body">
    <section class="set-group"><h3>Profil</h3>
      <div class="set-row"><div class="set-ich"><img src="${avatarBild(p)}" alt=""><div><div class="set-label">${esc(p.name)}</div><div class="set-sub">${p.alter} Jahre · ${p.sticker.length} Sticker · ${p.runden} Runden</div></div></div>
        <button class="btn" data-act="profil-aendern">${ICON.pencil}<span>Ändern</span></button></div>
      <div class="set-row col"><div class="set-label">Schwierigkeit</div>
        <div class="seg" role="radiogroup">${K.STUFEN.map(st => `<button role="radio" aria-checked="${p.stufe === st.n}" data-act="stufe" data-v="${st.n}">${st.name}<small>ab ${st.ab}</small></button>`).join('')}</div>
        <div class="set-sub">Passt die Aufgaben an: kleinere Auswahl und leichtere Fragen für Jüngere, schwierigere für Grössere.</div></div>
      <button class="btn" data-act="wer">${ICON.users}<span>Kind wechseln</span></button>
    </section>
    <section class="set-group"><h3>Ton</h3>
      ${sw('voice', 'Gian spricht', 'Fragen vorlesen, loben und helfen')}
      ${sw('sounds', 'Klänge')}
      <button class="btn" data-act="test-sound">${ICON.speaker}<span>Ton testen</span></button>
    </section>
    <section class="set-group"><h3>Als App</h3>
      <p class="set-note">${istIOS ? 'Auf dem iPad oder iPhone: unten bzw. oben auf «Teilen» tippen, dann «Zum Home-Bildschirm». Danach geht die Lernreise auch ohne Internet.'
        : 'Die Lernreise läuft auch ohne Internet, sobald sie einmal geladen ist. Im Browser-Menü kann man sie als App installieren.'}</p>
    </section>
    <p class="version">Lernreise · Stand ${esc(window.BUILD || 'dev')} · Bilder: OpenAI · Stimmen: ElevenLabs · Wappen: Wikimedia Commons (gemeinfrei) ·
      Karte: BFS/swisstopo (swiss-maps), Flüsse © OpenStreetMap-Mitwirkende · Europakarte: Natural Earth · Flaggen: Flagpedia (gemeinfrei) · Schriften: Nunito, Andika (SIL OFL)</p>
  </div>`;
}
const confirmHTML = (title, text, yes, act) => `<div class="sheet-head"><h2>${title}</h2></div><div class="sheet-body"><p class="confirm-text">${text}</p>
  <div class="confirm-actions"><button class="btn" data-act="close-sheet">Abbrechen</button><button class="btn danger" data-act="${act}">${yes}</button></div></div>`;

/* --------------------------------------------------------------- Effekte */
function nope(el) { if (!el || reduced()) return; el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); }
const FX_COLORS = ['#D8413A', '#FFC83A', '#2F7FC1', '#4C9A3B', '#8B5A2B'];
function burst(el, n) {
  if (!el || reduced()) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 60;
    p.className = 'spark';
    p.style.cssText = `left:${cx}px;top:${cy}px;background:${FX_COLORS[i % FX_COLORS.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
    fxRoot.appendChild(p); setTimeout(() => p.remove(), 800);
  }
}
function confetti(n) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.className = 'conf';
    p.style.cssText = `left:${Math.random() * 100}vw;background:${FX_COLORS[i % FX_COLORS.length]};--d:${1.6 + Math.random() * 1.4}s;--x:${(Math.random() - 0.5) * 160}px;--r:${Math.random() * 720}deg;animation-delay:${Math.random() * 0.5}s`;
    fxRoot.appendChild(p); setTimeout(() => p.remove(), 3600);
  }
}

/* ---------------------------------------------------------------- Tippen */
app.addEventListener('click', onClick);
sheetRoot.addEventListener('click', onClick);
sheetRoot.addEventListener('input', e => {
  if (e.target.id === 'name-in' && profilEntwurf) {
    profilEntwurf.name = e.target.value.slice(0, 20);
    const ok = document.getElementById('profil-ok');
    if (ok) ok.disabled = !profilEntwurf.name.trim();
  }
});
sheetRoot.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'name-in') { e.preventDefault(); profilSpeichern(); } });
app.addEventListener('click', e => { if (view.name === 'runde' && Q && aktuell().art === 'karte' && e.target.closest('svg.karte')) karteTipp(e); });
function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const act = b.dataset.act;
  switch (act) {
    case 'gian': {
      sfx.tap();
      const t = b.querySelector('img');
      if (t && !reduced()) { t.classList.remove('bounce'); void t.offsetWidth; t.classList.add('bounce'); }
      Ton.say(SATZ.hallo());
      break;
    }
    case 'wer': sfx.tap(); closeSheet(true); nav('wer'); sprich('wer'); break;
    case 'profil-wahl': sfx.tap(); S.aktiv = b.dataset.id; save(); nav('start'); sprich(SATZ.hallo()); break;
    case 'profil-neu': sfx.tap(); profilOeffnen(null); break;
    case 'profil-aendern': sfx.tap(); profilOeffnen(P()); break;
    case 'alter': {
      profilEntwurf.alter = +b.dataset.v; sfx.tap();
      b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('an', x === b));
      document.getElementById('stufe-note').textContent = stufeText(K.stufeVonAlter(profilEntwurf.alter));
      break;
    }
    case 'avatar': profilEntwurf.avatar = b.dataset.v; sfx.tap(); b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('an', x === b)); break;
    case 'profil-ok': sfx.tap(); profilSpeichern(); break;
    case 'profil-loeschen':
      openSheet('loeschen', confirmHTML('Profil löschen?', `Alle Sterne, Sticker und das Sammelbuch von ${esc(profilEntwurf.name)} werden gelöscht. Das lässt sich nicht rückgängig machen.`, 'Löschen', 'profil-weg'));
      break;
    case 'profil-weg': {
      S.profile = S.profile.filter(p => p.id !== profilEntwurf.id);
      if (S.aktiv === profilEntwurf.id) S.aktiv = null;
      save(); closeSheet(true); nav('wer', {}, false);
      break;
    }
    case 'start': sfx.tap(); nav('start'); break;
    case 'modul': sfx.tap(); oeffneModul(b.dataset.m); break;
    case 'zum-modul': sfx.tap(); nav('modul', { m: view.m }); break;
    case 'thema': sfx.tap(); oeffneThema(b.dataset.m, b.dataset.t); break;
    case 'zum-thema': sfx.tap(); Ton.stop(); nav('thema', { m: view.m, t: view.t }); break;
    case 'intro': { const { m, t } = mt(); sfx.tap(); Ton.say([].concat(t.intro || m.intro)); break; }
    case 'ueben': starteUebung(b.dataset.u); break;
    case 'nochmal': starteUebung(b.dataset.u); break;
    case 'entdecken': oeffneEntdecken(); break;
    case 'karte-vor': karteBlaettern(1); break;
    case 'karte-zurueck': karteBlaettern(-1); break;
    case 'karte-ton': Ton.say(E.karten[E.i].ton); break;
    case 'vorlesen': vorlesen(false); break;
    case 'hoeren': { const k = b.querySelector('.ic'); if (k && !reduced()) { k.classList.remove('bounce'); void k.offsetWidth; k.classList.add('bounce'); } Ton.say(aktuell().frage.hoeren); break; }
    case 'wahl': waehle(b.dataset.id, b); break;
    case 'teil': reiheTipp(b.dataset.id, b); break;
    case 'platz': reiheZurueck(+b.dataset.i); break;
    case 'stell': stellen(b.dataset.was, +b.dataset.d); break;
    case 'stell-fertig': stellFertig(); break;
    case 'su': {
      const z = E.zeit, d = +b.dataset.d;
      if (b.dataset.was === 'h') z.h = ((z.h - 1 + d + 12) % 12) + 1;
      else { z.m += d * 5; if (z.m >= 60) { z.m -= 60; z.h = (z.h % 12) + 1; } if (z.m < 0) { z.m += 60; z.h = ((z.h + 10) % 12) + 1; } }
      sfx.tick(); uhrSetzen(document.querySelector('#spiel-uhr svg'), z.h, z.m); spieluhrText(false);
      break;
    }
    case 'su-sag': spieluhrText(true); break;
    case 'weiter': Ton.stop(); weiter(); break;
    case 'mem': memTipp(+b.dataset.i); break;
    case 'abbrechen':
      sfx.tap();
      openSheet('quit', confirmHTML('Aufhören?', 'Diese Runde zählt dann nicht. Deine Sterne und Sticker bleiben.', 'Aufhören', 'quit-yes'));
      break;
    case 'quit-yes': { const m = view.m, t = view.t; Q = null; M = null; Ton.stop(); nav('thema', { m, t }); break; }
    case 'album': sfx.tap(); nav('album'); sprich('album'); break;
    case 'sticker': sfx.sparkle(); openSheet('sticker', stickerSheetHTML(b.dataset.id)); break;
    case 'settings': sfx.tap(); openSheet('settings', settingsHTML()); break;
    case 'close-sheet': closeSheet(); if (['start', 'thema'].includes(view.name)) render(); break;
    case 'toggle': {
      const key = b.dataset.key, val = !S.settings[key];
      S.settings[key] = val; save(); sfx.tap();
      b.setAttribute('aria-checked', String(val));
      if (!val && key === 'voice') Ton.stop();
      break;
    }
    case 'stufe': {
      P().stufe = +b.dataset.v; save(); sfx.tap();
      b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      break;
    }
    case 'test-sound': sfx.right(3); setTimeout(() => Ton.say(['hallo_02']), 350); break;
    case 'buch': sfx.tap(); oeffneBuch(); break;
    case 'buch-zu': sfx.tap(); if (BK.from === 'ergebnis' && BK.res) nav('ergebnis', { res: BK.res, m: BK.res.m, t: BK.res.t }, false); else nav(BK.from); break;
    case 'blatt': blaettern(+b.dataset.d); break;
    case 'buch-auf': blaettern(1); break;
    case 'tray-st': antippenEinkleben(b.dataset.s); break;
    case 'pst': sfx.tap(); waehleSt(BK.sel === b.dataset.s ? null : b.dataset.s); break;
    case 'st-rot': drehen(+b.dataset.d); break;
    case 'st-weg': if (BK.sel != null) abloesen(BK.sel); break;
  }
}
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target && e.target.tagName === 'INPUT') return;
  if (e.key === 'Escape' && sheetOpen) { closeSheet(); e.preventDefault(); return; }
  if (sheetOpen) return;
  if (view.name === 'buch') {
    if (e.key === 'ArrowRight') { blaettern(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { blaettern(-1); e.preventDefault(); }
    else if (e.key === 'Escape') waehleSt(null);
    else if ((e.key === 'Delete' || e.key === 'Backspace') && BK.sel != null) { abloesen(BK.sel); e.preventDefault(); }
    return;
  }
  if (view.name === 'entdecken') {
    if (e.key === 'ArrowRight') karteBlaettern(1);
    if (e.key === 'ArrowLeft') karteBlaettern(-1);
    return;
  }
  if (view.name === 'runde' && Q) {
    if (e.key === 'Enter' && document.getElementById('weiter-btn')) { e.preventDefault(); Ton.stop(); weiter(); return; }
    const a = aktuell(), n = +e.key;
    if (a.art === 'wahl' && n >= 1 && n <= a.optionen.length) {           // Antwort mit den Zifferntasten
      const btn = document.querySelectorAll('#antwort .opt')[n - 1];
      if (btn && !btn.disabled) waehle(btn.dataset.id, btn);
    }
  }
});
/* Kein Zoomen mit zwei Fingern (wie Wörtli-Frosch, 2026-10-31); Ziehen und Drehen im Sammelbuch gehen weiter */
['gesturestart', 'gesturechange'].forEach(ev => document.addEventListener(ev, e => e.preventDefault(), { passive: false }));

/* Für die Browser-Tests (Scripts/browser.mjs): den Stand ansehen, ohne etwas zu ändern */
window.LR_TEST = () => ({ view: view.name, aufgabe: Q && aktuell(), nr: Q && Q.i, stellen: Q && Q.stellen, memory: M && M.karten.map(k => k.pid), profil: P() });
window.LR_STARTE = (m, t, u) => { Q = null; M = null; view = { name: 'thema', m, t }; if (u) starteUebung(u); else render(); };

/* ================================================================== Start */
if (!P()) view = { name: 'wer' };
try { history.replaceState({ name: view.name }, ''); } catch (e) { /* file:// */ }
render();
if (!S.profile.length) setTimeout(() => profilOeffnen(null), 400);
['figur_denkt', 'figur_jubel', 'figur_mut'].forEach(n => { new Image().src = img(n); });

if ('serviceWorker' in navigator && window.BUILD !== 'dev' && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    if (['runde', 'ergebnis', 'memory', 'buch'].includes(view.name)) reloadPending = true; else location.reload();
  });
}
})();
