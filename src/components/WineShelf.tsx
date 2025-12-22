import { Box, useTexture } from '@react-three/drei';
import { WineBottle } from './WineBottle';
import { CandleLight } from './CandleLight';
import type { Wine } from '../data/wines';
import * as THREE from 'three';
import { useEffect } from 'react';

interface WineShelfProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    width: number;
    height: number;
    depth: number;
    wines?: Wine[];
    recommendedWineId?: string;
}

export const WineShelf = ({
    position,
    rotation = [0, 0, 0],
    width,
    height,
    depth,
    wines = [],
    recommendedWineId,
}: WineShelfProps) => {
    const shelfCount = 5;
    const spacing = height / shelfCount;
    const shelfThickness = 0.05;

    const woodTexture = useTexture('/images/textures/wood_diffuse.png');
    useEffect(() => {
        // Configure texture
        // eslint-disable-next-line
        woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(1, 1);
        woodTexture.needsUpdate = true;
    }, [woodTexture]);

    // Max bottles per shelf based on width
    const bottlesPerShelf = Math.floor((width - 0.2) / 0.15);

    // Distribute wines across shelves
    // We just iterate linearly through sorted wines

    return (
        <group position={position} rotation={rotation}>
            {/* Shelves Structure */}
            {Array.from({ length: shelfCount }).map((_, i) => (
                <group key={`shelf-${i}`} position={[0, i * spacing, 0]}>
                    <Box args={[width, shelfThickness, depth]} position={[0, 0, 0]}>
                        <meshStandardMaterial map={woodTexture} roughness={0.7} color="#5c4033" />
                    </Box>
                    {/* Add Candles to the top shelf */}
                    {i === shelfCount - 1 && (
                        <>
                            <group position={[-width / 3, 0.1, 0]}>
                                <CandleLight position={[0, 0, 0]} />
                            </group>
                            <group position={[width / 3, 0.1, 0]}>
                                <CandleLight position={[0, 0, 0]} />
                            </group>
                        </>
                    )}
                </group>
            ))}

            {/* Vertical Supports */}
            <Box args={[0.05, height, depth]} position={[-width / 2 + 0.025, height / 2 - spacing / 2, 0]}>
                <meshStandardMaterial map={woodTexture} roughness={0.7} color="#5c4033" />
            </Box>
            <Box args={[0.05, height, depth]} position={[width / 2 - 0.025, height / 2 - spacing / 2, 0]}>
                <meshStandardMaterial map={woodTexture} roughness={0.7} color="#5c4033" />
            </Box>

            {/* Bottles */}
            {wines.map((wine, index) => {
                const shelfIndex = Math.floor(index / bottlesPerShelf) % shelfCount;
                const slotIndex = index % bottlesPerShelf;

                // Calculate position relative to shelf center
                // Start from left (-width/2) + padding
                const startX = -width / 2 + 0.15;
                const xPos = startX + slotIndex * 0.15;
                const yPos = (shelfIndex * spacing) + (shelfThickness / 2);
                const zPos = 0; // Center of shelf depth

                // Calculate World Position approximation for the avatar to know
                // The Shelf group is at `position`, so bottle is at `position` + `localPos`
                // We'll just render it locally here

                return (
                    <WineBottle
                        key={wine.id}
                        wine={wine}
                        position={[xPos, yPos, zPos]}
                        isRecommended={recommendedWineId === wine.id}
                    />
                );
            })}
        </group>
    );
};
