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
| Seksclubs-data verificatie | half | Import-preview van 175 unieke locaties (134 handmatig te controleren), droog-run en besluiten werken. Ongeverifieerde clubs kunnen niet gepubliceerd worden. Nodig: handmatige controle (bellen/KvK), en de lijst met 66 bedrijven ontbreekt nog. |
| Privacy / AVG | ontbreekt | Nodig: verwerkingsregister, DPIA (bijzondere persoonsgegevens: seksleven), verwerkersovereenkomsten (PSP, ESP, KYC, hosting), recht op inzage/verwijdering via account, cookiebanner afgestemd op analytics. |
| Moderatie & meldingen server-side | half | Moderatiewachtrij (goedkeuren/afkeuren met reden) en auditlog bestaan client-side. Nodig: server-side append-only auditlog, meldknop op advertenties, notice-and-action conform DSA, signalering mensenhandel/minderjarigheid. |

## P1 — Kort na livegang

| Onderdeel | Status | Wat is nodig |
|---|---|---|
| Advertentiewizard: uploads | half | Wizard (6 stappen), bewerken, pauzeren, verlengen, bump/TOP/VIP met credits werken. Nodig: echte foto-upload met EXIF-strip, gezichts-/duplicaatcheck, opslag (S3), watermark. |
| Gebruikersbeheer | in concept | Zoeken, filters, detail bewerken, reset-trigger, rol, ban/schorsen, notities, credits, KYC, gekoppelde advertenties en bulkacties werken. Nodig: koppelen aan API, 4-ogen-principe voor bans en creditcorrecties boven drempel. |
| Dashboard-metrics | half | KPI's en grafiek zijn demo (seed + lokale acties). Nodig: echte analytics (privacyvriendelijk), omzetrapportage per BV, export voor boekhouding. |
| Claims bedrijfsprofielen | in concept | Claimformulier op clubpagina's en claim-wachtrij werken. Nodig: verificatie via terugbellen/KvK, koppeling profiel ↔ account in DB, pakket Basic/Premium/Spotlight met facturatie. |
| BV-structuur | in concept | Forest Road B.V. als standaard (KvK 97957232, BTW NL868303550B01), merkhouder Forest Road Capital B.V., HighClass als placeholder. Nodig: KvK/BTW van overige BV's, contracten, facturatie per BV. |
| Community polls | in concept | Data-gedreven via `assets/polls-data.js`; archief schaalt naar 100+ (zoeken, filters, sortering, paginering, deeplinks), admin met zoeken/paginering, bewerken, live/archief, dupliceren, import/export; 1 stem per poll per browser. Nodig: server-side tellen, anti-fraude (rate limit/cookie+fingerprint-light), geen persoonsgegevens bij stemmen opslaan. |
| Profielstatistieken clubs | half | Views en web/tel-kliks worden lokaal geteld. Nodig: server-side events, rapportage per club in hun dashboard (Premium/Spotlight). |

## P2 — Later

| Onderdeel | Status | Wat is nodig |
|---|---|---|
| Sponsorship & banners | half | Prijzen configureerbaar (banners €49/€99/€149 p/m, sponsorship €10.000/week). Nodig: boekingskalender, creatives-upload, rapportage. |
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


## Community polls — een poll toevoegen (ook de 100e)
1. **Via het bestand (blijvend, voor iedereen):** open `assets/polls-data.js`, kopieer een blok en plak het bovenaan de lijst:
   `{id:"p_2026_12", cat:"Daten", status:"live", start:"2026-12-01", end:null, q:"Jouw vraag?", options:[["Antwoord A",0],["Antwoord B",0]]},`
   - `id` uniek, nooit hergebruiken. Max. 1 `live`: de live poll met de nieuwste startdatum wint, de vorige gaat automatisch naar het archief.
   - Geen HTML aanpassen: homepage, `polls.html` en admin lezen de lijst.
2. **Via admin (snel, alleen deze browser in het concept):** Admin → Community polls → *Nieuwe poll*. Daarna *Export* → levert een nieuw `polls-data.js` op om het bestand te vervangen.
3. **Bulk:** Admin → *Import* accepteert een JSON-array met dezelfde velden.
