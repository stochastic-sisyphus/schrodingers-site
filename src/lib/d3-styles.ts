/**
 * Shared D3 visualization styling utilities
 * Centralized palette-compliant colors, text styles, and interaction helpers
 * for all visualization components.
 */

/** Steel-teal palette colors for D3 visualizations */
export const d3Colors = {
  /** #a6b6c2 - highlight/primary accent */
  primary: '#a6b6c2',
  /** #8498a6 - accent */
  accent: '#8498a6',
  /** #627888 - light mid-tone */
  secondary: '#627888',
  /** #445868 - mid-tone */
  tertiary: '#445868',
  /** #2a3844 - base dark */
  base: '#2a3844',
  /** #141a20 - deepest dark */
  deep: '#141a20',
  /** #d4dde4 - body text (legible on dark bg) */
  text: '#d4dde4',
  /** #e8f0f5 - bright text for emphasis */
  textBright: '#e8f0f5',
  /** Dimmed state for non-active elements */
  dimmed: 'rgba(164, 182, 194, 0.4)',
} as const;

/** Standard text styling for D3 SVG text elements */
export const d3TextStyle = {
  fill: d3Colors.text,
  fontSize: '12px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
} as const;

/** Monospace text styling for code-related visualizations */
export const d3CodeTextStyle = {
  fill: d3Colors.text,
  fontSize: '11px',
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 400,
} as const;

/** Title text styling */
export const d3TitleStyle = {
  fill: d3Colors.primary,
  fontSize: '18px',
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 500,
} as const;

/** Axis label styling */
export const d3AxisLabelStyle = {
  fill: d3Colors.primary,
  fontSize: '12px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
} as const;

/** Legend text styling */
export const d3LegendStyle = {
  fill: d3Colors.primary,
  fontSize: '11px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
} as const;

/** Interaction timing and easing constants */
export const d3Interaction = {
  activeOpacity: 1,
  dimmedOpacity: 0.3,
  hoverDimmedOpacity: 0.15,
  transitionDuration: 200,
  transitionEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/** Tooltip styling constants */
export const d3TooltipStyle = {
  background: 'rgba(42, 56, 68, 0.95)',
  border: '1px solid rgba(166, 182, 194, 0.3)',
  borderRadius: '8px',
  padding: '0.75rem',
  backdropFilter: 'blur(10px)',
  color: d3Colors.text,
  fontSize: '12px',
  maxWidth: '300px',
  zIndex: '1000',
} as const;

/**
 * Create a palette-compliant color scale that cycles through N items.
 * Returns a function mapping index to color string.
 */
export function createColorScale(_count: number): (i: number) => string {
  const colors = [d3Colors.primary, d3Colors.secondary, d3Colors.tertiary, d3Colors.accent, d3Colors.base];
  return (i: number) => colors[i % colors.length];
}

/**
 * Apply tooltip styles to a D3 selection (for programmatically created tooltips).
 */
export function applyTooltipStyles(selection: any): any {
  return selection
    .style('position', 'absolute')
    .style('background', d3TooltipStyle.background)
    .style('color', d3TooltipStyle.color)
    .style('padding', d3TooltipStyle.padding)
    .style('border-radius', d3TooltipStyle.borderRadius)
    .style('font-size', d3TooltipStyle.fontSize)
    .style('pointer-events', 'none')
    .style('border', d3TooltipStyle.border)
    .style('backdrop-filter', d3TooltipStyle.backdropFilter)
    .style('z-index', d3TooltipStyle.zIndex)
    .style('max-width', d3TooltipStyle.maxWidth);
}

/**
 * Dim or restore opacity on a D3 selection with smooth transition.
 */
export function dimElement(selection: any, isDimmed: boolean): any {
  return selection
    .transition()
    .duration(d3Interaction.transitionDuration)
    .style('opacity', isDimmed ? d3Interaction.dimmedOpacity : d3Interaction.activeOpacity);
}
