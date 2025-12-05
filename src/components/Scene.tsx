import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Knot from './Knot';
import FloatingControls from './FloatingControls';

interface SceneProps {
    xEq: string;
    yEq: string;
    zEq: string;
    thickness: number;
    setThickness: (val: number) => void;
    color: string;
    setColor: (val: string) => void;
    growth: number;
    isPlaying: boolean;
    togglePlay: () => void;
    setPreset: (name: 'trefoil' | 'figure8' | 'torus') => void;
    isFullscreen: boolean;
    setIsFullscreen: (val: boolean) => void;
}

const Scene: React.FC<SceneProps> = ({
    xEq, yEq, zEq,
    thickness, setThickness,
    color, setColor,
    growth,
    isPlaying, togglePlay,
    setPreset,
    isFullscreen, setIsFullscreen
}) => {
    return (
        <div className={`canvas-container ${isFullscreen ? 'fullscreen' : 'square'}`}>
            <div className="canvas-wrapper">
                <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                    <color attach="background" args={['#f0f0f0']} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Knot
                        xEq={xEq}
                        yEq={yEq}
                        zEq={zEq}
                        thickness={thickness}
                        color={color}
                        growth={growth}
                    />
                    <OrbitControls makeDefault />
                    <Environment preset="city" />
                    <gridHelper args={[20, 20, 0x000000, 0xcccccc]} />
                </Canvas>
            </div>

            {/* Expand/Collapse button at bottom */}
            <button
                className="fullscreen-toggle-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
            >
                {isFullscreen ? (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                        </svg>
                        <span>Exit Fullscreen</span>
                    </>
                ) : (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                        </svg>
                        <span>Expand</span>
                    </>
                )}
            </button>

            {/* Floating controls in fullscreen mode */}
            {isFullscreen && (
                <FloatingControls
                    thickness={thickness}
                    setThickness={setThickness}
                    color={color}
                    setColor={setColor}
                    isPlaying={isPlaying}
                    togglePlay={togglePlay}
                    setPreset={setPreset}
                />
            )}
        </div>
    );
};

export default Scene;
