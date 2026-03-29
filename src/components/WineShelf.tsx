import { useMemo } from 'react';
import { useTexture, Text } from '@react-three/drei';
import { WineBottle } from './WineBottle';
import type { Wine } from '../data/wines';
import * as THREE from 'three';

interface WineShelfProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    width: number;
    height: number;
    depth: number;
    wines?: Wine[];
    label?: string;
    highlightedIndex?: number;
    onWineClick?: (wine: Wine) => void;
}

export const WineShelf = ({
    position,
    rotation = [0, 0, 0],
    width,
    height,
    depth,
    wines = [],
    label,
    highlightedIndex = -1,
    onWineClick
}: WineShelfProps) => {
    // 4 levels as requested
    const shelfCount = 4;
    const shelfThickness = 0.05;

    // Total height available for shelves is 'height'. 
    // Spacing covers distance between shelf floors.
    const spacing = height / shelfCount;

    // Used for calculating bottle positions
    // Width ~2.2m. Bottle ~0.15m width. 
    // We want 4 per level centered.
    const bottlesPerLevel = 4;
    const bottleSpacing = 0.4; // Spacious placement

    const woodTexture = useTexture('./images/textures/wood_diffuse.png');
    
    // Optimization: Memoize materials and geometries to share them and avoid re-renders
    const shelfMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
        map: woodTexture, 
        roughness: 0.7, 
        color: "#5c4033" 
    }), [woodTexture]);

    const backboardMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
        map: woodTexture, 
        roughness: 0.8, 
        color: "#4a3020" 
    }), [woodTexture]);

    const shelfGeo = useMemo(() => new THREE.BoxGeometry(width, shelfThickness, depth), [width, depth]);
    const supportGeo = useMemo(() => new THREE.BoxGeometry(0.08, height + 0.2, depth), [height, depth]);
    const backboardGeo = useMemo(() => new THREE.BoxGeometry(width, height + 0.2, 0.02), [width, height]);

    return (
        <group position={position} rotation={rotation}>
            {/* Shelf Label */}
            {label && (
                <Text
                    position={[0, height + 0.3, 0]}
                    fontSize={0.25}
                    color="#f0e6d2"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            )}

            {/* Shelves Structure */}
            {Array.from({ length: shelfCount }).map((_, i) => (
                <mesh 
                    key={`shelf-${i}`} 
                    geometry={shelfGeo} 
                    material={shelfMaterial} 
                    position={[0, i * spacing + 0.2, 0]} 
                />
            ))}

            {/* Vertical Supports (Left/Right) */}
            <mesh 
                geometry={supportGeo} 
                material={shelfMaterial} 
                position={[-width / 2 + 0.04, height / 2, 0]} 
            />
            <mesh 
                geometry={supportGeo} 
                material={shelfMaterial} 
                position={[width / 2 - 0.04, height / 2, 0]} 
            />

            {/* Backboard */}
            <mesh 
                geometry={backboardGeo} 
                material={backboardMaterial} 
                position={[0, height / 2, -depth / 2]} 
            />

            {/* Bottles */}
            {wines.map((wine, index) => {
                const level = Math.floor(index / bottlesPerLevel);
                if (level >= shelfCount) return null;

                const col = index % bottlesPerLevel;
                const xPos = (col - (bottlesPerLevel - 1) / 2) * bottleSpacing;
                const bottleHeight = 0.6;
                const yPos = (level * spacing) + 0.2 + (shelfThickness / 2) + (bottleHeight / 2);
                const zPos = 0;

                const isSelected = highlightedIndex === index;

                return (
                    <WineBottle
                        key={wine.id}
                        wine={wine}
                        position={[xPos, yPos, zPos]}
                        isRecommended={isSelected}
                        onClick={onWineClick}
                    />
                );
            })}
        </group>
    );
};
