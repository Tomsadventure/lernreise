/* Die Lernreise ist umgezogen (2026-11-10): von tomsadventure.github.io/lernreise nach lernreise.tomsadventure.ch.
   Diese Seite liegt statt der App auf GitHub Pages (Quelle: Lernreise/umzug/, gebaut mit bauen.py --umzug). Sie nimmt den
   Fortschritt mit, der im Speicher der alten Adresse liegt (localStorage «lernreise.v1»):
   - im Browser: gleich weiter zur neuen Adresse, der Fortschritt im #-Teil (der geht nie an einen Server) – die neue App
     übernimmt ihn (app.js → umzugUebernehmen) und entfernt den #-Teil wieder;
   - im App-Symbol auf dem Home-Bildschirm (eigener Speicher, iPad): Anleitung und «Fortschritt kopieren» zum Einsetzen von Hand;
   - ohne Fortschritt: einfach weiter zur neuen Adresse. */
(() => {
  'use strict';
  const ziel = document.querySelector('meta[name=lernreise-ziel]').content;
  // Alten Offline-Speicher wegräumen (der neue sw.js daneben lässt sowieso alles durch)
  try { navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {}); } catch (e) { /* kein SW */ }
  try { caches.keys().then(ks => ks.forEach(k => { if (k.startsWith('lernreise-')) caches.delete(k); })).catch(() => {}); } catch (e) { /* kein Cache */ }

  let roh = null, d = null;
  try { roh = localStorage.getItem('lernreise.v1'); d = JSON.parse(roh || 'null'); } catch (e) { d = null; }
  if (!d || !Array.isArray(d.profile) || !d.profile.length) { location.replace(ziel); return; }

  const b = new TextEncoder().encode(roh);
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  const link = ziel + '#umzug=LR1.' + btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const homescreen = navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  if (!homescreen) { location.replace(link); return; }

  document.getElementById('weiter').href = link;
  document.getElementById('umzug').hidden = false;
  const knopf = document.getElementById('kopieren'), feld = document.getElementById('text');
  knopf.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(link);
      knopf.textContent = 'Kopiert!';
      knopf.classList.add('ok');
    } catch (e) {
      // Ohne Zwischenablage: den Text zeigen, zum Markieren und Kopieren von Hand
      feld.value = link;
      feld.hidden = false;
      feld.focus();
      feld.select();
    }
  });
})();
