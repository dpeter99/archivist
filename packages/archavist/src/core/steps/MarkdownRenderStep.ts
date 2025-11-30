import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import wikiLinkPlugin from '@flowershow/remark-wiki-link';
import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core';
import { getDataComponent } from '@/core/pipeline/utils';
import type { PageIndexComponent } from '@/core/Content';


/**
 * WikiLink target object passed by remark-wiki-link plugin
 */
interface WikiLinkTarget {
  filePath: string;
  heading: string;
  isEmbed: boolean;
}


let missingLinks: WikiLinkTarget[] = [];

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
    else {
      missingLinks.push(target);
    }
    
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
      .use(remarkRehype)
      .use(rehypeStringify);
    
    for (const content of context.content) {
      const result = await processor.process(content.markdown);
      content.html = String(result);

      if (missingLinks.length > 0) {
        console.log(`Errors in file: ${content.sourcePath}`);
        for (const missingLink of missingLinks) {
          console.warn(`Missing Link: ${missingLink.filePath}`);
        }
        
      }
      missingLinks = [];
      
    }

    console.log(`Rendered ${context.content.length} markdown files to HTML`);
    
    

    return context;
  }
}
