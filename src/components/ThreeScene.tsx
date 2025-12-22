import { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Html } from '@react-three/drei';
import { WineCellar } from './WineCellar';
import { WineShelf } from './WineShelf';
import { WineBarrel } from './WineBarrel';
import { AvatarGuide } from './AvatarGuide';
import { wines as allWines } from '../data/wines';
import { sortWinesForShelf } from '../utils/sorting';
import * as THREE from 'three';

interface ThreeSceneProps {
    recommendedWineId?: string;
    manualControl?: boolean;
    cameraFollows?: boolean;
}

const CameraHandler = ({ avatarRef, controlsRef, cameraFollows, winePosition }: {
    avatarRef: React.RefObject<THREE.Group | null>,
    controlsRef: React.RefObject<{ target: THREE.Vector3, update: () => void } | null>,
    cameraFollows: boolean,
    winePosition: [number, number, number] | null
}) => {
    useFrame(({ camera }) => {
        if (winePosition && controlsRef.current) {
            // Zoom to wine position - position camera in front of the wine
            const winePos = new THREE.Vector3(...winePosition);
            const cameraTargetPos = new THREE.Vector3(
                winePos.x,
                winePos.y + 0.3, // Slightly above wine
                winePos.z + 1.5  // 1.5m in front of wine
            );

            // Smooth camera movement
            camera.position.lerp(cameraTargetPos, 0.05);

            // Look at the wine
            const lookAtTarget = new THREE.Vector3(winePos.x, winePos.y + 0.2, winePos.z);
            controlsRef.current.target.lerp(lookAtTarget, 0.05);
            controlsRef.current.update();
        } else if (avatarRef.current && controlsRef.current && cameraFollows) {
            const avatarPos = avatarRef.current.position;

            // Target the camera to look slightly above the avatar
            const target = new THREE.Vector3(avatarPos.x, avatarPos.y + 1.2, avatarPos.z);

            // Smoothly move controls target
            controlsRef.current.target.lerp(target, 0.05);
            controlsRef.current.update();
        }
    });
    return null;
};

