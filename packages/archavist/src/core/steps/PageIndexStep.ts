import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core/pipeline/types';
import type { PageIndexEntry, PageIndexComponent } from '@/core/Content';

/**
 * Pipeline step that creates a page index for WikiLink resolution
 *
 * This step builds an index of all pages with their titles, aliases,
 * source paths, and URLs. The index is stored as a single PageIndexComponent
 * in the pipeline context's dataComponents array.
 *
 * **Dependencies**: Requires UrlGenerationStep to have run first (needs url property)
 *
 * **Output**: Adds a single PageIndexComponent with type 'page-index' to context.dataComponents
 */
export class PageIndexStep extends BasePipelineStep {
  constructor() {
    super('PageIndexing');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const entries: PageIndexEntry[] = [];

    // Iterate through all content to build entries
    for (const content of context.content) {
      // Skip content without URLs (means UrlGenerationStep hasn't run)
      if (!content.url) {
        continue;
      }
      
      const title = content.frontmatter.title || 'Untitled';
      
      const aliases: string[] = [
        content.fileName
      ];
      if (content.frontmatter.aliases) {
        if (Array.isArray(content.frontmatter.aliases)) {
          aliases.push(...content.frontmatter.aliases);
        } else if (typeof content.frontmatter.aliases === 'string') {
          aliases.push(content.frontmatter.aliases);
        }
      }
      
      entries.push({
        title,
        aliases,
        sourcePath: content.sourcePath,
        url: content.url,
      });
    }
    
    const pageIndexComponent: PageIndexComponent = {
      id: 'page-index',
      type: 'page-index',
      entries,
    };

    context.dataComponents.add(pageIndexComponent);

    return context;
  }
}
