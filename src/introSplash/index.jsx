import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import Scene from './Scene';

export function SandboxContent({ onFinish }) {
  const dnaRef = useRef();
  const beatRef = useRef(null); // Initialize with null
  const tl = useRef(null); // Initialize with null

  const quotes = [
    "« La médecine repousse chaque jour les frontières du possible. »",
    "« L'innovation d'aujourd'hui est la santé de demain. »",
    "« Chaque découverte est une promesse de vie prolongée. »"
  ];

  useEffect(() => {
    const audio = new Audio('/audio/heartbeat.mp3');
    audio.loop = true;
    audio.volume = 1; // Start with full volume
    beatRef.current = audio;

    let interactionListenerAttached = false;
    let interactionHandler = null; // To store the handler for potential removal

    // Function to attempt playing the audio
    const attemptPlay = async () => {
      // Guard against calling play if ref is cleared or audio not ready
      if (!beatRef.current || beatRef.current.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
        console.log("Audio not ready or ref cleared, skipping play attempt.");
        return;
      }
      try {
        // Some browsers require resuming the audio context explicitly
        if (beatRef.current.context && beatRef.current.context.state === 'suspended') {
          await beatRef.current.context.resume();
        }

        // Only play if currently paused
        if (beatRef.current.paused) {
          await beatRef.current.play();
          console.log("Audio playback started successfully.");
          // If playback succeeded after interaction, ensure listeners are removed
          removeInteractionListeners();
        }
      } catch (error) {
        console.error("Audio playback failed:", error);
        // If it's the specific NotAllowedError and we haven't attached listeners yet
        if (error.name === 'NotAllowedError' && !interactionListenerAttached) {
          console.warn("Autoplay prevented by browser. Waiting for user interaction to start audio.");
          attachInteractionListeners(); // Set up listeners to play on first interaction
        } else if (error.name !== 'NotAllowedError') {
          // Log other types of errors
          console.error("An unexpected error occurred during audio playback attempt:", error);
        }
      }
    };

    // Function called upon user interaction
    const handleInteraction = () => {
      console.log("User interaction detected. Attempting to play audio.");
      removeInteractionListeners(); // Clean up listeners immediately
      attemptPlay(); // Try playing the audio now
    };

    // Adds interaction listeners if they aren't already attached
    const attachInteractionListeners = () => {
      if (!interactionListenerAttached) {
        // Use a named function reference for removal
        interactionHandler = handleInteraction;
        document.addEventListener('click', interactionHandler, { once: true, capture: true });
        document.addEventListener('touchstart', interactionHandler, { once: true, capture: true });
        interactionListenerAttached = true;
        console.log("Interaction listeners attached.");
      }
    };

    // Removes interaction listeners
    const removeInteractionListeners = () => {
      if (interactionListenerAttached && interactionHandler) {
        document.removeEventListener('click', interactionHandler, true);
        document.removeEventListener('touchstart', interactionHandler, true);
        interactionListenerAttached = false;
        interactionHandler = null; // Clear the stored handler
        console.log("Interaction listeners removed.");
      }
    };

    // Handler for when the audio is ready to play
    const canPlayHandler = () => {
      console.log("Audio 'canplaythrough' event fired. Attempting initial playback.");
      attemptPlay(); // Try to play as soon as the browser thinks it can
    };

    // Attach the 'canplaythrough' listener
    audio.addEventListener('canplaythrough', canPlayHandler, { once: true });
    audio.load(); // Start loading the audio file

    // --- GSAP Timeline Initialization ---
    const initTimeline = () => {
      if (!dnaRef.current) {
        requestAnimationFrame(initTimeline); // Wait for DNA ref if needed
        return;
      }
      tl.current = gsap.timeline({
        defaults: { ease: 'power2.out' },
      });

      // Overlay fade in
      tl.current.to('#overlay', { opacity: 1, duration: 0.6 }, 0);
      // Set starting DNA rotation
      tl.current.set(dnaRef.current.rotation, { y: -0.4 }, 0.6);

      // Quote 1
      tl.current.fromTo('.quote1', { y: 40 }, { opacity: 1, y: 0, duration: 2 }, 1);
      tl.current.to(dnaRef.current.rotation, { y: '+=0.8', duration: 3 }, 1);

      // Quote 2
      tl.current.to('.quote1', { opacity: 0, duration: 1 }, 4);
      tl.current.fromTo('.quote2', { y: 40 }, { opacity: 1, y: 0, duration: 2 }, 4);
      tl.current.to(dnaRef.current.rotation, { y: '+=0.8', duration: 3 }, 4);

      // Quote 3
      tl.current.to('.quote2', { opacity: 0, duration: 1 }, 7);
      tl.current.fromTo('.quote3', { y: 40 }, { opacity: 1, y: 0, duration: 2 }, 7);
      tl.current.to(dnaRef.current.rotation, { y: '+=1.0', duration: 3 }, 7);

      // Spin after last quote
      tl.current.to('.quote3', { opacity: 0, duration: 1 }, 10);
      tl.current.to(dnaRef.current.rotation, { y: '+=6.283', duration: 1 }, 10); // Approx 2*PI

      // Title main
      tl.current.fromTo('.title.main', { scale: 0.6 }, { opacity: 1, scale: 1, duration: 1 }, 12);
      // Subtitle slide-in
      tl.current.fromTo('.subtitle', { y: 20 }, { opacity: 1, y: 0, duration: 1 }, 13);

      // Entrer button fade/slide in
      tl.current.fromTo('#enter', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 14);
    };
    initTimeline();
    // --- End GSAP Timeline ---


    // --- Cleanup Function ---
    return () => {
      console.log("Cleaning up IntroSplash effect...");
      // Remove event listeners
      audio.removeEventListener('canplaythrough', canPlayHandler);
      removeInteractionListeners(); // Ensure interaction listeners are removed

      // Kill GSAP timeline
      if (tl.current) {
        tl.current.kill();
        tl.current = null;
      }

      // Stop and release audio resources
      if (beatRef.current) {
        beatRef.current.pause();
        beatRef.current.removeAttribute('src'); // Prevent further loading/playing
        beatRef.current.load(); // Abort any ongoing request
        beatRef.current = null; // Clear the ref
        console.log("Audio resources released.");
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to end the intro sequence (called by buttons)
  const endSequence = () => {
    if (tl.current) tl.current.kill(); // Kill timeline animation
    gsap.to('#overlay', { opacity: 0, duration: 0.4 }); // Fade out overlay

    // Fade out audio and then pause
    if (beatRef.current) {
      const audio = beatRef.current;
      // Only fade if it's currently playing
      if (!audio.paused) {
        gsap.to(audio, {
          volume: 0,
          duration: 0.8, // Fade duration
          onComplete: () => {
            // Check ref again in case component unmounted during fade
            if (beatRef.current) {
              beatRef.current.pause();
            }
          }
        });
      } else {
        // If already paused, just ensure volume is 0
         audio.volume = 0;
      }
    }

    // Call the onFinish callback after the overlay fade-out
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400); // Match overlay fade duration
  };

  // --- JSX Rendering ---
  return (
    <>
      <Scene dnaRef={dnaRef} />
      <div id="overlay">
        {/* Skip button always visible initially */}
        <button id="skip" className="button" onClick={endSequence}>Skip</button>

        {/* Quotes */}
        <p className="quote quote1">{quotes[0]}</p>
        <p className="quote quote2">{quotes[1]}</p>
        <p className="quote quote3">{quotes[2]}</p>

        {/* Titles */}
        <h1 className="title main">Vitanova</h1>
        <p className="subtitle">Musée de l’Innovation Médicale</p>

        {/* Enter button - initially hidden by GSAP, revealed by timeline */}
        <button id="enter" className="button" onClick={endSequence}>Entrer</button>
      </div>
    </>
  );
}
