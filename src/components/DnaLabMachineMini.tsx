/** @jsxImportSource react */
import React, { useMemo, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useGLTF, TransformControls } from '@react-three/drei';
import { Box3, Vector3, Group } from 'three';
import type { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & { scene: Group };

// Preload the DNA lab machine model for performance
useGLTF.preload('/dna_lab_machine.glb');

interface DnaLabMachineMiniProps {
  mode: 'translate' | 'scale';
  initialParams?: { position: [number, number, number]; scale: [number, number, number] };
  onUpdate: (position: number[], scale: number[]) => void;
}

const DnaLabMachineMini = forwardRef<Group, DnaLabMachineMiniProps>(({ mode, initialParams, onUpdate }, ref) => {
  const { scene } = useGLTF('/dna_lab_machine.glb') as GLTFResult;
  const groupRef = useRef<Group>(null!);
  useImperativeHandle(ref, () => groupRef.current);
  const [groupReady, setGroupReady] = useState(false);

  useEffect(() => {
    if (initialParams && groupRef.current) {
      const [x, y, z] = initialParams.position;
      const [sx, sy, sz] = initialParams.scale;
      groupRef.current.position.set(x, y, z);
      groupRef.current.scale.set(sx, sy, sz);
    }
    if (groupRef.current) setGroupReady(true);
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

  return (
    <>
      <group
        ref={groupRef}
        name="DnaLabMachine_Miniature"
        scale={[scale, scale, scale]}
        position={[0, 0.01, 2]} // Adjust position as needed
      >
        <primitive
          object={scene}
          position={[-center.x, -minY, -center.z]}
          castShadow
          receiveShadow
        />
      </group>

      {groupReady && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={mode}
          onMouseUp={() => {
            if (groupRef.current) {
              const pos = groupRef.current.position.toArray();
              const scl = groupRef.current.scale.toArray();
              onUpdate(pos, scl);
            }
          }}
          onChange={() => {
            if (groupRef.current) {
              const pos = groupRef.current.position.toArray();
              const scl = groupRef.current.scale.toArray();
              onUpdate(pos, scl);
            }
          }}
        />
      )}
    </>
  );
});

export default DnaLabMachineMini;
