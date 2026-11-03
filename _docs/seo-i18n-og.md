# Paydates V2 – Meertaligheid (SEO) & Open Graph-audit

*Concept: `/workspace/paydates-v2-concept/` · 216 statische HTML-pagina's · stand van 2 nov 2026*

---

## Deel 1 – Meertalig maken met focus op SEO

### 1.1 URL-structuur: submappen per taal

| Optie | Voorbeeld | Oordeel |
|---|---|---|
| **Submap** | `paydates.nl/en/escort-amsterdam` | ✅ **Aanbevolen.** Alle autoriteit van paydates.nl (backlinks, leeftijd van het domein) telt mee voor elke taal. Eén Search Console-property, één SSL, één deploy. |
| Subdomein | `en.paydates.nl` | ⚠️ Google ziet het deels als aparte site, dus je bouwt autoriteit opnieuw op. Alleen nuttig bij aparte hosting of een apart team. |
| Eigen ccTLD | `paydates.de` | ❌ Sterkst lokaal signaal, maar je begint per land op nul en betaalt meer onderhoud. Pas overwegen als DE echt een eigen markt wordt. |
| Query of cookie | `?lang=en` | ❌ Wordt slecht geïndexeerd en hreflang werkt er niet goed mee. Taal kiezen via cookie of IP-redirect verbergt pagina's voor Googlebot (die crawlt vanuit de VS zonder cookies). |

**Advies:**
- **NL blijft op de root** (`paydates.nl/escort-amsterdam`), zodat de bestaande NL-rankings precies blijven staan. Andere talen komen in `/en/`, `/de/` enz.
- **Zet de clean URLs nú recht.** Sommige canonicals verwijzen naar live-URL's (`/video/1007-showing-my-ass`, `/woordenboek/gfe`), terwijl de bestanden `video-1007-….html` heten. Kies vóór de livegang één schema, bij voorkeur zonder `.html` (`/escort-amsterdam`, `/video/1007-…`). Maak 301's vanaf de oude live-URL's en vertaal de **slugs** per taal: `/en/escort-amsterdam` mag blijven, `/de/escort-amsterdam` ook (zoekers in DE typen "Escort Amsterdam"), maar `/de/woerterbuch/…` werkt beter dan `/de/woordenboek/…`.
- **Geen automatische redirect op browsertaal of IP.** Laat hooguit een niet-blokkerende balk zien: "This page is available in English →".

### 1.2 hreflang, canonical en x-default

Op elke pagina die vertaald bestaat, zet je in de `<head>` de volledige set, **in alle taalversies dezelfde**:

```html
<link rel="canonical" href="https://paydates.nl/en/escort-amsterdam">   <!-- verwijst naar zichzelf -->
<link rel="alternate" hreflang="nl" href="https://paydates.nl/escort-amsterdam">
<link rel="alternate" hreflang="en" href="https://paydates.nl/en/escort-amsterdam">
<link rel="alternate" hreflang="de" href="https://paydates.nl/de/escort-amsterdam">
<link rel="alternate" hreflang="x-default" href="https://paydates.nl/escort-amsterdam">
```

Regels:
- **De canonical verwijst altijd naar de eigen taalversie.** Nooit van EN naar NL canonicaliseren, want dan verdwijnt de EN-pagina uit Google.
- **hreflang moet wederzijds zijn.** Als NL naar EN verwijst, moet EN terugverwijzen, anders negeert Google het.
- **x-default = NL** (de hoofdmarkt). Een aparte taalkeuzepagina is niet nodig.
- Gebruik taalcodes (`en`, `de`), geen landcodes (`en-GB`). Je richt je op bezoekers *in* NL die een andere taal spreken, niet op landen.
- **Alleen echt vertaalde pagina's krijgen een hreflang-paar.** Bestaat een pagina alleen in het NL, dan krijgt die geen `en`-alternate.
- Zet `<html lang="en">` en `og:locale` op `en_GB` (met `og:locale:alternate` voor de andere talen).

### 1.3 Wat vertaal je en wat blijft NL?

