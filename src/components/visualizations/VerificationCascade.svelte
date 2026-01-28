<script lang="ts">
  import { onMount } from 'svelte';
  
  export let width = 800;
  export let height = 600;
  
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let animationFrame: number;
  
  // Simulation parameters
  let verificationCost = 0.7;
  let forwardingCost = 0.1;
  let benefitNet = 0.5;
  
  // Agent states
  interface Agent {
    id: number;
    x: number;
    y: number;
    belief: number; // 0-1, probability artifact is valid
    action: 'verify' | 'forward' | 'pending';
    signalReceived: boolean;
    privateSignal: number;
  }
  
  let agents: Agent[] = [];
  let currentAgent = 0;
  let artifactValid = Math.random() > 0.3; // True state
  let cascadeFormed = false;
  let time = 0;
  
  // Initialize agents in a chain
  function initAgents() {
    agents = [];
    const numAgents = 8;
    const spacing = width / (numAgents + 1);
    
    for (let i = 0; i < numAgents; i++) {
      agents.push({
        id: i,
        x: spacing * (i + 1),
        y: height / 2,
        belief: 0.5, // Prior
        action: 'pending',
        signalReceived: false,
        privateSignal: 0
      });
    }
  }
  
  // Calculate forwarding threshold from Proposition 1
  function getForwardingThreshold(): number {
    return 1 - (verificationCost - forwardingCost) / benefitNet;
  }
  
  // Agent decision logic
  function agentDecision(agent: Agent): 'verify' | 'forward' {
    const threshold = getForwardingThreshold();
    
    // If cost gap exceeds benefit, always forward (cascade condition)
    if (threshold <= 0) {
      cascadeFormed = true;
      return 'forward';
    }
    
    // Otherwise, forward if belief > threshold
    return agent.belief > threshold ? 'forward' : 'verify';
  }
  
  // Update beliefs based on observed actions (Bayesian updating)
  function updateBelief(agent: Agent, priorActions: string[]): number {
    // Simplified: if many forwards, increase belief (herding)
    const forwardCount = priorActions.filter(a => a === 'forward').length;
    const verifyCount = priorActions.filter(a => a === 'verify').length;
    
    // Weight prior actions more than private signal once cascade forms
    if (forwardCount > 2) {
      return 0.6 + Math.random() * 0.3; // High belief -> forward
    }
    
    // Otherwise, use private signal
    return agent.privateSignal;
  }
  
  // Simulation step
  function step() {
    if (currentAgent >= agents.length) return;
    
    const agent = agents[currentAgent];
    
    // Receive private signal
    if (!agent.signalReceived) {
      const signalAccuracy = 0.7;
      agent.privateSignal = artifactValid 
        ? (Math.random() < signalAccuracy ? 0.8 : 0.2)
        : (Math.random() < signalAccuracy ? 0.2 : 0.8);
      agent.signalReceived = true;
    }
    
    // Update belief based on prior actions
    const priorActions = agents.slice(0, currentAgent).map(a => a.action);
    agent.belief = updateBelief(agent, priorActions);
    
    // Make decision
    agent.action = agentDecision(agent);
    
    currentAgent++;
    time++;
  }
  
  // Draw visualization
  function draw() {
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#141a20';
    ctx.fillRect(0, 0, width, height);
    
    // Draw threshold line
    const threshold = getForwardingThreshold();
    const thresholdY = height - (threshold * height * 0.6 + height * 0.2);
    ctx.strokeStyle = 'rgba(166, 182, 194, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(width, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw threshold label
    ctx.fillStyle = '#8498a6';
    ctx.font = '12px Inter';
    ctx.fillText(`Forwarding threshold: ${threshold.toFixed(2)}`, 10, thresholdY - 5);
    
    // Draw connections
    ctx.strokeStyle = 'rgba(132, 152, 166, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < agents.length - 1; i++) {
      const a1 = agents[i];
      const a2 = agents[i + 1];
      
      if (a1.action !== 'pending') {
        ctx.beginPath();
        ctx.moveTo(a1.x, a1.y);
        ctx.lineTo(a2.x, a2.y);
        ctx.stroke();
      }
    }
    
    // Draw agents
    agents.forEach((agent, i) => {
      const radius = 20;
      
      // Belief indicator (vertical position)
      const beliefY = height - (agent.belief * height * 0.6 + height * 0.2);
      
      // Draw belief line
      if (agent.signalReceived) {
        ctx.strokeStyle = 'rgba(166, 182, 194, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(agent.x, agent.y);
        ctx.lineTo(agent.x, beliefY);
        ctx.stroke();
      }
      
      // Agent circle
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, radius, 0, Math.PI * 2);
      
      // Color by action
      if (agent.action === 'verify') {
        ctx.fillStyle = '#627888';
        ctx.strokeStyle = '#8498a6';
      } else if (agent.action === 'forward') {
        ctx.fillStyle = cascadeFormed ? '#445868' : '#2a3844';
        ctx.strokeStyle = cascadeFormed ? '#627888' : '#445868';
      } else {
        ctx.fillStyle = '#2a3844';
        ctx.strokeStyle = '#445868';
      }
      
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Belief indicator dot
      if (agent.signalReceived) {
        ctx.beginPath();
        ctx.arc(agent.x, beliefY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#a6b6c2';
        ctx.fill();
      }
      
      // Label
      ctx.fillStyle = '#a6b6c2';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`A${i + 1}`, agent.x, agent.y + 35);
      
      if (agent.action !== 'pending') {
        ctx.fillText(
          agent.action === 'verify' ? 'V' : 'F',
          agent.x,
          agent.y + 5
        );
      }
    });
    
    // Draw info panel
    ctx.fillStyle = 'rgba(42, 56, 68, 0.8)';
    ctx.fillRect(10, 10, 280, 140);
    ctx.strokeStyle = 'rgba(166, 182, 194, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 280, 140);
    
    ctx.fillStyle = '#a6b6c2';
    ctx.font = '13px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Verification Cascade Dynamics', 20, 30);
    
    ctx.font = '11px Inter';
    ctx.fillStyle = '#8498a6';
    ctx.fillText(`Verification cost: ${verificationCost.toFixed(2)}`, 20, 50);
    ctx.fillText(`Forwarding cost: ${forwardingCost.toFixed(2)}`, 20, 65);
    ctx.fillText(`Cost gap: ${(verificationCost - forwardingCost).toFixed(2)}`, 20, 80);
    ctx.fillText(`Benefit (net): ${benefitNet.toFixed(2)}`, 20, 95);
    
    ctx.fillStyle = cascadeFormed ? '#627888' : '#445868';
    ctx.fillText(
      cascadeFormed ? 'CASCADE FORMED' : 'Normal operation',
      20,
      115
    );
    
    ctx.fillStyle = '#8498a6';
    ctx.fillText(
      `Artifact is actually: ${artifactValid ? 'VALID' : 'INVALID'}`,
      20,
      130
    );
    
    // Legend
    ctx.fillStyle = 'rgba(42, 56, 68, 0.8)';
    ctx.fillRect(width - 160, 10, 150, 80);
    ctx.strokeStyle = 'rgba(166, 182, 194, 0.3)';
    ctx.strokeRect(width - 160, 10, 150, 80);
    
    ctx.fillStyle = '#a6b6c2';
    ctx.font = '11px Inter';
    ctx.fillText('V = Verify', width - 150, 30);
    ctx.fillText('F = Forward', width - 150, 45);
    ctx.fillText('Dot = Belief level', width - 150, 60);
    ctx.fillText('(higher = more confident)', width - 150, 75);
  }
  
  // Animation loop
  function animate() {
    draw();
    
    if (currentAgent < agents.length && time % 60 === 0) {
      step();
    }
    
    time++;
    animationFrame = requestAnimationFrame(animate);
  }
  
  // Reset simulation
  function reset() {
    currentAgent = 0;
    cascadeFormed = false;
    time = 0;
    artifactValid = Math.random() > 0.3;
    initAgents();
  }
  
  // Control handlers
  function handleVerificationCostChange(e: Event) {
    verificationCost = parseFloat((e.target as HTMLInputElement).value);
    reset();
  }
  
  function handleBenefitChange(e: Event) {
    benefitNet = parseFloat((e.target as HTMLInputElement).value);
    reset();
  }
  
  onMount(() => {
    ctx = canvas.getContext('2d')!;
    initAgents();
    animate();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });
