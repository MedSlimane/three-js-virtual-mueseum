import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import Museum from './Museum';
import OperatingRoomMini from './OperatingRoomMini';

// Canvas setup for the virtual museum scene with interactive controls
const MuseumCanvas: React.FC = () => {
  const storageKey = 'museum-mini-params';
  // Load persisted params
  const saved = localStorage.getItem(storageKey);
  const parsed = saved ? JSON.parse(saved) as { position: number[]; scale: number[] } : undefined;
  const [mode, setMode] = useState<'translate' | 'scale'>('translate');
  const [miniParams, setMiniParams] = useState(parsed);

  // Persist last params to localStorage on unmount
  useEffect(() => {
    return () => {
      if (miniParams) localStorage.setItem(storageKey, JSON.stringify(miniParams));
    };
  }, [miniParams]);

  // Keyboard shortcuts: 1 → translate, 2 → scale, R → reset
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '1') setMode('translate');
      if (e.key === '2') setMode('scale');
      if (e.key.toLowerCase() === 'r') setMiniParams(undefined);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [12, 8, 12], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Overlay showing current shortcuts */}
      <Html fullscreen className="help">
        Shortcuts: [1] Translate | [2] Scale | [R] Reset
      </Html>

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
            mode={mode}
            initialParams={miniParams}
            onUpdate={(pos, scl) => setMiniParams({ position: pos, scale: scl })}
          />
        </Museum>
        <OrbitControls makeDefault />
      </Suspense>
    </Canvas>
  );
};

export default MuseumCanvas;