| Vertalen (hoge SEO-waarde) | Alleen NL (of samenvatting + link naar NL) |
|---|---|
| Homepage, categorieën (vrouwen, mannen, shemales, stellen, agency) | **Algemene voorwaarden, privacy, cookies en bedrijfsinformatie**: de NL-tekst is juridisch bindend. Een EN-versie mag wel, met de zin "In case of conflict the Dutch version prevails". |
| **62 stadspagina's** (`escort-<stad>`): de belangrijkste SEO-trekker voor toeristen en expats | **Advertentieteksten van adverteerders**: user-generated, dus niet automatisch vertalen. Wel de UI eromheen (tarieven, mogelijkheden, "Bezoek website"). Eventueel een per-advertentieveld "spreekt: EN/DE". |
| Woordenboek (46 termen): long-tail zoals "GFE meaning", "PSE escort" | **Blogs**: alleen de evergreen-stukken vertalen (bijv. "Escorts in Amsterdam – gids", "Hoe boek je een sekswerker"), niet nieuws of interviews |
| Videos-overzicht, gangbangs/feesten, veilig daten, FAQ, credits kopen en adverteren | Jobs (de doelgroep zit vooral in NL; EN is optioneel voor buitenlandse sekswerkers) |
| **18+-leeftijdspoort**: in elke taal, met dezelfde werking. De tekst moet de bezoeker begrijpen. | Checkout/bunq: de UI vertalen, de betaalflow blijft dezelfde |

**Adult-zoekwoorden per taal:** niet letterlijk vertalen, maar per taal zoekwoordonderzoek doen (Ahrefs/Semrush met landfilter NL en de taal).
- EN: "escort Amsterdam", "Amsterdam escorts", "red light", "GFE"
- DE: "Escort Amsterdam", "Huren Amsterdam" (let op: vulgair, niet in titels), "Privatmodelle", "Erotikmassage"
- Vermijd termen die wijzen op minderjarigheid of dwang, ook in long-tail. Dat geeft een SafeSearch- of deindexatierisico.

### 1.4 Sitemap, robots en taalwisselaar

- **Sitemap:** één `sitemap.xml` (of een index met per taal een sitemap) met `xhtml:link`-hreflang per URL. Dat kan in plaats van, of naast, de `<head>`-tags. Zet alleen indexeerbare, canonieke URL's erin.
- **robots.txt:** één bestand voor alle talen. Account-, login- en factuurpagina's sluit je uit. Gevoelige mappen (`_build`, `_bunq_src`, `_docs`, `*.php`-source) **niet** in robots.txt zetten, want dan maak je ze juist bekend. Blokkeer ze op de server (deny) of upload ze niet.
- **Beta:** `beta.paydates.nl` moet **niet** geïndexeerd worden. Gebruik basic-auth of de header `X-Robots-Tag: noindex` en `robots.txt` met `Disallow: /`. Het script maakt die variant automatisch met `PD_BASE=https://beta.paydates.nl` (zie 2.4). Anders concurreert beta met live (duplicate content).
- **Taalwisselaar:**
  - In de header een dropdown "NL / EN / DE" met **gewone `<a href>`-links naar de vertaalde URL van dezelfde pagina**. Geen JS-only wisselaar en geen formulier.
  - Bestaat de pagina niet in die taal, dan linkt de knop naar de homepage van die taal of wordt hij grijs. **Nooit** NL-inhoud op een `/en/`-URL tonen: dat is duplicate content.
  - De gekozen taal mag je in `localStorage` bewaren, maar alleen voor de UI, niet voor redirects.

### 1.5 Bouwaanpak voor déze codebase

De site wordt al gegenereerd door Python-builders in `_build/` (`layout.py` → `head()`, `nav.py`, `pages2-6.py`, `video_pages.py`, `blogs.py`, plus JSON-data). Dat is ideaal: **niemand onderhoudt 216 × N pagina's met de hand.**

