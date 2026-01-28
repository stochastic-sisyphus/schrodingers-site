# User-Level Cursor Skills Created

Five essential Cursor management skills have been created in `~/.cursor/skills/` and are now available across **all your projects**.

## Skills Overview

### 1. create-skill
**Location**: `~/.cursor/skills/create-skill/SKILL.md`

Guides you through creating effective Agent Skills for Cursor.

**Triggers**: create skill, new skill, skill structure, SKILL.md format, skill best practices

**Key Features**:
- Skill file structure and storage locations
- Writing effective descriptions (third-person, specific triggers)
- Core authoring principles (concise, under 500 lines)
- Common patterns (templates, examples, workflows)
- Complete examples and checklists

### 2. create-rule
**Location**: `~/.cursor/skills/create-rule/SKILL.md`

Create Cursor rules for persistent AI guidance in `.cursor/rules/`.

**Triggers**: create rule, coding standards, project conventions, file-specific patterns, RULE.md

**Key Features**:
- Rule file format (.mdc with YAML frontmatter)
- Always-apply vs file-specific rules
- Glob patterns for targeting specific files
- Best practices (concise, actionable, concrete examples)
- Example rules for TypeScript and React

### 3. create-subagent
**Location**: `~/.cursor/skills/create-subagent/SKILL.md`

Create custom subagents for specialized AI tasks in `.cursor/agents/`.

**Triggers**: create subagent, custom agent, specialized AI assistant, agent configuration

**Key Features**:
- Project-level vs user-level subagents
- Writing effective descriptions for delegation
- System prompt design
- Example subagents (code reviewer, debugger, data scientist)
- Subagent creation workflow

### 4. update-cursor-settings
**Location**: `~/.cursor/skills/update-cursor-settings/SKILL.md`

Modify Cursor/VSCode user settings in settings.json.

**Triggers**: change settings, editor preferences, font size, theme, format on save, configuration

**Key Features**:
- Settings file locations (macOS/Linux/Windows)
- Common settings categories (editor, workbench, files, terminal)
- Safe modification workflow (read → update → write)
- User request → setting mapping
- JSON with comments support

### 5. migrate-to-skills
**Location**: `~/.cursor/skills/migrate-to-skills/SKILL.md`

Convert Cursor rules and slash commands to Agent Skills format.

**Triggers**: migrate rules, convert commands, modernize configuration, rules to skills

**Key Features**:
- Automatic migration of "Applied intelligently" rules
- Slash command conversion with disable-model-invocation flag
- Preserves exact body content (no reformatting)
- Parallel migration with subagents
- Undo capability

## What Makes These User-Level Skills?

These skills are stored in `~/.cursor/skills/` which means:
- Available across **all your projects** (not just schrodingers-site)
- Personal to you (not shared in git repositories)
- Higher priority than built-in Cursor skills
- Persist across Cursor updates

## Combined Skills Summary

You now have **11 total user-level skills**:

### Project-Specific (6 skills)
Created earlier for schrodingers-site:
1. shader-development
2. research-integration
3. astro-optimization
4. visual-debugging
5. performance-profiling
6. api-integration

### Cursor Management (5 skills)
Just created:
1. create-skill
2. create-rule
3. create-subagent
4. update-cursor-settings
5. migrate-to-skills

## Usage Examples

### Creating a New Skill
"Create a skill for database migrations" → Triggers create-skill

### Setting Up Project Rules
"Add a rule for TypeScript error handling" → Triggers create-rule

### Building Custom Agents
"Create a subagent for API testing" → Triggers create-subagent

### Changing Editor Settings
"Make my font bigger" → Triggers update-cursor-settings

### Modernizing Configuration
"Migrate my old rules to skills" → Triggers migrate-to-skills

## Verification

To verify the skills are available:
1. Open any project in Cursor
2. Start typing a relevant query
3. The appropriate skill should be automatically applied

Or check manually:
```bash
ls ~/.cursor/skills/
```

Should show:
- api-integration/
- astro-optimization/
- create-rule/
- create-skill/
- create-subagent/
- migrate-to-skills/
- performance-profiling/
- research-integration/
- shader-development/
- update-cursor-settings/
- visual-debugging/

## Next Steps

1. **Test the skills**: Try creating a new skill, rule, or subagent
2. **Customize descriptions**: Edit skill descriptions if they don't trigger when expected
3. **Create more skills**: Use create-skill to add domain-specific skills
4. **Set up project rules**: Use create-rule for project-specific conventions
5. **Build specialized agents**: Use create-subagent for complex workflows

## Maintenance

### Editing a Skill
```bash
# Open the skill file
open ~/.cursor/skills/[skill-name]/SKILL.md
# Or use Cursor
cursor ~/.cursor/skills/[skill-name]/SKILL.md
```

### Removing a Skill
```bash
rm -rf ~/.cursor/skills/[skill-name]/
```

### Backing Up Skills
```bash
# Create a backup
cp -r ~/.cursor/skills ~/cursor-skills-backup
```

## Key Differences: Skills vs Rules vs Subagents

| Feature | Skills | Rules | Subagents |
|---------|--------|-------|-----------|
| **Purpose** | Teach workflows | Enforce standards | Specialized tasks |
| **Scope** | Task-specific | File/project-wide | Isolated context |
| **Format** | SKILL.md | .mdc | .md with system prompt |
| **Location** | .cursor/skills/ | .cursor/rules/ | .cursor/agents/ |
| **Trigger** | Auto (by description) | Auto (by globs/always) | Manual or delegated |

## Resources

All skills follow Cursor best practices:
- Concise (under 500 lines)
- Third-person descriptions
- Specific trigger terms
- Code examples and templates
- Checklists and workflows

These management skills will help you create and maintain a powerful, customized Cursor environment across all your projects.
