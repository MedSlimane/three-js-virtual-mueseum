import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import Scene from './Scene'

export function SandboxContent({ onFinish }) {
  const dnaRef = useRef()
  const beatRef = useRef()
  const tl = useRef()

  const quotes = [
    "« La médecine repousse chaque jour les frontières du possible. »",
    "« L'innovation d'aujourd'hui est la santé de demain. »",
    "« Chaque découverte est une promesse de vie prolongée. »"
  ]


  useEffect(() => {
    const beat = new Audio('/audio/heartbeat.mp3') // Assuming audio is served from public root
    beat.loop = true
    beat.volume = 0.5
    beat.play().catch(() => {})
    beatRef.current = beat

    const initTimeline = () => {
      if (!dnaRef.current) {
        requestAnimationFrame(initTimeline)
        return
      }
      tl.current = gsap.timeline({
        defaults: { ease: 'power2.out' },
      })

      // Overlay fade in
      tl.current.to('#overlay', { opacity: 1, duration: 0.6 }, 0)
      // Set starting DNA rotation
      tl.current.set(dnaRef.current.rotation, { y: -0.4 }, 0.6)

      // Quote 1
      tl.current.fromTo('.quote1', { y: 40 }, { opacity: 1, y: 0, duration: 2 }, 1)
      tl.current.to(dnaRef.current.rotation, { y: '+=0.8', duration: 3 }, 1)

      // Quote 2
      tl.current.to('.quote1', { opacity: 0, duration: 1 }, 4)
      tl.current.fromTo('.quote2', { y: 40 }, { opacity: 1, y: 0, duration: 2 }, 4)
      tl.current.to(dnaRef.current.rotation, { y: '+=0.8', duration: 3 }, 4)

      // Quote 3
      tl.current.to('.quote2', { opacity: 0, duration: 1 }, 7)
      tl.current.fromTo('.quote3', { y: 40 }, { opacity: 1, y: 0, duration: 2 }, 7)
      tl.current.to(dnaRef.current.rotation, { y: '+=1.0', duration: 3 }, 7)

      // Spin after last quote
      tl.current.to('.quote3', { opacity: 0, duration: 1 }, 10)
      tl.current.to(dnaRef.current.rotation, { y: '+=6.283', duration: 1 }, 10)

      // Title main
      tl.current.fromTo('.title.main', { scale: 0.6 }, { opacity: 1, scale: 1, duration: 1 }, 12)
      // Subtitle slide-in
      tl.current.fromTo('.subtitle', { y: 20 }, { opacity: 1, y: 0, duration: 1 }, 13)

      // Entrer button
      tl.current.to('#enter', { opacity: 1, y: 0, duration: 1 }, 14)
    }
    initTimeline()

    return () => {
      if (tl.current) tl.current.kill()
      if (beatRef.current) {
         beatRef.current.pause()
      }
    }
  }, [])

  const endSequence = () => {
    if (tl.current) tl.current.kill() // Kill timeline
    gsap.to('#overlay', { opacity: 0, duration: 0.4 })
    if (beatRef.current) {
        gsap.to(beatRef.current, { volume: 0, duration: 0.8, onComplete: () => beatRef.current.pause() })
    }
    // Call the passed onFinish function after a short delay for fade out
    setTimeout(() => {
        if (onFinish) onFinish();
    }, 400) // Keep delay consistent with original fade out
  }

  return (
    <>
      <Scene dnaRef={dnaRef} />
      <div id="overlay">
        <button id="skip" className="button" onClick={endSequence}>Skip</button>
        <p className="quote quote1">{quotes[0]}</p>
        <p className="quote quote2">{quotes[1]}</p>
        <p className="quote quote3">{quotes[2]}</p>
        <h1 className="title main">Vitanova</h1>
        <p className="subtitle">Musée de l’Innovation Médicale</p>
        <button id="enter" className="button" onClick={endSequence}>Entrer</button>
      </div>
    </>
  )
}
