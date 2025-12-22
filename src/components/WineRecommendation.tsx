import React from 'react';
import { motion } from 'framer-motion';
import type { Wine } from '../data/wines';
import { Droplets, Hexagon, Leaf, Grape, RotateCcw } from 'lucide-react';

interface WineRecommendationProps {
    wines: Array<{
        wine: Wine;
        score: number;
        reasons: string[];
    }>;
    onRestart: () => void;
}

export const WineRecommendation: React.FC<WineRecommendationProps> = ({ wines, onRestart }) => {
    return (
        <div style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
        }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '48px',
            }}>
                <h2 style={{
                    fontSize: '2.5rem',
                    marginBottom: '16px',
                    color: 'var(--color-gold)',
                }}>
                    Your Perfect Matches
                </h2>
                <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--color-text-secondary)',
                }}>
                    Based on your preferences, here are my top recommendations
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '32px',
                marginBottom: '48px',
            }}>
                {wines.map(({ wine, score, reasons }, index) => (
                    <motion.div
                        key={wine.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                    >
                        <WineRecommendationCard wine={wine} score={score} reasons={reasons} rank={index + 1} />
                    </motion.div>
                ))}
            </div>

            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={onRestart}
                    style={{
                        padding: '16px 32px',
                        backgroundColor: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-accent-primary)';
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                >
                    <RotateCcw size={20} />
                    Start Over
                </button>
            </div>
        </div>
    );
};

const WineRecommendationCard: React.FC<{
    wine: Wine;
    score: number;
    reasons: string[];
    rank: number;
}> = ({ wine, score, reasons, rank }) => {
    const matchPercentage = Math.round(score * 100);

    return (
        <div style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: rank === 1 ? '2px solid var(--color-gold)' : '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: rank === 1 ? 'var(--shadow-glow)' : 'var(--shadow-md)',
            position: 'relative',
        }}>
            {/* Rank Badge */}
            {rank === 1 && (
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: 'var(--color-gold)',
                    color: '#0f0c0c',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                }}>
                    ⭐ Top Pick
                </div>
            )}

            {/* Wine Image */}
            <div style={{
                position: 'relative',
                height: '240px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
            }}>
                <div style={{
                    fontSize: '6rem',
                    opacity: 0.3,
                }}>
                    🍷
                </div>

                {/* Price Tag */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(15, 12, 12, 0.9)',
                    backdropFilter: 'blur(4px)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--color-gold)',
                    border: '1px solid var(--color-gold-dim)',
                }}>
                    ${wine.price}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
                {/* Match Percentage */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                }}>
                    <div style={{
                        flex: 1,
                        height: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${matchPercentage}%` }}
                            transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                            style={{
                                height: '100%',
                                backgroundColor: matchPercentage > 80 ? 'var(--color-gold)' : 'var(--color-accent-secondary)',
                                borderRadius: '4px',
                            }}
                        />
                    </div>
                    <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--color-gold)',
                    }}>
                        {matchPercentage}%
                    </span>
                </div>

                {/* Wine Info */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '4px',
                    }}>
                        {wine.region} • {wine.year}
                    </div>
                    <h3 style={{
                        fontSize: '1.5rem',
                        marginBottom: '8px',
                        lineHeight: 1.2,
                    }}>
                        {wine.name}
                    </h3>
                    <p style={{
                        fontSize: '0.925rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.5,
                        marginBottom: '16px',
                    }}>
                        {wine.description}
                    </p>
                </div>

                {/* Why This Wine */}
                {reasons.length > 0 && (
                    <div style={{
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        marginBottom: '16px',
                    }}>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--color-gold)',
                            marginBottom: '8px',
                        }}>
                            Why this wine?
                        </div>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '20px',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.6,
                        }}>
                            {reasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Characteristics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                }}>
                    <FeatureBar icon={<Hexagon size={14} />} label="Intensity" value={wine.features.intensity} />
                    <FeatureBar icon={<Droplets size={14} />} label="Acidity" value={wine.features.acidity} />
                    <FeatureBar icon={<Grape size={14} />} label="Sweetness" value={wine.features.sweetness} />
                    <FeatureBar icon={<Leaf size={14} />} label="Tannin" value={wine.features.tannin} />
                </div>
            </div>
        </div>
    );
};

const FeatureBar: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
        }}>
            <span style={{ color: 'var(--color-gold-dim)' }}>{icon}</span>
            {label}
        </div>
        <div style={{
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
        }}>
            <div style={{
                width: `${value * 10}%`,
                height: '100%',
                backgroundColor: 'var(--color-gold)',
                borderRadius: '2px',
            }} />
        </div>
    </div>
);
