/* Lernreise – der Kern ohne Bildschirm: Module anmelden, Zufall, Auswahl-Aufgaben bauen, Sterne, Stufen, Sticker.
   Läuft im Browser und in Node (Scripts/test.mjs prüft damit alle Module).

   Ein Modul meldet sich mit Kern.modul({...}) an (siehe Docs/App.md → «Ein neues Modul»):
     id, titel, untertitel, farbe, banner, figur, intro (Ton), themen: [Thema], toene: [[Name, Rolle, Text], …]
   Thema: id, titel, untertitel, farbe, banner, figur, freund?, intro?, karten() | entdecken: 'uhr', uebungen: [Übung], sticker: [[id, Titel]]
   Übung: id, titel, text, ab (1–3), icon, und entweder runde(stufe, R) -> [Aufgabe] oder paare(stufe, R) -> [Paar] (Memory)
   Aufgabe: { art: 'wahl' | 'karte' | 'reihe' | 'uhr', frage: {text, ton, …Inhalt}, … } – gezeichnet wird sie in app.js. */
(function (root) {
  'use strict';
  const MODULE = [];
  const modul = m => { MODULE.push(m); return m; };

  /* Zufall – ohne Startwert Math.random, mit Startwert wiederholbar (für die Tests) */
  function zufall(seed) {
    let s = (seed || 0) >>> 0;
    const next = seed == null ? Math.random : () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const R = {
      zahl: (a, b) => a + Math.floor(next() * (b - a + 1)),             // ganze Zahl von a bis b
      wahl: arr => arr[Math.floor(next() * arr.length)],
      ja: p => next() < p,
      mischen(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
      },
      ziehen: (arr, n) => R.mischen(arr).slice(0, n),
      /* n Stück aus arr; reicht arr nicht, wird neu gemischt angehängt (nie zweimal dasselbe hintereinander) */
      reihe(arr, n) {
        const out = [];
        while (out.length < n) {
          let neu = R.mischen(arr);
          if (out.length && neu[0] === out[out.length - 1] && neu.length > 1) neu = neu.slice(1).concat(neu[0]);
          out.push(...neu);
        }
        return out.slice(0, n);
      },
    };
    return R;
  }

  /* Eine Auswahl-Aufgabe: die richtige Sache und (n-1) andere aus pool, gemischt.
     id(x) = Schlüssel (gleich = dieselbe Antwort), zeige(x) = wie die Antwort aussieht ({text}, {bild}, {wappen} …),
     andere = bevorzugte falsche Antworten (z. B. Nachbarn, ähnliche Uhrzeiten), passt(x) = darf diese mit in die Auswahl? */
  function wahl({ frage, richtig, pool, n, R, zeige, id = x => x.id, andere = [], passt = () => true, loesung, spalten, nachher }) {
    const rid = id(richtig), gesehen = new Set([rid]), texte = new Set([JSON.stringify(zeige(richtig))]);
    const falsch = [];
    for (const x of [...R.mischen(andere), ...R.mischen(pool)]) {
      if (falsch.length >= n - 1) break;
      const k = id(x), t = JSON.stringify(zeige(x));
      if (gesehen.has(k) || texte.has(t) || !passt(x)) continue;
      gesehen.add(k); texte.add(t); falsch.push(x);
    }
    const optionen = R.mischen([richtig, ...falsch]).map(x => Object.assign({ id: String(id(x)) }, zeige(x)));
    return { art: 'wahl', frage, optionen, richtig: String(rid), loesung, spalten, nachher };
  }

  /* Sterne: 3 = alles beim ersten Mal richtig, 2 = ab 80 %, 1 = ab 50 % (wie beim Rechentiger) */
  const sterne = (erst, total) => { const q = total ? erst / total : 0; return q >= 1 ? 3 : q >= 0.8 ? 2 : q >= 0.5 ? 1 : 0; };

  /* Drei Stufen für die Kinder (7, 9, 11). Das Alter im Profil bestimmt die Stufe; man kann sie ändern. */
  const STUFEN = [
    { n: 1, name: 'Entdecker', ab: 7, text: 'für 7- und 8-Jährige' },
    { n: 2, name: 'Forscher', ab: 9, text: 'für 9- und 10-Jährige' },
    { n: 3, name: 'Profi', ab: 11, text: 'ab 11 Jahren' },
  ];
  const stufeVonAlter = a => (a >= 11 ? 3 : a >= 9 ? 2 : 1);

  /* Alle Sticker eines Themas / Moduls / der App */
  const stickerVon = thema => (thema.sticker || []).map(s => s[0]);
  const alleSticker = () => MODULE.flatMap(m => m.themen.flatMap(t => (t.sticker || []).map(([id, titel]) => ({ id, titel, modul: m.id, thema: t.id }))));
  /* Neuer Sticker nach einer Runde: zuerst aus dem Thema, sonst aus dem Modul, sonst aus der ganzen App; null = alle schon da */
  function neuerSticker(modul, thema, haben, R) {
    const frei = ids => ids.filter(s => !haben.includes(s));
    for (const pool of [stickerVon(thema), modul.themen.flatMap(stickerVon), alleSticker().map(s => s.id)]) {
      const f = frei(pool);
      if (f.length) return R.wahl(f);
    }
    return null;
  }

  const finde = (mid, tid, uid) => {
    const m = MODULE.find(x => x.id === mid), t = m && m.themen.find(x => x.id === tid), u = t && uid && t.uebungen.find(x => x.id === uid);
    return { m, t, u };
  };

  root.Kern = { MODULE, modul, zufall, wahl, sterne, STUFEN, stufeVonAlter, neuerSticker, alleSticker, finde };
})(typeof window !== 'undefined' ? window : globalThis);
