import React, { useState, useEffect } from 'react';

// Type definitions for object parameters
interface ObjectParams {
  position: number[];
  scale: number[];
}

// Type definitions for lighting parameters
interface LightingParams {
  ambientIntensity: number;
  directionalIntensity: number;
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
  // Lighting parameters
  lighting: LightingParams;
  // Update functions for lighting
  onLightingUpdate: {
    setAmbientIntensity: (intensity: number) => void;
    setDirectionalIntensity: (intensity: number) => void;
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

const CoordinatesMenu: React.FC<CoordinatesMenuProps> = ({ objects, onUpdate, lighting, onLightingUpdate }) => {
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

  // Function to export all current object parameters to a JSON file
  const exportCoordinates = () => {
    const data = JSON.stringify(objects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'coordinates.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to handle ambient intensity change
  const handleAmbientIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intensity = parseFloat(e.target.value);
    onLightingUpdate.setAmbientIntensity(intensity);
  };

  // Function to handle directional intensity change
  const handleDirectionalIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const intensity = parseFloat(e.target.value);
    onLightingUpdate.setDirectionalIntensity(intensity);
  };

  if (!isOpen) {
    return (
      <button 
        className="coordinates-menu-toggle"
        onClick={() => setIsOpen(true)}
      >
        Show Coordinates (M)
      </button>
    );
  }

  const currentObject = selectedObject ? objects[selectedObject] : null;

  return (
    <div className="coordinates-menu">
      <div 
        className="coordinates-header"
      >
        <h3 
          
        >Object Coordinates</h3>
        <div>
          <span 
            
          >Press 'M' to toggle</span>
          <button 
            onClick={() => setIsOpen(false)}
             
          >
            ✕
          </button>
          <button
            onClick={exportCoordinates}
            className="save-btn"
          >
            💾
          </button>
        </div>
      </div>

      <div className="object-select-container">
        <label htmlFor="object-select" 
         
        >Select Object:</label>
        <select 
          id="object-select"
          value={selectedObject || ''}
          onChange={(e) => setSelectedObject(e.target.value as keyof typeof objects)}
        >
          {Object.keys(objects).map((key) => (
            <option key={key} value={key}>
              {objectNames[key as keyof typeof objectNames]}
            </option>
          ))}
        </select>
      </div>

      {currentObject && (
        <>
          <div className="coordinates-section">
            <h4 
            
            >Position</h4>
            <div className="field-group">
              <label htmlFor="position-x" 
               
              >X: {currentObject.position[0].toFixed(2)}</label>
              <input
                id="position-x"
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={currentObject.position[0]}
                onChange={(e) => updateValue('position', 0, parseFloat(e.target.value))}
              />
            </div>
            <div className="field-group">
              <label htmlFor="position-y" 
               
              >Y: {currentObject.position[1].toFixed(2)}</label>
              <input
                id="position-y"
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={currentObject.position[1]}
                onChange={(e) => updateValue('position', 1, parseFloat(e.target.value))}
              />
            </div>
            <div className="field-group">
              <label htmlFor="position-z" 
               
              >Z: {currentObject.position[2].toFixed(2)}</label>
              <input
                id="position-z"
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={currentObject.position[2]}
                onChange={(e) => updateValue('position', 2, parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="coordinates-section">
            <h4 
            
            >Scale</h4>
            <div className="field-group">
              <label htmlFor="scale-x" 
               
              >X: {currentObject.scale[0].toFixed(2)}</label>
              <input
                id="scale-x"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={currentObject.scale[0]}
                onChange={(e) => updateValue('scale', 0, parseFloat(e.target.value))}
              />
            </div>
            <div className="field-group">
              <label htmlFor="scale-y" 
               
              >Y: {currentObject.scale[1].toFixed(2)}</label>
              <input
                id="scale-y"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={currentObject.scale[1]}
                onChange={(e) => updateValue('scale', 1, parseFloat(e.target.value))}
              />
            </div>
            <div className="field-group">
              <label htmlFor="scale-z" 
               
              >Z: {currentObject.scale[2].toFixed(2)}</label>
              <input
                id="scale-z"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={currentObject.scale[2]}
                onChange={(e) => updateValue('scale', 2, parseFloat(e.target.value))}
              />
            </div>
          </div>
        </>
      )}

      <div className="coordinates-section">
        <h4>Lighting</h4>
        <div className="field-group">
          <label htmlFor="ambient-intensity">Ambient:</label>
          <input
            id="ambient-intensity"
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={lighting.ambientIntensity}
            onChange={handleAmbientIntensityChange}
          />
          <span>{lighting.ambientIntensity.toFixed(2)}</span>
        </div>
        <div className="field-group">
          <label htmlFor="directional-intensity">Directional:</label>
          <input
            id="directional-intensity"
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={lighting.directionalIntensity}
            onChange={handleDirectionalIntensityChange}
          />
          <span>{lighting.directionalIntensity.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CoordinatesMenu;