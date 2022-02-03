<?php

parse_str(implode('&', array_slice($argv, 1)), $_GET);

if (empty($_GET['url'])) {
    echo "URL not found.\n";
    exit;
}

if (empty($_GET['lang'])) {
    echo "lang not found.\n";
    exit;
}

$content = file_get_contents($_GET['url']);

preg_match('#<section class="mt2 capitalize">(.*)</section>#', $content, $match);
$lyrics = $match[1];
$paths = explode('/', $_GET['url']);
$path = end($paths);

$data = [
    "path" => $path,
    "content" => $lyrics,
];

file_put_contents("data/" . $_GET['lang'] . '/' . urlencode($path).'.json', json_encode($data));

function updateDatabase() {
    $file_path = "data/mapping.json";
    $file_handle = fopen($file_path, 'w'); 
    fwrite($file_handle, $data_to_write);
    fclose($file_handle);
}


?>