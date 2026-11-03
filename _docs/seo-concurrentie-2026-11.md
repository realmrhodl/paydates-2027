# Paydates V2: SEO-concurrentieanalyse en gap-analyse (nov 2026)

*Stand: 3 nov 2026. Concept: `/workspace/paydates-v2-concept/`. Er is geen betaalde SEO-tool gebruikt (geen Ahrefs, Semrush of Similarweb). Prioriteiten zijn afgeleid uit wie er in de zoekresultaten staat, uit sitemaps, URL-structuur en title/H1-templates van concurrenten. Volumes zijn **relatieve schattingen** (hoog/midden/laag), geen gemeten aantallen.*

*Page: https://cursor.com/canvas/store-94668f5f-c118-4026-b828-cfe923127a51/62f4ef60-ec6c-4094-a8e2-282f4d538397*

## Executive summary

1. **Er is een blokkerend probleem op de live site.** `paydates.nl` geeft bezoekers zonder cookie (getest met een gewone browser en met een Googlebot-user-agent) alleen de leeftijdspoort, met `<meta name="robots" content="noindex, nofollow">`. Ook `robots.txt` en `sitemap.xml` geven die poort-HTML terug. Ik heb vanaf een gewoon IP getest, niet vanaf een geverifieerd Google-IP. Controleer het daarom met URL-inspectie in Search Console. Klopt het, dan valt de hele site langzaam uit Google. **Fix dit als eerste.**
2. **De concurrenten winnen op een matrix van dienst × stad, met indexeerbare advertentiepagina's.** Kinky heeft `/vrouwen/prive-ontvangst/amsterdam`, `/seksbedrijven/privehuis/amsterdam` en `/advertenties/{id}-{naam}/`. Sexjobs heeft `/escort/amsterdam` en `/thuisontvangst` met dienst-tags. Ladies48 heeft `/prive-ontvangst/rotterdam/` en `/erotische-massage/rotterdam/`. Redlights heeft `/regio/{provincie}/{stad}.html`. V2 heeft maar één as: `escort-{stad}`.
3. **De 345 stadspagina's van V2 zijn vrijwel identiek.** Ze hebben elk ongeveer 780 woorden en alleen de stad en provincie verschillen. De advertenties laden pas via JavaScript (`assets/data.js`), dus Google ziet lege templatepagina's. Dat geeft een groot risico op "doorway/thin content". Concurrenten tonen echte advertenties in de HTML.
4. **Advertentie- en clubpagina's zijn niet indexeerbaar.** Het gaat om `advertentie.html?id=` (geen canonical, H1 is letterlijk `${esc(x.n)}`) en `club.html?id=` (noindex, 54 clubs). Juist de pagina's per advertentie ranken bij Sexguide en Tophookers op "escort utrecht" en "privé ontvangst rotterdam".
5. **Kansen waar Paydates nu al sterk staat:** het merkwoord "paydate" (paydates.nl en /faq staan al in de resultaten), het woordenboek (GFE/PSE/NZC), video's met VideoObject-schema, jobs met JobPosting-schema, en verificatie als onderscheid. Volgens Escortwijzer doen Sexjobs en Kinky alleen een ID-check bij vermoeden.

## Gekozen concurrenten (en waarom)

| Site | Waarom gekozen | Data |
|---|---|---|
| **kinky.nl** | Grootste merk, gevraagd. Volledige matrix van doelgroep × dienst × stad, NL en BE. | Cloudflare blokkeert direct ophalen. Archive.org-snapshot van `/vrouwen/prive-ontvangst/amsterdam` geanalyseerd, plus robots.txt. |
| **sexjobs.nl** | Grootste aanbod (Escortwijzer noemt 14.371 adverteerders per dag), actief sinds 2002, gevraagd. | Homepage, `/thuisontvangst` en `/escort/amsterdam` via WebFetch, plus robots.txt (3 sitemaps: advertenties, locaties, overig). |
| **redlights.nl** | Verschijnt in de resultaten voor "escort rotterdam privé ontvangst" en "shemale escort nederland". Volledige taxonomie van regio, dienst en doelgroep. | Volledig ophaalbaar: sitemap-index, titles, H1, schema. |
| **ladies48.com** | Verschijnt bij "privé ontvangst rotterdam" en "escort utrecht". Schoolvoorbeeld van een programmatische matrix met schema. | Sitemap met 5.981 URL's, titles, H1, schema. |
| **sexguide.nl / tophookers.nl** | Hetzelfde netwerk. De pagina's per advertentie ranken op "escort utrecht", "privé ontvangst eindhoven" en "privé ontvangst rotterdam". | Alleen uit de resultaten (Cloudflare 403). |
| **escortwijzer.nl** | Informatieve concurrent: rankt op "escort amsterdam" (EN-gids), "sexjobs/kinky alternatief" en "GFE PSE betekenis". | Homepage plus resultaten. |

