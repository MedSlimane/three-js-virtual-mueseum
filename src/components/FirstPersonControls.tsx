/** @jsxImportSource react */
import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
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

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip handling key events when target is an input element
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }
      
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
      // Skip handling key events when target is an input element
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }
      
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
      
      // Explicitly unlock pointer on cleanup
      if (controlsRef.current && isLocked) {
        controlsRef.current.unlock();
      }
      
      // Reset movement state
      moveState.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false
      };
    };
  }, [isLocked]);

  // Cleanup function to ensure pointer is released when component unmounts
  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        controlsRef.current.unlock();
        setIsLocked(false);
        
        // Force release pointer lock at the browser level for extra safety
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      }
    };
  }, []);

  // Prevent accidental pointer lock from canvas clicks
  useEffect(() => {
    // Completely disable the automatic pointer lock on canvas clicks
    const originalClickHandler = gl.domElement.onclick;
    
    // Replace with handler that prevents pointer lock
    gl.domElement.onclick = (event) => {
      // Prevent default behavior
      event.stopPropagation();
      event.preventDefault();
    };
    
    // Cleanup function to restore original click handler when component unmounts
    return () => {
      gl.domElement.onclick = originalClickHandler;
    };
  }, [gl]);

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
      
      prevTime.current = time;
    }
  });

  // Toggle camera mode button styles
  const buttonStyle = {
    position: 'absolute' as 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    background: isLocked ? '#f44336' : '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    zIndex: 101,
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
  };

  return (
    <>
      <PointerLockControls 
        ref={controlsRef} 
        camera={camera} 
        domElement={gl.domElement}
        onLock={() => setIsLocked(true)}
        onUnlock={() => {
          setIsLocked(false);
          // Force the pointer to be released
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
        }}
      />
      
      {/* Camera Mode Toggle Button - always visible */}
      <Html fullscreen>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            isLocked ? controlsRef.current?.unlock() : controlsRef.current?.lock();
          }}
          style={buttonStyle}
        >
          {isLocked ? 'Exit Camera Mode (L)' : 'Enter Camera Mode (L)'}
        </button>
      </Html>
    </>
  );
};

export default FirstPersonControls;