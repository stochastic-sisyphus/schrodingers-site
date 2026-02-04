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
    border: 1px solid rgba(166, 182, 194, 0.5);
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
    box-shadow: var(--shadow-medium);
    transition: all var(--duration-short) var(--ease-smooth);
  }

  .project-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(166, 182, 194, 0.1) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: opacity var(--duration-short) var(--ease-smooth);
    pointer-events: none;
  }

  .project-card:hover {
    background: var(--depth-2);
    border-color: rgba(166, 182, 194, 0.7);
    transform: translateY(-6px);
    filter: drop-shadow(var(--shadow-deep));
  }

  .project-card:hover::before {
    opacity: 1;
  }

  .project-card:active {
    transform: translateY(-2px);
  }

  .project-card.featured {
    background: var(--depth-3);
    border-color: rgba(166, 182, 194, 0.6);
    box-shadow: var(--shadow-deep);
  }

  .project-card.featured:hover {
    background: var(--depth-3);
    border-color: rgba(166, 182, 194, 0.8);
    filter: drop-shadow(var(--shadow-deep));
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .project-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--highlight);
    margin: 0;
    word-break: break-word;
    line-height: 1.4;
    transition: color var(--duration-short) var(--ease-smooth);
  }

  .project-card:hover .project-name {
    color: var(--text-heading);
  }

  .featured-badge {
    padding: 0.375rem 0.875rem;
    background: rgba(166, 182, 194, 0.2);
    border-radius: 6px;
    font-size: 0.6875rem;
    color: var(--highlight);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    border: 1px solid rgba(166, 182, 194, 0.15);
    transition: all var(--duration-short) var(--ease-smooth);
  }

  .project-card.featured:hover .featured-badge {
    background: rgba(166, 182, 194, 0.25);
    border-color: rgba(166, 182, 194, 0.25);
    color: var(--highlight);
  }

  .project-description {
    color: var(--highlight);
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
    font-size: 0.8125rem;
    color: var(--accent);
    padding-top: 0.5rem;
    border-top: 1px solid rgba(166, 182, 194, 0.1);
  }

  .language {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Inter', sans-serif;
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
    color: var(--highlight);
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    border: 1px solid rgba(166, 182, 194, 0.05);
    text-decoration: none;
    cursor: pointer;
    opacity: 0.8;
    transition: all var(--duration-short) var(--ease-smooth);
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
