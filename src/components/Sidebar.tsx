import React from 'react';

interface SidebarProps {
    xEq: string;
    setXEq: (val: string) => void;
    yEq: string;
    setYEq: (val: string) => void;
    zEq: string;
    setZEq: (val: string) => void;
    thickness: number;
    setThickness: (val: number) => void;
    color: string;
    setColor: (val: string) => void;
    isPlaying: boolean;
    togglePlay: () => void;
    setPreset: (name: 'trefoil' | 'figure8' | 'torus') => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    xEq, setXEq,
    yEq, setYEq,
    zEq, setZEq,
    thickness, setThickness,
    color, setColor,
    isPlaying, togglePlay,
    setPreset
}) => {
    return (
        <div className="neo-box" style={{
            width: '300px',
            height: '100%',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            zIndex: 10,
            overflowY: 'auto'
        }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, textTransform: 'uppercase' }}>Knot Viz</h1>

            {/* Presets */}
            <div className="neo-box" style={{ padding: '10px' }}>
                <h3 style={{ marginTop: 0 }}>Presets</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="neo-button neo-box" onClick={() => setPreset('trefoil')}>Trefoil</button>
                    <button className="neo-button neo-box" onClick={() => setPreset('figure8')}>Figure-8</button>
                    <button className="neo-button neo-box" onClick={() => setPreset('torus')}>Torus</button>
                </div>
            </div>

            {/* Animation */}
            <div className="neo-box" style={{ padding: '10px' }}>
                <h3 style={{ marginTop: 0 }}>Animation</h3>
                <button
                    className="neo-button neo-box"
                    style={{ width: '100%', backgroundColor: isPlaying ? '#ff8888' : 'var(--accent-color)' }}
                    onClick={togglePlay}
                >
                    {isPlaying ? 'Pause' : 'Play Growth'}
                </button>
            </div>

            {/* Equations */}
            <div className="neo-box" style={{ padding: '10px' }}>
                <h3 style={{ marginTop: 0 }}>Equations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <label style={{ fontWeight: 'bold' }}>X(t)</label>
                        <input className="neo-input" value={xEq} onChange={(e) => setXEq(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ fontWeight: 'bold' }}>Y(t)</label>
                        <input className="neo-input" value={yEq} onChange={(e) => setYEq(e.target.value)} />
                    </div>
                    <div>
                        <label style={{ fontWeight: 'bold' }}>Z(t)</label>
                        <input className="neo-input" value={zEq} onChange={(e) => setZEq(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="neo-box" style={{ padding: '10px' }}>
                <h3 style={{ marginTop: 0 }}>Appearance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <label style={{ fontWeight: 'bold' }}>Thickness: {thickness}</label>
                        <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.1"
                            value={thickness}
                            style={{ width: '100%' }}
                            onChange={(e) => setThickness(parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label style={{ fontWeight: 'bold' }}>Color</label>
                        <input
                            type="color"
                            value={color}
                            style={{ width: '100%', height: '40px', border: '2px solid black' }}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
