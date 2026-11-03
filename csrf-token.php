<?php
/* Geeft het CSRF-token van de huidige PHP-sessie terug voor statische .html-pagina's (credits-kopen.html, credits.html).
   create-checkout.php controleert X-CSRF-Token tegen $_SESSION['csrf'] — zelfde sessie. */
session_start();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(24));
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
echo json_encode(['csrf' => $_SESSION['csrf']]);
