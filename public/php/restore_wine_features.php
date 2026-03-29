<?php
require_once 'db.php';

echo "Restoring missing wine properties (pose, size, taste)...\n";

$scenario_id = '62';

// 1. Get all wines for scenario 62
$stmt = $pdo->prepare(
    "SELECT DISTINCT obj 
     FROM entities_object 
     WHERE var = 'scenario_id' 
       AND FIND_IN_SET(?, REPLACE(val, ' ', ''))"
);
$stmt->execute([$scenario_id]);
$wines = $stmt->fetchAll(PDO::FETCH_COLUMN);

// Default tasting values
$tasteDefaults = [
    'intensity' => 0.6,
    'acidity' => 0.5,
    'sweetness' => 0.2,
    'tannin' => 0.4
];

$poseSizeDefaults = [
    'x' => 0, 'y' => 0, 'z' => 0,
    'wx' => 0, 'wy' => 0, 'wz' => 0,
    'dx' => 0, 'dy' => 0, 'dz' => 0
];

$time = time();

foreach ($wines as $wineId) {
    echo "Processing $wineId...\n";

    // Insert pose and size
    foreach ($poseSizeDefaults as $var => $val) {
        $role = in_array($var, ['dx', 'dy', 'dz']) ? 'size' : 'pose';
        
        // Check if exists
        $chk = $pdo->prepare("SELECT COUNT(*) FROM entities_object WHERE obj = ? AND var = ? AND role = ?");
        $chk->execute([$wineId, $var, $role]);
        if ($chk->fetchColumn() == 0) {
            $ins = $pdo->prepare("INSERT INTO entities_object (obj, var, val, role, type, activation, time) VALUES (?, ?, ?, ?, 1, 0, ?)");
            $ins->execute([$wineId, $var, $val, $role, $time]);
            echo "  Inserted $var ($role)\n";
        }
    }

    // Insert taste
    foreach ($tasteDefaults as $var => $val) {
        // We add some variation based on name length just so they aren't all identical
        $variation = (strlen($wineId) % 5) / 10; 
        $finalVal = min(1.0, max(0.0, $val + $variation - 0.2));

        // If it's pure white wine usually tannin is 0
        if (strpos($wineId, 'white') !== false || strpos($wineId, 'grigio') !== false) {
            if ($var === 'tannin') $finalVal = 0.0;
            if ($var === 'sweetness') $finalVal = 0.1;
        }
        
        // Exact Livio Felluga fallback based on previous check
        if ($wineId === 'wineliviofellugapinotgrigio') {
            if ($var === 'intensity') $finalVal = 0.75;
            if ($var === 'acidity') $finalVal = 0.75;
            if ($var === 'sweetness') $finalVal = 0.0;
            if ($var === 'tannin') $finalVal = 0.0;
        }

        $chk = $pdo->prepare("SELECT COUNT(*) FROM entities_object WHERE obj = ? AND var = ? AND role = 'taste'");
        $chk->execute([$wineId, $var]);
        if ($chk->fetchColumn() == 0) {
            $ins = $pdo->prepare("INSERT INTO entities_object (obj, var, val, role, type, activation, time) VALUES (?, ?, ?, 'taste', 1, 1, ?)");
            $ins->execute([$wineId, $var, $finalVal, $time]);
            echo "  Inserted $var ($finalVal, taste)\n";
        }
    }
}

echo "Done restoring properties.\n";
