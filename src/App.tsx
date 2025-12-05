import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Scene from './components/Scene';
import ToggleButton from './components/ToggleButton';

const PRESETS = {
    trefoil: {
        x: 'sin(t) + 2 * sin(2*t)',
        y: 'cos(t) - 2 * cos(2*t)',
        z: '-sin(3*t)'
    },
    figure8: {
        x: 'cos(t)',
        y: 'sin(t) * cos(t)',
        z: 'sin(t)'
    },
    torus: {
        x: '(2 + cos(3*t)) * cos(2*t)',
        y: '(2 + cos(3*t)) * sin(2*t)',
        z: 'sin(3*t)'
    }
};

const App: React.FC = () => {
    const [xEq, setXEq] = useState(PRESETS.trefoil.x);
    const [yEq, setYEq] = useState(PRESETS.trefoil.y);
    const [zEq, setZEq] = useState(PRESETS.trefoil.z);
    const [thickness, setThickness] = useState(0.4);
    const [color, setColor] = useState('#88ff88');
    const [growth, setGrowth] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);

    // Mobile states
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const requestRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);

    // Handle window resize for responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const animate = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const progress = (time - startTimeRef.current) / 2000; // 2 seconds duration

        if (progress < 1) {
            setGrowth(progress);
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setGrowth(1);
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            setGrowth(0);
            startTimeRef.current = undefined;
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying]);

    const handlePreset = (name: 'trefoil' | 'figure8' | 'torus') => {
        const p = PRESETS[name];
        setXEq(p.x);
        setYEq(p.y);
        setZEq(p.z);
        setGrowth(1); // Reset growth
        setIsPlaying(false);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <div className={`app-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
            <ToggleButton
                isOpen={sidebarOpen}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            />

            <Sidebar
                xEq={xEq} setXEq={setXEq}
                yEq={yEq} setYEq={setYEq}
                zEq={zEq} setZEq={setZEq}
                thickness={thickness} setThickness={setThickness}
                color={color} setColor={setColor}
                isPlaying={isPlaying} togglePlay={togglePlay}
                setPreset={handlePreset}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <Scene
                xEq={xEq}
                yEq={yEq}
                zEq={zEq}
                thickness={thickness}
                setThickness={setThickness}
                color={color}
                setColor={setColor}
                growth={growth}
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                setPreset={handlePreset}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
            />
        </div>
    );
};

export default App;
