/* Paydates V2 — COMMUNITY POLLS: de enige bron voor alle polls (live + archief).
   ─────────────────────────────────────────────────────────────────────────────
   Een poll toevoegen (bijv. de 100e): kopieer één regel-blok hieronder, plak het BOVENAAN de lijst
   en pas aan. Geen HTML aanpassen — homepage, archief (polls.html) en admin lezen deze lijst.

   Velden
     id      uniek en nooit hergebruiken, bv. "p_2026_11"          (vereist)
     q       de vraag                                              (vereist)
     cat     categorie: Seks & relaties | Daten | Veiligheid | Platform | Tarieven  (vrij te kiezen)
     status  "live" | "archief" | "concept"   → max. 1 live; zet je een nieuwe op live, dan gaat de
             vorige live poll automatisch naar het archief (eind = startdatum van de nieuwe)
     start   "JJJJ-MM-DD"   end: "JJJJ-MM-DD" of null (live)
     options [["Antwoord", startaantal], …]  2–8 antwoorden. Startaantallen = demo/seed (0 voor echt nieuw).
     desc    optionele toelichting

   Let op: dit is een .js-bestand (geen .json) zodat het ook via file:// werkt (fetch() van JSON wordt
   lokaal geblokkeerd). Admin → Community polls → "Export" levert exact dit formaat op.
   Productie: vervangen door GET /api/polls (zie admin/README-GAP.md). */
window.PD_POLLS = [
  {id:"p_live", cat:"Seks & relaties", status:"live", start:"2026-11-01", end:null, q:"Hoe vaak heb jij seks?",
   options:[["Dagelijks",412],["Meerdere keren per week",1386],["1× per week",1104],["Paar keer per maand",967],["Zelden",538],["Liever niet zeggen",291]]},

  {id:"p_5", cat:"Daten", status:"archief", start:"2026-09-27", end:"2026-10-04", q:"Waar heb je het liefst een date?",
   options:[["Bij mij thuis",1210],["Bij de ander thuis",842],["In een hotel",1975],["In een club of privéhuis",688],["Maakt me niet uit",403]]},
  {id:"p_4", cat:"Platform", status:"archief", start:"2026-08-28", end:"2026-09-04", q:"Wat vind je het belangrijkst in een advertentie?",
   options:[["Echte, recente foto’s",2861],["Duidelijke tarieven",1534],["Verificatievinkje",1192],["Reviews",644],["Snelle reactie",511]]},
  {id:"p_3", cat:"Daten", status:"archief", start:"2026-07-29", end:"2026-08-05", q:"Hoe neem je meestal contact op?",
   options:[["WhatsApp",3120],["Bellen",1088],["Sms",402],["Via de Paydates Chat",876],["E-mail",219]]},
  {id:"p_2", cat:"Daten", status:"archief", start:"2026-06-29", end:"2026-07-06", q:"Welk moment van de dag heeft je voorkeur?",
   options:[["Ochtend",544],["Middag",1218],["Vroege avond",1902],["Late avond",2240],["Nacht",731]]},
  {id:"p_1", cat:"Veiligheid", status:"archief", start:"2026-05-30", end:"2026-06-06", q:"Gebruik je altijd een condoom bij een nieuwe date?",
   options:[["Altijd",3984],["Meestal",902],["Hangt af van de afspraak",371],["Liever niet zeggen",288]]},
  {id:"p_2026_04", cat:"Platform", status:"archief", start:"2026-04-30", end:"2026-05-07", q:"Wat vind je van verificatievinkjes op advertenties?",
   options:[["Onmisbaar",2214],["Fijn, maar niet nodig",1630],["Let ik niet op",688],["Wist niet wat het is",240]]},
  {id:"p_2026_03b", cat:"Platform", status:"archief", start:"2026-03-31", end:"2026-04-07", q:"Hoe betaal je het liefst voor credits?",
   options:[["iDEAL / Wero",2702],["Creditcard",611],["Bancontact",305],["Bellen of sms",422],["Bitcoin",187]]},
  {id:"p_2026_03", cat:"Daten", status:"archief", start:"2026-03-01", end:"2026-03-08", q:"Hoe lang duurt jouw ideale date?",
   options:[["30 minuten",402],["1 uur",1877],["2 uur",1520],["Een hele avond",934],["Overnight",366]]},
  {id:"p_2026_01", cat:"Tarieven", status:"archief", start:"2026-01-30", end:"2026-02-06", q:"Wat vind jij een redelijk uurtarief?",
   options:[["Tot € 100",688],["€ 100 – € 150",1702],["€ 150 – € 200",1543],["€ 200 – € 300",802],["Meer dan € 300",219]]},
  {id:"p_2025_12b", cat:"Veiligheid", status:"archief", start:"2025-12-31", end:"2026-01-07", q:"Hoe vaak laat jij je testen op soa’s?",
   options:[["Elke 3 maanden",1105],["Elk half jaar",1290],["Eens per jaar",988],["Alleen bij klachten",764],["Nooit",312]]},
  {id:"p_2025_12", cat:"Daten", status:"archief", start:"2025-12-01", end:"2025-12-08", q:"Hoe vind je meestal een date?",
   options:[["Via Paydates",2480],["Andere advertentiesite",1012],["Dating-app",866],["Via vrienden / mond-tot-mond",301],["Social media",455]]}
];
