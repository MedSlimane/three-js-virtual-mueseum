/** @jsxImportSource react */
import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { PointerLockControls, Html } from '@react-three/drei';

interface FirstPersonControlsProps {
  speed?: number;
  lookSpeed?: number;
}

const FirstPersonControls: React.FC<FirstPersonControlsProps> = ({ 
  speed = 5 
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  
  // Movement state
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  });
  
  const direction = useRef(new Vector3());
  const prevTime = useRef(performance.now());

  // Set starting camera position inside museum - at entrance looking in
  useEffect(() => {
    // Position at museum entrance at eye level (1.6m) and facing inside
    camera.position.set(0, 1.6, 6);
    camera.lookAt(0, 1.6, 0);
  }, [camera]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': moveState.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': moveState.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft': moveState.current.left = true; break;
        case 'KeyD': case 'ArrowRight': moveState.current.right = true; break;
        case 'Space': moveState.current.up = true; break;
        case 'ShiftLeft': case 'ShiftRight': moveState.current.down = true; break;
        case 'KeyL': // Lock/unlock camera on L key
          if (controlsRef.current) {
            if (isLocked) {
              controlsRef.current.unlock();
            } else {
              controlsRef.current.lock();
            }
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': moveState.current.forward = false; break;
        case 'KeyS': case 'ArrowDown': moveState.current.backward = false; break;
        case 'KeyA': case 'ArrowLeft': moveState.current.left = false; break;
        case 'KeyD': case 'ArrowRight': moveState.current.right = false; break;
        case 'Space': moveState.current.up = false; break;
        case 'ShiftLeft': case 'ShiftRight': moveState.current.down = false; break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isLocked]);

  // Handle movement in the frame loop
  useFrame(() => {
    if (isLocked) {
      const time = performance.now();
      const delta = (time - prevTime.current) / 1000; // seconds
      
      // Calculate movement direction
      direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward);
      direction.current.x = Number(moveState.current.right) - Number(moveState.current.left);
      direction.current.y = Number(moveState.current.up) - Number(moveState.current.down);
      direction.current.normalize();
      
      // Calculate velocity based on direction and speed
      const actualSpeed = speed * delta;
      
      // Move forward/backward (z-axis)
      if (moveState.current.forward || moveState.current.backward) {
        // Forward is negative z in three.js
        camera.translateZ(-direction.current.z * actualSpeed);
      }
      
      // Move left/right (x-axis)
      if (moveState.current.left || moveState.current.right) {
        camera.translateX(direction.current.x * actualSpeed);
      }
      
      // Move up/down (space/shift) - y-axis
      if (moveState.current.up || moveState.current.down) {
        // Only use y movement when explicitly requested (space/shift)
        camera.position.y += direction.current.y * actualSpeed;
      }
      
      // Enforce boundaries to keep the user inside the museum
      // Significantly expanded boundary values to allow full museum exploration
      const minX = -25, maxX = 25;
      const minY = 0.5, maxY = 10; // Lower minimum height to allow exploration of lower areas
      const minZ = -25, maxZ = 25; // Expanded Z range to allow movement to the back of the museum
      
      // Apply expanded boundaries
      camera.position.x = MathUtils.clamp(camera.position.x, minX, maxX);
      camera.position.y = MathUtils.clamp(camera.position.y, minY, maxY);
      camera.position.z = MathUtils.clamp(camera.position.z, minZ, maxZ);
      
      prevTime.current = time;
      
      // Debug camera position - uncomment if needed
      // console.log(`Camera position: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`);
    }
  });

  return (
    <>
      <PointerLockControls 
        ref={controlsRef} 
        camera={camera} 
        domElement={gl.domElement}
        onLock={() => setIsLocked(true)}
        onUnlock={() => setIsLocked(false)}
      />
      
      {!isLocked && (
        <Html fullscreen>
          <div className="firstperson-overlay"
            onClick={() => controlsRef.current?.lock()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 100,
              cursor: 'pointer',
              fontSize: '1.2em'
            }}
          >
            <div className="firstperson-instructions"
              style={{ 
                background: 'rgba(0,0,0,0.7)', 
                padding: '20px', 
                borderRadius: '5px', 
                textAlign: 'center' 
              }}
            >
              Click to enable first-person navigation<br /><br />
              <b>WASD/Arrows</b>: Move around<br />
              <b>Space</b>: Move up<br />
              <b>Shift</b>: Move down<br />
              <b>L</b>: Toggle mouse lock<br />
              <b>Mouse</b>: Look around
            </div>
          </div>
        </Html>
      )}
    </>
  );
};

export default FirstPersonControls;