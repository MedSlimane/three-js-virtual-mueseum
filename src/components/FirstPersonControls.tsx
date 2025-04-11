import React, { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3, Raycaster, Object3D } from 'three'
import { PointerLockControls } from '@react-three/drei'

interface FirstPersonControlsProps {
  speed?: number
  lookSpeed?: number
}

const FirstPersonControls: React.FC<FirstPersonControlsProps> = ({ 
  speed = 50, 
  lookSpeed = 0.1 
}) => {
  const { camera, gl } = useThree()
  const controls = useRef<any>(null)
  const moveForward = useRef(false)
  const moveBackward = useRef(false)
  const moveLeft = useRef(false)
  const moveRight = useRef(false)
  const canJump = useRef(true)
  const velocity = useRef(new Vector3())
  const direction = useRef(new Vector3())
  const prevTime = useRef(performance.now())
  const raycaster = useRef(new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10))
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': moveForward.current = true; break
        case 'KeyA': moveLeft.current = true; break
        case 'KeyS': moveBackward.current = true; break
        case 'KeyD': moveRight.current = true; break
        case 'Space': 
          if (canJump.current) velocity.current.y += 350
          canJump.current = false
          break
        default: break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': moveForward.current = false; break
        case 'KeyA': moveLeft.current = false; break
        case 'KeyS': moveBackward.current = false; break
        case 'KeyD': moveRight.current = false; break
        default: break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (controls.current?.isLocked) {
      // Time calculation
      const time = performance.now()
      const delta = (time - prevTime.current) / 1000
      
      // Apply gravity
      velocity.current.y -= 9.8 * 100.0 * delta
      
      // Set direction based on input
      direction.current.z = Number(moveForward.current) - Number(moveBackward.current)
      direction.current.x = Number(moveRight.current) - Number(moveLeft.current)
      direction.current.normalize()
      
      const movementSpeed = speedRef.current; // Use the ref to get the latest speed value

      // Apply movement in camera direction
      if (moveForward.current || moveBackward.current) {
        velocity.current.z -= direction.current.z * 70 * delta;
      }
      if (moveLeft.current || moveRight.current) {
        velocity.current.x -= direction.current.x * 70 * delta;
      }
      
      // Apply friction
      velocity.current.x *= 0.9
      velocity.current.z *= 0.9
      
      // Check for collisions with the ground (simple implementation)
      if (camera.position.y <= 1.6) {
        velocity.current.y = 0
        camera.position.y = 1.6
        canJump.current = true
      }
      
      // Apply velocity to camera position
      const moveX = velocity.current.x * delta
      const moveZ = velocity.current.z * delta
      const moveY = velocity.current.y * delta
      
      // Move forward/backward/left/right
      camera.translateZ(moveZ)
      camera.translateX(moveX)
      camera.position.y += moveY
      
      prevTime.current = time
    }
  })

  return <PointerLockControls ref={controls} camera={camera} domElement={gl.domElement} />
}

export default FirstPersonControls