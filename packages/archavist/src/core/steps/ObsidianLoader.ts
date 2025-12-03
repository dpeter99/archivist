import { glob } from 'glob';
import { readFile, stat } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';
import matter from 'gray-matter';
import { VFile } from 'vfile';

import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core/pipeline/types';
import { Content } from "@/core/Content";


type ObsidianLoaderOptions = {
  vaultPath: string;
}

/**
 * Pipeline step that loads markdown files from the vault
 */
export class ObsidianLoader extends BasePipelineStep {
  options: ObsidianLoaderOptions;
  
  constructor(options: ObsidianLoaderOptions) {
    super('Obsidian Loading');
    this.options = options;
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const vaultPath = this.options.vaultPath;

    // Find all markdown files in the vault
    const files = await glob('**/*.md', {
      cwd: vaultPath,
      absolute: false,
      nodir: true,
    });

    console.log(`Found ${files.length} markdown files`);

    // Load and parse each file
    for (const filePath of files) {
      const absolutePath = join(vaultPath, filePath);
      const rawContent = await readFile(absolutePath, 'utf-8');

      // Get file stats
      const stats = await stat(absolutePath);

      // Parse frontmatter
      const { data: frontmatter, content: markdown } = matter(rawContent);

      // Extract file path components
      const sourceDir = dirname(filePath);
      const fileName = basename(filePath, extname(filePath));

      // Create file data
      const fileData: Content = {
        // Source information
        sourcePath: filePath,
        sourceDir: sourceDir,
        fileName,
        fileStats: {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        },

        // Raw content
        raw: rawContent,
        markdown,
        frontmatter: frontmatter,

        // Initialize VFile with path and content
        vfile: new VFile({
          path: filePath,
          value: markdown
        }),

        components: []
      };

      context.content.push(fileData);

    }

    console.log(`Loaded ${files.length} pages`);

    return context;
  }
}