1. **Strings uit de templates halen.** Maak `_build/i18n/nl.json`, `en.json` en `de.json` met keys (`nav.vrouwen`, `agegate.title`, `city.h1` = "Escort {stad}" …). Een `t(key, **vars)`-helper in `layout.py` vervangt de hardcoded NL-teksten.
2. **Data-vertaling apart.** `legal.json`, `blogs.json` en de woordenboek-data krijgen per item een `"i18n": {"en": {...}}`. Ontbreekt een vertaling, dan **wordt de pagina niet gebouwd** in die taal. Geen NL-fallback op een EN-URL.
3. **Bouwlus per taal.** `all.sh` roept elke builder aan met `LANG=nl|en|de`. De output gaat naar `/` (nl), `/en/` en `/de/`. Relatieve paden (`assets/…`, `img/…`) worden root-relatief (`/assets/…`), zodat ze vanuit submappen blijven werken.
4. **Eén registry van pagina's.** Een `pages.json` met per logisch paginapunt (`city:amsterdam`) de slug per taal. Uit die registry genereert `seo_meta.py` automatisch canonical, hreflang-sets, de taalwisselaar-links en de sitemap.
5. **JS-teksten.** `assets/app.js`, `livesearch.js` en dergelijke lezen labels uit `window.PD_I18N`, dat per taal in `data.js` wordt meegebouwd.
6. **Vertaalproces.** Laat de eerste versie machinaal vertalen (DeepL of een LLM) naar JSON, laat een native speaker de templates en de top 20-pagina's reviewen, en houd per string een `reviewed: true`-vlag bij. Bouw pagina's pas na review, of zet ze tot dan op `noindex`.
7. **Adverteerderspagina's** (`advertentie.html?id=`) moeten in productie **server-side** gerenderd worden (PHP) op `/advertentie/476-naam` en `/en/ad/476-naam`. Alleen dan kloppen titel, description, OG en hreflang per advertentie (zie deel 2).

### 1.6 Prioriteit van talen

| # | Taal | Waarom |
|---|---|---|
| 1 | **Engels** | Toeristen (Amsterdam alleen al ruim 20 mln bezoekers per jaar), expats, zakenreizigers, en internationale sekswerkers die adverteren. "escort amsterdam" heeft in het Engels veel volume. Doelgroep zonder taalbarrière en met hoge koopkracht. |
| 2 | **Duits** | Grootste groep buitenlandse bezoekers aan NL, veel grensverkeer (Limburg, Twente, Gelderland: Venlo, Enschede, Heerlen, Nijmegen). Duitse zoekers gebruiken Google.de/.nl met DE-zoekwoorden. Hier is relatief weinig concurrentie van NL-sites. |
| 3 | Frans (optioneel) | Belgische en Franse bezoekers (Maastricht, Zeeland, Amsterdam). Kleiner volume, maar weinig concurrentie. |
| 4 | Spaans en Pools (later) | Spaans: toeristen, en veel adverteerders zijn Spaans- of Latijns-Amerikaanstalig (UI voor adverteerders). Pools en Roemeens vooral voor **adverteerders** (account, adverteren, veilig werken), niet voor bezoekers. |

Begin met **EN voor de homepage, categorieën, de top 15 steden, het woordenboek, FAQ en veilig daten**. Meet 8–12 weken in Search Console en schaal daarna op naar DE.

### 1.7 Risico's

- **Thin content en doorway pages:** 62 steden × 3 talen met alleen een andere stadsnaam ziet Google als doorway spam. Elke stadspagina moet unieke inhoud hebben: echte advertenties in die stad, de lokale situatie en regelgeving (vergunningsplicht per gemeente), wijken en een FAQ. Steden zonder advertenties krijgen `noindex` (of worden niet vertaald).
- **Adult-indexering:** Google zet de site sowieso in de SafeSearch-filter. Markeer dit zelf met `<meta name="rating" content="adult">`, dan gaat het sneller en zonder straf. Expliciete termen horen niet in title of description van de homepage. Blijf weg van alles wat op minderjarigheid lijkt; de "21+"-boodschap is goed.
- **Machinevertaling zonder review:** valt onder Google's "scaled content abuse". Laat minimaal de templates en toppagina's door een mens reviewen.
- **Duplicate content:** beta tegenover live, `.html` tegenover clean URLs, `?id=` en filterparameters (`search.html?q=`). Canonicals en noindex moeten kloppen vóór de livegang.
- **Search Console:** controleer na livegang het rapport Internationale targeting/hreflang en Pagina-indexering. Vraag niet in één keer duizenden vertaalde URL's aan; laat de sitemap het werk doen.
- **Social en ads:** Facebook en Instagram blokkeren vaak links naar adult-sites (ook op een gedeeld OG-preview). X staat het toe, mits het account als "sensitive media" gemarkeerd is. Reken voor traffic niet op Meta.
- **Juridisch:** vertaalde AV en privacy moeten inhoudelijk gelijk blijven aan de NL-versie. De NL-versie is leidend.

