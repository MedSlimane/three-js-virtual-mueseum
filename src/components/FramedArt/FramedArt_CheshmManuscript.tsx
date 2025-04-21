import React, { useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, Vector3, DoubleSide, Group, MathUtils } from 'three';
import { TransformControls } from '@react-three/drei';

export interface FramedArtProps {
  mode: 'translate' | 'scale';
  isUIVisible: boolean;
  initialParams?: { position: [number, number, number]; scale: [number, number, number] };
  onUpdate: (position: number[], scale: number[]) => void;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

const BASE_PICTURE_WIDTH = 1.0;

const FramedArt_CheshmManuscript = forwardRef<Group, FramedArtProps>(({ 
  mode, 
  isUIVisible, 
  initialParams, 
  onUpdate, 
  position = [0, 0, 0], 
  scale = [1, 1, 1],
  rotation = [0, 0, 0] 
}, ref) => {
  const groupRef = useRef<Group>(null!);
  useImperativeHandle(ref, () => groupRef.current);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialParams && groupRef.current) {
      groupRef.current.position.fromArray(initialParams.position);
      groupRef.current.scale.fromArray(initialParams.scale);
    } else if (groupRef.current) {
      groupRef.current.position.fromArray(position);
      groupRef.current.scale.fromArray(scale);
      groupRef.current.rotation.set(
        MathUtils.degToRad(rotation[0]),
        MathUtils.degToRad(rotation[1]),
        MathUtils.degToRad(rotation[2])
      );
    }
    if (groupRef.current) setReady(true);
  }, [initialParams, position, scale, rotation]);

  const texture = useLoader(TextureLoader, '/pictures/Cheshm_manuscript.jpg');
  const { planeWidth, planeHeight } = useMemo(() => {
    if (!texture || !texture.image) {
      return { planeWidth: 0, planeHeight: 0 };
    }
    const aspect = texture.image.width / texture.image.height;
    const h = BASE_PICTURE_WIDTH / aspect;
    return { planeWidth: BASE_PICTURE_WIDTH, planeHeight: h };
  }, [texture]);

  return (
    <>
      <group ref={groupRef} dispose={null}>
        {planeWidth > 0 && planeHeight > 0 && (
          <mesh>
            <planeGeometry args={[planeWidth, planeHeight]} />
            <meshStandardMaterial
              map={texture}
              side={DoubleSide}
              transparent={false}
            />
          </mesh>
        )}
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

export { FramedArt_CheshmManuscript };
