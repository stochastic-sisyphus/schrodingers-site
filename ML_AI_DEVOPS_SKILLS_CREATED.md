# ML/AI/DevOps Skills and Rules Created

Complete setup for ML, AI, data science, DevOps, and data visualization workflows.

## Rules Created (Project-Level)

### 1. no-emojis.mdc
**Location**: `.cursor/rules/no-emojis.mdc`
**Scope**: Always applies

Enforces strict no-emoji policy across all code, documentation, and communication.

### 2. cursor-management-no-emojis.mdc
**Location**: `.cursor/rules/cursor-management-no-emojis.mdc`
**Scope**: Applies to `.cursor/**/*` files

Ensures no emojis when creating or updating Cursor configurations (skills, rules, subagents, settings).

## New Skills Created (User-Level)

### Machine Learning & AI

#### 1. ml-model-development
**Location**: `~/.cursor/skills/ml-model-development/SKILL.md`

Complete ML model development workflow.

**Triggers**: ML models, neural networks, training, evaluation, PyTorch, TensorFlow, scikit-learn

**Key Features**:
- Data preparation and splitting
- Model selection and training
- PyTorch deep learning patterns
- Hyperparameter tuning (Grid Search, Optuna)
- Model persistence and versioning
- Experiment tracking (MLflow, W&B)
- Evaluation metrics (classification, regression)
- Best practices and common issues

#### 2. jupyter-notebook-optimization
**Location**: `~/.cursor/skills/jupyter-notebook-optimization/SKILL.md`

Optimize Jupyter notebooks for performance and reproducibility.

**Triggers**: Jupyter, notebooks, IPython, reproducibility, notebook best practices

**Key Features**:
- Notebook organization patterns
- Memory management and optimization
- Chunked and parallel processing
- Code quality (functions, type hints)
- Reproducibility (seeds, versioning)
- Visualization best practices
- Interactive widgets (ipywidgets, Plotly)
- Debugging and profiling
- Testing in notebooks
- Export and parameterization

### Data Engineering

#### 3. data-pipeline-engineering
**Location**: `~/.cursor/skills/data-pipeline-engineering/SKILL.md`

Build robust data pipelines with ETL/ELT workflows.

**Triggers**: data pipelines, ETL, data ingestion, Airflow, dbt, data engineering

**Key Features**:
- ETL vs ELT architecture
- Data extraction (API, database, files)
- Pandas and SQL transformations
- Data validation (Great Expectations, custom)
- Database and warehouse loading
- Pipeline orchestration (Airflow, Prefect)
- Error handling and retry logic
- Monitoring and metrics
- Best practices for idempotency

### DevOps & Infrastructure

#### 4. devops-automation
**Location**: `~/.cursor/skills/devops-automation/SKILL.md`

Infrastructure as code and deployment automation.

**Triggers**: DevOps, IaC, Terraform, Ansible, CI/CD, deployment automation

**Key Features**:
- Terraform infrastructure provisioning
- Ansible configuration management
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Container orchestration (Docker Compose, Kubernetes)
- Monitoring (Prometheus, ELK stack)
- Secrets management (Vault, AWS Secrets Manager)
- Backup and disaster recovery
- Best practices for infrastructure

#### 5. docker-kubernetes-deployment
**Location**: `~/.cursor/skills/docker-kubernetes-deployment/SKILL.md`

Container packaging and Kubernetes orchestration.

**Triggers**: Docker, Kubernetes, K8s, containers, pods, deployments

**Key Features**:
- Optimized Dockerfiles (multi-stage builds)
- Docker Compose for development
- Kubernetes deployments and services
- ConfigMaps and Secrets
- StatefulSets for databases
- HorizontalPodAutoscaler
- Helm charts and templating
- Deployment strategies (blue-green, canary)
- Monitoring and logging

#### 6. cicd-pipeline-setup
**Location**: `~/.cursor/skills/cicd-pipeline-setup/SKILL.md`

Automated testing, building, and deployment pipelines.

**Triggers**: CI/CD, GitHub Actions, GitLab CI, Jenkins, pipeline automation

**Key Features**:
- GitHub Actions workflows
- GitLab CI/CD pipelines
- Jenkins declarative pipelines
- Testing strategies (unit, integration, E2E)
- Security scanning (SAST, container scanning)
- Deployment strategies (rolling, canary)
- Monitoring and notifications
- Best practices for pipelines

### Data Visualization

#### 7. observable-notebook-development
**Location**: `~/.cursor/skills/observable-notebook-development/SKILL.md`

Interactive data visualization with Observable.

