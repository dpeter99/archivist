import { join } from 'node:path';

import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core/pipeline/types';
import type { Content } from '@/core/Content';

/**
 * Pipeline step that generates URLs and slugs for content
 */
export class UrlGenerationStep extends BasePipelineStep {
  private folderIndex: boolean;

  constructor(options?: { folderIndex?: boolean }) {
    super('URL Generation');
    this.folderIndex = options?.folderIndex ?? false;
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    for (const content of context.content) {
      // Generate slug from filename
      content.slug = this.generateSlug(content.fileName || '');

      // Generate URL from source path structure
      content.url = this.generateUrl(content);

      // Generate output path
      content.outPath = this.generateOutputPath(content.url, context.config.outputPath);
    }

    console.log(`Generated URLs for ${context.content.length} pages`);

    return context;
  }

  /**
   * Generate a URL-friendly slug from a string
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      // Transliterate accented characters to ASCII equivalents
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      // Replace spaces and underscores with hyphens
      .replaceAll(/[\s_]+/g, '-')
      // Remove special characters except hyphens and alphanumeric
      .replaceAll(/[^\w-]+/g, '')
      // Remove multiple consecutive hyphens
      .replaceAll(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate URL from content structure
   */
  private generateUrl(content: Content): string {
    const parts: string[] = [];

    // Split and slugify EACH directory segment
    if (content.sourceDir && content.sourceDir !== '.') {
      const dirParts = content.sourceDir.split('/').filter(p => p);
      const slugifiedDirs = dirParts.map(dir => this.generateSlug(dir));
      parts.push(...slugifiedDirs);
    }

    // Check if this is a folder index note (filename matches parent folder)
    const isFolderIndex = this.folderIndex &&
                           parts.length > 0 &&
                           content.slug === parts[parts.length - 1];

    // Only add slug if it's NOT a folder index
    if (content.slug && !isFolderIndex) {
      parts.push(content.slug);
    }

    // Join with forward slashes and ensure leading slash
    let url = '/' + parts.join('/');
    url = this.normalizeUrl(url);

    // Add trailing slash for folder indexes AFTER normalization
    // This triggers index.html generation in generateOutputPath()
    if (isFolderIndex && !url.endsWith('/')) {
      url += '/';
    }

    return url;
  }

  /**
   * Normalize URL to ensure consistent format
   */
  private normalizeUrl(url: string): string {
    // Ensure leading slash
    if (!url.startsWith('/')) {
      url = '/' + url;
    }

    // Remove trailing slash (except for root)
    if (url.length > 1 && url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    // Normalize multiple slashes
    url = url.replaceAll(/\/+/g, '/');

    return url;
  }

  /**
   * Generate output file path from URL
   */
  private generateOutputPath(url: string, outputPath: string): string {
    // Remove leading slash
    let path = url.replace(/^\//, '');

    // If URL ends with /, make it index.html
    if (path === '') {
      path += 'index.html';
    } else if (path.endsWith('/')) {
      path = path.slice(0, -1) + '.html';
    } else {
      // Add .html extension
      path += '.html';
    }

    return join(outputPath, path);
  }
}