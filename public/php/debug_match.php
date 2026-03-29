<?php
require_once 'levenshtein.php';

$text = "i want a white wine to eat with fish";

// Fetch concepts from DB to see all matches
require_once 'db.php';
$stmt = $pdo->query('SELECT ccin FROM concepts');
$concepts = $stmt->fetchAll(PDO::FETCH_COLUMN);

$matches = [];
foreach ($concepts as $concept) {
    if (fuzzyMatch($text, $concept)) {
        $matches[] = $concept;
    }
}

echo "Text: '$text'\n";
echo "Matches:\n";
print_r($matches);
?>
