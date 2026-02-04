<script lang="ts">
  import type { GitHubRepo } from '@/lib/types';

  export let repo: GitHubRepo;
  export let featured: boolean = false;

  const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
</script>

<a
  href={`/projects/${repo.name}`}
  class="project-card frosted-glass"
  class:featured
>
  <div class="card-header">
    <h3 class="project-name">{repo.name}</h3>
    {#if featured}
      <span class="featured-badge">featured</span>
    {/if}
  </div>

  {#if repo.description}
    <p class="project-description">{repo.description}</p>
  {/if}

  <div class="project-meta">
    {#if repo.language}
      <span class="language">
        <span class="language-dot" aria-hidden="true"></span>
        {repo.language}
      </span>
    {/if}

    {#if repo.stargazers_count > 0}
      <span class="stars">★ {repo.stargazers_count}</span>
    {/if}

    {#if repo.forks_count > 0}
      <span class="forks">⑂ {repo.forks_count}</span>
    {/if}

    <time datetime={repo.updated_at}>Updated {updatedDate}</time>
  </div>

  {#if repo.topics && repo.topics.length > 0}
    <div class="project-topics">
      {#each repo.topics.slice(0, 5) as topic}
        <a
          href={`/projects/tag/${topic}`}
          class="topic"
          on:click={(e) => e.stopPropagation()}
        >
          {topic}
        </a>
      {/each}
    </div>
  {/if}
</a>

<style>
  .project-card {
    background: var(--depth-2);
    backdrop-filter: var(--blur-medium);
    border: 1px solid rgba(166, 182, 194, 0.25);
    border-radius: 12px;
    padding: 2rem;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 280px;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(166, 182, 194, 0.05) inset;
    transition: all var(--duration-short) var(--ease-smooth);
  }

  /* Atmospheric glow layers */
  .project-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at top left,
      rgba(166, 182, 194, 0.12) 0%,
      transparent 60%
    );
    opacity: 0;
    transition: opacity var(--duration-short) var(--ease-smooth);
    pointer-events: none;
  }

  .project-card::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(166, 182, 194, 0.08) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity var(--duration-medium) var(--ease-smooth);
    pointer-events: none;
  }

  .project-card:hover {
    background: rgba(42, 56, 68, 0.9);
    border-color: rgba(166, 182, 194, 0.45);
    transform: translateY(-8px);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.25),
      0 0 24px rgba(166, 182, 194, 0.08),
      0 0 0 1px rgba(166, 182, 194, 0.15) inset;
  }

  .project-card:hover::before {
    opacity: 1;
  }

  .project-card:hover::after {
    opacity: 0.6;
    animation: glowPulse 3s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% {
      transform: scale(1) rotate(0deg);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.1) rotate(180deg);
      opacity: 0.8;
    }
  }

  .project-card:active {
    transform: translateY(-4px);
  }

  /* Featured cards - enhanced depth */
  .project-card.featured {
    background: var(--depth-3);
    border-color: rgba(166, 182, 194, 0.35);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(166, 182, 194, 0.1) inset;
  }

  .project-card.featured::before {
    background: radial-gradient(
      ellipse at top left,
      rgba(166, 182, 194, 0.18) 0%,
      transparent 60%
    );
    opacity: 0.5;
  }

  .project-card.featured:hover {
    background: rgba(42, 56, 68, 0.95);
    border-color: rgba(166, 182, 194, 0.5);
    box-shadow:
      0 16px 40px rgba(0, 0, 0, 0.3),
      0 0 32px rgba(166, 182, 194, 0.12),
      0 0 0 1px rgba(166, 182, 194, 0.2) inset;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    position: relative;
    z-index: 1;
  }

  .project-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-heading);
    margin: 0;
    word-break: break-word;
    line-height: 1.5;
    letter-spacing: -0.01em;
    transition: all var(--duration-short) var(--ease-smooth);
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .project-card:hover .project-name {
    color: var(--text-heading);
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      0 0 12px rgba(166, 182, 194, 0.15);
  }

  .featured-badge {
    padding: 0.35rem 0.75rem;
    background: rgba(166, 182, 194, 0.15);
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.625rem;
    color: var(--accent);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    border: 1px solid rgba(166, 182, 194, 0.2);
    transition: all var(--duration-short) var(--ease-smooth);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .project-card.featured:hover .featured-badge {
    background: rgba(166, 182, 194, 0.22);
    border-color: rgba(166, 182, 194, 0.3);
    color: var(--highlight);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.15),
      0 0 8px rgba(166, 182, 194, 0.1);
  }

  .project-description {
    color: var(--text-body);
    line-height: 1.6;
    margin: 0;
    flex-grow: 1;
    font-size: 0.9375rem;
    opacity: 0.9;
    position: relative;
    z-index: 1;
  }

  .project-card:hover .project-description {
    color: var(--text-body);
    opacity: 1;
  }

  .project-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: var(--accent);
    padding-top: 0.75rem;
    border-top: 1px solid rgba(166, 182, 194, 0.12);
    position: relative;
    z-index: 1;
    opacity: 0.85;
  }

  .project-card:hover .project-meta {
    opacity: 1;
  }

  .language {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-variant-numeric: tabular-nums;
  }

  .language-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--highlight);
    flex-shrink: 0;
    box-shadow: 0 0 6px rgba(166, 182, 194, 0.5);
  }

  .stars,
  .forks {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-variant-numeric: tabular-nums;
  }

  .project-topics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: auto;
    position: relative;
    z-index: 2;
  }

  .topic {
    padding: 0.3rem 0.65rem;
    background: rgba(42, 56, 68, 0.7);
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6875rem;
    color: var(--accent);
    font-weight: 500;
    border: 1px solid rgba(166, 182, 194, 0.15);
    text-decoration: none;
    cursor: pointer;
    opacity: 0.85;
    transition: all var(--duration-short) var(--ease-smooth);
    letter-spacing: 0.01em;
  }

  .topic:hover {
    background: rgba(42, 56, 68, 0.9);
    border-color: rgba(166, 182, 194, 0.3);
    color: var(--highlight);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .project-card:hover .topic {
    background: rgba(42, 56, 68, 0.85);
    border-color: rgba(166, 182, 194, 0.2);
    opacity: 1;
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .project-card::after {
      animation: none;
    }
  }

  @media (max-width: 768px) {
    .project-card {
      padding: 1.75rem;
      min-height: 260px;
    }

    .project-name {
      font-size: 1.0625rem;
    }

    .project-meta {
      gap: 0.875rem;
      font-size: 0.6875rem;
    }
  }
</style>
