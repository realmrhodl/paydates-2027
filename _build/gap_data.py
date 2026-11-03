# Bron voor admin/README-GAP.md en admin/assets/gap.js (concept)
GAP=[
 # (prio, onderdeel, status, wat is nodig)
 ("P0","Echte authenticatie & sessies","half","Login/registratie/reset werken nu als mock in localStorage (wachtwoord 'demo' in platte tekst). Nodig: server-side auth (Argon2/bcrypt), httpOnly-cookies, CSRF, e-mailbevestiging, rate limiting, 2FA verplicht voor admin/moderator."),
 ("P0","Database & API","ontbreekt","Alle data staat in localStorage van de browser. Nodig: backend (bijv. Postgres + API), migraties in staging, backups. Geen productie-import zonder voorafgaande controle door Stefan."),
 ("P0","Rollen & rechten server-side","half","Rollen admin/moderator/adverteerder/bedrijf/klant bestaan in de UI; afscherming gebeurt alleen client-side. Nodig: autorisatie per API-endpoint, /admin achter aparte login + IP-allowlist."),
 ("P0","Betalingen (bunq / PSP)","in concept","Methodes, bundels €50–€500, tarieven en credits zijn configureerbaar, maar betalingen staan uit en zijn vergrendeld. Nodig: PSP-contract (iDEAL/Wero, Bancontact, creditcard), webhooks met handtekeningcontrole, idempotente creditboeking, facturen per BV met btw, refundbeleid, 0906/SMS-provider, Bitcoin-verwerking + boekhouding. Pas activeren na akkoord."),
 ("P0","KYC / leeftijdsverificatie","in concept","Stappen, statussen en een goedkeur/afwijs-wachtrij met notities werken (gesimuleerd). Nodig: gecertificeerde KYC-provider (ID + liveness), versleutelde opslag, bewaartermijn, DPIA, 21+-controle afdwingen voordat een advertentie live gaat."),
 ("P0","E-mailverzending (ESP)","in concept","Templates, losse mail, massamail met segmenten, campagnelog en opt-out werken als simulatie. Nodig: ESP met SPF/DKIM/DMARC voor paydates.nl, afzender support@, werkende afmeldlink + suppressielijst, bounce-afhandeling, verzendlimieten."),
 ("P0","Seksclubs-data verificatie","half","Import-preview van 175 unieke locaties (134 handmatig te controleren), droog-run en besluiten werken. Ongeverifieerde clubs kunnen niet gepubliceerd worden. Nodig: handmatige controle (bellen/KvK), en de lijst met 66 bedrijven ontbreekt nog."),
 ("P0","Privacy / AVG","ontbreekt","Nodig: verwerkingsregister, DPIA (bijzondere persoonsgegevens: seksleven), verwerkersovereenkomsten (PSP, ESP, KYC, hosting), recht op inzage/verwijdering via account, cookiebanner afgestemd op analytics."),
 ("P0","Moderatie & meldingen server-side","half","Moderatiewachtrij (goedkeuren/afkeuren met reden) en auditlog bestaan client-side. Nodig: server-side append-only auditlog, meldknop op advertenties, notice-and-action conform DSA, signalering mensenhandel/minderjarigheid."),
 ("P1","Advertentiewizard: uploads","half","Wizard (6 stappen), bewerken, pauzeren, verlengen, bump/TOP/VIP met credits werken. Nodig: echte foto-upload met EXIF-strip, gezichts-/duplicaatcheck, opslag (S3), watermark."),
 ("P1","Gebruikersbeheer","in concept","Zoeken, filters, detail bewerken, reset-trigger, rol, ban/schorsen, notities, credits, KYC, gekoppelde advertenties en bulkacties werken. Nodig: koppelen aan API, 4-ogen-principe voor bans en creditcorrecties boven drempel."),
 ("P1","Dashboard-metrics","half","KPI's en grafiek zijn demo (seed + lokale acties). Nodig: echte analytics (privacyvriendelijk), omzetrapportage per BV, export voor boekhouding."),
 ("P1","Claims bedrijfsprofielen","in concept","Claimformulier op clubpagina's en claim-wachtrij werken. Nodig: verificatie via terugbellen/KvK, koppeling profiel ↔ account in DB, pakket Basic/Premium/Spotlight met facturatie."),
 ("P1","BV-structuur","in concept","Forest Road B.V. als standaard (KvK 97957232, BTW NL868303550B01), merkhouder Forest Road Capital B.V., HighClass als placeholder. Nodig: KvK/BTW van overige BV's, contracten, facturatie per BV."),
 ("P1","Community polls","in concept","Live poll op de homepage, archief (polls.html) en beheer in admin werken; 1 stem per browser. Nodig: server-side tellen, anti-fraude (rate limit/cookie+fingerprint-light), geen persoonsgegevens bij stemmen opslaan."),
 ("P1","Profielstatistieken clubs","half","Views en web/tel-kliks worden lokaal geteld. Nodig: server-side events, rapportage per club in hun dashboard (Premium/Spotlight)."),
 ("P2","Sponsorship & banners","half","Prijzen configureerbaar (banners €49/€99/€149 p/m, sponsorship €10.000/week). Nodig: boekingskalender, creatives-upload, rapportage."),
 ("P2","Notificaties","ontbreekt","In-app en e-mailnotificaties (advertentie verloopt, KYC-status, credits laag) met voorkeuren per gebruiker."),
 ("P2","HighClass-merk","ontbreekt","Alleen placeholder-BV; productdefinitie, domein en scheiding van data nog te bepalen."),
 ("P2","Meertaligheid","ontbreekt","UI is Nederlands; Engels voor internationale adverteerders later."),
]
