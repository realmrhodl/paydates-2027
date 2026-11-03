# Paydates V2 – statisch concept (beta.paydates.nl)

Multi-page statische site in de huidige Paydates-huisstijl (#6849ad / #7351c0, #edf0f7, Poppins).
Tailwind (Play CDN) + Font Awesome + vanilla JS. Geen backend: formulieren tonen alleen een bevestiging.

## Bouwen
```
bash _build/all.sh        # genereert assets/data.js + alle .html en draait de linkcheck
python3 _build/shots.py   # screenshots naar shots/ (lokale server op :8911 nodig)
```
Header, menu, footer en 18+-poort staan in `_build/layout.py` en worden statisch in elke pagina gezet (crawlbaar voor SEO).
Bron-data (gescraped van paydates.nl): `_build/listings.json` (45 advertenties), `videos.json` (35), `blogs.json` (20), `legal.json` (FAQ/AV/privacy/cookies).
`_build/index.source.html` is de originele homepage, waaruit `index.html` opnieuw wordt opgebouwd.

## Pagina's
| Pagina | Inhoud |
|---|---|
| index.html | Homepage (hero, stories, TOP, grid, chat-blok, ad-rail) |
| vrouwen / mannen / shemales / stellen / agency .html | Categorieën met filters (stad, type, leeftijd, tarief, taal, nu beschikbaar…) |
| search.html | Uitgebreid zoeken incl. mogelijkheden; filters staan in de URL (`?q=&g=&city=&type=&s=a|b`) |
| advertentie.html?id=… | Detail: galerij + lightbox, tarieven, kenmerken, mogelijkheden, beschikbaarheid, video's, vergelijkbaar, melden |
| videos.html | Video-overzicht met speler (modal), zoeken, sorteren |
| chatten.html | Paydates Chat: rooms per regio/thema (uit paydates-chat config), huisregels, chatpas |
| login / register (?type=klant\|sekswerker\|bedrijf) / wachtwoord-vergeten .html | Accounts |
| credits.html, adverteren.html (#vip #top-plaatsing #banners #bedrijf), verificatie.html, account.html | Adverteerders & monetisatie |
| locaties.html + escort-<stad>.html (alle 342 gemeenten + Spijkenisse/Drachten = 344; `_build/gemeenten.py` + `_build/cities_all.py`) | SEO-stadspagina's met fallback naar provincie |
| blogs.html + blog-<slug>.html (20) | Echte blogs van paydates.nl |
| faq, veilig-daten, melden (#ntd #claim), contact, algemene-voorwaarden, privacy, cookies, bedrijfsinformatie, 404 | Info & juridisch |

## Let op
* Creditbundels en -kosten zijn een **voorstel** (100/€10, 250/€22,50, 500/€40, 1000/€70; bump 10, TOP 50/dag, VIP 300/7d, chatpas 50/24u).
* Contact loopt via de live advertentie op paydates.nl (telefoonnummers niet gekopieerd).

## Omhoog plaatsen (0906 / SMS)
`advertentie.html` heeft een knop **Omhoog plaatsen** (kop + zijbalk, of `?omhoog=1`) met een modal voor 0906 (bellen → pincode) en SMS (PAYDATES naar 3010 → code).
Logica in `assets/bump.js`: `PD_BUMP.verifyCode()` is een stub (concept). Koppelen: zet `PD_BUMP.CONCEPT=false`, vul `API_URL`, `NUMBER_0906` en tarieven in.
API-contract: `POST /api/bump/verify {method:'0906'|'sms', code, ad_id}` → `{valid, bumped_at?, error?: 'used'|'expired'|'invalid'}`. Testcodes in concept: 0000 = al gebruikt, 1111 = verlopen.

## Video's
`videos.html` wordt gebouwd door `_build/videos_page.py` (statisch gerenderde kaarten voor SEO + JSON-LD VideoObject/FAQ, filters via URL `?g=&city=&type=&v=1&a=1&q=&sort=`).
