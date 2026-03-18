"use client"

import { AnimatePresence, motion } from "framer-motion"

interface PreviewAction {
  label: string
  url: string
}

interface PreviewMetric {
  label: string
  value: string
}

interface ContentPreviewDrawerProps {
  open: boolean
  title: string
  description: string
  tags?: string[]
  metrics?: PreviewMetric[]
  actions?: PreviewAction[]
  variant?: "terminal" | "newspaper"
}

export default function ContentPreviewDrawer({
  open,
  title,
  description,
  tags = [],
  metrics = [],
  actions = [],
  variant = "terminal",
}: ContentPreviewDrawerProps) {
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
            <div
              className={`flex items-center gap-2.5 px-4 py-2 border-b ${innerBorderColor} ${bgBar}`}
            >
              <div
                className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0"
                style={{ boxShadow: "0 0 4px rgb(200 184 154 / 0.25)" }}
              />
              <span className="text-[10px] font-mono text-foreground/25 truncate">
                preview snapshot
              </span>
            </div>

            <div className="p-5 md:p-6">
              <h4 className="text-base md:text-lg font-light text-foreground tracking-tight mb-3">
                <span className="instrument italic">{title}</span>
              </h4>

              <p className="text-sm font-light text-foreground/55 leading-relaxed mb-4">
                {description}
              </p>

              {metrics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {metrics.slice(0, 4).map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2"
                    >
                      <div className="text-[10px] uppercase tracking-wide text-foreground/25">
                        {metric.label}
                      </div>
                      <div className="text-xs text-foreground/55 mt-1">{metric.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tags.slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] tracking-wide uppercase text-foreground/45 border border-foreground/[0.12] rounded-full px-2.5 py-0.5 font-light"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {actions.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {actions.slice(0, 2).map((action) => (
                    <a
                      key={action.label}
                      href={action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary text-xs tracking-wide font-light hover:bg-primary/10 transition-all duration-300 min-h-[44px]"
                    >
                      {action.label}
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
                          d="M7 17L17 7M17 7H7M17 7V17"
                        />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
