"use client"

import { useState } from "react"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
      {/* Logo / Name */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-foreground" />
        <span className="text-foreground text-sm font-light tracking-widest uppercase">
          V. Beck
        </span>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {["Projects", "Research", "Writing", "Connect"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-foreground/60 hover:text-foreground text-xs font-light tracking-wide px-4 py-2 rounded-full hover:bg-foreground/5 transition-all duration-300"
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        <span
          className={`block w-5 h-px bg-foreground transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[3.5px]" : ""}`}
        />
        <span
          className={`block w-5 h-px bg-foreground transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`}
        />
      </button>

      {/* Desktop CTA */}
      <div className="hidden md:block">
        <a
          href="#connect"
          className="text-foreground/60 hover:text-foreground text-xs font-light tracking-wide transition-all duration-300"
        >
          Say hello
        </a>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-sm md:hidden">
          <nav className="flex flex-col items-center justify-center gap-8 h-full">
            {["Projects", "Research", "Writing", "Connect"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="text-foreground text-2xl font-light instrument tracking-wide"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