**Triggers**: Observable, Observable Plot, D3.js, reactive programming, interactive visualizations

**Key Features**:
- Observable cell types and patterns
- Data loading and transformation
- D3.js visualizations
- Observable Plot charts
- Reactive programming patterns
- Interactive inputs and custom widgets
- Performance optimization
- Publishing and embedding
- Best practices

#### 8. react-data-visualization
**Location**: `~/.cursor/skills/react-data-visualization/SKILL.md`

React-based data visualization and dashboards.

**Triggers**: React visualization, D3 with React, Recharts, data dashboards

**Key Features**:
- D3.js with React (useRef pattern)
- Custom D3 hooks
- Recharts library (Line, Bar, custom tooltips)
- Interactive visualizations (zoom, pan, brush)
- Real-time data (streaming, WebSocket)
- Dashboard components
- Performance optimization (memoization, virtual scrolling)
- Responsive design
- Best practices

## Complete Skills Summary

You now have **19 total user-level skills**:

### Original Skills (6)
1. shader-development
2. research-integration
3. astro-optimization
4. visual-debugging
5. performance-profiling
6. api-integration

### Cursor Management Skills (5)
7. create-skill
8. create-rule
9. create-subagent
10. update-cursor-settings
11. migrate-to-skills

### ML/AI/DevOps Skills (8)
12. ml-model-development
13. data-pipeline-engineering
14. devops-automation
15. docker-kubernetes-deployment
16. cicd-pipeline-setup
17. observable-notebook-development
18. react-data-visualization
19. jupyter-notebook-optimization

## Project Rules (2)
1. no-emojis (always applies)
2. cursor-management-no-emojis (applies to .cursor/ files)

## Usage Examples

### Machine Learning
"Train a neural network with PyTorch" → ml-model-development triggers

### Data Engineering
"Build an ETL pipeline with Airflow" → data-pipeline-engineering triggers

### DevOps
"Set up Terraform infrastructure" → devops-automation triggers
"Create Kubernetes deployment" → docker-kubernetes-deployment triggers

### CI/CD
"Configure GitHub Actions pipeline" → cicd-pipeline-setup triggers

### Data Visualization
"Create interactive Observable chart" → observable-notebook-development triggers
"Build React dashboard with D3" → react-data-visualization triggers

### Notebooks
"Optimize Jupyter notebook performance" → jupyter-notebook-optimization triggers

## Verification

Check all skills:
```bash
ls ~/.cursor/skills/
```

Should show all 19 skills.

Check project rules:
```bash
ls .cursor/rules/
```

Should show:
- cursor-management-no-emojis.mdc
- no-emojis.mdc

## Key Features Across All Skills

### ML/AI Focus
- Model training and evaluation
- Hyperparameter tuning
- Experiment tracking
- Notebook optimization
- Reproducibility

### Data Engineering
- ETL/ELT pipelines
- Data validation
- Orchestration
- Error handling
- Monitoring

### DevOps
- Infrastructure as code
- Container orchestration
- CI/CD automation
- Security scanning
- Deployment strategies

### Visualization
- Interactive charts
- Real-time data
- Dashboard components
- Performance optimization
- Responsive design

## No Emoji Policy

Both rules enforce:
- No emojis in code
- No emojis in documentation
- No emojis in commit messages
- No emojis in AI responses
- No emojis in Cursor configurations

This applies to:
- All files (no-emojis.mdc - always)
- Cursor configs (cursor-management-no-emojis.mdc - when editing .cursor/ files)

## Next Steps

1. Test the skills by working on ML/AI/DevOps tasks
2. Verify rules are enforcing no-emoji policy
3. Customize skill descriptions if needed
4. Add project-specific examples to skills
5. Create additional skills for specialized workflows

## Maintenance

### Update a Skill
```bash
cursor ~/.cursor/skills/[skill-name]/SKILL.md
```

### Update a Rule
```bash
cursor .cursor/rules/[rule-name].mdc
```

### Backup
```bash
cp -r ~/.cursor/skills ~/cursor-skills-backup
cp -r .cursor/rules .cursor-rules-backup
```

## Resources

All skills follow best practices:
- Concise (under 500 lines)
- Third-person descriptions
- Specific trigger terms
- Code examples and templates
- Checklists and workflows
- No emojis

These skills provide comprehensive coverage for:
- Machine learning and AI development
- Data engineering and pipelines
- DevOps and infrastructure automation
- Container orchestration
- CI/CD pipelines
- Data visualization (Observable, React)
- Jupyter notebook optimization

Perfect for ML engineers, data scientists, DevOps engineers, and full-stack developers working with data-intensive applications.
