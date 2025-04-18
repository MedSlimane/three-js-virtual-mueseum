/** @jsxImportSource react */
import React, { Suspense, useState, useEffect, useRef } from 'react';
import type { Group } from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Stats } from '@react-three/drei';
import Museum from './Museum';
import OperatingRoomMini from './OperatingRoomMini';
import DnaLabMachineMini from './DnaLabMachineMini';
import HumanDnaMini from './HumanDnaMini';
import HivVirusSectionedMini from './HivVirusSectionedMini';
import LaparoscopicTrocarMini from './LaparoscopicTrocarMini';
import { MedicalMonitorMini } from './MedicalMonitorMini';
import { MedicalSyringeMini } from './MedicalSyringeMini';
import { SciFiMriMini } from './SciFiMriMini';
import { SphygmomanometerMini } from './SphygmomanometerMini';
import Controls from './Controls';
import FirstPersonControls from './FirstPersonControls';
import InfoPanel from './InfoPanel';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { ACESFilmicToneMapping, PMREMGenerator, HemisphereLight, DirectionalLight, Vector3, MathUtils } from 'three';

// Position tracker component that updates in real-time
interface PositionTrackerProps {
  groupRef: React.RefObject<Group>;
  setPositionInfo: React.Dispatch<React.SetStateAction<string>>;
}
const PositionTracker: React.FC<PositionTrackerProps> = ({ groupRef, setPositionInfo }) => {
  useFrame(() => {
    if (groupRef.current) {
      const position = groupRef.current.position.toArray();
      const scale = groupRef.current.scale.toArray();
      
      const positionFormatted = position.map((p: number) => p.toFixed(2)).join(', ');
      const scaleFormatted = scale.map((s: number) => s.toFixed(2)).join(', ');
      
      setPositionInfo(`Position: [${positionFormatted}]\nScale: [${scaleFormatted}]`);
    }
  });
  
  return null;
};

