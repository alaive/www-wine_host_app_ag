import { useMemo } from 'react';
import { Box, Cylinder, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export const CozyCorner = ({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number] }) => {

    // Procedural Books Color Palette
    const bookColors = useMemo(() => [
        '#3b2d26', // Dark Brown
        '#631818', // Deep Red
        '#1c2e4a', // Navy Blue
        '#233823', // Dark Green
        '#4a3c31', // Lighter Brown
    ], []);

    // Generate random books
    const books = useMemo(() => {
        const items = [];
        const shelves = 5;
        const width = 1.8;
        for (let s = 0; s < shelves; s++) {
            let currentX = -width / 2 + 0.1;
            while (currentX < width / 2 - 0.1) {
                const thickness = 0.03 + Math.random() * 0.05;
                const height = 0.2 + Math.random() * 0.08;
                const depth = 0.18 + Math.random() * 0.04;
                const color = bookColors[Math.floor(Math.random() * bookColors.length)];

                // Random tilt
                const tilt = Math.random() > 0.8 ? (Math.random() - 0.5) * 0.2 : 0;

                if (currentX + thickness > width / 2 - 0.1) break;

                items.push({
                    position: [currentX + thickness / 2, s * 0.45 + 0.02 + height / 2, 0] as [number, number, number],
                    args: [thickness, height, depth] as [number, number, number],
                    color,
                    rotation: [0, 0, tilt] as [number, number, number]
                });
                currentX += thickness + 0.005; // tiny gap
            }
        }
        return items;
    }, [bookColors]);

    return (
        <group position={position} rotation={rotation}>

            {/* BOOKSHELF */}
            <group position={[0, 0, 0]}>
                {/* Back Panel */}
                <Box args={[2, 2.5, 0.05]} position={[0, 1.25, -0.15]}>
                    <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
                </Box>
                {/* Side Panels */}
                <Box args={[0.1, 2.5, 0.3]} position={[-0.95, 1.25, 0]}>
                    <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
                </Box>
                <Box args={[0.1, 2.5, 0.3]} position={[0.95, 1.25, 0]}>
                    <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
                </Box>
                {/* Top/Bottom */}
                <Box args={[2, 0.1, 0.3]} position={[0, 0.05, 0]}>
                    <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
                </Box>
                <Box args={[2, 0.1, 0.35]} position={[0, 2.5, 0]}>
                    <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
                </Box>
                {/* Shelves */}
                {[0.5, 0.95, 1.4, 1.85].map((y, i) => (
                    <Box key={i} args={[1.8, 0.05, 0.28]} position={[0, y, 0]}>
                        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
                    </Box>
                ))}

                {/* Books */}
                {books.map((book, i) => (
                    // @ts-ignore
                    <Box key={i} args={book.args} position={book.position} rotation={book.rotation}>
                        <meshStandardMaterial color={book.color} roughness={0.6} />
                    </Box>
                ))}
            </group>

            {/* READING CHAIR (Faced towards front-left) */}
            <group position={[-0.8, 0, 1.5]} rotation={[0, -0.5, 0]}>
                {/* Legs */}
                <Cylinder args={[0.04, 0.03, 0.4]} position={[-0.3, 0.2, 0.3]}>
                    <meshStandardMaterial color="#2d1e16" />
                </Cylinder>
                <Cylinder args={[0.04, 0.03, 0.4]} position={[0.3, 0.2, 0.3]}>
                    <meshStandardMaterial color="#2d1e16" />
                </Cylinder>
                <Cylinder args={[0.04, 0.03, 0.4]} position={[-0.3, 0.2, -0.3]} rotation={[0.2, 0, 0]}>
                    <meshStandardMaterial color="#2d1e16" /> {/* Slight recline for back legs */}
                </Cylinder>
                <Cylinder args={[0.04, 0.03, 0.4]} position={[0.3, 0.2, -0.3]} rotation={[0.2, 0, 0]}>
                    <meshStandardMaterial color="#2d1e16" />
                </Cylinder>

                {/* Seat Cushion (Bordeaux Silk) */}
                <RoundedBox args={[0.7, 0.15, 0.7]} radius={0.05} smoothness={4} position={[0, 0.45, 0]}>
                    <meshStandardMaterial color="#5e001f" roughness={0.5} metalness={0.1} />
                </RoundedBox>

                {/* Backrest */}
                <RoundedBox args={[0.7, 0.8, 0.15]} radius={0.05} smoothness={4} position={[0, 0.8, -0.3]} rotation={[-0.15, 0, 0]}>
                    <meshStandardMaterial color="#5e001f" roughness={0.5} metalness={0.1} />
                </RoundedBox>

                {/* Armrests */}
                <RoundedBox args={[0.1, 0.2, 0.6]} radius={0.02} smoothness={4} position={[-0.35, 0.6, 0]}>
                    <meshStandardMaterial color="#5e001f" roughness={0.5} metalness={0.1} />
                </RoundedBox>
                <RoundedBox args={[0.1, 0.2, 0.6]} radius={0.02} smoothness={4} position={[0.35, 0.6, 0]}>
                    <meshStandardMaterial color="#5e001f" roughness={0.5} metalness={0.1} />
                </RoundedBox>
            </group>

            {/* SIDE TABLE */}
            <group position={[0.6, 0, 1.4]} rotation={[0, 0, 0]}>
                {/* Legs */}
                <Cylinder args={[0.03, 0.02, 0.6]} position={[0, 0.3, 0]}>
                    <meshStandardMaterial color="#3d2b1f" />
                </Cylinder>
                <Cylinder args={[0.2, 0.2, 0.05]} position={[0, 0.025, 0]}> {/* Base */}
                    <meshStandardMaterial color="#3d2b1f" />
                </Cylinder>
                {/* Tabletop */}
                <Cylinder args={[0.3, 0.3, 0.05]} position={[0, 0.6, 0]}>
                    <meshStandardMaterial color="#4a3525" roughness={0.4} />
                </Cylinder>

                {/* GREEN LAMP */}
                <group position={[0.1, 0.62, 0]}>
                    {/* Base */}
                    <Cylinder args={[0.06, 0.08, 0.02]} position={[0, 0.01, 0]}>
                        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
                    </Cylinder>
                    {/* Stand */}
                    <Cylinder args={[0.01, 0.01, 0.3]} position={[0, 0.15, 0]}>
                        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
                    </Cylinder>
                    {/* Shade */}
                    <Cylinder args={[0.06, 0.12, 0.12]} position={[0, 0.32, 0]}>
                        <meshStandardMaterial color="#004d25" transparent opacity={0.9} roughness={0.1} side={THREE.DoubleSide} />
                    </Cylinder>
                    {/* Light Bulb Glow (Internal) */}
                    <pointLight position={[0, 0.28, 0]} intensity={1.5} color="#ffebba" distance={1.5} decay={2} />
                </group>

                {/* RED WINE GLASS */}
                <group position={[-0.1, 0.625, 0.1]} scale={0.6}>
                    {/* Glass Shape (Cylinder simulation) */}
                    <Cylinder args={[0.05, 0.005, 0.15, 16]} position={[0, 0.15, 0]}>
                        <meshPhysicalMaterial
                            transmission={1}
                            opacity={0.3}
                            metalness={0}
                            roughness={0}
                            color="#ffffff"
                            transparent
                        />
                    </Cylinder>
                    <Cylinder args={[0.005, 0.04, 0.01, 16]} position={[0, 0.005, 0]}>
                        <meshPhysicalMaterial
                            transmission={1}
                            opacity={0.3}
                            metalness={0}
                            roughness={0}
                            color="#ffffff"
                            transparent
                        />
                    </Cylinder>
                    <Cylinder args={[0.005, 0.005, 0.08, 16]} position={[0, 0.05, 0]}>
                        <meshPhysicalMaterial
                            transmission={1}
                            opacity={0.3}
                            metalness={0}
                            roughness={0}
                            color="#ffffff"
                            transparent
                        />
                    </Cylinder>

                    {/* Wine Liquid inside */}
                    <Cylinder args={[0.04, 0.01, 0.08, 16]} position={[0, 0.14, 0]}>
                        <meshStandardMaterial color="#580000" transparent opacity={0.8} roughness={0.1} />
                    </Cylinder>
                </group>
            </group>

        </group>
    );
};
