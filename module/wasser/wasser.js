/* Modul «Seen und Flüsse» (2026-11-02, Wunsch des Benutzers): die 12 grössten Seen und die 10 wichtigsten Flüsse der Schweiz.
   Karte: module/schweiz/karte.js (Seen einzeln von BFS/swisstopo, Flüsse von OpenStreetMap, Scripts/karte.mjs).
   Flächen: ganze Seefläche (auch die Teile in Nachbarländern), gerundet wie in Schulbüchern. Töne: ws_* (Maskottchen).
   Nur Daten und Aufgaben – gezeichnet wird in app.js. */
(function () {
  'use strict';
  const K = window.Kern;
  /* [Id, Name, Fläche km², Kantone, Nachbarland, Text zum Entdecken] */
  const SEEN = [
    ['genfersee', 'Genfersee', 580, 'Waadt, Wallis, Genf', 'Frankreich', 'Der grösste See an der Schweizer Grenze. Die Rhone fliesst hindurch, und in Genf spritzt eine riesige Wasserfontäne.'],
    ['bodensee', 'Bodensee', 536, 'Thurgau, St. Gallen', 'Deutschland und Österreich', 'Hier treffen sich drei Länder: die Schweiz, Deutschland und Österreich. Der Rhein fliesst hindurch.'],
    ['neuenburgersee', 'Neuenburgersee', 218, 'Neuenburg, Waadt, Freiburg', '', 'Der grösste See, der ganz in der Schweiz liegt.'],
    ['maggiore', 'Lago Maggiore', 212, 'Tessin', 'Italien', 'Hier liegt der tiefste Punkt der Schweiz. Der grösste Teil des Sees gehört zu Italien.'],
    ['vierwaldstaettersee', 'Vierwaldstättersee', 114, 'Luzern, Uri, Schwyz, Nidwalden, Obwalden', '', 'Er hat viele Arme und grenzt an die vier Waldstätte Luzern, Uri, Schwyz und Unterwalden. Daher kommt sein Name.'],
    ['zuerichsee', 'Zürichsee', 88, 'Zürich, Schwyz, St. Gallen', '', 'Aus dem Zürichsee fliesst die Limmat mitten durch die Stadt Zürich.'],
    ['luganersee', 'Luganersee', 49, 'Tessin', 'Italien', 'Er liegt im Tessin zwischen steilen Bergen. Ein Teil gehört zu Italien.'],
    ['thunersee', 'Thunersee', 48, 'Bern', '', 'Die Aare fliesst durch den Thunersee und dann weiter durch die Stadt Thun.'],
    ['bielersee', 'Bielersee', 39, 'Bern, Neuenburg', '', 'Im Bielersee liegt die St. Petersinsel.'],
    ['zugersee', 'Zugersee', 38, 'Zug, Luzern, Schwyz', '', 'Er liegt in drei Kantonen: Zug, Luzern und Schwyz.'],
    ['brienzersee', 'Brienzersee', 30, 'Bern', '', 'Sein Wasser ist türkisgrün, weil viel Gletscherwasser hineinfliesst.'],
    ['walensee', 'Walensee', 24, 'St. Gallen, Glarus', '', 'Über dem Walensee ragen die steilen Felswände der Churfirsten in die Höhe.'],
  ].map(([id, name, km2, kantone, land, info]) => ({ id, name, km2, kantone, land, info }));
  /* [Id, Name, gesprochen mit Artikel, Meer, Länge (ganzer Fluss), Weg, Text zum Entdecken] */
  const FLUESSE = [
    ['rhein', 'Rhein', 'der Rhein', 'nordsee', 'über 1200 km', 'Graubünden, Bodensee, Rheinfall, Basel', 'Er fliesst durch den Bodensee und über den Rheinfall nach Basel und von dort bis in die Nordsee.'],
    ['aare', 'Aare', 'die Aare', 'nordsee', '288 km', 'Grimsel, Thun, Bern, Solothurn, Aarau', 'Der längste Fluss, der ganz in der Schweiz fliesst. In Bern schwimmen die Leute im Sommer in der Aare.'],
    ['rhone', 'Rhone', 'die Rhone', 'mittelmeer', 'über 800 km', 'Rhonegletscher, Wallis, Genfersee, Genf', 'Sie entspringt am Rhonegletscher, fliesst durch das Wallis und den Genfersee und dann durch Frankreich ins Mittelmeer.'],
    ['reuss', 'Reuss', 'die Reuss', 'nordsee', '164 km', 'Gotthard, Vierwaldstättersee, Luzern', 'Sie kommt vom Gotthard, fliesst durch den Vierwaldstättersee und unter der Kapellbrücke in Luzern durch.'],
    ['limmat', 'Limmat', 'die Limmat', 'nordsee', '35 km', 'Zürichsee, Zürich', 'Sie fliesst aus dem Zürichsee mitten durch die Stadt Zürich und dann in die Aare.'],
    ['linth', 'Linth', 'die Linth', 'nordsee', '', 'Glarnerland, Walensee, Zürichsee', 'Sie fliesst durch das Glarnerland in den Walensee und weiter in den Zürichsee.'],
    ['saane', 'Saane', 'die Saane', 'nordsee', '128 km', 'Saanenland, Greyerzersee, Freiburg', 'Sie fliesst durch die Stadt Freiburg. Auf der einen Seite spricht man Französisch, auf der anderen Deutsch.'],
    ['thur', 'Thur', 'die Thur', 'nordsee', '135 km', 'Toggenburg, Thurgau', 'Nach der Thur ist der Kanton Thurgau benannt.'],
    ['inn', 'Inn', 'der Inn', 'schwarzesmeer', 'über 500 km', 'Engadin, Österreich, Donau', 'Er fliesst durch das Engadin. Sein Wasser kommt über die Donau bis ins Schwarze Meer.'],
    ['ticino', 'Ticino', 'der Ticino', 'adria', '248 km', 'Nufenenpass, Bellinzona, Lago Maggiore', 'Er fliesst durch das Tessin in den Lago Maggiore und dann in Italien weiter bis in die Adria.'],
  ].map(([id, name, mitArtikel, meer, laenge, weg, info]) => ({ id, name, mitArtikel, meer, laenge, weg, info }));
  const MEERE = [['nordsee', 'Nordsee'], ['mittelmeer', 'Mittelmeer'], ['schwarzesmeer', 'Schwarzes Meer'], ['adria', 'Adria']].map(([id, name]) => ({ id, name }));
  /* Städte am Fluss: [Id, Ort, Fluss, Ton] – vorhandene Töne der Hauptorte (ch_h_*) werden mitbenutzt */
  const ORTE = [
    ['basel', 'Basel', 'rhein', 'ch_h_bs'], ['schaffhausen', 'Schaffhausen', 'rhein', 'ch_h_sh'], ['bern', 'Bern', 'aare', 'ch_h_be'],
    ['thun', 'Thun', 'aare', 'ws_ort_thun'], ['solothurn', 'Solothurn', 'aare', 'ch_h_so'], ['aarau', 'Aarau', 'aare', 'ch_h_ag'],
    ['genf', 'Genf', 'rhone', 'ch_h_ge'], ['sitten', 'Sitten', 'rhone', 'ch_h_vs'], ['luzern', 'Luzern', 'reuss', 'ch_h_lu'],
    ['zuerich', 'Zürich', 'limmat', 'ch_h_zh'], ['freiburg', 'Freiburg', 'saane', 'ch_h_fr'], ['bellinzona', 'Bellinzona', 'ticino', 'ch_h_ti'],
    ['stmoritz', 'St. Moritz', 'inn', 'ws_ort_stmoritz'], ['glarus', 'Glarus', 'linth', 'ch_h_gl'],
  ].map(([id, name, fluss, ton]) => ({ id, name, fluss, ton }));
  const SEE = Object.fromEntries(SEEN.map(s => [s.id, s])), FL = Object.fromEntries(FLUESSE.map(f => [f.id, f]));
  const seeTon = s => `ws_s_${s.id}`, flussTon = f => `ws_f_${f.id}`;
  const LAENGE = [8, 10, 12];
  const WAHL = [3, 4, 4];
  const seenFuer = s => (s === 1 ? SEEN.slice(0, 8) : SEEN);
  const fluesseFuer = s => (s === 1 ? FLUESSE.filter(f => ['rhein', 'aare', 'rhone', 'reuss', 'inn', 'ticino'].includes(f.id)) : FLUESSE);
  const KARTE = { ebene: 'see', dasIst: 'ws_das_ist', namen: Object.fromEntries(SEEN.map(s => [s.id, s.name])), toene: Object.fromEntries(SEEN.map(s => [s.id, seeTon(s)])) };

  const seenErkennen = (s, R, n = LAENGE[s - 1]) => R.reihe(seenFuer(s), n).map(see => K.wahl({
    frage: { text: 'Welcher See leuchtet auf der Karte?', ton: ['ws_frage_see'], karte: { see: see.id } },
    richtig: see, pool: seenFuer(s), n: WAHL[s - 1], R, zeige: x => ({ text: x.name }),
    loesung: { text: `Das ist der ${see.name}.`, ton: ['richtig_ist', seeTon(see)] },
  }));
  const fluesseErkennen = (s, R, n = LAENGE[s - 1]) => R.reihe(fluesseFuer(s), n).map(f => K.wahl({
    frage: { text: 'Welcher Fluss leuchtet auf der Karte?', ton: ['ws_frage_fluss'], karte: { fluss: f.id } },
    richtig: f, pool: fluesseFuer(s), n: WAHL[s - 1], R, zeige: x => ({ text: x.name }),
    loesung: { text: `Das ist ${f.mitArtikel}.`, ton: ['richtig_ist', flussTon(f)] },
  }));
  const seeTippen = (s, R, n = LAENGE[s - 1]) => R.reihe(seenFuer(Math.max(s, 2)), n).map(see => ({
    art: 'karte', karte: KARTE,
    frage: { text: `Wo liegt der ${see.name}?`, ton: ['ws_frage_wo', seeTon(see)] },
    richtig: see.id, loesung: { text: `Hier liegt der ${see.name}.`, ton: ['ws_hier_liegt', seeTon(see)] },
  }));
  const stadtFluss = (s, R, n = LAENGE[s - 1]) => R.reihe(ORTE, n).map(o => K.wahl({
    frage: { text: `Welcher Fluss fliesst durch ${o.name}?`, ton: ['ws_frage_stadt', o.ton] },
    richtig: FL[o.fluss], pool: FLUESSE, n: WAHL[s - 1], R, zeige: x => ({ text: x.name }),
    loesung: { text: `Durch ${o.name} fliesst ${FL[o.fluss].mitArtikel}.`, ton: ['richtig_ist', flussTon(FL[o.fluss])] },
  }));
  /* Welcher See ist am grössten? (drei Seen, die nicht fast gleich gross sind) */
  function groesser(s, R, n = LAENGE[s - 1]) {
    const pool = s === 2 ? SEEN.slice(0, 10) : SEEN;
    return Array.from({ length: n }, () => {
      let drei;
      do { drei = R.ziehen(pool, 3); } while (drei.some((a, i) => drei.some((b, j) => i < j && Math.abs(a.km2 - b.km2) < 4)));
      const gross = drei.slice().sort((a, b) => b.km2 - a.km2)[0];
      return K.wahl({
        frage: { text: 'Welcher dieser Seen ist am grössten?', ton: ['ws_frage_gross'] },
        richtig: gross, pool: [], andere: drei.filter(x => x !== gross), n: 3, R, zeige: x => ({ text: x.name }),
        loesung: { text: drei.slice().sort((a, b) => b.km2 - a.km2).map(x => `${x.name}: ${x.km2} km²`).join(', '), ton: ['richtig_ist', seeTon(gross)] },
      });
    });
  }
  const WOHIN = { nordsee: 'in die Nordsee', mittelmeer: 'ins Mittelmeer', schwarzesmeer: 'ins Schwarze Meer', adria: 'in die Adria, einen Teil des Mittelmeers' };
  const meer = (s, R, n = LAENGE[s - 1]) => R.reihe(FLUESSE, n).map(f => K.wahl({
    frage: { text: `In welches Meer fliesst am Ende ${f.mitArtikel}?`, ton: ['ws_frage_meer'], karte: { fluss: f.id }, klein: true },
    richtig: MEERE.find(m => m.id === f.meer), pool: MEERE, n: 4, R, zeige: x => ({ text: x.name }), spalten: 2,
    loesung: { text: f.meer === 'nordsee' && f.id !== 'rhein' ? `${f.mitArtikel[0].toUpperCase()}${f.mitArtikel.slice(1)} fliesst in den Rhein und mit ihm in die Nordsee.`
      : `${f.mitArtikel[0].toUpperCase()}${f.mitArtikel.slice(1)} fliesst ${WOHIN[f.meer]}.`, ton: ['richtig_ist', `ws_meer_${f.meer}`] },
  }));
  const reiheSeen = (s, R) => Array.from({ length: 4 }, () => {
    const teile = R.ziehen(SEEN, [4, 4, 5][s - 1]).sort((a, b) => b.km2 - a.km2);
    return { art: 'reihe', frage: { text: 'Bring die Seen in die richtige Reihenfolge – vom grössten zum kleinsten!', ton: ['ws_reihe'] },
      teile: R.mischen(teile).map(x => ({ id: x.id, text: x.name })), reihenfolge: teile.map(x => x.id),
      loesung: { text: teile.map(x => `${x.name} (${x.km2} km²)`).join(', '), ton: teile.map(seeTon) } };
  });
  const memory = (s, R) => {
    const seen = R.ziehen(seenFuer(s), [4, 4, 5][s - 1]).map(x => ({ id: x.id, a: { karte: { see: x.id } }, b: { text: x.name, ton: seeTon(x) } }));
    const fl = R.ziehen(fluesseFuer(s), [2, 4, 5][s - 1]).map(x => ({ id: x.id, a: { karte: { fluss: x.id } }, b: { text: x.name, ton: flussTon(x) } }));
    return [...seen, ...fl];
  };
  const karten = () => [
    ...SEEN.map(x => ({ titel: x.name, karte: { see: x.id },
      zeilen: [['Fläche', `etwa ${x.km2} km²`], ['Kantone', x.kantone], ...(x.land ? [['Auch in', x.land]] : [])],
      text: x.info, ton: [seeTon(x), { pause: 300 }, `ws_info_${x.id}`] })),
    ...FLUESSE.map(x => ({ titel: x.name, karte: { fluss: x.id },
      zeilen: [...(x.laenge ? [['Länge', x.laenge]] : []), ['Weg', x.weg], ['Fliesst ins Meer', MEERE.find(m => m.id === x.meer).name]],
      text: x.info, ton: [flussTon(x), { pause: 300 }, `ws_info_${x.id}`] })),
  ];

  const sag = t => t.replace('St. ', 'Sankt ');
  K.modul({
    id: 'wasser', titel: 'Seen und Flüsse', untertitel: 'Die grössten Seen und Flüsse der Schweiz', farbe: '#1B7FA8',
    banner: 'banner_wasser', figur: 'figur_paddel', intro: 'ws_intro',
    themen: [{
      id: 'wasser', titel: 'Seen und Flüsse', untertitel: '12 Seen und 10 Flüsse', farbe: '#1B7FA8',
      banner: 'banner_wasser', figur: 'figur_paddel', intro: 'ws_intro', karten,
      uebungen: [
        { id: 'seen', titel: 'Welcher See ist das?', text: 'Ein See leuchtet auf der Karte', ab: 1, icon: 'karte', runde: seenErkennen },
        { id: 'fluesse', titel: 'Welcher Fluss ist das?', text: 'Ein Fluss leuchtet auf der Karte', ab: 1, icon: 'karte', runde: fluesseErkennen },
        { id: 'memory', titel: 'Seen-Memory', text: 'Finde Karte und Namen', ab: 1, icon: 'memory', paare: memory },
        { id: 'stadt', titel: 'Fluss und Stadt', text: 'Welcher Fluss fliesst durch Bern?', ab: 2, icon: 'stadt', runde: stadtFluss },
        { id: 'tippen', titel: 'Finde den See', text: 'Tipp auf den richtigen See', ab: 2, icon: 'pin', runde: seeTippen },
        { id: 'gross', titel: 'Am grössten', text: 'Welcher See ist am grössten?', ab: 2, icon: 'choose', runde: groesser },
        { id: 'meer', titel: 'Bis ins Meer', text: 'Wohin fliesst das Wasser?', ab: 3, icon: 'pokal', runde: meer },
        { id: 'reihe', titel: 'Seen ordnen', text: 'Vom grössten zum kleinsten', ab: 3, icon: 'reihe', runde: reiheSeen },
      ],
      sticker: [['st_segelboot', 'Mit dem Segelboot'], ['st_dampfschiff', 'Auf dem Dampfschiff'], ['st_aareschwimmen', 'In der Aare schwimmen'],
        ['st_kanu', 'Im Kanu'], ['st_fischen', 'Am Steg fischen'], ['st_paddeln', 'Stand-up-Paddeln']],
    }],
    toene: [
      ['ws_intro', 'gian', '[excited] Die Schweiz hat über tausend Seen und viele Flüsse. Komm, wir schauen uns die grössten an!'],
      ['ws_frage_see', 'gian', 'Welcher See leuchtet auf der Karte?'],
      ['ws_frage_fluss', 'gian', 'Welcher Fluss leuchtet auf der Karte?'],
      ['ws_frage_wo', 'gian', 'Wo liegt der …'],
      ['ws_hier_liegt', 'gian', 'Hier liegt der …'],
      ['ws_das_ist', 'gian', 'Das ist der …'],
      ['ws_frage_stadt', 'gian', 'Welcher Fluss fließt durch …'],
      ['ws_frage_gross', 'gian', 'Welcher dieser Seen ist am größten?'],
      ['ws_frage_meer', 'gian', 'In welches Meer fließt dieser Fluss am Ende?'],
      ['ws_reihe', 'gian', 'Bring die Seen in die richtige Reihenfolge, vom größten zum kleinsten!'],
      ['ws_ort_thun', 'gian', 'Thun.'], ['ws_ort_stmoritz', 'gian', 'Sankt Moritz.'],
      // Namen ohne Artikel: «die Saane», «die Limmat» klangen am Anfang wie «gi…» (Lautschrift-Prüfung 2026-11-02)
      ...MEERE.map(m => [`ws_meer_${m.id}`, 'gian', `${m.name}.`]),
      ...SEEN.map(x => [seeTon(x), 'gian', `${x.name}.`]),
      // Flüsse: früher mit «!» und «Tuhr», «Rohne» – allein klangen sie trotzdem englisch («Tour»); seit 2026-11-05 im Satz gesprochen
      ...FLUESSE.map(x => [flussTon(x), 'gian', `${x.name}.`]),          // im Satz gesprochen (stimme.py, NAMEN)
      ...SEEN.map(x => [`ws_info_${x.id}`, 'gian', sag(x.info)]),
      ...FLUESSE.map(x => [`ws_info_${x.id}`, 'gian', sag(x.info)]),
    ],
    daten: { SEEN, FLUESSE, ORTE, MEERE },
  });
})();
