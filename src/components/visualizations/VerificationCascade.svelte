<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { d3Colors, d3TextStyle, d3LegendStyle } from '../../lib/d3-styles';

  let { width = 800, height = 500 } = $props();
  
  let verificationIntensity = $state(0.7);
  let artifactVolume = $state(1.0);
  let currentTime = $state(0);
  let isRunning = $state(false);
  let animationInterval: number;
  
  let timeSeriesData = $state<Array<{
    time: number;
    measuredTFP: number;
    verifiedTFP: number;
    epistemicDebt: number;
    cascadeRisk: number;
  }>>([]);
  
  let container: HTMLDivElement;
  let svgElement: SVGSVGElement;
  
  function calculateTimeStep(t: number) {
    const verificationCapacity = verificationIntensity * Math.exp(-0.02 * t);
    const volume = artifactVolume * Math.exp(0.05 * t);
    const measuredTFP = 1.0 + 0.03 * t;
    const remediationBurden = Math.max(0, volume - verificationCapacity * 10) * 0.1;
    const verifiedTFP = measuredTFP - remediationBurden;
    const epistemicDebt = Math.max(0, (volume - verificationCapacity * 5) * 0.5);
    const costGap = 0.8 - verificationCapacity;
    const cascadeRisk = Math.min(1, Math.max(0, costGap / 0.5));
    
    return {
      time: t,
      measuredTFP,
      verifiedTFP: Math.max(0.5, verifiedTFP),
      epistemicDebt,
      cascadeRisk
    };
  }
  
  function stepSimulation() {
    if (currentTime < 50) {
      timeSeriesData = [...timeSeriesData, calculateTimeStep(currentTime)];
      currentTime++;
      renderVisualization();
    } else {
      stopSimulation();
    }
  }
  
  function startSimulation() {
    if (isRunning) return;
    isRunning = true;
    animationInterval = setInterval(stepSimulation, 100);
  }
  
  function stopSimulation() {
    isRunning = false;
    if (animationInterval) {
      clearInterval(animationInterval);
    }
  }
  
  function resetSimulation() {
    stopSimulation();
    currentTime = 0;
    timeSeriesData = [];
    renderVisualization();
    startSimulation();
  }
  
  function renderVisualization() {
    if (!svgElement || timeSeriesData.length === 0) return;
    
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    
    const margin = { top: 40, right: 120, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(timeSeriesData, d => d.time) || 50])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(timeSeriesData, d => Math.max(d.measuredTFP, d.epistemicDebt)) || 3])
      .range([innerHeight, 0]);
    
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10));
    
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(8));
    
    const measuredLine = d3.line<typeof timeSeriesData[0]>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.measuredTFP));
    
    const verifiedLine = d3.line<typeof timeSeriesData[0]>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.verifiedTFP));
    
    const debtLine = d3.line<typeof timeSeriesData[0]>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.epistemicDebt));
    
    const debtArea = d3.area<typeof timeSeriesData[0]>()
      .x(d => xScale(d.time))
      .y0(innerHeight)
      .y1(d => yScale(d.epistemicDebt));
    
    g.append('path')
      .datum(timeSeriesData)
      .attr('class', 'debt-area')
      .attr('d', debtArea);
    
    g.append('path')
      .datum(timeSeriesData)
      .attr('class', 'line-measured')
      .attr('d', measuredLine);
    
    g.append('path')
      .datum(timeSeriesData)
      .attr('class', 'line-verified')
      .attr('d', verifiedLine);
    
    g.append('path')
      .datum(timeSeriesData)
      .attr('class', 'line-debt')
      .attr('d', debtLine);
    
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth + 10}, 20)`);
    
    const legendData = [
      { label: 'Measured', class: 'line-measured' },
      { label: 'Verified', class: 'line-verified' },
      { label: 'Debt', class: 'line-debt' }
    ];
    
    legendData.forEach((item, i) => {
      const row = legend.append('g')
        .attr('transform', `translate(0, ${i * 22})`);
      
      row.append('line')
        .attr('class', item.class)
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 0)
        .attr('y2', 0);
      
      row.append('text')
        .attr('class', 'legend-text')
        .attr('x', 25)
        .attr('y', 4)
        .text(item.label);
    });
    
    const cascadeThreshold = timeSeriesData.findIndex(d => d.cascadeRisk > 0.5);
    if (cascadeThreshold > 0) {
      g.append('rect')
        .attr('class', 'cascade-zone')
        .attr('x', xScale(cascadeThreshold))
        .attr('y', 0)
        .attr('width', innerWidth - xScale(cascadeThreshold))
        .attr('height', innerHeight);
    }
  }
  
  onMount(() => {
    startSimulation();
    
    const resizeObserver = new ResizeObserver(() => {
      renderVisualization();
    });
    
    if (container) {
      resizeObserver.observe(container);
    }
    
    return () => {
      stopSimulation();
      resizeObserver.disconnect();
    };
  });
</script>

<div class="viz-wrapper">
  <div class="viz-container" bind:this={container}>
    <svg bind:this={svgElement}></svg>
  </div>
  
  <div class="controls">
    <div class="control-group">
      <label>
        <span class="control-label">Verification: {verificationIntensity.toFixed(2)}</span>
      </label>
      <input
        type="range"
        min="0.1"
        max="1.0"
        step="0.05"
        bind:value={verificationIntensity}
        oninput={resetSimulation}
      />
    </div>
    
    <div class="control-group">
      <label>
        <span class="control-label">Volume: {artifactVolume.toFixed(2)}</span>
      </label>
      <input
        type="range"
        min="0.5"
        max="2.0"
        step="0.1"
        bind:value={artifactVolume}
        oninput={resetSimulation}
      />
    </div>
    
    <button onclick={resetSimulation}>
      {isRunning ? 'Running' : 'Reset'}
    </button>
  </div>
</div>

<style>
  .viz-wrapper {
    width: 100%;
  }

  .viz-container {
    width: 100%;
    overflow-x: auto;
    margin-bottom: 1.5rem;
  }

  svg {
    display: block;
    max-width: 100%;
    height: auto;
  }

  :global(.x-axis text),
  :global(.y-axis text) {
    fill: var(--text-body);
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }

  :global(.x-axis path),
  :global(.y-axis path),
  :global(.x-axis line),
  :global(.y-axis line) {
    stroke: var(--highlight);
    stroke-width: 1.5;
  }

  :global(.debt-area) {
    fill: var(--accent);
    fill-opacity: 0.15;
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
    fill: var(--accent);
    fill-opacity: 0.08;
    pointer-events: none;
  }

  :global(.legend-text) {
    fill: var(--text-body);
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }

  .controls {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(42, 56, 68, 0.6);
    border-radius: 8px;
    border: 1px solid rgba(166, 182, 194, 0.3);
  }

  .control-group {
    flex: 1;
    min-width: 150px;
  }

  .control-group label {
    display: block;
    margin-bottom: 0.5rem;
  }

  .control-label {
    font-weight: 500;
    color: var(--highlight);
    font-size: 0.875rem;
  }

  input[type='range'] {
    width: 100%;
    height: 4px;
    background: rgba(166, 182, 194, 0.3);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--highlight);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  input[type='range']::-webkit-slider-thumb:hover {
    background: var(--text-heading);
    transform: scale(1.15);
  }

  input[type='range']::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--highlight);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }

  input[type='range']::-moz-range-thumb:hover {
    background: var(--text-heading);
    transform: scale(1.15);
  }

  button {
    padding: 0.625rem 1.25rem;
    background: rgba(166, 182, 194, 0.2);
    border: 1px solid rgba(166, 182, 194, 0.4);
    border-radius: 6px;
    color: var(--highlight);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  button:hover {
    background: rgba(166, 182, 194, 0.3);
    border-color: rgba(166, 182, 194, 0.6);
  }

  button:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }
    
    .control-group {
      min-width: 100%;
    }
    
    button {
      width: 100%;
    }
  }
</style>
