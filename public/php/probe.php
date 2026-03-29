<?php
require_once 'db.php';
header('Content-Type: application/json');

$stmt = $pdo->prepare("SELECT obj, var, val, role FROM entities_object WHERE obj IN (SELECT obj FROM entities_object WHERE var='scenario_id' AND FIND_IN_SET('62', REPLACE(val, ' ', ''))) ORDER BY obj, var");
$stmt->execute();
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
