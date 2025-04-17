/** @jsxImportSource react */
import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Stats } from '@react-three/drei';
import Museum from './Museum';
import OperatingRoomMini from './OperatingRoomMini';
import Controls from './Controls';
import FirstPersonControls from './FirstPersonControls';
import InfoPanel from './InfoPanel';

// Position tracker component that updates in real-time
const PositionTracker = ({ groupRef, setPositionInfo }) => {
  useFrame(() => {
    if (groupRef.current) {
      const position = groupRef.current.position.toArray();
      const scale = groupRef.current.scale.toArray();
      
      const positionFormatted = position.map(p => p.toFixed(2)).join(', ');
      const scaleFormatted = scale.map(s => s.toFixed(2)).join(', ');
      
      setPositionInfo(`Position: [${positionFormatted}]\nScale: [${scaleFormatted}]`);
    }
  });
  
  return null;
};

// Canvas setup for the virtual museum scene with interactive controls
const MuseumCanvas: React.FC = () => {
  const storageKey = 'museum-mini-params';
  // Load persisted params
  const saved = localStorage.getItem(storageKey);
  const parsed = saved ? JSON.parse(saved) as { position: number[]; scale: number[] } : undefined;
  const [mode, setMode] = useState<'translate' | 'scale'>('translate');
  const [miniParams, setMiniParams] = useState(parsed);
  const [debug, setDebug] = useState(false);
  const [controlMode, setControlMode] = useState<'orbit' | 'firstPerson'>('orbit');
  const [positionInfo, setPositionInfo] = useState<string>('Position data loading...');
  const operatingRoomRef = useRef(null);

  // Persist last params to localStorage on unmount
  useEffect(() => {
    return () => {
      if (miniParams) localStorage.setItem(storageKey, JSON.stringify(miniParams));
    };
  }, [miniParams]);

  // Keyboard shortcuts: 1 → translate, 2 → scale, R → reset, F → toggle control mode
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '1') setMode('translate');
      if (e.key === '2') setMode('scale');
      if (e.key.toLowerCase() === 'r') setMiniParams(undefined);
      if (e.key.toLowerCase() === 'f') setControlMode(prev => prev === 'orbit' ? 'firstPerson' : 'orbit');
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <React.Fragment>
      <Controls 
        debug={debug} 
        setDebug={setDebug} 
        controlMode={controlMode} 
        setControlMode={setControlMode} 
      />
      
      <InfoPanel text={positionInfo} />
      
      <Canvas
        shadows
        camera={{ position: [12, 8, 12], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Display stats when debug mode is active */}
        {debug && <Stats />}
        
        {/* Overlay showing current shortcuts */}
        <Html fullscreen className="help">
          <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '4px' }}>
            Shortcuts: [1] Translate | [2] Scale | [R] Reset | [F] Toggle Controls
          </div>
        </Html>

        {/* Real-time position tracker */}
        <PositionTracker groupRef={operatingRoomRef} setPositionInfo={setPositionInfo} />

        {/* Lighting setup */}
        <ambientLight intensity={0.7} />
        <directionalLight
          castShadow
          intensity={3.0}
          position={[10, 10, 5]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Scene content with suspense fallback */}
        <Suspense fallback={<Html center>Loading…</Html>}>
          <Museum>
            <OperatingRoomMini
              ref={operatingRoomRef}
              mode={mode}
              initialParams={miniParams ? {
                position: Array.isArray(miniParams.position) && miniParams.position.length === 3 
                  ? miniParams.position as [number, number, number] 
                  : [0, 0, 0],
                scale: Array.isArray(miniParams.scale) && miniParams.scale.length === 3 
                  ? miniParams.scale as [number, number, number] 
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setMiniParams({ position: pos, scale: scl })}
            />
          </Museum>
          
          {controlMode === 'orbit' ? (
            <OrbitControls makeDefault />
          ) : (
            <FirstPersonControls speed={5} />
          )}
          
          {debug && <axesHelper args={[5]} />}
        </Suspense>
      </Canvas>
    </React.Fragment>
  );
};

export default MuseumCanvas;
