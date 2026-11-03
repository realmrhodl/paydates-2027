<?php
header('Cache-Control: no-store');
$order=$_GET['order']??'';
if (!is_string($order)||!preg_match('/^[a-f0-9]{32}$/',$order)){http_response_code(400);exit('Ongeldige order');}
$state='Nog niet bevestigd';
try {
 $cfg=require __DIR__.'/config.php'; require __DIR__.'/bunq.php';
 $dir=$cfg['orders_dir']??dirname(__DIR__).'/private-payments';
 $record=json_decode(file_get_contents($dir.'/'.$order.'.json'),true);
 if (!is_array($record) || !isset($record['tab_id'])) throw new RuntimeException('Order ongeldig');
 $path='/user/'.(int)$cfg['bunq_user_id'].'/monetary-account/'.(int)$cfg['bunq_monetary_account_id'].'/bunqme-tab/'.(int)$record['tab_id'];
 $tab=bunqObject(bunqRequest($cfg,'GET',$path),'BunqMeTab');
 // Only display status. Actual fulfillment must be wired to Paydates account and verified against bunq documentation.
 $state='Status bij bunq: '.(string)($tab['status']??'onbekend');
} catch(Throwable $e){error_log('Status check: '.$e->getMessage());$state='Status tijdelijk niet beschikbaar';}
?><!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Betaalstatus</title><body style="font-family:system-ui;background:#f2f7f4;color:#143d2c;display:grid;place-items:center;min-height:90vh"><main style="background:white;border-radius:20px;padding:35px;max-width:520px"><h1>Betaling controleren</h1><p><?=htmlspecialchars($state,ENT_QUOTES)?></p><p>Credits worden nog niet automatisch toegekend.</p><a href="index.php">Terug</a></main></body></html>
