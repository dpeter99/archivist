# Missing Features

This template is a simplified version of the original Astro template. The following features are **not implemented** and require Archavist core features:

## Not Yet Implemented

### 1. Backlinks
The original template showed which pages link to the current page. This requires:
- Wiki-link parsing (`[[Link]]` syntax)
- Cross-reference detection across all content
- **Blocker**: Archavist doesn't process wiki-links yet

### 2. Table of Contents
Automatic TOC generation from page headings. Requires:
- HTML parsing to extract `<h2>`, `<h3>` elements
- Generating anchor links
- **Workaround**: Could be added as a custom component

### 3. Map Layout
The original had an interactive map layout using MapLibre GL. Omitted because:
- Complex secondary feature
- Requires map assets and configuration
- **Workaround**: Could be added as alternate layout later

### 4. SCSS Compilation
The template uses SCSS files but Archavist doesn't compile SCSS yet:
- Files are imported but not processed
- **Status**: User will add SCSS compilation to Archavist soon
- **Workaround**: None needed - this is being fixed in Archavist

### 5. Wiki-Link Syntax
The original supported `[[Page Name]]` links. This requires:
- Custom markdown remark/rehype plugin
- Link resolution during build
- **Blocker**: Not in Archavist's MarkdownRenderStep yet

### 6. Advanced Navigation
Not implemented:
- Breadcrumbs
- Previous/Next page navigation
- Custom sort order (beyond alphabetical)

### 7. Search
Full-text search across content:
- Requires search index generation
- Client-side search component
- **Future enhancement**

### 8. Asset Optimization
Not included:
- Image optimization/resizing
- Font subsetting
- Icon sprite generation

## Simplified Features

These were intentionally simplified:

1. **Tree State Persistence** - Tree expand/collapse state is URL-based only (no localStorage)
2. **Icons** - Using inline SVG instead of PNG assets
3. **Typography** - Limited to Google Fonts (custom fonts not bundled)

## Future Enhancements

Could be added later:
- Dark mode toggle
- Print stylesheet
- RSS feed for session notes
- Character/NPC index page
- Timeline view
