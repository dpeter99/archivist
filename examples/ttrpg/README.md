# TTRPG Template for Archavist

A book-like template designed for TTRPG campaign documentation (D&D, Pathfinder, etc.).

## Features

- **Two-page book layout** - Left navigation, right content with paper texture
- **Hierarchical navigation** - Collapsible tree structure for organizing content
- **Mobile responsive** - Drawer navigation for tablets and phones
- **Fantasy styling** - D&D-inspired typography and design
- **Sample content** - Example NPCs, locations, and session notes

## Usage

```bash
# Build the site
pnpm --filter @example/ttrpg build

# Output will be in examples/ttrpg/build/
```

## Content Structure

Organize your campaign content in the `content/` directory:

```
content/
├── characters/     # NPCs and player characters
├── locations/      # Towns, dungeons, regions
├── sessions/       # Session notes and recaps
└── ...            # Any other categories
```

## Frontmatter

```yaml
---
title: "Display Title"
nav_title: "Short Nav Name"  # Optional, falls back to title
published: true              # Only published pages are built
date: 2024-01-15            # Optional date
tags:                        # Optional tags
  - npc
  - important
---
```

## Styling

This template uses SCSS (not yet compiled by Archavist - coming soon). The styling system includes:

- `_variables.scss` - Design tokens (colors, spacing, fonts)
- `book-layout.scss` - Two-page layout structure
- `navigation-tree.scss` - Tree navigation styles
- `notes-pages.scss` - Content page styling

## Known Limitations

See MISSING_FEATURES.md for features not yet implemented.
