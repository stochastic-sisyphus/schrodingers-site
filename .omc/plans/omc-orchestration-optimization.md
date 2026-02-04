# OMC Orchestration Optimization Plan

## Context

### Original Request
Improve the OMC agent orchestration system to optimize context usage, token costs, and performance when coordinating multiple specialized agents. Use the Schrodinger's Site frontend as a live validation test case.

### Interview Summary
- **Priority**: COST MINIMIZATION (ecomode energy)
- **All four features required**: Shared context cache, smart task auto-assignment, dependency-aware scheduling, auto-invoke orchestration modes
- **Success metrics**: Token cost reduction %, context cache hit rate %
- **Test strategy**: Instrument and measure with logging
- **Frontend test case**: Visual design fixes, component organization, UX pattern improvements

### Research Findings

**Current OMC Architecture (v3.9.7)**:
- **33 agents** across 5 tiers (haiku/sonnet/opus base + specialized)
- **Task decomposer** (`features/task-decomposer/`): Text-analysis-based decomposition with file ownership, execution ordering, and strategy selection (fullstack/refactoring/bugfix/feature/default)
- **Model router** (`features/model-routing/`): Signal extraction + scoring + rules-based routing to haiku/sonnet/opus tiers
- **Context injector** (`features/context-injector/`): Session-based context collection with priority ordering and deduplication - but NO caching (consume-once pattern)
- **Magic keywords** (`features/magic-keywords.js`): Trigger-word detection for ultrawork/search/analyze/ultrathink - but NO auto-invocation based on task characteristics
- **State manager** (`features/state-manager/`): JSON file-based state at `.omc/state/*.json` with legacy migration
- **Delegation enforcer** (`features/delegation-enforcer.js`): Path-based write rules (soft enforcement)

**Key Gaps Identified**:
1. Context injector is consume-once with no caching - every agent re-reads files
2. Task decomposer uses keyword heuristics only (no file-system awareness)
3. No dependency graph between tasks - just blockedBy arrays from area keywords
4. Magic keywords require explicit triggers - no auto-detection of when to activate modes
5. No instrumentation/logging for token usage or context reads

---

## Work Objectives

### Core Objective
Add four orchestration features to OMC that reduce token costs and improve multi-agent coordination, validated against the Schrodinger's Site frontend.

### Deliverables
1. **Shared Context Cache** - Session-scoped file content cache with TTL and selective persistence
2. **Smart Task Auto-Assignment** - File-pattern and complexity-aware agent routing
3. **Dependency-Aware Scheduling** - DAG-based task ordering with parallel batch execution
4. **Auto-Invoke Orchestration Modes** - Heuristic-based automatic mode activation
5. **Instrumentation Layer** - Logging for token usage, cache hits, task timing
6. **Frontend Fixes** (test case) - Visual design, component org, and UX improvements

### Definition of Done
- All four features implemented with tests
- Instrumentation produces measurable before/after data
- Frontend test case completed with orchestration metrics collected
- Token cost reduction demonstrated (target: 20-40% reduction in context reads)
- Cache hit rate above 60% for repeated file reads within a session

---

## Must Have / Must NOT Have

### Must Have
- Session-scoped context cache (dies when session ends)
- Selective persistence for high-value context (CLAUDE.md, config files)
- File-pattern-based agent routing (`.svelte` -> designer, `.ts` in `lib/` -> executor)
- DAG construction from file dependency analysis
- Auto-detection thresholds: 5+ tasks -> swarm, 10+ files -> parallel, broad request -> plan
- Structured logging in `.omc/logs/orchestration-metrics.jsonl`
- Cache invalidation on file write (Edit/Write tool usage)

### Must NOT Have
- Cross-session persistence of file content cache (stale data risk)
- Breaking changes to existing agent definitions or skill APIs
- New external dependencies (must use Node.js built-ins + existing deps)
- Changes to CLAUDE.md system prompt format
- Modification of the plugin's dist/ compiled output directly (source changes only)

---

## Guardrails

