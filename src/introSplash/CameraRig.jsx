import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'

export default function CameraRig() {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [
        (state.pointer.x * state.viewport.width) / 8,
        (1 + state.pointer.y * state.viewport.height) / 8,
        5.5
      ],
      0.5,
      delta
    )
    state.camera.lookAt(0, 0, 0)
  })
}
