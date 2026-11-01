/* Modul «Schweiz»: die 26 Kantone mit Wappen, Hauptort, Autokennzeichen, Sprachen und Lage auf der Karte.
   Wappen: Wikimedia Commons («Wappen … matt.svg», gemeinfrei) in src/wappen/<kürzel>.svg. Karte: karte.js (Scripts/karte.mjs).
   Nur Daten und Aufgaben – gezeichnet wird in app.js. Töne: ch_* (Mungg). */
(function () {
  'use strict';
  const K = window.Kern;
  const KARTE = window.KARTE_CH;
  const SPRACHE = { de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', rm: 'Rätoromanisch' };
  /* [Kürzel, Kanton, Hauptort, Ortsname vor Ort (falls anders), Sprachen, Entdecken-Text, Kanton gesprochen, Hauptort gesprochen] */
  const DATEN = [
    ['zh', 'Zürich', 'Zürich', '', ['de'], 'In der Stadt Zürich wohnen mehr Menschen als in jeder anderen Stadt der Schweiz.'],
    ['be', 'Bern', 'Bern', '', ['de', 'fr'], 'In Bern steht das Bundeshaus, darum heisst Bern auch Bundesstadt. Im Wappen läuft ein Bär.'],
    ['lu', 'Luzern', 'Luzern', '', ['de'], 'In Luzern steht die Kapellbrücke, eine alte Holzbrücke mit Bildern unter dem Dach.'],
    ['ur', 'Uri', 'Altdorf', '', ['de'], 'Im Wappen von Uri ist ein Stierkopf. In Altdorf steht das Denkmal von Wilhelm Tell.'],
    ['sz', 'Schwyz', 'Schwyz', '', ['de'], 'Vom Kanton Schwyz hat die ganze Schweiz ihren Namen bekommen.'],
    ['ow', 'Obwalden', 'Sarnen', '', ['de'], 'Im Wappen von Obwalden ist ein Schlüssel. Beim Hauptort Sarnen liegt der Sarnersee.'],
    ['nw', 'Nidwalden', 'Stans', '', ['de'], 'Im Wappen von Nidwalden sind zwei weisse Schlüssel. Der Hauptort heisst Stans.'],
    ['gl', 'Glarus', 'Glarus', '', ['de'], 'In Glarus stimmen die Leute einmal im Jahr draussen auf dem Platz ab: an der Landsgemeinde.'],
    ['zg', 'Zug', 'Zug', '', ['de'], 'Zug liegt am Zugersee und ist bekannt für die Zuger Kirschtorte.'],
    ['fr', 'Freiburg', 'Freiburg', 'Fribourg', ['fr', 'de'], 'Im Kanton Freiburg spricht man Französisch und Deutsch. Von hier kommt der Greyerzer Käse.'],
    ['so', 'Solothurn', 'Solothurn', '', ['de'], 'Die Solothurner lieben die Zahl Elf. Es gibt sogar eine Uhr mit nur elf Zahlen.'],
    ['bs', 'Basel-Stadt', 'Basel', '', ['de'], 'Basel-Stadt ist der kleinste Kanton. Durch Basel fliesst der Rhein.'],
    ['bl', 'Basel-Landschaft', 'Liestal', '', ['de'], 'In Basel-Landschaft findest du die Ruinen der alten Römerstadt Augusta Raurica.'],
    ['sh', 'Schaffhausen', 'Schaffhausen', '', ['de'], 'Im Wappen springt ein schwarzer Schafbock. Hier rauscht der Rheinfall, ein riesiger Wasserfall.'],
    ['ar', 'Appenzell Ausserrhoden', 'Herisau', '', ['de'], 'Die beiden Appenzell sind ringsum vom Kanton St. Gallen umgeben.'],
    ['ai', 'Appenzell Innerrhoden', 'Appenzell', '', ['de'], 'Appenzell Innerrhoden hat am wenigsten Einwohner von allen Kantonen. Im Wappen steht ein Bär.'],
    ['sg', 'St. Gallen', 'St. Gallen', '', ['de'], 'In St. Gallen gibt es eine uralte Bibliothek, die Stiftsbibliothek, und die berühmte Bratwurst.'],
    ['gr', 'Graubünden', 'Chur', '', ['de', 'rm', 'it'], 'Graubünden ist der grösste Kanton. Hier spricht man Deutsch, Rätoromanisch und Italienisch.'],
    ['ag', 'Aargau', 'Aarau', '', ['de'], 'Im Aargau stehen besonders viele Burgen und Schlösser, zum Beispiel die Habsburg.'],
    ['tg', 'Thurgau', 'Frauenfeld', '', ['de'], 'Im Thurgau wachsen besonders viele Äpfel. Im Norden liegt der Bodensee.'],
    ['ti', 'Tessin', 'Bellinzona', '', ['it'], 'Im Tessin spricht man Italienisch. In Bellinzona stehen drei alte Burgen.'],
    ['vd', 'Waadt', 'Lausanne', '', ['fr'], 'In der Waadt spricht man Französisch. In Lausanne am Genfersee ist das Olympische Museum.'],
    ['vs', 'Wallis', 'Sitten', 'Sion', ['fr', 'de'], 'Im Wallis steht das Matterhorn. Man spricht Französisch und Deutsch.'],
    ['ne', 'Neuenburg', 'Neuenburg', 'Neuchâtel', ['fr'], 'Im Kanton Neuenburg baut man seit langer Zeit Uhren. Man spricht Französisch.'],
    ['ge', 'Genf', 'Genf', 'Genève', ['fr'], 'In Genf spritzt eine riesige Wasserfontäne aus dem See, über hundert Meter hoch.'],
    ['ju', 'Jura', 'Delsberg', 'Delémont', ['fr'], 'Jura ist der jüngste Kanton. Es gibt ihn erst seit 1979.'],
  ];
  const GESPROCHEN = { sg: 'Sankt Gallen' };                  // so liest Mungg es vor (St. = Sankt)
  const LISTE = DATEN.map(([id, name, haupt, ort, sprachen, info]) => ({ id, name, haupt, ort, sprachen, info }));
  const KT = Object.fromEntries(LISTE.map(k => [k.id, k]));
  const nameTon = k => `ch_k_${k.id}`;
  const hauptTon = k => `ch_h_${k.id}`;
  const hauptText = k => (k.ort ? `${k.haupt} (${k.ort})` : k.haupt);
  const LAENGE = [8, 10, 12];
  const WAHL = [3, 4, 4];
  /* Nachbarn = die nächsten Kantone auf der Karte (für schwierigere falsche Antworten) */
  const nah = (k, n = 5) => LISTE.filter(x => x !== k)
    .map(x => [x, Math.hypot(KARTE.punkte[x.id][0] - KARTE.punkte[k.id][0], KARTE.punkte[x.id][1] - KARTE.punkte[k.id][1])])
    .sort((a, b) => a[1] - b[1]).slice(0, n).map(a => a[0]);

  /* --------------------------------------------------------- Aufgaben */
  const wappenErkennen = (s, R, n = LAENGE[s - 1]) => R.reihe(LISTE, n).map(k => K.wahl({
    frage: { text: 'Welcher Kanton hat dieses Wappen?', ton: ['ch_frage_wappen'], wappen: k.id },
    richtig: k, pool: LISTE, n: WAHL[s - 1], R, zeige: x => ({ text: x.name }),
    loesung: { text: `Das ist das Wappen von ${k.name}.`, ton: ['richtig_ist', nameTon(k)] },
  }));
  const welchesWappen = (s, R, n = LAENGE[s - 1]) => R.reihe(LISTE, n).map(k => K.wahl({
    frage: { text: `Welches Wappen hat der Kanton ${k.name}?`, ton: ['ch_frage_wappen_von', nameTon(k)] },
    richtig: k, pool: LISTE, n: WAHL[s - 1], R, zeige: x => ({ wappen: x.id }),
    loesung: { text: `So sieht das Wappen von ${k.name} aus.`, ton: ['richtig_ist', nameTon(k)] }, spalten: WAHL[s - 1] === 3 ? 3 : 2,
  }));
  /* Hauptorte: Kanton -> Hauptort oder Hauptort -> Kanton; Stufe 1–2 meist die, die anders heissen als der Kanton */
  function hauptorte(s, R, n = LAENGE[s - 1]) {
    const anders = LISTE.filter(k => k.haupt !== k.name);
    return Array.from({ length: n }, (_, i) => {
      const k = s < 3 && R.ja(0.7) ? R.wahl(anders) : R.wahl(LISTE);
      if (i % 2 === 0 || s === 1) {
        return K.wahl({
          frage: { text: `Wie heisst der Hauptort vom Kanton ${k.name}?`, ton: ['ch_frage_hauptort', nameTon(k)], wappen: k.id, klein: true },
          richtig: k, pool: LISTE, n: WAHL[s - 1], R, zeige: x => ({ text: hauptText(x) }),
          andere: s === 3 ? nah(k) : [], loesung: { text: `Der Hauptort von ${k.name} ist ${hauptText(k)}.`, ton: ['richtig_ist', hauptTon(k)] },
        });
      }
      return K.wahl({
        frage: { text: `Zu welchem Kanton gehört der Hauptort ${hauptText(k)}?`, ton: ['ch_frage_kanton_von', hauptTon(k)] },
        richtig: k, pool: LISTE, n: WAHL[s - 1], R, zeige: x => (s < 3 ? { text: x.name, wappen: x.id, klein: true } : { text: x.name }),
        andere: s === 3 ? nah(k) : [], loesung: { text: `${hauptText(k)} ist der Hauptort von ${k.name}.`, ton: ['richtig_ist', nameTon(k)] },
      });
    });
  }
  const karteZeigen = (s, R, n = LAENGE[s - 1]) => R.reihe(LISTE, n).map(k => K.wahl({
    frage: { text: 'Welcher Kanton leuchtet auf der Karte?', ton: ['ch_frage_karte'], karte: { zeige: k.id } },
    richtig: k, pool: LISTE, n: WAHL[s - 1], R, zeige: x => (s < 3 ? { text: x.name, wappen: x.id, klein: true } : { text: x.name }),
    andere: s > 1 ? nah(k, s === 2 ? 6 : 3) : [], loesung: { text: `Das ist ${k.name}.`, ton: ['richtig_ist', nameTon(k)] },
  }));
  const karteTippen = (s, R, n = LAENGE[s - 1]) => R.reihe(s === 1 ? LISTE.filter(k => KARTE.punkte[k.id][2] > 14) : LISTE, n).map(k => ({
    art: 'karte',
    frage: { text: `Wo liegt der Kanton ${k.name}?`, ton: ['ch_frage_wo', nameTon(k)], wappen: s < 3 ? k.id : undefined, klein: true },
    richtig: k.id, loesung: { text: `Hier liegt ${k.name}.`, ton: ['ch_hier_liegt', nameTon(k)] },
  }));
  /* Autokennzeichen: Schild -> Kanton, auf Stufe 3 auch Kanton -> Schild */
  const kennzeichen = (s, R, n = LAENGE[s - 1]) => R.reihe(LISTE, n).map((k, i) => (s === 3 && i % 2
    ? K.wahl({
      frage: { text: `Welches Autokennzeichen hat der Kanton ${k.name}?`, ton: ['ch_frage_kennzeichen_von', nameTon(k)], wappen: k.id, klein: true },
      richtig: k, pool: LISTE, n: 4, R, zeige: x => ({ schild: x.id.toUpperCase() }), spalten: 2,
      loesung: { text: `${k.name} hat das Kennzeichen ${k.id.toUpperCase()}.`, ton: ['richtig_ist', nameTon(k)] },
    })
    : K.wahl({
      frage: { text: 'Zu welchem Kanton gehört dieses Autokennzeichen?', ton: ['ch_frage_kennzeichen'], schild: k.id.toUpperCase(), nummer: 10000 + R.zahl(0, 89999) },
      richtig: k, pool: LISTE, n: WAHL[s - 1], R, zeige: x => (s < 3 ? { text: x.name, wappen: x.id, klein: true } : { text: x.name }),
      loesung: { text: `${k.id.toUpperCase()} ist ${k.name}.`, ton: ['richtig_ist', nameTon(k)] },
    })));
  /* Kantons-Profi: alles gemischt */
  const profi = (s, R) => Array.from({ length: 15 }, (_, i) => R.wahl([wappenErkennen, welchesWappen, hauptorte, karteZeigen, karteTippen, kennzeichen])(s, R, 1)[0]);
  const memory = (s, R) => R.ziehen(LISTE, [6, 8, 10][s - 1]).map(k => (s < 3
    ? { id: k.id, a: { wappen: k.id }, b: { text: k.name, ton: nameTon(k) } }
    : { id: k.id, a: { wappen: k.id, text: k.name, klein: true, ton: nameTon(k) }, b: { text: hauptText(k), ton: hauptTon(k) } }));

  const karten = () => LISTE.map(k => ({
    titel: k.name, wappen: k.id, karte: { zeige: k.id },
    zeilen: [['Hauptort', hauptText(k)], ['Kennzeichen', k.id.toUpperCase()], ['Sprache', k.sprachen.map(x => SPRACHE[x]).join(', ')]],
    text: k.info, ton: [nameTon(k), { pause: 350 }, `ch_info_${k.id}`],
  }));

  K.modul({
    id: 'schweiz', titel: 'Schweiz', untertitel: '26 Kantone, ihre Wappen und Hauptorte', farbe: '#D8413A',
    banner: 'banner_schweiz', figur: 'mungg_karte', intro: 'ch_intro',
    themen: [{
      id: 'kantone', titel: 'Die Kantone', untertitel: 'Wappen, Hauptorte und die Karte', farbe: '#D8413A',
      banner: 'banner_schweiz', figur: 'mungg_karte', intro: 'ch_intro', karten,
      uebungen: [
        { id: 'wappen', titel: 'Wappen erkennen', text: 'Welcher Kanton hat dieses Wappen?', ab: 1, icon: 'wappen', runde: wappenErkennen },
        { id: 'welches', titel: 'Welches Wappen?', text: 'Finde das Wappen zum Kanton', ab: 1, icon: 'choose', runde: welchesWappen },
        { id: 'memory', titel: 'Wappen-Memory', text: 'Finde Wappen und Namen', ab: 1, icon: 'memory', paare: memory },
        { id: 'hauptorte', titel: 'Hauptorte', text: 'Kanton und Hauptort', ab: 2, icon: 'stadt', runde: hauptorte },
        { id: 'karte', titel: 'Wo ist das?', text: 'Welcher Kanton leuchtet?', ab: 2, icon: 'karte', runde: karteZeigen },
        { id: 'tippen', titel: 'Auf der Karte finden', text: 'Tipp auf den richtigen Kanton', ab: 2, icon: 'pin', runde: karteTippen },
        { id: 'kennzeichen', titel: 'Autokennzeichen', text: 'ZH, BE, LU … wer ist wer?', ab: 3, icon: 'auto', runde: kennzeichen },
        { id: 'profi', titel: 'Kantons-Profi', text: 'Alles gemischt, 15 Fragen', ab: 3, icon: 'pokal', runde: profi },
      ],
      sticker: [['st_matterhorn', 'Auf dem Gipfel'], ['st_alphorn', 'Alphorn'], ['st_fondue', 'Fondue'], ['st_zug', 'Mit dem Zug'],
        ['st_rheinfall', 'Am Rheinfall'], ['st_bruecke', 'Auf der Holzbrücke'], ['st_kuh', 'Auf der Alp'], ['st_postauto', 'Mit dem Postauto']],
    }],
    toene: [
      ['ch_intro', 'mungg', '[excited] Willkommen in der Schweiz! Hier gibt es sechsundzwanzig Kantone. Jeder hat sein eigenes Wappen und einen Hauptort.'],
      ['ch_frage_wappen', 'mungg', 'Welcher Kanton hat dieses Wappen?'],
      ['ch_frage_wappen_von', 'mungg', 'Welches Wappen hat der Kanton …'],
      ['ch_frage_hauptort', 'mungg', 'Wie heißt der Hauptort vom Kanton …'],
      ['ch_frage_kanton_von', 'mungg', 'Zu welchem Kanton gehört der Hauptort …'],
      ['ch_frage_karte', 'mungg', 'Welcher Kanton leuchtet auf der Karte?'],
      ['ch_frage_wo', 'mungg', 'Wo liegt der Kanton …'],
      ['ch_hier_liegt', 'mungg', 'Hier liegt …'],
      ['ch_das_ist', 'mungg', 'Das ist …'],
      ['ch_frage_kennzeichen', 'mungg', 'Zu welchem Kanton gehört dieses Autokennzeichen?'],
      ['ch_frage_kennzeichen_von', 'mungg', 'Welches Autokennzeichen hat der Kanton …'],
      ...LISTE.map(k => [nameTon(k), 'mungg', `${GESPROCHEN[k.id] || k.name}.`]),
      ...LISTE.map(k => [hauptTon(k), 'mungg', `${k.haupt === 'St. Gallen' ? 'Sankt Gallen' : k.haupt}.`]),
      ...LISTE.map(k => [`ch_info_${k.id}`, 'mungg', k.info.replace('St. Gallen', 'Sankt Gallen').replace('1979', 'neunzehnhundertneunundsiebzig')]),
    ],
    daten: { LISTE, KT },
  });
})();
