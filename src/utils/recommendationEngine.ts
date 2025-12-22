import type { Wine } from '../data/wines';

export interface UserPreferences {
    characteristics: {
        intensity: number; // 1-10
        acidity: number;
        sweetness: number;
        tannin: number;
    };
    occasion?: string;
    foodPairing?: string;
    mood?: string;
}

interface ScoredWine {
    wine: Wine;
    score: number;
    reasons: string[];
}

export const recommendWines = (wines: Wine[], preferences: UserPreferences): ScoredWine[] => {
    const scoredWines: ScoredWine[] = wines.map(wine => {
        let score = 0;
        const reasons: string[] = [];

        // Score based on characteristics (40% weight)
        const charScore = calculateCharacteristicScore(wine, preferences.characteristics);
        score += charScore * 0.4;

        if (charScore > 0.7) {
            reasons.push('matches your taste profile perfectly');
        }

        // Score based on occasion (20% weight)
        if (preferences.occasion && wine.occasions.includes(preferences.occasion)) {
            score += 0.2;
            reasons.push(`ideal for ${preferences.occasion} occasions`);
        }

        // Score based on food pairing (20% weight)
        if (preferences.foodPairing && wine.foodPairings.includes(preferences.foodPairing)) {
            score += 0.2;
            reasons.push(`pairs beautifully with ${preferences.foodPairing.replace('-', ' ')}`);
        }

        // Score based on mood (20% weight)
        if (preferences.mood && wine.moods.includes(preferences.mood)) {
            score += 0.2;
            reasons.push(`perfect for a ${preferences.mood} mood`);
        }

        return { wine, score, reasons };
    });

    // Sort by score descending
    return scoredWines.sort((a, b) => b.score - a.score);
};

const calculateCharacteristicScore = (
    wine: Wine,
    preferences: { intensity: number; acidity: number; sweetness: number; tannin: number }
): number => {
    // Calculate how close the wine characteristics are to preferences
    // Using normalized distance (0 = perfect match, 1 = worst match)
    const intensityDiff = Math.abs(wine.features.intensity - preferences.intensity) / 10;
    const acidityDiff = Math.abs(wine.features.acidity - preferences.acidity) / 10;
    const sweetnessDiff = Math.abs(wine.features.sweetness - preferences.sweetness) / 10;
    const tanninDiff = Math.abs(wine.features.tannin - preferences.tannin) / 10;

    const avgDiff = (intensityDiff + acidityDiff + sweetnessDiff + tanninDiff) / 4;

    // Convert to score (1 = perfect, 0 = worst)
    return 1 - avgDiff;
};

export const getTopRecommendations = (wines: Wine[], preferences: UserPreferences, count: number = 3): ScoredWine[] => {
    const scored = recommendWines(wines, preferences);
    return scored.slice(0, count);
};
