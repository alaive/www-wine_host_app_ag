<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("DESCRIBE entities");
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
