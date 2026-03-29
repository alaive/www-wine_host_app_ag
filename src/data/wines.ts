export interface Wine {
    id: string;
    name: string;
    region: string;
    year: number;
    type: 'Red' | 'White' | 'Rosé' | 'Sparkling';
    price: number;
    imageUrl: string;
    backgroundImage?: string;
    isWinner?: number; // 0: no, 1+: yes (level/priority)
    features: {
        intensity: number; // 1-10
        acidity: number;   // 1-10
        sweetness: number; // 1-10
        tannin: number;    // 1-10
    };
    description: string;
    occasions: string[]; // celebration, casual, romantic, gift, business
    foodPairings: string[]; // red-meat, white-meat, seafood, cheese, dessert, vegetarian, pasta
    moods: string[]; // relaxing, energizing, sophisticated, comforting, celebratory
    winery: string;
}

export const wines: Wine[] = [
    {
        id: '1',
        name: 'Brunello di Montalcino',
        region: 'Tuscany, Italy',
        winery: 'Biondi-Santi',
        year: 2015,
        type: 'Red',
        price: 120,
        imageUrl: 'images/entitywinebrunellodimontalcino.png',
        features: { intensity: 10, acidity: 8, sweetness: 1, tannin: 9 },
        description: 'A legendary wine with immense depth, offering complex aromas of dried fig, rose, and spice.',
        occasions: ['celebration', 'business'],
        foodPairings: ['red-meat', 'cheese'],
        moods: ['contemplative', 'sophisticated']
    },
    {
        id: '2',
        name: 'Duerussolo',
        region: 'Veneto, Italy',
        winery: 'Russolo',
        year: 2022,
        type: 'White',
        price: 25,
        imageUrl: 'images/entitywineduerussolo.png',
        features: { intensity: 7, acidity: 8, sweetness: 2, tannin: 1 },
        description: 'A smooth and intense white wine blend of Chardonnay and Sauvignon Blanc.',
        occasions: ['casual', 'romantic'],
        foodPairings: ['seafood', 'pasta'],
        moods: ['relaxing', 'comforting']
    },
    {
        id: '3',
        name: 'Just Molamatta',
        region: 'Friuli, Italy',
        winery: 'Marco Felluga',
        year: 2021,
        type: 'White',
        price: 28,
        imageUrl: 'images/entitywinejustmolamatta.png',
        features: { intensity: 7, acidity: 8, sweetness: 2, tannin: 1 },
        description: 'An elegant and complex Collio blend with exotic fruit aromas and mineral notes.',
        occasions: ['romantic', 'business'],
        foodPairings: ['white-meat', 'seafood'],
        moods: ['sophisticated', 'relaxing']
    },
    {
        id: '4',
        name: 'Lavignone',
        region: 'Piedmont, Italy',
        winery: 'Pico Maccario',
        year: 2021,
        type: 'Red',
        price: 18,
        imageUrl: 'images/entitywinelavignone.png',
        features: { intensity: 6, acidity: 7, sweetness: 2, tannin: 4 },
        description: 'A fresh and vibrant Barbera d\'Asti with notes of red berries and floral hints.',
        occasions: ['casual', 'comforting'],
        foodPairings: ['pasta', 'vegetarian'],
        moods: ['relaxed', 'comforting']
    },
    {
        id: '5',
        name: 'Amalaya Malbec',
        region: 'Salta, Argentina',
        winery: 'Amalaya',
        year: 2020,
        type: 'Red',
        price: 15,
        imageUrl: 'images/entitywineamalayamalbec.png',
        features: { intensity: 8, acidity: 6, sweetness: 2, tannin: 7 },
        description: 'A high-altitude Malbec with intense fruit flavors of plum and spice.',
        occasions: ['casual', 'gift'],
        foodPairings: ['red-meat'],
        moods: ['energizing', 'comforting']
    },
    {
        id: '6',
        name: 'Casillero del Diablo',
        region: 'Central Valley, Chile',
        winery: 'Concha y Toro',
        year: 2021,
        type: 'Red',
        price: 12,
        imageUrl: 'images/entitywinecasillerodeldiablocarmenere.png',
        features: { intensity: 7, acidity: 6, sweetness: 2, tannin: 6 },
        description: 'A classic Carmenere with notes of black fruit, chocolate, and subtle spice.',
        occasions: ['casual', 'party'],
        foodPairings: ['red-meat', 'cheese'],
        moods: ['relaxed', 'comforting']
    },
    {
        id: '7',
        name: 'Cervaro della Sala',
        region: 'Umbria, Italy',
        winery: 'Antinori',
        year: 2021,
        type: 'White',
        price: 65,
        imageUrl: 'images/entitywinecervarodellasala.png',
        features: { intensity: 9, acidity: 8, sweetness: 2, tannin: 1 },
        description: 'A prestigious Chardonnay-Grechetto blend with complex notes of citrus and vanilla.',
        occasions: ['celebration', 'business'],
        foodPairings: ['white-meat', 'seafood'],
        moods: ['sophisticated', 'celebratory']
    },
    {
        id: '8',
        name: 'Chateau Peyre-Lebade',
        region: 'Haut-Médoc, France',
        winery: 'Rothschild',
        year: 2018,
        type: 'Red',
        price: 35,
        imageUrl: 'images/entitywinechateaupeyrelebade.png',
        features: { intensity: 8, acidity: 7, sweetness: 1, tannin: 8 },
        description: 'A balanced Bordeaux with notes of black currant, cedar, and elegant tannins.',
        occasions: ['dinner', 'gift'],
        foodPairings: ['red-meat', 'cheese'],
        moods: ['sophisticated', 'relaxed']
    },
    {
        id: '9',
        name: 'Condado de Haza',
        region: 'Ribera del Duero, Spain',
        winery: 'Familia Fernández Rivera',
        year: 2019,
        type: 'Red',
        price: 25,
        imageUrl: 'images/entitywinecondadodehaza.png',
        features: { intensity: 9, acidity: 6, sweetness: 1, tannin: 9 },
        description: 'A robust Tempranillo with deep flavors of black fruit, licorice, and roasted coffee.',
        occasions: ['dinner', 'business'],
        foodPairings: ['red-meat'],
        moods: ['sophisticated', 'comforting']
    },
    {
        id: '10',
        name: 'Gavi dei Gavi',
        region: 'Piedmont, Italy',
        winery: 'La Scolca',
        year: 2022,
        type: 'White',
        price: 40,
        imageUrl: 'images/entitywinegavideigavi.png',
        features: { intensity: 7, acidity: 9, sweetness: 2, tannin: 1 },
        description: 'The definitive Gavi, with intense minerality and refreshing notes of flint and lemon.',
        occasions: ['celebration', 'romantic'],
        foodPairings: ['seafood', 'vegetarian'],
        moods: ['sophisticated', 'energizing']
    },
    {
        id: '11',
        name: 'Grifone Primitivo',
        region: 'Puglia, Italy',
        winery: 'Grifone',
        year: 2021,
        type: 'Red',
        price: 14,
        imageUrl: 'images/entitywinegrifonero.png',
        features: { intensity: 8, acidity: 5, sweetness: 4, tannin: 6 },
        description: 'A smooth and jammy Primitivo with rich flavors of plum, cherry, and subtle spice.',
        occasions: ['casual', 'comforting'],
        foodPairings: ['pasta', 'red-meat'],
        moods: ['comforting', 'relaxed']
    },
    {
        id: '12',
        name: 'La Tense Sassella',
        region: 'Lombardy, Italy',
        winery: 'Nino Negri',
        year: 2019,
        type: 'Red',
        price: 30,
        imageUrl: 'images/entitywinelatensesassella.png',
        features: { intensity: 7, acidity: 8, sweetness: 1, tannin: 8 },
        description: 'An elegant Nebbiolo from Valtellina with complex aromas of dried rose and spices.',
        occasions: ['dinner', 'contemplation'],
        foodPairings: ['red-meat', 'cheese'],
        moods: ['contemplative', 'sophisticated']
    }
];
