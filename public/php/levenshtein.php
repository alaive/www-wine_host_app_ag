<?php
// php/levenshtein.php
define('LEVEN_VERSION', '1.2.1-20260329');

/**
 * Calculates the Levenshtein distance between two strings.
 * PHP has a built-in levenshtein() function but we recreate it
 * if we want custom behavior or to ensure consistency with JS logic.
 * However, PHP's built-in is very efficient.
 */
function getLevenshteinDistance($a, $b)
{
    return levenshtein($a, $b);
}

function fuzzyMatch($text, $concept, $threshold = 2)
{
    $text = strtolower($text);
    $concept = strtolower($concept);

    // 1. Strict Word Boundary Match (instead of simple strpos)
    // Ensures "in" doesn't match "wine", but "red wine" matches "i want red wine".
    if (preg_match('/\b' . preg_quote($concept, '/') . '\b/i', $text)) {
        return true;
    }

    $textWords = preg_split('/\s+/', $text);
    $conceptWords = preg_split('/\s+/', $concept);

    // If concept is single word
    if (count($conceptWords) === 1) {
        $cWord = $conceptWords[0];
        foreach ($textWords as $word) {
            // Stricter Thresholds:
            // - 3 letters or less: MUST be exact (\b check already caught this)
            // - 4-5 letters: Only allowed 1 char diff IF it's not a common collision
            // - 6+ letters: Allowed 2 char diff (threshold)
            $len = strlen($cWord);
            if ($len <= 3) continue; // No fuzzy for very short words
            
            $allowed = ($len < 6) ? 1 : $threshold;
            
            // Special case: "fine" vs "wine" correction
            // If the words are 4 chars and only differ by 1, we still want to be careful.
            // Let's keep it to 1, but maybe the user wants 0 for 4-letter words?
            // Actually, the user specifically complained about "fine" vs "wine".
            // Let's set allowed to 0 for words of length 4.
            if ($len === 4) $allowed = 0;

            if (levenshtein($word, $cWord) <= $allowed) {
                return true;
            }
        }
        return false;
    }

    // Multi-word concept fuzzy match
    for ($i = 0; $i <= count($textWords) - count($conceptWords); $i++) {
        $match = true;
        for ($j = 0; $j < count($conceptWords); $j++) {
            $tWord = $textWords[$i + $j];
            $cWord = $conceptWords[$j];
            $allowed = strlen($cWord) < 4 ? 0 : (strlen($cWord) < 6 ? 1 : $threshold);
            if (levenshtein($tWord, $cWord) > $allowed) {
                $match = false;
                break;
            }
        }
        if ($match)
            return true;
    }

    return false;
}
?>