// Všechny texty hry na jednom místě. Úpravy textů dělej jen tady.
// Všechny peněžní částky u postav jsou fiktivní ilustrační čísla pro scénář, ne tvrzení o skutečnosti.
// Kódy odpovědí (k:) respondent nevidí: BANK, OTHER_FIN, ONLINE, AI, PEOPLE, PRO, INST, NONE a K / T / P / S.
window.CONTENT = {
  intro: {
    title: "Cesta od 18 do 30",
    paragraphs: [
      "Ahoj! Jsem Filip, studuju a píšu případovou studii o tom, jak mladí lidé řeší peníze.",
      "Zahraješ si krátkou hru o jedné postavě. Zabere asi 3 minuty a budu ti hodně vděčný. Nejde o správné odpovědi, zajímá mě, co bys opravdu udělal/a."
    ],
    privacy: [
      "Dobrovolné a anonymní, neptám se na jméno ani e-mail",
      "Data použiju jen ve své studii a nikomu je nepředám",
      "Můžeš to kdykoli zavřít"
    ],
    button: "Jdeme na to"
  },

  back: "Zpět",
  next: "Dál",
  startPlay: "Jdeme na to",

  under18: {
    title: "Díky, že jsi tu",
    text: "Studii dělám pro lidi od 18 do 30 let, takže tě tu bohužel nepotřebuju. Nic jsem si o tobě neuložil. Díky za zájem a hezký den."
  },

  // ---------- Základ ----------
  base: {
    vek: {
      q: "Kolik ti je?",
      options: [
        { v: "18-21", t: "18 až 21" },
        { v: "22-25", t: "22 až 25" },
        { v: "26-30", t: "26 až 30" },
        { v: "jine", t: "Je mi víc než 30" },
        { v: "pod18", t: "Je mi míň než 18" }
      ]
    },
    banka: {
      q: "Která banka je tvoje hlavní, tu, kterou nejvíc používáš?",
      options: [
        { v: "csas", t: "Česká spořitelna" },
        { v: "csob", t: "ČSOB" },
        { v: "kb", t: "Komerční banka" },
        { v: "rb", t: "Raiffeisenbank" },
        { v: "air", t: "Air Bank" },
        { v: "moneta", t: "Moneta" },
        { v: "fio", t: "Fio" },
        { v: "mbank", t: "mBank" },
        { v: "revolut", t: "Revolut nebo jiný fintech" },
        { v: "jina", t: "Jiná" }
      ]
    }
  },

  // ---------- Výběr postavy ----------
  pick: {
    q: "Koho si zahraješ?",
    hint: "Vyber toho, komu jsi nejblíž.",
    shodaQ: "Je to podobné tvé situaci?",
    shoda: [
      { v: "presne", t: "Je to přesně moje situace" },
      { v: "trochu", t: "Trochu" },
      { v: "role", t: "Vůbec, hraju roli" }
    ]
  },

  // ---------- Postavy ----------
  // start / after: příjem (income), nájem (rent), zbývá za měsíc (left), našetřeno (saved)
  // scéna: month = měsíc na časové ose, change.banner = viditelná změna situace, change.after = nový stav karty,
  // change.focus = které údaje karty zdůraznit (jen když se číslo nemění)
  chars: [
    {
      id: 1, icon: "🎓", name: "Míša", age: 21, label: "Student/ka", plural: false,
      sub: "Sdílený podnájem a málo peněz",
      intro: "Bydlíš ve sdíleném podnájmu. Měsíčně máš kolem 14 000 Kč (brigáda a příspěvek od rodičů), nájem je 6 500 Kč. Na spoření moc nezbývá.",
      start: { income: 14000, rent: 6500, left: 3000, saved: 8000 },
      scenes: [
        {
          id: "1.1", month: 3, title: "Nové bydlení",
          text: "Majitel ti zvyšuje nájem o 1 500 Kč. Našel/a jsi jiný podnájem, ale chtějí kauci 13 000 Kč.",
          change: { banner: "Nájem je o 1 500 Kč vyšší", after: { income: 14000, rent: 8000, left: 1500, saved: 8000 } },
          options: [
            { k: "BANK", t: "Podívám se v appce své banky, jestli si mohu kauci půjčit nebo rozložit" },
            { k: "PEOPLE", t: "Zeptám se rodičů, jestli mi kauci půjčí" },
            { k: "ONLINE", t: "Hledám na internetu, jak jde kauce zaplatit levněji nebo bez ní" },
            { k: "AI", t: "Zeptám se AI, co dělat" },
            { k: "OTHER_FIN", t: "Podívám se na aplikace fintechů, jestli nabízejí něco výhodnějšího" },
            { k: "NONE", t: "Zůstanu a zkusím vyjednat nižší nájem" }
          ],
          help: [
            { k: "K", t: "Spočítat, kolik si můžu dovolit" },
            { k: "T", t: "Jistota, že za rozložení kauce nezaplatím skryté poplatky" },
            { k: "P", t: "Rychlé řešení kauce bez drahé půjčky" },
            { k: "S", t: "Nic z toho, problém jsou prostě vysoké nájmy" }
          ]
        },
        {
          id: "1.2", month: 6, title: "Výpadek brigády",
          text: "Končí ti brigáda, měsíčně máš o 5 000 Kč méně a v rezervě jen 8 000 Kč.",
          change: { banner: "Příjem klesl o 5 000 Kč", after: { income: 9000, rent: 8000, left: -3500, saved: 8000 } },
          options: [
            { k: "BANK", t: "Podívám se do appky, jestli mi banka nabídne rezervu nebo možnost přečerpání" },
            { k: "INST", t: "Zeptám se školy nebo zaměstnavatele na práci či stipendium" },
            { k: "PEOPLE", t: "Zeptám se rodičů" },
            { k: "ONLINE", t: "Hledám na internetu, kde šetřit nebo přivydělat" },
            { k: "AI", t: "Zeptám se AI" },
            { k: "NONE", t: "Nic, snížím výdaje" }
          ],
          help: [
            { k: "K", t: "Přehled, co můžu seškrtat" },
            { k: "T", t: "Půjčka bez skrytých poplatků" },
            { k: "P", t: "Rychlá rezerva, která není drahá" },
            { k: "S", t: "Potřebuju práci, ne finanční radu" }
          ]
        },
        {
          id: "1.3", month: 9, title: "Erasmus",
          text: "Za dva měsíce jedeš na Erasmus. Čekají tě platby v cizí měně a první měsíc bez příjmu.",
          change: { banner: "První měsíc v zahraničí bez příjmu", after: { income: 0, rent: 8000, left: -12500, saved: 8000 } },
          options: [
            { k: "BANK", t: "Zeptám se své banky na platby a poplatky v zahraničí" },
            { k: "OTHER_FIN", t: "Založím si účet u fintechu, třeba Revolut nebo Wise" },
            { k: "ONLINE", t: "Hledám na internetu nebo ve skupinách Erasmus studentů, co se vyplatí" },
            { k: "PEOPLE", t: "Zeptám se kamarádů, kteří už byli" },
            { k: "AI", t: "Zeptám se AI" },
            { k: "INST", t: "Zeptám se školy" }
          ],
          help: [
            { k: "K", t: "Vědět, kolik budu v zahraničí potřebovat" },
            { k: "T", t: "Jistota, že mi karta nebude blokovaná a nezaplatím skryté poplatky" },
            { k: "P", t: "Účet nebo karta bez poplatků v cizí měně" },
            { k: "S", t: "Většinu řeší škola, ne já" }
          ]
        }
      ]
    },
    {
      id: 2, icon: "💼", name: "Saša", age: 26, label: "Mladý profesionál", plural: false,
      sub: "Pracuješ tři roky a máš volné peníze",
      intro: "Pracuješ tři roky, čistý příjem je 48 000 Kč, nájem v podnájmu 15 000 Kč. Po výdajích ti zbývá kolem 12 000 Kč měsíčně. Žiješ sám/sama, bez dětí.",
      start: { income: 48000, rent: 15000, left: 12000, saved: 120000 },
      scenes: [
        {
          id: "2.1", month: 3, title: "Odměna",
          text: "Dostal/a jsi odměnu 40 000 Kč. Co s ní uděláš?",
          change: { banner: "Odměna +40 000 Kč", after: { income: 48000, rent: 15000, left: 52000, saved: 120000 } },
          options: [
            { k: "BANK", t: "Dám ji na spořicí účet u své banky" },
            { k: "OTHER_FIN", t: "Podívám se na investování přes broker, třeba XTB nebo Trading 212" },
            { k: "ONLINE", t: "Hledám na internetu nebo YouTube, kam peníze uložit" },
            { k: "AI", t: "Zeptám se AI" },
            { k: "PEOPLE", t: "Probere to s kamarády nebo rodinou" },
            { k: "PRO", t: "Domluvím se s finančním poradcem" }
          ],
          help: [
            { k: "K", t: "Vědět, co se mi vyplatí a jak riskantní která varianta je" },
            { k: "T", t: "Rada nezávislá na tom, co chce banka prodat" },
            { k: "P", t: "Jednoduchý produkt, kam to dám a nemusím to řešit" },
            { k: "S", t: "Nic, peníze si spravuju sám/sama" }
          ]
        },
        {
          id: "2.2", month: 6, title: "Vlastní bydlení",
          text: "Přemýšlíš, jestli se nevyplatí šetřit na vlastní byt místo placení nájmu.",
          change: { banner: "Za rok nájmu zaplatíš 180 000 Kč", after: { income: 48000, rent: 15000, left: 12000, saved: 120000 }, focus: ["rent"] },
          options: [
            { k: "BANK", t: "Spočítám si to na kalkulačce na webu své banky" },
            { k: "ONLINE", t: "Podívám se na webové srovnávače hypoték" },
            { k: "AI", t: "Zeptám se AI" },
            { k: "PEOPLE", t: "Probere to s kamarády nebo rodinou" },
            { k: "PRO", t: "Domluvím schůzku s poradcem" },
            { k: "NONE", t: "Zatím to neřeším" }
          ],
          help: [
            { k: "K", t: "Vědět, kolik musím našetřit a za jak dlouho" },
            { k: "T", t: "Jistota, že mi nikdo nenabízí jen to, co se jemu hodí" },
            { k: "P", t: "Produkt, který mi na to postupně spoří a počítá s tím" },
            { k: "S", t: "Nic z toho, ceny bytů jsou prostě nedostupné" }
          ]
        },
        {
          id: "2.3", month: 9, title: "Nová práce",
          text: "Nastupuješ do nové práce a příjem se zvedá na 58 000 Kč. Chceš si nastavit peníze znovu.",
          change: { banner: "Příjem vzrostl o 10 000 Kč", after: { income: 58000, rent: 15000, left: 22000, saved: 120000 } },
          options: [
            { k: "BANK", t: "Přehledně to přenastavím v appce své banky" },
            { k: "OTHER_FIN", t: "Najdu si aplikaci na rozpočet" },
            { k: "ONLINE", t: "Hledám na internetu tipy, jak si peníze rozdělit" },
            { k: "AI", t: "Zeptám se AI" },
            { k: "PEOPLE", t: "Poradím se s někým blízkým" },
            { k: "NONE", t: "Nechám to tak, jak to je" }
          ],
          help: [
            { k: "K", t: "Jasný plán, kolik kam posílat" },
            { k: "T", t: "Jistota, že mě nikdo nenutí do nevýhodných produktů" },
            { k: "P", t: "Aby se rozdělení peněz dělo automaticky" },
            { k: "S", t: "Nic, zvládnu to sám/sama" }
          ]
        }
      ]
    },
    {
      id: 3, icon: "👨‍👩‍👧", name: "Alex a Jindra", age: 29, label: "Rodina", plural: true,
      sub: "Čekáte dítě a chcete vlastní bydlení",
      intro: "Žijete s partnerem nebo partnerkou v nájmu za 22 000 Kč. Společný čistý příjem je 95 000 Kč, máte našetřeno 400 000 Kč. Čekáte první dítě a chcete vlastní bydlení.",
      start: { income: 95000, rent: 22000, left: 18000, saved: 400000 },
      scenes: [
        {
          id: "3.1", month: 3, title: "Narození dítěte",
          text: "Narodí se vám dítě. Jeden z vás jde na rodičovskou, příjem klesne o 30 000 Kč měsíčně a přibydou výdaje.",
          change: { banner: "Příjem klesl o 30 000 Kč a přibydou výdaje", after: { income: 65000, rent: 22000, left: -12000, saved: 400000 } },
          options: [
            { k: "BANK", t: "Přepočítáme rozpočet v appce své banky" },
            { k: "ONLINE", t: "Hledáme na internetu kalkulačky a tipy pro rodiny" },
            { k: "AI", t: "Zeptáme se AI" },
            { k: "PEOPLE", t: "Zeptáme se rodiny a kamarádů s dětmi" },
            { k: "PRO", t: "Domluvíme se s poradcem nebo pojišťovnou" },
            { k: "NONE", t: "Zatím nic" }
          ],
          help: [
            { k: "K", t: "Vidět, co se změní a jak dlouho vydržíme" },
            { k: "T", t: "Jistota, že pojištění a spoření nám nikdo nenavrhuje jen kvůli provizi" },
            { k: "P", t: "Produkt, který počítá s rodičovskou a novými výdaji" },
            { k: "S", t: "Nic z toho, chybí podpora od státu nebo zaměstnavatele" }
          ]
        },
        {
          id: "3.2", month: 6, title: "Hypotéka",
          text: "Našli jste byt za 6 000 000 Kč. Máte našetřeno 400 000 Kč a hypotéku zatím nemáte.",
          change: { banner: "Byt stojí 6 000 000 Kč, máte našetřeno asi 7 % jeho ceny", after: { income: 65000, rent: 22000, left: -12000, saved: 400000 }, focus: ["saved"] },
          options: [
            { k: "BANK", t: "Požádáme o hypotéku u své banky" },
            { k: "PRO", t: "Obrátíme se na hypotečního poradce nebo zprostředkovatele" },
            { k: "ONLINE", t: "Porovnáme nabídky sami na webových srovnávačích" },
            { k: "AI", t: "Zeptáme se AI" },
            { k: "PEOPLE", t: "Zeptáme se rodiny" },
            { k: "OTHER_FIN", t: "Zkusíme jinou banku nebo fintech" }
          ],
          help: [
            { k: "K", t: "Vědět, jestli na hypotéku dosáhneme a co všechno stojí" },
            { k: "T", t: "Jistota, že nás nepodvedou na poplatcích" },
            { k: "P", t: "Způsob, jak se k bydlení dostat postupně, třeba s menší hotovostí" },
            { k: "S", t: "Nic z toho, ceny bytů jsou prostě mimo dosah" }
          ]
        },
        {
          id: "3.3", month: 9, title: "Nečekaný výdaj",
          text: "Rozbije se vám auto a oprava stojí 45 000 Kč. Zároveň platíte splátky.",
          change: { banner: "−45 000 Kč, oprava auta", after: { income: 65000, rent: 22000, left: -57000, saved: 400000 } },
          options: [
            { k: "BANK", t: "Podíváme se do appky, jestli máme rezervu nebo můžeme rozložit platbu" },
            { k: "OTHER_FIN", t: "Vezmeme spotřebitelskou půjčku od nebankovního poskytovatele nebo fintechu" },
            { k: "ONLINE", t: "Hledáme na internetu nejlevnější řešení" },
            { k: "AI", t: "Zeptáme se AI" },
            { k: "PEOPLE", t: "Půjčíme si od rodiny" },
            { k: "NONE", t: "Vezmeme to z rezervy a nic dalšího" }
          ],
          help: [
            { k: "K", t: "Vidět, jak to dopadne na rozpočet" },
            { k: "T", t: "Vědět, že rozložení platby nebude drahé" },
            { k: "P", t: "Rychlá rezerva nebo výhodné rozložení platby" },
            { k: "S", t: "Nic, je to prostě smůla" }
          ]
        }
      ]
    }
  ],

  // Základní scéna (stejná pro všechny postavy, měsíc 1)
  baseScene: {
    id: "zaklad", month: 1, title: "Běžný měsíc",
    text: "Je 20. v měsíci a zbývá ti míň peněz, než jsi čekal/a.",
    options: [
      { k: "BANK", t: "Podívám se do appky své banky, kolik mi zbývá" },
      { k: "NONE", t: "Nic zvláštního, nějak to vyjde" },
      { k: "ONLINE", t: "Hledám na internetu nebo YouTube tipy, jak ušetřit" },
      { k: "AI", t: "Zeptám se AI asistenta, jak si poradit" },
      { k: "PEOPLE", t: "Zeptám se rodičů nebo kamarádů" },
      { k: "OTHER_FIN", t: "Zkusím aplikaci jiné banky nebo fintechu, jestli mi pomůže" }
    ],
    help: [
      { k: "K", t: "Hned vidět, na co mi peníze odcházejí" },
      { k: "T", t: "Rada, o které vím, že není prodejní" },
      { k: "P", t: "Aby se to hlídalo samo a upozornilo mě včas" },
      { k: "S", t: "Nic, prostě mám málo peněz" }
    ]
  },

  // Tři otázky u každé scény (u rodiny množné číslo)
  q1: { s: "Co uděláš?", p: "Co uděláte?" },
  q2: { s: "Co by ti v tom nejvíc pomohlo?", p: "Co by vám v tom nejvíc pomohlo?" },
  q3: {
    s: "Jak moc by ses tím zabýval/a?", p: "Jak moc byste se tím zabývali?",
    options: {
      s: [
        { v: 1, t: "Skoro vůbec, vyřeším to za chvíli" },
        { v: 2, t: "Chvíli, během pár dnů" },
        { v: 3, t: "Hodně, bylo by to na týdny" }
      ],
      p: [
        { v: 1, t: "Skoro vůbec, vyřešíme to za chvíli" },
        { v: 2, t: "Chvíli, během pár dnů" },
        { v: 3, t: "Hodně, bylo by to na týdny" }
      ]
    }
  },

  card: { income: "Příjem za měsíc", rent: "Nájem", left: "Zbývá za měsíc", saved: "Našetřeno", age: "let", month: "Měsíc" },
  introStep: { button: "Jdeme na to" },

  // ---------- Závěr ----------
  wallet: {
    q: "Zhruba kolik procent svých financí (příjem, platby, spoření, investice) řešíš přes svoji hlavní banku?",
    caption: "Zbytek řešíš jinde, třeba u druhé banky, fintechu, brokera nebo v hotovosti.",
    placeholder: "Posuň jezdec",
    button: "Dál"
  },

  ending: {
    title: "Díky, fakt moc",
    paragraphs: [
      "Právě jsi mi pomohl/a s celou studií. Každá odpověď se počítá a já si toho moc vážím.",
      "Znáš někoho mezi 18 a 30, komu by to zabralo pár minut? Pošli mu to dál. Čím víc různých lidí, tím užitečnější data."
    ],
    share: "Pošli to dál",
    copied: "Odkaz je zkopírovaný",
    shareText: "Pomoz mi s případovou studií o tom, jak mladí lidé řeší peníze. Zabere to 3 minuty a je to anonymní.",
    note: "Tohle je orientační průzkum na menším vzorku lidí, ne reprezentativní statistika.",
    bonus: "Máš ještě minutu? Dvě rychlé otázky navíc",
    second: "Zahraj si ještě jednu postavu",
    secondDone: "Díky za druhé hraní, to mi moc pomohlo."
  },

  bonus: {
    platba: {
      q: "Představ si, že ti banka nabídne osobního finančního průvodce v appce: sestaví ti plán, ručí za doporučení a když chceš, spojí tě s člověkem. Zaplatil/a bys za to?",
      options: [
        { v: "zdarma", t: "Ne, měl/a by to být zdarma" },
        { v: "do50", t: "Do 50 Kč měsíčně" },
        { v: "50_150", t: "50 až 150 Kč měsíčně" },
        { v: "nad150", t: "Víc než 150 Kč měsíčně" }
      ]
    },
    hodnota: {
      q: "Připadalo by ti to jako…",
      options: [
        { v: "pridana_hodnota", t: "Přidaná hodnota, za kterou bych platil/a" },
        { v: "zdarma", t: "Hezké, ale mělo by to být zdarma" },
        { v: "informace_na_webu", t: "Informace, kterou si najdu na internetu" }
      ]
    },
    duvera: {
      q: "Komu bys při větším finančním rozhodnutí věřil/a nejvíc?",
      options: [
        { v: "moje_banka", t: "Moje banka" },
        { v: "banka_ai", t: "Banka s AI asistentem" },
        { v: "ai_tech", t: "AI asistent od technologické firmy" },
        { v: "nezavisly_poradce", t: "Nezávislý poradce" },
        { v: "influencer", t: "Influencer nebo tvůrce" },
        { v: "rodina_kamaradi", t: "Rodina a kamarádi" },
        { v: "nikomu", t: "Nikomu" }
      ]
    }
  },

  timeline: { ticks: [1, 3, 6, 9], monthLabel: "Měsíc", prep: "Než začneme", bonus: "Bonus" }
};