---

## Deel 2 – Open Graph- en social-meta-audit

### 2.1 Bevindingen (vóór de fix)

Hoe de meta erin komt: `_build/layout.py` → `head(title, desc)` zet alleen `title`, `description`, `og:site_name`, `og:title` en `og:description`. Verder niets.

| Check | Status vóór | Pagina's |
|---|---|---|
| `<title>` + `meta description` | ✅ Aanwezig en meestal goed en uniek | 213/216 |
| `og:title` / `og:description` | ✅ Gelijk aan title en description | 213 |
| **`og:image`** | ❌ **Ontbrak op 181 pagina's.** Op de 35 videopagina's stond hij er wel, maar **relatief** (`img/remote/thumbnails/…`). Facebook, X, WhatsApp en Telegram kunnen dat niet laden. | alles behalve video's |
| **`og:url`** | ❌ Nergens | 216 |
| **`og:type`** | ❌ Alleen op video's (`video.other`) | 181 ontbrak |
| `og:locale` | ❌ Nergens | 216 |
| **`twitter:card`** (+ title, description, image) | ❌ Nergens, dus geen grote preview op X | 216 |
| `og:video` | ⚠️ Relatief pad (en één `.mov`, dat niet overal speelt) | 35 |
| **canonical** | ⚠️ Op 86 pagina's. Het host-adres wisselde: `videos.html` verwees naar `beta.paydates.nl`, de rest naar `paydates.nl`. Video's en woordenboek verwijzen naar een **ander URL-schema** (`/video/…`, `/woordenboek/…`) dan de bestanden. `blogs.html` had een relatieve canonical. | |
| Standaard OG-afbeelding | ❌ Bestond niet (alleen `img/header-logo.png`, 270×294, ongeschikt) | |
| Dubbele titels | ⚠️ "Video van Gigi \| Video van Gigi \| Paydates.nl" (ook bij Curvyyus) | 4 |
| Afgekapte descriptions | ⚠️ Blogs en woordenboek eindigden midden in een woord ("…hoe en waarom je "). Jobs en video's waren langer dan 160 tekens. | ±75 |
| `advertentie.html?id=` | ❌ Generiek ("Advertentie \| Paydates.nl"). Titel en inhoud worden pas door JS gezet, en crawlers van Facebook, X en WhatsApp voeren geen JS uit. Elke gedeelde advertentie kreeg dus dezelfde preview. | belangrijkste deelpagina |
| `sitemap.xml` / `robots.txt` | ❌ Bestonden niet | |
| hreflang | – Nog niet relevant (alleen NL) | |
| Lange titels (meer dan 65 tekens) | ⚠️ 104 pagina's (stadspagina's ±70 en blogs). Google kort ze in, maar dat is acceptabel. | |

### 2.2 Doorgevoerd (veilig, idempotent, overleeft rebuilds)

