# Archavist v2

A static site generator for Obsidian notes using React 19's new static DOM APIs.

## Features

- **Pipeline Architecture**: Modular, composable pipeline steps
- **Obsidian Support**: Reads Obsidian markdown files with wiki-links
- **React 19**: Uses the new `prerender` API for static HTML generation
- **Link Graph**: Builds an index of page relationships and backlinks
- **Type-Safe**: Written in TypeScript with strict type checking

## Pipeline Steps

The generator uses a pipeline architecture with the following steps:

1. **File Loading**: Reads markdown files from your Obsidian vault
2. **URL Generation**: Converts file paths to clean URLs
3. **Indexing**: Builds a graph of page relationships and backlinks
4. **HTML Rendering**: Converts markdown to HTML and processes wiki-links
5. **Output**: Generates static HTML files using React 19's prerender API

## Installation

```bash
pnpm install
```

## CLI Usage

Archavist provides a command-line interface for building and serving your Obsidian vault as a static site.

### Configuration

Create an `archavist.config.ts` file in your project root:

```typescript
import type { ArchavistConfig } from './src/cli/utils/config.js';
import {
  FileLoadingStep,
  UrlGenerationStep,
  IndexingStep,
  HtmlRenderingStep,
  OutputStep,
} from './src/pipeline/steps/index.js';

const config: ArchavistConfig = {
  // Path to your Obsidian vault (required)
  vaultPath: '/path/to/your/vault',

  // Output directory for generated site
  outputPath: './build',

  // Base URL for the site
  baseUrl: '',

  // Site metadata
  site: {
    title: 'My Obsidian Site',
    description: 'Generated from my Obsidian vault',
    lang: 'en',
  },

  // Development server options
  dev: {
    port: 3000,
    host: 'localhost',
    open: false,
  },

  // Watch configuration
  watch: {
    ignored: ['**/.*', '**/node_modules/**'],
    debounce: 300,
  },

  // Pipeline configuration
  // Configure the pipeline by adding steps
  pipeline: (pipeline) => {
    return pipeline
      .addStep(new FileLoadingStep())
      .addStep(new UrlGenerationStep())
      .addStep(new IndexingStep())
      .addStep(new HtmlRenderingStep())
      .addStep(new OutputStep());
  },
};

export default config;
```

You can customize the pipeline by:
- Omitting steps you don't need
- Reordering steps
- Adding custom pipeline steps
- Passing configuration to step constructors (when they support it)

Example with selective steps:
```typescript
pipeline: (pipeline) => {
  return pipeline
    .addStep(new FileLoadingStep())
    .addStep(new UrlGenerationStep())
    // Skip indexing to disable backlinks
    .addStep(new HtmlRenderingStep())
    .addStep(new OutputStep());
}
```

### Commands

#### Build

Build the static site from your Obsidian vault:

```bash
archavist build [options]

Options:
  -c, --config <path>    Path to config file
  -o, --output <path>    Output directory
  -v, --verbose          Verbose logging
```

Example:
```bash
# Build using archavist.config.ts
archavist build

# Build with custom config and output
archavist build --config ./my-config.ts --output ./dist
```

#### Dev

Start a development server with file watching and auto-rebuild:

```bash
archavist dev [options]

Options:
  -c, --config <path>    Path to config file
  -p, --port <number>    Port number (default: 3000)
  -H, --host <host>      Host to bind (default: localhost)
  --open                 Open browser automatically
  --no-watch             Disable file watching
```

Example:
```bash
# Start dev server on default port
archavist dev

# Start on custom port and open browser
archavist dev --port 8080 --open
```

The dev server will:
- Build your site initially
- Start a local HTTP server
- Watch for file changes
- Automatically rebuild when files change

#### Serve

Serve a pre-built site (production preview):

```bash
archavist serve [options]

Options:
  -d, --dir <path>       Directory to serve (default: ./build)
  -p, --port <number>    Port number (default: 3000)
  -H, --host <host>      Host to bind (default: localhost)
```

Example:
```bash
# Serve the built site
archavist serve

# Serve from custom directory
archavist serve --dir ./dist --port 8080
```

## Library Usage

You can also use Archavist programmatically:

```typescript
import { Pipeline } from './pipeline/index.js';
import {
  FileLoadingStep,
  UrlGenerationStep,
  IndexingStep,
  HtmlRenderingStep,
  OutputStep,
} from './pipeline/steps/index.js';

// Create the pipeline
const pipeline = new Pipeline();

// Add pipeline steps
pipeline
  .addStep(new FileLoadingStep())
  .addStep(new UrlGenerationStep())
  .addStep(new IndexingStep())
  .addStep(new HtmlRenderingStep())
  .addStep(new OutputStep());

// Execute
await pipeline.execute({
  vaultPath: '/path/to/obsidian/vault',
  outputPath: './build',
  baseUrl: '',
});
```

## Project Structure

```
src/
├── cli/
│   ├── index.ts              # CLI entry point
│   ├── commands/
│   │   ├── build.ts          # Build command
│   │   ├── dev.ts            # Dev server command
│   │   └── serve.ts          # Serve command
│   ├── server/
│   │   └── DevServer.ts      # Development server with watch mode
│   └── utils/
│       ├── config.ts         # Configuration loading
│       └── logger.ts         # Colored console output
├── components/
│   └── Page.tsx              # React component for page rendering
├── pipeline/
│   ├── Pipeline.ts           # Main pipeline orchestrator
│   ├── PipelineStep.ts       # Base class for pipeline steps
│   ├── types.ts              # TypeScript type definitions
│   └── steps/
│       ├── FileLoadingStep.ts
│       ├── UrlGenerationStep.ts
│       ├── IndexingStep.ts
│       ├── HtmlRenderingStep.ts
│       └── OutputStep.ts
└── index.ts                  # Library API
```

## Architecture

### Pipeline Context

The `PipelineContext` object flows through all pipeline steps:

```typescript
interface PipelineContext {
  config: SiteConfig;
  index: PageIndex;
}
```

### File Data

Each file in the vault is represented as:

```typescript
interface FileData {
  path: string;              // Original file path
  url?: string;              // Generated URL
  content: string;           // Raw markdown content
  frontmatter: Record<string, unknown>;
  html?: string;             // Rendered HTML
  links?: Link[];            // Outgoing links
  backlinks?: Link[];        // Incoming links
}
```

### Custom Pipeline Steps

You can create custom pipeline steps by extending `BasePipelineStep`:

```typescript
import { BasePipelineStep } from './pipeline/PipelineStep.js';
import type { PipelineContext } from './pipeline/types.js';

export class CustomStep extends BasePipelineStep {
  constructor() {
    super('Custom Step Name');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    // Your custom logic here
    return context;
  }
}
```

## React 19 Static APIs

This project uses React 19's new `prerender` API from `react-dom/static`:

```typescript
import { prerender } from 'react-dom/static';

const { prelude } = await prerender(<Page fileData={fileData} />);
```

The `prerender` API:
- Waits for all data to load before returning static HTML
- Returns a `ReadableStream` that can be converted to a string
- Is designed for static site generation and build-time rendering

## License

ISC