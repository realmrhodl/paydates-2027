<?php

return [
    // Website
    'base_url' => 'https://paydates.nl/checkout',

    // bunq LIVE API
    'bunq_api_base' => 'https://api.bunq.com/v1',

    // Zakelijke bunq API-key
    'bunq_api_key' => 'bfa9f3390807158270d11d78d3f10308072443a28d4fe38f13fe2f3708bd93fb',

    // bunq account
    'bunq_user_id' => 61719104,
    'bunq_monetary_account_id' => 12983173,

    // API-sessie
    'bunq_session_token' => '',

    // RSA-sleutel
    'bunq_private_key_path' => __DIR__ . '/bunq-private.pem',

    // Opslag zonder database
    'orders_dir' => __DIR__ . '/payments',

    // Product
    'product_name' => '50 Credits',
    'product_price' => '5.00',
    'product_currency' => 'EUR',
    'product_credits' => 50,

    // Verkoper
    'merchant_name' => 'Forest Road B.V.',
];
