import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { UserPreferences } from '../utils/recommendationEngine';

interface PreferenceQuizProps {
    onComplete: (preferences: UserPreferences) => void;
}

export const PreferenceQuiz: React.FC<PreferenceQuizProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [preferences, setPreferences] = useState<UserPreferences>({
        characteristics: {
            intensity: 5,
            acidity: 5,
            sweetness: 5,
            tannin: 5,
        },
    });

    const steps = [
        {
            title: 'Wine Characteristics',
            subtitle: 'What flavor profile do you prefer?',
            component: <CharacteristicsStep preferences={preferences} setPreferences={setPreferences} />
        },
        {
            title: 'Occasion',
            subtitle: 'What\'s the occasion?',
            component: <OccasionStep preferences={preferences} setPreferences={setPreferences} />
        },
        {
            title: 'Food Pairing',
            subtitle: 'What will you be enjoying with your wine?',
            component: <FoodPairingStep preferences={preferences} setPreferences={setPreferences} />
        },
        {
            title: 'Your Mood',
            subtitle: 'How are you feeling today?',
            component: <MoodStep preferences={preferences} setPreferences={setPreferences} />
        },
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete(preferences);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
        }}>
            {/* Progress Bar */}
            <div style={{
                marginBottom: '32px',
                display: 'flex',
                gap: '8px',
            }}>
                {steps.map((_, index) => (
                    <div
                        key={index}
                        style={{
                            flex: 1,
                            height: '4px',
                            backgroundColor: index <= step ? 'var(--color-gold)' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '2px',
                            transition: 'background-color 0.3s',
                        }}
                    />
                ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 style={{
                        fontSize: '2rem',
                        marginBottom: '8px',
                        color: 'var(--color-gold)',
                    }}>
                        {steps[step].title}
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '32px',
                    }}>
                        {steps[step].subtitle}
                    </p>

                    <div style={{ marginBottom: '32px' }}>
                        {steps[step].component}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                marginTop: '48px',
            }}>
                <button
                    onClick={handleBack}
                    disabled={step === 0}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: step === 0 ? 'transparent' : 'var(--color-bg-tertiary)',
                        color: step === 0 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: step === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                    }}
                >
                    <ChevronLeft size={20} />
                    Back
                </button>

                <button
                    onClick={handleNext}
                    style={{
                        padding: '12px 32px',
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-secondary)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)'}
                >
                    {step === steps.length - 1 ? 'Get Recommendations' : 'Next'}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

// Characteristics Step
const CharacteristicsStep: React.FC<{
    preferences: UserPreferences;
    setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}> = ({ preferences, setPreferences }) => {
    const characteristics = [
        { key: 'intensity', label: 'Intensity', description: 'Light and delicate → Bold and powerful' },
        { key: 'acidity', label: 'Acidity', description: 'Soft and mellow → Crisp and zesty' },
        { key: 'sweetness', label: 'Sweetness', description: 'Bone dry → Sweet and fruity' },
        { key: 'tannin', label: 'Tannin', description: 'Smooth and silky → Structured and grippy' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {characteristics.map(({ key, label, description }) => (
                <div key={key}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                    }}>
                        <label style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {label}
                        </label>
                        <span style={{ color: 'var(--color-gold)' }}>
                            {preferences.characteristics[key as keyof typeof preferences.characteristics]}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={preferences.characteristics[key as keyof typeof preferences.characteristics]}
                        onChange={(e) => setPreferences({
                            ...preferences,
                            characteristics: {
                                ...preferences.characteristics,
                                [key]: parseInt(e.target.value),
                            }
                        })}
                        style={{ width: '100%' }}
                    />
                    <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)',
                        marginTop: '4px',
                    }}>
                        {description}
                    </p>
                </div>
            ))}
        </div>
    );
};

// Occasion Step
const OccasionStep: React.FC<{
    preferences: UserPreferences;
    setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}> = ({ preferences, setPreferences }) => {
    const occasions = [
        { value: 'casual', label: 'Casual Dinner', emoji: '🍽️' },
        { value: 'celebration', label: 'Celebration', emoji: '🎉' },
        { value: 'romantic', label: 'Romantic Evening', emoji: '💕' },
        { value: 'gift', label: 'Gift', emoji: '🎁' },
        { value: 'business', label: 'Business Meeting', emoji: '💼' },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
        }}>
            {occasions.map(({ value, label, emoji }) => (
                <button
                    key={value}
                    onClick={() => setPreferences({ ...preferences, occasion: value })}
                    style={{
                        padding: '20px',
                        backgroundColor: preferences.occasion === value
                            ? 'var(--color-accent-primary)'
                            : 'var(--color-bg-tertiary)',
                        border: preferences.occasion === value
                            ? '2px solid var(--color-gold)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</div>
                </button>
            ))}
        </div>
    );
};

// Food Pairing Step
const FoodPairingStep: React.FC<{
    preferences: UserPreferences;
    setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}> = ({ preferences, setPreferences }) => {
    const pairings = [
        { value: 'red-meat', label: 'Red Meat', emoji: '🥩' },
        { value: 'white-meat', label: 'Poultry', emoji: '🍗' },
        { value: 'seafood', label: 'Seafood', emoji: '🦞' },
        { value: 'cheese', label: 'Cheese', emoji: '🧀' },
        { value: 'pasta', label: 'Pasta', emoji: '🍝' },
        { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
        { value: 'dessert', label: 'Dessert', emoji: '🍰' },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px',
        }}>
            {pairings.map(({ value, label, emoji }) => (
                <button
                    key={value}
                    onClick={() => setPreferences({ ...preferences, foodPairing: value })}
                    style={{
                        padding: '20px',
                        backgroundColor: preferences.foodPairing === value
                            ? 'var(--color-accent-primary)'
                            : 'var(--color-bg-tertiary)',
                        border: preferences.foodPairing === value
                            ? '2px solid var(--color-gold)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
                </button>
            ))}
        </div>
    );
};

// Mood Step
const MoodStep: React.FC<{
    preferences: UserPreferences;
    setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}> = ({ preferences, setPreferences }) => {
    const moods = [
        { value: 'relaxing', label: 'Relaxing', emoji: '😌' },
        { value: 'energizing', label: 'Energizing', emoji: '⚡' },
        { value: 'sophisticated', label: 'Sophisticated', emoji: '🎩' },
        { value: 'comforting', label: 'Comforting', emoji: '🤗' },
        { value: 'celebratory', label: 'Celebratory', emoji: '🥂' },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
        }}>
            {moods.map(({ value, label, emoji }) => (
                <button
                    key={value}
                    onClick={() => setPreferences({ ...preferences, mood: value })}
                    style={{
                        padding: '20px',
                        backgroundColor: preferences.mood === value
                            ? 'var(--color-accent-primary)'
                            : 'var(--color-bg-tertiary)',
                        border: preferences.mood === value
                            ? '2px solid var(--color-gold)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</div>
                </button>
            ))}
        </div>
    );
};
