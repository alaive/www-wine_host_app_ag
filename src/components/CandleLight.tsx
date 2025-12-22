import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CandleLightProps {
    position: [number, number, number];
}

export const CandleLight = ({ position }: CandleLightProps) => {
    const lightRef = useRef<THREE.PointLight>(null);
    const flameRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (lightRef.current) {
            // Flickering effect
            lightRef.current.intensity = 0.5 + Math.random() * 0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
        }
        if (flameRef.current) {
            flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.2;
        }
    });

    return (
        <group position={position}>
            {/* Candle Base */}
            <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
                <meshStandardMaterial color="#f5f5dc" />
            </mesh>

            {/* Flame */}
            <mesh ref={flameRef} position={[0, 0.12, 0]}>
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshBasicMaterial color="#ffae00" />
            </mesh>

            {/* Light Source */}
            <pointLight
                ref={lightRef}
                color="#ff8c00"
                intensity={0.8}
                distance={5}
                decay={2}
                castShadow
            />
        </group>
    );
};
