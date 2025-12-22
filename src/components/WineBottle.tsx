import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Wine } from '../data/wines';

interface WineBottleProps {
    wine: Wine;
    position: [number, number, number];
    isRecommended?: boolean;
}

export const WineBottle = ({ wine, position, isRecommended = false }: WineBottleProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const [isNear, setIsNear] = useState(false);

    // Load common label textures
    const textures = useTexture({
        red: '/images/textures/label_red.png',
        white: '/images/textures/label_white.png',
        sparkling: '/images/textures/label_sparkling.png'
    });

    // Try to load wine-specific label, fallback to generic type label
    const labelPath = `/images/wines/${wine.id}.png`;

    const getLabelTexture = (type: string) => {
        switch (type) {
            case 'Red': return textures.red;
            case 'Rosé': return textures.red;
            case 'White': return textures.white;
            case 'Sparkling': return textures.sparkling;
            default: return textures.red;
        }
    };

    // Use wine-specific image if available, otherwise fallback to type-based
    let labelTexture;
    try {
        labelTexture = useTexture(labelPath);
    } catch {
        labelTexture = getLabelTexture(wine.type);
    }

    // Bottle colors based on type
    const getBottleColor = (type: string) => {
        switch (type) {
            case 'White': return '#e6e6a1'; // Pale yellow
            case 'Red': return '#4a0404'; // Deep red
            case 'Rosé': return '#ffb7b2'; // Pink
            case 'Sparkling': return '#2e3b26'; // Dark green typically
            default: return '#2d2d2d';
        }
    };

    const bottleColor = getBottleColor(wine.type);

    useFrame((state) => {
        if (groupRef.current) {
            // Subtle float effect
            if (hovered || isRecommended) {
                groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
                groupRef.current.rotation.y += 0.01;
            } else {
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1], 0.1);
                groupRef.current.rotation.y = 0;
            }

            // Proximity Check
            // Check distance from camera position (since camera follows avatar roughly)
            // Ideally we check from Avatar position, but we don't have it here.

            // If isRecommended is true, set near to true as well.
            if (isRecommended) {
                // Toggle near based on arrival time? 
                setIsNear(true);
            } else {
                setIsNear(hovered);
            }
        }
    });

    return (
        <group
            ref={groupRef}
            position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Bottle Body */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.3, 16]} />
                <meshStandardMaterial color={bottleColor} roughness={0.1} metalness={0.6} transparent opacity={0.95} />
            </mesh>

            {/* Bottle Neck */}
            <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.025, 0.07, 0.1, 16]} />
                <meshStandardMaterial color={bottleColor} roughness={0.1} metalness={0.6} transparent opacity={0.95} />
            </mesh>

            {/* Label */}
            <mesh position={[0, 0.15, 0.071]}>
                <planeGeometry args={[0.1, 0.15]} />
                <meshStandardMaterial map={labelTexture} transparent roughness={0.4} />
            </mesh>

            {/* Simple Label Text (Always visible overlays label) - maybe remove if label tex is enough? 
                Let's keep it for readability if tex is generic */}
            <Text
                position={[0, 0.15, 0.073]}
                fontSize={0.02}
                color="black"
                anchorX="center"
                anchorY="middle"
                maxWidth={0.09}
            >
                {wine.winery}
            </Text>

            {/* Floating Info Panel */}
            {(isNear) && (
                <Html position={[0.2, 0.5, 0]} center distanceFactor={8} zIndexRange={[100, 0]}>
                    <div className="wine-info-panel" style={{
                        background: 'rgba(20, 10, 8, 0.95)',
                        backdropFilter: 'blur(12px)',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '2px solid rgba(212, 175, 55, 0.6)',
                        color: '#f5f5dc',
                        width: '320px',
                        fontFamily: 'Inter, sans-serif',
                        pointerEvents: 'none',
                        boxShadow: '0 12px 48px rgba(0,0,0,0.9)',
                        transform: 'scale(1)',
                        transition: 'opacity 0.2s',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#d4af37', fontWeight: 600 }}>{wine.name}</h3>
                        <div style={{ fontSize: '16px', color: '#ccc', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                            {wine.winery} • {wine.year} • {wine.region}
                        </div>
                        <div style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '16px', fontStyle: 'italic', opacity: 0.9 }}>
                            "{wine.description}"
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                            {Object.entries(wine.features).map(([key, value]) => (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '13px', textTransform: 'uppercase', opacity: 0.8, width: '80px', letterSpacing: '0.5px', fontWeight: 500 }}>{key}</span>
                                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                        <div style={{ width: `${value * 10}%`, height: '100%', background: 'linear-gradient(90deg, #d4af37, #f7ef8a)', borderRadius: '4px', boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
};
