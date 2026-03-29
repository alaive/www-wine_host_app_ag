<?php
require_once 'db.php';
header('Content-Type: application/json');

$scenario_id = $_GET['scenario_id'] ?? '62';

// 1. Find all objects in this scenario
$sid = trim($scenario_id);
$stmt = $pdo->prepare(
    "SELECT DISTINCT obj 
     FROM entities_object 
     WHERE var = 'scenario_id' 
       AND FIND_IN_SET(?, REPLACE(val, ' ', ''))"
);
$stmt->execute([$sid]);
$objects = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($objects)) {
    echo json_encode(['wines' => []]);
    exit;
}

// 2. Fetch all properties for these objects (including role)
$inQuery = implode(',', array_fill(0, count($objects), '?'));
$stmt = $pdo->prepare(
    "SELECT obj, var, val, role 
     FROM entities_object 
     WHERE obj IN ($inQuery)"
);
$stmt->execute($objects);
$properties = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 2b. Fetch iswinner status from entities table
$stmtWinners = $pdo->prepare(
    "SELECT id, iswinner FROM entities WHERE id IN ($inQuery)"
);
$stmtWinners->execute($objects);
foreach ($stmtWinners->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $winnerStatus[$row['id']] = (int)$row['iswinner'];
}

// 3. Group by object (handle multiple values for same key)
$grouped = [];
foreach ($properties as $row) {
    if (!isset($grouped[$row['obj']])) {
        $grouped[$row['obj']] = [];
    }
    $var = $row['var'];
    // If not set, or if new row has 'taste' role (prioritize), update it
    if (!isset($grouped[$row['obj']][$var]) || $row['role'] === 'taste') {
        $grouped[$row['obj']][$var] = [
            'val' => $row['val'],
            'role' => $row['role']
        ];
    }
    // Also store all keys to help with keyword lookups
    $grouped[$row['obj']]['_keys'][$var] = true;
    if ($row['val']) {
        $grouped[$row['obj']]['_keys'][$row['val']] = true;
    }
}

