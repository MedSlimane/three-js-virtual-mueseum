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
import Fountain from './Fountain'; // Import Fountain
import Controls from './Controls';
import FirstPersonControls from './FirstPersonControls';
import InfoPanel, { type InfoPanelProps } from './InfoPanel'; // Import type
import CoordinatesMenu, { type CoordinatesMenuProps } from './CoordinatesMenu';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { ACESFilmicToneMapping, PMREMGenerator, HemisphereLight, DirectionalLight, Vector3, MathUtils, Color } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'; // Import type for OrbitControls ref
import { FramedArt_Zahrawi1 } from './FramedArt/FramedArt_Zahrawi1';
import { FramedArt_CheshmManuscript } from './FramedArt/FramedArt_CheshmManuscript';
import { FramedArt_800pxMedizinKlimt } from './FramedArt/FramedArt_800pxMedizinKlimt'; // Direct import

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

// Define state types for object parameters
interface ObjectParamsState {
  position: [number, number, number];
  scale: [number, number, number];
}

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
  const fountainStorageKey = 'fountain-params'; // Add storage key for fountain
  const uiVisibilityStorageKey = 'ui-visibility'; // Key for UI visibility state

  // --- Load persisted params ---
  // Load persisted params
  const saved = localStorage.getItem(storageKey);
  const parsed = saved ? JSON.parse(saved) as ObjectParamsState : undefined;
  const savedDna = localStorage.getItem(dnaStorageKey);
  const parsedDna = savedDna ? JSON.parse(savedDna) as ObjectParamsState : undefined;
  const savedHuman = localStorage.getItem(humanDnaStorageKey);
  const parsedHuman = savedHuman ? JSON.parse(savedHuman) as ObjectParamsState : undefined;
  const savedHiv = localStorage.getItem(hivStorageKey);
  const parsedHiv = savedHiv ? JSON.parse(savedHiv) as ObjectParamsState : undefined;
  const savedTrocar = localStorage.getItem(trocarStorageKey);
  const parsedTrocar = savedTrocar ? JSON.parse(savedTrocar) as ObjectParamsState : undefined;
  const savedMonitor = localStorage.getItem(monitorStorageKey);
  const parsedMonitor = savedMonitor ? JSON.parse(savedMonitor) as ObjectParamsState : undefined;
  const savedSyringe = localStorage.getItem(syringeStorageKey);
  const parsedSyringe = savedSyringe ? JSON.parse(savedSyringe) as ObjectParamsState : undefined;
  const savedMri = localStorage.getItem(mriStorageKey);
  const parsedMri = savedMri ? JSON.parse(savedMri) as ObjectParamsState : undefined;
  const savedSphyg = localStorage.getItem(sphygStorageKey);
  const parsedSphyg = savedSphyg ? JSON.parse(savedSphyg) as ObjectParamsState : undefined;
  const savedFountain = localStorage.getItem(fountainStorageKey); // Load fountain params
  const parsedFountain = savedFountain ? JSON.parse(savedFountain) as ObjectParamsState : { position: [0, 0, 5] as [number, number, number], scale: [0.02, 0.02, 0.02] as [number, number, number] };
  // FramedArt params from localStorage or defaults
  const storedZahrawi1 = localStorage.getItem('framed-zahrawi1-params');
  const parsedZahrawi1 = storedZahrawi1 ? JSON.parse(storedZahrawi1) as ObjectParamsState : { position: [0, 1, -3] as [number, number, number], scale: [1, 1, 1] as [number, number, number] };
  const storedCheshmManuscript = localStorage.getItem('framed-cheshm-manuscript-params');
  const parsedCheshmManuscript = storedCheshmManuscript ? JSON.parse(storedCheshmManuscript) as ObjectParamsState : { position: [2, 1, -3] as [number, number, number], scale: [1, 1, 1] as [number, number, number] };
  const storedMedizinKlimt = localStorage.getItem('framed-medizin-klimt-params');
  const parsedMedizinKlimt = storedMedizinKlimt ? JSON.parse(storedMedizinKlimt) as ObjectParamsState : { position: [-2, 1, -3] as [number, number, number], scale: [1, 1, 1] as [number, number, number] };

  const savedPlayerPos = localStorage.getItem(playerPositionStorageKey);
  const initialPlayerPosition = savedPlayerPos 
    ? new Vector3(...JSON.parse(savedPlayerPos) as [number, number, number]) 
    : new Vector3(12, 8, 12); // Default position if not saved

  // Load lighting settings
  const savedLighting = localStorage.getItem(lightingStorageKey);
  const initialLighting = savedLighting 
    ? JSON.parse(savedLighting) as { ambientIntensity: number; directionalIntensity: number; lightWarmth: number } 
    : { ambientIntensity: 0.5, directionalIntensity: 1.5, lightWarmth: 1.0 }; // Default lighting

  const savedUIVisibility = localStorage.getItem(uiVisibilityStorageKey);
  const initialUIVisibility = savedUIVisibility ? JSON.parse(savedUIVisibility) as boolean : true; // Default to true

  // --- State Declarations ---
  const [mode, setMode] = useState<'translate' | 'scale'>('translate');
  const [miniParams, setMiniParams] = useState<ObjectParamsState | undefined>(parsed);
  const [dnaParams, setDnaParams] = useState<ObjectParamsState | undefined>(parsedDna);
  const [humanDnaParams, setHumanDnaParams] = useState<ObjectParamsState | undefined>(parsedHuman);
  const [hivParams, setHivParams] = useState<ObjectParamsState | undefined>(parsedHiv);
  const [trocarParams, setTrocarParams] = useState<ObjectParamsState | undefined>(parsedTrocar);
  const [monitorParams, setMonitorParams] = useState<ObjectParamsState | undefined>(parsedMonitor);
  const [syringeParams, setSyringeParams] = useState<ObjectParamsState | undefined>(parsedSyringe);
  const [mriParams, setMriParams] = useState<ObjectParamsState | undefined>(parsedMri);
  const [sphygParams, setSphygParams] = useState<ObjectParamsState | undefined>(parsedSphyg);
  const [fountainParams, setFountainParams] = useState<ObjectParamsState | null>(parsedFountain);
  const [zahrawi1Params, setZahrawi1Params] = useState<ObjectParamsState>(parsedZahrawi1);
  const [cheshmManuscriptParams, setCheshmManuscriptParams] = useState<ObjectParamsState>(parsedCheshmManuscript);
  const [medizinKlimtParams, setMedizinKlimtParams] = useState<ObjectParamsState>(parsedMedizinKlimt);
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
  const [isUIVisible, setIsUIVisible] = useState<boolean>(initialUIVisibility); // UI Visibility state
  const [areFramedArtVisible, setAreFramedArtVisible] = useState<boolean>(true); // State for framed art visibility
  const [isInfoPanelVisible, setIsInfoPanelVisible] = useState<boolean>(true); // State for InfoPanel visibility
  const operatingRoomRef = useRef<Group>(null!);
  const dnaLabRef = useRef<Group>(null!);
  const humanDnaRef = useRef<Group>(null!);
  const hivRef = useRef<Group>(null!);
  const trocarRef = useRef<Group>(null!);
  const monitorRef = useRef<Group>(null!);
  const syringeRef = useRef<Group>(null!);
  const mriRef = useRef<Group>(null!);
  const sphygRef = useRef<Group>(null!);
  // Refs for Framed Art
  const zahrawi1Ref = useRef<Group>(null!);
  const cheshmManuscriptRef = useRef<Group>(null!);
  const medizinKlimtRef = useRef<Group>(null!);

  // State for the info panel content (text and optional image URL)
  const [infoContent, setInfoContent] = useState<InfoPanelProps | null>(null);

  // Mapping exhibits to descriptive texts and image URLs (French)
  // Updated imageUrls based on available files in public/pictures/
  const objectInfos: Record<string, { text: string; imageUrl?: string }> = {
    operatingRoom: {
        text: 'Salle d\'opération : Un bloc opératoire moderne introduit au milieu du XXe siècle qui a révolutionné les soins aux patients en intégrant des techniques stériles et un éclairage avancé.',
        imageUrl: '/pictures/oproom.png' // Added path
    },
    dnaLabMachine: {
        text: 'Machine de laboratoire ADN : Les premiers séquenceurs d\'ADN automatisés de la fin du XXe siècle qui ont accéléré la recherche génétique et les diagnostics.',
        imageUrl: '/pictures/dnalabmachine.png' // Added path
     },
    humanDna: {
      text: 'Modèle d\'ADN humain : La structure en double hélice élucidée par Watson et Crick en 1953, fondamentale pour la biologie moléculaire.',
      imageUrl: '/pictures/humandna.png' // Updated path
     }, // No image requested
    hivVirus: {
        text: 'Modèle du virus VIH : Représente le virus responsable du SIDA, identifié pour la première fois au début des années 1980, conduisant à des avancées dans la thérapie antivirale.',
        imageUrl: '/pictures/hivvirus.png' // Updated path
    },
    laparoscopicTrocar: {
        text: 'Trocart laparoscopique : Introduit dans les années 1970, permettant des procédures minimalement invasives et transformant les pratiques chirurgicales.',
        imageUrl: '/pictures/laproscopic.png' // Updated path
    },
    medicalMonitor: {
        text: 'Moniteur médical : Dispositifs de surveillance des patients en temps réel devenus courants dans les années 1960, améliorant les soins intensifs et les résultats chirurgicaux.',
        imageUrl: '/pictures/medicalmonitor.png' // Updated path
    },
    medicalSyringe: {
        text: 'Seringue médicale : Un outil standard depuis les années 1850, perfectionné pour l\'administration précise de médicaments et la stérilisation en médecine moderne.',
        imageUrl: '/pictures/medical syringe.png' // Updated path
    },
    sciFiMri: {
      text: 'Modèle IRM : Système d\'imagerie par résonance magnétique utilisé en médecine depuis 1977 pour visualiser les tissus internes du corps humain.',
      imageUrl: '/pictures/iRM.png' // Updated path
    },
    sphygmomanometer: { 
        text: 'Sphygmomanomètre : Inventé en 1896 pour mesurer la pression artérielle, fondamental pour les diagnostics cardiovasculaires modernes.',
        imageUrl: '/pictures/sphygmomanometre.png' // Added path
    },
    // Keep existing framed art info (text only in info panel)
    zahrawi1: { 
        text: 'Al-Zahrawi, père de la chirurgie moderne. Cette illustration montre certains de ses instruments chirurgicaux.',
        imageUrl: '/pictures/Zahrawi1.png' // Added path
    },
    cheshmManuscript: { 
        text: 'Un manuscrit sur l\\\'anatomie de l\\\'œil par Hunayn ibn Ishaq, tiré de son livre, Questions sur l\\\'œil, conservé à la Bibliothèque nationale du Caire et daté d\\\'environ 1200 après JC.',
        imageUrl: '/pictures/Cheshm_manuscript.jpg' // Added path
    },
    medizinKlimt: { 
        text: 'Les Peintures des Facultés, Fakultätsbilder en allemand, réalisées par Gustav Klimt et destinées à orner le plafond du grand hall de l\\\'Université de Vienne sont un ensemble de trois œuvres monumentales réalisées par l\\\'artiste autrichien entre 1894 et 1907. Sous forme d\\\'allégories, ces toiles représentent La Philosophie, La Médecine et La Jurisprudence.',
        imageUrl: '/pictures/800px-Medizin_Klimt.jpg' // Added path
    }
  };

