import { useMemo } from 'react';
import * as THREE from 'three';

interface WineBarrelProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
}

export const WineBarrel = ({ position, rotation = [0, 0, 0], scale = 1 }: WineBarrelProps) => {
    // Optimization: Memoize and reuse geometries/materials
    const materials = useMemo(() => ({
        body: new THREE.MeshStandardMaterial({ color: "#5d4037", roughness: 0.8 }),
        lid: new THREE.MeshStandardMaterial({ color: "#3e2723", roughness: 0.9 }),
        band: new THREE.MeshStandardMaterial({ color: "#212121", metalness: 0.8, roughness: 0.2 })
    }), []);

    const geometries = useMemo(() => ({
        body: new THREE.CylinderGeometry(0.6, 0.5, 1.4, 8),
        lid: new THREE.CylinderGeometry(0.5, 0.5, 0.05, 8),
        band: new THREE.TorusGeometry(0.55, 0.02, 8, 16)
    }), []);

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Barrel Body */}
            <mesh geometry={geometries.body} material={materials.body} position={[0, 0, 0]} />

            {/* Top Lid */}
            <mesh geometry={geometries.lid} material={materials.lid} position={[0, 0.7, 0]} />

            {/* Metal Bands */}
            <mesh geometry={geometries.band} material={materials.band} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.4, 0]} />
            <mesh geometry={geometries.band} material={materials.band} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} />
        </group>
    );
};
