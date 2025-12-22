export interface Wine {
    id: string;
    name: string;
    region: string;
    year: number;
    type: 'Red' | 'White' | 'Rosé' | 'Sparkling';
    price: number;
    imageUrl: string;
    backgroundImage?: string;
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
        name: 'Chianti Classico Riserva',
        region: 'Tuscany, Italy',
        winery: 'Castello di Ama',
        year: 2016,
        type: 'Red',
        price: 45,
        imageUrl: 'images/chianti-classico.png',
        features: {
            intensity: 8,
            acidity: 7,
            sweetness: 1,
            tannin: 8,
        },
        description: 'A structured and elegant Chianti with notes of wild cherries, tobacco, and leather. Perfect for hearty meals.',
        occasions: ['romantic', 'celebration', 'business'],
        foodPairings: ['red-meat', 'cheese', 'pasta'],
        moods: ['sophisticated', 'comforting', 'contemplative']
    },
    {
        id: '2',
        name: 'Pecorino Riseis',
        region: 'Abruzzo, Italy',
        winery: 'Agriverde',
        year: 2018,
        type: 'White',
        price: 22,
        imageUrl: 'images/pecorino-riseis-real.png',
        backgroundImage: 'images/pecorino-vineyard-bg.jpg',
        features: {
            intensity: 7,
            acidity: 9,
            sweetness: 2,
            tannin: 1,
        },
        description: 'An organic Pecorino from Abruzzo featuring a fruity bouquet of peach, apricot, and citrus. Fresh and vibrant with high acidity and distinct minerality.',
        occasions: ['casual', 'celebration', 'gift'],
        foodPairings: ['seafood', 'cheese', 'pasta', 'vegetarian'],
        moods: ['energizing', 'sophisticated', 'celebratory']
    },
    {
        id: '3',
        name: 'Brunello di Montalcino',
        region: 'Tuscany, Italy',
        winery: 'Biondi-Santi',
        year: 2015,
        type: 'Red',
        price: 120,
        imageUrl: 'images/brunello.png',
        features: {
            intensity: 10,
            acidity: 8,
            sweetness: 1,
            tannin: 9,
        },
        description: 'A legendary wine with immense depth, offering complex aromas of dried fig, rose, and spice. A meditation wine.',
        occasions: ['celebration', 'business', 'gift'],
        foodPairings: ['red-meat', 'cheese'],
        moods: ['contemplative', 'sophisticated']
    },
    {
        id: '4',
        name: 'Prosecco Superiore DOCG',
        region: 'Veneto, Italy',
        winery: 'Nino Franco',
        year: 2022,
        type: 'Sparkling',
        price: 18,
        imageUrl: 'images/prosecco.png',
        features: {
            intensity: 5,
            acidity: 8,
            sweetness: 4,
            tannin: 0,
        },
        description: 'Crisp, refreshing, and lively with delicate bubbles and notes of green apple and pear.',
        occasions: ['celebration', 'casual', 'gift'],
        foodPairings: ['seafood', 'vegetarian', 'dessert', 'cheese'],
        moods: ['celebratory', 'energizing', 'relaxed']
    },
    {
        id: '5',
        name: 'Barolo Monprivato',
        region: 'Piedmont, Italy',
        winery: 'Giuseppe Mascarello',
        year: 2017,
        type: 'Red',
        price: 150,
        imageUrl: 'images/barolo.png',
        features: {
            intensity: 9,
            acidity: 9,
            sweetness: 1,
            tannin: 10,
        },
        description: 'A massive wine with powerful tannins and high acidity, yet floral and elegant. Notes of tar and roses.',
        occasions: ['celebration', 'business'],
        foodPairings: ['red-meat', 'cheese'],
        moods: ['contemplative', 'sophisticated']
    },
    {
        id: '6',
        name: 'Franciacorta Satèn',
        region: 'Lombardy, Italy',
        winery: 'Ca del Bosco',
        year: 2019,
        type: 'Sparkling',
        price: 55,
        imageUrl: 'images/franciacorta.png',
        features: {
            intensity: 6,
            acidity: 8,
            sweetness: 3,
            tannin: 0,
        },
        description: 'Silky and creamy sparkling wine with fine perlage and hints of vanilla and almond.',
        occasions: ['celebration', 'romantic', 'gift'],
        foodPairings: ['seafood', 'white-meat', 'cheese'],
        moods: ['sophisticated', 'celebratory', 'relaxed']
    },
    {
        id: '7',
        name: 'Cerasuolo d’Abruzzo',
        region: 'Abruzzo, Italy',
        winery: 'Masciarelli',
        year: 2021,
        type: 'Rosé',
        price: 20,
        imageUrl: 'images/cerasuolo.png',
        features: {
            intensity: 6,
            acidity: 7,
            sweetness: 3,
            tannin: 2,
        },
        description: 'A deep pink rosé with aromas of strawberry and cherry. Fresh but with good structure and body.',
        occasions: ['casual', 'romantic'],
        foodPairings: ['white-meat', 'seafood', 'pasta', 'vegetarian'],
        moods: ['relaxed', 'energizing', 'comforting']
    },
    {
        id: '8',
        name: 'Just Molamatta',
        region: 'Friuli, Italy',
        winery: 'Marco Felluga',
        year: 2021,
        type: 'White',
        price: 28,
        imageUrl: 'images/just-molamatta.png',
        features: {
            intensity: 7,
            acidity: 8,
            sweetness: 2,
            tannin: 1,
        },
        description: 'An elegant and complex Collio blend from Marco Felluga. Features fresh exotic fruit aromas of pear and apple with creamy, mineral notes and a well-balanced palate.',
        occasions: ['romantic', 'business', 'celebration'],
        foodPairings: ['white-meat', 'seafood', 'cheese'],
        moods: ['sophisticated', 'relaxing', 'comforting']
    },
    {
        id: '9',
        name: 'Duerussolo',
        region: 'Veneto, Italy',
        winery: 'Russolo',
        year: 2022,
        type: 'White',
        price: 25,
        imageUrl: 'images/duerussolo.png',
        features: {
            intensity: 8,
            acidity: 8,
            sweetness: 2,
            tannin: 1,
        },
        description: 'A smooth and intense white wine by Russolo Rino. A blend of Chardonnay and Sauvignon Blanc pairing perfectly with pasta and fish.',
        occasions: ['casual', 'romantic', 'celebration'],
        foodPairings: ['pasta', 'seafood', 'white-meat'],
        moods: ['comforting', 'relaxing', 'celebratory']
    },
    {
        id: '10',
        name: 'Amarone della Valpolicella',
        region: 'Veneto, Italy',
        winery: 'Dal Forno Romano',
        year: 2013,
        type: 'Red',
        price: 350,
        imageUrl: 'images/amarone.png',
        features: {
            intensity: 10,
            acidity: 6,
            sweetness: 4,
            tannin: 8,
        },
        description: 'Dark, intense, and opulent. Flavors of black cherry, chocolate, and smoke. A monumental wine.',
        occasions: ['celebration', 'business', 'gift'],
        foodPairings: ['red-meat', 'cheese', 'dessert'],
        moods: ['contemplative', 'sophisticated']
    },
    {
        id: '11',
        name: 'Etna Rosato',
        region: 'Sicily, Italy',
        winery: 'Tenuta delle Terre Nere',
        year: 2022,
        type: 'Rosé',
        price: 24,
        imageUrl: 'images/etna-rosato.png',
        features: {
            intensity: 5,
            acidity: 9,
            sweetness: 2,
            tannin: 3,
        },
        description: 'Minerally and crisp with notes of red berries and wild herbs. Volcanic terroir shines through.',
        occasions: ['casual', 'romantic'],
        foodPairings: ['seafood', 'vegetarian', 'pasta'],
        moods: ['energizing', 'relaxed']
    },
    {
        id: '12',
        name: 'Trento DOC Brut',
        region: 'Trentino, Italy',
        winery: 'Ferrari',
        year: 2020,
        type: 'Sparkling',
        price: 25,
        imageUrl: 'images/ferrari-brut.png',
        features: {
            intensity: 5,
            acidity: 8,
            sweetness: 3,
            tannin: 0,
        },
        description: 'Classic method sparkling wine with scents of golden apple and yeast. Fresh and balanced.',
        occasions: ['celebration', 'casual', 'gift'],
        foodPairings: ['seafood', 'cheese', 'white-meat'],
        moods: ['celebratory', 'energizing']
    },
    {
        id: '13',
        name: 'Tignanello',
        region: 'Tuscany, Italy',
        winery: 'Antinori',
        year: 2019,
        type: 'Red',
        price: 135,
        imageUrl: 'images/tignanello.png',
        features: {
            intensity: 9,
            acidity: 8,
            sweetness: 2,
            tannin: 9,
        },
        description: 'A Super Tuscan icon. Sangiovese blended with Cabernet. Complex, rich, and capable of long aging.',
        occasions: ['celebration', 'business', 'gift'],
        foodPairings: ['red-meat', 'cheese'],
        moods: ['sophisticated', 'contemplative']
    },
    {
        id: '14',
        name: 'Primitivo di Manduria',
        region: 'Puglia, Italy',
        winery: 'San Marzano',
        year: 2020,
        type: 'Red',
        price: 19,
        imageUrl: 'images/primitivo.png',
        features: {
            intensity: 8,
            acidity: 5,
            sweetness: 5,
            tannin: 6,
        },
        description: 'Jammy and full-bodied with notes of ripe plums, cocoa, and spice. velvety texture.',
        occasions: ['casual', 'comforting'],
        foodPairings: ['red-meat', 'pasta', 'cheese'],
        moods: ['comforting', 'relaxed']
    }
];