// Canvas setup for the virtual museum scene with interactive controls
const MuseumCanvas: React.FC = () => {
  const dnaStorageKey = 'dna-lab-machine-mini-params';
  const humanDnaStorageKey = 'human-dna-mini-params';
  const storageKey = 'museum-mini-params';
  const hivStorageKey = 'hiv-virus-mini-params';
  const trocarStorageKey = 'laparoscopic-trocar-mini-params';
  const monitorStorageKey = 'medical-monitor-mini-params';
  const syringeStorageKey = 'medical-syringe-mini-params';
  const mriStorageKey = 'sci-fi-mri-mini-params';
  const sphygStorageKey = 'sphygmomanometer-mini-params';

  // Load persisted params
  const saved = localStorage.getItem(storageKey);
  const parsed = saved ? JSON.parse(saved) as { position: number[]; scale: number[] } : undefined;
  const savedDna = localStorage.getItem(dnaStorageKey);
  const parsedDna = savedDna ? JSON.parse(savedDna) as { position: number[]; scale: number[] } : undefined;
  const savedHuman = localStorage.getItem(humanDnaStorageKey);
  const parsedHuman = savedHuman ? JSON.parse(savedHuman) as { position: number[]; scale: number[] } : undefined;
  const savedHiv = localStorage.getItem(hivStorageKey);
  const parsedHiv = savedHiv ? JSON.parse(savedHiv) as { position: number[]; scale: number[] } : undefined;
  const savedTrocar = localStorage.getItem(trocarStorageKey);
  const parsedTrocar = savedTrocar ? JSON.parse(savedTrocar) as { position: number[]; scale: number[] } : undefined;
  const savedMonitor = localStorage.getItem(monitorStorageKey);
  const parsedMonitor = savedMonitor ? JSON.parse(savedMonitor) as { position: number[]; scale: number[] } : undefined;
  const savedSyringe = localStorage.getItem(syringeStorageKey);
  const parsedSyringe = savedSyringe ? JSON.parse(savedSyringe) as { position: number[]; scale: number[] } : undefined;
  const savedMri = localStorage.getItem(mriStorageKey);
  const parsedMri = savedMri ? JSON.parse(savedMri) as { position: number[]; scale: number[] } : undefined;
  const savedSphyg = localStorage.getItem(sphygStorageKey);
  const parsedSphyg = savedSphyg ? JSON.parse(savedSphyg) as { position: number[]; scale: number[] } : undefined;
  const [mode, setMode] = useState<'translate' | 'scale'>('translate');
  const [miniParams, setMiniParams] = useState(parsed);
  const [dnaParams, setDnaParams] = useState(parsedDna);
  const [humanDnaParams, setHumanDnaParams] = useState(parsedHuman);
  const [hivParams, setHivParams] = useState(parsedHiv);
  const [trocarParams, setTrocarParams] = useState(parsedTrocar);
  const [monitorParams, setMonitorParams] = useState(parsedMonitor);
  const [syringeParams, setSyringeParams] = useState(parsedSyringe);
  const [mriParams, setMriParams] = useState(parsedMri);
  const [sphygParams, setSphygParams] = useState(parsedSphyg);
  const [debug, setDebug] = useState(false);
  const [controlMode, setControlMode] = useState<'orbit' | 'firstPerson'>('orbit');
  const [positionInfo, setPositionInfo] = useState<string>('Position data loading...');
  const operatingRoomRef = useRef<Group>(null!);
  const dnaLabRef = useRef<Group>(null!);
  const humanDnaRef = useRef<Group>(null!);
  const hivRef = useRef<Group>(null!);
  const trocarRef = useRef<Group>(null!);
  const monitorRef = useRef<Group>(null!);
  const syringeRef = useRef<Group>(null!);
  const mriRef = useRef<Group>(null!);
  const sphygRef = useRef<Group>(null!);

  // Persist last params to localStorage on unmount
  useEffect(() => {
    return () => {
      if (miniParams) localStorage.setItem(storageKey, JSON.stringify(miniParams));
      if (dnaParams) localStorage.setItem(dnaStorageKey, JSON.stringify(dnaParams));
      if (humanDnaParams) localStorage.setItem(humanDnaStorageKey, JSON.stringify(humanDnaParams));
      if (hivParams) localStorage.setItem(hivStorageKey, JSON.stringify(hivParams));
      if (trocarParams) localStorage.setItem(trocarStorageKey, JSON.stringify(trocarParams));
      if (monitorParams) localStorage.setItem(monitorStorageKey, JSON.stringify(monitorParams));
      if (syringeParams) localStorage.setItem(syringeStorageKey, JSON.stringify(syringeParams));
      if (mriParams) localStorage.setItem(mriStorageKey, JSON.stringify(mriParams));
      if (sphygParams) localStorage.setItem(sphygStorageKey, JSON.stringify(sphygParams));
    };
  }, [miniParams, dnaParams, humanDnaParams, hivParams, trocarParams, monitorParams, syringeParams, mriParams, sphygParams]);

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
        onCreated={({ gl, scene }) => {
          // Renderer tone mapping and exposure
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.6;

          // Sky dome setup
          const sky = new Sky();
          sky.scale.setScalar(450000);
          sky.material.uniforms.turbidity.value = 10;
          sky.material.uniforms.rayleigh.value = 2;
          sky.material.uniforms.mieCoefficient.value = 0.005;
          sky.material.uniforms.mieDirectionalG.value = 0.8;
          const sunPos = new Vector3();
          const phi = MathUtils.degToRad(90 - 25);
          const theta = MathUtils.degToRad(180);
          sunPos.setFromSphericalCoords(1, phi, theta);
          sky.material.uniforms.sunPosition.value.copy(sunPos);
          scene.add(sky);

          // HDRI environment map
          new RGBELoader().setPath('/').load('venice_sunset_1k.hdr', (hdr) => {
            const pmrem = new PMREMGenerator(gl);
            const envMap = pmrem.fromEquirectangular(hdr).texture;
            scene.environment = envMap;
            // apply uniform envMapIntensity to all meshes
            scene.traverse((child) => {
              if ((child as any).isMesh) {
                (child as any).material.envMapIntensity = 0.5;
              }
            });
            hdr.dispose();
            pmrem.dispose();
          });

          // Lights: Hemisphere and Sun directional
          const hemi = new HemisphereLight(0xffffff, 0x222233, 0.05);
          scene.add(hemi);
          const sun = new DirectionalLight(0xffffff, 1.2);
          sun.position.set(20, 30, -10);
          sun.castShadow = true;
          sun.shadow.mapSize.set(2048, 2048);
          sun.shadow.normalBias = 0.005;
          scene.add(sun);
        }}
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
            <DnaLabMachineMini
              ref={dnaLabRef}
              mode={mode}
              initialParams={dnaParams ? {
                position: Array.isArray(dnaParams.position) && dnaParams.position.length === 3
                  ? dnaParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(dnaParams.scale) && dnaParams.scale.length === 3
                  ? dnaParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setDnaParams({ position: pos, scale: scl })}
            />
            <HumanDnaMini
              ref={humanDnaRef}
              mode={mode}
              initialParams={humanDnaParams ? {
                position: Array.isArray(humanDnaParams.position) && humanDnaParams.position.length === 3
                  ? humanDnaParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(humanDnaParams.scale) && humanDnaParams.scale.length === 3
                  ? humanDnaParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setHumanDnaParams({ position: pos, scale: scl })}
            />
            <HivVirusSectionedMini
              ref={hivRef}
              mode={mode}
              initialParams={hivParams ? {
                position: Array.isArray(hivParams.position) && hivParams.position.length === 3
                  ? hivParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(hivParams.scale) && hivParams.scale.length === 3
                  ? hivParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setHivParams({ position: pos, scale: scl })}
            />
            <LaparoscopicTrocarMini
              ref={trocarRef}
              mode={mode}
              initialParams={trocarParams ? {
                position: Array.isArray(trocarParams.position) && trocarParams.position.length === 3
                  ? trocarParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(trocarParams.scale) && trocarParams.scale.length === 3
                  ? trocarParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setTrocarParams({ position: pos, scale: scl })}
            />
            <MedicalMonitorMini
              ref={monitorRef}
              mode={mode}
              initialParams={monitorParams ? {
                position: Array.isArray(monitorParams.position) && monitorParams.position.length === 3
                  ? monitorParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(monitorParams.scale) && monitorParams.scale.length === 3
                  ? monitorParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setMonitorParams({ position: pos, scale: scl })}
            />
            <MedicalSyringeMini
              ref={syringeRef}
              mode={mode}
              initialParams={syringeParams ? {
                position: Array.isArray(syringeParams.position) && syringeParams.position.length === 3
                  ? syringeParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(syringeParams.scale) && syringeParams.scale.length === 3
                  ? syringeParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setSyringeParams({ position: pos, scale: scl })}
            />
            <SciFiMriMini
              ref={mriRef}
              mode={mode}
              initialParams={mriParams ? {
                position: Array.isArray(mriParams.position) && mriParams.position.length === 3
                  ? mriParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(mriParams.scale) && mriParams.scale.length === 3
                  ? mriParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setMriParams({ position: pos, scale: scl })}
            />
            <SphygmomanometerMini
              ref={sphygRef}
              mode={mode}
              initialParams={sphygParams ? {
                position: Array.isArray(sphygParams.position) && sphygParams.position.length === 3
                  ? sphygParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(sphygParams.scale) && sphygParams.scale.length === 3
                  ? sphygParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setSphygParams({ position: pos, scale: scl })}
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
