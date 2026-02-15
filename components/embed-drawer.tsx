"use client"

import { motion, AnimatePresence } from "framer-motion"

interface EmbedDrawerProps {
  open: boolean
  url: string
  title: string
  /** "terminal" = dark bg (projects), "newspaper" = lighter ashy bg (research/writing) */
  variant?: "terminal" | "newspaper"
  height?: string
}

export default function EmbedDrawer({
  open,
  url,
  title,
  variant = "terminal",
  height = "min(60vh, 500px)",
}: EmbedDrawerProps) {
  const isTerminal = variant === "terminal"

  const bgOuter = isTerminal ? "bg-[#0d0c0b]" : "bg-[#1a1917]"
  const bgBar = isTerminal ? "bg-[#0a0908]" : "bg-[#16150f]"
  const borderColor = isTerminal
    ? "border-foreground/[0.06]"
    : "border-foreground/[0.08]"
  const innerBorderColor = isTerminal
    ? "border-foreground/[0.04]"
    : "border-foreground/[0.06]"

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div
            className={`rounded-b-lg border border-t-0 ${borderColor} overflow-hidden ${bgOuter}`}
          >
            {/* Address bar */}
            <div
              className={`flex items-center gap-2.5 px-4 py-2 border-b ${innerBorderColor} ${bgBar}`}
            >
              <div
                className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0"
                style={{ boxShadow: "0 0 4px rgb(200 184 154 / 0.25)" }}
              />
              <div
                className={`flex-1 flex items-center rounded ${isTerminal ? "bg-foreground/[0.03]" : "bg-foreground/[0.04]"} px-3 py-1`}
              >
                <svg
                  className="w-2.5 h-2.5 text-foreground/15 mr-2 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                  />
                </svg>
                <span className="text-[10px] font-mono text-foreground/25 truncate">
                  {url}
                </span>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-foreground/20 hover:text-foreground/40 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                aria-label={`Open ${title} in new tab`}
              >
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
            {/* Iframe */}
            <div className="relative w-full" style={{ height }}>
              <div
                className="pointer-events-none absolute inset-0 z-10 rounded-b-lg"
                style={{
                  boxShadow: `inset 0 2px 20px rgba(0,0,0,${isTerminal ? 0.5 : 0.35})`,
                }}
              />
              <iframe
                src={url}
                title={`Live preview of ${title}`}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
