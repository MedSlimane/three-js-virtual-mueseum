import React from 'react';

interface ControlsProps {
  debug: boolean;
  setDebug: (value: boolean) => void;
  controlMode: 'orbit' | 'firstPerson';
  setControlMode: (mode: 'orbit' | 'firstPerson') => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  debug, 
  setDebug,
  controlMode,
  setControlMode
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
    </div>
  );
};

export default Controls;