- All new modules go under `features/` following existing patterns
- State files use `.omc/state/` via the existing StateManager
- Log files go to `.omc/logs/` (new directory)
- No changes to agent prompt files (`.md` templates)
- Frontend changes respect the locked palette v5 (steel-teal range only)
- All file paths must be absolute in agent prompts

---

## Architecture Design

### Feature 1: Shared Context Cache

```
features/context-cache/
  index.ts          - Public API: get, set, invalidate, stats
  cache-store.ts    - In-memory LRU cache with TTL
  file-tracker.ts   - Tracks file reads across agents, triggers cache
  invalidator.ts    - Watches for Edit/Write tool calls, invalidates entries
  types.ts          - CacheEntry, CacheConfig, CacheStats interfaces
```

**Design**:
- LRU cache (max 50 entries, configurable) keyed by absolute file path
- TTL: 5 minutes for source files, 30 minutes for config files (CLAUDE.md, package.json, tsconfig.json)
- Cache entry stores: content, hash, timestamp, read-count, byte-size
- Invalidation: hook into PostToolUse for Edit/Write/Bash tools to clear affected paths
- Stats tracking: hits, misses, evictions, bytes saved

**Integration Points**:
- Hook into SubagentStart to inject cached context into agent prompts
- Hook into PostToolUse to track reads and invalidate on writes
- Expose stats via `getCacheStats()` for instrumentation layer

### Feature 2: Smart Task Auto-Assignment

```
features/smart-assignment/
  index.ts          - Public API: assignAgent, getRecommendation
  file-analyzer.ts  - Maps file extensions/paths to agent domains
  complexity-scorer.ts - Enhanced complexity analysis using file count, LOC, dependencies
  assignment-rules.ts  - Configurable rules engine for agent selection
  types.ts          - AssignmentRule, AssignmentResult interfaces
```

**Design**:
- Extends existing task-decomposer's `selectAgentType()` with file-system awareness
- Rule priority: explicit user override > file-pattern match > complexity score > default
- File-pattern rules:

| Pattern | Agent | Model Tier |
|---------|-------|------------|
| `*.svelte`, `*.vue`, `*.css` | designer | sonnet |
| `*.astro` (pages/) | executor | sonnet |
| `*.astro` (components/) | designer | sonnet |
| `*.ts` (lib/) | executor | sonnet |
| `*.ts` (tests/) | qa-tester | sonnet |
| `*.md` (content/) | writer | haiku |
| `*.json` (config) | executor-low | haiku |
| 20+ files touched | executor-high | opus |
| Security-related | security-reviewer | opus |

- Complexity enhancement: count affected files, estimate LOC changes, check cross-module dependencies
- Output: `{ agent, model, confidence, reason }` matching existing routing format

**Integration Points**:
- Replaces `selectAgentType()` in task-decomposer
- Feeds into model-routing's `routeTask()` as additional signal
- Logs decisions to instrumentation layer

### Feature 3: Dependency-Aware Scheduling

```
features/dependency-scheduler/
  index.ts          - Public API: buildSchedule, getNextBatch
  dag-builder.ts    - Constructs DAG from task dependencies and file analysis
  import-analyzer.ts - Analyzes import/require statements for file dependencies
  batch-optimizer.ts - Groups independent tasks into parallel batches
  types.ts          - DAGNode, Schedule, Batch interfaces
```

**Design**:
- Builds a directed acyclic graph (DAG) from:
  1. Explicit `blockedBy` declarations from task decomposer
  2. File-level import/dependency analysis (TypeScript imports, Astro component imports)
  3. Shared file detection (multiple tasks touching same file = sequential)
- Batch optimizer: topological sort + level grouping for maximum parallelism
- Schedule output: ordered list of batches, each batch = set of independent tasks

**Algorithm**:
```
1. Parse all subtasks and their file ownership
2. For each pair of subtasks:
   a. Check file overlap -> add dependency edge
   b. Check import chains -> add dependency edge
   c. Check explicit blockedBy -> add dependency edge
3. Topological sort the DAG
4. Group into levels (tasks at same depth = one batch)
5. Within each batch, assign agents in parallel
```

