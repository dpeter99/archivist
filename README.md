# Archavist v2

A modern static site generator for Obsidian vaults, built with React 19's Server Components and static rendering capabilities.

## Features

- **Pipeline Architecture** - Modular, composable pipeline steps
- **React 19 + RSC** - Leverages Server Components and the `prerender()` API
- **Smart URL Generation** - Automatic slugification of paths and folder index support
- **Navigation Tree** - Hierarchical navigation from content structure
- **Markdown Rendering** - Converts markdown to HTML using remark/rehype
- **Type-Safe** - Written in TypeScript with full type definitions
- **Template System** - Create templates with React components

## Installation

This package is published to GitHub Packages:

```bash
# Configure npm to use GitHub Packages for @dpeter99 scope
npm config set @dpeter99:registry https://npm.pkg.github.com

# Install
npm install @dpeter99/archavist
```

## Quick Start

Create an `archavist.config.ts` file:

```typescript
import {
  ArchavistConfig,
  Pipeline,
  ObsidianLoader,
  UrlGenerationStep,
  MarkdownRenderStep,
  NavTreeStep,
  OutputStep,
} from '@dpeter99/archavist';

const config: ArchavistConfig = {
  vaultPath: './content',      // Path to your Obsidian vault
  outputPath: './build',        // Where to output the static site
  baseUrl: '',                  // Base URL for your site

  pipeline: new Pipeline()
    .addStep(new ObsidianLoader())
    .addStep(new UrlGenerationStep())
    .addStep(new MarkdownRenderStep())
    .addStep(new NavTreeStep())
    .addStep(new OutputStep()),
};

export default config;
```

Create a template in `./template/index.tsx`:

```typescript
import { defineTemplate, getCurrentContent } from '@dpeter99/archavist/template';
import type { Content } from '@dpeter99/archavist';

const Root = ({ content }: { content: Content }) => {
  const title = content.frontmatter?.title || 'Untitled';

  return (
    <html lang="en">
      <head>
        <title>{title}</title>
      </head>
      <body>
        <h1>{title}</h1>
        <article dangerouslySetInnerHTML={{ __html: content.html || '' }} />
      </body>
    </html>
  );
};

export const template = defineTemplate({
  rootComponent: Root
});
```

Build your site:

```bash
archavist build
```

## Pipeline Steps

Archavist uses a pipeline architecture where each step processes content:

### ObsidianLoader
Loads markdown files from your vault using glob patterns, parses frontmatter and content.

### UrlGenerationStep
Generates clean, SEO-friendly URLs and slugs from file paths.

**Features:**
- **Directory Slugification:** Slugifies all path segments (directories + filenames)
- **Folder Index:** Optional Obsidian-style folder indexes

**Options:**
```typescript
new UrlGenerationStep({
  folderIndex: boolean  // Default: false
})
```

**Examples:**
- `Blog Posts/My Article.md` → `/blog-posts/my-article`
- With `folderIndex: true`: `posts/posts.md` → `/posts/` (becomes index.html)

### MarkdownRenderStep
Converts markdown to HTML using the unified/remark/rehype pipeline. Stores rendered HTML in `content.html`.

### NavTreeStep
Builds a hierarchical navigation tree from content URLs for site navigation.

### OutputStep
Builds the final static site using React 19's Server Components and `prerender()` API with Vite.

## Advanced Configuration

### Folder Index Support

Enable Obsidian-style folder indexes where files matching their parent folder become the folder's index page:

```typescript
const config: ArchavistConfig = {
  // ...
  pipeline: new Pipeline()
    .addStep(new ObsidianLoader())
    .addStep(new UrlGenerationStep({ folderIndex: true }))  // ← Enable
    .addStep(new MarkdownRenderStep())
    .addStep(new NavTreeStep())
    .addStep(new OutputStep()),
};
```

**Behavior:**
- `posts/posts.md` generates `/posts/` → `build/posts/index.html`
- `posts/article.md` still generates `/posts/article` → `build/posts/article.html`

This mirrors Obsidian's folder note behavior.

## Template System

Templates are React components that receive content data:

### Template Definition

```typescript
import { defineTemplate } from '@dpeter99/archavist/template';

export const template = defineTemplate({
  rootComponent: YourRootComponent
});
```

### Accessing Content

**Via Props** (recommended):
```typescript
const Root = ({ content }: { content: Content }) => {
  return <h1>{content.frontmatter.title}</h1>;
};
```

**Via Global Getter** (useful in nested components):
```typescript
import { getCurrentContent } from '@dpeter99/archavist/template';

const NestedComponent = () => {
  const content = getCurrentContent();
  return <p>{content.sourcePath}</p>;
};
```

### Client Components

Use the `'use client'` directive for interactive components:

```typescript
'use client';

export const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
};
```

## Content Type

Each markdown file is represented as a `Content` object:

```typescript
type Content = {
  // Source information
  sourcePath: string;
  sourceDir?: string;
  fileName?: string;

  // Content
  markdown: string;      // Raw markdown
  html?: string;         // Rendered HTML
  frontmatter: Frontmatter;

  // URLs
  slug?: string;
  url?: string;
  permalink?: string;
  outPath?: string;
};
```

## CLI

### build

Build the static site:

```bash
archavist build
```

This command:
1. Loads configuration from `archavist.config.ts`
2. Executes the pipeline
3. Outputs static HTML files to the configured output path

## Architecture

Archavist v2 uses a multi-environment Vite build:

1. **RSC Environment** - Compiles React Server Components
2. **SSR Environment** - Server-side rendering with `prerender()`
3. **Client Environment** - Browser hydration code

The rendering flow:
- `entry.rsc.tsx` - Exports `render()` function that creates RSC streams
- `entry.ssr.tsx` - Uses `prerender()` to generate static HTML
- `entry.browser.tsx` - Client-side hydration from RSC payload

## License

MIT
