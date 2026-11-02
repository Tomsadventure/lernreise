/* Modul «Sprachen»: Französisch, Englisch, Italienisch, Spanisch, Holländisch, Chinesisch, Japanisch – je die Zahlen 1 bis 10 und 20 erste Wörter.
   Jede Sprache ist ein eigenes Thema mit eigenem Look und einem Freund, der die Wörter spricht:
   Léo (Frosch, aus Wörtli-Frosch), Bao (Panda, aus Wörtli-Panda), Gina (Kätzchen), Pepe (Eselchen), Daan (Löwe), Long (Drache), Hiro (Shiba).
   Die Bilder der Wörter (w_*) gelten für alle Sprachen. Töne: <sprache>_z_<n>, <sprache>_w_<wort> (Freund), sp_* und <sprache>_* (Mungg). */
(function () {
  'use strict';
  const K = window.Kern;
  /* Wort-Id, Deutsch, Französisch, Englisch, Italienisch, Spanisch, Holländisch, Chinesisch (Pinyin, Zeichen), Japanisch (Romaji, Kana)
     Chinesisch und Japanisch (2026-11-02): angezeigt wird gross die Lautschrift, klein die Schrift; gesprochen wird die Schrift. */
  const WOERTER = [
    ['hallo', 'Hallo', 'salut', 'hello', 'ciao', 'hola', 'hallo', 'nǐ hǎo', '你好', 'konnichiwa', 'こんにちは'],
    ['guten_morgen', 'Guten Morgen', 'bonjour', 'good morning', 'buongiorno', 'buenos días', 'goedemorgen', 'zǎoshang hǎo', '早上好', 'ohayō', 'おはよう'],
    ['gute_nacht', 'Gute Nacht', 'bonne nuit', 'good night', 'buonanotte', 'buenas noches', 'welterusten', 'wǎn’ān', '晚安', 'oyasumi', 'おやすみ'],
    ['tschuess', 'Tschüss', 'au revoir', 'goodbye', 'arrivederci', 'adiós', 'tot ziens', 'zàijiàn', '再见', 'sayōnara', 'さようなら'],
    ['bitte', 'Bitte', 's’il te plaît', 'please', 'per favore', 'por favor', 'alsjeblieft', 'qǐng', '请', 'onegai shimasu', 'おねがいします'],
    ['danke', 'Danke', 'merci', 'thank you', 'grazie', 'gracias', 'dank je wel', 'xièxie', '谢谢', 'arigatō', 'ありがとう'],
    ['ja', 'Ja', 'oui', 'yes', 'sì', 'sí', 'ja', 'shì', '是', 'hai', 'はい'],
    ['nein', 'Nein', 'non', 'no', 'no', 'no', 'nee', 'bú shì', '不是', 'iie', 'いいえ'],
    ['entschuldigung', 'Entschuldigung', 'pardon', 'sorry', 'scusa', 'perdón', 'sorry', 'duìbuqǐ', '对不起', 'gomen nasai', 'ごめんなさい'],
    ['wie_gehts', 'Wie geht’s?', 'ça va ?', 'how are you?', 'come stai?', '¿cómo estás?', 'hoe gaat het?', 'nǐ hǎo ma?', '你好吗？', 'ogenki desu ka?', 'おげんきですか？'],
    ['mama', 'Mama', 'maman', 'mum', 'mamma', 'mamá', 'mama', 'māma', '妈妈', 'mama', 'ママ'],
    ['papa', 'Papa', 'papa', 'dad', 'papà', 'papá', 'papa', 'bàba', '爸爸', 'papa', 'パパ'],
    ['freund', 'der Freund', 'l’ami', 'friend', 'l’amico', 'el amigo', 'de vriend', 'péngyou', '朋友', 'tomodachi', 'ともだち'],
    ['hund', 'der Hund', 'le chien', 'dog', 'il cane', 'el perro', 'de hond', 'gǒu', '狗', 'inu', 'いぬ'],
    ['katze', 'die Katze', 'le chat', 'cat', 'il gatto', 'el gato', 'de kat', 'māo', '猫', 'neko', 'ねこ'],
    ['haus', 'das Haus', 'la maison', 'house', 'la casa', 'la casa', 'het huis', 'fángzi', '房子', 'uchi', 'うち'],
    ['schule', 'die Schule', 'l’école', 'school', 'la scuola', 'la escuela', 'de school', 'xuéxiào', '学校', 'gakkō', 'がっこう'],
    ['wasser', 'das Wasser', 'l’eau', 'water', 'l’acqua', 'el agua', 'het water', 'shuǐ', '水', 'mizu', 'みず'],
    ['brot', 'das Brot', 'le pain', 'bread', 'il pane', 'el pan', 'het brood', 'miànbāo', '面包', 'pan', 'パン'],
    ['apfel', 'der Apfel', 'la pomme', 'apple', 'la mela', 'la manzana', 'de appel', 'píngguǒ', '苹果', 'ringo', 'りんご'],
  ];
  /* Bilder, die man leicht verwechselt, kommen nie zusammen in eine Auswahl */
  const VERWECHSEL = [['hallo', 'tschuess'], ['hallo', 'guten_morgen'], ['ja', 'danke'], ['mama', 'papa'], ['freund', 'wie_gehts']];
  const verwechselt = (a, b) => VERWECHSEL.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const SPRACHEN = [
    { id: 'fr', spalte: 2, name: 'Französisch', land: 'Frankreich', freund: 'leo', fname: 'Léo', farbe: '#2F5DB8', banner: 'banner_fr',
      zahlen: ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'],
      hallo: 'Salut ! Je suis Léo. Bienvenue en France !', lob: ['Super !', 'Bravo !', 'Génial !'],
      // Léos Stimme liest Einzelwörter mit Punkt falsch: «Sept.» und sogar «sept» als «septembre», «papa» wie «tata», «l'ami.» wie «lani».
      // Mit Ausrufezeichen spricht sie richtig («sept !» = [sɛt], Lautschrift-Prüfung 2026-11-02).
      ende: ' !',
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
    // 2026-11-02 (Wunsch des Benutzers): Holländisch, Chinesisch, Japanisch – Freunde im coolen Comic-Stil wie das Maskottchen
    { id: 'nl', spalte: 6, name: 'Holländisch', land: 'Holland', freund: 'daan', fname: 'Daan', farbe: '#F07A14', banner: 'banner_nl',
      zahlen: ['één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien'],
      hallo: 'Hoi! Ik ben Daan. Welkom in Nederland!', lob: ['Goed zo!', 'Super!', 'Geweldig!'],
      mungg: 'Das ist Daan, mein Freund aus Holland. Mit ihm lernst du Holländisch!',
      sticker: [['st_windmuehle', 'Bei den Windmühlen'], ['st_grachten', 'Velo an der Gracht'], ['st_kaese', 'Auf dem Käsemarkt'], ['st_tulpen', 'Im Tulpenfeld']] },
    { id: 'zh', spalte: 7, schrift: 8, lang: 'zh-Hans', name: 'Chinesisch', land: 'China', freund: 'long', fname: 'Long', farbe: '#D42F2F', banner: 'banner_zh',
      zahlen: ['yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ', 'shí'], zahlenSchrift: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
      hallo: '你好！我是龙。欢迎来到中国！', lob: ['太棒了！', '很好！', '真棒！'], ende: '。',
      mungg: 'Das ist Long, ein Drache aus China. Long heißt auf Chinesisch Drache. Mit ihm lernst du Chinesisch!',
      hinweis: { ja: 'Ein Wort für «ja» gibt es auf Chinesisch nicht. Man sagt «shì» – das heisst «stimmt so».', nein: '«bú shì» heisst «stimmt nicht» – so sagt man «nein».' },
      sticker: [['st_mauer', 'Auf der Chinesischen Mauer'], ['st_nudeln', 'Nudeln mit Stäbchen'], ['st_laterne', 'Am Laternenfest'], ['st_drachenboot', 'Im Drachenboot']] },
    { id: 'ja', spalte: 9, schrift: 10, lang: 'ja', name: 'Japanisch', land: 'Japan', freund: 'hiro', fname: 'Hiro', farbe: '#C2185B', banner: 'banner_ja',
      zahlen: ['ichi', 'ni', 'san', 'yon', 'go', 'roku', 'nana', 'hachi', 'kyū', 'jū'], zahlenSchrift: ['いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう'],
      hallo: 'こんにちは！ぼくはヒロ。にほんへようこそ！', lob: ['すごい！', 'よくできました！', 'やったね！'], ende: '。',
      mungg: 'Das ist Hiro aus Japan. Mit ihm lernst du Japanisch!',
      sticker: [['st_fuji', 'Am Berg Fuji'], ['st_sushi', 'Sushi'], ['st_shinkansen', 'Im Shinkansen'], ['st_origami', 'Origami']] },
  ];
  const LAENGE = [8, 10, 12];
  const WAHL = [3, 4, 4];

  function thema(L) {
    const l = L.id;
    const sch = schrift => (schrift ? { schrift, lang: L.lang } : {});
    const W = WOERTER.map(r => ({ id: r[0], de: r[1], wort: r[L.spalte], ...sch(L.schrift && r[L.schrift]), bild: `w_${r[0]}`, ton: `${l}_w_${r[0]}` }));
    const Z = L.zahlen.map((wort, i) => ({ id: `z${i + 1}`, n: i + 1, wort, ...sch(L.zahlenSchrift && L.zahlenSchrift[i]), ton: `${l}_z_${i + 1}` }));
    const fremd = x => ({ text: x.wort, fremd: true, ...sch(x.schrift) });
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
        richtig: z, pool: Z, n: WAHL[s - 1], R, zeige: fremd, spalten: 2, nachher: [z.ton],
        loesung: { text: `${z.n} heisst ${z.wort}.`, ton: [z.ton] },
      })
      : K.wahl({
        frage: { text: 'Welche Zahl ist das?', ton: ['sp_welche_zahl'], wort: z.wort, ...sch(z.schrift) },
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
      richtig: w, pool: W, n: WAHL[s - 1], R, passt: passt(w), zeige: fremd, spalten: 2, nachher: [w.ton],
      loesung: { text: `«${w.de}» heisst ${w.wort}.`, ton: [w.ton] },
    }));
    const woerterWas = (s, R) => R.reihe(W, LAENGE[s - 1]).map(w => K.wahl({
      frage: { text: 'Was heisst das auf Deutsch?', ton: ['sp_was_heisst', { pause: 250 }, w.ton], wort: w.wort, ...sch(w.schrift), hoeren: w.ton },
      richtig: w, pool: W, n: WAHL[s - 1], R, passt: passt(w), zeige: x => ({ text: x.de }), spalten: 2,
      loesung: { text: `${w.wort} heisst «${w.de}».`, ton: [w.ton] },
    }));
    const zahlenReihe = (s, R) => Array.from({ length: 4 }, () => {
      const n = [4, 5, 6][s - 1], a = R.zahl(0, 10 - n), teile = Z.slice(a, a + n);
      return { art: 'reihe', frage: { text: 'Bring die Zahlen in die richtige Reihenfolge – von klein nach gross!', ton: ['sp_reihe'] },
        teile: R.mischen(teile).map(x => ({ id: x.id, ...fremd(x), ton: x.ton })), reihenfolge: teile.map(x => x.id),
        loesung: { text: teile.map(x => x.wort).join(', '), ton: teile.map(x => x.ton) } };
    });
    const memory = (s, R) => R.ziehen(W, [6, 8, 10][s - 1]).map(w => ({ id: w.id, a: { bild: w.bild }, b: { ...fremd(w), ton: w.ton } }));
    const karten = () => [
      ...Z.map(z => ({ titel: z.wort, fremd: true, ...sch(z.schrift), zahl: z.n, unter: String(z.n), ton: [z.ton] })),
      ...W.map(w => ({ titel: w.wort, fremd: true, ...sch(w.schrift), bild: w.bild, unter: w.de, text: (L.hinweis || {})[w.id], ton: [w.ton] })),
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

  const STIMME = { fr: 'leo', en: 'bao', it: 'gina', es: 'pepe', nl: 'daan', zh: 'long', ja: 'hiro' };
  const toene = [
    ['sp_intro', 'gian', '[excited] Steig ein in den Ballon! Wir besuchen meine Freunde in Frankreich, England, Italien, Spanien, Holland, China und Japan.'],
    ['sp_hoer_zahl', 'gian', 'Hör gut zu! Welche Zahl ist das?'],
    ['sp_hoer_bild', 'gian', 'Hör gut zu! Welches Bild passt?'],
    ['sp_was_heisst', 'gian', 'Was heißt das auf Deutsch?'],
    ['sp_welche_zahl', 'gian', 'Welche Zahl ist das?'],
    ['sp_reihe', 'gian', 'Bring die Zahlen in die richtige Reihenfolge, von klein nach groß!'],
  ];
  SPRACHEN.forEach(L => {
    const l = L.id, r = STIMME[l];
    toene.push([`${l}_mungg`, 'gian', L.mungg], [`${l}_wie_sagt`, 'gian', `Wie sagt man das auf ${L.name}?`],
      [`${l}_zahl_wie`, 'gian', `Wie heißt diese Zahl auf ${L.name}?`], [`${l}_hallo`, r, L.hallo]);
    L.lob.forEach((t, i) => toene.push([`${l}_lob_${i + 1}`, r, t]));
    L.zahlen.forEach((t, i) => toene.push([`${l}_z_${i + 1}`, r, L.zahlenSchrift ? `${L.zahlenSchrift[i]}${L.ende}` : `${t[0].toUpperCase()}${t.slice(1)}${L.ende || '.'}`]));
    // Gross und mit Punkt: «papa» allein las die Stimme undeutlich (beide Spracherkennungen hörten «Tata», 2026-11-01)
    WOERTER.forEach(w => {
      const t = w[L.schrift || L.spalte].replace(/’/g, "'");
      // Wörter mit «l'» klein lassen (sonst kann «L» als Buchstabe gelesen werden)
      const gross = /^l'/i.test(t) ? t : t[0] === '¿' ? '¿' + t[1].toUpperCase() + t.slice(2) : t[0].toUpperCase() + t.slice(1);
      toene.push([`${l}_w_${w[0]}`, r, (L.sprich || {})[w[0]] || `${gross}${/[?!.？！。]$/.test(t) ? '' : L.ende || '.'}`]);
    });
  });

  K.modul({
    id: 'sprachen', titel: 'Sprachen', untertitel: 'Sieben Sprachen von Französisch bis Japanisch', farbe: '#7A4FC4',
    banner: 'banner_sprachen', figur: 'figur_koffer', intro: 'sp_intro',
    themen: SPRACHEN.map(thema),
    toene,
    daten: { WOERTER, SPRACHEN },
  });
})();
