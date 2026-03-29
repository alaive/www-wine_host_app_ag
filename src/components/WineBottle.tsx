import { useRef, useState } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Wine } from '../data/wines';

interface WineBottleProps {
    wine: Wine;
    position: [number, number, number];
    isRecommended?: boolean;
    onClick?: (wine: Wine) => void;
}

export const WineBottle = ({ wine, position, isRecommended = false, onClick }: WineBottleProps) => {
    const spriteRef = useRef<THREE.Sprite>(null);
    const [hovered, setHovered] = useState(false);

    // Load wine bottle image
    const imagePath = wine.imageUrl.startsWith('/') ? wine.imageUrl : `./${wine.imageUrl}`;
    const bottleTexture = useTexture(imagePath);

    const bottleHeight = 0.6;
    const img = bottleTexture.image as HTMLImageElement;
    const aspectRatio = img && img.width ? img.width / img.height : 0.25;
    const bottleWidth = bottleHeight * aspectRatio;

    // React state-driven offsets for performance (replaces useFrame)
    const active = hovered || isRecommended;
    const s = active ? 1.15 : 1; 
    const yOffset = active ? 0.05 : 0;

    return (
        <sprite
            ref={spriteRef}
            position={[position[0], position[1] + yOffset, position[2]]}
            scale={[bottleWidth * s, bottleHeight * s, 1]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(wine);
            }}
            onPointerEnter={() => document.body.style.cursor = 'pointer'}
            onPointerLeave={() => document.body.style.cursor = 'auto'}
        >
            <spriteMaterial
                map={bottleTexture}
                transparent={true}
                alphaTest={0.5}
                depthWrite={true}
                side={THREE.DoubleSide}
            />
        </sprite>
    );
};
