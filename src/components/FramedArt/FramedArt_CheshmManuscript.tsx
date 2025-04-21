import React, { useRef, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, Vector3, DoubleSide, Group } from 'three';

// No GLTF needed

export interface FramedArtProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number]; // Add rotation prop
}

// Base width for the picture plane before scaling
const BASE_PICTURE_WIDTH = 1.0;

const FramedArt_CheshmManuscript: React.FC<FramedArtProps> = ({ position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }) => {
  const group = useRef<Group>(null!);
  const finalScale = useMemo(() => new Vector3(...scale), [scale]);
  const finalRotation = useMemo(() => rotation, [rotation]); // Use rotation prop

  // Only load the texture
  const texture = useLoader(TextureLoader, '/pictures/Cheshm_manuscript.jpg');

  // Calculate plane dimensions based on texture aspect ratio
  const { planeWidth, planeHeight } = useMemo(() => {
    if (!texture || !texture.image) {
      return { planeWidth: 0, planeHeight: 0 };
    }
    const aspect = texture.image.width / texture.image.height;
    const h = BASE_PICTURE_WIDTH / aspect;
    return { planeWidth: BASE_PICTURE_WIDTH, planeHeight: h };
  }, [texture]);

  return (
    // Group controls position, scale, and rotation of the picture plane
    <group ref={group} position={position} scale={finalScale} rotation={finalRotation} dispose={null}>
      {/* Render the picture plane if dimensions are valid */}
      {planeWidth > 0 && planeHeight > 0 && (
        <mesh>
          <planeGeometry args={[planeWidth, planeHeight]} />
          <meshStandardMaterial
            map={texture}
            side={DoubleSide} // Render both sides
            transparent={false}
          />
        </mesh>
      )}
    </group>
  );
};

export { FramedArt_CheshmManuscript };
