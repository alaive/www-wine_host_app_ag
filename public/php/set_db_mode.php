<?php
header('Content-Type: application/json');

if (isset($_GET['mode'])) {
    $mode = $_GET['mode'] === 'local' ? 'local' : 'remote';
    setcookie('db_mode', $mode, time() + (86400 * 30), "/"); // 30 days
    echo json_encode(['status' => 'success', 'mode' => $mode]);
} else {
    $mode = isset($_COOKIE['db_mode']) ? $_COOKIE['db_mode'] : 'remote';
    echo json_encode(['status' => 'success', 'mode' => $mode]);
}
?>
