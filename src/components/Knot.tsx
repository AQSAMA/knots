import React, { useMemo } from 'react';
import * as THREE from 'three';
import { generateKnotPoints } from '../utils/math';

interface KnotProps {
    xEq: string;
    yEq: string;
    zEq: string;
    thickness: number;
    color: string;
    growth: number; // 0 to 1
}

const Knot: React.FC<KnotProps> = ({ xEq, yEq, zEq, thickness, color, growth }) => {
    // Generate all points for the full curve
    const fullPoints = useMemo(() => {
        return generateKnotPoints(xEq, yEq, zEq, 200); // 200 segments for smoothness
    }, [xEq, yEq, zEq]);

    // Slice points based on growth
    const visiblePoints = useMemo(() => {
        if (fullPoints.length < 2) return [];
        const count = Math.max(2, Math.floor(fullPoints.length * growth));
        return fullPoints.slice(0, count);
    }, [fullPoints, growth]);

    // Create the curve
    const curve = useMemo(() => {
        if (visiblePoints.length < 2) return null;
        return new THREE.CatmullRomCurve3(visiblePoints, false); // false = not closed by default, unless t=2PI matches t=0
    }, [visiblePoints]);

    if (!curve) return null;

    return (
        <mesh>
            <tubeGeometry args={[curve, 64, thickness, 8, false]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
    );
};

export default Knot;