## Keyword-clusters (prioriteit voor Paydates)

| # | Cluster en voorbeelden | Intent | Wie rankt / investeert | Volume (schatting) | Prio | V2-pagina |
|---|---|---|---|---|---|---|
| 1 | escort {stad}: escort amsterdam, escort rotterdam, escort utrecht | lokaal, transactioneel | Ladies48, Redlights, Sexguide/Tophookers, bureaus, Escortwijzer | hoog | P1 | `escort-{stad}.html` (bestaat, unieke content en server-side advertenties nodig) |
| 2 | privé ontvangst / thuisontvangst {stad} | lokaal, transactioneel | Kinky, Sexjobs, Ladies48, Tophookers, Redlights, Prive2day | hoog | P1 | **nieuw** `prive-ontvangst-{stad}.html` (top 30 steden) |
| 3 | erotische massage {stad} | lokaal, transactioneel | salon-sites, Ladies48, Kinky | hoog/midden | P1 | **nieuw** `erotische-massage-{stad}.html` |
| 4 | privéhuis / seksclub {stad} | lokaal | eigen sites van clubs, Kinky `/seksbedrijven/privehuis/{stad}`, Redlights `/adressen/` | midden/hoog | P1 | **nieuw** `privehuis-{stad}.html` en `seksclub-{stad}.html`, plus indexeerbare clubprofielen |
| 5 | advertentie-/profielpagina's: "{naam} ({leeftijd}) privé ontvangst {stad}" | long-tail, transactioneel | Sexguide, Tophookers, Kinky, Redlights | hoog (som van long-tail) | P1 | **nieuw** `/advertentie/{id}-{naam}-{stad}` (server-side) |
| 6 | werken als escort / privéhuis vacature / dames gezocht {stad} | commercieel (aanbod/adverteerders) | eigen sites van clubs, Sexjobs (vacatures op de homepage) | midden | P1 (aanbod) | `jobs.html` + **nieuw** `vacatures-{stad}.html` |
| 7 | escort advertentie plaatsen / gratis adverteren / sexjobs alternatief / kinky alternatief | commercieel (adverteerders) | Escortwijzer, sexdating-blog, Intimate | midden/laag | P2 | `adverteren.html` + **nieuw** `alternatief-sexjobs-kinky.html` |
| 8 | shemale / trans escort {stad} | lokaal | Redlights `/escort/shemale/`, Prive2day, Kinky `/shemales/` | midden | P2 | `trans.html` vs `shemales.html` (kannibalisatie oplossen) + top 10 steden |
| 9 | paydate betekenis, GFE/PSE/NZC betekenis | informatief | Escortwijzer, Societyservice, Desire-escorts, **Paydates al zichtbaar** | midden | P2 | `woordenboek-*.html` (bestaat, canonical en URL rechtzetten) |
| 10 | gangbang / seksfeest / swingersfeest {regio} | event, lokaal | eigen sites van clubs, Sexjobs (gangbang-sectie) | midden | P2 | `gangbangs.html` + URL per event + Event-schema |
| 11 | male escort / gigolo {stad} | lokaal | Kinky `/mannen/`, Redlights gigolo | laag/midden | P3 | `mannen.html` |
| 12 | Online: sexting / videobellen / webcam (bij ons heet "Virtueel" "Online") | transactioneel | Kinky `/virtual-sex`, Redlights `/virtuele-seks/`, Ladies48 | midden | P2 | **nieuw/hernoemen**: `online.html` is nu "Gebruikers online" |
| 13 | sexfilmpjes / amateur porno NL | informatief/entertainment | tube-sites (moeilijk) | hoog (lage kans) | P3 | `videos.html` (bestaat, schema is goed) |
| 14 | veilig afspreken / oplichting escort / tikkie aanbetaling | informatief (vertrouwen) | Sexjobs-klantenservice, Escortwijzer, Redlights `/veilig-afspreken/` | laag/midden | P2 | `veilig-daten.html` |
| 15 | dienst-facetten: hotel escort, cardate, GFE, milf, BBW, goedkope escort | long-tail | Sexjobs-tags, Ladies48 `/hotel-escort/`, `/goedkope-escort/` | midden | P3 | **later**: 3–5 landelijke facetpagina's |

## Snapshot per concurrent

