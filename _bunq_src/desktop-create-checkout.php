<?php
/* Paydates V2 — STUB.
   Vervang dit bestand door je echte create-checkout.php (betaalprovider). Contract met assets/pay-checkout.js:
     Request : POST JSON {"product":"credits_eur_50"|"credits_eur_100"|…|"credits_eur_500"}
     Product-id's (stap € 50, 10 credits = € 1):
       credits_eur_50 = 500 credits, EUR 50.00
       credits_eur_100 = 1000 credits, EUR 100.00
       credits_eur_150 = 1500 credits, EUR 150.00
       credits_eur_200 = 2000 credits, EUR 200.00
       credits_eur_250 = 2500 credits, EUR 250.00
       credits_eur_300 = 3000 credits, EUR 300.00
       credits_eur_350 = 3500 credits, EUR 350.00
       credits_eur_400 = 4000 credits, EUR 400.00
       credits_eur_450 = 4500 credits, EUR 450.00
       credits_eur_500 = 5000 credits, EUR 500.00
    , header X-CSRF-Token = $_SESSION['csrf']
     Response: 200 {"url":"https://<betaalpagina>"}  of  4xx/5xx {"error":"melding voor de gebruiker"}
   Laat de betaalprovider na betaling terugsturen naar credits-kopen.html?betaling=bevestigen (of ?betaling=geannuleerd)
   en ken credits ALLEEN toe in de server-callback/webhook nadat de provider de betaling bevestigt. */
header('Content-Type: application/json; charset=utf-8');
http_response_code(501);
echo json_encode(['error' => 'Online betalen is nog niet gekoppeld.']);
