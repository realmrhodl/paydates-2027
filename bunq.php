<?php
function bunqRequest(array $cfg, string $method, string $path, ?array $payload = null): array {
    $body = $payload === null ? '' : json_encode($payload, JSON_UNESCAPED_SLASHES);
    if ($payload !== null && $body === false) throw new RuntimeException('JSON encoding mislukt');
    $private = @file_get_contents($cfg['bunq_private_key_path']);
    if (!$private || !$cfg['bunq_session_token']) throw new RuntimeException('bunq credentials ontbreken');
    $signature = '';
    if (!openssl_sign($body, $signature, $private, OPENSSL_ALGO_SHA256)) throw new RuntimeException('Ondertekening mislukt');
    $headers = [
        'Content-Type: application/json', 'Accept: application/json',
        'User-Agent: ForestRoadCheckout/1.0', 'X-Bunq-Language: nl_NL',
        'X-Bunq-Region: nl_NL', 'X-Bunq-Geolocation: 0 0 0 0 NL',
        'X-Bunq-Client-Request-Id: '.bin2hex(random_bytes(16)),
        'X-Bunq-Client-Authentication: '.$cfg['bunq_session_token'],
        'X-Bunq-Client-Signature: '.base64_encode($signature),
    ];
    $ch = curl_init(rtrim($cfg['bunq_api_base'],'/').$path);
    curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>$headers,CURLOPT_TIMEOUT=>20,CURLOPT_CONNECTTIMEOUT=>8]);
    if ($payload !== null) curl_setopt($ch,CURLOPT_POSTFIELDS,$body);
    $raw = curl_exec($ch);$status=curl_getinfo($ch,CURLINFO_HTTP_CODE);
    if ($raw===false) throw new RuntimeException('bunq verbinding mislukt');
    curl_close($ch);
    $data=json_decode($raw,true);
    if ($status<200||$status>=300||!is_array($data)) throw new RuntimeException('bunq API fout (HTTP '.$status.')');
    return $data;
}
function bunqObject(array $response, string $type): array {
    foreach (($response['Response']??[]) as $entry) if (isset($entry[$type])) return $entry[$type];
    if (isset($response[$type])) return $response[$type];
    throw new RuntimeException('Onverwachte bunq response: '.$type);
}