**Kinky.nl**
- URL's: `/{vrouwen|mannen|shemales|stellen}/{escort|prive-ontvangst|erotische-massage|bdsm|raamprostitutie|virtual-sex|gangbang|neuken-zonder-condoom}/{stad}`, `/seksbedrijven/{privehuis|club|massagesalon|escortbureau|bdsm-studio|cinema}/{stad}` en `/advertenties/{id}-{naam}/`.
- Provinciepagina's staan op Disallow in robots.txt. Ze consolideren dus op steden.
- Title-voorbeeld: "Sexdate? Privé of thuisontvangst in Amsterdam | Kinky.nl!". H1: "Prive ontvangst in Amsterdam". H2: "Vrouwen die aan prive ontvangst doen in Amsterdam". Geen JSON-LD gezien.
- Interne links: honderden stadslinks per categoriepagina, plus ongeveer 30 advertentielinks.
- Wat Paydates mist: de dienst-as per stad, bedrijfstypen per stad en statische advertentie-URL's.

**Sexjobs.nl**
- URL's: `/{categorie}/{stad}` (bijv. `/escort/amsterdam`), `/thuisontvangst`, dienst-tags (Aftreksex, GFE, Hotel Escort, Milf, BBW, Cardate, Wapdate, Koppels …).
- Sitemaps apart voor advertenties, locaties en overig. Filter-parameters staan op Disallow.
- H1-patroon met aantal: "53 resultaten voor Escort in Amsterdam" en "540 resultaten voor Thuisontvangst". De paginakop is "Voor een Geile Escort in Amsterdam, kijk snel op Sexjobs.nl".
- Enorme interne linking naar dorpen (honderden plaatsnamen per pagina).
- De homepage combineert advertenties, gangbang-events en vacatures.
- Wat Paydates mist: aantallen in de H1, facet-tags, events en vacatures op de homepage, aparte advertentie-sitemap.

**Redlights.nl**
- URL's: `/regio/{provincie}/{stad}.html`, `/{escort|thuisontvangst}/{dames|shemale|gigolo|koppels|fetish}/`, `/{dienst}/{dames}/{slug}.html` (advertenties), plus `/adressen/`, `/jobs/`, `/veilig-afspreken/`, `/virtuele-seks/`, `/webcam/`, `/video/` en een WordPress-blog met maandelijkse artikel-sitemaps.
- Title: "Alle seksadvertenties in Rotterdam, Zuid-Holland | Redlights Nederland". Schema: BreadcrumbList en WebSite/SearchAction.
- Wat Paydates mist: een gidspagina met erotische adressen (parenclubs, rendez-voushotels, saunas), en blog-sitemaps per maand.

**Ladies48.com**
- URL's: `/{escort|prive-ontvangst|erotische-massage|bdsm|virtual-sex|gay|raamprostitutie}/{stad}/` en `/escorts/category/city/{stad}`.
- Facetten: `/hotel-escort/`, `/goedkope-escort/`, `/high-class/`, `/latina/` …
- Sitemap: 5.981 URL's, waarvan ongeveer 5.000 advertenties (`/sexad/`).
- Title: "Escort Utrecht — Escort Service, Privé & Thuisontvangst". Meta met aantal: "Ontmoet 177 dames in Utrecht".
- Schema: CollectionPage, ItemList, City en WebSite.
- Wat Paydates mist: ItemList-schema, aantallen in de meta, dienst × stad.

**Sexguide.nl / Tophookers.nl**
- Pagina's per advertentie ranken op stad-zoekwoorden. Title: "Kira (28) prive ontvangst Rotterdam • Escort • Echte foto's".
- Categorie per stad: `/{stad}/prive-ontvangst`.
- Wat Paydates mist: advertentiepagina's met naam, leeftijd, dienst en stad in de title, plus "echte foto's" als vertrouwenssignaal (bij ons: "Geverifieerd").

**Escortwijzer.nl**
- Redactionele gidsen, NL en EN: stadsgidsen (`/en/cities/escort-amsterdam/`), platformreviews (`/platforms/sexjobs-review/`, "kinky vs intimate") en uitleg (`/gidsen/escortdiensten-uitgelegd/`).
- Rankt informatief en vergelijkend, en verwijst door naar platforms.
- Kans: zorg dat Paydates in hun vergelijkingen komt (outreach). Bouw ook zelf gidsen.

## Audit van onze site (`/workspace/paydates-v2-concept/`)

