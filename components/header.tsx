"use client"

import { useState } from "react"
import PortalOverlay from "./portal-overlay"
import type { Artifact } from "@/lib/artifact-registry"

interface HeaderProps {
  artifacts?: Artifact[]
}

export default function Header({ artifacts = [] }: HeaderProps) {
  const [portalOpen, setPortalOpen] = useState(false)

  return (
    <>
      <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
        {/* Logo / Name */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-foreground" />
          <span className="text-foreground text-sm font-light tracking-widest uppercase">
            V. Beck
          </span>
        </div>

        {/* Explore trigger button */}
        <button
          onClick={() => setPortalOpen(true)}
          disabled={artifacts.length === 0}
          className={`text-xs font-light tracking-wide transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full ${
            artifacts.length === 0
              ? "text-foreground/20 cursor-default"
              : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
          }`}
        >
          <span className="hidden sm:inline">Explore</span>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </header>

      {/* Portal overlay */}
      <PortalOverlay
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        artifacts={artifacts}
      />
    </>
  )
}
