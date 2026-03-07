"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"
import * as Dialog from "@radix-ui/react-dialog"
import type { Artifact, ArtifactCategory } from "@/lib/artifact-registry"
import { LANG_COLORS } from "@/lib/artifact-registry"

interface PortalOverlayProps {
  open: boolean
  onClose: () => void
  artifacts: Artifact[]
}

type FilterOption = 'all' | ArtifactCategory

// --- Timeline Node Component ---
function TimelineNode({
  artifact,
  index,
  isSelected,
  onSelect,
  isDimmed,
}: {
  artifact: Artifact
  index: number
  isSelected: boolean
  onSelect: () => void
  isDimmed: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const colorClass = LANG_COLORS[artifact.thumbnailHint] || LANG_COLORS['code']

  const categoryColors: Record<ArtifactCategory, string> = {
    project: 'bg-blue-400',
    research: 'bg-primary',
    writing: 'bg-foreground/60',
  }

  const categoryRingColors: Record<ArtifactCategory, string> = {
    project: 'ring-blue-400/30',
    research: 'ring-primary/30',
    writing: 'ring-foreground/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: isDimmed ? 0.2 : 1,
        y: 0,
        scale: isDimmed ? 0.95 : 1,
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative flex flex-col items-center shrink-0"
      style={{ width: '280px' }}
    >
      {/* Node dot */}
      <button
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative z-10 group focus:outline-none"
        aria-label={`View ${artifact.title}`}
      >
        {/* Outer ring - pulses on hover */}
        <motion.div
          className={`absolute inset-0 rounded-full ${categoryRingColors[artifact.category]}`}
          animate={{
            scale: isHovered ? 2.2 : 1.4,
            opacity: isHovered ? 0.6 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: 14, height: 14, margin: '-3px' }}
        />

        {/* Core dot */}
        <motion.div
          className={`w-2 h-2 rounded-full ${categoryColors[artifact.category]} transition-colors duration-300`}
          animate={{
            scale: isHovered || isSelected ? 1.8 : 1,
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </button>

      {/* Card below the dot */}
      <motion.div
        className="mt-6 w-full cursor-pointer"
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          y: isHovered ? -4 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={`relative rounded-sm border transition-all duration-500 overflow-hidden ${
          isSelected
            ? 'border-primary/30 bg-primary/[0.03]'
            : 'border-foreground/[0.06] bg-card hover:border-foreground/15'
        }`}>
          {/* Accent bar top */}
          <div className={`h-[2px] w-full ${colorClass}`} />

          <div className="p-4">
            {/* Year + category */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-foreground/25 text-[10px] font-light tabular-nums tracking-wide">
                {artifact.year}
              </span>
              <span className={`text-[9px] tracking-widest uppercase font-light ${
                artifact.category === 'project' ? 'text-blue-400/50' :
                artifact.category === 'research' ? 'text-primary/50' :
                'text-foreground/30'
              }`}>
                {artifact.category}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-light text-foreground tracking-tight leading-snug mb-2 line-clamp-2">
              <span className="instrument italic">{artifact.title}</span>
            </h3>

            {/* Description */}
            <p className="text-xs font-light text-foreground/30 leading-relaxed line-clamp-2 mb-3">
              {artifact.description}
            </p>

            {/* Tags */}
            {artifact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {artifact.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[8px] tracking-wide uppercase text-foreground/20 border border-foreground/[0.06] rounded-full px-2 py-0.5 font-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hover fill effect */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary/40 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered || isSelected ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// --- Expanded Detail Panel ---
function DetailPanel({ artifact, onClose }: { artifact: Artifact; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: 10, height: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="mx-6 md:mx-10 mb-6 p-6 border border-foreground/8 rounded-sm bg-card/50 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-light text-foreground tracking-tight mb-1">
              <span className="instrument italic">{artifact.title}</span>
            </h3>
            <span className="text-foreground/30 text-xs font-light">{artifact.year}</span>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/30 hover:text-foreground/60 transition-colors p-1"
            aria-label="Close detail"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm font-light text-foreground/45 leading-relaxed mb-4">
          {artifact.description}
        </p>

        {artifact.authors && artifact.authors.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-foreground/30">By </span>
            <span className="text-xs text-foreground/45">{artifact.authors.join(', ')}</span>
          </div>
        )}

        {artifact.journal && (
          <div className="mb-3">
            <span className="text-xs text-foreground/30 italic">{artifact.journal}</span>
          </div>
        )}

        {artifact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {artifact.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[9px] tracking-wide uppercase text-foreground/25 border border-foreground/8 rounded-full px-2.5 py-0.5 font-light"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {artifact.embedUrl && (
            <a
              href={artifact.embedUrl}
              target={artifact.embedUrl.startsWith('http') ? '_blank' : undefined}
              rel={artifact.embedUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-xs text-primary/70 hover:text-primary transition-colors duration-300 border border-primary/20 rounded-full px-4 py-1.5"
            >
              View Interactive
            </a>
          )}
          {artifact.externalUrl && (
            <a
              href={artifact.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors duration-300 border border-foreground/10 rounded-full px-4 py-1.5"
            >
              Open External →
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// --- Main Portal Overlay ---
export default function PortalOverlay({ open, onClose, artifacts }: PortalOverlayProps) {
  const [filter, setFilter] = useState<FilterOption>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, scrollLeft: 0 })
  const scrollX = useMotionValue(0)

  // Group artifacts by year
  const filteredArtifacts = useMemo(() => {
    if (filter === 'all') return artifacts
    return artifacts.filter(a => a.category === filter)
  }, [artifacts, filter])

  // Get unique years sorted descending
  const years = useMemo(() => {
    const unique = [...new Set(filteredArtifacts.map(a => a.year))]
    return unique.sort((a, b) => b - a)
  }, [filteredArtifacts])

  // Group by year
  const byYear = useMemo(() => {
    const map = new Map<number, Artifact[]>()
    for (const a of filteredArtifacts) {
      if (!map.has(a.year)) map.set(a.year, [])
      map.get(a.year)!.push(a)
    }
    return map
  }, [filteredArtifacts])

  const selectedArtifact = useMemo(
    () => artifacts.find(a => a.id === selectedId) || null,
    [artifacts, selectedId]
  )

  // Drag-to-scroll
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    isDragging.current = true
    dragStart.current = {
      x: e.clientX,
      scrollLeft: scrollRef.current.scrollLeft,
    }
    scrollRef.current.style.cursor = 'grabbing'
    scrollRef.current.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    const dx = e.clientX - dragStart.current.x
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx
    scrollX.set(scrollRef.current.scrollLeft)
  }, [scrollX])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab'
      scrollRef.current.style.userSelect = ''
    }
  }, [])

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      scrollX.set(scrollRef.current.scrollLeft)
    }
  }, [scrollX])

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setFilter('all')
      setSelectedId(null)
    }
  }, [open])

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'project', label: 'Projects' },
    { value: 'research', label: 'Research' },
    { value: 'writing', label: 'Writing' },
  ]

  // Flat ordered list for stagger index
  let staggerIndex = 0

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-background/85 backdrop-blur-md z-50"
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content asChild aria-label="Artifact timeline">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-50 flex flex-col"
              >
                {/* Top bar: Logo + Close */}
                <div className="flex items-center justify-between px-6 md:px-10 py-5 shrink-0">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-foreground"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.span
                      className="text-foreground text-sm font-light tracking-widest uppercase"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25, duration: 0.4 }}
                    >
                      V. Beck
                    </motion.span>
                  </div>

                  <Dialog.Close asChild>
                    <motion.button
                      className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-foreground/5 transition-colors duration-300 text-foreground/60 hover:text-foreground"
                      aria-label="Close portal"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </Dialog.Close>
                </div>

                {/* Filter pills */}
                <motion.div
                  className="flex items-center gap-2 px-6 md:px-10 pb-6 shrink-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {filterOptions.map((option, i) => (
                    <motion.button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value)
                        setSelectedId(null)
                      }}
                      className={`text-xs font-light tracking-wide px-4 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap ${
                        filter === option.value
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-foreground/40 hover:text-foreground/60 border border-foreground/[0.06] hover:bg-foreground/5'
                      }`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.05, duration: 0.3 }}
                    >
                      {option.label}
                      <span className="ml-2 text-foreground/20 text-[10px]">
                        ({option.value === 'all' ? artifacts.length : artifacts.filter(a => a.category === option.value).length})
                      </span>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Selected artifact detail */}
                <AnimatePresence mode="wait">
                  {selectedArtifact && (
                    <DetailPanel
                      key={selectedArtifact.id}
                      artifact={selectedArtifact}
                      onClose={() => setSelectedId(null)}
                    />
                  )}
                </AnimatePresence>

                {/* Timeline area */}
                <div className="flex-1 flex flex-col min-h-0">
                  <AnimatePresence mode="wait">
                    {filteredArtifacts.length > 0 ? (
                      <motion.div
                        key={filter}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col min-h-0"
                      >
                        {/* Horizontal scroll container */}
                        <div
                          ref={scrollRef}
                          className="flex-1 overflow-x-auto overflow-y-hidden cursor-grab scrollbar-thin"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          onScroll={handleScroll}
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(200,184,154,0.15) transparent',
                          }}
                        >
                          <div className="inline-flex items-start gap-0 px-6 md:px-10 pb-8 pt-2 min-w-full">
                            {years.map((year, yearIdx) => {
                              const yearArtifacts = byYear.get(year) || []
                              return (
                                <div key={year} className="flex items-start shrink-0">
                                  {/* Year marker */}
                                  <div className="flex flex-col items-center shrink-0 mr-4">
                                    <motion.span
                                      className="text-foreground/15 text-[11px] font-light tracking-widest tabular-nums mb-4 block"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.4 + yearIdx * 0.1, duration: 0.5 }}
                                    >
                                      {year}
                                    </motion.span>
                                    {/* Vertical connector line */}
                                    <motion.div
                                      className="w-px h-6 bg-foreground/10"
                                      initial={{ scaleY: 0 }}
                                      animate={{ scaleY: 1 }}
                                      transition={{ delay: 0.5 + yearIdx * 0.1, duration: 0.4 }}
                                    />
                                  </div>

                                  {/* Timeline track segment */}
                                  <div className="flex items-start">
                                    {/* Horizontal line connects through nodes */}
                                    <div className="flex items-start gap-6">
                                      {yearArtifacts.map((artifact) => {
                                        const idx = staggerIndex++
                                        return (
                                          <div key={artifact.id} className="flex items-start">
                                            {/* Connecting line before node */}
                                            <motion.div
                                              className="w-8 h-px bg-foreground/[0.06] mt-[4px] shrink-0"
                                              initial={{ scaleX: 0 }}
                                              animate={{ scaleX: 1 }}
                                              transition={{ delay: 0.4 + idx * 0.05, duration: 0.3 }}
                                              style={{ originX: 0 }}
                                            />
                                            <TimelineNode
                                              artifact={artifact}
                                              index={idx}
                                              isSelected={selectedId === artifact.id}
                                              onSelect={() => setSelectedId(prev => prev === artifact.id ? null : artifact.id)}
                                              isDimmed={false}
                                            />
                                          </div>
                                        )
                                      })}
                                    </div>

                                    {/* Spacing between year groups */}
                                    {yearIdx < years.length - 1 && (
                                      <motion.div
                                        className="w-16 h-px bg-foreground/[0.04] mt-[4px] shrink-0 mx-4"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.6 + yearIdx * 0.1, duration: 0.4 }}
                                        style={{ originX: 0 }}
                                      />
                                    )}
                                  </div>
                                </div>
                              )
                            })}

                            {/* End spacer */}
                            <div className="w-10 shrink-0" />
                          </div>
                        </div>

                        {/* Scroll hint */}
                        <motion.div
                          className="flex items-center justify-center gap-3 py-3 text-foreground/15 shrink-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2, duration: 0.5 }}
                        >
                          <div className="w-6 h-px bg-foreground/10" />
                          <span className="text-[9px] tracking-[0.2em] uppercase font-light">
                            drag to explore
                          </span>
                          <div className="w-6 h-px bg-foreground/10" />
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center gap-4 px-6"
                      >
                        <motion.div
                          className="w-12 h-px bg-foreground/10"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        />
                        <p className="text-foreground/25 text-sm font-light tracking-wide">
                          Loading artifacts...
                        </p>
                        <motion.div
                          className="w-12 h-px bg-foreground/10"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
