/** @jsxImportSource react */
import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import type { Group } from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
import CoordinatesMenu, { type CoordinatesMenuProps } from './CoordinatesMenu';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { ACESFilmicToneMapping, PMREMGenerator, HemisphereLight, DirectionalLight, Vector3, MathUtils, Color } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'; // Import type for OrbitControls ref

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
  // Storage Keys
  const dnaStorageKey = 'dna-lab-machine-mini-params';
  const humanDnaStorageKey = 'human-dna-mini-params';
  const storageKey = 'museum-mini-params';
  const hivStorageKey = 'hiv-virus-mini-params';
  const trocarStorageKey = 'laparoscopic-trocar-mini-params';
  const monitorStorageKey = 'medical-monitor-mini-params';
  const syringeStorageKey = 'medical-syringe-mini-params';
  const mriStorageKey = 'sci-fi-mri-mini-params';
  const sphygStorageKey = 'sphygmomanometer-mini-params';
  const playerPositionStorageKey = 'player-position';
  const lightingStorageKey = 'museum-lighting-settings'; // New key for lighting

  // --- Load persisted params ---
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
  const savedPlayerPos = localStorage.getItem(playerPositionStorageKey);
  const initialPlayerPosition = savedPlayerPos 
    ? new Vector3(...JSON.parse(savedPlayerPos) as [number, number, number]) 
    : new Vector3(12, 8, 12); // Default position if not saved

  // Load lighting settings
  const savedLighting = localStorage.getItem(lightingStorageKey);
  const initialLighting = savedLighting 
    ? JSON.parse(savedLighting) as { ambientIntensity: number; directionalIntensity: number; lightWarmth: number } 
    : { ambientIntensity: 0.5, directionalIntensity: 1.5, lightWarmth: 1.0 }; // Default lighting

  // --- State Declarations ---
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
  const previousControlModeRef = useRef(controlMode); // Ref to track previous control mode
  const orbitControlsRef = useRef<OrbitControlsImpl>(null!); // Ref for OrbitControls
  const [description, setDescription] = useState<string>('');
  // Initialize lighting state from loaded/default values
  const [ambientIntensity, setAmbientIntensity] = useState(initialLighting.ambientIntensity);
  const [directionalIntensity, setDirectionalIntensity] = useState(initialLighting.directionalIntensity);
  const [lightWarmth, setLightWarmth] = useState(initialLighting.lightWarmth);
  const [playerPosition, setPlayerPosition] = useState<Vector3>(initialPlayerPosition); // Initialize with loaded or default position
  const operatingRoomRef = useRef<Group>(null!);
  const dnaLabRef = useRef<Group>(null!);
  const humanDnaRef = useRef<Group>(null!);
  const hivRef = useRef<Group>(null!);
  const trocarRef = useRef<Group>(null!);
  const monitorRef = useRef<Group>(null!);
  const syringeRef = useRef<Group>(null!);
  const mriRef = useRef<Group>(null!);
  const sphygRef = useRef<Group>(null!);

  // Mapping exhibits to descriptive texts
  const objectInfos: Record<string,string> = {
    operatingRoom: 'Operating Room: A modern surgical theater introduced in the mid-20th century that revolutionized patient care by integrating sterile techniques and advanced lighting.',
    dnaLabMachine: 'DNA Lab Machine: Early automated DNA sequencers from the late 20th century that accelerated genetic research and diagnostics.',
    humanDna: 'Human DNA Model: The double helix structure elucidated by Watson and Crick in 1953, foundational to molecular biology.',
    hivVirus: 'HIV Virus Model: Depicts the virus responsible for AIDS, first identified in the early 1980s, leading to breakthroughs in antiviral therapy.',
    laparoscopicTrocar: 'Laparoscopic Trocar: Introduced in the 1970s, enabling minimally invasive procedures and transforming surgical practices.',
    medicalMonitor: 'Medical Monitor: Real-time patient monitoring devices that became widespread in the 1960s, improving critical care and surgical outcomes.',
    medicalSyringe: 'Medical Syringe: A standard tool since the 1850s, refined for precision drug delivery and sterilization in modern medicine.',
    sciFiMri: 'Sci-Fi MRI Model: Conceptual advanced imaging system showcasing MRI technology’s evolution since its introduction in 1977.',
    sphygmomanometer: 'Sphygmomanometer: Invented in 1896 for measuring blood pressure, fundamental to modern cardiovascular diagnostics.'
  };

  // Component to update description based on camera proximity and track player position
  function ProximityAndPositionChecker() {
    const { camera } = useThree();
    useFrame(() => {
      // Update player position state
      setPlayerPosition(camera.position.clone());

      let nearest: string | null = null;
      let minDist = Infinity;
      const refs: Record<string, React.RefObject<Group>> = {
        operatingRoom: operatingRoomRef,
        dnaLabMachine: dnaLabRef,
        humanDna: humanDnaRef,
        hivVirus: hivRef,
        laparoscopicTrocar: trocarRef,
        medicalMonitor: monitorRef,
        medicalSyringe: syringeRef,
        sciFiMri: mriRef,
        sphygmomanometer: sphygRef
      };
      for (const key in refs) {
        const ref = refs[key];
        if (ref.current) {
          const dist = camera.position.distanceTo(ref.current.position);
          // Increase proximity threshold slightly for better detection
          if (dist < 2.5 && dist < minDist) { 
            nearest = key;
            minDist = dist;
          }
        }
      }
      setDescription(nearest ? objectInfos[nearest] : '');
    });
    return null;
  }

  // --- Persist state to localStorage --- 
  useEffect(() => {
    // Save model params
    if (miniParams) localStorage.setItem(storageKey, JSON.stringify(miniParams));
    if (dnaParams) localStorage.setItem(dnaStorageKey, JSON.stringify(dnaParams));
    if (humanDnaParams) localStorage.setItem(humanDnaStorageKey, JSON.stringify(humanDnaParams));
    if (hivParams) localStorage.setItem(hivStorageKey, JSON.stringify(hivParams));
    if (trocarParams) localStorage.setItem(trocarStorageKey, JSON.stringify(trocarParams));
    if (monitorParams) localStorage.setItem(monitorStorageKey, JSON.stringify(monitorParams));
    if (syringeParams) localStorage.setItem(syringeStorageKey, JSON.stringify(syringeParams));
    if (mriParams) localStorage.setItem(mriStorageKey, JSON.stringify(mriParams));
    if (sphygParams) localStorage.setItem(sphygStorageKey, JSON.stringify(sphygParams));
    
    // Save player position
    localStorage.setItem(playerPositionStorageKey, JSON.stringify(playerPosition.toArray()));

    // Save lighting settings
    const currentLighting = { ambientIntensity, directionalIntensity, lightWarmth };
    localStorage.setItem(lightingStorageKey, JSON.stringify(currentLighting));

  }, [
    miniParams, 
    dnaParams, 
    humanDnaParams, 
    hivParams, 
    trocarParams, 
    monitorParams, 
    syringeParams, 
    mriParams, 
    sphygParams, 
    playerPosition, 
    ambientIntensity, 
    directionalIntensity, 
    lightWarmth // Add lighting state to dependencies
  ]);

  // Keyboard shortcuts: 1 → translate, 2 → scale, R → reset, F → toggle control mode
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Prevent shortcuts if typing in an input/select
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.key === '1') setMode('translate');
      if (e.key === '2') setMode('scale');
      if (e.key.toLowerCase() === 'r') {
        // Reset all params - consider adding confirmation or individual resets
        setMiniParams(undefined);
        setDnaParams(undefined);
        setHumanDnaParams(undefined);
        setHivParams(undefined);
        setTrocarParams(undefined);
        setMonitorParams(undefined);
        setSyringeParams(undefined);
        setMriParams(undefined);
        setSphygParams(undefined);
        setPlayerPosition(new Vector3(12, 8, 12)); // Reset player position state to default
        // Reset lighting state to defaults
        setAmbientIntensity(0.5);
        setDirectionalIntensity(1.5);
        setLightWarmth(1.0);

        // Optionally clear localStorage here too
        localStorage.removeItem(storageKey);
        localStorage.removeItem(dnaStorageKey);
        // ... remove other keys
        localStorage.removeItem(humanDnaStorageKey);
        localStorage.removeItem(hivStorageKey);
        localStorage.removeItem(trocarStorageKey);
        localStorage.removeItem(monitorStorageKey);
        localStorage.removeItem(syringeStorageKey);
        localStorage.removeItem(mriStorageKey);
        localStorage.removeItem(sphygStorageKey);
        localStorage.removeItem(playerPositionStorageKey); // Remove player position key
        localStorage.removeItem(lightingStorageKey); // Remove lighting key
      }
      if (e.key.toLowerCase() === 'f') {
        // Force exit pointer lock if switching from first person to orbit mode
        if (controlMode === 'firstPerson' && document.pointerLockElement) {
          document.exitPointerLock();
        }
        // Update previous mode ref *before* setting new mode
        previousControlModeRef.current = controlMode; 
        setControlMode(prev => prev === 'orbit' ? 'firstPerson' : 'orbit');
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [controlMode]); // Depend on controlMode to re-evaluate if needed

  // Effect to update OrbitControls target when switching from FirstPerson
  useEffect(() => {
    // Check if switching *to* orbit *from* firstPerson
    if (controlMode === 'orbit' && previousControlModeRef.current === 'firstPerson' && orbitControlsRef.current) {
      // Timeout to allow camera state to settle after PointerLockControls release
      setTimeout(() => {
        if (orbitControlsRef.current) {
          const camera = orbitControlsRef.current.object; // Get camera from controls
          const direction = new Vector3();
          camera.getWorldDirection(direction);
          // Calculate target point slightly in front of the camera
          const target = new Vector3().copy(camera.position).add(direction.multiplyScalar(5)); // Target 5 units in front
          
          // Update the OrbitControls target and ensure it updates
          orbitControlsRef.current.target.copy(target);
          orbitControlsRef.current.update(); 
        }
      }, 50); // Small delay (50ms) might be needed
    }
    // Update the ref *after* the effect logic runs for the current render
    // previousControlModeRef.current = controlMode; // Moved this update to the key handler for immediate reflection
  }, [controlMode]); // Run this effect when controlMode changes

  // Define base colors
  const neutralColor = useRef(new Color(0xffffff)).current;
  const coolColor = useRef(new Color(0xccccff)).current; // Bluish white
  const warmColor = useRef(new Color(0xffeedd)).current; // Orangish white
  const neutralGroundColor = useRef(new Color(0x888888)).current;
  const warmGroundColor = useRef(new Color(0x998877)).current; // Slightly warmer grey

  // Calculate light colors based on warmth using useMemo
  const finalLightColor = useMemo(() => {
    const color = new Color();
    if (lightWarmth <= 1.0) {
      color.lerpColors(coolColor, neutralColor, lightWarmth);
    } else {
      color.lerpColors(neutralColor, warmColor, lightWarmth - 1.0);
    }
    return color;
  }, [lightWarmth, coolColor, neutralColor, warmColor]);

  const finalGroundColor = useMemo(() => {
    const color = new Color();
    color.lerpColors(neutralGroundColor, warmGroundColor, lightWarmth / 2.0);
    return color;
  }, [lightWarmth, neutralGroundColor, warmGroundColor]);

  // Calculate sun position using useMemo
  const sunPosition = useMemo(() => {
    const pos = new Vector3();
    const phi = MathUtils.degToRad(90 - 15); // 15 degrees elevation
    const theta = MathUtils.degToRad(180); // From the back
    pos.setFromSphericalCoords(1, phi, theta);
    return pos;
  }, []);

  // Calculate directional light position based on sun position
  const directionalLightPosition = useMemo(() => {
    return sunPosition.clone().multiplyScalar(50); // Position light source far away
  }, [sunPosition]);

  // Function to update player position from imported settings
  const updatePlayerPositionFromImport = (newPositionArray: [number, number, number]) => {
    setPlayerPosition(new Vector3(...newPositionArray));
    // Optionally, force camera update if needed, though state change should trigger re-render
    // if (orbitControlsRef.current) {
    //   orbitControlsRef.current.object.position.set(...newPositionArray);
    //   orbitControlsRef.current.update();
    // }
  };

  return (
    <React.Fragment>
      <Controls 
        debug={debug} 
        setDebug={setDebug} 
        controlMode={controlMode} 
        setControlMode={setControlMode} 
      />
      
      <InfoPanel text={description || 'Approach an exhibit to learn more.'} />
      
      <CoordinatesMenu
        objects={{
          operatingRoom: miniParams || { position: [0, 0, 0], scale: [1, 1, 1] },
          dnaLabMachine: dnaParams || { position: [0, 0, 2], scale: [1, 1, 1] },
          humanDna: humanDnaParams || { position: [2, 0, 0], scale: [1, 1, 1] },
          hivVirus: hivParams || { position: [-2, 0, 0], scale: [1, 1, 1] },
          laparoscopicTrocar: trocarParams || { position: [2, 0, 2], scale: [1, 1, 1] },
          medicalMonitor: monitorParams || { position: [-2, 0, 2], scale: [1, 1, 1] },
          medicalSyringe: syringeParams || { position: [0, 0, -2], scale: [1, 1, 1] },
          sciFiMri: mriParams || { position: [-2, 0, -2], scale: [1, 1, 1] },
          sphygmomanometer: sphygParams || { position: [2, 0, -2], scale: [1, 1, 1] }
        }}
        onUpdate={{
          operatingRoom: (pos: number[], scl: number[]) => setMiniParams({ position: pos, scale: scl }),
          dnaLabMachine: (pos: number[], scl: number[]) => setDnaParams({ position: pos, scale: scl }),
          humanDna: (pos: number[], scl: number[]) => setHumanDnaParams({ position: pos, scale: scl }),
          hivVirus: (pos: number[], scl: number[]) => setHivParams({ position: pos, scale: scl }),
          laparoscopicTrocar: (pos: number[], scl: number[]) => setTrocarParams({ position: pos, scale: scl }),
          medicalMonitor: (pos: number[], scl: number[]) => setMonitorParams({ position: pos, scale: scl }),
          medicalSyringe: (pos: number[], scl: number[]) => setSyringeParams({ position: pos, scale: scl }),
          sciFiMri: (pos: number[], scl: number[]) => setMriParams({ position: pos, scale: scl }),
          sphygmomanometer: (pos: number[], scl: number[]) => setSphygParams({ position: pos, scale: scl })
        }}
        lighting={{
          ambientIntensity,
          directionalIntensity,
          lightWarmth // Pass warmth state
        }}
        onLightingUpdate={{
          setAmbientIntensity,
          setDirectionalIntensity,
          setLightWarmth // Pass warmth setter
        }}
        playerPosition={playerPosition} // Pass player position
        onPlayerPositionUpdate={updatePlayerPositionFromImport} // Pass the update function
      />
      
      <Canvas
        shadows
        camera={{ position: playerPosition.toArray() as [number, number, number], fov: 75 }} 
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl, scene }) => {
          // Renderer tone mapping and exposure
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0; // Slightly increased exposure for balance

          // Sky dome setup
          const sky = new Sky();
          sky.scale.setScalar(450000);
          sky.material.uniforms.turbidity.value = 8; // Slightly less turbidity
          sky.material.uniforms.rayleigh.value = 1.5; // Adjusted Rayleigh scattering
          sky.material.uniforms.mieCoefficient.value = 0.004; // Adjusted Mie coefficient
          sky.material.uniforms.mieDirectionalG.value = 0.7; // Adjusted Mie directional G
          const sunPos = new Vector3();
          // Position the sun lower in the sky for a softer look (e.g., 15 degrees elevation)
          const phi = MathUtils.degToRad(90 - 15); 
          const theta = MathUtils.degToRad(180); // Keep sun direction generally from the back
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
                // Reduce env map influence slightly for less artificial fill light
                (child as any).material.envMapIntensity = 0.5; 
              }
            });
            hdr.dispose();
            pmrem.dispose();
          });

          // NO manual light creation here anymore
        }}
      >
        {/* Display stats when debug mode is active */}
        {debug && <Stats />}
        
        {/* Overlay showing current shortcuts */}
        <Html fullscreen className="help">
          <div className="shortcuts-overlay">
            Shortcuts: [1] Translate | [2] Scale | [R] Reset | [F] Toggle Controls | [M] Toggle Menu
          </div>
        </Html>

        {/* Proximity-based exhibit descriptions and player position tracking */}
        <ProximityAndPositionChecker />

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
            // Add ref to OrbitControls
            <OrbitControls ref={orbitControlsRef} makeDefault /> 
          ) : (
            <FirstPersonControls speed={5} />
          )}
          
          {debug && <axesHelper args={[5]} />}
        </Suspense>

        {/* Declarative Lighting Setup - Use state variables and calculated colors/positions */}
        <hemisphereLight 
          color={finalLightColor} 
          groundColor={finalGroundColor} 
          intensity={ambientIntensity} // Controlled by state
        />
        <directionalLight
          castShadow
          color={finalLightColor} // Controlled by calculated color
          intensity={directionalIntensity} // Controlled by state
          position={directionalLightPosition} // Controlled by calculated position
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={500}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-normalBias={0.02}
        />
      </Canvas>
    </React.Fragment>
  );
};

export default MuseumCanvas;
