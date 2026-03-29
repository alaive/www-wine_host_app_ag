import { useMemo, useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Html } from '@react-three/drei';
import { WineCellar } from './WineCellar';
import { WineShelf } from './WineShelf';
import { WineBarrel } from './WineBarrel';
import { Fireplace } from './Fireplace';
import { CozyCorner } from './CozyCorner';
import { TastingTable } from './TastingTable';
import type { Wine } from '../data/wines';
import * as THREE from 'three';

interface ThreeSceneProps {
    cameraFollows?: boolean;
    wines?: Wine[];
}

const CameraHandler = ({
    selectedShelfIndex,
    cameraFollows,
    isResetting,
    resetSnapshot, // { pos: Vector3, target: Vector3 }
    onResetComplete
}: {
    selectedShelfIndex: number,
    cameraFollows: boolean,
    isResetting: boolean,
    resetSnapshot: { pos: THREE.Vector3, target: THREE.Vector3 } | null,
    onResetComplete: () => void
}) => {
    const lastTarget = useRef(new THREE.Vector3(0, 1.6, 0));
    const isInitialized = useRef(false);

    // Refs for smooth reset
    const resetStartTime = useRef<number | null>(null);
    const startPos = useRef(new THREE.Vector3());
    const startTarget = useRef(new THREE.Vector3());

    // Target constants - front view at shelf height
    const initialPos = useMemo(() => new THREE.Vector3(0, 1.6, 6), []);
    const initialTarget = useMemo(() => new THREE.Vector3(0, 1.6, 0), []);

    useFrame(({ camera, controls }) => {
        const orbitControls = controls as unknown as { target: THREE.Vector3, update: () => void, enabled: boolean };
        if (!orbitControls) return;

        // --- Case 1: Active Smoothing Reset (1 second duration) ---
        if (isResetting) {
            if (resetStartTime.current === null) {
                // If we have a snapshot from the moment the button was clicked, use it.
                // Otherwise fall back to current (though it might have snapped).
                if (resetSnapshot) {
                    startPos.current.copy(resetSnapshot.pos);
                    startTarget.current.copy(resetSnapshot.target);
                } else {
                    startPos.current.copy(camera.position);
                    startTarget.current.copy(orbitControls.target);
                }

                console.log("[RESET_FLOW] Start. Dragged From:", startPos.current);
                resetStartTime.current = performance.now();
                orbitControls.enabled = false;
            }

            const elapsed = (performance.now() - resetStartTime.current) / 1000;
            const t = Math.min(elapsed / 1.0, 1.0);

            // Smoother ease-in-out
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            camera.position.lerpVectors(startPos.current, initialPos, ease);
            orbitControls.target.lerpVectors(startTarget.current, initialTarget, ease);
            orbitControls.update();

            if (t >= 1.0) {
                console.log("[RESET_FLOW] Complete.");
                resetStartTime.current = null;
                orbitControls.enabled = true;

                // CRITICAL FIX: Sync lastTarget to avoid jump when following resumes
                lastTarget.current.copy(initialTarget);

                onResetComplete();
            }
            return;
        }

        // --- Case 2: Standard Follow Logic ---
        if (!cameraFollows) {
            lastTarget.current.copy(orbitControls.target);
            return;
        }

        if (!isInitialized.current) {
            lastTarget.current.copy(orbitControls.target);
            isInitialized.current = true;
        }

        const shelfXPositions = [-2.7, 0, 2.7];
        let destX = 0;
        if (selectedShelfIndex >= 0 && selectedShelfIndex < shelfXPositions.length) {
            destX = shelfXPositions[selectedShelfIndex];
        }

        const destTarget = new THREE.Vector3(destX, 1.6, 0);
        const nextTargetVal = lastTarget.current.clone().lerp(destTarget, 0.08);
        const moveDelta = new THREE.Vector3().subVectors(nextTargetVal, lastTarget.current);

        camera.position.add(moveDelta);
        orbitControls.target.copy(nextTargetVal);
        orbitControls.update();

        lastTarget.current.copy(nextTargetVal);
    });
    return null;
};

