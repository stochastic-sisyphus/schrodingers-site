"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as Dialog from "@radix-ui/react-dialog"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import type { Artifact, ArtifactCategory } from "@/lib/artifact-registry"
import ArtifactCard from "./artifact-card"

interface PortalOverlayProps {
  open: boolean
  onClose: () => void
  artifacts: Artifact[]
}

type FilterOption = 'all' | ArtifactCategory

export default function PortalOverlay({ open, onClose, artifacts }: PortalOverlayProps) {
  const [filter, setFilter] = useState<FilterOption>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Filter artifacts based on selected category
  const filteredArtifacts = useMemo(() => {
    if (filter === 'all') return artifacts
    return artifacts.filter(a => a.category === filter)
  }, [artifacts, filter])

  // Toggle artifact selection
  const handleToggle = (id: string) => {
    setSelectedId(prev => prev === id ? null : id)
  }

  // Filter pill styling
  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'project', label: 'Projects' },
    { value: 'research', label: 'Research' },
    { value: 'writing', label: 'Writing' },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>

        {/* Content */}
        <Dialog.Content asChild aria-label="Artifact portal">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex flex-col bg-background border border-foreground/10 rounded-sm overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-foreground/10 shrink-0">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-foreground" />
                <span className="text-foreground text-sm font-light tracking-widest uppercase">
                  V. Beck
                </span>
              </div>

              {/* Close button */}
              <Dialog.Close asChild>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-foreground/5 transition-colors duration-300 text-foreground/60 hover:text-foreground"
                  aria-label="Close portal"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </Dialog.Close>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 px-6 md:px-8 py-4 border-b border-foreground/10 shrink-0 overflow-x-auto">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value)
                    setSelectedId(null) // Clear selection when changing filter
                  }}
                  className={`text-xs font-light tracking-wide px-4 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap ${
                    filter === option.value
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-foreground/60 hover:text-foreground border border-foreground/10 hover:bg-foreground/5'
                  }`}
                >
                  {option.label}
                  <span className="ml-2 text-foreground/30 text-[10px]">
                    ({option.value === 'all' ? artifacts.length : artifacts.filter(a => a.category === option.value).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Scrollable artifact grid */}
            <ScrollArea.Root className="flex-1 overflow-hidden">
              <ScrollArea.Viewport className="w-full h-full">
                <div className="px-6 md:px-8 py-6">
                  <AnimatePresence mode="wait">
                    {filteredArtifacts.length > 0 ? (
                      <motion.div
                        key={filter}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        {filteredArtifacts.map(artifact => (
                          <ArtifactCard
                            key={artifact.id}
                            artifact={artifact}
                            isSelected={selectedId === artifact.id}
                            onToggle={() => handleToggle(artifact.id)}
                          />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center h-64 text-foreground/40 text-sm font-light"
                      >
                        No artifacts found in this category.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea.Viewport>

              {/* Scrollbar */}
              <ScrollArea.Scrollbar
                className="flex select-none touch-none p-0.5 bg-foreground/5 transition-colors duration-300 hover:bg-foreground/10 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
                orientation="vertical"
              >
                <ScrollArea.Thumb className="flex-1 bg-foreground/20 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
