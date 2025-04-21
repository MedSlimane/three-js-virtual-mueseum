import React, { useState, useEffect } from 'react';
import type { Vector3 } from 'three'; // Import Vector3

// Type definitions for object parameters
interface ObjectParams {
  position: number[];
  scale: number[];
}

// Type definitions for lighting parameters
interface LightingParams {
  ambientIntensity: number;
  directionalIntensity: number;
  lightWarmth: number; // Add light warmth
}

// Props for the CoordinatesMenu component
export interface CoordinatesMenuProps { // Export the interface
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
    fountain: ObjectParams | null;
    zahrawi1: ObjectParams | null;
    cheshmManuscript: ObjectParams | null;
    medizinKlimt: ObjectParams | null;
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
    fountain: (position: number[], scale: number[]) => void;
    zahrawi1: (position: number[], scale: number[]) => void;
    cheshmManuscript: (position: number[], scale: number[]) => void;
    medizinKlimt: (position: number[], scale: number[]) => void;
  };
  // Lighting parameters
  lighting: LightingParams;
  // Update functions for lighting
  onLightingUpdate: {
    setAmbientIntensity: (intensity: number) => void;
    setDirectionalIntensity: (intensity: number) => void;
    setLightWarmth: (warmth: number) => void; // Add warmth setter
  };
  playerPosition: Vector3; // Add playerPosition prop
  onPlayerPositionUpdate: (position: [number, number, number]) => void; // Add callback for player position update
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
  sphygmomanometer: "Sphygmomanometer",
  fountain: "Fountain",
  zahrawi1: "Zahrawi 1",
  cheshmManuscript: "Cheshm Manuscript",
  medizinKlimt: "Medizin Klimt"
};

// Store menu state in localStorage to persist across mode changes
const getStoredMenuState = (): boolean => {
  const stored = localStorage.getItem('coordinates-menu-open');
  return stored ? JSON.parse(stored) : true;
};

