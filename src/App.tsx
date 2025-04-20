/** @jsxImportSource react */
import { useState, lazy, Suspense } from 'react';
import './index.css';
import MuseumCanvas from './components/MuseumCanvas';

// Lazy-load IntroSplash
const IntroSplash = lazy(() => import('./introSplash/IntroSplash'));

export default function App() {
  // State to control intro visibility, always start with true
  const [showIntro, setShowIntro] = useState(true); // Always show intro initially

  // Conditional rendering
  if (showIntro) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        {/* Pass the function to set showIntro to false when intro finishes */}
        <IntroSplash onFinish={() => setShowIntro(false)} />
      </Suspense>
    );
  }

  // Show museum after intro is finished (showIntro becomes false)
  return <MuseumCanvas />;
}