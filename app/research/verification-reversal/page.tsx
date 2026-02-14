import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Verification Reversal: Cascades and Synthetic Productivity | Vanessa Beck",
  description: "A research paper exploring verification cascades and synthetic productivity in an AI-mediated economy.",
}

export default function VerificationReversalPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with back navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-6 bg-background/80 backdrop-blur-sm border-b border-foreground/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/#research"
            className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-300 flex items-center gap-2"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to research
          </Link>
          <a
            href="https://zenodo.org/doi/10.5281/zenodo.18159898"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary/70 hover:text-primary transition-colors duration-300 flex items-center gap-2"
          >
            View on Zenodo
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 px-6 md:px-10 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Paper metadata */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-primary/40" />
              <span className="text-primary/60 text-[10px] tracking-[0.3em] uppercase font-light">
                Preprint • 2026
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-tight mb-6">
              Verification Reversal: <span className="instrument italic">Cascades and Synthetic Productivity</span> in an AI-Mediated Economy
            </h1>

            <div className="flex flex-col gap-3 mb-8">
              <p className="text-lg font-light text-foreground/70">
                Vanessa Beck
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/50">
                <span>2026</span>
                <span className="w-1 h-1 rounded-full bg-foreground/30" />
                <a
                  href="https://doi.org/10.5281/zenodo.18159898"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-300"
                >
                  DOI: 10.5281/zenodo.18159898
                </a>
                <span className="w-1 h-1 rounded-full bg-foreground/30" />
                <span className="text-[10px] tracking-wide uppercase border border-foreground/10 rounded-full px-3 py-1">
                  Preprint
                </span>
              </div>
            </div>

            {/* Abstract */}
            <div className="max-w-3xl">
              <h2 className="text-sm tracking-[0.2em] uppercase text-foreground/40 mb-4 font-light">
                Abstract
              </h2>
              <p className="text-base font-light text-foreground/70 leading-relaxed">
                This paper explores the phenomenon of verification reversal in AI-mediated economies,
                where traditional validation cascades invert as synthetic productivity amplifies.
                Through interactive visualization and theoretical analysis, we examine how automated
                verification systems create feedback loops that fundamentally alter the nature of
                productive labor and quality assurance in software development and knowledge work.
              </p>
            </div>
          </div>

          {/* Interactive visualization */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-primary/40" />
              <span className="text-primary/60 text-[10px] tracking-[0.3em] uppercase font-light">
                Interactive Visualization
              </span>
            </div>

            <div className="relative w-full bg-[#1a1816] rounded-lg overflow-hidden border border-foreground/10">
              <iframe
                src="/verification-reversal.html"
                className="w-full h-[600px] md:h-[700px] lg:h-[800px] border-0"
                title="Verification Reversal Interactive Visualization"
                loading="lazy"
              />
            </div>

            <p className="mt-4 text-sm font-light text-foreground/50 text-center">
              Click and drag to interact with the verification cascade simulation
            </p>
          </div>

          {/* Citation */}
          <div className="max-w-3xl border-t border-foreground/10 pt-8">
            <h2 className="text-sm tracking-[0.2em] uppercase text-foreground/40 mb-4 font-light">
              Citation
            </h2>
            <div className="bg-muted/30 rounded-lg p-6 font-mono text-xs text-foreground/70 leading-relaxed">
              Beck, V. (2026). <span className="italic">Verification Reversal: Cascades and Synthetic Productivity in an AI-Mediated Economy</span>.
              Zenodo. <a
                href="https://doi.org/10.5281/zenodo.18159898"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary transition-colors duration-300"
              >
                https://doi.org/10.5281/zenodo.18159898
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