const CoordinatesMenu: React.FC<CoordinatesMenuProps> = ({ objects, onUpdate, lighting, onLightingUpdate, playerPosition, onPlayerPositionUpdate }) => {
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

  // Helper function to handle input changes and update state
  const handleInputChange = (
    type: 'position' | 'scale',
    axis: 0 | 1 | 2,
    value: string // Input value is initially a string
  ) => {
    const numValue = parseFloat(value);
    // Only update if the parsed value is a valid number
    if (!isNaN(numValue)) {
      updateValue(type, axis, numValue);
    }
    // Optionally, handle invalid input (e.g., clear the field or show an error)
    // For now, it just won't update if the input is not a valid number
  };

  // Function to export all current object parameters to a JSON file
  const exportCoordinates = () => {
    const data = JSON.stringify({
      objects,
      lighting,
      playerPosition: playerPosition.toArray() // Add player position to export
    }, null, 2);
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

  // Function to handle importing settings from JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const settings = JSON.parse(content);

          // Validate and apply object settings
          if (settings.objects && typeof settings.objects === 'object') {
            Object.keys(settings.objects).forEach(key => {
              const objectKey = key as keyof typeof onUpdate; // Type assertion
              if (onUpdate[objectKey] && settings.objects[key]) {
                const { position, scale } = settings.objects[key];
                if (Array.isArray(position) && position.every((n: unknown) => typeof n === 'number') &&
                    Array.isArray(scale) && scale.every((n: unknown) => typeof n === 'number')) {
                  // Ensure arrays have the correct length (optional but good practice)
                   if (position.length === 3 && scale.length === 3) {
                      onUpdate[objectKey](position as [number, number, number], scale as [number, number, number]); // Use asserted key
                   } else {
                      console.warn(`Invalid array length for position/scale of object '${key}' in imported file.`);
                   }
                } else {
                  console.warn(`Invalid position/scale format for object '${key}' in imported file.`);
                }
              }
            });
          } else {
             console.warn(`Invalid or missing 'objects' data in imported file.`);
          }

          // Validate and apply lighting settings
          if (settings.lighting && typeof settings.lighting === 'object') {
            const { ambientIntensity, directionalIntensity, lightWarmth } = settings.lighting;
            if (typeof ambientIntensity === 'number') {
              onLightingUpdate.setAmbientIntensity(ambientIntensity);
            }
             if (typeof directionalIntensity === 'number') {
              onLightingUpdate.setDirectionalIntensity(directionalIntensity);
            }
             if (typeof lightWarmth === 'number') {
              onLightingUpdate.setLightWarmth(lightWarmth);
            }
          } else {
            console.warn(`Invalid or missing 'lighting' data in imported file.`);
          }

          // Validate and apply player position settings
          if (settings.playerPosition &&
              Array.isArray(settings.playerPosition) &&
              settings.playerPosition.length === 3 &&
              settings.playerPosition.every((n: unknown) => typeof n === 'number'))
          {
             console.log("Importing Player Position:", settings.playerPosition);
             onPlayerPositionUpdate(settings.playerPosition as [number, number, number]); // Call the callback
          } else if (settings.playerPosition) {
             console.warn(`Invalid or missing 'playerPosition' data in imported file.`);
          }


        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Failed to import settings. Please check the file format.");
        }
      };
      reader.readAsText(file);
      // Reset file input to allow importing the same file again
      event.target.value = '';
    }
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

  // Function to handle light warmth change
  const handleWarmthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const warmth = parseFloat(e.target.value);
    onLightingUpdate.setLightWarmth(warmth);
  };

  // Function to move the selected object to the player's position
  const bringObjectToPlayer = () => {
    if (!selectedObject) return;
    const currentObject = objects[selectedObject];
    if (!currentObject) return;

    // Use player position and current scale
    const playerPosArray = playerPosition.toArray();
    onUpdate[selectedObject](playerPosArray, currentObject.scale);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <h4 style={{ margin: 0 }}>Position</h4>
              <button onClick={bringObjectToPlayer} title="Bring object to player position">📍</button> 
            </div>
            <div className="field-group">
              <label htmlFor="position-x">X:</label>
              <div className="input-pair">
                <input
                  id="position-x-range"
                  type="range"
                  min="-50"
                  max="50"
                  step="0.1"
                  value={currentObject.position[0]}
                  onChange={(e) => handleInputChange('position', 0, e.target.value)}
                />
                <input
                  id="position-x-number"
                  type="number"
                  step="0.1"
                  value={currentObject.position[0]}
                  onChange={(e) => handleInputChange('position', 0, e.target.value)}
                  className="number-input"
                />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="position-y">Y:</label>
              <div className="input-pair">
                <input
                  id="position-y-range"
                  type="range"
                  min="-20"
                  max="20"
                  step="0.1"
                  value={currentObject.position[1]}
                  onChange={(e) => handleInputChange('position', 1, e.target.value)}
                />
                <input
                  id="position-y-number"
                  type="number"
                  step="0.1"
                  value={currentObject.position[1]}
                  onChange={(e) => handleInputChange('position', 1, e.target.value)}
                  className="number-input"
                />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="position-z">Z:</label>
              <div className="input-pair">
                <input
                  id="position-z-range"
                  type="range"
                  min="-50"
                  max="50"
                  step="0.1"
                  value={currentObject.position[2]}
                  onChange={(e) => handleInputChange('position', 2, e.target.value)}
                />
                <input
                  id="position-z-number"
                  type="number"
                  step="0.1"
                  value={currentObject.position[2]}
                  onChange={(e) => handleInputChange('position', 2, e.target.value)}
                  className="number-input"
                />
              </div>
            </div>
          </div>

          <div className="coordinates-section">
            <h4>Scale</h4>
            <div className="field-group">
              <label htmlFor="scale-x">X:</label>
              <div className="input-pair">
                <input
                  id="scale-x-range"
                  type="range"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={currentObject.scale[0]}
                  onChange={(e) => handleInputChange('scale', 0, e.target.value)}
                />
                <input
                  id="scale-x-number"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={currentObject.scale[0]}
                  onChange={(e) => handleInputChange('scale', 0, e.target.value)}
                  className="number-input"
                />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="scale-y">Y:</label>
              <div className="input-pair">
                <input
                  id="scale-y-range"
                  type="range"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={currentObject.scale[1]}
                  onChange={(e) => handleInputChange('scale', 1, e.target.value)}
                />
                <input
                  id="scale-y-number"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={currentObject.scale[1]}
                  onChange={(e) => handleInputChange('scale', 1, e.target.value)}
                  className="number-input"
                />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="scale-z">Z:</label>
              <div className="input-pair">
                <input
                  id="scale-z-range"
                  type="range"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={currentObject.scale[2]}
                  onChange={(e) => handleInputChange('scale', 2, e.target.value)}
                />
                <input
                  id="scale-z-number"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={currentObject.scale[2]}
                  onChange={(e) => handleInputChange('scale', 2, e.target.value)}
                  className="number-input"
                />
              </div>
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
            min="0"  // Keep min at 0
            max="3"  // Reduce max for finer control in typical range
            step="0.05" // Smaller step for finer adjustments
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
            min="0"  // Keep min at 0
            max="8"  // Reduce max for finer control in typical range
            step="0.1" // Keep step or make slightly smaller if needed
            value={lighting.directionalIntensity}
            onChange={handleDirectionalIntensityChange}
          />
          <span>{lighting.directionalIntensity.toFixed(2)}</span>
        </div>
        <div className="field-group">
          <label htmlFor="light-warmth">Warmth:</label>
          <input
            id="light-warmth"
            type="range"
            min="0"   /* Cool */
            max="2"   /* Warm */
            step="0.05"
            value={lighting.lightWarmth}
            onChange={handleWarmthChange}
          />
          <span>{lighting.lightWarmth.toFixed(2)}</span>
        </div> {/* Closing tag for warmth field-group */} 
      </div> {/* Closing tag for lighting section */} 

      {/* Player Position Display */}
      <div className="coordinates-section">
        <h4>Player Position</h4>
        <p>{`X: ${playerPosition.x.toFixed(2)}, Y: ${playerPosition.y.toFixed(2)}, Z: ${playerPosition.z.toFixed(2)}`}</p>
      </div> {/* Correct closing tag */}

       {/* Import/Export Buttons */}
       <div className="coordinates-section import-export-buttons">
          <button onClick={exportCoordinates} className="menu-button export-button">
            Export Settings
          </button>
          {/* File input remains hidden */}
          <input
            type="file"
            id="import-settings"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          {/* Label acts as the visible button */}
          <label htmlFor="import-settings" className="menu-button import-button">
            Import Settings
          </label>
        </div> {/* Correct closing tag */}
    </div> // Closing tag for coordinates-menu
  );
};

export default CoordinatesMenu;