export const ThreeScene = ({ cameraFollows: initialCameraFollows = true, wines: propWines = [] }: ThreeSceneProps) => {
    // --- State for Navigation ---
    const [selectedShelfIndex, setSelectedShelfIndex] = useState(1);
    const [selectedBottleIndex, setSelectedBottleIndex] = useState(0);
    const [activeWine, setActiveWine] = useState<Wine | null>(null);
    const [isFollowing, setIsFollowing] = useState(initialCameraFollows);
    const [isResetting, setIsResetting] = useState(false);
    const [resetSnapshot, setResetSnapshot] = useState<{ pos: THREE.Vector3, target: THREE.Vector3 } | null>(null);

    // Refs
    const controlsRef = useRef<any>(null);
    const lastTapTime = useRef(0);

    // Camera will be initialized in Canvas onCreated callback

    // --- Data Preparation ---
    const { redWines, whiteWines, roseWines } = useMemo(() => {
        const red = propWines.filter(w => w.type === 'Red');
        const white = propWines.filter(w => w.type === 'White' || w.type === 'Sparkling');
        const rose = propWines.filter(w => w.type === 'Rosé');
        return { redWines: red, whiteWines: white, roseWines: rose };
    }, [propWines]);

    const shelves = useMemo(() => [redWines, whiteWines, roseWines], [redWines, whiteWines, roseWines]);

    // --- Handlers ---
    const handleWineClick = (wine: Wine) => {
        setActiveWine(wine);
    };

    const closePanel = () => {
        setActiveWine(null);
    };

    const resetView = () => {
        console.log("[RESET] resetView triggered.");

        // 1. Capture snapshot immediately to prevent snapping bugs
        if (controlsRef.current) {
            setResetSnapshot({
                pos: controlsRef.current.object.position.clone(),
                target: controlsRef.current.target.clone()
            });
        }

        // 2. Trigger animation state
        setIsResetting(true);
        setActiveWine(null);
        setSelectedShelfIndex(1);
        setSelectedBottleIndex(0);
    };

    const handleResetComplete = () => {
        setIsResetting(false);
        setIsFollowing(true);
        setResetSnapshot(null);
    };

    // --- Keyboard Navigation ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (activeWine || isResetting) return;

            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                setIsFollowing(true);
            }

            const bottlesPerShelf = 4;
            const rowsPerShelf = 4;
            // Calculate current grid position
            const currentRow = Math.floor(selectedBottleIndex / bottlesPerShelf);
            const currentCol = selectedBottleIndex % bottlesPerShelf;

            if (e.key === 'ArrowUp') {
                // Move Up a row
                const nextRow = currentRow + 1;
                if (nextRow < rowsPerShelf) {
                    const nextIndex = nextRow * bottlesPerShelf + currentCol;
                    const currentShelfWines = shelves[selectedShelfIndex];
                    if (nextIndex < currentShelfWines.length) {
                        setSelectedBottleIndex(nextIndex);
                    }
                }
            } else if (e.key === 'ArrowDown') {
                // Move Down a row
                const nextRow = currentRow - 1;
                if (nextRow >= 0) {
                    const nextIndex = nextRow * bottlesPerShelf + currentCol;
                    setSelectedBottleIndex(nextIndex);
                }
            } else if (e.key === 'ArrowRight') {
                // Move Right a column
                const nextCol = currentCol + 1;
                if (nextCol < bottlesPerShelf) {
                    // Valid column in current shelf
                    const nextIndex = currentRow * bottlesPerShelf + nextCol;
                    const currentShelfWines = shelves[selectedShelfIndex];
                    if (nextIndex < currentShelfWines.length) {
                        setSelectedBottleIndex(nextIndex);
                    }
                } else {
                    // Start of next shelf (if exists)
                    if (selectedShelfIndex < 2) {
                        const nextShelfIndex = selectedShelfIndex + 1;
                        const nextShelfWines = shelves[nextShelfIndex];
                        // Try to maintain row level, or clamp to available
                        let targetIndex = currentRow * bottlesPerShelf; // Start of row 0 on new shelf? Or same row?
                        // User said "jump to the next shelf". 
                        // Usually implies continuity: End of Row -> Start of Next Row.
                        // But here shelves are side-by-side. So Row 0/Col 3 -> Row 0/Col 0 (Next Shelf).
                        // Let's try to keep the row.
                        targetIndex = currentRow * bottlesPerShelf + 0;

                        if (targetIndex < nextShelfWines.length) {
                            setSelectedShelfIndex(nextShelfIndex);
                            setSelectedBottleIndex(targetIndex);
                        } else if (nextShelfWines.length > 0) {
                            // If row doesn't exist, fallback to last available bottle? or 0?
                            setSelectedShelfIndex(nextShelfIndex);
                            setSelectedBottleIndex(Math.min(targetIndex, nextShelfWines.length - 1));
                        }
                    }
                }
            } else if (e.key === 'ArrowLeft') {
                // Move Left a column
                const nextCol = currentCol - 1;
                if (nextCol >= 0) {
                    const nextIndex = currentRow * bottlesPerShelf + nextCol;
                    setSelectedBottleIndex(nextIndex);
                } else {
                    // End of prev shelf (if exists)
                    if (selectedShelfIndex > 0) {
                        const prevShelfIndex = selectedShelfIndex - 1;
                        const prevShelfWines = shelves[prevShelfIndex];
                        // Try to maintain row level
                        const targetIndex = currentRow * bottlesPerShelf + (bottlesPerShelf - 1);

                        if (targetIndex < prevShelfWines.length) {
                            setSelectedShelfIndex(prevShelfIndex);
                            setSelectedBottleIndex(targetIndex);
                        } else if (prevShelfWines.length > 0) {
                            setSelectedShelfIndex(prevShelfIndex);
                            setSelectedBottleIndex(Math.min(targetIndex, prevShelfWines.length - 1));
                        }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedShelfIndex, selectedBottleIndex, shelves, activeWine, isResetting]);

    // --- Double Tap / Double Click Detection ---
    useEffect(() => {
        const handleGesture = (e: Event) => {
            // Ignore if clicking UI elements
            if ((e.target as HTMLElement).closest('button')) return;

            const currentTime = Date.now();
            const tapLength = currentTime - lastTapTime.current;
            console.log(`[GESTURE] ${e.type} detected. Delta: ${tapLength}ms, Last: ${lastTapTime.current}`);

            // Only check delta if we have a previous tap time
            if (lastTapTime.current > 0 && tapLength < 500 && tapLength > 20) {
                console.log("[GESTURE] DOUBLE TRIGGER CONFIRMED via", e.type);
                resetView();
                lastTapTime.current = 0; // Reset to prevent triple-click
            } else {
                lastTapTime.current = currentTime;
            }
        };

        window.addEventListener('pointerup', handleGesture, { capture: true });
        return () => {
            window.removeEventListener('pointerup', handleGesture, { capture: true });
        };
    }, []);

    return (
        <div
            className="three-scene-container"
            style={{
                width: '100%',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 0,
                background: '#120c0a'
            }}
        >
            <Canvas
                key="wine-cellar-main-canvas"
                shadows="soft"
                dpr={[1, 1.5]}
                performance={{ min: 0.5, current: 1, debounce: 200 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: true,
                    powerPreference: "high-performance"
                }}
                onCreated={({ gl, camera }) => {
                    gl.setClearColor('#120c0a');
                    // Set initial camera position - front view at shelf height
                    camera.position.set(0, 1.6, 6);
                    console.log('[INIT] Camera positioned at:', camera.position);
                }}
            >
                <Suspense fallback={<Html center><div style={{ color: 'white' }}>Loading Cellar...</div></Html>}>
                    <PerspectiveCamera makeDefault fov={65} position={[0, 1.6, 6]} />

                    <OrbitControls
                        ref={controlsRef}
                        target={[0, 1.6, 0]}
                        makeDefault
                        maxPolarAngle={Math.PI / 1.5}
                        minPolarAngle={Math.PI / 3}
                        enableZoom={true}
                        minDistance={2}
                        maxDistance={20}
                        enablePan={true}
                        enableRotate={false}
                        mouseButtons={{
                            LEFT: THREE.MOUSE.PAN,
                            MIDDLE: THREE.MOUSE.DOLLY,
                            RIGHT: THREE.MOUSE.ROTATE
                        }}
                        touches={{
                            ONE: THREE.TOUCH.PAN,
                            TWO: THREE.TOUCH.DOLLY_PAN
                        }}
                        onStart={() => {
                            if (isFollowing) {
                                console.log("[CONTROLS] Manual interaction started, disabling follow");
                                setIsFollowing(false);
                            }
                        }}
                        enableDamping={true}
                    />

                    <CameraHandler
                        selectedShelfIndex={selectedShelfIndex}
                        cameraFollows={isFollowing}
                        isResetting={isResetting}
                        resetSnapshot={resetSnapshot}
                        onResetComplete={handleResetComplete}
                    />

                    {/* Lighting */}
                    <ambientLight intensity={1.5} color="#fff0d0" />
                    <pointLight position={[0, 5, 5]} intensity={3.0} color="#ffa552" distance={20} decay={2} />
                    <directionalLight position={[5, 10, 7]} intensity={2.5} castShadow color="#fff5e6" />
                    <pointLight position={[-8, 6, 2]} intensity={2.0} color="#ff9e42" distance={15} />
                    <pointLight position={[8, 6, 2]} intensity={2.0} color="#ff9e42" distance={15} />

                    {/* Environment */}
                    <WineCellar />

                    {/* Shelves */}
                    {/* Left: Red Wines */}
                    <WineShelf
                        position={[-2.7, 0, 0]}
                        width={2.2} height={3} depth={0.5}
                        wines={redWines}
                        label="Red Wines"
                        highlightedIndex={selectedShelfIndex === 0 ? selectedBottleIndex : -1}
                        onWineClick={handleWineClick}
                    />

                    {/* Center: White Wines */}
                    <WineShelf
                        position={[0, 0, 0]}
                        width={2.2} height={3} depth={0.5}
                        wines={whiteWines}
                        label="White Wines"
                        highlightedIndex={selectedShelfIndex === 1 ? selectedBottleIndex : -1}
                        onWineClick={handleWineClick}
                    />

                    {/* Right: Rose Wines */}
                    <WineShelf
                        position={[2.7, 0, 0]}
                        width={2.2} height={3} depth={0.5}
                        wines={roseWines}
                        label="Rosé Wines"
                        highlightedIndex={selectedShelfIndex === 2 ? selectedBottleIndex : -1}
                        onWineClick={handleWineClick}
                    />

                    {/* Barrels */}
                    <group position={[-7, 0, 1]} rotation={[0, 0.5, 0]}>
                        <WineBarrel position={[0, 0, 0]} scale={1.2} />
                        <WineBarrel position={[1.2, 0, 0]} scale={1.2} />
                        <WineBarrel position={[0.6, 1.5, 0]} scale={1.2} />
                    </group>

                    {/* Replace right barrels with Fireplace */}
                    <Fireplace position={[6.0, 0, 0.5]} />

                    {/* Tasting Table */}
                    <TastingTable 
                        position={[-5, 0, 3.5]} 
                        wines={propWines
                            .filter(w => (w.isWinner ?? 0) >= 1)
                            .sort((a, b) => (b.isWinner ?? 0) - (a.isWinner ?? 0))
                        } 
                        onWineClick={handleWineClick} 
                    />

                    {/* Cozy Reading Corner */}
                    <CozyCorner position={[9.5, 0, 0]} rotation={[0, 0, 0]} />

                    <fog attach="fog" args={['#120c0a', 5, 25]} />
                </Suspense>
            </Canvas>

            {/* Global Wine Panel Overlay */}
            {activeWine && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(20, 10, 8, 0.95)',
                    backdropFilter: 'blur(12px)',
                    padding: '32px',
                    borderRadius: '16px',
                    border: '2px solid rgba(212, 175, 55, 0.6)',
                    color: '#f5f5dc',
                    width: '90%',
                    maxWidth: '560px',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 24px 96px rgba(0,0,0,0.9)',
                    zIndex: 2000,
                    display: 'flex',
                    gap: '24px',
                    alignItems: 'stretch'
                }}>
                    <button
                        onClick={closePanel}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'transparent',
                            border: 'none',
                            color: '#d4af37',
                            fontSize: '24px',
                            cursor: 'pointer'
                        }}
                    >×</button>

                    {/* Bottle Image */}
                    <div style={{
                        flexShrink: 0,
                        width: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(212,175,55,0.2)',
                        overflow: 'hidden',
                        padding: '12px'
                    }}>
                        <img
                            src={activeWine.imageUrl}
                            alt={activeWine.name}
                            style={{
                                width: '100%',
                                height: '180px',
                                objectFit: 'contain',
                                display: 'block'
                            }}
                        />
                    </div>

                    {/* Wine Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#d4af37', fontWeight: 600, paddingRight: '32px' }}>{activeWine.name}</h3>
                        <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                            {activeWine.winery} • {activeWine.year} • {activeWine.region}
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '16px', fontStyle: 'italic', opacity: 0.85 }}>
                            "{activeWine.description}"
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                            {Object.entries(activeWine.features).map(([key, value]) => (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8, width: '72px', letterSpacing: '0.5px', fontWeight: 500 }}>{key}</span>
                                    <div style={{ flex: 1, height: '7px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                        <div style={{ width: `${(value as number) * 10}%`, height: '100%', background: '#d4af37', borderRadius: '4px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '20px', fontSize: '20px', color: '#d4af37', textAlign: 'right', fontWeight: 'bold' }}>
                            ${activeWine.price}
                        </div>
                    </div>
                </div>
            )}

            {/* Click overlay to close if outside */}
            {activeWine && (
                <div
                    onClick={closePanel}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 1999
                    }}
                />
            )}


            {/* UI Tip for Navigation */}
            {isFollowing && !activeWine && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    zIndex: 10
                }}>
                    Use Arrow Keys or Drag to Navigate • Click Bottle for Details
                </div>
            )}
        </div>
    );
};
