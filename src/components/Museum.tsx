/** @jsxImportSource react */
import React from 'react';
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import * as THREE from 'three';

// Preload the museum model for performance
useGLTF.preload('/the_mardou_museum.glb');

type GLTFResult = GLTF & { scene: THREE.Group };

interface MuseumProps {
  children?: React.ReactNode;
}

// Museum component loads and displays the main museum model
export default function Museum({ children }: MuseumProps) {
  const { scene } = useGLTF('/the_mardou_museum.glb') as GLTFResult;
  return (
    <group>
      {/* Main museum model with shadows enabled */}
      <primitive object={scene} castShadow receiveShadow />
      {/* Empty group acting as showroom pedestal at floor level, 2m inside entrance */}
      <group name="Showroom01_Pedestal" position={[0, 0, -2]}>  
        {children}
      </group>
    </group>
  );
}
