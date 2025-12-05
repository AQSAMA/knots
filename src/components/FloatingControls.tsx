import React, { useState } from 'react';

interface FloatingControlsProps {
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

const FloatingControls: React.FC<FloatingControlsProps> = ({
    xEq, setXEq,
    yEq, setYEq,
    zEq, setZEq,
    thickness, setThickness,
    color, setColor,
    isPlaying, togglePlay,
    setPreset
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="floating-controls">
            <button
                className="floating-controls-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse controls' : 'Expand controls'}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isExpanded ? (
                        <>
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="6" y1="18" x2="18" y2="6" />
                        </>
                    ) : (
                        <>
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                        </>
                    )}
                </svg>
            </button>

            {isExpanded && (
                <div className="floating-controls-panel neo-box">
                    {/* Header */}
                    <div className="panel-header">
                        <span>Settings</span>
                    </div>

                    {/* Presets */}
                    <div className="control-group">
                        <span className="control-label">Presets</span>
                        <div className="preset-btns">
                            <button className="preset-btn" onClick={() => setPreset('trefoil')}>Trefoil</button>
                            <button className="preset-btn" onClick={() => setPreset('figure8')}>Fig-8</button>
                            <button className="preset-btn" onClick={() => setPreset('torus')}>Torus</button>
                        </div>
                    </div>

                    {/* Animation */}
                    <div className="control-group">
                        <span className="control-label">Animation</span>
                        <button
                            className="control-btn"
                            onClick={togglePlay}
                            style={{ backgroundColor: isPlaying ? '#ff8888' : 'var(--accent-color)' }}
                        >
                            {isPlaying ? '⏸ Pause' : '▶ Play'}
                        </button>
                    </div>

                    {/* Equations */}
                    <div className="control-group">
                        <span className="control-label">Equations</span>
                        <div className="equation-inputs">
                            <div className="equation-row">
                                <span className="eq-label">X</span>
                                <input
                                    type="text"
                                    className="eq-input"
                                    value={xEq}
                                    onChange={(e) => setXEq(e.target.value)}
                                />
                            </div>
                            <div className="equation-row">
                                <span className="eq-label">Y</span>
                                <input
                                    type="text"
                                    className="eq-input"
                                    value={yEq}
                                    onChange={(e) => setYEq(e.target.value)}
                                />
                            </div>
                            <div className="equation-row">
                                <span className="eq-label">Z</span>
                                <input
                                    type="text"
                                    className="eq-input"
                                    value={zEq}
                                    onChange={(e) => setZEq(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="control-group">
                        <span className="control-label">Thickness: {thickness.toFixed(1)}</span>
                        <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.1"
                            value={thickness}
                            onChange={(e) => setThickness(parseFloat(e.target.value))}
                            className="control-slider"
                        />
                    </div>

                    <div className="control-group">
                        <span className="control-label">Color</span>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="control-color"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingControls;