| Bevinding | Bestand(en) | Impact |
|---|---|---|
| Live `paydates.nl` geeft leeftijdspoort met `noindex, nofollow` aan cookie-loze clients. Ook robots.txt en sitemap.xml geven poort-HTML. | live server (niet het concept) | **Kritiek** |
| Advertenties alleen via JS (`assets/data.js`, `listing.js`). Stadspagina's bevatten 0 advertentielinks in de HTML. | `escort-*.html`, `vrouwen.html`, enz. | Hoog |
| 345 stadspagina's, ongeveer 780 woorden, alleen stad en provincie verschillen | `escort-*.html` | Hoog (doorway-risico) |
| Advertentiedetail is `advertentie.html?id=`: geen canonical, H1 is een template-string | `advertentie.html` | Hoog |
| Clubs via `club.html?id=` (noindex). 8 statische club-demo's ook noindex. | `club.html`, `seksclub-*.html`, `privehuis-*.html`, `seksclubs.html` | Hoog |
| Geen dienst × stad: geen privé ontvangst, erotische massage, privéhuis of seksclub per stad | n.v.t. | Hoog |
| URL/canonical-mix: `.html` naast schone URL's (`/trans`, `/sugardating`, `/woordenboek/gfe`, `/video/…`), terwijl de bestanden `.html` zijn | `trans.html`, `sugardating.html`, `woordenboek*.html`, `video-*.html`, `sitemap.xml` | Midden |
| Ontbreken in sitemap: `/` (homepage als `/`), `seksclubs.html`, `over.html` | `sitemap.xml` | Midden |
| Geen JSON-LD op home, stads- en categoriepagina's (concurrenten: CollectionPage/ItemList/Breadcrumb) | `index.html`, `escort-*.html`, `vrouwen.html` … | Midden |
| `online.html` = "Gebruikers online". Er is geen landingspagina voor het Online-aanbod (sexting/videobellen). | `online.html` | Midden |
| `trans.html` en `shemales.html` kannibaliseren elkaar | beide | Midden |
| Home linkt naar slechts 2 `escort-*`-pagina's. Stadspagina's linken alleen binnen de eigen provincie. | `index.html`, `escort-*.html` | Midden |
| Jobs-title dubbel: "…– vacatures: vacatures bij…" | `jobs.html` | Laag |
| Blog-meta-descriptions automatisch gemaakt uit de eerste alinea ("1. Waar begin je met zoeken?…") | `blog-*.html` | Laag |
| `blogs.html` canonical naar `nieuws.html` + noindex, leeg | `blogs.html` | Laag (opruimen/301) |
| Leeftijdspoort-tekst "18 jaar of ouder" terwijl het merk 21+ is | alle pagina's | Consistentie |
| Wat goed is: VideoObject/FAQ op `videos.html`, JobPosting op `job-*.html`, DefinedTerm/FAQ/Breadcrumb op woordenboek, BlogPosting op blogs, robots.txt blokkeert account-pagina's | — | + |

## Title/H1-templates (voorstel)

- `escort-{stad}`: title "Escort {Stad} – {N} escorts & privé ontvangst ({maand jaar}) | Paydates", H1 "Escort {Stad}", meta "{N} geverifieerde escorts in {Stad}…"
- `prive-ontvangst-{stad}`: "Privé ontvangst {Stad} – thuisontvangst dames ({N}) | Paydates", H1 "Privé ontvangst in {Stad}"
- `erotische-massage-{stad}`: "Erotische massage {Stad} – masseuses & salons | Paydates"
- `privehuis-{stad}` / `seksclub-{stad}`: "Privéhuizen in {Stad} – adressen, openingstijden & dames | Paydates"
- Advertentie: "{Naam} ({leeftijd}) – {dienst} {Stad} · Geverifieerd | Paydates", H1 "{Naam}, {leeftijd} – {dienst} in {Stad}"
- Clubprofiel: "{Club} {Stad} – {type}, openingstijden & prijzen | Paydates"

## Checklist

