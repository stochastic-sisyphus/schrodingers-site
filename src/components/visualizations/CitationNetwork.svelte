<script lang="ts">
  /**
   * CitationNetwork - Force-directed graph visualization of citation relationships
   * Steel-teal gradient with sophisticated node interactions
   */

  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let papers: Array<{
    id: string;
    title: string;
    year: number;
    citations?: string[]; // Array of paper IDs that this paper cites
    citationCount?: number;
  }> = [];

  let svgElement: SVGSVGElement;
  let container: HTMLDivElement;
  let tooltipElement: HTMLDivElement;

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  let width = 800;
  let height = 600;

  onMount(() => {
    if (!container) return;

    const updateDimensions = () => {
      width = container.clientWidth;
      height = Math.min(700, Math.max(400, container.clientHeight));
      renderVisualization();
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  });

  function renderVisualization() {
    if (!svgElement || papers.length === 0) return;

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

    // Create nodes and links
    const nodes = papers.map((p) => ({
      id: p.id,
      title: p.title,
      year: p.year,
      citationCount: p.citationCount || 0,
    }));

    const links: Array<{ source: string; target: string }> = [];
    papers.forEach((paper) => {
      if (paper.citations) {
        paper.citations.forEach((citedId) => {
          if (papers.find((p) => p.id === citedId)) {
            links.push({ source: paper.id, target: citedId });
          }
        });
      }
    });

    // If no citation data, create a temporal network based on years
    if (links.length === 0 && papers.length > 1) {
      const sortedPapers = [...papers].sort((a, b) => a.year - b.year);
      for (let i = 1; i < sortedPapers.length; i++) {
        links.push({
          source: sortedPapers[i].id,
          target: sortedPapers[i - 1].id,
        });
      }
    }

    // Color scale based on year
    const yearExtent = d3.extent(nodes, (d) => d.year) as [number, number];
    const colorScale = d3
      .scaleLinear<string>()
      .domain(yearExtent)
      .range(['#445868', '#a6b6c2']);

    // Size scale based on citations
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(nodes, (d) => d.citationCount) || 1])
      .range([6, 16]);

    // Gradient definitions
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#627888')
      .attr('stop-opacity', 0.3);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8498a6')
      .attr('stop-opacity', 0.1);

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => sizeScale(d.citationCount) + 5));

    // Links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .style('stroke', 'url(#link-gradient)')
      .style('stroke-width', 1.5)
      .style('opacity', 0.4);

    // Nodes
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<any, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    // Node circles
    node
      .append('circle')
      .attr('r', (d) => sizeScale(d.citationCount))
      .style('fill', (d) => colorScale(d.year))
      .style('stroke', '#a6b6c2')
      .style('stroke-width', 1.5)
      .style('cursor', 'pointer');

    // Node glow effect on hover
    const tooltip = d3.select(tooltipElement);

    node
      .on('mouseenter', function (event, d: any) {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .style('stroke-width', 3)
          .style('filter', 'drop-shadow(0 0 8px rgba(166, 182, 194, 0.6))');

        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .html(`
            <div class="tooltip-title">${d.title}</div>
            <div class="tooltip-meta">
              <span>Year: ${d.year}</span>
              ${d.citationCount > 0 ? `<span>Citations: ${d.citationCount}</span>` : ''}
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
          .select('circle')
          .transition()
          .duration(200)
          .style('stroke-width', 1.5)
          .style('filter', 'none');

        tooltip.style('opacity', 0);
      });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
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

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('fill', '#a6b6c2')
      .style('font-family', 'Cormorant Garamond, serif')
      .style('font-size', '18px')
      .style('font-weight', '500')
      .text('Citation Network');

    // Legend
    const legend = svg.append('g').attr('transform', `translate(20, 50)`);

    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('fill', '#8498a6')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '11px')
      .text('Node size = citations');

    legend
      .append('text')
      .attr('x', 0)
      .attr('y', 15)
      .style('fill', '#8498a6')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '11px')
      .text('Color = year');
  }
</script>

<div class="network-container" bind:this={container}>
  {#if papers.length === 0}
    <div class="empty-state">
      <p>No citation data available</p>
    </div>
  {:else}
    <svg bind:this={svgElement}></svg>
    <div class="tooltip" bind:this={tooltipElement}></div>
  {/if}
</div>

<style>
  .network-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
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
    color: var(--light);
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

  .tooltip :global(.tooltip-title) {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    color: var(--highlight);
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .tooltip :global(.tooltip-meta) {
    display: flex;
    gap: 1rem;
    color: var(--accent);
    font-size: 0.75rem;
  }

  @media (max-width: 768px) {
    .network-container {
      min-height: 300px;
      padding: 0.5rem;
    }
  }
</style>
