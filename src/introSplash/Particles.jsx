import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Noise } from 'noisejs'

const noise = new Noise(Math.random())

export default function Particles({ particlesCount = 50 }) {
  const particlesRef = useRef()

  const particlesGeometry = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3)
    const speeds = new Float32Array(particlesCount)

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10.5
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10.5

      speeds[i] = 1.25 + Math.random() * 4.2
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1))
    return geometry
  }, [particlesCount])

  const particlesMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        size: { value: 90 },
        scale: { value: 40 },
        color: { value: new THREE.Color('#ffffff') }
      },
      vertexShader: THREE.ShaderLib.points.vertexShader,
      fragmentShader: `
        uniform vec3 color;
        void main() {
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          gl_FragColor = vec4(color, step(ll, 0.5) * 0.25);
        }
      `
    })
  }, [])

  useFrame((state, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array
      const speeds = particlesRef.current.geometry.attributes.speed.array

      for (let i = 0; i < particlesCount; i++) {
        const index = i * 3
        const time = state.clock.elapsedTime

        const noiseValueX = noise.simplex3(
          positions[index] * 0.5,
          positions[index + 1] * 0.5,
          time * 0.2
        )
        const noiseValueY = noise.simplex3(
          positions[index + 1] * 0.5,
          positions[index + 2] * 0.5,
          time * 0.2
        )
        const noiseValueZ = noise.simplex3(
          positions[index + 2] * 0.5,
          positions[index] * 0.5,
          time * 0.2
        )

        positions[index + 0] += noiseValueX * 0.01 * speeds[i]
        positions[index + 1] += noiseValueY * 0.01 * speeds[i]
        positions[index + 2] += noiseValueZ * 0.01 * speeds[i]
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return <points ref={particlesRef} geometry={particlesGeometry} material={particlesMaterial} />
}
