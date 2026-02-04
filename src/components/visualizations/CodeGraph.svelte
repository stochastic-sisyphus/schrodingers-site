<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { GraphData, GraphNode, GraphEdge } from '../../lib/visualizations/code-analyzer';
  import { d3Colors, d3CodeTextStyle, applyTooltipStyles, d3Interaction } from '../../lib/d3-styles';

  export let data: GraphData;

  let container: HTMLDivElement;
  let width = 800;
  let height = 600;

  // Steel-teal palette
  const colorScale = d3.scaleOrdinal<string>()
    .domain(['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Other'])
    .range([d3Colors.accent, d3Colors.secondary, d3Colors.tertiary, d3Colors.base, d3Colors.primary, d3Colors.deep]);

  onMount(() => {
    if (!data || data.nodes.length === 0) return;

    // Responsive sizing
    const updateSize = () => {
      width = container.offsetWidth;
      height = Math.max(500, Math.min(600, width * 0.75));
    };

    updateSize();
    window.addEventListener('resize', debounce(updateSize, 250));

    renderGraph();

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  });

  function renderGraph() {
    // Clear previous content
    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create force simulation
    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(data.edges)
        .id(d => d.id)
        .distance(d => 80 / Math.sqrt(d.weight))
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 5));

    // Create arrow markers for edges
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', d3Colors.tertiary)
      .attr('opacity', 0.3);

    // Create edges
    const link = svg.append('g')
      .selectAll('line')
      .data(data.edges)
      .join('line')
      .attr('stroke', d3Colors.tertiary)
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', d => Math.sqrt(d.weight));

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(drag(simulation) as any);

    // Node circles
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => {
        if (d.type === 'dir') return d3Colors.secondary;
        return colorScale(d.language || 'Other');
      })
      .attr('stroke', d3Colors.primary)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.5)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(d3Interaction.transitionDuration)
          .attr('r', d.size * 1.3)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 1);

        // Dim unrelated nodes
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        data.edges.forEach(edge => {
          const src = typeof edge.source === 'string' ? edge.source : (edge.source as any).id;
          const tgt = typeof edge.target === 'string' ? edge.target : (edge.target as any).id;
          if (src === d.id) connectedIds.add(tgt);
          if (tgt === d.id) connectedIds.add(src);
        });

        node.selectAll('circle')
          .transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', (n: any) => connectedIds.has(n.id) ? d3Interaction.activeOpacity : d3Interaction.dimmedOpacity);

        node.selectAll('text')
          .transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', (n: any) => connectedIds.has(n.id) ? 0.8 : d3Interaction.hoverDimmedOpacity);

        // Show connected edges
        link.transition()
          .duration(200)
          .attr('stroke-opacity', edge =>
            edge.source === d || edge.target === d ? 0.8 : 0.1
          )
          .attr('stroke-width', edge =>
            edge.source === d || edge.target === d ? Math.sqrt(edge.weight) * 2 : Math.sqrt(edge.weight)
          );

        // Show tooltip
        showTooltip(event, d);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(d3Interaction.transitionDuration)
          .attr('r', d.size)
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.5);

        // Restore all nodes
        node.selectAll('circle')
          .transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', d3Interaction.activeOpacity);

        node.selectAll('text')
          .transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', 0.8);

        // Reset edges
        link.transition()
          .duration(d3Interaction.transitionDuration)
          .attr('stroke-opacity', 0.3)
          .attr('stroke-width', edge => Math.sqrt(edge.weight));

        hideTooltip();
      });

    // Node labels
    node.append('text')
      .text(d => d.label)
      .attr('font-size', d3CodeTextStyle.fontSize)
      .attr('fill', d3CodeTextStyle.fill)
      .attr('font-family', d3CodeTextStyle.fontFamily)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size + 15)
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .style('opacity', 0.8);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }

  function drag(simulation: d3.Simulation<GraphNode, undefined>) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  function showTooltip(event: MouseEvent, d: GraphNode) {
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'tooltip');

    applyTooltipStyles(tooltip)
      .style('left', `${event.offsetX + 10}px`)
      .style('top', `${event.offsetY + 10}px`)
      .style('font-family', d3CodeTextStyle.fontFamily);

    tooltip.html(`
      <div><strong>${d.label}</strong></div>
      <div>Type: ${d.type}</div>
      ${d.language ? `<div>Language: ${d.language}</div>` : ''}
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

<div class="code-graph-container" bind:this={container}></div>

<style>
  .code-graph-container {
    width: 100%;
    min-height: 500px;
    position: relative;
  }

  .code-graph-container :global(svg) {
    background: rgba(20, 26, 32, 0.3);
    border-radius: 8px;
  }
</style>
