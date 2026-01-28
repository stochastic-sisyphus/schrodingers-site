<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  let { width = 800, height = 500 } = $props();
  
  let svgElement: SVGSVGElement;
  let container: HTMLDivElement;
  
  // Simulation parameters
  let verificationIntensity = $state(0.7);
  let artifactVolume = $state(1.0);
  
  // Data for visualization
  let timeSeriesData: Array<{
    time: number;
    measuredTFP: number;
    verifiedTFP: number;
    epistemicDebt: number;
    cascadeRisk: number;
  }> = $state([]);
  
  // Generate realistic data based on paper's model
  function generateData() {
    const data = [];
    const periods = 50;
    
    for (let t = 0; t < periods; t++) {
      // Verification capacity erodes over time when underused
      const verificationCapacity = verificationIntensity * Math.exp(-0.02 * t);
      
      // Artifact volume grows exponentially (AI generation)
      const volume = artifactVolume * Math.exp(0.05 * t);
      
      // Measured TFP = output / input (appears to grow)
      const measuredTFP = 1.0 + 0.03 * t;
      
      // Verification-adjusted TFP accounts for remediation burden
      const remediationBurden = Math.max(0, volume - verificationCapacity * 10) * 0.1;
      const verifiedTFP = measuredTFP - remediationBurden;
      
      // Epistemic debt accumulates
      const epistemicDebt = Math.max(0, (volume - verificationCapacity * 5) * 0.5);
      
      // Cascade risk increases when verification threshold is breached
      const costGap = 0.8 - verificationCapacity;
      const cascadeRisk = Math.min(1, Math.max(0, costGap / 0.5));
      
      data.push({
        time: t,
        measuredTFP,
        verifiedTFP: Math.max(0.5, verifiedTFP),
        epistemicDebt,
        cascadeRisk
      });
    }
    
    return data;
  }
  
  function renderVisualization() {
    if (!svgElement || !container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = Math.min(500, Math.max(400, container.clientHeight));
    
    // Clear existing
    d3.select(svgElement).selectAll('*').remove();
    
    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = containerHeight - margin.top - margin.bottom;
    
    const svg = d3.select(svgElement)
      .attr('width', containerWidth)
      .attr('height', containerHeight);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(timeSeriesData, d => d.time)!])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(timeSeriesData, d => Math.max(d.measuredTFP, d.epistemicDebt))! * 1.1])
      .range([innerHeight, 0]);
    
    // Axes with high contrast
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(8);
    
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);
    
    // Axis labels
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .text('Time Period');
    
    g.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .text('Productivity / Debt');
    
    // Title
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', innerWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .text('Synthetic Productivity: The Divergence');
    
    // Area for epistemic debt
    const debtArea = d3.area<typeof timeSeriesData[0]>()
      .x(d => xScale(d.time))
      .y0(innerHeight)
      .y1(d => yScale(d.epistemicDebt))
      .curve(d3.curveMonotoneX);
    
    g.append('path')
      .datum(timeSeriesData)
      .attr('class', 'debt-area')
      .attr('d', debtArea);
    
    // Line generators
    const measuredLine = d3.line<typeof timeSeriesData[0]>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.measuredTFP))
      .curve(d3.curveMonotoneX);
    
    const verifiedLine = d3.line<typeof timeSeriesData[0]>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.verifiedTFP))
      .curve(d3.curveMonotoneX);
    
    const debtLine = d3.line<typeof timeSeriesData[0]>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.epistemicDebt))
      .curve(d3.curveMonotoneX);
    
    // Measured TFP line
    g.append('path')
      .datum(timeSeriesData)
      .attr('class', 'line-measured')
      .attr('d', measuredLine);
    
    // Verified TFP line
    g.append('path')
      .datum(timeSeriesData)
      .attr('class', 'line-verified')
      .attr('d', verifiedLine);
    
    // Epistemic debt line
    g.append('path')
      .datum(timeSeriesData)
      .attr('class', 'line-debt')
      .attr('d', debtLine);
    
    // Legend with high contrast
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth + 10}, 20)`);
    
    const legendData = [
      { label: 'Measured TFP', color: '#a6b6c2', dash: false },
      { label: 'Verified TFP', color: '#8498a6', dash: false },
      { label: 'Epistemic Debt', color: '#627888', dash: true }
    ];
    
    legendData.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);
      
      const lineClass = item.dash ? 'legend-line-dashed' : 'legend-line';
      legendRow.append('line')
        .attr('class', lineClass)
        .attr('data-type', item.label.toLowerCase().replace(/\s+/g, '-'))
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 0)
        .attr('y2', 0);
      
      legendRow.append('text')
        .attr('class', 'legend-text')
        .attr('x', 25)
        .attr('y', 4)
        .text(item.label);
    });
    
    // Add cascade warning zone
    const cascadeThreshold = timeSeriesData.findIndex(d => d.cascadeRisk > 0.5);
    if (cascadeThreshold > 0) {
      g.append('rect')
        .attr('class', 'cascade-zone')
        .attr('x', xScale(cascadeThreshold))
        .attr('y', 0)
        .attr('width', innerWidth - xScale(cascadeThreshold))
        .attr('height', innerHeight);
      
      g.append('text')
        .attr('class', 'cascade-label')
        .attr('x', xScale(cascadeThreshold) + 10)
        .attr('y', 20)
        .text('CASCADE ZONE');
    }
  }
  
  function updateSimulation() {
    timeSeriesData = generateData();
    renderVisualization();
  }
  
  onMount(() => {
    updateSimulation();
    
    const resizeObserver = new ResizeObserver(() => {
      renderVisualization();
    });
    
    if (container) {
      resizeObserver.observe(container);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="viz-container" bind:this={container}>
  <svg bind:this={svgElement}></svg>
  
  <div class="controls">
    <div class="control-group">
      <label>
        <span class="label-text">Verification Intensity: {verificationIntensity.toFixed(2)}</span>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          bind:value={verificationIntensity}
          oninput={() => updateSimulation()}
        />
        <span class="help-text">Higher = more verification capacity</span>
      </label>
    </div>
    
    <div class="control-group">
      <label>
        <span class="label-text">Artifact Volume Growth: {artifactVolume.toFixed(2)}</span>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          bind:value={artifactVolume}
          oninput={() => updateSimulation()}
        />
        <span class="help-text">Higher = faster AI generation</span>
      </label>
    </div>
    
    <button onclick={() => updateSimulation()}>Reset Simulation</button>
  </div>
  
  <div class="explanation">
    <h3>What This Shows</h3>
    <p>
      <strong>Measured TFP</strong> (lightest line) rises steadily - conventional productivity metrics show growth.
    </p>
    <p>
      <strong>Verified TFP</strong> (middle line) stagnates or declines - actual utility-relevant productivity accounting for verification costs and remediation burden.
    </p>
    <p>
      <strong>Epistemic Debt</strong> (dashed line) accumulates - the gap between system complexity and cognitive grasp compounds over time.
    </p>
    <p class="warning">
      The <strong>shaded cascade zone</strong> marks when verification costs exceed forwarding costs sufficiently that rational agents stop verifying - information aggregation fails even as throughput metrics soar.
    </p>
  </div>
</div>

<style>
  .viz-container {
    width: 100%;
    background: rgba(20, 26, 32, 0.8);
    border: 1px solid rgba(166, 182, 194, 0.3);
    border-radius: 12px;
    padding: 2rem;
  }
  
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
  
  /* D3 Chart Styles */
  :global(.x-axis text),
  :global(.y-axis text),
  :global(.x-axis path),
  :global(.y-axis path),
  :global(.x-axis line),
  :global(.y-axis line) {
    stroke: var(--accent);
    fill: var(--accent);
    font-size: 12px;
  }
  
  :global(.chart-title) {
    fill: var(--highlight);
    font-size: 18px;
    font-weight: 600;
  }
  
  :global(.axis-label) {
    fill: var(--highlight);
    font-size: 14px;
    font-weight: 500;
  }
  
  :global(.debt-area) {
    fill: rgba(132, 152, 166, 0.15);
    stroke: none;
  }
  
  :global(.line-measured) {
    fill: none;
    stroke: var(--highlight);
    stroke-width: 3;
  }
  
  :global(.line-verified) {
    fill: none;
    stroke: var(--accent);
    stroke-width: 3;
  }
  
  :global(.line-debt) {
    fill: none;
    stroke: var(--light);
    stroke-width: 2;
    stroke-dasharray: 5,5;
  }
  
  :global(.cascade-zone) {
    fill: rgba(132, 152, 166, 0.08);
    pointer-events: none;
  }
  
  :global(.cascade-label) {
    fill: var(--accent);
    font-size: 12px;
    font-weight: 600;
  }
  
  :global(.legend-line) {
    stroke-width: 3;
  }
  
  :global(.legend-line[data-type="measured-tfp"]) {
    stroke: var(--highlight);
  }
  
  :global(.legend-line[data-type="verified-tfp"]) {
    stroke: var(--accent);
  }
  
  :global(.legend-line-dashed) {
    stroke: var(--light);
    stroke-width: 2;
    stroke-dasharray: 5,5;
  }
  
  :global(.legend-text) {
    fill: var(--highlight);
    font-size: 12px;
    font-weight: 500;
  }
  
  .controls {
    display: flex;
    gap: 2rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(166, 182, 194, 0.2);
    flex-wrap: wrap;
    align-items: flex-end;
  }
  
  .control-group {
    flex: 1;
    min-width: 200px;
  }
  
  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .label-text {
    color: var(--highlight);
    font-size: 0.9375rem;
    font-weight: 500;
  }
  
  .help-text {
    color: var(--accent);
    font-size: 0.8125rem;
    font-style: italic;
  }
  
  input[type="range"] {
    width: 100%;
    height: 6px;
    background: rgba(68, 88, 104, 0.5);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: var(--accent);
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  
  input[type="range"]::-webkit-slider-thumb:hover {
    background: var(--highlight);
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: var(--accent);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    transition: background 0.2s ease;
  }
  
  input[type="range"]::-moz-range-thumb:hover {
    background: var(--highlight);
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background: rgba(132, 152, 166, 0.2);
    border: 1px solid var(--accent);
    border-radius: 6px;
    color: var(--highlight);
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  button:hover {
    background: rgba(132, 152, 166, 0.3);
    border-color: var(--highlight);
  }
  
  .explanation {
    margin-top: 2rem;
    padding: 1.5rem;
    background: rgba(42, 56, 68, 0.4);
    border: 1px solid rgba(166, 182, 194, 0.2);
    border-radius: 8px;
  }
  
  .explanation h3 {
    color: var(--highlight);
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
  }
  
  .explanation p {
    color: var(--accent);
    line-height: 1.7;
    margin: 0.75rem 0;
    font-size: 0.9375rem;
  }
  
  .explanation strong {
    font-weight: 600;
    color: var(--highlight);
  }
  
  .explanation .warning {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(166, 182, 194, 0.1);
    color: var(--accent);
  }
  
  @media (max-width: 768px) {
    .viz-container {
      padding: 1rem;
    }
    
    .controls {
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .control-group {
      min-width: 100%;
    }
  }
</style>
