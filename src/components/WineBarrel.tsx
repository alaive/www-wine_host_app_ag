import { Cylinder, Torus } from '@react-three/drei';

interface WineBarrelProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
}

export const WineBarrel = ({ position, rotation = [0, 0, 0], scale = 1 }: WineBarrelProps) => {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Barrel Body - Simplified single cylinder */}
            <Cylinder args={[0.6, 0.5, 1.4, 8]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#5d4037" roughness={0.8} />
            </Cylinder>

            {/* Top Lid */}
            <Cylinder args={[0.5, 0.5, 0.05, 8]} position={[0, 0.7, 0]}>
                <meshStandardMaterial color="#3e2723" roughness={0.9} />
            </Cylinder>

            {/* Metal Bands - Reduced complexity */}
            <Torus args={[0.55, 0.02, 8, 16]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.4, 0]}>
                <meshStandardMaterial color="#212121" metalness={0.8} roughness={0.2} />
            </Torus>
            <Torus args={[0.55, 0.02, 8, 16]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
                <meshStandardMaterial color="#212121" metalness={0.8} roughness={0.2} />
            </Torus>
        </group>
    );
};
