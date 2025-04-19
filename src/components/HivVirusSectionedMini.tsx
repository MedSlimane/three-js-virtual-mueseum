/** @jsxImportSource react */
import React, { useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useGLTF, TransformControls } from '@react-three/drei';
import { Box3, Vector3, Group } from 'three';
import { useFrame } from '@react-three/fiber'; // Import useFrame
import type { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & { scene: Group };

// Preload the HIV virus model for performance
useGLTF.preload('/human_immunodeficiency_virus_sectioned.glb');

interface HivVirusSectionedMiniProps {
  mode: 'translate' | 'scale';
  initialParams?: { position: [number, number, number]; scale: [number, number, number] };
  onUpdate: (position: number[], scale: number[]) => void;
}

const HivVirusSectionedMini = forwardRef<Group, HivVirusSectionedMiniProps>((
  { mode, initialParams, onUpdate }, ref
) => {
  const { scene } = useGLTF('/human_immunodeficiency_virus_sectioned.glb') as GLTFResult;
  const groupRef = useRef<Group>(null!);
  useImperativeHandle(ref, () => groupRef.current);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialParams && groupRef.current) {
      const [x, y, z] = initialParams.position;
      const [sx, sy, sz] = initialParams.scale;
      groupRef.current.position.set(x, y, z);
      groupRef.current.scale.set(sx, sy, sz);
    }
    if (groupRef.current) setReady(true);
  }, [initialParams]);

  const { scale, center, minY } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;
    const center = box.getCenter(new Vector3());
    const minY = box.min.y;
    return { scale, center, minY };
  }, [scene]);

  // Add subtle rotation animation
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1; // Adjust speed as needed
    }
  });

  return (
    <>
      <group
        ref={groupRef}
        name="HivVirusSectioned_Miniature"
        scale={[scale, scale, scale]}
        position={[-2, 0.01, 0]}
      >
        <primitive object={scene} position={[-center.x, -minY, -center.z]} castShadow receiveShadow />
      </group>
      {ready && groupRef.current && (
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

export default HivVirusSectionedMini;