**Integration Points**:
- Replaces `calculateExecutionOrder()` in task-decomposer
- Used by ultrawork/swarm/autopilot to determine parallel batch boundaries
- Reports batch efficiency to instrumentation layer

### Feature 4: Auto-Invoke Orchestration Modes

```
features/auto-orchestration/
  index.ts          - Public API: detectMode, shouldActivate
  heuristics.ts     - Threshold-based mode detection rules
  request-classifier.ts - Classifies incoming requests by scope/complexity
  types.ts          - ModeDecision, Threshold, ClassifiedRequest interfaces
```

**Design**:
- Runs BEFORE magic-keywords (so explicit keywords still override)
- Heuristic thresholds:

| Signal | Threshold | Mode Activated |
|--------|-----------|----------------|
| Task count >= 5 | After decomposition | ultrawork/swarm |
| File scope >= 10 files | After file analysis | parallel execution |
| Broad/vague request | Detected by classifier | plan first -> ultrawork |
| Single file, simple change | Low complexity score | direct execution (no mode) |
| Cross-module changes | 3+ modules | ultrawork |
| "fix all", "update everything" | Scope keywords | swarm |

- Request classifier: analyzes word count, specificity, scope indicators
- Returns: `{ mode: string, confidence: number, reason: string, shouldActivate: boolean }`
- Confidence threshold: only auto-activate above 0.7 confidence

**Integration Points**:
- Hooks into PreToolUse or prompt processing (before magic-keywords.js)
- Respects existing config's `defaultExecutionMode` preference
- Logs activation decisions to instrumentation layer

### Feature 5: Instrumentation Layer

```
features/instrumentation/
  index.ts          - Public API: log, getMetrics, report
  logger.ts         - Structured JSONL logging to .omc/logs/
  metrics.ts        - In-memory metric aggregation (counters, timers, gauges)
  reporter.ts       - Generates human-readable reports from metrics
  types.ts          - LogEntry, Metric, Report interfaces
```

**Design**:
- Structured JSONL logging to `.omc/logs/orchestration-metrics.jsonl`
- Metrics tracked:

| Metric | Type | Description |
|--------|------|-------------|
| `context.cache.hit` | counter | Cache hits |
| `context.cache.miss` | counter | Cache misses |
| `context.cache.bytes_saved` | counter | Bytes not re-read |
| `context.cache.hit_rate` | gauge | hits / (hits + misses) |
| `task.assignment.agent` | counter (by agent) | Tasks per agent type |
| `task.assignment.model` | counter (by model) | Tasks per model tier |
| `task.schedule.batch_count` | gauge | Batches in schedule |
| `task.schedule.parallelism` | gauge | Avg tasks per batch |
| `mode.auto_activated` | counter (by mode) | Auto-activations |
| `mode.auto_skipped` | counter | Below confidence threshold |
| `session.total_reads` | counter | Total file reads |
| `session.cached_reads` | counter | Reads served from cache |
| `session.duration_ms` | timer | Session duration |

- Report generator: produces summary at session end or on demand

---

## Task Flow and Dependencies

```
Phase 0: Instrumentation (no deps)
  |
Phase 1: Context Cache (depends on instrumentation)
  |
Phase 2: Smart Assignment (depends on instrumentation)
  |
Phase 3: Dependency Scheduler (depends on instrumentation)
  |
Phase 4: Auto-Orchestration (depends on all above)
  |
Phase 5: Integration & Frontend Test Case (depends on all above)
  |
Phase 6: Measurement & Validation (depends on Phase 5)
```

Phases 1-3 can run in parallel after Phase 0.

---

## Detailed TODOs

### Phase 0: Instrumentation Foundation
**Estimated effort**: Small (1 session)

- [ ] **T0.1**: Create `features/instrumentation/types.ts` with LogEntry, Metric, Report interfaces
  - Acceptance: Types compile, cover all metric categories listed above
