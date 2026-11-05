/* Modul «Europa» (2026-11-02, Wunsch des Benutzers): 46 Länder mit Flagge, Hauptstadt und Lage auf der Karte.
   Flaggen: flagcdn.com (Flagpedia, gemeinfrei) in src/flaggen/<kürzel>.svg (Scripts/flaggen.mjs). Karte: karte.js (Scripts/europa.mjs).
   Stufe: Entdecker üben 16 bekannte Länder, Forscher 30, Profis alle. Töne: eu_* (Gian).
   Wie die Schweiz es sieht: Kosovo ist ein eigenes Land; die Türkei zählt hier nicht dazu (Hauptstadt in Asien). */
(function () {
  'use strict';
  const K = window.Kern;
  const KARTE = window.KARTE_EU;
  /* [Kürzel, Land, mit Artikel (wenn es einen braucht), Dativ (dto.), Hauptstadt, Stufe, Sprachen, Entdecken-Text] */
  const DATEN = [
    ['ch', 'Schweiz', 'die Schweiz', 'der Schweiz', 'Bern', 1, 'Deutsch, Französisch, Italienisch, Rätoromanisch', 'Unser Land! Bern ist die Bundesstadt – im Bundeshaus trifft sich die Regierung.'],
    ['de', 'Deutschland', '', '', 'Berlin', 1, 'Deutsch', 'Deutschland hat am meisten Einwohner in der EU. In Berlin steht das Brandenburger Tor.'],
    ['at', 'Österreich', '', '', 'Wien', 1, 'Deutsch', 'In Wien gibt es ein Riesenrad, das Schloss Schönbrunn und den ältesten Zoo der Welt.'],
    ['fr', 'Frankreich', '', '', 'Paris', 1, 'Französisch', 'Der Eiffelturm in Paris ist über dreihundert Meter hoch.'],
    ['it', 'Italien', '', '', 'Rom', 1, 'Italienisch', 'Italien sieht auf der Karte aus wie ein Stiefel. In Rom steht das Kolosseum.'],
    ['es', 'Spanien', '', '', 'Madrid', 1, 'Spanisch', 'In Spanien isst man gern Paella und Tapas. Madrid liegt mitten im Land.'],
    ['pt', 'Portugal', '', '', 'Lissabon', 1, 'Portugiesisch', 'Portugal liegt ganz im Westen am Atlantik. In Lissabon fahren alte gelbe Strassenbahnen.'],
    ['gb', 'Grossbritannien', '', '', 'London', 1, 'Englisch', 'England, Schottland und Wales liegen auf der Insel Grossbritannien. In London steht der Big Ben.'],
    ['nl', 'Niederlande', 'die Niederlande', 'den Niederlanden', 'Amsterdam', 1, 'Niederländisch', 'Viele sagen auch Holland. Ein grosser Teil des Landes liegt tiefer als das Meer.'],
    ['be', 'Belgien', '', '', 'Brüssel', 1, 'Niederländisch, Französisch, Deutsch', 'Belgien ist berühmt für Schokolade, Waffeln und Pommes frites.'],
    ['gr', 'Griechenland', '', '', 'Athen', 1, 'Griechisch', 'In Griechenland gab es die ersten Olympischen Spiele. In Athen steht die Akropolis.'],
    ['se', 'Schweden', '', '', 'Stockholm', 1, 'Schwedisch', 'Aus Schweden kommt Pippi Langstrumpf. Stockholm ist auf vierzehn Inseln gebaut.'],
    ['no', 'Norwegen', '', '', 'Oslo', 1, 'Norwegisch', 'Norwegen hat lange, tiefe Meeresbuchten, die Fjorde. Im Winter leuchten dort Polarlichter.'],
    ['dk', 'Dänemark', '', '', 'Kopenhagen', 1, 'Dänisch', 'In Kopenhagen sitzt die kleine Meerjungfrau auf einem Stein am Meer.'],
    ['pl', 'Polen', '', '', 'Warschau', 1, 'Polnisch', 'In Polen isst man gern Piroggen, das sind gefüllte Teigtaschen.'],
    ['li', 'Liechtenstein', '', '', 'Vaduz', 1, 'Deutsch', 'Liechtenstein ist unser kleines Nachbarland. Man bezahlt dort mit Schweizer Franken.'],
    ['ie', 'Irland', '', '', 'Dublin', 2, 'Irisch, Englisch', 'Irland nennt man die grüne Insel. Das Kleeblatt ist das Zeichen von Irland.'],
    ['fi', 'Finnland', '', '', 'Helsinki', 2, 'Finnisch, Schwedisch', 'Finnland hat Tausende Seen. Viele Finnen gehen gern in die Sauna.'],
    ['is', 'Island', '', '', 'Reykjavík', 2, 'Isländisch', 'Auf Island gibt es Vulkane, Gletscher und heisse Quellen, die Wasser in die Luft spritzen.'],
    ['cz', 'Tschechien', '', '', 'Prag', 2, 'Tschechisch', 'In Prag hängt am Rathaus eine alte Uhr. Zu jeder vollen Stunde erscheinen kleine Figuren.'],
    ['sk', 'Slowakei', 'die Slowakei', 'der Slowakei', 'Bratislava', 2, 'Slowakisch', 'In der Slowakei liegt die Hohe Tatra, ein Gebirge mit vielen Bergseen.'],
    ['hu', 'Ungarn', '', '', 'Budapest', 2, 'Ungarisch', 'Durch Budapest fliesst die Donau. Der Zauberwürfel wurde in Ungarn erfunden.'],
    ['hr', 'Kroatien', '', '', 'Zagreb', 2, 'Kroatisch', 'Kroatien hat über tausend Inseln an der Adria.'],
    ['si', 'Slowenien', '', '', 'Ljubljana', 2, 'Slowenisch', 'Slowenien hat Berge, Höhlen und ein kleines Stück Meer. Im Wappen von Ljubljana ist ein Drache.'],
    ['lu', 'Luxemburg', '', '', 'Luxemburg', 2, 'Luxemburgisch, Französisch, Deutsch', 'Das Land und seine Hauptstadt heissen beide Luxemburg. Bus und Zug sind dort gratis.'],
    ['ru', 'Russland', '', '', 'Moskau', 2, 'Russisch', 'Russland ist das grösste Land der Welt. Nur ein Teil davon liegt in Europa.'],
    ['ua', 'Ukraine', 'die Ukraine', 'der Ukraine', 'Kiew', 2, 'Ukrainisch', 'Die Ukraine ist das grösste Land, das ganz in Europa liegt. Auf ihren Feldern wächst viel Weizen.'],
    ['ro', 'Rumänien', '', '', 'Bukarest', 2, 'Rumänisch', 'Durch Rumänien ziehen sich die Karpaten, ein grosses Gebirge mit Bären und Wölfen.'],
    ['bg', 'Bulgarien', '', '', 'Sofia', 2, 'Bulgarisch', 'In Bulgarien wachsen viele Rosen. Aus ihren Blüten macht man Rosenöl.'],
    ['va', 'Vatikanstadt', 'die Vatikanstadt', 'der Vatikanstadt', 'Vatikanstadt', 2, 'Italienisch, Latein', 'Die Vatikanstadt ist das kleinste Land der Welt. Hier wohnt der Papst, und die Schweizergarde beschützt ihn.'],
    ['ad', 'Andorra', '', '', 'Andorra la Vella', 3, 'Katalanisch', 'Andorra liegt hoch in den Pyrenäen, zwischen Frankreich und Spanien.'],
    ['mc', 'Monaco', '', '', 'Monaco', 3, 'Französisch', 'Monaco ist winzig. Jedes Jahr fahren dort Rennautos mitten durch die Stadt.'],
    ['sm', 'San Marino', '', '', 'San Marino', 3, 'Italienisch', 'San Marino ist eines der ältesten Länder der Welt und liegt mitten in Italien.'],
    ['mt', 'Malta', '', '', 'Valletta', 3, 'Maltesisch, Englisch', 'Malta besteht aus kleinen Inseln im Mittelmeer, zwischen Italien und Afrika.'],
    ['cy', 'Zypern', '', '', 'Nikosia', 3, 'Griechisch, Türkisch', 'Zypern ist eine sonnige Insel ganz im Osten des Mittelmeers.'],
    ['ee', 'Estland', '', '', 'Tallinn', 3, 'Estnisch', 'In Tallinn steht eine alte Stadtmauer mit vielen Türmen.'],
    ['lv', 'Lettland', '', '', 'Riga', 3, 'Lettisch', 'Lettland hat lange Sandstrände an der Ostsee und sehr viel Wald.'],
    ['lt', 'Litauen', '', '', 'Vilnius', 3, 'Litauisch', 'An der Küste von Litauen gibt es riesige Sanddünen, die langsam wandern.'],
    ['by', 'Belarus', '', '', 'Minsk', 3, 'Belarussisch, Russisch', 'In Belarus gibt es einen uralten Urwald, in dem Wisente leben – das sind Wildrinder.'],
    ['md', 'Moldau', '', '', 'Chișinău', 3, 'Rumänisch', 'Moldau liegt zwischen Rumänien und der Ukraine und hat kein Meer.'],
    ['rs', 'Serbien', '', '', 'Belgrad', 3, 'Serbisch', 'In Belgrad fliessen die Save und die Donau zusammen.'],
    ['ba', 'Bosnien und Herzegowina', '', '', 'Sarajevo', 3, 'Bosnisch, Kroatisch, Serbisch', 'In Mostar springen mutige Leute von einer alten Steinbrücke in den Fluss.'],
    ['me', 'Montenegro', '', '', 'Podgorica', 3, 'Montenegrinisch', 'Montenegro heisst «schwarzer Berg». Es hat hohe Berge und eine schöne Küste.'],
    ['xk', 'Kosovo', '', '', 'Pristina', 3, 'Albanisch, Serbisch', 'Kosovo ist eines der jüngsten Länder Europas. Viele Menschen aus Kosovo leben auch in der Schweiz.'],
    ['mk', 'Nordmazedonien', '', '', 'Skopje', 3, 'Mazedonisch, Albanisch', 'In Nordmazedonien liegt der Ohridsee, einer der ältesten Seen der Welt.'],
    ['al', 'Albanien', '', '', 'Tirana', 3, 'Albanisch', 'Auf der Flagge von Albanien ist ein schwarzer Adler mit zwei Köpfen.'],
  ];
  // so liest Gian es vor (Namen spricht er im Satz, stimme.py → NAMEN; geprüft mit laute.py)
  const HAUPT_GESPROCHEN = { md: 'Kischinau.', me: 'Podgoritza.' };
  const MEHRZAHL = new Set(['nl']);                 // «die Niederlande»: Wo liegen …, Welche Flagge haben …, Das sind …
  const LISTE = DATEN.map(([id, name, artikel, dativ, haupt, stufe, sprachen, info]) =>
    ({ id, name, mit: artikel || name, dativ: dativ || name, haupt, stufe, sprachen, info, mz: MEHRZAHL.has(id) }));
  const LAND = Object.fromEntries(LISTE.map(l => [l.id, l]));
  const nameTon = l => `eu_l_${l.id}`;
  const hauptTon = l => `eu_h_${l.id}`;
  const gross = t => t[0].toUpperCase() + t.slice(1);
  const LAENGE = [8, 10, 12];
  const WAHL = [3, 4, 4];
  const pool = s => LISTE.filter(l => l.stufe <= s);
  /* Nachbarn = die nächsten Länder auf der Karte (für schwierigere falsche Antworten) */
  const nah = (l, s, n = 5) => pool(s).filter(x => x !== l)
    .map(x => [x, Math.hypot(KARTE.punkte[x.id][0] - KARTE.punkte[l.id][0], KARTE.punkte[x.id][1] - KARTE.punkte[l.id][1])])
    .sort((a, b) => a[1] - b[1]).slice(0, n).map(a => a[0]);
  /* Auf der Karte antippen: winzige Länder (Vatikan, Monaco …) erst für Profis */
  const tippbar = s => pool(s).filter(l => s === 3 || KARTE.punkte[l.id][2] > 8);
  const KARTE_TIPPEN = { welt: 'eu', namen: Object.fromEntries(LISTE.map(l => [l.id, l.mit])), toene: Object.fromEntries(LISTE.map(l => [l.id, nameTon(l)])),
    mehrzahl: [...MEHRZAHL], dasSind: 'eu_das_sind' };

  /* --------------------------------------------------------- Aufgaben */
  const flaggeErkennen = (s, R, n = LAENGE[s - 1]) => R.reihe(pool(s), n).map(l => K.wahl({
    frage: { text: 'Welches Land hat diese Flagge?', ton: ['eu_frage_flagge'], flagge: l.id },
    richtig: l, pool: pool(s), n: WAHL[s - 1], R, zeige: x => ({ text: x.name }), andere: s === 3 ? nah(l, s) : [],
    loesung: { text: `Das ist die Flagge von ${l.dativ}.`, ton: ['richtig_ist', nameTon(l)] },
  }));
  const welcheFlagge = (s, R, n = LAENGE[s - 1]) => R.reihe(pool(s), n).map(l => K.wahl({
    frage: { text: `Welche Flagge ${l.mz ? 'haben' : 'hat'} ${l.mit}?`, ton: [l.mz ? 'eu_frage_flagge_von_mz' : 'eu_frage_flagge_von', nameTon(l)] },
    richtig: l, pool: pool(s), n: WAHL[s - 1], R, zeige: x => ({ flagge: x.id }), andere: s > 1 ? nah(l, s) : [],
    loesung: { text: `So sieht die Flagge von ${l.dativ} aus.`, ton: ['richtig_ist', nameTon(l)] }, spalten: WAHL[s - 1] === 3 ? 3 : 2,
  }));
  /* Hauptstädte: Land -> Hauptstadt, ab Stufe 2 abwechselnd auch Hauptstadt -> Land */
  const hauptstaedte = (s, R, n = LAENGE[s - 1]) => R.reihe(pool(s), n).map((l, i) => (i % 2 === 0 || s === 1
    ? K.wahl({
      frage: { text: `Wie heisst die Hauptstadt von ${l.dativ}?`, ton: [nameTon(l), { pause: 200 }, 'eu_frage_hauptstadt'], flagge: l.id, klein: true },
      richtig: l, pool: pool(s), n: WAHL[s - 1], R, zeige: x => ({ text: x.haupt }), andere: s === 3 ? nah(l, s) : [],
      loesung: { text: `Die Hauptstadt von ${l.dativ} ist ${l.haupt}.`, ton: ['richtig_ist', hauptTon(l)] },
    })
    : K.wahl({
      frage: { text: `Zu welchem Land gehört die Hauptstadt ${l.haupt}?`, ton: ['eu_frage_land_von', hauptTon(l)] },
      richtig: l, pool: pool(s), n: WAHL[s - 1], R, zeige: x => (s < 3 ? { text: x.name, flagge: x.id, klein: true } : { text: x.name }),
      andere: s === 3 ? nah(l, s) : [], loesung: { text: `${l.haupt} ist die Hauptstadt von ${l.dativ}.`, ton: ['richtig_ist', nameTon(l)] },
    })));
  const karteZeigen = (s, R, n = LAENGE[s - 1]) => R.reihe(pool(s), n).map(l => K.wahl({
    frage: { text: 'Welches Land leuchtet auf der Karte?', ton: ['eu_frage_karte'], karte: { welt: 'eu', zeige: l.id } },
    richtig: l, pool: pool(s), n: WAHL[s - 1], R, zeige: x => (s < 3 ? { text: x.name, flagge: x.id, klein: true } : { text: x.name }),
    andere: s > 1 ? nah(l, s, s === 2 ? 6 : 3) : [], loesung: { text: `Das ${l.mz ? 'sind' : 'ist'} ${l.mit}.`, ton: ['richtig_ist', nameTon(l)] },
  }));
  const karteTippen = (s, R, n = LAENGE[s - 1]) => R.reihe(tippbar(s), n).map(l => ({
    art: 'karte', karte: KARTE_TIPPEN,
    frage: { text: `Wo ${l.mz ? 'liegen' : 'liegt'} ${l.mit}?`, ton: [l.mz ? 'eu_frage_wo_mz' : 'eu_frage_wo', nameTon(l)], flagge: s < 3 ? l.id : undefined, klein: true },
    richtig: l.id, loesung: { text: `Hier ${l.mz ? 'liegen' : 'liegt'} ${l.mit}.`, ton: [l.mz ? 'eu_hier_liegen' : 'eu_hier_liegt', nameTon(l)] },
  }));
  /* Europa-Profi: alles gemischt */
  const profi = (s, R) => Array.from({ length: 15 }, () => R.wahl([flaggeErkennen, welcheFlagge, hauptstaedte, karteZeigen, karteTippen])(s, R, 1)[0]);
  const memory = (s, R) => R.ziehen(pool(s), [6, 8, 10][s - 1]).map(l => (s < 3
    ? { id: l.id, a: { flagge: l.id }, b: { text: l.name, ton: nameTon(l) } }
    : { id: l.id, a: { flagge: l.id, text: l.name, klein: true, ton: nameTon(l) }, b: { text: l.haupt, ton: hauptTon(l) } }));

  const karten = () => LISTE.map(l => ({
    titel: l.name, flagge: l.id, karte: { welt: 'eu', zeige: l.id },
    zeilen: [['Hauptstadt', l.haupt], ['Sprache', l.sprachen]],
    text: l.info, ton: [nameTon(l), { pause: 350 }, `eu_info_${l.id}`],
  }));

  K.modul({
    id: 'europa', titel: 'Europa', untertitel: 'Länder, Flaggen und Hauptstädte', farbe: '#2456A8',
    banner: 'banner_europa', figur: 'figur_europa', intro: 'eu_intro',
    themen: [{
      id: 'laender', titel: 'Die Länder Europas', untertitel: `${LISTE.length} Länder, ihre Flaggen und Hauptstädte`, farbe: '#2456A8',
      banner: 'banner_europa', figur: 'figur_europa', intro: 'eu_intro', karten,
      uebungen: [
        { id: 'flagge', titel: 'Flaggen erkennen', text: 'Welches Land hat diese Flagge?', ab: 1, icon: 'wappen', runde: flaggeErkennen },
        { id: 'welche', titel: 'Welche Flagge?', text: 'Finde die Flagge zum Land', ab: 1, icon: 'choose', runde: welcheFlagge },
        { id: 'memory', titel: 'Flaggen-Memory', text: 'Finde Flagge und Land', ab: 1, icon: 'memory', paare: memory },
        { id: 'hauptstaedte', titel: 'Hauptstädte', text: 'Land und Hauptstadt', ab: 2, icon: 'stadt', runde: hauptstaedte },
        { id: 'karte', titel: 'Wo ist das?', text: 'Welches Land leuchtet?', ab: 2, icon: 'karte', runde: karteZeigen },
        { id: 'tippen', titel: 'Auf der Karte finden', text: 'Tipp auf das richtige Land', ab: 2, icon: 'pin', runde: karteTippen },
        { id: 'profi', titel: 'Europa-Profi', text: 'Alles gemischt, 15 Fragen', ab: 3, icon: 'pokal', runde: profi },
      ],
      sticker: [['st_akropolis', 'Bei der Akropolis'], ['st_polarlicht', 'Unter dem Polarlicht'], ['st_geysir', 'Am Geysir'],
        ['st_riesenrad', 'Im Wiener Riesenrad'], ['st_schweizergarde', 'Bei der Schweizergarde'], ['st_ballon', 'Im Ballon über Europa']],
    }],
    toene: [
      ['eu_intro', 'gian', '[excited] Willkommen in Europa! Hier gibt es über vierzig Länder. Jedes hat seine eigene Flagge und eine Hauptstadt.'],
      ['eu_frage_flagge', 'gian', 'Welches Land hat diese Flagge?'],
      ['eu_frage_flagge_von', 'gian', 'Welche Flagge hat …'],
      ['eu_frage_hauptstadt', 'gian', 'Wie heißt die Hauptstadt?'],
      ['eu_frage_land_von', 'gian', 'Zu welchem Land gehört die Hauptstadt …'],
      ['eu_frage_karte', 'gian', 'Welches Land leuchtet auf der Karte?'],
      ['eu_frage_wo', 'gian', 'Wo liegt …'],
      ['eu_hier_liegt', 'gian', 'Hier liegt …'],
      ['eu_frage_flagge_von_mz', 'gian', 'Welche Flagge haben …'],
      ['eu_frage_wo_mz', 'gian', 'Wo liegen …'],
      ['eu_hier_liegen', 'gian', 'Hier liegen …'],
      ['eu_das_sind', 'gian', 'Das sind …'],
      ...LISTE.map(l => [nameTon(l), 'gian', `${gross(l.mit)}.`]),
      ...LISTE.map(l => [hauptTon(l), 'gian', HAUPT_GESPROCHEN[l.id] || `${l.haupt}.`]),
      ...LISTE.map(l => [`eu_info_${l.id}`, 'gian', l.info]),
    ],
    daten: { LISTE, LAND },
  });
})();
