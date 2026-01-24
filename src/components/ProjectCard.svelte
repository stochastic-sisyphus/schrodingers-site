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
    background: rgba(68, 88, 104, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(166, 182, 194, 0.2);
    border-radius: 12px;
    padding: 2rem;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 250px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .project-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(166, 182, 194, 0.05) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  .project-card:hover {
    background: rgba(68, 88, 104, 0.15);
    border-color: rgba(166, 182, 194, 0.35);
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 8px 32px rgba(20, 26, 32, 0.4),
      0 0 0 1px rgba(166, 182, 194, 0.1);
  }

  .project-card:hover::before {
    opacity: 1;
  }

  .project-card:active {
    transform: translateY(-2px) scale(1.005);
  }

  .project-card.featured {
    background: rgba(68, 88, 104, 0.15);
    border-color: rgba(166, 182, 194, 0.3);
    box-shadow: 0 4px 16px rgba(20, 26, 32, 0.2);
  }

  .project-card.featured:hover {
    background: rgba(68, 88, 104, 0.2);
    border-color: rgba(166, 182, 194, 0.45);
    box-shadow: 0 12px 40px rgba(20, 26, 32, 0.5),
      0 0 0 1px rgba(166, 182, 194, 0.15);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .project-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--highlight);
    margin: 0;
    word-break: break-word;
    line-height: 1.4;
    transition: color 0.3s ease;
  }

  .project-card:hover .project-name {
    color: #c2d0dc;
  }

  .featured-badge {
    padding: 0.375rem 0.875rem;
    background: rgba(166, 182, 194, 0.2);
    border-radius: 6px;
    font-size: 0.6875rem;
    color: var(--accent);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    border: 1px solid rgba(166, 182, 194, 0.15);
    transition: all 0.3s ease;
  }

  .project-card.featured:hover .featured-badge {
    background: rgba(166, 182, 194, 0.25);
    border-color: rgba(166, 182, 194, 0.25);
    color: var(--highlight);
  }

  .project-description {
    color: var(--light);
    line-height: 1.6;
    margin: 0;
    flex-grow: 1;
    font-size: 0.9375rem;
  }

  .project-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--accent);
    padding-top: 0.5rem;
    border-top: 1px solid rgba(166, 182, 194, 0.1);
  }

  .language {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8125rem;
  }

  .language-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }

  .stars,
  .forks {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .project-topics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: auto;
  }

  .topic {
    padding: 0.3rem 0.75rem;
    background: rgba(166, 182, 194, 0.1);
    border-radius: 4px;
    font-size: 0.75rem;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    border: 1px solid rgba(166, 182, 194, 0.05);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
  }

  .topic:hover {
    background: rgba(166, 182, 194, 0.2);
    border-color: rgba(166, 182, 194, 0.2);
    color: var(--highlight);
    transform: translateY(-1px);
  }

  .project-card:hover .topic {
    background: rgba(166, 182, 194, 0.15);
    border-color: rgba(166, 182, 194, 0.1);
  }

  @media (max-width: 768px) {
    .project-card {
      padding: 1.5rem;
      min-height: 220px;
    }

    .project-name {
      font-size: 1.125rem;
    }

    .project-meta {
      gap: 0.75rem;
      font-size: 0.8125rem;
    }
  }
</style>
