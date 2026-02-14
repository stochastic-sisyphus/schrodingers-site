"use client"

import { PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"

export default function PulsingCircle() {
  return (
    <div className="absolute bottom-8 right-6 md:bottom-12 md:right-10 z-30">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <PulsingBorder
          colors={["#f0ece4", "#c8b89a", "#8a8478", "#f0ece4", "#c8b89a", "#2a2318", "#f0ece4"]}
          colorBack="#00000000"
          speed={1}
          roundness={1}
          thickness={0.1}
          softness={0.3}
          intensity={3}
          spotsPerColor={5}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.5}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
          }}
        />

        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="text-sm fill-foreground/60 instrument">
            <textPath href="#circle" startOffset="0%">
              {"perpetually uphill \u00B7 perpetually uphill \u00B7 perpetually uphill \u00B7"}
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}
