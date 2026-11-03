<?php
session_start();header('Content-Type: application/json');header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD']!=='POST'||!hash_equals($_SESSION['csrf']??'',$_SERVER['HTTP_X_CSRF_TOKEN']??'')){http_response_code(403);echo json_encode(['error'=>'Ongeldig verzoek']);exit;}
try {
    $cfg=require __DIR__.'/config.php';require __DIR__.'/bunq.php';
    $input=json_decode(file_get_contents('php://input'),true);
    if (($input['product']??'')!=='credits_500') throw new RuntimeException('Ongeldig product');
    $db=new PDO('sqlite:'.__DIR__.'/orders.sqlite',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $db->exec('CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, product TEXT NOT NULL, amount TEXT NOT NULL, credits INTEGER NOT NULL, bunq_tab_id INTEGER UNIQUE, status TEXT NOT NULL, created_at TEXT NOT NULL)');
    $order=bin2hex(random_bytes(16));
    $db->prepare('INSERT INTO orders (id,product,amount,credits,status,created_at) VALUES (?, ?, ?, ?, ?, ?)')->execute([$order,'credits_500','50.00',500,'pending',gmdate('c')]);
    $base='/user/'.(int)$cfg['bunq_user_id'].'/monetary-account/'.(int)$cfg['bunq_monetary_account_id'].'/bunqme-tab';
    $result=bunqRequest($cfg,'POST',$base,['bunqme_tab_entry'=>['amount_inquired'=>['value'=>'50.00','currency'=>'EUR'],'description'=>'Forest Road B.V. - 500 credits - '.$order,'redirect_url'=>rtrim($cfg['base_url'],'/').'/return.php?order='.$order]]);
    $id=(int)(bunqObject($result,'Id')['id']??bunqObject($result,'Id'));
    if ($id<=0) throw new RuntimeException('Geen bunq tab-ID');
    $db->prepare('UPDATE orders SET bunq_tab_id=? WHERE id=?')->execute([$id,$order]);
    $tab=bunqObject(bunqRequest($cfg,'GET',$base.'/'.$id),'BunqMeTab');
    $url=$tab['bunqme_tab_share_url']??'';
    if (!filter_var($url,FILTER_VALIDATE_URL)||!in_array(parse_url($url,PHP_URL_SCHEME),['https'],true)||!preg_match('/(^|\.)bunq\.(com|net)$/i',parse_url($url,PHP_URL_HOST)??'')) throw new RuntimeException('Ongeldige bunq-betaallink');
    echo json_encode(['url'=>$url]);
} catch (Throwable $e) {error_log('Checkout: '.$e->getMessage());http_response_code(502);echo json_encode(['error'=>'Betaling starten mislukt. Probeer later opnieuw.']);}