</script>

<div class="cascade-viz">
  <canvas bind:this={canvas} {width} {height}></canvas>
  
  <div class="controls">
    <div class="control-group">
      <label>
        Verification Cost: {verificationCost.toFixed(2)}
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={verificationCost}
          on:input={handleVerificationCostChange}
        />
      </label>
    </div>
    
    <div class="control-group">
      <label>
        Expected Benefit: {benefitNet.toFixed(2)}
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={benefitNet}
          on:input={handleBenefitChange}
        />
      </label>
    </div>
    
    <button on:click={reset}>Reset Simulation</button>
  </div>
  
  <div class="explanation">
    <p>
      This visualization demonstrates <strong>Proposition 1</strong> from the paper:
      when verification cost exceeds forwarding cost by more than the expected benefit,
      agents enter a cascade equilibrium where they forward artifacts regardless of
      private beliefs.
    </p>
    <p>
      Each agent (A1-A8) receives a private signal about artifact validity (shown as
      a dot on the vertical axis). The dashed line shows the forwarding threshold.
      When beliefs exceed this threshold, agents forward (F) rather than verify (V).
    </p>
    <p>
      Adjust the costs to see how the cascade forms when verification becomes too expensive.
    </p>
  </div>
</div>

<style>
  .cascade-viz {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  canvas {
    border: 1px solid rgba(166, 182, 194, 0.2);
    border-radius: 8px;
    background: #141a20;
  }
  
  .controls {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .control-group {
    flex: 1;
    min-width: 200px;
  }
  
  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--light);
    font-size: 0.875rem;
  }
  
  input[type="range"] {
    width: 100%;
    height: 4px;
    background: rgba(68, 88, 104, 0.5);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--accent);
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  
  input[type="range"]::-webkit-slider-thumb:hover {
    background: var(--highlight);
  }
  
  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
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
    background: rgba(68, 88, 104, 0.3);
    border: 1px solid rgba(166, 182, 194, 0.3);
    border-radius: 6px;
    color: var(--accent);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  button:hover {
    background: rgba(68, 88, 104, 0.5);
    border-color: var(--accent);
    color: var(--highlight);
  }
  
  .explanation {
    padding: 1.5rem;
    background: rgba(42, 56, 68, 0.3);
    border: 1px solid rgba(166, 182, 194, 0.2);
    border-radius: 8px;
    color: var(--light);
    font-size: 0.9375rem;
    line-height: 1.7;
  }
  
  .explanation p {
    margin: 0 0 1rem 0;
  }
  
  .explanation p:last-child {
    margin-bottom: 0;
  }
  
  .explanation strong {
    color: var(--highlight);
  }
  
  @media (max-width: 768px) {
    canvas {
      width: 100%;
      height: auto;
    }
    
    .controls {
      flex-direction: column;
      align-items: stretch;
    }
    
    .control-group {
      min-width: 100%;
    }
  }
</style>
