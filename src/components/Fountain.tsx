/** @jsxImportSource react */
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useGLTF, useAnimations, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

// Preload the fountain model
useGLTF.preload('/fountain_water_simulation.glb');

// Use a less strict type for GLTF result to avoid casting issues
type AnyGLTF = GLTF & { [key: string]: any };

interface FountainProps {
  mode: 'translate' | 'scale';
  isUIVisible: boolean;
  initialParams?: { position: [number, number, number]; scale: [number, number, number] };
  onUpdate: (position: number[], scale: number[]) => void;
}

const Fountain = forwardRef<THREE.Group, FountainProps>(({ 
  mode, 
  isUIVisible, 
  initialParams, 
  onUpdate 
}, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  useImperativeHandle(ref, () => groupRef.current);
  const [ready, setReady] = useState(false);

  const { scene, animations } = useGLTF('/fountain_water_simulation.glb') as AnyGLTF;
  const { actions } = useAnimations(animations, groupRef);

  const sceneRef = useRef<THREE.Group | null>(null);
  if (!sceneRef.current && scene) {
    sceneRef.current = scene.clone();
  }

  useEffect(() => {
    if (initialParams && groupRef.current) {
      groupRef.current.position.fromArray(initialParams.position);
      groupRef.current.scale.fromArray(initialParams.scale);
    }
    if (groupRef.current) setReady(true);
  }, [initialParams]);

  useEffect(() => {
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
  }, []);

  return (
    <>
      <group ref={groupRef} name="Fountain_Group" dispose={null}>
        {sceneRef.current && <primitive object={sceneRef.current} />}
        <pointLight color="#ffd8a6" intensity={1} distance={10} position={[0, 4, 0]} castShadow={false} />
      </group>
      {ready && groupRef.current && isUIVisible && (
        <TransformControls
          object={groupRef.current}
          mode={mode}
          onMouseUp={() => onUpdate(groupRef.current.position.toArray(), groupRef.current.scale.toArray())}
          onChange={() => onUpdate(groupRef.current.position.toArray(), groupRef.current.scale.toArray())}
        />
      )}
    </>
  );
});

export default Fountain;
