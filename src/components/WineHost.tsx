import React from 'react';
import { motion } from 'framer-motion';

export type HostPose = 'welcome' | 'thinking' | 'presenting' | 'excited';

interface WineHostProps {
    pose: HostPose;
    dialogue: string;
}

export const WineHost: React.FC<WineHostProps> = ({ pose, dialogue }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            padding: '32px',
        }}>
            {/* Sommelier Character */}
            <motion.div
                key={pose}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    position: 'relative',
                    width: '200px',
                    height: '280px',
                }}
            >
                <SommelierCharacter pose={pose} />
            </motion.div>

            {/* Speech Bubble */}
            {dialogue && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    style={{
                        position: 'relative',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        padding: '20px 28px',
                        borderRadius: '20px',
                        maxWidth: '500px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        border: '2px solid rgba(212, 175, 55, 0.3)',
                    }}
                >
                    {/* Speech bubble tail */}
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderBottom: '10px solid rgba(255, 255, 255, 0.95)',
                    }} />

                    <p style={{
                        margin: 0,
                        color: '#2a2424',
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        fontFamily: 'var(--font-sans)',
                        textAlign: 'center',
                    }}>
                        {dialogue}
                    </p>
                </motion.div>
            )}
        </div>
    );
};

const SommelierCharacter: React.FC<{ pose: HostPose }> = ({ pose }) => {
    const getArmPosition = () => {
        switch (pose) {
            case 'welcome':
                return { left: 'rotate(-30deg)', right: 'rotate(30deg)' };
            case 'thinking':
                return { left: 'rotate(-10deg)', right: 'rotate(90deg) translateY(-20px)' };
            case 'presenting':
                return { left: 'rotate(-10deg)', right: 'rotate(-45deg) translateX(20px)' };
            case 'excited':
                return { left: 'rotate(-120deg)', right: 'rotate(120deg)' };
        }
    };

    const armPos = getArmPosition();

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Head */}
            <motion.div
                animate={{
                    y: pose === 'excited' ? [-2, 2, -2] : [0, -3, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '70px',
                    backgroundColor: '#f5d5b8',
                    borderRadius: '50% 50% 45% 45%',
                    border: '3px solid #722f37',
                    zIndex: 3,
                }}
            >
                {/* Eyes */}
                <div style={{
                    position: 'absolute',
                    top: '25px',
                    left: '15px',
                    display: 'flex',
                    gap: '18px',
                }}>
                    <div style={{
                        width: '8px',
                        height: pose === 'thinking' ? '3px' : '8px',
                        backgroundColor: '#2a2424',
                        borderRadius: '50%',
                        transition: 'all 0.3s',
                    }} />
                    <div style={{
                        width: '8px',
                        height: pose === 'thinking' ? '3px' : '8px',
                        backgroundColor: '#2a2424',
                        borderRadius: '50%',
                        transition: 'all 0.3s',
                    }} />
                </div>

                {/* Smile */}
                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '30px',
                    height: pose === 'excited' ? '18px' : '12px',
                    borderBottom: '3px solid #722f37',
                    borderRadius: '0 0 50% 50%',
                    transition: 'all 0.3s',
                }} />
            </motion.div>

            {/* Bow Tie */}
            <div style={{
                position: 'absolute',
                top: '85px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '20px',
                zIndex: 4,
            }}>
                <div style={{
                    position: 'absolute',
                    left: 0,
                    width: 0,
                    height: 0,
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderRight: '15px solid #722f37',
                }} />
                <div style={{
                    position: 'absolute',
                    right: 0,
                    width: 0,
                    height: 0,
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderLeft: '15px solid #722f37',
                }} />
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '8px',
                    height: '20px',
                    backgroundColor: '#722f37',
                }} />
            </div>

            {/* Body (Vest) */}
            <div style={{
                position: 'absolute',
                top: '90px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '120px',
                backgroundColor: '#3a2a2a',
                borderRadius: '10px 10px 20px 20px',
                border: '3px solid #722f37',
                zIndex: 1,
            }}>
                {/* Vest buttons */}
                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#d4af37', borderRadius: '50%' }} />
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#d4af37', borderRadius: '50%' }} />
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#d4af37', borderRadius: '50%' }} />
                </div>
            </div>

            {/* Left Arm */}
            <motion.div
                animate={{ rotate: armPos.left }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    position: 'absolute',
                    top: '100px',
                    left: '25px',
                    width: '15px',
                    height: '60px',
                    backgroundColor: '#3a2a2a',
                    borderRadius: '8px',
                    transformOrigin: 'top center',
                    zIndex: 0,
                }}
            />

            {/* Right Arm */}
            <motion.div
                animate={{ transform: `${armPos.right}` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    position: 'absolute',
                    top: '100px',
                    right: '25px',
                    width: '15px',
                    height: '60px',
                    backgroundColor: '#3a2a2a',
                    borderRadius: '8px',
                    transformOrigin: 'top center',
                    zIndex: 0,
                }}
            />
        </div>
    );
};
