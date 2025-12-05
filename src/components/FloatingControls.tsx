import React, { useState } from 'react';

interface FloatingControlsProps {
    thickness: number;
    setThickness: (val: number) => void;
    color: string;
    setColor: (val: string) => void;
    isPlaying: boolean;
    togglePlay: () => void;
    setPreset: (name: 'trefoil' | 'figure8' | 'torus') => void;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({
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
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
            </button>

            {isExpanded && (
                <div className="floating-controls-panel neo-box">
                    {/* Play/Pause */}
                    <button
                        className="control-btn"
                        onClick={togglePlay}
                        style={{ backgroundColor: isPlaying ? '#ff8888' : 'var(--accent-color)' }}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>

                    {/* Presets */}
                    <div className="control-group">
                        <span className="control-label">Presets</span>
                        <div className="preset-btns">
                            <button className="preset-btn" onClick={() => setPreset('trefoil')}>T</button>
                            <button className="preset-btn" onClick={() => setPreset('figure8')}>8</button>
                            <button className="preset-btn" onClick={() => setPreset('torus')}>O</button>
                        </div>
                    </div>

                    {/* Thickness */}
                    <div className="control-group">
                        <span className="control-label">Size</span>
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

                    {/* Color */}
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
