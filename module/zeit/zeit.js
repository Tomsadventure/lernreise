/* Modul «Uhr und Kalender»: die Uhr lesen und stellen, Digitaluhr, Zeitspannen; Wochentage, Monate, Jahreszeiten.
   Uhrzeiten wie in der Schweizer Schule auf Hochdeutsch («Viertel nach drei», «fünf vor halb vier», «zwanzig nach drei»).
   Jahreszeiten nach Monaten: Frühling = März–Mai, Sommer = Juni–August, Herbst = September–November, Winter = Dezember–Februar.
   Nur Daten und Aufgaben – die Uhr zeichnet app.js. Töne: zeit_*, zt_<h>_<m> (Uhrzeiten), tag_*, monat_*, jz_*, kal_*, mi_*. */
(function () {
  'use strict';
  const K = window.Kern;
  const STUNDE = ['zwölf', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];
  const h12 = h => ((h % 12) + 12) % 12 || 12;
  /* Uhrzeit in Worten (h beliebig, m in 5er-Schritten) */
  function zeitText(h, m) {
    const n = STUNDE[h12(h)], n1 = STUNDE[h12(h + 1)];
    return {
      0: h12(h) === 1 ? 'ein Uhr' : `${n} Uhr`, 5: `fünf nach ${n}`, 10: `zehn nach ${n}`, 15: `Viertel nach ${n}`, 20: `zwanzig nach ${n}`,
      25: `fünf vor halb ${n1}`, 30: `halb ${n1}`, 35: `fünf nach halb ${n1}`, 40: `zwanzig vor ${n1}`, 45: `Viertel vor ${n1}`,
      50: `zehn vor ${n1}`, 55: `fünf vor ${n1}`,
    }[m];
  }
  const gross = t => t[0].toUpperCase() + t.slice(1);
  const zeitTon = (h, m) => `zt_${h12(h)}_${m}`;
  const digital = (h, m, nullen = false) => `${nullen ? String(h).padStart(2, '0') : h}:${String(m).padStart(2, '0')}`;
  const TAGESZEIT = h => (h < 5 ? 'in der Nacht' : h < 11 ? 'am Morgen' : h < 14 ? 'am Mittag' : h < 18 ? 'am Nachmittag' : h < 22 ? 'am Abend' : 'in der Nacht');
  const LAENGE = [8, 10, 12];
  const WAHL = [3, 4, 4];
  /* Minuten je Stufe: 1 = volle und halbe Stunden (ab und zu Viertel), 2 = 5-Minuten-Schritte, 3 = jede Minute */
  function zeitFuer(s, R) {
    const h = R.zahl(1, 12);
    if (s === 1) return { h, m: R.ja(0.3) ? R.wahl([15, 45]) : R.wahl([0, 30]) };
    if (s === 2) return { h, m: 5 * R.zahl(0, 11) };
    return { h, m: R.zahl(0, 59) };
  }
  /* Typische Verwechslungen: Zeiger vertauscht, eine Stunde daneben, halb/Viertel verwechselt */
  function aehnlich({ h, m }, s) {
    const out = [{ h: h + 1, m }, { h: h - 1, m }, { h, m: (m + 30) % 60 }, { h, m: (60 - m) % 60 }];
    if (s === 1) out.push({ h, m: m === 0 ? 30 : 0 }, { h: h + 1, m: m === 30 ? 0 : 30 });
    else if (s === 2) out.push({ h, m: (m + 5) % 60 }, { h, m: (m + 55) % 60 }, { h: h + 1, m: (m + 30) % 60 });
    else out.push({ h, m: (m + 1) % 60 }, { h, m: (m + 59) % 60 }, { h, m: (m + 10) % 60 }, { h: h + 1, m: (m + 5) % 60 });
    return out.map(z => ({ h: h12(z.h), m: z.m }));
  }
  const zid = z => `${h12(z.h)}:${z.m}`;

  /* ------------------------------------------------------------ Uhr */
  const uhrLesen = (s, R) => Array.from({ length: LAENGE[s - 1] }, () => {
    const z = zeitFuer(s, R);
    if (s < 3) {
      return K.wahl({
        frage: { text: 'Wie spät ist es?', ton: ['zeit_wie_spaet'], uhr: z },
        richtig: z, pool: [], andere: aehnlich(z, s), n: WAHL[s - 1], R, id: zid, zeige: x => ({ text: gross(zeitText(x.h, x.m)) }),
        loesung: { text: `Es ist ${zeitText(z.h, z.m)}.`, ton: ['zeit_es_ist', zeitTon(z.h, z.m)] },
      });
    }
    return K.wahl({
      frage: { text: 'Wie spät ist es? Schau genau auf den langen Zeiger.', ton: ['zeit_wie_spaet'], uhr: z },
      richtig: z, pool: [], andere: aehnlich(z, s), n: 4, R, id: zid, zeige: x => ({ digital: digital(x.h, x.m) }), spalten: 2,
      loesung: { text: `Es ist ${digital(z.h, z.m)}.`, ton: [] },
    });
  });
  const uhrStellen = (s, R) => Array.from({ length: [6, 8, 8][s - 1] }, () => {
    const z = zeitFuer(s, R);
    if (s < 3) {
      return { art: 'uhr', ziel: z, schritt: 5, frage: { text: `Stell die Uhr auf ${zeitText(z.h, z.m)}.`, ton: ['zeit_stell', zeitTon(z.h, z.m)] },
        loesung: { text: `So zeigt die Uhr ${zeitText(z.h, z.m)}.`, ton: ['zeit_es_ist', zeitTon(z.h, z.m)] } };
    }
    const h24 = R.ja(0.5) ? z.h % 12 + 12 : z.h;
    return { art: 'uhr', ziel: z, schritt: 1, frage: { text: `Stell die Uhr auf ${digital(h24, z.m, true)}.`, ton: ['zeit_stell'], digital: digital(h24, z.m, true) },
      loesung: { text: `So zeigt die Uhr ${digital(h24, z.m, true)}.`, ton: [] } };
  });
  /* Digitaluhr: Stufe 2 mit 12 Stunden, Stufe 3 mit 24 Stunden und Tageszeit */
  const digitaluhr = (s, R) => Array.from({ length: LAENGE[s - 1] }, () => {
    const z = s === 2 ? zeitFuer(2, R) : { h: R.zahl(0, 23), m: 5 * R.zahl(0, 11) };
    if (s < 3) {
      return K.wahl({
        frage: { text: 'Welche Digitaluhr zeigt die gleiche Zeit?', ton: ['zeit_digital'], uhr: z },
        richtig: z, pool: [], andere: aehnlich(z, 2), n: 4, R, id: zid, zeige: x => ({ digital: digital(x.h, x.m) }), spalten: 2,
        loesung: { text: `Es ist ${zeitText(z.h, z.m)}, also ${digital(z.h, z.m)}.`, ton: ['zeit_es_ist', zeitTon(z.h, z.m)] },
      });
    }
    const falsch = [{ h: (z.h + 12) % 24, m: z.m }, { h: (z.h + 1) % 24, m: z.m }, { h: (z.h + 23) % 24, m: z.m }, { h: z.h, m: (z.m + 30) % 60 }, { h: (z.h + 13) % 24, m: z.m }];
    return K.wahl({
      frage: { text: `Es ist ${TAGESZEIT(z.h)}. Wie zeigt die Digitaluhr diese Zeit?`, ton: ['zeit_digital24'], uhr: z, tageszeit: TAGESZEIT(z.h) },
      richtig: z, pool: [], andere: falsch, n: 4, R, id: x => `${x.h}:${x.m}`, zeige: x => ({ digital: digital(x.h, x.m, true) }), spalten: 2,
      loesung: { text: `${gross(TAGESZEIT(z.h))} ist es ${digital(z.h, z.m, true)}.`, ton: [] },
    });
  });
  /* Zeitspannen (Stufe 3): Wann ist es fertig? Wie lange dauert es? Nur Text, ohne Vorlesen. */
  const DAUER = [15, 20, 25, 30, 40, 45, 50, 75, 90, 105];
  const dauerText = d => (d < 60 ? `${d} Minuten` : d % 60 ? `1 Stunde und ${d % 60} Minuten` : '1 Stunde');
  const SATZ = [
    ['Der Film beginnt um {a} und dauert {d}. Wann ist er fertig?'],
    ['Das Fussballtraining beginnt um {a} und dauert {d}. Wann ist es fertig?'],
    ['Der Zug fährt um {a} ab. Die Fahrt dauert {d}. Wann kommt er an?'],
    ['Mungg geht um {a} los und wandert {d}. Wann ist er auf dem Gipfel?'],
  ];
  const plus = (h, m, d) => { const t = (h * 60 + m + d) % 1440; return { h: Math.floor(t / 60), m: t % 60 }; };
  const zeitspannen = (s, R) => Array.from({ length: 10 }, (_, i) => {
    const a = { h: R.zahl(7, 18), m: 5 * R.zahl(0, 11) }, d = R.wahl(DAUER), e = plus(a.h, a.m, d);
    if (i % 3 === 2) {                                 // wie lange?
      const pool = DAUER.filter(x => x !== d).map(x => ({ d: x }));
      return K.wahl({
        frage: { text: `Von ${digital(a.h, a.m, true)} bis ${digital(e.h, e.m, true)}: Wie lange ist das?`, ton: [] },
        richtig: { d }, pool, andere: [{ d: d + 10 }, { d: d - 10 }, { d: d + 60 }].filter(x => x.d > 0 && x.d < 120),
        n: 4, R, id: x => x.d, zeige: x => ({ text: dauerText(x.d) }), spalten: 2,
        loesung: { text: `Das sind ${dauerText(d)}.`, ton: [] },
      });
    }
    const falsch = [plus(e.h, e.m, 10), plus(e.h, e.m, -10), plus(e.h, e.m, 60), plus(e.h, e.m, -60)];
    return K.wahl({
      frage: { text: R.wahl(SATZ)[0].replace('{a}', digital(a.h, a.m, true)).replace('{d}', dauerText(d)), ton: [] },
      richtig: e, pool: [], andere: falsch, n: 4, R, id: x => `${x.h}:${x.m}`, zeige: x => ({ digital: digital(x.h, x.m, true) }), spalten: 2,
      loesung: { text: `${digital(a.h, a.m, true)} und ${dauerText(d)} gibt ${digital(e.h, e.m, true)}.`, ton: [] },
    });
  });
  function uhrMemory(s, R) {
    const gesehen = new Set(), out = [];
    while (out.length < [6, 8, 8][s - 1]) {
      const z = zeitFuer(s === 1 ? 1 : 2, R), k = zid(z);
      if (gesehen.has(k)) continue;
      gesehen.add(k);
      out.push(s < 3 ? { id: k, a: { uhr: z }, b: { text: gross(zeitText(z.h, z.m)), ton: zeitTon(z.h, z.m) } }
        : { id: k, a: { uhr: z }, b: { digital: digital(z.h, z.m) } });
    }
    return out;
  }

  /* ------------------------------------------------------------ Kalender */
  const TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const MBILD = ['januar', 'februar', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
  const TAGE_IM_MONAT = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const JZ = [['fruehling', 'Frühling', [3, 4, 5]], ['sommer', 'Sommer', [6, 7, 8]], ['herbst', 'Herbst', [9, 10, 11]], ['winter', 'Winter', [12, 1, 2]]];
  const jzVon = mo => JZ.find(j => j[2].includes(mo));
  const tagObj = i => ({ id: `t${i}`, i, text: TAGE[i] });
  const monatObj = i => ({ id: `m${i}`, i, text: MONATE[i] });
  const TAG_OBJ = TAGE.map((_, i) => tagObj(i)), MONAT_OBJ = MONATE.map((_, i) => monatObj(i));
  const um = (i, d, n) => ((i + d) % n + n) % n;

  function wochentage(s, R) {
    const arten = s === 1 ? ['nach'] : s === 2 ? ['nach', 'vor'] : ['morgen', 'uebermorgen', 'gestern', 'vor'];
    return Array.from({ length: LAENGE[s - 1] }, () => {
      const i = R.zahl(0, 6), art = R.wahl(arten);
      const d = { nach: 1, vor: -1, morgen: 1, uebermorgen: 2, gestern: -1 }[art], r = um(i, d, 7);
      const frage = {
        nach: { text: `Welcher Tag kommt nach ${TAGE[i]}?`, ton: ['kal_nach_tag', `tag_${i}`] },
        vor: { text: `Welcher Tag kommt vor ${TAGE[i]}?`, ton: ['kal_vor_tag', `tag_${i}`] },
        morgen: { text: `Heute ist ${TAGE[i]}. Welcher Tag ist morgen?`, ton: ['kal_heute_ist', `tag_${i}`, 'kal_morgen'] },
        uebermorgen: { text: `Heute ist ${TAGE[i]}. Welcher Tag ist übermorgen?`, ton: ['kal_heute_ist', `tag_${i}`, 'kal_uebermorgen'] },
        gestern: { text: `Heute ist ${TAGE[i]}. Welcher Tag war gestern?`, ton: ['kal_heute_ist', `tag_${i}`, 'kal_gestern'] },
      }[art];
      return K.wahl({
        frage: Object.assign(frage, { woche: i }), richtig: TAG_OBJ[r], pool: TAG_OBJ, n: WAHL[s - 1], R, zeige: x => ({ text: x.text }),
        andere: [TAG_OBJ[um(r, 1, 7)], TAG_OBJ[um(r, -2, 7)], TAG_OBJ[um(r, 2, 7)]].filter(x => x.i !== i),
        passt: x => x.i !== i, loesung: { text: `Richtig ist ${TAGE[r]}.`, ton: ['richtig_ist', `tag_${r}`] },
      });
    });
  }
  function monate(s, R) {
    const arten = s === 1 ? ['nach'] : s === 2 ? ['nach', 'vor'] : ['nach', 'vor', 'wievielte', 'drei'];
    return Array.from({ length: LAENGE[s - 1] }, () => {
      const i = R.zahl(0, 11), art = R.wahl(arten);
      if (art === 'wievielte') {
        const zahlen = MONATE.map((_, k) => ({ id: `n${k}`, k }));
        return K.wahl({
          frage: { text: `Der wievielte Monat im Jahr ist der ${MONATE[i]}?`, ton: ['kal_wievielte', `monat_${i}`] },
          richtig: zahlen[i], pool: zahlen, andere: [zahlen[um(i, 1, 12)], zahlen[um(i, -1, 12)], zahlen[um(i, 2, 12)]], n: 4, R,
          zeige: x => ({ text: `der ${x.k + 1}.` }), spalten: 2, loesung: { text: `Der ${MONATE[i]} ist der ${i + 1}. Monat.`, ton: [] },
        });
      }
      const d = { nach: 1, vor: -1, drei: 3 }[art], r = um(i, d, 12);
      const frage = {
        nach: { text: `Welcher Monat kommt nach ${MONATE[i]}?`, ton: ['kal_nach_monat', `monat_${i}`] },
        vor: { text: `Welcher Monat kommt vor ${MONATE[i]}?`, ton: ['kal_vor_monat', `monat_${i}`] },
        drei: { text: `Welcher Monat ist drei Monate nach ${MONATE[i]}?`, ton: [] },
      }[art];
      return K.wahl({
        frage, richtig: MONAT_OBJ[r], pool: MONAT_OBJ, n: WAHL[s - 1], R, zeige: x => ({ text: x.text }),
        andere: [MONAT_OBJ[um(r, 1, 12)], MONAT_OBJ[um(r, -2, 12)], MONAT_OBJ[um(r, 2, 12)]].filter(x => x.i !== i),
        passt: x => x.i !== i, loesung: { text: `Richtig ist ${MONATE[r]}.`, ton: ['richtig_ist', `monat_${r}`] },
      });
    });
  }
  /* In die richtige Reihenfolge tippen (ohne Umbruch über das Wochen- bzw. Jahresende) */
  const reiheTage = (s, R) => Array.from({ length: [4, 5, 4][s - 1] }, () => {
    const n = [4, 5, 7][s - 1], a = R.zahl(0, 7 - n), teile = TAG_OBJ.slice(a, a + n);
    return { art: 'reihe', frage: { text: 'Bring die Wochentage in die richtige Reihenfolge!', ton: ['kal_reihe_tage'] },
      teile: R.mischen(teile).map(x => ({ id: x.id, text: x.text })), reihenfolge: teile.map(x => x.id),
      loesung: { text: teile.map(x => x.text).join(', '), ton: teile.map(x => `tag_${x.i}`) } };
  });
  const reiheMonate = (s, R) => Array.from({ length: [4, 4, 3][s - 1] }, () => {
    const n = [4, 6, 12][s - 1], a = R.zahl(0, 12 - n), teile = MONAT_OBJ.slice(a, a + n);
    return { art: 'reihe', frage: { text: 'Bring die Monate in die richtige Reihenfolge!', ton: ['kal_reihe_monate'] },
      teile: R.mischen(teile).map(x => ({ id: x.id, text: x.text })), reihenfolge: teile.map(x => x.id),
      loesung: { text: teile.map(x => x.text).join(', '), ton: teile.map(x => `monat_${x.i}`) } };
  });
  const JZ_OBJ = JZ.map(([id, text]) => ({ id, text }));
  const jahreszeiten = (s, R) => R.reihe(MONAT_OBJ, LAENGE[s - 1]).map(mo => {
    const j = jzVon(mo.i + 1);
    return K.wahl({
      frage: { text: `Zu welcher Jahreszeit gehört der ${mo.text}?`, ton: ['kal_jahreszeit', `monat_${mo.i}`], bild: s === 1 ? `m_${MBILD[mo.i]}` : undefined },
      richtig: JZ_OBJ.find(x => x.id === j[0]), pool: JZ_OBJ, n: 4, R, zeige: x => ({ bild: `j_${x.id}`, text: x.text }), spalten: 2,
      loesung: { text: `Der ${mo.text} gehört zum ${j[1]}.`, ton: ['richtig_ist', `jz_${j[0]}`] },
    });
  });
  const TAGE_OPT = [{ id: '28', text: '28 oder 29' }, { id: '30', text: '30' }, { id: '31', text: '31' }];
  const tageImMonat = (s, R) => R.reihe(MONAT_OBJ, LAENGE[s - 1]).map(mo => K.wahl({
    frage: { text: `Wie viele Tage hat der ${mo.text}?`, ton: ['kal_tage', `monat_${mo.i}`], bild: `m_${MBILD[mo.i]}`, klein: true },
    richtig: TAGE_OPT.find(x => x.id === String(TAGE_IM_MONAT[mo.i])), pool: TAGE_OPT, n: 3, R, zeige: x => ({ text: x.text }), spalten: 3,
    loesung: { text: `Der ${mo.text} hat ${mo.i === 1 ? '28 Tage, im Schaltjahr 29' : `${TAGE_IM_MONAT[mo.i]} Tage`}.`, ton: [`mi_${mo.i}`] },
  }));
  const monateMemory = (s, R) => R.ziehen(MONAT_OBJ, [6, 8, 10][s - 1]).map(mo => ({ id: mo.id, a: { bild: `m_${MBILD[mo.i]}` }, b: { text: mo.text, ton: `monat_${mo.i}` } }));

  const kalenderKarten = () => [
    { titel: 'Die Woche', text: 'Eine Woche hat sieben Tage. Am Samstag und Sonntag ist Wochenende.', liste: TAGE, ton: [...TAGE.map((_, i) => `tag_${i}`), { pause: 300 }, 'kal_info_woche'] },
    ...JZ.map(([id, text, mo]) => ({ titel: text, bild: `j_${id}`, text: `Zum ${text} gehören ${mo.map(x => MONATE[x - 1]).join(', ').replace(/, ([^,]*)$/, ' und $1')}.`, ton: [`jz_${id}`, { pause: 250 }, `kal_info_${id}`] })),
    ...MONATE.map((mo, i) => ({ titel: mo, bild: `m_${MBILD[i]}`, zeilen: [['Monat', `der ${i + 1}. im Jahr`], ['Tage', i === 1 ? '28, im Schaltjahr 29' : String(TAGE_IM_MONAT[i])], ['Jahreszeit', jzVon(i + 1)[1]]],
      ton: [`monat_${i}`, { pause: 250 }, `mi_${i}`] })),
  ];

  /* ------------------------------------------------------------ Töne */
  const ORDINAL = ['erste', 'zweite', 'dritte', 'vierte', 'fünfte', 'sechste', 'siebte', 'achte', 'neunte', 'zehnte', 'elfte', 'zwölfte'];
  const toene = [
    ['zeit_intro', 'mungg', '[excited] Tick, tack! Hier lernst du die Uhr, die Wochentage und die Monate.'],
    ['zeit_uhr_intro', 'mungg', 'Kannst du die Uhr lesen? Der kurze Zeiger zeigt die Stunde, der lange Zeiger die Minuten.'],
    ['zeit_kal_intro', 'mungg', 'Ein Jahr hat zwölf Monate und vier Jahreszeiten. Und eine Woche hat sieben Tage.'],
    ['zeit_spieluhr', 'mungg', 'Das ist meine Spiel-Uhr. Dreh die Zeiger, dann sage ich dir, wie spät es ist.'],
    ['zeit_wie_spaet', 'mungg', 'Wie spät ist es?'],
    ['zeit_es_ist', 'mungg', 'Es ist …'],
    ['zeit_stell', 'mungg', 'Stell die Uhr auf …'],
    ['zeit_digital', 'mungg', 'Welche Digitaluhr zeigt die gleiche Zeit?'],
    ['zeit_digital24', 'mungg', 'Wie zeigt die Digitaluhr diese Zeit?'],
    ['kal_nach_tag', 'mungg', 'Welcher Tag kommt nach …'],
    ['kal_vor_tag', 'mungg', 'Welcher Tag kommt vor …'],
    ['kal_heute_ist', 'mungg', 'Heute ist …'],
    ['kal_morgen', 'mungg', 'Welcher Tag ist morgen?'],
    ['kal_uebermorgen', 'mungg', 'Welcher Tag ist übermorgen?'],
    ['kal_gestern', 'mungg', 'Welcher Tag war gestern?'],
    ['kal_nach_monat', 'mungg', 'Welcher Monat kommt nach …'],
    ['kal_vor_monat', 'mungg', 'Welcher Monat kommt vor …'],
    ['kal_wievielte', 'mungg', 'Der wievielte Monat im Jahr ist der …'],
    ['kal_jahreszeit', 'mungg', 'Zu welcher Jahreszeit gehört der …'],
    ['kal_tage', 'mungg', 'Wie viele Tage hat der …'],
    ['kal_reihe_tage', 'mungg', 'Bring die Wochentage in die richtige Reihenfolge!'],
    ['kal_reihe_monate', 'mungg', 'Bring die Monate in die richtige Reihenfolge!'],
    ['kal_info_woche', 'mungg', 'Eine Woche hat sieben Tage. Am Samstag und Sonntag ist Wochenende.'],
    ...JZ.map(([id, text, mo]) => [`kal_info_${id}`, 'mungg', `Zum ${text} gehören ${mo.map(x => MONATE[x - 1]).join(', ').replace(/, ([^,]*)$/, ' und $1')}.`]),
    ...TAGE.map((t, i) => [`tag_${i}`, 'mungg', `${t}.`]),
    ...MONATE.map((t, i) => [`monat_${i}`, 'mungg', `${t}.`]),
    ...JZ.map(([id, text]) => [`jz_${id}`, 'mungg', `${text}.`]),
    ...MONATE.map((t, i) => [`mi_${i}`, 'mungg', `Der ${t} ist der ${ORDINAL[i]} Monat. Er hat ${i === 1 ? 'achtundzwanzig Tage, im Schaltjahr neunundzwanzig' : TAGE_IM_MONAT[i] === 31 ? 'einunddreißig Tage' : 'dreißig Tage'} und gehört zum ${jzVon(i + 1)[1]}.`]),
  ];
  for (let h = 1; h <= 12; h++) for (let m = 0; m < 60; m += 5) toene.push([zeitTon(h, m), 'mungg', `${gross(zeitText(h, m))}.`]);

  K.modul({
    id: 'zeit', titel: 'Uhr und Kalender', untertitel: 'Uhrzeit, Wochentage und Monate', farbe: '#2F7FC1',
    banner: 'banner_uhr', figur: 'mungg_uhr', intro: 'zeit_intro',
    themen: [
      {
        id: 'uhr', titel: 'Die Uhr', untertitel: 'Uhr lesen und stellen', farbe: '#2F7FC1', banner: 'banner_uhr', figur: 'mungg_uhr',
        intro: 'zeit_uhr_intro', entdecken: 'uhr',
        uebungen: [
          { id: 'lesen', titel: 'Uhr lesen', text: 'Wie spät ist es?', ab: 1, icon: 'uhr', runde: uhrLesen },
          { id: 'stellen', titel: 'Uhr stellen', text: 'Dreh die Zeiger richtig', ab: 1, icon: 'zeiger', runde: uhrStellen },
          { id: 'memory', titel: 'Uhren-Memory', text: 'Finde Uhr und Uhrzeit', ab: 1, icon: 'memory', paare: uhrMemory },
          { id: 'digital', titel: 'Digitaluhr', text: 'Zeiger und Ziffern', ab: 2, icon: 'digital', runde: digitaluhr },
          { id: 'spannen', titel: 'Wie lange dauert es?', text: 'Rechnen mit der Zeit', ab: 3, icon: 'sanduhr', runde: zeitspannen },
        ],
        sticker: [['st_wecker', 'Der Wecker'], ['st_uhrmacher', 'Der Uhrmacher'], ['st_turmuhr', 'Die Turmuhr'], ['st_sanduhr', 'Die Sanduhr']],
      },
      {
        id: 'kalender', titel: 'Tage und Monate', untertitel: 'Woche, Monate und Jahreszeiten', farbe: '#E08A1E', banner: 'banner_kalender', figur: 'mungg_buch',
        intro: 'zeit_kal_intro', karten: kalenderKarten,
        uebungen: [
          { id: 'tage', titel: 'Wochentage', text: 'Welcher Tag kommt danach?', ab: 1, icon: 'kalender', runde: wochentage },
          { id: 'tage_reihe', titel: 'Tage ordnen', text: 'Montag, Dienstag …', ab: 1, icon: 'reihe', runde: reiheTage },
          { id: 'monate', titel: 'Monate', text: 'Welcher Monat kommt danach?', ab: 1, icon: 'kalender', runde: monate },
          { id: 'monate_reihe', titel: 'Monate ordnen', text: 'Januar, Februar …', ab: 1, icon: 'reihe', runde: reiheMonate },
          { id: 'jahreszeiten', titel: 'Jahreszeiten', text: 'Frühling, Sommer, Herbst, Winter', ab: 1, icon: 'blatt', runde: jahreszeiten },
          { id: 'memory', titel: 'Monate-Memory', text: 'Finde Bild und Monat', ab: 1, icon: 'memory', paare: monateMemory },
          { id: 'tage_monat', titel: 'Wie viele Tage?', text: '30 oder 31?', ab: 2, icon: 'faust', runde: tageImMonat },
        ],
        sticker: [['st_geburtstag', 'Geburtstag'], ['st_schneemann', 'Der Schneemann'], ['st_drachen', 'Drachen steigen lassen'], ['st_regenbogen', 'Der Regenbogen']],
      },
    ],
    toene,
    daten: { zeitText, zeitTon, digital, h12, TAGE, MONATE },
  });
})();
