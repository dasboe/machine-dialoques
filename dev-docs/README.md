# Development Documentation System

## Overview

This directory contains all development documentation for the Machine Dialogues project. **Every change, decision, and implementation must be documented here following the exact structure and templates below.**

## Directory Structure

```
/dev-docs/
├── README.md                    # This file - documentation system guide
├── INDEX.md                     # Auto-generated overview of all documentation
├── /progress/                   # Chronological development entries
│   └── YYYY-MM-DD-feature-name.md
├── /decisions/                  # Architecture and design decisions
│   ├── tech-stack-choices.md
│   ├── architecture-decisions.md
│   └── api-design-decisions.md
└── /implementations/            # Technical implementation details
    ├── database-setup.md
    ├── api-endpoints.md
    └── frontend-structure.md
```

## Documentation Rules for AIs

### 🚨 MANDATORY: Every development session must create documentation

1. **Always start** by creating a progress entry in `/progress/`
2. **Always end** by updating INDEX.md
3. **Document decisions** in `/decisions/` when making architectural choices
4. **Document implementations** in `/implementations/` when building components

### File Naming Conventions

#### Progress Files: `/progress/YYYY-MM-DD-feature-name.md`

- Use ISO date format: `2024-01-15-api-setup.md`
- Use kebab-case for feature names
- One file per development session/feature

#### Decision Files: `/decisions/descriptive-name.md`

- Clear, descriptive names: `database-schema-design.md`
- One file per major decision category

#### Implementation Files: `/implementations/component-name.md`

- Component-based naming: `authentication-system.md`
- One file per major system component

## Templates

### Progress Entry Template

Every progress file MUST follow this exact structure:

```markdown
# [Feature Name] - [Date]

## What

Brief description of what was accomplished (1-2 sentences).

## Why

Reasoning behind the implementation/changes (2-3 sentences).

## How

Technical details of the implementation:

- Key files created/modified
- Technologies used
- Code structure decisions

## Challenges

Any issues encountered and how they were resolved.

## Testing

How the changes were tested/validated.

## Next Steps

What should be done next (specific actionable items).

## Files Modified/Created

- `path/to/file1.js`
- `path/to/file2.md`

## Related Documentation

- Link to relevant decision docs
- Link to implementation docs
```

### Decision Document Template

```markdown
# [Decision Title]

## Context

What situation led to this decision?

## Options Considered

1. Option A: Description, pros, cons
2. Option B: Description, pros, cons
3. Option C: Description, pros, cons

## Decision

Which option was chosen and why.

## Consequences

What are the implications of this decision?

## Date

When this decision was made.

## Status

- [ ] Proposed
- [x] Accepted
- [ ] Superseded by [link]
```

### Implementation Document Template

```markdown
# [Component Name] Implementation

## Overview

Brief description of the component and its purpose.

## Architecture

How this component fits into the overall system.

## Key Files

- `file1.js` - Description
- `file2.js` - Description

## Dependencies

- External libraries used
- Internal components this depends on

## Configuration

Environment variables, config files, etc.

## API/Interface

Public methods, endpoints, or interfaces this component provides.

## Testing Strategy

How to test this component.

## Deployment Notes

Special considerations for deployment.

## Maintenance

Known issues, monitoring points, update procedures.
```

## INDEX.md Maintenance

**Every AI must update INDEX.md after each documentation session.** The INDEX should contain:

1. **Recent Progress** (last 10 entries)
2. **All Decisions** (with status)
3. **All Implementations** (with completion status)
4. **Quick Navigation** links

## Documentation Workflow for AIs

### When Starting Development:

1. Create progress entry: `/progress/YYYY-MM-DD-feature-name.md`
2. Fill in "What" and "Why" sections immediately
3. Update as you work

### When Making Architectural Decisions:

1. Create or update decision document in `/decisions/`
2. Follow the decision template exactly
3. Link from progress entry

### When Implementing Components:

1. Create or update implementation document in `/implementations/`
2. Include all technical details
3. Link from progress entry

### When Finishing Development Session:

1. Complete the progress entry
2. Update INDEX.md with new entries
3. Ensure all links work

## Quality Standards

### Documentation Must Be:

- **Complete**: All sections filled out
- **Clear**: Understandable by future AIs/humans
- **Linked**: All related docs cross-referenced
- **Timestamped**: Clear chronology
- **Actionable**: Next steps are specific

### Common Mistakes to Avoid:

- ❌ Skipping documentation because "it's just a small change"
- ❌ Vague descriptions like "fixed some bugs"
- ❌ Not updating INDEX.md
- ❌ Missing file paths in progress entries
- ❌ Not linking related documentation

## Emergency Documentation Recovery

If documentation gets out of sync:

1. Create `recovery-YYYY-MM-DD.md` in `/progress/`
2. Document current state of project
3. Rebuild INDEX.md from scratch
4. Commit to maintaining documentation going forward

---

**Remember: Good documentation is not optional. It's what allows this project to scale and be maintained by multiple AIs over time.**
