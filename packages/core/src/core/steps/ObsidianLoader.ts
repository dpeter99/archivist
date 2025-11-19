import { glob } from 'glob';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';

import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core/pipeline/types';
import {Content} from "@/core/Content";

/**
 * Pipeline step that loads markdown files from the vault
 */
export class ObsidianLoader extends BasePipelineStep {
  constructor() {
    super('Obsidian Loading');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const { vaultPath } = context.config;

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

      // Parse frontmatter
      const { data: frontmatter, content } = matter(rawContent);

      // Create file data
      const fileData : Content = {
        sourcePath: filePath,
        content,
        frontmatter,
      };

      context.content.push(fileData);

    }

    console.log(`Loaded ${files.length} pages`);

    return context;
  }
}