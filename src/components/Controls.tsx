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
  return (
    <div className="controls-panel">
      <button onClick={() => setDebug(!debug)}>
        {debug ? 'Hide Stats' : 'Show Stats'}
      </button>
      <button onClick={() => setControlMode(controlMode === 'orbit' ? 'firstPerson' : 'orbit')}>
        {controlMode === 'orbit' ? 'First Person Mode' : 'Orbit Mode'}
      </button>
    </div>
  );
};

export default Controls;