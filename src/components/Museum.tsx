/** @jsxImportSource react */
import React from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import * as THREE from 'three';
import Fountain from './Fountain'; // Import the Fountain component

// Preload the museum model for performance
useGLTF.preload('/the_mardou_museum.glb');

type GLTFResult = GLTF & { scene: THREE.Group };

interface MuseumProps {
  children?: React.ReactNode;
}

// Museum component loads and displays the main museum model
export default function Museum({ children }: MuseumProps) {
  const { scene } = useGLTF('/the_mardou_museum.glb') as GLTFResult;

  // Load grass textures
  const [grassColorMap, grassNormalMap, grassRoughnessMap, grassAOMap] = useTexture([
    '/textures/Grass005_4K-JPG/Grass005_4K-JPG_Color.jpg',
    '/textures/Grass005_4K-JPG/Grass005_4K-JPG_NormalGL.jpg', // Use NormalGL
    '/textures/Grass005_4K-JPG/Grass005_4K-JPG_Roughness.jpg',
    '/textures/Grass005_4K-JPG/Grass005_4K-JPG_AmbientOcclusion.jpg',
  ]);

  // Load tile textures
  const [tileColorMap, tileNormalMap, tileRoughnessMap, tileAOMap] = useTexture([
    '/textures/Tiles011_4K-JPG/Tiles011_4K-JPG_Color.jpg',
    '/textures/Tiles011_4K-JPG/Tiles011_4K-JPG_NormalGL.jpg', // Use NormalGL
    '/textures/Tiles011_4K-JPG/Tiles011_4K-JPG_Roughness.jpg',
    // Assuming AO map exists, adjust filename if needed
    '/textures/Tiles011_4K-JPG/Tiles011_4K-JPG_AmbientOcclusion.jpg', 
  ]);

  // Configure grass textures
  [grassColorMap, grassNormalMap, grassRoughnessMap, grassAOMap].forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
  });

  // Configure tile textures
  [tileColorMap, tileNormalMap, tileRoughnessMap, tileAOMap].forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
  });


  return (
    <group>
      {/* Main museum model with shadows enabled */}
      <primitive object={scene} castShadow receiveShadow />

      {/* Grass Outer Plane */}
      <mesh receiveShadow position={[-18, -18, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          map={grassColorMap}
          normalMap={grassNormalMap}
          roughnessMap={grassRoughnessMap}
          aoMap={grassAOMap}
        />
      </mesh>

      {/* Tiled Walkway */}
      <mesh receiveShadow position={[0, 0.02, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial 
          map={tileColorMap}
          normalMap={tileNormalMap}
          roughnessMap={tileRoughnessMap}
          aoMap={tileAOMap}
          roughness={0.25} // Apply specific roughness value as requested
        />
      </mesh>

      {/* Add the Fountain component */}
      {/* Position it centered on the grass plane's world coordinates */}
      {/* The Fountain component handles its base height (y=0.02) and initial scaling internally */}
      <Fountain position={[-18, 0, -50]} /> 
      {/* Note: The Fountain component internally adjusts its Y position based on its bounding box min.y + 0.02 */}
      {/* So we provide the target XZ center and let the component handle the Y offset. */}

      {/* Empty group acting as showroom pedestal at floor level, 2m inside entrance */}
      <group name="Showroom01_Pedestal" position={[0, 0, -2]}>  
        {children}
      </group>
    </group>
  );
}
