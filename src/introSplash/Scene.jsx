import React, { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import './styles.css'
import {
  Capsule,
  Environment,
  Float,
  Lightformer,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei'
import Dna from './dna'
import Particles from './Particles'
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  HueSaturation,
  SMAA,
  Vignette
} from '@react-three/postprocessing'
import CameraRig from './CameraRig'

function Scene({ dnaRef }) {
  return (
    <Canvas camera={{ position: [0, 0, 7] }} gl={{ antialias: false, alpha: false }} dpr={1}>
      <color args={['#d1e2ef']} attach="background" />
      <Suspense>
        <Float rotation={[-0.8, 0, -Math.PI / 2.5]} floatIntensity={4} rotationIntensity={4}>
          <Capsule args={[0.9, 2.5, 4, 32]}>
            <MeshTransmissionMaterial
              thickness={0.95}
              anisotropy={0.25}
              ior={1.3}
              color={'#c3e9ff'}
              clearcoat={1}
              roughness={0.05}
              iridescence={2.5}
              iridescenceIOR={1.55}
              chromaticAberration={0.15}
              anisotropicBlur={0.1}
            />
          </Capsule>
          <Dna ref={dnaRef} scale={0.105} position={[0, -1.7, 0.0]} />
        </Float>
        <Environment preset="city" environmentIntensity={3}>
          <Lightformer form="rect" intensity={1} position={[2, 3, 3]} scale={5} />
          <Lightformer form="rect" intensity={2} position={[-2, 2, -4]} scale={5} />
        </Environment>
        <Particles particlesCount={100} />
        <EffectComposer multisampling={0}>
          <SMAA />
          <Bloom
            mipmapBlur
            intensity={0.8}
            levels={9}
            opacity={0.4}
            luminanceSmoothing={0.1}
            luminanceThreshold={0.7}
          />
          <DepthOfField focusDistance={0.0005} focalLength={0.15} bokehScale={16} />
          <HueSaturation saturation={0.3} hue={0.15} />
          <Vignette offset={0.65} opacity={0.7} />
        </EffectComposer>
        <Text
          font="BigShouldersDisplay-Light.ttf"
          rotation={[0, 0, 0]}
          position={[0, 0, -2]}
          fontSize={6}
          color="#87a8c3"
          letterSpacing={-0.05}>
          
        </Text>
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}

export default Scene
