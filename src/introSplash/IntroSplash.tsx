import React, { useEffect, useRef } from 'react';
import { SandboxContent } from './index.jsx'; // Import the refactored component
import './styles.css'; // Import the sandbox styles

interface IntroSplashProps {
  onFinish: () => void;
}

// Re-export SandboxContent as the default IntroSplash component
const IntroSplash: React.FC<IntroSplashProps> = ({ onFinish }) => {
  // The core logic, including timeline, audio, and cleanup,
  // is now handled within SandboxContent. We just pass the onFinish callback.

  // Note: The original useEffect cleanup in index.jsx handles killing the GSAP timeline
  // and pausing the audio. Three.js resource disposal (like renderer) would typically
  // be handled within the Scene component or its direct parent if necessary,
  // but wasn't explicitly part of this refactor request.

  return <SandboxContent onFinish={onFinish} />;
};

export default IntroSplash;
