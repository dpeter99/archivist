import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import wikiLinkPlugin from '@flowershow/remark-wiki-link';
import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core';
import { getDataComponent } from '@/core/pipeline/utils';
import type { PageIndexComponent } from '@/core/Content';
import { remarkWikiLinkValidator } from './plugins/remarkWikiLinkValidator';


/**
 * WikiLink target object passed by remark-wiki-link plugin
 */
interface WikiLinkTarget {
  filePath: string;
  heading: string;
  isEmbed: boolean;
}

/**
 * Creates a URL resolver function for WikiLinks using the page index
 * @param pageIndex - The PageIndexComponent containing all pages
 * @returns A function that resolves WikiLink targets to URLs
 */
function createUrlResolver(pageIndex: PageIndexComponent | undefined) {
  return (target: WikiLinkTarget): string => {
    const { filePath, heading } = target;

    if (!pageIndex) {
      const baseUrl = `/${filePath.toLowerCase().replace(/\s+/g, '-')}`;
      return heading ? `${baseUrl}#${heading}` : baseUrl;
    }

    // Normalize filePath for case-insensitive matching
    const normalizedPath = filePath.toLowerCase().trim();

    // Try to find by title (case-insensitive)
    const match = pageIndex.entries.find(
      (entry) => {
        let match = false;
        match = match || entry.sourcePath.toLowerCase() === normalizedPath; 
        match = match || entry.title.toLowerCase() === normalizedPath;
        match = match || entry.aliases.some((alias) => alias.toLowerCase() === normalizedPath)
        
        return match;
      }
    );
    if (match) {
      return heading ? `${match.url}#${heading}` : match.url;
    }

    // Link not found - return null (validator plugin will handle warnings)
    return null;
  };
}

/**
 * Pipeline step that renders markdown to HTML with WikiLink support
 */
export class MarkdownRenderStep extends BasePipelineStep {
  constructor() {
    super('Markdown Rendering');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    // Get page index for WikiLink resolution
    const pageIndex = getDataComponent<PageIndexComponent>(
      context,
      'page-index'
    );
    
    const urlResolver = createUrlResolver(pageIndex);
    
    const processor = unified()
      .use(remarkParse)
      .use(wikiLinkPlugin, {
        urlResolver,
      })
      .use(remarkWikiLinkValidator, { pageIndex })
      .use(remarkRehype)
      .use(rehypeStringify);
    
    for (const content of context.content) {
      // Use the existing VFile that was created in ObsidianLoader
      const vfile = content.vfile;

      // Update the value to ensure it has the current markdown
      vfile.value = content.markdown;

      // Process the VFile (messages will be added to the existing VFile)
      const result = await processor.process(vfile);

      // Store HTML
      content.html = String(result);

      // VFile is already stored in content.vfile, messages are now attached
    }

    console.log(`Rendered ${context.content.length} markdown files to HTML`);
    
    

    return context;
  }
}
