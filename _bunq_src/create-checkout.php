<?php
session_start(); header('Content-Type: application/json'); header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) { http_response_code(403); exit(json_encode(['error'=>'Ongeldig verzoek'])); }
try {
 $cfg=require __DIR__.'/config.php'; require __DIR__.'/bunq.php';
 $input=json_decode(file_get_contents('php://input'),true);
 if (($input['product']??'')!=='credits_500') throw new RuntimeException('Ongeldig product');
 $order=bin2hex(random_bytes(16));
 $base='/user/'.(int)$cfg['bunq_user_id'].'/monetary-account/'.(int)$cfg['bunq_monetary_account_id'].'/bunqme-tab';
 $result=bunqRequest($cfg,'POST',$base,['bunqme_tab_entry'=>['amount_inquired'=>['value'=>'50.00','currency'=>'EUR'],'description'=>'Forest Road B.V. - 500 credits - '.$order,'redirect_url'=>rtrim($cfg['base_url'],'/').'/return.php?order='.$order]]);
 $id=(int)(bunqObject($result,'Id')['id']??bunqObject($result,'Id'));
 if ($id<=0) throw new RuntimeException('Geen bunq tab-ID');
 $dir=$cfg['orders_dir']??dirname(__DIR__).'/private-payments';
 if (!is_dir($dir) && !mkdir($dir,0700,true) && !is_dir($dir)) throw new RuntimeException('Kan opslagmap niet maken');
 $record=['order'=>$order,'tab_id'=>$id,'amount'=>'50.00','currency'=>'EUR','credits'=>500,'status'=>'pending','created_at'=>gmdate('c')];
 if (file_put_contents($dir.'/'.$order.'.json',json_encode($record),LOCK_EX)===false) throw new RuntimeException('Opslaan mislukt');
 $tab=bunqObject(bunqRequest($cfg,'GET',$base.'/'.$id),'BunqMeTab');
 $url=$tab['bunqme_tab_share_url']??'';
 if (!filter_var($url,FILTER_VALIDATE_URL)||parse_url($url,PHP_URL_SCHEME)!=='https'||!preg_match('/(^|\.)bunq\.(com|net)$/i',parse_url($url,PHP_URL_HOST)??'')) throw new RuntimeException('Ongeldige bunq-betaallink');
 echo json_encode(['url'=>$url]);
} catch(Throwable $e){ error_log('Checkout: '.$e->getMessage()); http_response_code(502); echo json_encode(['error'=>'Betaling starten mislukt. Controleer de configuratie.']); }
