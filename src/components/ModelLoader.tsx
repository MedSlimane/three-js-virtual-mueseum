import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
};

interface ModelLoaderProps {
  modelPath: string;
  position?: [number, number, number];
  scale?: number | [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = ({
  modelPath,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  onClick,
}) => {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(modelPath) as GLTFResult;
  
  useFrame(() => {
    if (!group.current) return;
    // Any animations can be added here
  });

  return (
    <group 
      ref={group}
      position={position}
      rotation={rotation as [number, number, number]}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      onClick={onClick}
    >
      <primitive object={scene} />
    </group>
  );
};

export default ModelLoader;

// Pre-load models to improve performance
useGLTF.preload('/charite_university_hospital_-_operating_room.glb');