import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import wikiLinkPlugin from '@flowershow/remark-wiki-link';
import { join, dirname, basename, extname } from 'node:path';
import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import {AssetManifestComponent, AssetMetadata, PipelineContext} from '@/core';
import { getDataComponent } from '@/core/pipeline/utils';
import type { PageIndexComponent } from '@/core/Content';
import { remarkWikiLinkValidator } from '@/core/steps/markdown/plugins/remarkWikiLinkValidator';
import { rehypeImageResolver } from '@/core/steps/markdown/plugins/rehypeImageResolver';


/**
 * WikiLink target object passed by remark-wiki-link plugin
 */
interface WikiLinkTarget {
  filePath: string;
  heading: string;
  isEmbed: boolean;
}

/**
 * Image file extensions to recognize
 */
const IMAGE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.bmp', '.ico', '.avif'
];

/**
 * Check if a file path is likely an image based on extension
 */
function isImagePath(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Creates a URL resolver function for WikiLinks using the page index and asset manifest
 * @param pageIndex - The PageIndexComponent containing all pages
 * @param assetManifest - The AssetManifestComponent containing all assets
 * @returns A function that resolves WikiLink targets to URLs
 */
function createUrlResolver(
  pageIndex: PageIndexComponent | undefined,
  assetManifest: AssetManifestComponent | undefined
) {
  return (target: WikiLinkTarget): string | null => {
    const { filePath, heading, isEmbed } = target;

    // Check if this is an image embed
    if (isEmbed && isImagePath(filePath)) {
      if (!assetManifest) {
        return null; // No asset manifest, can't resolve
      }

      // Try to find asset by various path formats
      const asset = assetManifest.findAssetByPath(filePath);
      return asset ? asset.url : null;
    }

    // Original page link logic
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

export interface MarkdownRenderStepOptions {
  vaultPath?: string;
}

/**
 * Pipeline step that renders markdown to HTML with WikiLink support
 */
export class MarkdownRenderStep extends BasePipelineStep {
  private vaultPath?: string;

  constructor(options?: MarkdownRenderStepOptions) {
    super('Markdown Rendering');
    this.vaultPath = options?.vaultPath;
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    // Get page index for WikiLink resolution
    const pageIndex = getDataComponent<PageIndexComponent>(
      context,
      'page-index'
    );

    // Get asset manifest for image resolution
    const assetManifest = getDataComponent<AssetManifestComponent>(
      context,
      'asset-manifest'
    );

    const urlResolver = createUrlResolver(pageIndex, assetManifest);
    
    const processor = unified()
      .use(remarkParse)
      .use(wikiLinkPlugin, {
        urlResolver,
      })
      .use(remarkWikiLinkValidator, { pageIndex })
      .use(remarkRehype)
      .use(rehypeImageResolver, { assetManifest, vaultPath: this.vaultPath })
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
