import { Box, Cylinder } from '@react-three/drei';
import { WineBottle } from './WineBottle';
import type { Wine } from '../data/wines';

interface TastingTableProps {
    position: [number, number, number];
    wines: Wine[];
    onWineClick?: (wine: Wine) => void;
}

export const TastingTable = ({ position, wines, onWineClick }: TastingTableProps) => {
    const tableHeight = 0.9;
    const topThickness = 0.08;
    const tableLength = 1.8;
    
    // Calculate positions for the bottles to be centered on the table
    const bottleSpacing = 0.35;
    const renderWines = wines.slice(0, 5); // Limit to 5 bottles for visual fit
    const totalWidth = (renderWines.length - 1) * bottleSpacing;
    const startX = -totalWidth / 2;

    return (
        <group position={position}>
            {/* Table Top */}
            <Box args={[tableLength, topThickness, 1.0]} position={[0, tableHeight, 0]}>
                <meshStandardMaterial color="#4e342e" roughness={0.6} metalness={0.1} />
            </Box>

            {/* Table Legs */}
            <Cylinder args={[0.06, 0.04, tableHeight, 8]} position={[-0.75, tableHeight / 2, -0.35]}>
                <meshStandardMaterial color="#3e2723" roughness={0.8} />
            </Cylinder>
            <Cylinder args={[0.06, 0.04, tableHeight, 8]} position={[0.75, tableHeight / 2, -0.35]}>
                <meshStandardMaterial color="#3e2723" roughness={0.8} />
            </Cylinder>
            <Cylinder args={[0.06, 0.04, tableHeight, 8]} position={[-0.75, tableHeight / 2, 0.35]}>
                <meshStandardMaterial color="#3e2723" roughness={0.8} />
            </Cylinder>
            <Cylinder args={[0.06, 0.04, tableHeight, 8]} position={[0.75, tableHeight / 2, 0.35]}>
                <meshStandardMaterial color="#3e2723" roughness={0.8} />
            </Cylinder>

            {/* Winner Bottles on Table */}
            {renderWines.map((wine, index) => (
                <WineBottle 
                    key={`tasting-table-${wine.id}`}
                    wine={wine} 
                    position={[startX + (index * bottleSpacing), tableHeight + topThickness / 2 + 0.3, 0]} 
                    onClick={onWineClick}
                />
            ))}
        </group>
    );
};