- [ ] **T0.2**: Create `features/instrumentation/logger.ts` with JSONL file writer
  - Acceptance: Writes structured entries to `.omc/logs/orchestration-metrics.jsonl`
  - Creates log directory if missing, handles write errors gracefully
- [ ] **T0.3**: Create `features/instrumentation/metrics.ts` with in-memory aggregation
  - Acceptance: Supports counter increment, gauge set, timer start/stop
  - Thread-safe for concurrent agent access
- [ ] **T0.4**: Create `features/instrumentation/reporter.ts` with summary generation
  - Acceptance: Produces human-readable session summary with all tracked metrics
- [ ] **T0.5**: Create `features/instrumentation/index.ts` with public API
  - Acceptance: Exports `log()`, `getMetrics()`, `report()`, `resetMetrics()`
- [ ] **T0.6**: Write tests for instrumentation module
  - Acceptance: Unit tests for logger, metrics, reporter pass

### Phase 1: Shared Context Cache
**Estimated effort**: Medium (1-2 sessions)

- [ ] **T1.1**: Create `features/context-cache/types.ts` with CacheEntry, CacheConfig, CacheStats
  - Acceptance: Types cover LRU cache needs (key, value, TTL, size, metadata)
- [ ] **T1.2**: Create `features/context-cache/cache-store.ts` with LRU implementation
  - Acceptance: LRU eviction works, TTL expiration works, max entries enforced
  - Configurable: maxEntries (default 50), defaultTTL (5min), configTTL (30min)
- [ ] **T1.3**: Create `features/context-cache/file-tracker.ts` for read tracking
  - Acceptance: Tracks which files each agent reads, counts reads per file
  - Integrates with instrumentation: logs cache.hit and cache.miss
- [ ] **T1.4**: Create `features/context-cache/invalidator.ts` for write-based invalidation
  - Acceptance: Clears cache entry when file is written/edited
  - Handles glob patterns (e.g., clearing all entries under a directory)
- [ ] **T1.5**: Create `features/context-cache/index.ts` with public API
  - Acceptance: Exports `getCached()`, `setCached()`, `invalidate()`, `getCacheStats()`
- [ ] **T1.6**: Integration: Hook cache into context-injector's collector
  - Acceptance: When agent starts, cached file contents injected without re-read
  - Falls through to normal read on cache miss
- [ ] **T1.7**: Integration: Hook invalidator into PostToolUse for Edit/Write
  - Acceptance: File edits immediately invalidate cached version
- [ ] **T1.8**: Write tests for context cache module
  - Acceptance: Unit tests for LRU, TTL, invalidation, stats tracking pass

### Phase 2: Smart Task Auto-Assignment
**Estimated effort**: Medium (1-2 sessions)

- [ ] **T2.1**: Create `features/smart-assignment/types.ts`
  - Acceptance: AssignmentRule, AssignmentResult, FilePattern interfaces defined
- [ ] **T2.2**: Create `features/smart-assignment/file-analyzer.ts`
  - Acceptance: Maps file extensions and directory paths to agent domains
  - Handles: .svelte, .astro, .ts, .css, .md, .json, and directory context
- [ ] **T2.3**: Create `features/smart-assignment/complexity-scorer.ts`
  - Acceptance: Enhanced scoring using file count, estimated LOC, cross-module analysis
  - Returns numeric score 0-1 with breakdown
- [ ] **T2.4**: Create `features/smart-assignment/assignment-rules.ts`
  - Acceptance: Configurable rules engine with priority ordering
  - Default rules cover all patterns from the design table above
- [ ] **T2.5**: Create `features/smart-assignment/index.ts`
  - Acceptance: `assignAgent(task, files)` returns `{ agent, model, confidence, reason }`
- [ ] **T2.6**: Integration: Wire into task-decomposer's `selectAgentType()`
  - Acceptance: Task decomposer uses smart assignment when file info available
  - Falls back to existing keyword-based assignment when no files known
- [ ] **T2.7**: Integration: Feed assignment decisions to instrumentation
  - Acceptance: Every assignment logged with agent, model, confidence, reason
