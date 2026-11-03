# Paydates V2 — gap-analyse admin/adverteerdersplatform

Status van het concept in `/admin` en de nieuwe accountpagina's. **Alles draait op demo-data in localStorage**: geen echte SMTP, geen bunq-/PSP-betalingen, geen KYC-API, geen productie-database of -import.

Legenda status: **in concept** = werkt end-to-end als klikbare demo · **half** = deels · **ontbreekt** = nog niet gebouwd.

## P0 — Blokkerend voor livegang

| Onderdeel | Status | Wat is nodig |
|---|---|---|
| Echte authenticatie & sessies | half | Login/registratie/reset werken nu als mock in localStorage (wachtwoord 'demo' in platte tekst). Nodig: server-side auth (Argon2/bcrypt), httpOnly-cookies, CSRF, e-mailbevestiging, rate limiting, 2FA verplicht voor admin/moderator. |
| Database & API | ontbreekt | Alle data staat in localStorage van de browser. Nodig: backend (bijv. Postgres + API), migraties in staging, backups. Geen productie-import zonder voorafgaande controle door Stefan. |
| Rollen & rechten server-side | half | Rollen admin/moderator/adverteerder/bedrijf/klant bestaan in de UI; afscherming gebeurt alleen client-side. Nodig: autorisatie per API-endpoint, /admin achter aparte login + IP-allowlist. |
| Betalingen (bunq / PSP) | in concept | Methodes, bundels €50–€500, tarieven en credits zijn configureerbaar, maar betalingen staan uit en zijn vergrendeld. Nodig: PSP-contract (iDEAL/Wero, Bancontact, creditcard), webhooks met handtekeningcontrole, idempotente creditboeking, facturen per BV met btw, refundbeleid, 0906/SMS-provider, Bitcoin-verwerking + boekhouding. Pas activeren na akkoord. |
| KYC / leeftijdsverificatie | in concept | Stappen, statussen en een goedkeur/afwijs-wachtrij met notities werken (gesimuleerd). Nodig: gecertificeerde KYC-provider (ID + liveness), versleutelde opslag, bewaartermijn, DPIA, 21+-controle afdwingen voordat een advertentie live gaat. |
| E-mailverzending (ESP) | in concept | Templates, losse mail, massamail met segmenten, campagnelog en opt-out werken als simulatie. Nodig: ESP met SPF/DKIM/DMARC voor paydates.nl, afzender support@, werkende afmeldlink + suppressielijst, bounce-afhandeling, verzendlimieten. |
| Seksclubs-data verificatie | half | Geen importpagina meer: clubs worden beheerd in Admin → Seksclubs-beheer (182 locaties, 62 gepubliceerd: 55 op de hub, 7 parenclubs apart). Nodig: handmatige controle (bellen/KvK) vóór publicatie van de rest, en server-side opslag. |
| Privacy / AVG | ontbreekt | Nodig: verwerkingsregister, DPIA (bijzondere persoonsgegevens: seksleven), verwerkersovereenkomsten (PSP, ESP, KYC, hosting), recht op inzage/verwijdering via account, cookiebanner afgestemd op analytics. |
| Moderatie & meldingen server-side | half | Moderatiewachtrij (goedkeuren/afkeuren met reden) en auditlog bestaan client-side. Nodig: server-side append-only auditlog, meldknop op advertenties, notice-and-action conform DSA, signalering mensenhandel/minderjarigheid. |

## P1 — Kort na livegang

