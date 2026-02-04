<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { TimelineDataPoint } from '../../lib/visualizations/activity-analyzer';
  import { d3Colors, d3TextStyle, applyTooltipStyles, d3Interaction } from '../../lib/d3-styles';

  export let data: TimelineDataPoint[];

  let container: HTMLDivElement;
  let width = 800;
  let height = 300;

  onMount(() => {
    if (!data || data.length === 0) return;

    const updateSize = () => {
      width = container.offsetWidth;
      height = Math.max(250, Math.min(300, width * 0.4));
    };

    updateSize();
    window.addEventListener('resize', debounce(updateSize, 250));

    renderTimeline();

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  });

  function renderTimeline() {
    d3.select(container).selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Gradient fill
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3Colors.accent)
      .attr('stop-opacity', 0.6);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3Colors.tertiary)
      .attr('stop-opacity', 0.1);

    // Area generator
    const area = d3.area<TimelineDataPoint>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3.line<TimelineDataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Draw area
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Draw line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', d3Colors.primary)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add interactive points
    const points = g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.count))
      .attr('r', 3)
      .attr('fill', d3Colors.accent)
      .attr('stroke', d3Colors.primary)
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(d3Interaction.transitionDuration)
          .attr('r', 6)
          .attr('stroke-width', 2);

        // Dim other points
        points.transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', (p: any) => p === d ? d3Interaction.activeOpacity : d3Interaction.dimmedOpacity);

        showTooltip(event, d);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(d3Interaction.transitionDuration)
          .attr('r', 3)
          .attr('stroke-width', 1);

        // Restore all points
        points.transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', d3Interaction.activeOpacity);

        hideTooltip();
      });

    // X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(6, data.length))
      .tickFormat(d3.timeFormat('%b %d, %Y') as any);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', d3Colors.tertiary))
      .call(g => g.selectAll('.tick line').attr('stroke', d3Colors.tertiary))
      .call(g => g.selectAll('.tick text')
        .attr('fill', d3TextStyle.fill)
        .attr('font-size', d3TextStyle.fontSize)
        .attr('font-family', d3TextStyle.fontFamily));

    // Y axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}`);

    g.append('g')
      .call(yAxis)
      .call(g => g.select('.domain').attr('stroke', d3Colors.tertiary))
      .call(g => g.selectAll('.tick line').attr('stroke', d3Colors.tertiary))
      .call(g => g.selectAll('.tick text')
        .attr('fill', d3TextStyle.fill)
        .attr('font-size', d3TextStyle.fontSize)
        .attr('font-family', d3TextStyle.fontFamily));

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', d3TextStyle.fill)
      .attr('font-size', d3TextStyle.fontSize)
      .attr('font-family', d3TextStyle.fontFamily)
      .text('Commits');
  }

  function showTooltip(event: MouseEvent, d: TimelineDataPoint) {
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'tooltip');

    applyTooltipStyles(tooltip)
      .style('left', `${event.offsetX + 10}px`)
      .style('top', `${event.offsetY - 40}px`);

    tooltip.html(`
      <div><strong>${d.date.toLocaleDateString()}</strong></div>
      <div>${d.count} commit${d.count !== 1 ? 's' : ''}</div>
    `);
  }

  function hideTooltip() {
    d3.select(container).selectAll('.tooltip').remove();
  }

  function debounce(fn: Function, delay: number) {
    let timeout: number;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay) as any;
    };
  }
</script>

<div class="timeline-container" bind:this={container}></div>

<style>
  .timeline-container {
    width: 100%;
    min-height: 250px;
    position: relative;
  }

  .timeline-container :global(svg) {
    background: rgba(20, 26, 32, 0.3);
    border-radius: 8px;
  }
</style>