- [ ] **T2.8**: Write tests for smart assignment module
  - Acceptance: Unit tests for file analysis, scoring, rules, and end-to-end assignment

### Phase 3: Dependency-Aware Scheduling
**Estimated effort**: Medium (1-2 sessions)

- [ ] **T3.1**: Create `features/dependency-scheduler/types.ts`
  - Acceptance: DAGNode, Edge, Schedule, Batch interfaces defined
- [ ] **T3.2**: Create `features/dependency-scheduler/import-analyzer.ts`
  - Acceptance: Parses TypeScript/Astro import statements to build file dependency map
  - Handles: ES imports, dynamic imports, Astro component imports
- [ ] **T3.3**: Create `features/dependency-scheduler/dag-builder.ts`
  - Acceptance: Constructs DAG from explicit deps + file overlap + import chains
  - Detects cycles and breaks them with warnings
- [ ] **T3.4**: Create `features/dependency-scheduler/batch-optimizer.ts`
  - Acceptance: Topological sort + level grouping produces optimal parallel batches
  - Reports parallelism efficiency (tasks/batch average)
- [ ] **T3.5**: Create `features/dependency-scheduler/index.ts`
  - Acceptance: `buildSchedule(subtasks)` returns ordered batch list
  - `getNextBatch(schedule, completed)` returns next runnable batch
- [ ] **T3.6**: Integration: Replace `calculateExecutionOrder()` in task-decomposer
  - Acceptance: Existing decomposition still works, but with smarter ordering
  - Backward compatible: old format still accepted
- [ ] **T3.7**: Integration: Feed schedule metrics to instrumentation
  - Acceptance: Batch count, parallelism ratio, critical path length logged
- [ ] **T3.8**: Write tests for dependency scheduler module
  - Acceptance: Unit tests for DAG construction, cycle detection, batch optimization

### Phase 4: Auto-Invoke Orchestration Modes
**Estimated effort**: Medium (1-2 sessions)

- [ ] **T4.1**: Create `features/auto-orchestration/types.ts`
  - Acceptance: ModeDecision, Threshold, ClassifiedRequest interfaces defined
- [ ] **T4.2**: Create `features/auto-orchestration/request-classifier.ts`
  - Acceptance: Classifies requests by scope (single-file, multi-file, project-wide)
  - Detects: specificity level, scope indicators, complexity signals
- [ ] **T4.3**: Create `features/auto-orchestration/heuristics.ts`
  - Acceptance: Threshold rules implemented per design table
  - Configurable thresholds with sane defaults
  - Confidence scoring (0-1) for each rule match
- [ ] **T4.4**: Create `features/auto-orchestration/index.ts`
  - Acceptance: `detectMode(request, decomposition)` returns mode recommendation
  - `shouldActivate(decision)` checks confidence threshold (0.7)
- [ ] **T4.5**: Integration: Wire into prompt processing pipeline before magic-keywords
  - Acceptance: Auto-detection runs first, explicit keywords still override
  - Respects `defaultExecutionMode` from config
- [ ] **T4.6**: Integration: Feed mode decisions to instrumentation
  - Acceptance: Every auto-activation and skip logged with reason and confidence
- [ ] **T4.7**: Write tests for auto-orchestration module
  - Acceptance: Unit tests for classifier, heuristics, and integration with magic-keywords

### Phase 5: Integration and Frontend Test Case
**Estimated effort**: Large (2-3 sessions)

- [ ] **T5.1**: Wire all four features into OMC's main entry point (`index.ts`)
  - Acceptance: Features initialize on startup, hooks registered, instrumentation active
- [ ] **T5.2**: Create baseline measurement script
  - Acceptance: Script that runs a standard task and records baseline metrics
  - Captures: total reads, unique files, agent count, estimated tokens
- [ ] **T5.3**: Run baseline measurement against frontend task (pre-optimization)
  - Acceptance: Baseline metrics captured to `.omc/logs/baseline-metrics.json`
