"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showShader, setShowShader] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const canvas = document.createElement("canvas")
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")

    setShowShader(Boolean(gl))

    return () => {
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 75%, rgba(240,236,228,0.28), transparent 42%), radial-gradient(circle at 82% 82%, rgba(200,184,154,0.24), transparent 36%), linear-gradient(135deg, #2b2620 0%, #141312 45%, #090909 100%)",
        }}
      />

      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Only mount the shader when WebGL is available; otherwise keep the CSS gradient fallback. */}
      {showShader ? (
        <>
          <MeshGradient
            className="absolute inset-0 w-full h-full"
            colors={["#050505", "#c8b89a", "#f0ece4", "#1a1510", "#2a2318"]}
            speed={0.15}
          />
          <MeshGradient
            className="absolute inset-0 w-full h-full opacity-40"
            colors={["#050505", "#f0ece4", "#c8b89a", "#050505"]}
            speed={0.1}
          />
        </>
      ) : null}

      {children}
    </div>
  )
}
