/* Modul «Sprachen»: Französisch, Englisch, Italienisch, Spanisch – je die Zahlen 1 bis 10 und 20 erste Wörter.
   Jede Sprache ist ein eigenes Thema mit eigenem Look und einem Freund, der die Wörter spricht:
   Léo (Frosch, aus Wörtli-Frosch), Bao (Panda, aus Wörtli-Panda), Gina (Kätzchen), Pepe (Eselchen).
   Die Bilder der Wörter (w_*) gelten für alle Sprachen. Töne: <sprache>_z_<n>, <sprache>_w_<wort> (Freund), sp_* und <sprache>_* (Mungg). */
(function () {
  'use strict';
  const K = window.Kern;
  /* Wort-Id, Deutsch, Französisch, Englisch, Italienisch, Spanisch */
  const WOERTER = [
    ['hallo', 'Hallo', 'salut', 'hello', 'ciao', 'hola'],
    ['guten_morgen', 'Guten Morgen', 'bonjour', 'good morning', 'buongiorno', 'buenos días'],
    ['gute_nacht', 'Gute Nacht', 'bonne nuit', 'good night', 'buonanotte', 'buenas noches'],
    ['tschuess', 'Tschüss', 'au revoir', 'goodbye', 'arrivederci', 'adiós'],
    ['bitte', 'Bitte', 's’il te plaît', 'please', 'per favore', 'por favor'],
    ['danke', 'Danke', 'merci', 'thank you', 'grazie', 'gracias'],
    ['ja', 'Ja', 'oui', 'yes', 'sì', 'sí'],
    ['nein', 'Nein', 'non', 'no', 'no', 'no'],
    ['entschuldigung', 'Entschuldigung', 'pardon', 'sorry', 'scusa', 'perdón'],
    ['wie_gehts', 'Wie geht’s?', 'ça va ?', 'how are you?', 'come stai?', '¿cómo estás?'],
    ['mama', 'Mama', 'maman', 'mum', 'mamma', 'mamá'],
    ['papa', 'Papa', 'papa', 'dad', 'papà', 'papá'],
    ['freund', 'der Freund', 'l’ami', 'friend', 'l’amico', 'el amigo'],
    ['hund', 'der Hund', 'le chien', 'dog', 'il cane', 'el perro'],
    ['katze', 'die Katze', 'le chat', 'cat', 'il gatto', 'el gato'],
    ['haus', 'das Haus', 'la maison', 'house', 'la casa', 'la casa'],
    ['schule', 'die Schule', 'l’école', 'school', 'la scuola', 'la escuela'],
    ['wasser', 'das Wasser', 'l’eau', 'water', 'l’acqua', 'el agua'],
    ['brot', 'das Brot', 'le pain', 'bread', 'il pane', 'el pan'],
    ['apfel', 'der Apfel', 'la pomme', 'apple', 'la mela', 'la manzana'],
  ];
  /* Bilder, die man leicht verwechselt, kommen nie zusammen in eine Auswahl */
  const VERWECHSEL = [['hallo', 'tschuess'], ['hallo', 'guten_morgen'], ['ja', 'danke'], ['mama', 'papa'], ['freund', 'wie_gehts']];
  const verwechselt = (a, b) => VERWECHSEL.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const SPRACHEN = [
    { id: 'fr', spalte: 2, name: 'Französisch', land: 'Frankreich', freund: 'leo', fname: 'Léo', farbe: '#2F5DB8', banner: 'banner_fr',
      zahlen: ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'],
      hallo: 'Salut ! Je suis Léo. Bienvenue en France !', lob: ['Super !', 'Bravo !', 'Génial !'],
      sprich: { papa: 'Papa !' },        // «Papa.» klang wie «Tata» (beide Spracherkennungen, 2026-11-01)
      mungg: 'Das ist Léo, mein Freund aus Frankreich. Mit ihm lernst du Französisch!',
      sticker: [['st_eiffelturm', 'Am Eiffelturm'], ['st_croissant', 'Croissants im Café'], ['st_maler', 'Der Maler'], ['st_boule', 'Pétanque']] },
    { id: 'en', spalte: 3, name: 'Englisch', land: 'England', freund: 'bao', fname: 'Bao', farbe: '#C8323C', banner: 'banner_en',
      zahlen: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
      hallo: 'Hello! I’m Bao. Welcome to England!', lob: ['Great job!', 'Well done!', 'Awesome!'],
      mungg: 'Das ist Bao, mein Freund aus England. Mit ihm lernst du Englisch!',
      sticker: [['st_doppeldecker', 'Im Doppeldecker'], ['st_tee', 'Teeparty'], ['st_bigben', 'Bei Big Ben'], ['st_regenschirm', 'Im Londoner Regen']] },
    { id: 'it', spalte: 4, name: 'Italienisch', land: 'Italien', freund: 'gina', fname: 'Gina', farbe: '#2E9A55', banner: 'banner_it',
      zahlen: ['uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci'],
      hallo: 'Ciao! Sono Gina. Benvenuti in Italia!', lob: ['Bravo!', 'Fantastico!', 'Perfetto!'],
      mungg: 'Das ist Gina, meine Freundin aus Italien. Mit ihr lernst du Italienisch!',
      sticker: [['st_gondel', 'In der Gondel'], ['st_pizza', 'Pizza!'], ['st_gelato', 'Gelato'], ['st_kolosseum', 'Beim Kolosseum']] },
    { id: 'es', spalte: 5, name: 'Spanisch', land: 'Spanien', freund: 'pepe', fname: 'Pepe', farbe: '#E3A21A', banner: 'banner_es',
      zahlen: ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'],
      hallo: '¡Hola! Soy Pepe. ¡Bienvenidos a España!', lob: ['¡Muy bien!', '¡Genial!', '¡Fantástico!'],
      mungg: 'Das ist Pepe, mein Freund aus Spanien. Mit ihm lernst du Spanisch!',
      sticker: [['st_flamenco', 'Flamenco'], ['st_paella', 'Paella'], ['st_strand', 'Am Strand'], ['st_orangen', 'Orangen pflücken']] },
  ];
  const LAENGE = [8, 10, 12];
  const WAHL = [3, 4, 4];

  function thema(L) {
    const l = L.id;
    const W = WOERTER.map(r => ({ id: r[0], de: r[1], wort: r[L.spalte], bild: `w_${r[0]}`, ton: `${l}_w_${r[0]}` }));
    const Z = L.zahlen.map((wort, i) => ({ id: `z${i + 1}`, n: i + 1, wort, ton: `${l}_z_${i + 1}` }));
    const dieSprache = `auf ${L.name}`;
    const zahlenHoeren = (s, R) => R.reihe(Z, LAENGE[s - 1]).map(z => K.wahl({
      frage: { text: 'Hör gut zu! Welche Zahl ist das?', ton: ['sp_hoer_zahl', { pause: 250 }, z.ton], hoeren: z.ton },
      richtig: z, pool: Z, n: WAHL[s - 1], R, zeige: x => ({ zahl: x.n }), spalten: WAHL[s - 1] === 3 ? 3 : 2,
      andere: s > 1 ? Z.filter(x => Math.abs(x.n - z.n) <= 2) : [],
      loesung: { text: `${z.wort} heisst ${z.n}.`, ton: [z.ton] },
    }));
    const zahlenLesen = (s, R) => R.reihe(Z, LAENGE[s - 1]).map((z, i) => (s < 3 || i % 2 === 0
      ? K.wahl({
        frage: { text: `Wie heisst diese Zahl ${dieSprache}?`, ton: [`${l}_zahl_wie`], zahl: z.n },
        richtig: z, pool: Z, n: WAHL[s - 1], R, zeige: x => ({ text: x.wort, fremd: true }), spalten: 2, nachher: [z.ton],
        loesung: { text: `${z.n} heisst ${z.wort}.`, ton: [z.ton] },
      })
      : K.wahl({
        frage: { text: 'Welche Zahl ist das?', ton: ['sp_welche_zahl'], wort: z.wort },
        richtig: z, pool: Z, n: 4, R, zeige: x => ({ zahl: x.n }), spalten: 2, nachher: [z.ton],
        loesung: { text: `${z.wort} heisst ${z.n}.`, ton: [z.ton] },
      })));
    const passt = w => x => !verwechselt(w.id, x.id);
    const woerterHoeren = (s, R) => R.reihe(W, LAENGE[s - 1]).map(w => K.wahl({
      frage: { text: 'Hör gut zu! Welches Bild passt?', ton: ['sp_hoer_bild', { pause: 250 }, w.ton], hoeren: w.ton },
      richtig: w, pool: W, n: WAHL[s - 1], R, passt: passt(w), zeige: x => ({ bild: x.bild }), spalten: WAHL[s - 1] === 3 ? 3 : 2,
      loesung: { text: `${w.wort} heisst «${w.de}».`, ton: [w.ton] },
    }));
    const woerterWie = (s, R) => R.reihe(W, LAENGE[s - 1]).map(w => K.wahl({
      frage: { text: `Wie sagt man «${w.de}» ${dieSprache}?`, ton: [`${l}_wie_sagt`], bild: w.bild, klein: true },
      richtig: w, pool: W, n: WAHL[s - 1], R, passt: passt(w), zeige: x => ({ text: x.wort, fremd: true }), spalten: 2, nachher: [w.ton],
      loesung: { text: `«${w.de}» heisst ${w.wort}.`, ton: [w.ton] },
    }));
    const woerterWas = (s, R) => R.reihe(W, LAENGE[s - 1]).map(w => K.wahl({
      frage: { text: 'Was heisst das auf Deutsch?', ton: ['sp_was_heisst', { pause: 250 }, w.ton], wort: w.wort, hoeren: w.ton },
      richtig: w, pool: W, n: WAHL[s - 1], R, passt: passt(w), zeige: x => ({ text: x.de }), spalten: 2,
      loesung: { text: `${w.wort} heisst «${w.de}».`, ton: [w.ton] },
    }));
    const zahlenReihe = (s, R) => Array.from({ length: 4 }, () => {
      const n = [4, 5, 6][s - 1], a = R.zahl(0, 10 - n), teile = Z.slice(a, a + n);
      return { art: 'reihe', frage: { text: 'Bring die Zahlen in die richtige Reihenfolge – von klein nach gross!', ton: ['sp_reihe'] },
        teile: R.mischen(teile).map(x => ({ id: x.id, text: x.wort, fremd: true, ton: x.ton })), reihenfolge: teile.map(x => x.id),
        loesung: { text: teile.map(x => x.wort).join(', '), ton: teile.map(x => x.ton) } };
    });
    const memory = (s, R) => R.ziehen(W, [6, 8, 10][s - 1]).map(w => ({ id: w.id, a: { bild: w.bild }, b: { text: w.wort, fremd: true, ton: w.ton } }));
    const karten = () => [
      ...Z.map(z => ({ titel: z.wort, fremd: true, zahl: z.n, unter: String(z.n), ton: [z.ton] })),
      ...W.map(w => ({ titel: w.wort, fremd: true, bild: w.bild, unter: w.de, ton: [w.ton] })),
    ];
    return {
      id: l, titel: L.name, untertitel: `Mit ${L.fname} nach ${L.land}`, farbe: L.farbe, banner: L.banner, figur: `${L.freund}_hallo`,
      intro: [`${l}_hallo`, { pause: 300 }, `${l}_mungg`], freund: { name: L.fname, hallo: `${L.freund}_hallo`, jubel: `${L.freund}_jubel`, lob: [1, 2, 3].map(i => `${l}_lob_${i}`) },
      sprache: l, karten,
      uebungen: [
        { id: 'zahlen_hoeren', titel: 'Zahlen hören', text: 'Welche Zahl hörst du?', ab: 1, icon: 'ohr', runde: zahlenHoeren },
        { id: 'woerter_hoeren', titel: 'Wörter hören', text: 'Welches Bild passt?', ab: 1, icon: 'ohr', runde: woerterHoeren },
        { id: 'memory', titel: 'Wörter-Memory', text: 'Finde Bild und Wort', ab: 1, icon: 'memory', paare: memory },
        { id: 'zahlen_lesen', titel: 'Zahlen lesen', text: `Die Zahlen ${dieSprache}`, ab: 2, icon: 'zahlen', runde: zahlenLesen },
        { id: 'woerter_wie', titel: 'Wie sagt man …?', text: `Vom Deutschen ins ${L.name}e`, ab: 2, icon: 'sprechblase', runde: woerterWie },
        { id: 'woerter_was', titel: 'Was heisst das?', text: `Vom ${L.name}en ins Deutsche`, ab: 2, icon: 'choose', runde: woerterWas },
        { id: 'zahlen_reihe', titel: 'Zahlen ordnen', text: 'Von klein nach gross', ab: 3, icon: 'reihe', runde: zahlenReihe },
      ],
      sticker: L.sticker,
    };
  }

  const STIMME = { fr: 'leo', en: 'bao', it: 'gina', es: 'pepe' };
  const toene = [
    ['sp_intro', 'mungg', '[excited] Steig ein in den Ballon! Wir besuchen meine Freunde in Frankreich, England, Italien und Spanien.'],
    ['sp_hoer_zahl', 'mungg', 'Hör gut zu! Welche Zahl ist das?'],
    ['sp_hoer_bild', 'mungg', 'Hör gut zu! Welches Bild passt?'],
    ['sp_was_heisst', 'mungg', 'Was heißt das auf Deutsch?'],
    ['sp_welche_zahl', 'mungg', 'Welche Zahl ist das?'],
    ['sp_reihe', 'mungg', 'Bring die Zahlen in die richtige Reihenfolge, von klein nach groß!'],
  ];
  SPRACHEN.forEach(L => {
    const l = L.id, r = STIMME[l];
    toene.push([`${l}_mungg`, 'mungg', L.mungg], [`${l}_wie_sagt`, 'mungg', `Wie sagt man das auf ${L.name}?`],
      [`${l}_zahl_wie`, 'mungg', `Wie heißt diese Zahl auf ${L.name}?`], [`${l}_hallo`, r, L.hallo]);
    L.lob.forEach((t, i) => toene.push([`${l}_lob_${i + 1}`, r, t]));
    L.zahlen.forEach((t, i) => toene.push([`${l}_z_${i + 1}`, r, `${t[0].toUpperCase()}${t.slice(1)}.`]));
    // Gross und mit Punkt: «papa» allein las die Stimme undeutlich (beide Spracherkennungen hörten «Tata», 2026-11-01)
    WOERTER.forEach(w => {
      const t = w[L.spalte].replace(/’/g, "'");
      toene.push([`${l}_w_${w[0]}`, r, (L.sprich || {})[w[0]] || `${t[0] === '¿' ? '¿' + t[1].toUpperCase() + t.slice(2) : t[0].toUpperCase() + t.slice(1)}${/[?!.]$/.test(t) ? '' : '.'}`]);
    });
  });

  K.modul({
    id: 'sprachen', titel: 'Sprachen', untertitel: 'Französisch, Englisch, Italienisch, Spanisch', farbe: '#7A4FC4',
    banner: 'banner_sprachen', figur: 'mungg_koffer', intro: 'sp_intro',
    themen: SPRACHEN.map(thema),
    toene,
    daten: { WOERTER, SPRACHEN },
  });
})();
