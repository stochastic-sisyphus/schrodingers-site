<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { Contributor } from '../../lib/types';

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
      .attr('stroke', '#445868')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 2);

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation) as any);

    // Node circles
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', (d, i) => {
        const colors = ['#8498a6', '#627888', '#445868', '#a6b6c2', '#2a3844'];
        return colors[i % colors.length];
      })
      .attr('stroke', '#a6b6c2')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size * 1.2)
          .attr('stroke-width', 2.5)
          .attr('stroke-opacity', 1);

        showTooltip(event, d);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.6);

        hideTooltip();
      });

    // Node labels
    node.append('text')
      .text(d => d.label.length > 15 ? d.label.substring(0, 12) + '...' : d.label)
      .attr('font-size', 11)
      .attr('fill', '#a6b6c2')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size + 18)
      .style('pointer-events', 'none')
      .style('user-select', 'none');

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
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('left', `${event.offsetX + 10}px`)
      .style('top', `${event.offsetY + 10}px`)
      .style('background', 'rgba(42, 56, 68, 0.95)')
      .style('color', '#a6b6c2')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('border', '1px solid rgba(166, 182, 194, 0.3)')
      .style('backdrop-filter', 'blur(10px)')
      .style('z-index', '1000');

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