// 4. Map to Wine interface
$wines = [];
foreach ($grouped as $objId => $props) {
    if ($objId === '_keys') continue;
    $keys = $props['_keys'] ?? [];
    
    // Parse name: priority 1: myname property, priority 2: myname: prefix, priority 3: objId (stripped)
    $displayName = $objId;
    if (isset($props['myname'])) {
        $displayName = $props['myname']['val'];
    } else {
        foreach ($props as $k => $item) {
            if ($k === '_keys') continue;
            if (strpos($k, 'myname:') === 0) {
                $displayName = substr($k, 7);
                break;
            }
        }
    }
    
    // Clean up display name for UI
    $uiName = ucwords(str_replace(['-', '_'], ' ', $displayName));
    
    // Sanitize name for image matching
    $cleanNameForImg = strtolower(str_replace([' ', '-', '_'], '', $displayName));
    if (strpos($cleanNameForImg, 'wine') === 0 && strlen($cleanNameForImg) > 4) {
        $cleanNameForImg = substr($cleanNameForImg, 4);
    }
    
    // Determine type
    $type = 'Red'; // default
    if (isset($keys['whitewine'])) $type = 'White';
    elseif (isset($keys['rose']) || isset($keys['rosé'])) $type = 'Rosé';
    elseif (isset($keys['sparkling'])) $type = 'Sparkling';
    elseif (isset($keys['redwine'])) $type = 'Red';

    $exactImageName = 'entitywine' . $cleanNameForImg . '.png';
    $emImgDir = __DIR__ . '/../../../../entity_manager/img/';
    
    if (file_exists($emImgDir . $exactImageName)) {
        $imageUrl = '/entity_manager/img/' . $exactImageName;
    } else {
        $imageUrl = '/entity_manager/img/generic_bottle.png';
    }

    // Extract details
    $year = 2020; 
    $price = 25; 
    $foodPairings = [];
    $occasions = ['casual', 'dinner'];
    $moods = ['relaxed'];
    $region = 'Italy';
    $winery = 'Unknown Winery';
    
    foreach ($props as $k => $item) {
        if ($k === '_keys') continue;
        $v = $item['val'];
        if (preg_match('/^(19|20)\d{2}$/', $k)) {
            $year = (int)$k;
        } elseif (is_numeric($k) && (int)$k > 0 && (int)$k < 200) {
            $price = (int)$k;
        }

        if (in_array($k, ['beef', 'lamb', 'pork']) || in_array($v, ['beef', 'lamb', 'pork'])) $foodPairings[] = 'red-meat';
        if (in_array($k, ['fish', 'seafood']) || in_array($v, ['fish', 'seafood'])) $foodPairings[] = 'seafood';
        if (in_array($k, ['pasta', 'cheese', 'salad']) || in_array($v, ['pasta', 'cheese', 'salad'])) $foodPairings[] = $k;
        
        if ($k === 'myaffiliation' || strpos($k, 'myaffiliation:') === 0) {
            $region = ucfirst($v ?: substr($k, 14));
        }
        if ($k === 'myfather' || strpos($k, 'myfather:') === 0) {
            $winery = ucfirst($v ?: substr($k, 9));
        }
    }

    // Tasting Features (Acidity, Intensity, Sweetness, Tannin)
    // Priority 1: Numeric properties with role='taste'
    $hasTaste = ['intensity' => false, 'acidity' => false, 'sweetness' => false, 'tannin' => false];
    
    $getTaste = function($key, $fallback) use ($props, &$hasTaste) {
        if (isset($props[$key]) && $props[$key]['role'] === 'taste') {
            $hasTaste[$key] = true;
            return (float)$props[$key]['val'] * 10;
        }
        return $fallback;
    };

    $intensity = $getTaste('intensity', isset($keys['intense']) ? 8 : 5);
    $acidity   = $getTaste('acidity',   isset($keys['acidic'])  ? 7 : 4);
    $sweetness = $getTaste('sweetness', isset($keys['sweet'])   ? 6 : 2);
    $tannin    = $getTaste('tannin',    isset($keys['tannic'])  ? 8 : 4);
    
    // Keyword refinements: ONLY apply if no role='taste' value was found for that feature
    if (!$hasTaste['sweetness'] && isset($keys['dry']))    $sweetness = 1;
    if (!$hasTaste['tannin']    && isset($keys['smooth'])) $tannin    = 3;
    if (!$hasTaste['tannin']    && isset($keys['soft']))   $tannin    = 2;
    if (!$hasTaste['intensity'] && isset($keys['light']))  $intensity = 3;

    // Filter out non-wine objects
    $isWine = isset($keys['wine']) 
           || (strpos($objId, 'wine') === 0 && strlen($objId) > 4)
           || (isset($props['myrole']) && $props['myrole']['val'] === 'wine');

    if (!$isWine) continue;

    $wines[] = [
        'id' => $objId,
        'name' => $uiName,
        'region' => $region,
        'year' => $year,
        'type' => $type,
        'price' => $price,
        'imageUrl' => $imageUrl,
        'isWinner' => $winnerStatus[$objId] ?? false,
        'features' => [
            'intensity' => round($intensity, 1),
            'acidity' => round($acidity, 1),
            'sweetness' => round($sweetness, 1),
            'tannin' => round($tannin, 1)
        ],
        'description' => 'A wonderful ' . strtolower($type) . ' wine originating from ' . $region . '. Perfect for ' . implode(' and ', array_unique($occasions)) . '.',
        'occasions' => array_unique($occasions),
        'foodPairings' => empty($foodPairings) ? ['cheese'] : array_unique($foodPairings),
        'moods' => $moods,
        'winery' => $winery
    ];
}

echo json_encode(['wines' => array_values($wines)]);
