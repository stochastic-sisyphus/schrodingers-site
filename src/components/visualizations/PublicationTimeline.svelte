<script lang="ts">
  /**
   * PublicationTimeline - D3.js timeline visualization of research publications
   * Steel-teal gradient aesthetic with elegant interactions
   */

  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { d3Colors, d3TitleStyle, d3AxisLabelStyle, d3TextStyle, d3Interaction } from '../../lib/d3-styles';

  export let publications: Array<{
    id: string;
    title: string;
    year: number;
    type: string;
    journal?: string;
  }> = [];

  let svgElement: SVGSVGElement;
  let container: HTMLDivElement;
  let tooltipElement: HTMLDivElement;

  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  let width = 800;
  let height = 400;

  onMount(() => {
    if (!container) return;

    const updateDimensions = () => {
      width = container.clientWidth;
      height = Math.min(500, Math.max(300, container.clientHeight));
      renderVisualization();
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  });

  function renderVisualization() {
    if (!svgElement || publications.length === 0) return;

    // Clear existing content
    d3.select(svgElement).selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgElement)
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Group publications by year
    const yearGroups = d3.rollup(
      publications,
      (v) => v.length,
      (d) => d.year
    );

    const years = Array.from(yearGroups.keys()).sort((a, b) => a - b);
    const counts = Array.from(yearGroups.values());

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(years)!, d3.max(years)!])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(counts)!])
      .range([innerHeight, 0]);

    // Gradient definition
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'timeline-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3Colors.tertiary);

    gradient
      .append('stop')
      .attr('offset', '50%')
      .attr('stop-color', d3Colors.secondary);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3Colors.accent);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat(d3.format('d'))
      .ticks(Math.min(years.length, 10));

    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', d3TextStyle.fill)
      .style('font-family', d3TextStyle.fontFamily)
      .style('font-size', d3TextStyle.fontSize);

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('fill', d3TextStyle.fill)
      .style('font-family', d3TextStyle.fontFamily)
      .style('font-size', d3TextStyle.fontSize);

    // Style axis lines
    g.selectAll('.x-axis path, .y-axis path')
      .style('stroke', `${d3Colors.primary}33`);

    g.selectAll('.x-axis line, .y-axis line')
      .style('stroke', `${d3Colors.primary}1a`);

    // Area chart
    const area = d3
      .area<[number, number]>()
      .x((d) => xScale(d[0]))
      .y0(innerHeight)
      .y1((d) => yScale(d[1]))
      .curve(d3.curveCatmullRom);

    const areaData: Array<[number, number]> = years.map((year) => [
      year,
      yearGroups.get(year)!,
    ]);

    g.append('path')
      .datum(areaData)
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', 'url(#timeline-gradient)')
      .style('opacity', 0.2);

    // Line chart
    const line = d3
      .line<[number, number]>()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(d3.curveCatmullRom);

    g.append('path')
      .datum(areaData)
      .attr('class', 'line')
      .attr('d', line)
      .style('fill', 'none')
      .style('stroke', 'url(#timeline-gradient)')
      .style('stroke-width', 2);

    // Data points
    const tooltip = d3.select(tooltipElement);

    const points = g.selectAll('.point')
      .data(areaData)
      .join('circle')
      .attr('class', 'point')
      .attr('cx', (d) => xScale(d[0]))
      .attr('cy', (d) => yScale(d[1]))
      .attr('r', 4)
      .style('fill', d3Colors.primary)
      .style('stroke', d3Colors.secondary)
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(d3Interaction.transitionDuration)
          .attr('r', 6)
          .style('fill', d3Colors.accent);

        // Dim other points
        points.transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', function() { return this === event.currentTarget ? d3Interaction.activeOpacity : d3Interaction.dimmedOpacity; });

        const yearPubs = publications.filter((p) => p.year === d[0]);

        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .html(`
            <div class="tooltip-year">${d[0]}</div>
            <div class="tooltip-count">${d[1]} publication${d[1] > 1 ? 's' : ''}</div>
            <div class="tooltip-titles">
              ${yearPubs.slice(0, 3).map(p => `<div>• ${p.title.slice(0, 50)}${p.title.length > 50 ? '...' : ''}</div>`).join('')}
              ${yearPubs.length > 3 ? `<div>• ...and ${yearPubs.length - 3} more</div>` : ''}
            </div>
          `);
      })
      .on('mousemove', function (event) {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(d3Interaction.transitionDuration)
          .attr('r', 4)
          .style('fill', d3Colors.primary);

        // Restore all points
        points.transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', d3Interaction.activeOpacity);

        tooltip.style('opacity', 0);
      });

    // Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('fill', d3TitleStyle.fill)
      .style('font-family', d3TitleStyle.fontFamily)
      .style('font-size', d3TitleStyle.fontSize)
      .style('font-weight', d3TitleStyle.fontWeight)
      .text('Publication Timeline');

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .style('fill', d3AxisLabelStyle.fill)
      .style('font-family', d3AxisLabelStyle.fontFamily)
      .style('font-size', d3AxisLabelStyle.fontSize)
      .text('Year');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('fill', d3AxisLabelStyle.fill)
      .style('font-family', d3AxisLabelStyle.fontFamily)
      .style('font-size', d3AxisLabelStyle.fontSize)
      .text('Publications');
  }
</script>

<div class="timeline-container" bind:this={container}>
  {#if publications.length === 0}
    <div class="empty-state">
      <p>No publication data available</p>
    </div>
  {:else}
    <svg bind:this={svgElement}></svg>
    <div class="tooltip" bind:this={tooltipElement}></div>
  {/if}
</div>

<style>
  .timeline-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
    position: relative;
    background: rgba(68, 88, 104, 0.05);
    border-radius: 12px;
    padding: 1rem;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--highlight);
  }

  .tooltip {
    position: fixed;
    background: rgba(42, 56, 68, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(166, 182, 194, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1000;
    max-width: 300px;
  }

  .tooltip :global(.tooltip-year) {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.25rem;
    color: var(--text-heading);
    margin-bottom: 0.25rem;
  }

  .tooltip :global(.tooltip-count) {
    color: var(--text-body);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .tooltip :global(.tooltip-titles) {
    font-size: 0.75rem;
    color: var(--text-body);
    line-height: 1.4;
  }

  .tooltip :global(.tooltip-titles div) {
    margin: 0.25rem 0;
  }

  @media (max-width: 768px) {
    .timeline-container {
      min-height: 250px;
      padding: 0.5rem;
    }
  }
</style>
