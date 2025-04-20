/** @jsxImportSource react */
import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

// Preload the fountain model
useGLTF.preload('/fountain_water_simulation.glb');

// Use a less strict type for GLTF result to avoid casting issues
type AnyGLTF = GLTF & { [key: string]: any };

interface FountainProps {
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function Fountain({ 
  position = [0, 0, 0], 
  scale = 0.02, 
  rotation = [0, 0, 0] 
}: FountainProps) {
  const group = useRef<THREE.Group>(null!); // Correct useRef initialization
  // Use simpler type casting
  const { scene, animations } = useGLTF('/fountain_water_simulation.glb') as AnyGLTF;
  const { actions } = useAnimations(animations, group);

  // Store the scene in a ref to prevent re-cloning on every render
  const sceneRef = useRef<THREE.Group | null>(null);
  if (!sceneRef.current && scene) { // Check if scene is loaded
    sceneRef.current = scene.clone(); // Clone only once
  }

  useEffect(() => {
    // Play all animations
    if (actions) {
      Object.values(actions).forEach((action) => action?.play());
    }
  }, [actions]);

  useEffect(() => {
    // Apply material adjustments and shadows to the cloned scene
    sceneRef.current?.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Adjust water material
        if (child.name.toLowerCase().includes('water')) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.transparent = true;
            child.material.opacity = 0.55;
            child.material.roughness = 0.1;
            child.material.metalness = 0;
            child.material.needsUpdate = true;
          } else {
            // Fallback for non-standard materials
            console.warn(`Water mesh ${child.name} has non-standard material: ${child.material.type}. Applying basic transparency.`);
            const basicMaterial = new THREE.MeshStandardMaterial({
              color: child.material?.color || 0xadd8e6, // Safer access to color
              transparent: true,
              opacity: 0.55,
              roughness: 0.1,
              metalness: 0,
            });
            child.material = basicMaterial;
          }
        }
      }
    });
  }, []); // Run this effect only once after mount

  // Normalize scale prop to always be a Vector3
  const finalScale = Array.isArray(scale) ? new THREE.Vector3(...scale) : new THREE.Vector3(scale, scale, scale);

  return (
    // Apply position, scale, rotation directly to the group
    <group ref={group} position={position} scale={finalScale} rotation={rotation} dispose={null}>
      {/* Render the cloned scene if it exists */}
      {sceneRef.current && <primitive object={sceneRef.current} />}
      {/* Point light relative to the fountain */}
      <pointLight color="#ffd8a6" intensity={1} distance={10} position={[0, 4, 0]} castShadow={false} />
    </group>
  );
}
