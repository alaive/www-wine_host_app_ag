<?php
// php/db.php

// Database configuration
// Note: In a production environment, you might want to use environment variables 
// or move this to a file outside the web root.
$db_mode = isset($_COOKIE['db_mode']) ? $_COOKIE['db_mode'] : 'remote';

if ($db_mode === 'local') {
    $host = '127.0.0.1';
    $user = 'root';
    $pass = 'root';
} else {
    $host = '93.240.31.32';
    $user = 'david';
    $pass = 'chevere';
}
$db   = 'welly';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>