### Quick wins (1–2 weken)
1. Live leeftijdspoort: altijd 200 met de echte content in de HTML en de poort als overlay (cookie/JS). Nooit noindex. robots.txt en sitemap.xml zonder poort. Verifiëren in Search Console (URL-inspectie, live test).
2. Eén URL-schema kiezen (aanbevolen: zonder `.html`), canonicals en sitemap gelijktrekken, 301's vanaf oude live URL's.
3. Sitemap aanvullen (`/`, `seksclubs`, `over`) en splitsen (pagina's, steden, advertenties, video, blog).
4. Title/H1/meta-templates hierboven toepassen op `escort-*.html`. Aantal en maand in de meta.
5. JSON-LD toevoegen: Organization + WebSite op home, CollectionPage + ItemList + BreadcrumbList op stads- en categoriepagina's.
6. Op home een blok "Populaire steden" met de top 20 `escort-*`-links. Op stadspagina's de buursteden en (straks) diensten in deze stad.
7. Kiezen tussen `trans.html` en `shemales.html`: één hoofdpagina, de ander canonical of 301 (zoekvolume eerst checken in GSC/Keyword Planner).
8. Een Online-pagina voor sexting/videobellen maken. `online.html` (gebruikers online) hernoemen, bijv. naar `wie-is-online.html`.
9. Jobs-title en blog-meta's opschonen. `blogs.html` met een 301 naar `nieuws.html`.
10. Search Console en Bing Webmaster koppelen. Elke week de top-queries exporteren als echte volumebron.

### Structureel (1–3 maanden)
1. Advertenties server-side renderen in stads- en categoriepagina's (minimaal de eerste 24 kaarten met link). Advertentie-URL's `/advertentie/{id}-{naam}-{stad}` met canonical, unieke title en een Person/Service-achtig schema zonder misleiding.
2. Matrix van dienst × stad voor de top 30 steden: `prive-ontvangst-`, `erotische-massage-`, `privehuis-`, `seksclub-`. Alleen publiceren bij ≥ 5 actieve advertenties of clubs. Daaronder noindex en verwijzen naar de provincie.
3. Stadspagina's in niveaus. Top 40: 300–500 woorden unieke content (wijken, prijsindicatie uit eigen data, veilig afspreken, clubs in de stad, FAQ). Gemeenten zonder aanbod: noindex of samenvoegen tot een provinciepagina.
4. Clubprofielen indexeerbaar maken: `/seksclub/{naam}-{stad}` en `/privehuis/{naam}-{stad}`, met schema.org `AdultEntertainment` (openingstijden, adres), plus "Bedrijf claimen" als acquisitiehaak.
5. Vacatures per stad (`vacatures-{stad}`) en JobPosting-feed. Landingspagina's voor adverteerders: "advertentie plaatsen als escort", "privéhuis adverteren", "alternatief voor Sexjobs/Kinky" (feitelijk vergelijken: verificatie, prijs, modern).
6. Een gidscluster tegen Escortwijzer: "Escort {stad} gids" voor de top 5 steden (NL + EN), "Wat kost een escort", "Veilig afspreken en oplichting herkennen", "Privé ontvangst vs escort". Intern linken naar de stads- en dienstpagina's.
7. Gangbangs/feesten: URL per event met Event-schema, plus een regio-overzicht.
8. Linkbuilding en PR: opgenomen worden in Escortwijzer-vergelijkingen, persbericht (bestaat), partnerlinks (bestaat), clubs die een badge "Bekijk ons op Paydates" plaatsen.

## Bronnen en beperkingen
- Geen betaalde SEO-tool. Er zijn dus geen gemeten zoekvolumes of traffic-schattingen. "Volume" is een relatieve inschatting op basis van hoeveel concurrenten in het cluster investeren (aantal URL's en templates) en wie er in de resultaten staat.
- De zoekresultaten komen van een webzoektool. Dat is geen gelokaliseerde Google-NL-SERP met posities. "Wie rankt" betekent hier "verschijnt in de topresultaten van de zoektool".
- kinky.nl, sexguide.nl, tophookers.nl en prive2day.nl blokkeren direct ophalen (Cloudflare). Voor Kinky is een archive.org-snapshot gebruikt. Sexjobs is via WebFetch opgehaald (alleen content, geen `<title>`).
- De live noindex-test is gedaan met een Googlebot-user-agent vanaf een niet-Google-IP. Verifieer dit in Search Console.
- Volgende stap voor harde volumes: Google Keyword Planner (gratis met een Ads-account; adult-zoekwoorden worden soms beperkt getoond) of een maand Semrush/Ahrefs voor kinky.nl en sexjobs.nl ("Organic keywords", NL-database).

Bronnen: kinky.nl/robots.txt; web.archive.org snapshot kinky.nl/vrouwen/prive-ontvangst/amsterdam; sexjobs.nl, sexjobs.nl/thuisontvangst, sexjobs.nl/escort/amsterdam, sexjobs.nl/robots.txt; klantenservice.sexjobs.nl (categorieregels, tarieven); redlights.nl (home, /regio/zuid-holland/rotterdam.html, /escort/shemale/, /adressen/, sitemap.xml); ladies48.com (sitemap.xml, /prive-ontvangst/rotterdam/, /escorts/category/city/utrecht); escortwijzer.nl (/nl/, /en/platforms/sexjobs-review/, /en/cities/escort-amsterdam/); intimate.nl; resultaten van de zoektool voor de clusterqueries hierboven.
