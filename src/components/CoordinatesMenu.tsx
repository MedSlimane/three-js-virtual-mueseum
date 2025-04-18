import React, { useState, useEffect } from 'react';

// Type definitions for object parameters
interface ObjectParams {
  position: number[];
  scale: number[];
}

// Props for the CoordinatesMenu component
interface CoordinatesMenuProps {
  // All objects with their parameters
  objects: {
    operatingRoom: ObjectParams | null;
    dnaLabMachine: ObjectParams | null;
    humanDna: ObjectParams | null;
    hivVirus: ObjectParams | null;
    laparoscopicTrocar: ObjectParams | null;
    medicalMonitor: ObjectParams | null;
    medicalSyringe: ObjectParams | null;
    sciFiMri: ObjectParams | null;
    sphygmomanometer: ObjectParams | null;
  };
  // Update functions for each object
  onUpdate: {
    operatingRoom: (position: number[], scale: number[]) => void;
    dnaLabMachine: (position: number[], scale: number[]) => void;
    humanDna: (position: number[], scale: number[]) => void;
    hivVirus: (position: number[], scale: number[]) => void;
    laparoscopicTrocar: (position: number[], scale: number[]) => void;
    medicalMonitor: (position: number[], scale: number[]) => void;
    medicalSyringe: (position: number[], scale: number[]) => void;
    sciFiMri: (position: number[], scale: number[]) => void;
    sphygmomanometer: (position: number[], scale: number[]) => void;
  };
}

// Names to display in the UI
const objectNames = {
  operatingRoom: "Operating Room",
  dnaLabMachine: "DNA Lab Machine",
  humanDna: "Human DNA",
  hivVirus: "HIV Virus",
  laparoscopicTrocar: "Laparoscopic Trocar",
  medicalMonitor: "Medical Monitor",
  medicalSyringe: "Medical Syringe",
  sciFiMri: "Sci-Fi MRI",
  sphygmomanometer: "Sphygmomanometer"
};

// Store menu state in localStorage to persist across mode changes
const getStoredMenuState = (): boolean => {
  const stored = localStorage.getItem('coordinates-menu-open');
  return stored ? JSON.parse(stored) : true;
};

const CoordinatesMenu: React.FC<CoordinatesMenuProps> = ({ objects, onUpdate }) => {
  // Use localStorage to persist menu state across mode changes
  const [isOpen, setIsOpen] = useState(getStoredMenuState());
  const [selectedObject, setSelectedObject] = useState<keyof typeof objects | null>("operatingRoom");

  // Save menu state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('coordinates-menu-open', JSON.stringify(isOpen));
  }, [isOpen]);

  // Add keyboard shortcut (M key) to toggle menu visibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle menu with 'M' key
      if (e.key.toLowerCase() === 'm') {
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Function to update a specific value (position or scale) for the selected object
  const updateValue = (
    type: 'position' | 'scale',
    axis: 0 | 1 | 2,
    value: number
  ) => {
    if (!selectedObject) return;
    
    const currentObject = objects[selectedObject];
    if (!currentObject) return;

    const newValues = { ...currentObject };
    
    if (type === 'position') {
      newValues.position = [...currentObject.position];
      newValues.position[axis] = value;
    } else {
      newValues.scale = [...currentObject.scale];
      newValues.scale[axis] = value;
    }
    
    onUpdate[selectedObject](newValues.position, newValues.scale);
  };

  if (!isOpen) {
    return (
      <button 
        className="coordinates-menu-toggle" 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          padding: '8px 12px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1000,
          pointerEvents: 'auto'
        }}
      >
        Show Coordinates (M)
      </button>
    );
  }

  const currentObject = selectedObject ? objects[selectedObject] : null;

  return (
    <div 
      className="coordinates-menu"
      style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        padding: '15px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '6px',
        color: 'white',
        zIndex: 1000,
        width: '300px',
        maxHeight: '80vh',
        overflowY: 'auto',
        pointerEvents: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Object Coordinates</h3>
        <div>
          <span style={{ fontSize: '0.8em', marginRight: '10px' }}>Press 'M' to toggle</span>
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="object-select" style={{ display: 'block', marginBottom: '5px' }}>Select Object:</label>
        <select 
          id="object-select"
          value={selectedObject || ''}
          onChange={(e) => setSelectedObject(e.target.value as keyof typeof objects)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '4px'
          }}
        >
          {Object.keys(objects).map((key) => (
            <option key={key} value={key}>
              {objectNames[key as keyof typeof objectNames]}
            </option>
          ))}
        </select>
      </div>

      {currentObject && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>Position</h4>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="position-x" style={{ display: 'block', marginBottom: '5px' }}>X: {currentObject.position[0].toFixed(2)}</label>
              <input
                id="position-x"
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={currentObject.position[0]}
                onChange={(e) => updateValue('position', 0, parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="position-y" style={{ display: 'block', marginBottom: '5px' }}>Y: {currentObject.position[1].toFixed(2)}</label>
              <input
                id="position-y"
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={currentObject.position[1]}
                onChange={(e) => updateValue('position', 1, parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="position-z" style={{ display: 'block', marginBottom: '5px' }}>Z: {currentObject.position[2].toFixed(2)}</label>
              <input
                id="position-z"
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={currentObject.position[2]}
                onChange={(e) => updateValue('position', 2, parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '10px' }}>Scale</h4>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="scale-x" style={{ display: 'block', marginBottom: '5px' }}>X: {currentObject.scale[0].toFixed(2)}</label>
              <input
                id="scale-x"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={currentObject.scale[0]}
                onChange={(e) => updateValue('scale', 0, parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="scale-y" style={{ display: 'block', marginBottom: '5px' }}>Y: {currentObject.scale[1].toFixed(2)}</label>
              <input
                id="scale-y"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={currentObject.scale[1]}
                onChange={(e) => updateValue('scale', 1, parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="scale-z" style={{ display: 'block', marginBottom: '5px' }}>Z: {currentObject.scale[2].toFixed(2)}</label>
              <input
                id="scale-z"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={currentObject.scale[2]}
                onChange={(e) => updateValue('scale', 2, parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatesMenu;