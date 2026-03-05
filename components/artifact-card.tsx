"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Artifact } from "@/lib/artifact-registry"
import { LANG_COLORS } from "@/lib/artifact-registry"

interface ArtifactCardProps {
  artifact: Artifact
  isSelected: boolean
  onToggle: () => void
}

export default function ArtifactCard({ artifact, isSelected, onToggle }: ArtifactCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const colorClass = LANG_COLORS[artifact.thumbnailHint] || LANG_COLORS['code']

  // Category badge styling
  const categoryColors = {
    project: 'text-blue-400/70 border-blue-400/20',
    research: 'text-primary/70 border-primary/20',
    writing: 'text-foreground/50 border-foreground/20',
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full text-left"
      >
        {/* Card container */}
        <div className="relative rounded-sm border border-foreground/8 bg-card overflow-hidden transition-all duration-300 hover:border-foreground/15">
          {/* Terminal-style header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0c0b] border-b border-foreground/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
            </div>
            <span className="text-[9px] text-foreground/20 tracking-wide font-light font-mono uppercase">
              {artifact.category}
            </span>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Color accent bar */}
            <div className={`w-12 h-1 rounded-full mb-4 ${colorClass}`} />

            {/* Title */}
            <h3 className="text-base md:text-lg font-light text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
              <span className="instrument italic">{artifact.title}</span>
            </h3>

            {/* Meta row */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full border ${categoryColors[artifact.category]}`}>
                {artifact.category}
              </span>
              <span className="text-foreground/30 text-xs font-light tabular-nums">
                {artifact.year}
              </span>
              {artifact.stars !== undefined && artifact.stars > 0 && (
                <span className="text-foreground/30 text-xs font-light">
                  ★ {artifact.stars}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm font-light text-foreground/40 leading-relaxed mb-4 line-clamp-2">
              {artifact.description}
            </p>

            {/* Tags */}
            {artifact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {artifact.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[9px] tracking-wide uppercase text-foreground/25 border border-foreground/8 rounded-full px-2.5 py-0.5 font-light"
                  >
                    {tag}
                  </span>
                ))}
                {artifact.tags.length > 3 && (
                  <span className="text-[9px] tracking-wide uppercase text-foreground/20 px-2.5 py-0.5 font-light">
                    +{artifact.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hover indicator */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/40"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </button>

      {/* Hover tooltip */}
      <AnimatePresence>
        {isHovered && !isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 pointer-events-none"
          >
            <div className="bg-background/95 backdrop-blur-sm border border-foreground/10 rounded-sm p-3 text-xs font-light text-foreground/60">
              {artifact.language && (
                <div className="mb-1">
                  <span className="text-foreground/40">Language:</span> {artifact.language}
                </div>
              )}
              {artifact.authors && artifact.authors.length > 0 && (
                <div className="mb-1">
                  <span className="text-foreground/40">Authors:</span> {artifact.authors.join(', ')}
                </div>
              )}
              {artifact.doi && (
                <div className="mb-1 truncate">
                  <span className="text-foreground/40">DOI:</span> {artifact.doi}
                </div>
              )}
              {artifact.externalUrl && (
                <div className="text-primary/50 text-[10px] mt-2">
                  Click to {artifact.embedUrl ? 'expand' : 'open'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-5 border border-foreground/8 rounded-sm bg-card/50">
              {/* Full description */}
              <p className="text-sm font-light text-foreground/50 leading-relaxed mb-4">
                {artifact.description}
              </p>

              {/* Authors */}
              {artifact.authors && artifact.authors.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-foreground/40">Authors: </span>
                  <span className="text-xs text-foreground/50">{artifact.authors.join(', ')}</span>
                </div>
              )}

              {/* Journal */}
              {artifact.journal && (
                <div className="mb-3">
                  <span className="text-xs text-foreground/40">Journal: </span>
                  <span className="text-xs text-foreground/50">{artifact.journal}</span>
                </div>
              )}

              {/* All tags */}
              {artifact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
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

              {/* Action links */}
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
        )}
      </AnimatePresence>
    </motion.article>
  )
}
