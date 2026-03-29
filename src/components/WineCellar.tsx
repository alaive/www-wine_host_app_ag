import { useEffect } from 'react';
import { Plane, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const WineCellar = () => {
    // Load existing brick texture
    const { brick } = useTexture({
        brick: './images/textures/brick_diffuse.png',
    });

    useEffect(() => {
        // Configure stone/brick texture 
        brick.wrapS = brick.wrapT = THREE.RepeatWrapping;
        brick.repeat.set(10, 5);
        brick.needsUpdate = true;
    }, [brick]);

    return (
        <group>
            {/* Floor: Dark Wood or Stone */}
            <Plane args={[30, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <meshStandardMaterial color="#2d241f" roughness={0.8} />
            </Plane>

            {/* Back Wall: Brick */}
            <Plane args={[30, 20]} position={[0, 4, -1]} receiveShadow>
                <meshStandardMaterial map={brick} roughness={0.9} color="#7d6050" side={THREE.DoubleSide} />
            </Plane>

            {/* Ambient occlusion shadow for where wall meets floor */}
            <Plane args={[30, 2]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -0.9]} receiveShadow>
                <meshBasicMaterial color="black" transparent opacity={0.5} />
            </Plane>
        </group>
    );
};
