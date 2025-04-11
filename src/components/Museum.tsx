import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import ModelLoader from './ModelLoader';

interface MuseumProps {
  setInfoText: (text: string | null) => void;
}

const Museum: React.FC<MuseumProps> = ({ setInfoText }) => {
  const { camera } = useThree();
  const [activeExhibit, setActiveExhibit] = useState<string | null>(null);

  const exhibits = [
    { 
      id: 'operatingRoom', 
      name: 'Operating Room',
      description: 'This is an operating room from Charité University Hospital, featuring modern surgical equipment and technology.',
      modelPath: '/charite_university_hospital_-_operating_room.glb',
      position: [0, 0, -5], // Adjusted position to bring closer
      scale: 1,
      rotation: [0, 0, 0]
    },
    {
      id: 'museumHall',
      name: 'Museum Hall',
      description: 'The grand hall of the museum, showcasing its architectural beauty.',
      modelPath: '/the_mardou_museum.glb',
      position: [0, 0, 0], // Adjusted position to bring closer
      scale: 1.5, // Increased scale
      rotation: [0, 0, 0]
    }
  ];

  // Update the info text when active exhibit changes
  useEffect(() => {
    if (activeExhibit) {
      const exhibit = exhibits.find(e => e.id === activeExhibit);
      if (exhibit) {
        setInfoText(exhibit.description);
      }
    } else {
      setInfoText('Welcome to the Virtual Museum. Explore the exhibits by moving around.');
    }
  }, [activeExhibit, setInfoText]);

  const handleModelClick = (exhibitId: string) => {
    setActiveExhibit(exhibitId);
  };

  return (
    <>
      {/* Main lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[10, 10, 10]}
        intensity={1.5}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-10, 0, -10]} intensity={0.5} />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={60} />

      {/* Museum room model */}
      {exhibits.map(exhibit => (
        <ModelLoader
          key={exhibit.id}
          modelPath={exhibit.modelPath}
          position={exhibit.position}
          scale={exhibit.scale}
          rotation={exhibit.rotation}
          onClick={() => handleModelClick(exhibit.id)}
        />
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
    </>
  );
};

export default Museum;