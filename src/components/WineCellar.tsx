import { useMemo, useEffect } from 'react';
import { Box, Plane, Cylinder, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const WineCellar = () => {
    // Load existing brick texture for walls/dome
    const { brick } = useTexture({
        brick: '/images/textures/brick_diffuse.png',
    });

    // "Fake" a red mosaic floor texture procedurally
    const mosaicTexture = useMemo(() => {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        // Base red/terracotta color
        ctx.fillStyle = '#8d3d2a';
        ctx.fillRect(0, 0, size, size);

        // Draw mosaic tiles
        const tileSize = 32;
        const gap = 2;
        for (let y = 0; y < size; y += tileSize) {
            for (let x = 0; x < size; x += tileSize) {
                // Variations in red/orange/brown
                const r = 141 + (Math.random() - 0.5) * 30;
                const g = 61 + (Math.random() - 0.5) * 20;
                const b = 42 + (Math.random() - 0.5) * 15;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x + gap, y + gap, tileSize - gap * 2, tileSize - gap * 2);

                // Subtle highlights
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.fillRect(x + gap, y + gap, 4, 4);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 50); // High repeat for "large mosaic" look
        return texture;
    }, []);

    useEffect(() => {
        // Configure stone/brick texture for the tunnel
        brick.wrapS = brick.wrapT = THREE.RepeatWrapping;
        brick.repeat.set(8, 20); // Balanced repeat for the large tunnel surface
        brick.needsUpdate = true;
    }, [brick]);

    return (
        <group>
            {/* Red Mosaic Floor - Slightly wider than the 6m tunnel radius */}
            <Plane args={[13, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                <meshStandardMaterial map={mosaicTexture} roughness={0.7} metalness={0.1} />
            </Plane>

            {/* The Classical Vault - Semi-circle covers walls and ceiling completely */}
            <group position={[0, 0, 0]}>
                <Cylinder
                    args={[6, 6, 100, 32, 1, true, 0, Math.PI]}
                    rotation={[Math.PI / 2, Math.PI / 2, 0]}
                    position={[0, 0, 0]}
                    receiveShadow
                >
                    <meshStandardMaterial map={brick} side={THREE.DoubleSide} roughness={1} color="#554433" />
                </Cylinder>
            </group>

            {/* Back Wall - Flat Box */}
            <Box args={[14, 12, 1]} position={[0, 3, -50]} receiveShadow castShadow>
                <meshStandardMaterial map={brick} roughness={0.9} color="#443322" />
            </Box>

            {/* Front Wall - Flat Box */}
            <Box args={[14, 12, 1]} position={[0, 3, 50]} receiveShadow castShadow>
                <meshStandardMaterial map={brick} roughness={0.9} color="#443322" />
            </Box>

            {/* Subtle atmospheric lights along the vault curve */}
            <pointLight position={[-5, 4, -25]} intensity={5} color="#ffaa44" distance={30} />
            <pointLight position={[5, 4, 0]} intensity={5} color="#ffaa44" distance={30} />
            <pointLight position={[-5, 4, 25]} intensity={5} color="#ffaa44" distance={30} />

            <ambientLight intensity={0.4} />
        </group>
    );
};
