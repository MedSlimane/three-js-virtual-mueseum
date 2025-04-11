import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats, Environment, OrbitControls } from '@react-three/drei';
import Museum from './components/Museum';
import Loading from './components/Loading';
import InfoPanel from './components/InfoPanel';
import Controls from './components/Controls';
import FirstPersonControls from './components/FirstPersonControls';

export default function App() {
  const [debug, setDebug] = useState(false);
  const [controlMode, setControlMode] = useState<'orbit' | 'firstPerson'>('firstPerson');
  const [infoText, setInfoText] = useState<string | null>(
    'Welcome to the Virtual Museum. Use WASD to move and mouse to look around. Click to lock pointer and begin navigation.'
  );

  return (
    <>
      {infoText && <InfoPanel text={infoText} />}
      <Controls 
        debug={debug} 
        setDebug={setDebug} 
        controlMode={controlMode}
        setControlMode={setControlMode}
      />
      
      <Canvas
        shadows
        camera={{ position: [0, 1.6, 5], fov: 60 }}
        style={{ background: '#000' }}
      >
        <Suspense fallback={<Loading />}>
          <Museum setInfoText={setInfoText} />
          <Environment preset="sunset" />
          
          {controlMode === 'firstPerson' ? (
            <FirstPersonControls speed={2.5} />
          ) : (
            <OrbitControls />
          )}
          
          {debug && <Stats />}
        </Suspense>
      </Canvas>
    </>
  );
}