| Onderdeel | Status | Wat is nodig |
|---|---|---|
| Advertentiewizard: uploads | half | Wizard heeft nu 9 stappen met alle opties van de live site (soorten, kenmerken, 102 mogelijkheden met meerprijs, ontvangst/escort-tarieven, beschikbaarheid per dag, 11 contactkanalen, reviews aan/uit, preview). Nodig: echte foto-/video-/audio-upload met EXIF-strip, duplicaatcheck, opslag (S3), watermark. |
| Gebruikersbeheer | in concept | Tabs Overzicht/Transacties/Ban/Historie/Posts, niveau 1–5, accounttype, wallet (credits+bonus), avatar/cover resetten, waarschuwing, zacht verwijderen/herstellen. Zoeken, filters, detail bewerken, reset-trigger, rol, ban/schorsen, notities, credits, KYC, gekoppelde advertenties en bulkacties werken. Nodig: koppelen aan API, 4-ogen-principe voor bans en creditcorrecties boven drempel. |
| Dashboard-metrics | half | KPI's en grafiek zijn demo (seed + lokale acties). Nodig: echte analytics (privacyvriendelijk), omzetrapportage per BV, export voor boekhouding. |
| Claims bedrijfsprofielen | in concept | Claimformulier op clubpagina's en claim-wachtrij werken. Nodig: verificatie via terugbellen/KvK, koppeling profiel ↔ account in DB, pakket Basic/Premium/Spotlight met facturatie. |
| BV-structuur | in concept | Forest Road B.V. als standaard (KvK 97957232, BTW NL868303550B01), merkhouder Forest Road Capital B.V., HighClass als placeholder. Nodig: KvK/BTW van overige BV's, contracten, facturatie per BV. |
| Community polls | in concept | Data-gedreven via `assets/polls-data.js`; archief schaalt naar 100+ (zoeken, filters, sortering, paginering, deeplinks), admin met zoeken/paginering, bewerken, live/archief, dupliceren, import/export; 1 stem per poll per browser. Nodig: server-side tellen, anti-fraude (rate limit/cookie+fingerprint-light), geen persoonsgegevens bij stemmen opslaan. |
| Profielstatistieken clubs | half | Views en web/tel-kliks worden lokaal geteld. Nodig: server-side events, rapportage per club in hun dashboard (Premium/Spotlight). |
| Moderatie advertenties (admin) | in concept | Tabs wacht/live/gepauzeerd/afgekeurd/verlopen/verwijderd, filters, 50 per pagina, CSV-export, goedkeuren/afwijzen, bewerken, promoten (omhoog/TOP/VIP/auto, gratis of op credits), pauzeren, zacht verwijderen + herstellen. Nodig: API en 4-ogen bij definitief verwijderen. |
| Meldingen, support, reviews | in concept | Admin-pagina's met afhandelen/herstellen, antwoord (gesimuleerde mail), sluiten/heropenen, reviews goedkeuren/afwijzen. Nodig: echte mail, DSA-termijnen, notificatie naar melder. |
| Categorieën & content | in concept | CRUD voor categorieën, advertentiesoorten, hoofdmenu, blogs, linkpartners, video's en talen. Nodig: koppeling met de echte navigatie/CMS. |
| Accountinstellingen | in concept | account-instellingen.html: algemeen, bedrijfsgegevens, wachtwoord, 2FA (demo), bankverificatie (IBAN, bunq niet live), reviews-standaard, favorieten, account verwijderen (zacht). Nodig: server-side wachtwoordwijziging, echte TOTP, bunq-verificatie. |
| Verdienmodel V2 | in concept | Instap via 1× bellen/SMS (€2), schalen via bundels/auto-omhoog, groot geld via agencies, clubs, banners. Zie sectie Verdienmodel. Nodig: 0906/SMS-provider, PSP, facturatie per BV, abonnementen. |

## P2 — Later

| Onderdeel | Status | Wat is nodig |
|---|---|---|
| Banners | half | Bannerprijzen per week configureerbaar (Leaderboard €149, Sidebar €99, Native €79, Stadspagina €49). Geen sponsorsecties op de publieke site. Nodig: boekingskalender, creatives-upload, rapportage. |
| Notificaties | ontbreekt | In-app en e-mailnotificaties (advertentie verloopt, KYC-status, credits laag) met voorkeuren per gebruiker. |
| HighClass-merk | ontbreekt | Alleen placeholder-BV; productdefinitie, domein en scheiding van data nog te bepalen. |
| Meertaligheid | ontbreekt | UI is Nederlands; Engels voor internationale adverteerders later. |

## Demo-logins (wachtwoord `demo`)

- admin@demo.paydates.test (admin)
- moderatie@demo.paydates.test (moderator: geen toegang tot BV, betalingen, instellingen)
- adverteerder@demo.paydates.test (adverteerder, 450 credits)
- bedrijf@demo.paydates.test (bedrijf, KYC ingediend)

## Harde grenzen in dit concept

- Geen echte e-mail: alles in het mail-log met status "gesimuleerd (niet verzonden)". Massamail vereist het typen van SIMULEER.
- Flags `paymentsLive`, `realEmail`, `kycProvider` en `clubsPublishUnverified` zijn vergrendeld.
- Openingstijden onbekend ⇒ nooit "Nu open". Parenclubs apart.
- Bestaande publieke pagina's zijn alleen aangevuld (poll, claim-blok, scripts), niet herschreven.
- Contact altijd via support@paydates.nl (nooit info@).

## Live-functies → V2 (checklist)

Vergeleken met de huidige admin en het accountgedeelte van paydates.nl (belastingen en FAQ bewust overgeslagen).