interface ProximityAndPositionCheckerProps {
  isInfoPanelVisible: boolean;
  toggleInfoPanel: () => void;
}

// Component to update description based on camera proximity and track player position
function ProximityAndPositionChecker({ isInfoPanelVisible, toggleInfoPanel }: ProximityAndPositionCheckerProps) {
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
      sphygmomanometer: sphygRef,
      zahrawi1: zahrawi1Ref, // Add ref
      cheshmManuscript: cheshmManuscriptRef, // Add ref
      medizinKlimt: medizinKlimtRef // Add ref
    };
    for (const key in refs) {
      const ref = refs[key];
      if (ref.current) {
        const dist = camera.position.distanceTo(ref.current.position);
        // Increase proximity threshold slightly for better detection
        if (dist < 4.0 && dist < minDist) { // Increased threshold from 2.5 to 4.0
          nearest = key;
          minDist = dist;
        }
      }
    }
    // Set the info content based on the nearest object, including visibility and toggle handler
    setInfoContent(nearest ? { 
      ...objectInfos[nearest], 
      isVisible: isInfoPanelVisible, 
      onToggle: toggleInfoPanel 
    } : null);
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
    if (fountainParams) localStorage.setItem(fountainStorageKey, JSON.stringify(fountainParams));
    if (zahrawi1Params) localStorage.setItem('framed-zahrawi1-params', JSON.stringify(zahrawi1Params));
    if (cheshmManuscriptParams) localStorage.setItem('framed-cheshm-manuscript-params', JSON.stringify(cheshmManuscriptParams));
    if (medizinKlimtParams) localStorage.setItem('framed-medizin-klimt-params', JSON.stringify(medizinKlimtParams));
    
    // Save player position
    localStorage.setItem(playerPositionStorageKey, JSON.stringify(playerPosition.toArray()));

    // Save lighting settings
    const currentLighting = { ambientIntensity, directionalIntensity, lightWarmth };
    localStorage.setItem(lightingStorageKey, JSON.stringify(currentLighting));

    // Save UI visibility state
    localStorage.setItem(uiVisibilityStorageKey, JSON.stringify(isUIVisible));

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
    fountainParams, 
    zahrawi1Params, 
    cheshmManuscriptParams, 
    medizinKlimtParams,
    playerPosition, 
    ambientIntensity, 
    directionalIntensity, 
    lightWarmth,
    isUIVisible // Add isUIVisible to dependency array
  ]);

  // Function to toggle framed art visibility
  const toggleFramedArt = () => {
    setAreFramedArtVisible(prev => !prev);
  };

  // Function to toggle InfoPanel visibility
  const toggleInfoPanel = () => {
    setIsInfoPanelVisible(prev => !prev);
  };

  // Keyboard shortcuts: 1 → translate, 2 → scale, R → reset, F → toggle control mode, H -> toggle UI, ; -> toggle Pictures/Paintings, I -> toggle Info Panel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Prevent shortcuts if typing in an input/select
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) {
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
        setFountainParams({ position: [0, 0, 5], scale: [0.02, 0.02, 0.02] }); // Reset fountain to default
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
        localStorage.removeItem(fountainStorageKey); // Remove fountain key
        localStorage.removeItem(playerPositionStorageKey); // Remove player position key
        localStorage.removeItem(lightingStorageKey); // Remove lighting key
        localStorage.removeItem(uiVisibilityStorageKey); // Remove UI visibility key
        setIsUIVisible(true); // Reset UI visibility state
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
      if (e.key.toLowerCase() === 'h') { // Toggle UI visibility
        setIsUIVisible(prev => !prev);
      }
      if (e.key === ';') { // Toggle Framed Art visibility
        toggleFramedArt();
      }
      if (e.key.toLowerCase() === 'i') { // Toggle Info Panel visibility
        toggleInfoPanel();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // Add toggleInfoPanel to dependencies
  }, [controlMode, isUIVisible, areFramedArtVisible, toggleFramedArt, toggleInfoPanel]); // Add dependencies

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
      {isUIVisible && ( // Conditionally render Controls
        <Controls
          debug={debug}
          setDebug={setDebug}
          controlMode={controlMode}
          setControlMode={setControlMode}
          isUIVisible={isUIVisible} // Pass state
          setIsUIVisible={setIsUIVisible} // Pass setter
          areFramedArtVisible={areFramedArtVisible} // Pass state
          toggleFramedArt={toggleFramedArt} // Pass handler function
        />
      )}

      {/* Render InfoPanel, passing state and toggle handler */}
      <InfoPanel 
        text={infoContent?.text || 'Approach an exhibit to learn more.'} 
        imageUrl={infoContent?.imageUrl}
        isVisible={isInfoPanelVisible} // Pass visibility state
        onToggle={toggleInfoPanel} // Pass toggle handler
      />

      {isUIVisible && ( // Conditionally render CoordinatesMenu
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
            sphygmomanometer: sphygParams || { position: [2, 0, -2], scale: [1, 1, 1] },
            fountain: fountainParams,
            zahrawi1: zahrawi1Params,
            cheshmManuscript: cheshmManuscriptParams,
            medizinKlimt: medizinKlimtParams
          }}
          onUpdate={{
            operatingRoom: (pos: number[], scl: number[]) => setMiniParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            dnaLabMachine: (pos: number[], scl: number[]) => setDnaParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            humanDna: (pos: number[], scl: number[]) => setHumanDnaParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            hivVirus: (pos: number[], scl: number[]) => setHivParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            laparoscopicTrocar: (pos: number[], scl: number[]) => setTrocarParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            medicalMonitor: (pos: number[], scl: number[]) => setMonitorParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            medicalSyringe: (pos: number[], scl: number[]) => setSyringeParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            sciFiMri: (pos: number[], scl: number[]) => setMriParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            sphygmomanometer: (pos: number[], scl: number[]) => setSphygParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            fountain: (pos: number[], scl: number[]) => setFountainParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            zahrawi1: (pos: number[], scl: number[]) => setZahrawi1Params({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            cheshmManuscript: (pos: number[], scl: number[]) => setCheshmManuscriptParams({ position: pos as [number, number, number], scale: scl as [number, number, number] }),
            medizinKlimt: (pos: number[], scl: number[]) => setMedizinKlimtParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })
          }}
          lighting={{
            ambientIntensity,
            directionalIntensity,
            lightWarmth
          }}
          onLightingUpdate={{
            setAmbientIntensity,
            setDirectionalIntensity,
            setLightWarmth
          }}
          playerPosition={playerPosition}
          onPlayerPositionUpdate={updatePlayerPositionFromImport}
        />
      )}

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

        {/* Overlay showing current shortcuts - Update description */}
        {isUIVisible && ( // Conditionally render shortcuts overlay
          <Html fullscreen className="help">
            <div className="shortcuts-overlay">
              Shortcuts: [1] Translate | [2] Scale | [R] Reset | [F] Toggle Controls | [H] Toggle UI | [;] Toggle Pictures | [I] Toggle Info | [M] Toggle Menu
            </div>
          </Html>
        )}

        {/* Proximity-based exhibit descriptions and player position tracking */}
        <ProximityAndPositionChecker 
          isInfoPanelVisible={isInfoPanelVisible} 
          toggleInfoPanel={toggleInfoPanel} 
        />

        {/* Scene content with suspense fallback */}
        <Suspense fallback={<Html center>Loading…</Html>}>
          <Museum>
            <OperatingRoomMini
              ref={operatingRoomRef}
              mode={mode}
              isUIVisible={isUIVisible} // Pass state
              initialParams={miniParams ? {
                position: Array.isArray(miniParams.position) && miniParams.position.length === 3 
                  ? miniParams.position as [number, number, number] 
                  : [0, 0, 0],
                scale: Array.isArray(miniParams.scale) && miniParams.scale.length === 3 
                  ? miniParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setMiniParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
            />
            <DnaLabMachineMini
              ref={dnaLabRef}
              mode={mode}
              isUIVisible={isUIVisible} // Pass state
              initialParams={dnaParams ? {
                position: Array.isArray(dnaParams.position) && dnaParams.position.length === 3
                  ? dnaParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(dnaParams.scale) && dnaParams.scale.length === 3
                  ? dnaParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setDnaParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
            />
            <HumanDnaMini
              ref={humanDnaRef}
              mode={mode}
              isUIVisible={isUIVisible} // Pass state
              initialParams={humanDnaParams ? {
                position: Array.isArray(humanDnaParams.position) && humanDnaParams.position.length === 3
                  ? humanDnaParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(humanDnaParams.scale) && humanDnaParams.scale.length === 3
                  ? humanDnaParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setHumanDnaParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
            />
            <HivVirusSectionedMini
              ref={hivRef}
              mode={mode}
              isUIVisible={isUIVisible} // Pass state
              initialParams={hivParams ? {
                position: Array.isArray(hivParams.position) && hivParams.position.length === 3
                  ? hivParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(hivParams.scale) && hivParams.scale.length === 3
                  ? hivParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setHivParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
            />
            <LaparoscopicTrocarMini
              ref={trocarRef}
              mode={mode}
              isUIVisible={isUIVisible} // Pass state
              initialParams={trocarParams ? {
                position: Array.isArray(trocarParams.position) && trocarParams.position.length === 3
                  ? trocarParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(trocarParams.scale) && trocarParams.scale.length === 3
                  ? trocarParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setTrocarParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
            />
            <MedicalMonitorMini
              ref={monitorRef}
              mode={mode}
              isUIVisible={isUIVisible} // Pass state
              initialParams={monitorParams ? {
                position: Array.isArray(monitorParams.position) && monitorParams.position.length === 3
                  ? monitorParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(monitorParams.scale) && monitorParams.scale.length === 3
                  ? monitorParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setMonitorParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
            />
            <MedicalSyringeMini
              ref={syringeRef}
              mode={mode}
              isUIVisible={isUIVisible} // Pass state
              initialParams={syringeParams ? {
                position: Array.isArray(syringeParams.position) && syringeParams.position.length === 3
                  ? syringeParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(syringeParams.scale) && syringeParams.scale.length === 3
                  ? syringeParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setSyringeParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
            />
            <SciFiMriMini
              ref={mriRef}
              mode={mode}
              isUIVisible={isUIVisible} // Pass state
              initialParams={mriParams ? {
                position: Array.isArray(mriParams.position) && mriParams.position.length === 3
                  ? mriParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(mriParams.scale) && mriParams.scale.length === 3
                  ? mriParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setMriParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
            />
            <SphygmomanometerMini
              ref={sphygRef}
              mode={mode}
              isUIVisible={isUIVisible} // Pass state
              initialParams={sphygParams ? {
                position: Array.isArray(sphygParams.position) && sphygParams.position.length === 3
                  ? sphygParams.position as [number, number, number]
                  : [0, 0, 0],
                scale: Array.isArray(sphygParams.scale) && sphygParams.scale.length === 3
                  ? sphygParams.scale as [number, number, number]
                  : [1, 1, 1]
              } : undefined}
              onUpdate={(pos, scl) => setSphygParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
            />
            {/* Add Fountain component */}
            {fountainParams && (
              <Fountain
                mode={mode}
                isUIVisible={isUIVisible} // Pass state
                initialParams={fountainParams}
                onUpdate={(pos, scl) => setFountainParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
              />
            )}
            {/* FramedArt exhibits */}
            {areFramedArtVisible && (
              <>
                <FramedArt_Zahrawi1
                  ref={zahrawi1Ref} // Assign ref
                  mode={mode}
                  isUIVisible={isUIVisible} // Pass state
                  initialParams={zahrawi1Params}
                  onUpdate={(pos, scl) => setZahrawi1Params({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
                />
                <FramedArt_CheshmManuscript
                  ref={cheshmManuscriptRef} // Assign ref
                  mode={mode}
                  isUIVisible={isUIVisible} // Pass state
                  initialParams={cheshmManuscriptParams}
                  onUpdate={(pos, scl) => setCheshmManuscriptParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
                />
                <FramedArt_800pxMedizinKlimt
                  ref={medizinKlimtRef} // Assign ref
                  mode={mode}
                  isUIVisible={isUIVisible} // Pass state
                  initialParams={medizinKlimtParams}
                  onUpdate={(pos, scl) => setMedizinKlimtParams({ position: pos as [number, number, number], scale: scl as [number, number, number] })}
                />
              </>
            )}
          </Museum>
          
          {controlMode === 'orbit' ? (
            // Add ref to OrbitControls
            <OrbitControls ref={orbitControlsRef} makeDefault /> 
          ) : (
            <FirstPersonControls
              speed={5}
              isUIVisible={isUIVisible}
              initialPosition={playerPosition}
              onPositionChange={(pos: Vector3) => setPlayerPosition(pos)}
            />
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
