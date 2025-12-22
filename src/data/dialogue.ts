export interface DialogueSet {
    welcome: string[];
    askingPreferences: string[];
    thinking: string[];
    presenting: string[];
    noMatch: string[];
    encouragement: string[];
}

export const dialogue: DialogueSet = {
    welcome: [
        "Welcome to our cozy winery! I'm delighted to help you find the perfect wine today.",
        "Ah, wonderful to see you! Let me guide you to a wine that will truly delight your palate.",
        "Greetings, my friend! I have a feeling we'll find something extraordinary for you today.",
    ],
    askingPreferences: [
        "Tell me, what brings you to our cellar today?",
        "I'm curious - what kind of experience are you seeking?",
        "Let's discover your perfect match. What are you in the mood for?",
    ],
    thinking: [
        "Hmm, let me think about this...",
        "Ah yes, I have just the thing in mind...",
        "Give me a moment to consider our collection...",
        "Interesting choices! Let me find something special...",
    ],
    presenting: [
        "I have the perfect recommendation for you!",
        "Based on your preferences, I've selected something wonderful.",
        "Here's what I think you'll absolutely love:",
        "Allow me to present my carefully chosen selection:",
    ],
    noMatch: [
        "Hmm, I'm having trouble finding the perfect match. Perhaps we could adjust your preferences?",
        "Our current selection doesn't quite match what you're looking for. Shall we try different criteria?",
    ],
    encouragement: [
        "Excellent choice!",
        "You have wonderful taste!",
        "I think you're going to love this!",
        "A superb selection!",
    ]
};

export const getRandomDialogue = (category: keyof DialogueSet): string => {
    const options = dialogue[category];
    return options[Math.floor(Math.random() * options.length)];
};