export const ThreeScene = ({ recommendedWineId, manualControl, cameraFollows = true }: ThreeSceneProps) => {
    const avatarRef = useRef<THREE.Group>(null);
    const controlsRef = useRef<{ target: THREE.Vector3, update: () => void } | null>(null);

    // 1. Sort and Split Wines into 4 groups for 4 shelves - 4 wines per level
    const { shelf1Wines, shelf2Wines, shelf3Wines, shelf4Wines } = useMemo(() => {
        const sorted = sortWinesForShelf(allWines);

        // We need 20 wines per shelf (4 per level × 5 levels)
        // If we don't have enough wines, duplicate them
        const winesNeededPerShelf = 20;
        const duplicateWines = (wines: typeof sorted, count: number) => {
            const result = [];
            for (let i = 0; i < count; i++) {
                result.push(wines[i % wines.length]);
            }
            return result;
        };

        return {
            shelf1Wines: duplicateWines(sorted, winesNeededPerShelf),
            shelf2Wines: duplicateWines(sorted, winesNeededPerShelf),
            shelf3Wines: duplicateWines(sorted, winesNeededPerShelf),
            shelf4Wines: duplicateWines(sorted, winesNeededPerShelf)
        };
    }, []);

    // 2. Calculate Avatar Target Position
    const avatarTarget = useMemo(() => {
        if (!recommendedWineId) return null;

        const shelfWidth = 1.5;
        const shelfHeight = 3;
        const bottlesPerShelf = Math.floor((shelfWidth - 0.2) / 0.15);
        const shelfCount = 5;
        const spacing = shelfHeight / shelfCount;
        const shelfThickness = 0.05;

        const findWinePos = (wines: any[], shelfPos: [number, number, number], shelfRotY: number) => {
            const index = wines.findIndex(w => w.id === recommendedWineId);
            if (index === -1) return null;

            const shelfIndex = Math.floor(index / bottlesPerShelf) % shelfCount;
            const slotIndex = index % bottlesPerShelf;
            const startX = -shelfWidth / 2 + 0.15;
            const xLocal = startX + slotIndex * 0.15;
            const yLocal = (shelfIndex * spacing) + (shelfThickness / 2);

            const shelfPosition = new THREE.Vector3(...shelfPos);
            const bottleLocalPos = new THREE.Vector3(xLocal, yLocal, 0);
            const rotation = new THREE.Euler(0, shelfRotY, 0);
            bottleLocalPos.applyEuler(rotation);
            const bottleWorldPos = shelfPosition.clone().add(bottleLocalPos);
            const frontVec = new THREE.Vector3(0, 0, 0.8);
            frontVec.applyEuler(rotation);

            return bottleWorldPos.add(frontVec);
        };

        // Check each of the 4 shelves
        const t1 = findWinePos(shelf1Wines, [-5.2, 0, -10], Math.PI / 2);
        if (t1) return [t1.x, 0, t1.z] as [number, number, number];

        const t2 = findWinePos(shelf2Wines, [-5.2, 0, 10], Math.PI / 2);
        if (t2) return [t2.x, 0, t2.z] as [number, number, number];

        const t3 = findWinePos(shelf3Wines, [5.2, 0, -10], -Math.PI / 2);
        if (t3) return [t3.x, 0, t3.z] as [number, number, number];

        const t4 = findWinePos(shelf4Wines, [5.2, 0, 10], -Math.PI / 2);
        if (t4) return [t4.x, 0, t4.z] as [number, number, number];

        return null;
    }, [recommendedWineId, shelf1Wines, shelf2Wines, shelf3Wines, shelf4Wines]);

    // Calculate wine world position for camera zoom
    const wineWorldPosition = useMemo(() => {
        if (!recommendedWineId) return null;

        const shelfWidth = 1.5;
        const shelfHeight = 3;
        const bottlesPerShelf = Math.floor((shelfWidth - 0.2) / 0.15);
        const shelfCount = 5;
        const spacing = shelfHeight / shelfCount;
        const shelfThickness = 0.05;

        const findWineWorldPos = (wines: any[], shelfPos: [number, number, number], shelfRotY: number) => {
            const index = wines.findIndex(w => w.id === recommendedWineId);
            if (index === -1) return null;

            const shelfIndex = Math.floor(index / bottlesPerShelf) % shelfCount;
            const slotIndex = index % bottlesPerShelf;
            const startX = -shelfWidth / 2 + 0.15;
            const xLocal = startX + slotIndex * 0.15;
            const yLocal = (shelfIndex * spacing) + (shelfThickness / 2);

            const shelfPosition = new THREE.Vector3(...shelfPos);
            const bottleLocalPos = new THREE.Vector3(xLocal, yLocal, 0);
            const rotation = new THREE.Euler(0, shelfRotY, 0);
            bottleLocalPos.applyEuler(rotation);
            const bottleWorldPos = shelfPosition.clone().add(bottleLocalPos);

            return bottleWorldPos;
        };

        // Check each of the 4 shelves for wine position
        const w1 = findWineWorldPos(shelf1Wines, [-5.2, 0, -10], Math.PI / 2);
        if (w1) return [w1.x, w1.y, w1.z] as [number, number, number];

        const w2 = findWineWorldPos(shelf2Wines, [-5.2, 0, 10], Math.PI / 2);
        if (w2) return [w2.x, w2.y, w2.z] as [number, number, number];

        const w3 = findWineWorldPos(shelf3Wines, [5.2, 0, -10], -Math.PI / 2);
        if (w3) return [w3.x, w3.y, w3.z] as [number, number, number];

        const w4 = findWineWorldPos(shelf4Wines, [5.2, 0, 10], -Math.PI / 2);
        if (w4) return [w4.x, w4.y, w4.z] as [number, number, number];

        return null;
    }, [recommendedWineId, shelf1Wines, shelf2Wines, shelf3Wines, shelf4Wines]);

    return (
        <div className="three-scene-container" style={{
            width: '100%',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 0,
            background: '#120c0a'
        }}>
            <Canvas
                key="wine-cellar-main-canvas"
                shadows
                gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#120c0a');
                }}
            >
                <Suspense fallback={<Html center><div style={{ color: 'white' }}>Loading Cellar...</div></Html>}>
                    <PerspectiveCamera makeDefault fov={60} position={[0, 1.8, 6]} />

                    <OrbitControls
                        ref={controlsRef}
                        target={[0, 1.2, 0]}
                        maxPolarAngle={Math.PI / 1.5}
                        minPolarAngle={Math.PI / 3}
                        enableZoom={true}
                        enablePan={true}
                    />

                    {/* Camera Handler inside Canvas */}
                    <CameraHandler avatarRef={avatarRef} controlsRef={controlsRef} cameraFollows={cameraFollows} winePosition={wineWorldPosition} />

                    {/* Potent Global Lighting */}
                    <ambientLight intensity={1.0} />
                    <pointLight position={[0, 5, 2]} intensity={1.5} color="#ffffff" />
                    <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />


                    <WineCellar />

                    {/* Stacked Wine Barrels at the end */}
                    <group position={[0, 0, -47]}>
                        {/* Bottom Row */}
                        <WineBarrel position={[-2.2, 0, 0]} scale={1.1} />
                        <WineBarrel position={[0, 0, 0]} scale={1.1} />
                        <WineBarrel position={[2.2, 0, 0]} scale={1.1} />
                        <WineBarrel position={[-4.2, 0, 1]} rotation={[0, 0.3, 0]} />
                        <WineBarrel position={[4.2, 0, 1]} rotation={[0, -0.3, 0]} />

                        {/* Middle Row stacked on top */}
                        <WineBarrel position={[-1.1, 1.8, 0.5]} />
                        <WineBarrel position={[1.1, 1.8, 0.5]} />

                        {/* Top Barrel */}
                        <WineBarrel position={[0, 3.6, 1]} scale={0.9} />
                    </group>

                    {/* Stacked Wine Barrels at the FRONT end */}
                    <group position={[0, 0, 47]}>
                        {/* Bottom Row */}
                        <WineBarrel position={[-2.2, 0, 0]} scale={1.1} />
                        <WineBarrel position={[0, 0, 0]} scale={1.1} />
                        <WineBarrel position={[2.2, 0, 0]} scale={1.1} />
                        <WineBarrel position={[-4.2, 0, -1]} rotation={[0, -0.3, 0]} />
                        <WineBarrel position={[4.2, 0, -1]} rotation={[0, 0.3, 0]} />

                        {/* Middle Row stacked on top */}
                        <WineBarrel position={[-1.1, 1.8, -0.5]} />
                        <WineBarrel position={[1.1, 1.8, -0.5]} />

                        {/* Top Barrel */}
                        <WineBarrel position={[0, 3.6, -1]} scale={0.9} />
                    </group>

                    {/* Host Avatar - Walks to recommendation */}
                    <AvatarGuide ref={avatarRef} position={[0, 0.01, 0]} targetPosition={avatarTarget} manualControl={manualControl} />

                    {/* Shelves lining the lateral walls */}
                    <WineShelf
                        position={[-5.2, 0, -10]}
                        rotation={[0, Math.PI / 2, 0]}
                        width={1.5} height={3} depth={0.6}
                        wines={shelf1Wines}
                        recommendedWineId={recommendedWineId}
                    />
                    <WineShelf
                        position={[-5.2, 0, 10]}
                        rotation={[0, Math.PI / 2, 0]}
                        width={1.5} height={3} depth={0.6}
                        wines={shelf2Wines}
                        recommendedWineId={recommendedWineId}
                    />
                    <WineShelf
                        position={[5.2, 0, -10]}
                        rotation={[0, -Math.PI / 2, 0]}
                        width={1.5} height={3} depth={0.6}
                        wines={shelf3Wines}
                        recommendedWineId={recommendedWineId}
                    />
                    <WineShelf
                        position={[5.2, 0, 10]}
                        rotation={[0, -Math.PI / 2, 0]}
                        width={1.5} height={3} depth={0.6}
                        wines={shelf4Wines}
                        recommendedWineId={recommendedWineId}
                    />

                    {/* Far fog to avoid cutting off walls */}
                    <fog attach="fog" args={['#120c0a', 10, 60]} />
                </Suspense>
            </Canvas>
        </div>
    );
};