1. **`img/og/paydates-default.jpg`** (1200×630, huisstijl #6849ad, logo, "Escorts, privé ontvangst & sekscontact in Nederland · Alle adverteerders 21+"). Bevat geen expliciet beeld, dus het is veilig als preview op elk platform.
2. **Nieuw: `_build/seo_meta.py`** (post-processor, staat in `all.sh` vóór de linkcheck). Per pagina zet het tussen `<!-- pd-seo -->`-markers:
   - `canonical` (absoluut). Bestaande canonicals blijven behouden; `beta.paydates.nl` wordt de productiebasis.
   - `og:type` (`website`, `article` voor blogs, `video.other` voor video's), `og:locale nl_NL` en `og:url` (gelijk aan de canonical).
   - `og:image` als **absolute https-URL**, met deze volgorde: eigen beeld (video-thumbnail of eerste blogafbeelding), en anders de standaardafbeelding. Plus `og:image:width/height/alt`. Het script controleert of het bestand echt bestaat.
   - `og:video` absoluut.
   - `twitter:card=summary_large_image`, plus `twitter:title`, `twitter:description` en `twitter:image`.
   - Dubbele "Video van X \| Video van X"-titels opgeschoond (ook in de bron `video_pages.py`).
   - Afgekapte en te lange descriptions netjes afgebroken op een woordgrens met "…" (maximaal 155 tekens).
   - **`sitemap.xml`** (205 URL's, zonder login, account, factuur, 404, zoek- en `?id`-pagina's) en **`robots.txt`**.
   - Basis-URL is instelbaar: `PD_BASE=https://paydates.nl` (standaard) of `PD_BASE=https://beta.paydates.nl`. Met de beta-basis wordt robots.txt automatisch `Disallow: /`.
3. **`advertentie.html`**: geen statische canonical meer (die zou alle advertenties op één URL samenvoegen). JS zet nu per advertentie de canonical op `https://paydates.nl/advertentie.html?id=<id>`. Aangepast in de bron `_build/pages2.py` én in de huidige HTML.
4. Controle: alle 215 pagina's hebben het blok, er staat geen enkel relatief `og:image` meer in, en de linkcheck geeft 38.914 links met 0 kapot.

> Let op: de **standaardafbeelding moet op de server staan** op `https://paydates.nl/img/og/paydates-default.jpg`. Upload dus ook `img/og/`, `sitemap.xml` en `robots.txt`. Tot de V2 op paydates.nl draait, wijzen deze URL's naar bestanden die daar nog niet bestaan.

### 2.3 Nog te doen (moet server-side of vraagt een keuze)

| Prio | Actie |
|---|---|
| **Hoog** | **Advertentiepagina's server-side renderen** (PHP: `/advertentie/476-naam`). Echte `<title>` ("Naam – Escort in Amsterdam \| Paydates.nl"), description uit de advertentietekst, `og:image` = **een niet-expliciete** profielfoto (laat de adverteerder een "preview-foto" kiezen, want expliciete OG-beelden laten Meta, WhatsApp en Telegram previews blokkeren), `og:type=profile`. Pas dan kloppen social previews en de Google-snippet per advertentie. |
| **Hoog** | **Eén URL-schema kiezen** (clean URLs). Nu wijzen 81 canonicals naar `/video/…` en `/woordenboek/…`, terwijl de overige pagina's `.html` zijn. Bij livegang: rewrite (nginx/Apache) plus 301's van de oude live-URL's. Daarna `PD_BASE` en de slugs in `seo_meta.py` aanpassen. |
| Hoog | `beta.paydates.nl`: basic-auth of `X-Robots-Tag: noindex`, en deployen met `PD_BASE=https://beta.paydates.nl` (dan robots.txt `Disallow: /`). |
| Middel | Per categorie en stad een **eigen OG-afbeelding** (1200×630, bijv. "Escort Amsterdam · 34 advertenties"). Kan automatisch met Pillow in `seo_meta.py`, zoals de standaardafbeelding. |
| Middel | Titels van stadspagina's inkorten tot ≤ 60 tekens, bijv. "Escort Amsterdam – privé ontvangst & escorts \| Paydates". Blogtitels ook korter. |
| Middel | Descriptions van cookies, privacy, login en 404 uitbreiden (nu 25–57 tekens). |
| Middel | `og:video` van `.mov` naar `.mp4` (H.264) voor clip 1007 en verwante clips; eventueel `og:video:type`, `:width` en `:height`. |
| Laag | `<meta name="rating" content="adult">` sitebreed (SafeSearch-signaal; voorkomt een "verrassing" en straf). |
| Laag | JSON-LD `Organization` + `WebSite` (met SearchAction voor de AJAX-zoek) op de homepage; `Article` op blogs (er staat al JSON-LD op 116 pagina's). |
| Laag | Favicon-set (`apple-touch-icon` 180×180, `favicon.ico`, `manifest.webmanifest`). Nu is alleen `header-logo.png` aanwezig. |
| Bij livegang | Testen met de Facebook Sharing Debugger, de X-cardvalidator (via een post-preview), LinkedIn Post Inspector en de WhatsApp-preview. Daarna in Search Console de sitemap indienen. |

### 2.4 Gebruik

```bash
bash _build/all.sh                                    # volledige build (seo_meta draait automatisch)
python3 _build/seo_meta.py                            # alleen meta/sitemap/robots bijwerken (productie-basis)
PD_BASE=https://beta.paydates.nl python3 _build/seo_meta.py   # voor een beta-deploy
```
