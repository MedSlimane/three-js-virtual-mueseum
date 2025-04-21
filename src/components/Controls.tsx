import React from 'react';

interface ControlsProps {
  debug: boolean;
  setDebug: (value: boolean) => void;
  controlMode: 'orbit' | 'firstPerson';
  setControlMode: (mode: 'orbit' | 'firstPerson') => void;
  isUIVisible: boolean;
  setIsUIVisible: (value: boolean) => void;
  areFramedArtVisible: boolean; // Add prop for framed art visibility state
  toggleFramedArt: () => void; // Add prop for the toggle handler function
}

const Controls: React.FC<ControlsProps> = ({ 
  debug, 
  setDebug,
  controlMode,
  setControlMode,
  isUIVisible,
  setIsUIVisible,
  areFramedArtVisible, // Destructure prop
  toggleFramedArt // Destructure prop
}) => {
  const handleControlModeChange = () => {
    // Force exit pointer lock if switching from first person to orbit mode
    if (controlMode === 'firstPerson' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    
    // Switch mode after ensuring pointer is released
    setTimeout(() => {
      setControlMode(controlMode === 'orbit' ? 'firstPerson' : 'orbit');
    }, 50);
  };

  return (
    <div className="controls-panel">
      <button onClick={() => setDebug(!debug)}>
        {debug ? 'Hide Stats' : 'Show Stats'}
      </button>
      <button onClick={handleControlModeChange}>
        {controlMode === 'orbit' ? 'First Person Mode' : 'Orbit Mode'}
      </button>
      <button onClick={() => setIsUIVisible(!isUIVisible)}>
        {isUIVisible ? 'Hide UI (H)' : 'Show UI (H)'}
      </button>
      <button onClick={toggleFramedArt}> 
        {areFramedArtVisible ? 'Hide Pictures (;)' : 'Show Pictures (;)'}
      </button>
    </div>
  );
};

export default Controls;