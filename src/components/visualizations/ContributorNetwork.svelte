<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { Contributor } from '../../lib/types';
  import { d3Colors, d3TextStyle, applyTooltipStyles, d3Interaction, createColorScale } from '../../lib/d3-styles';

  export let data: Contributor[] | { name: string; value: number }[];
  export let type: 'contributors' | 'technologies' = 'contributors';

  let container: HTMLDivElement;
  let width = 800;
  let height = 400;

  interface NetworkNode {
    id: string;
    label: string;
    size: number;
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
  }

  onMount(() => {
    if (!data || data.length === 0) return;

    const updateSize = () => {
      width = container.offsetWidth;
      height = Math.max(350, Math.min(400, width * 0.5));
    };

    updateSize();
    window.addEventListener('resize', debounce(updateSize, 250));

    renderNetwork();

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  });

  function renderNetwork() {
    d3.select(container).selectAll('*').remove();

    // Transform data to nodes
    const nodes: NetworkNode[] = type === 'contributors'
      ? (data as Contributor[]).map(c => ({
          id: c.login,
          label: c.login,
          size: Math.log(c.contributions + 1) * 10,
        }))
      : (data as { name: string; value: number }[]).map(t => ({
          id: t.name,
          label: t.name,
          size: Math.log(t.value + 1) * 8,
        }));

    // For solo projects or tech stacks, create a central node
    if (nodes.length === 1 || type === 'technologies') {
      nodes.unshift({
        id: 'center',
        label: type === 'contributors' ? 'Project' : 'Stack',
        size: 30,
      });
    }

    // Create simple edges connecting all nodes to center
    const edges = nodes.length > 1
      ? nodes.slice(1).map(node => ({
          source: 'center',
          target: node.id,
        }))
      : [];

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create force simulation
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 20));

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', d3Colors.tertiary)
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 2);

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation) as any);

    // Node circles
    const colorScaleFn = createColorScale(nodes.length);
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', (d, i) => colorScaleFn(i))
      .attr('stroke', d3Colors.primary)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(d3Interaction.transitionDuration)
          .attr('r', d.size * 1.2)
          .attr('stroke-width', 2.5)
          .attr('stroke-opacity', 1);

        // Dim unrelated nodes
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        edges.forEach(edge => {
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

        link.transition()
          .duration(d3Interaction.transitionDuration)
          .attr('stroke-opacity', (e: any) => {
            const src = typeof e.source === 'string' ? e.source : e.source.id;
            const tgt = typeof e.target === 'string' ? e.target : e.target.id;
            return src === d.id || tgt === d.id ? 0.8 : 0.1;
          });

        showTooltip(event, d);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(d3Interaction.transitionDuration)
          .attr('r', d.size)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.6);

        // Restore all nodes
        node.selectAll('circle')
          .transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', d3Interaction.activeOpacity);

        node.selectAll('text')
          .transition()
          .duration(d3Interaction.transitionDuration)
          .style('opacity', 0.8);

        link.transition()
          .duration(d3Interaction.transitionDuration)
          .attr('stroke-opacity', 0.4);

        hideTooltip();
      });

    // Node labels
    node.append('text')
      .text(d => d.label.length > 15 ? d.label.substring(0, 12) + '...' : d.label)
      .attr('font-size', d3TextStyle.fontSize)
      .attr('fill', d3TextStyle.fill)
      .attr('font-family', d3TextStyle.fontFamily)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size + 18)
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

  function drag(simulation: d3.Simulation<NetworkNode, undefined>) {
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

  function showTooltip(event: MouseEvent, d: NetworkNode) {
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'tooltip');

    applyTooltipStyles(tooltip)
      .style('left', `${event.offsetX + 10}px`)
      .style('top', `${event.offsetY + 10}px`);

    tooltip.html(`
      <div><strong>${d.label}</strong></div>
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

<div class="network-container" bind:this={container}></div>

<style>
  .network-container {
    width: 100%;
    min-height: 350px;
    position: relative;
  }

  .network-container :global(svg) {
    background: rgba(20, 26, 32, 0.3);
    border-radius: 8px;
  }
</style>
