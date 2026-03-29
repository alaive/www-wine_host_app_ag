<?php
// php/api.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db.php';
require_once 'levenshtein.php';

$action = $_GET['action'] ?? '';

try {
    if ($action === 'message') {
        $inputData = json_decode(file_get_contents('php://input'), true);
        $text = $inputData['text'] ?? '';

        if (!$text) {
            echo json_encode(['error' => 'Text is required']);
            exit;
        }

        // 1. Fetch concepts
        $stmt = $pdo->query('SELECT ccin FROM concepts');
        $concepts = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // 2. Extract similar or equal concepts
        $matches = [];
        foreach ($concepts as $concept) {
            if (fuzzyMatch($text, $concept)) {
                $matches[] = $concept;
            }
        }
        $concatenatedString = implode(' ', $matches);

        // 3. Insert into inputTxt
        $scenario_id = 62;
        $entity_id = 'YSE';
        $time = time();
        $status = '0';

        $sql = "INSERT INTO inputTxt (scenario_id, entity_id, time, string, status) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$scenario_id, $entity_id, $time, $concatenatedString, $status]);

        echo json_encode(['success' => true, 'extracted' => $concatenatedString, 'version' => LEVEN_VERSION]);

    } elseif ($action === 'response') {
        $scenario_id = 62;

        // 1. Read strings with status 0
        $stmt = $pdo->prepare("SELECT time, entity_id, string FROM outputTxt WHERE scenario_id = ? AND status = 0");
        $stmt->execute([$scenario_id]);
        $rows = $stmt->fetchAll();

        if (empty($rows)) {
            echo json_encode(['hasResponse' => false]);
            exit;
        }

        // 2. Concatenate and clean
        $rawTextArray = [];
        foreach ($rows as $row) {
            $cleanedRow = preg_replace('/:[\w]+/', '', $row['string']); // remove :ii, :ee etc
            $cleanedRow = trim($cleanedRow);
            if ($cleanedRow)
                $rawTextArray[] = $cleanedRow;
        }
        $rawText = implode(' ', $rawTextArray);

        // Advanced Coherence Logic
        $cleanText = (function ($processed) {
            if (!$processed)
                return "";

            // Phrase Deduplication (Simple heuristic replacement)
            $words = explode(' ', $processed);
            for ($len = 4; $len >= 2; $len--) {
                for ($i = 0; $i < count($words) - $len; $i++) {
                    $phrase = implode(' ', array_slice($words, $i, $len));
                    $phraseEscaped = preg_quote($phrase, '/');
                    // Regex: First occurrence, followed by anything, followed by same phrase
                    $pattern = "/($phraseEscaped)(.*?)(\\1)/i";
                    $processed = preg_replace($pattern, '$1$2', $processed);
                }
            }

            // Word Deduplication (Consecutive)
            $words = preg_split('/\s+/', $processed);
            $uniqueWords = [];
            foreach ($words as $word) {
                $lastWord = end($uniqueWords);
                $cleanCurrent = strtolower(preg_replace('/[^a-z]/', '', $word));
                $cleanLast = strtolower(preg_replace('/[^a-z]/', '', $lastWord));
                if ($cleanCurrent !== $cleanLast) {
                    $uniqueWords[] = $word;
                }
            }
            $processed = implode(' ', $uniqueWords);

            // Fix Punctuation
            $processed = preg_replace('/\s+,/', ',', $processed);
            $processed = preg_replace('/\s+\./', '.', $processed);
            $processed = preg_replace('/\s+!/', '!', $processed);
            $processed = preg_replace('/\s+\?/', '?', $processed);
            $processed = preg_replace('/\s+/', ' ', $processed);
            $processed = preg_replace('/,(\S)/', ', $1', $processed); // ensure space after comma

            // Capitalize sentences
            $processed = preg_replace_callback('/([.!?]\s+)([a-z])/', function ($m) {
                return $m[1] . strtoupper($m[2]);
            }, $processed);

            // Ensure terminal punctuation
            if ($processed && !preg_match('/[.!?]$/', $processed)) {
                $processed .= '.';
            }

            // Capitalize first letter
            return ucfirst($processed);
        })($rawText);

        // 3. Mark as status 1 only for the explicitly fetched rows
        if (!empty($rows)) {
            $updateStmt = $pdo->prepare("UPDATE outputTxt SET status = 1 WHERE scenario_id = ? AND entity_id = ? AND time = ? AND string = ?");
            foreach ($rows as $r) {
                $updateStmt->execute([$scenario_id, $r['entity_id'], $r['time'], $r['string']]);
            }
        }

        echo json_encode(['hasResponse' => true, 'text' => $cleanText]);

    } elseif ($action === 'test') {
        echo json_encode(['success' => true, 'message' => 'PHP API is working']);
    } else {
        echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>