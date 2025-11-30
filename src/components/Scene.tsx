import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Knot from './Knot';

interface SceneProps {
    xEq: string;
    yEq: string;
    zEq: string;
    thickness: number;
    color: string;
    growth: number;
}

const Scene: React.FC<SceneProps> = (props) => {
    return (
        <div style={{ flex: 1, position: 'relative' }}>
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <color attach="background" args={['#f0f0f0']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Knot {...props} />
                <OrbitControls makeDefault />
                <Environment preset="city" />
                <gridHelper args={[20, 20, 0x000000, 0xcccccc]} />
            </Canvas>
        </div>
    );
};

export default Scene;
