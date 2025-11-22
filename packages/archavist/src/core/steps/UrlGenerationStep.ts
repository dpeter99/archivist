import { join } from 'node:path';

import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core/pipeline/types';
import type { Content } from '@/core/Content';

/**
 * Pipeline step that generates URLs and slugs for content
 */
export class UrlGenerationStep extends BasePipelineStep {
  constructor() {
    super('URL Generation');
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

    // Add directory structure if present
    if (content.sourceDir && content.sourceDir !== '.') {
      parts.push(content.sourceDir);
    }

    // Add slug
    if (content.slug) {
      parts.push(content.slug);
    }

    // Join with forward slashes and ensure leading slash
    const url = '/' + parts.join('/');

    return this.normalizeUrl(url);
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
    if (path === '' || path.endsWith('/')) {
      path += 'index.html';
    } else {
      // Add .html extension
      path += '.html';
    }

    return join(outputPath, path);
  }
}