- [ ] **T5.4**: Execute frontend fixes using optimized orchestration
  - Frontend tasks (from git status analysis):
    - Fix BlogCard.astro, BlogList.astro, BlogPost.astro visual design
    - Fix ProjectCard.svelte interaction patterns
    - Fix ResearchCard.astro layout
    - Fix visualization components (ActivityTimeline, CitationNetwork, CodeGraph, ContributorNetwork, DependencyTree, PublicationTimeline, VerificationCascade)
    - Fix BaseLayout.astro and ContentLayout.astro structure
    - Fix page layouts (index, about, blog, projects, research)
    - Fix global.css and particles.ts
    - Organize d3-styles.ts
  - Acceptance: All modified files from git status addressed
- [ ] **T5.5**: Collect optimized metrics during frontend execution
  - Acceptance: Metrics captured to `.omc/logs/optimized-metrics.json`

### Phase 6: Measurement and Validation
**Estimated effort**: Small (1 session)

- [ ] **T6.1**: Generate comparison report (baseline vs optimized)
  - Acceptance: Report shows delta for each metric category
  - Token cost reduction % calculated
  - Cache hit rate calculated
- [ ] **T6.2**: Validate against success criteria
  - Acceptance: Cache hit rate > 60%, token reduction > 20%
  - All frontend fixes verified (build passes, visual inspection)
- [ ] **T6.3**: Document findings and recommendations
  - Acceptance: Summary document with architecture decisions, metrics, and future improvements
  - Saved to `.omc/plans/omc-optimization-results.md`

---

## Commit Strategy

| Phase | Commit Message Pattern |
|-------|----------------------|
| Phase 0 | `feat(omc): add instrumentation layer for orchestration metrics` |
| Phase 1 | `feat(omc): add shared context cache with LRU and TTL` |
| Phase 2 | `feat(omc): add smart task auto-assignment by file patterns` |
| Phase 3 | `feat(omc): add dependency-aware DAG scheduler` |
| Phase 4 | `feat(omc): add auto-invoke orchestration mode detection` |
| Phase 5a | `feat(omc): integrate all orchestration features` |
| Phase 5b | `fix(frontend): visual design and component fixes` |
| Phase 6 | `docs(omc): optimization measurement results and report` |

Each phase should be a single atomic commit. Frontend fixes can be split into logical groups if needed.

---

## Success Criteria

### Primary Metrics (MUST achieve)
- [ ] Context cache hit rate >= 60% for repeated file reads
- [ ] Token cost reduction >= 20% measured by cached reads / total reads
- [ ] All four features implemented and passing tests
- [ ] Frontend test case completed (build passes, no regressions)

### Secondary Metrics (SHOULD achieve)
- [ ] Average parallelism ratio >= 2.0 tasks per batch
- [ ] Auto-orchestration confidence >= 0.7 for correct mode selections
- [ ] Smart assignment matches manual assignment >= 80% of the time
- [ ] Zero breaking changes to existing OMC APIs

### Validation Method
1. Run baseline measurement (pre-optimization) on frontend task
2. Implement all features
3. Run same frontend task with optimization enabled
4. Compare metrics side-by-side
5. Generate report with recommendations

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Cache invalidation misses (stale data) | Medium | High | Conservative TTL + invalidate on any write |
| DAG cycle detection fails | Low | Medium | Fallback to sequential execution |
| Auto-mode false positives | Medium | Low | High confidence threshold (0.7) + user override |
| Performance overhead from instrumentation | Low | Low | JSONL append-only, async writes |
| Breaking existing decomposer | Medium | High | Feature flags, fallback to old behavior |

---

## Notes

- The OMC plugin source is at `/Users/student/.claude/plugins/cache/omc/oh-my-claudecode/3.9.7/`
- All new feature modules follow the existing pattern: `features/{name}/index.ts` + `types.ts`
- State persistence uses `.omc/state/` via `StateManager` class
- Logs go to `.omc/logs/` (new directory, created on first write)
- The existing `ContextCollector` in `context-injector/collector.js` is consume-once; the new cache sits alongside it, not replacing it
- Frontend changes must respect locked palette v5 in `.cursor/rules/locked-palette.mdc`
