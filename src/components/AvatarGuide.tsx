import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarGuideProps {
    position: [number, number, number];
    targetPosition?: [number, number, number] | null;
    manualControl?: boolean;
}

export const AvatarGuide = forwardRef<THREE.Group, AvatarGuideProps>(({ position: initialPosition, targetPosition, manualControl = false }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);

    // Touchpad/Scroll Strafe State
    const strafeVelocity = useRef(0);
    const keysPressed = useRef<{ [key: string]: boolean }>({});

    // Expose internal group ref to parent
    useImperativeHandle(ref, () => groupRef.current!);

    // Keyboard & Wheel Listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keysPressed.current[e.key.toLowerCase()] = true;
            if (e.key === 'ArrowUp') keysPressed.current['w'] = true;
            if (e.key === 'ArrowDown') keysPressed.current['s'] = true;
            if (e.key === 'ArrowLeft') keysPressed.current['a'] = true;
            if (e.key === 'ArrowRight') keysPressed.current['d'] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current[e.key.toLowerCase()] = false;
            if (e.key === 'ArrowUp') keysPressed.current['w'] = false;
            if (e.key === 'ArrowDown') keysPressed.current['s'] = false;
            if (e.key === 'ArrowLeft') keysPressed.current['a'] = false;
            if (e.key === 'ArrowRight') keysPressed.current['d'] = false;
        };

        const handleWheel = (e: WheelEvent) => {
            if (!manualControl) return;
            // Detect horizontal scroll (touchpad lateral swipe)
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                // Determine direction and apply impulse
                // Normalize deltaX mostly to avoid huge jumps, but keep proportionality
                const intensity = Math.min(Math.max(e.deltaX * 0.05, -1), 1);
                strafeVelocity.current += intensity;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('wheel', handleWheel);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [manualControl]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const currentPos = groupRef.current.position;
        let isMoving = false;

        if (manualControl) {
            // Manual Movement Logic
            const speed = 3.0 * delta;
            const rotSpeed = 2.5 * delta;

            if (keysPressed.current['w']) {
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(groupRef.current.quaternion);
                currentPos.add(forward.multiplyScalar(speed));
                isMoving = true;
            }
            if (keysPressed.current['s']) {
                const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(groupRef.current.quaternion);
                currentPos.add(backward.multiplyScalar(speed));
                isMoving = true;
            }
            if (keysPressed.current['a']) {
                groupRef.current.rotation.y += rotSpeed;
                isMoving = true;
            }
            if (keysPressed.current['d']) {
                groupRef.current.rotation.y -= rotSpeed;
                isMoving = true;
            }
            if (keysPressed.current['q']) {
                const left = new THREE.Vector3(-1, 0, 0).applyQuaternion(groupRef.current.quaternion);
                currentPos.add(left.multiplyScalar(speed));
                isMoving = true;
            }
            if (keysPressed.current['e']) {
                const right = new THREE.Vector3(1, 0, 0).applyQuaternion(groupRef.current.quaternion);
                currentPos.add(right.multiplyScalar(speed));
                isMoving = true;
            }

            // Apply Wheel Strafe Velocity (Touchpad)
            if (Math.abs(strafeVelocity.current) > 0.01) {
                const right = new THREE.Vector3(1, 0, 0).applyQuaternion(groupRef.current.quaternion);
                // Invert deltaX typically: scroll right (swipe left) -> pan right? 
                // Usually swipe left (fingers go left) -> content goes right. 
                // Let's stick to natural: Scroll Right (Right on trackpad) -> Move Right.
                currentPos.add(right.multiplyScalar(strafeVelocity.current * speed)); // Apply velocity

                strafeVelocity.current *= 0.9; // Decay
                isMoving = true;
            } else {
                strafeVelocity.current = 0;
            }
        }
        else if (targetPosition) {
            const target = new THREE.Vector3(...targetPosition);
            const dist = currentPos.distanceTo(target);

            if (dist > 0.1) {
                isMoving = true;
                const speed = 2.5 * delta;
                const direction = new THREE.Vector3().subVectors(target, currentPos).normalize();
                currentPos.add(direction.multiplyScalar(speed));

                const lookAtPos = new THREE.Vector3(target.x, currentPos.y, target.z);
                groupRef.current.lookAt(lookAtPos);
            } else {
                const userPos = new THREE.Vector3(0, 1.8, 6);
                groupRef.current.lookAt(userPos);
            }
        }
        else {
            const start = new THREE.Vector3(...initialPosition);
            if (currentPos.distanceTo(start) > 0.1) {
                isMoving = true;
                const speed = 2.0 * delta;
                const direction = new THREE.Vector3().subVectors(start, currentPos).normalize();
                currentPos.add(direction.multiplyScalar(speed));

                const lookAtPos = new THREE.Vector3(start.x, currentPos.y, start.z);
                groupRef.current.lookAt(lookAtPos);
            } else {
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
            }
        }

        // Animation logic
        if (isMoving) {
            const walkCycle = Math.sin(state.clock.elapsedTime * 10);
            if (leftLegRef.current) leftLegRef.current.rotation.x = walkCycle * 0.5;
            if (rightLegRef.current) rightLegRef.current.rotation.x = -walkCycle * 0.5;
            if (leftArmRef.current) leftArmRef.current.rotation.x = -walkCycle * 0.5;
            if (rightArmRef.current) rightArmRef.current.rotation.x = walkCycle * 0.5;

            groupRef.current.position.y = initialPosition[1] + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.05;
        } else {
            const breath = Math.sin(state.clock.elapsedTime * 2);
            groupRef.current.position.y = initialPosition[1] + breath * 0.02;
            if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1);
            if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1);
            if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
            if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);
        }
    });

    return (
        <group ref={groupRef} position={initialPosition}>
            {/* Torso */}
            <Box args={[0.5, 0.8, 0.25]} position={[0, 1.2, 0]}>
                <meshLambertMaterial color="#2d2d2d" />
            </Box>

            {/* Head */}
            <Sphere args={[0.15, 32, 32]} position={[0, 1.75, 0]}>
                <meshLambertMaterial color="#f5cba7" />
            </Sphere>

            {/* Arms */}
            <group ref={leftArmRef} position={[-0.32, 1.55, 0]}>
                <Box args={[0.12, 0.7, 0.12]} position={[0, -0.3, 0]}>
                    <meshLambertMaterial color="#ffffff" />
                </Box>
            </group>

            <group ref={rightArmRef} position={[0.32, 1.55, 0]}>
                <Box args={[0.12, 0.7, 0.12]} position={[0, -0.3, 0]}>
                    <meshLambertMaterial color="#ffffff" />
                </Box>
            </group>

            {/* Legs */}
            <group ref={leftLegRef} position={[-0.15, 0.8, 0]}>
                <Box args={[0.18, 0.8, 0.18]} position={[0, -0.4, 0]}>
                    <meshLambertMaterial color="#1a1a1a" />
                </Box>
            </group>
            <group ref={rightLegRef} position={[-0.15 + 0.3, 0.8, 0]}>
                <Box args={[0.18, 0.8, 0.18]} position={[0, -0.4, 0]}>
                    <meshLambertMaterial color="#1a1a1a" />
                </Box>
            </group>
        </group>
    );
});
