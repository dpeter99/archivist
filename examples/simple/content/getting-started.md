---
title: Getting Started with Archavist
description: Learn how to use Archavist to generate static sites from Obsidian notes
date: 2024-01-10
tags: [tutorial, guide, archavist]
---

# Getting Started with Archavist

Archavist is a modern static site generator built specifically for Obsidian notes. It leverages React 19's new static DOM APIs to create fast, efficient static sites.

## Installation

```bash
pnpm install archavist
```

## Basic Configuration

Create an `archavist.config.ts` file in your project:

```typescript
import { ArchavistConfig, ObsidianLoader, OutputStep, Pipeline } from "archavist";

const config: ArchavistConfig = {
  vaultPath: "/path/to/your/vault",
  outputPath: "./build",
  baseUrl: "",
  pipeline: new Pipeline()
    .addStep(new ObsidianLoader())
    .addStep(new OutputStep()),
};

export default config;
```

## Key Features

### Wiki-Style Links

You can link to other pages using the familiar Obsidian syntax:

- `[[page-name]]` - Basic link
- `[[page-name|Display Text]]` - Link with custom text

For example, check out my post about [[react-19-features|React 19]] or read my [[first-blog-post|first blog post]].

### Pipeline Architecture

Archavist uses a modular pipeline architecture where you can:

1. Load files from your Obsidian vault
2. Generate URLs
3. Build a link graph with backlinks
4. Render HTML
5. Output static files

Read more about [[obsidian-tips|Obsidian tips]] to get the most out of your notes.

## Next Steps

Now that you understand the basics, you can:

- Write more content in your Obsidian vault
- Customize your pipeline steps
- Deploy your static site

Return to the [[index|home page]] to see all posts.