| Live-functie | V2-concept | Waar |
|---|---|---|
| Advertenties modereren (wacht/live/afgekeurd/verwijderd, bewerken, promoten) | aanwezig | admin/advertenties.html |
| Gebruikers: filters status/niveau/rol, bulk, detail met tabs | aanwezig | admin/gebruikers.html, gebruiker.html |
| Niveau 1–5, accounttype, ban/waarschuwing, historie | aanwezig | admin/gebruiker.html |
| Wallet credits + bonus | aanwezig | dashboard, instellingen, admin gebruiker |
| Meldingen / support / reviews | aanwezig | admin/meldingen, support, reviews |
| Categorieën & soorten | aanwezig | admin/categorieen.html |
| Menu, blogs, links, video's, talen | aanwezig (concept-data) | admin/content.html |
| Orders/betalingen, zacht verwijderen + herstel | aanwezig (gesimuleerd) | admin/betalingen.html |
| KYC-verificatie | aanwezig (gesimuleerd) | kyc.html, admin/kyc.html |
| Wizard: soorten, kenmerken, mogelijkheden + meerprijs, tarieven ontvangst/escort, beschikbaarheid, contactkanalen, video/audio | aanwezig | advertentie-plaatsen.html |
| Mijn advertenties: omhoog, bundel, auto-omhoog, TOP, VIP, verlengen, pauzeren, preview | aanwezig | mijn-advertenties.html |
| Instellingen: algemeen, bedrijf, wachtwoord, 2FA, bank, reviews, favorieten, account verwijderen | aanwezig (demo) | account-instellingen.html |
| Bedrijfsclaims clubs | aanwezig | club.html → admin/claims.html |
| Echte uploads, e-mail, betalingen, 0906/SMS | ontbreekt (bewust) | zie P0/P1 |
| Chat/berichten tussen gebruikers | half (bestaande chat-UI, geen backend) | chatten.html |

## Verdienmodel V2

Het oude live-model "8 credits promoten" is **vervangen**. Uitgangspunt: laagdrempelig instappen, groot geld bij grote adverteerders.

**Instap (geen credits nodig)**
- 1× omhoog via bellen of sms (0906 / "PAYDATES naar 3010"): €2 → advertentie direct bovenaan. Plaatsen zelf is gratis (`adPrice` 0, instelbaar).

**Groeien (credits, 10 credits = €1)**
- Omhoog 20 cr · Bundel 10× omhoog 150 cr · Automatisch omhoog 15 cr/dag · TOP 50 cr/dag · VIP 300 cr/7 dagen.
- Creditbundels €50–€500 met bonus (bijv. €100 → +50, €200 → +200, €500 → +1.000).

**Bedrijven (abonnementen)**
- Agency S €99/mnd (10 profielen) · M €249/mnd (30 profielen, 30× omhoog) · L €499/mnd (onbeperkt, dagelijkse TOP).
- Club Basic gratis · Premium €49/mnd · Spotlight €99/mnd.
- Banners per week: Leaderboard €149, Sidebar €99, Native €79, Stadspagina €49.

**Scenario ≈ €51.000 per maand** (instelbaar in Admin → Prijzen, orders & betalingen):

| Bron | Aantal × prijs | Per maand |
|---|---|---|
| Omhoog via bellen/SMS | 3.000 × €2 | €6.000 |
| Bundel 10× omhoog | 200 × €15 | €3.000 |
| TOP-dagen | 400 × €5 | €2.000 |
| VIP 7 dagen | 150 × €30 | €4.500 |
| Overige creditbundels | 100 × €50 | €5.000 |
| Agency S / M / L | 40×€99 + 25×€249 + 12×€499 | €16.173 |
| Club Premium / Spotlight | 80×€49 + 25×€99 | €6.395 |
| Bannerweken | 40 × €99 | €3.960 |
| Homepage-weken (grote partners, geen publieke sponsorsectie) | 4 × €1.000 | €4.000 |
| **Totaal** | | **€51.028** |

≈ 60% komt van grote adverteerders (agencies, clubs, banners). Instap via SMS/bellen houdt de drempel laag en vult de lijst.
Zichtbaar op: adverteren.html (#prijzen, #bedrijf), credits.html, dashboard/mijn-advertenties, admin betalingen (calculator).

## Seksclubs-beheer (geen import)

- Admin → **Seksclubs-beheer** (admin/seksclubs.html): zoeken, filteren, bewerken, publiceren/depubliceren, verifiëren. Opslag in `pdx_clubs_v1` (concept) met basis uit `assets/clubs-data.js`.
- Gepubliceerde clubs verschijnen direct op **seksclubs.html** (hub, per provincie/stad) en hebben een eigen pagina **club.html?id=…**. Parenclubs staan apart.
- Agencies zijn géén seksclubs en staan er niet tussen.
- Claims vanaf een clubpagina komen in Admin → Claims. Bij goedkeuring wordt de club als "geclaimd" gekoppeld aan het account.

## Community polls — een poll toevoegen (ook de 100e)
1. **Via het bestand (blijvend, voor iedereen):** open `assets/polls-data.js`, kopieer een blok en plak het bovenaan de lijst:
   `{id:"p_2026_12", cat:"Daten", status:"live", start:"2026-12-01", end:null, q:"Jouw vraag?", options:[["Antwoord A",0],["Antwoord B",0]]},`
   - `id` uniek, nooit hergebruiken. Max. 1 `live`: de live poll met de nieuwste startdatum wint, de vorige gaat automatisch naar het archief.
   - Geen HTML aanpassen: homepage, `polls.html` en admin lezen de lijst.
2. **Via admin (snel, alleen deze browser in het concept):** Admin → Community polls → *Nieuwe poll*. Daarna *Export* → levert een nieuw `polls-data.js` op om het bestand te vervangen.
3. **Bulk:** Admin → *Import* accepteert een JSON-array met dezelfde velden.
