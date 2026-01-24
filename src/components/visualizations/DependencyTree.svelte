<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import type { TreeNode } from '../../lib/visualizations/code-analyzer';

  export let data: TreeNode;

  let container: HTMLDivElement;
  let width = 800;
  let height = 600;

  onMount(() => {
    if (!data) return;

    const updateSize = () => {
      width = container.offsetWidth;
      height = Math.max(500, Math.min(600, width * 0.75));
    };

    updateSize();
    window.addEventListener('resize', debounce(updateSize, 250));

    renderTree();

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  });

  function renderTree() {
    d3.select(container).selectAll('*').remove();

    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create tree layout
    const treeLayout = d3.tree<TreeNode>()
      .size([innerHeight, innerWidth]);

    // Create hierarchy
    const root = d3.hierarchy(data);
    const treeData = treeLayout(root);

    // Color scale by depth
    const colorScale = d3.scaleOrdinal<number, string>()
      .domain([0, 1, 2, 3, 4])
      .range(['#a6b6c2', '#8498a6', '#627888', '#445868', '#2a3844']);

    // Draw links
    g.selectAll('.link')
      .data(treeData.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x)
      )
      .attr('fill', 'none')
      .attr('stroke', '#445868')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);

    // Draw nodes
    const node = g.selectAll('.node')
      .data(treeData.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Node circles
    node.append('circle')
      .attr('r', d => {
        if (d.depth === 0) return 8;
        if (d.children) return 6;
        return 4;
      })
      .attr('fill', d => colorScale(d.depth))
      .attr('stroke', '#a6b6c2')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6)
      .style('cursor', d => d.children ? 'pointer' : 'default')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.depth === 0 ? 10 : d.children ? 8 : 6)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 1);

        showTooltip(event, d);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.depth === 0 ? 8 : d.children ? 6 : 4)
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.6);

        hideTooltip();
      });

    // Node labels
    node.append('text')
      .attr('dy', 3)
      .attr('x', d => d.children ? -12 : 12)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .attr('fill', '#a6b6c2')
      .attr('font-size', 11)
      .style('user-select', 'none')
      .text(d => {
        const name = d.data.name;
        // Truncate long names
        return name.length > 25 ? name.substring(0, 22) + '...' : name;
      });
  }

  function showTooltip(event: MouseEvent, d: d3.HierarchyPointNode<TreeNode>) {
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
      .style('z-index', '1000')
      .style('max-width', '300px');

    let content = `<div><strong>${d.data.name}</strong></div>`;

    if (d.data.path) {
      content += `<div style="font-size: 10px; opacity: 0.8; margin-top: 4px;">${d.data.path}</div>`;
    }

    if (d.data.value) {
      const sizeKB = (d.data.value / 1024).toFixed(1);
      content += `<div style="margin-top: 4px;">Size: ${sizeKB} KB</div>`;
    }

    if (d.data.language) {
      content += `<div>Language: ${d.data.language}</div>`;
    }

    if (d.children) {
      content += `<div style="margin-top: 4px;">${d.children.length} children</div>`;
    }

    tooltip.html(content);
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

<div class="tree-container" bind:this={container}></div>

<style>
  .tree-container {
    width: 100%;
    min-height: 500px;
    position: relative;
  }

  .tree-container :global(svg) {
    background: rgba(20, 26, 32, 0.3);
    border-radius: 8px;
  }
</style>
