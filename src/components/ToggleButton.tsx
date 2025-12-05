import React from 'react';

interface ToggleButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isOpen, onClick }) => {
    return (
        <button
            className="floating-toggle-btn neo-box"
            onClick={onClick}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                {isOpen ? (
                    <>
                        <line x1="6" y1="6" x2="18" y2="18" />
                        <line x1="6" y1="18" x2="18" y2="6" />
                    </>
                ) : (
                    <>
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                    </>
                )}
            </svg>
        </button>
    );
};

export default ToggleButton;
