import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import type { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import type { PageIndexComponent } from '@/core/Content';

interface WikiLinkNode {
  type: 'wikiLink' | 'embed';  // Support both wikiLinks and embeds
  value: string;
  data: {
    alias?: string;
    path: string | null;
    existing: boolean;
    hProperties?: Record<string, unknown>;
  };
  position?: {
    start: { line: number; column: number; offset: number };
    end: { line: number; column: number; offset: number };
  };
}

interface Options {
  pageIndex?: PageIndexComponent;
}

/**
 * Remark plugin that validates WikiLinks and attaches warnings to VFile
 * for links that cannot be resolved.
 *
 * This plugin should run after @flowershow/remark-wiki-link which parses
 * the WikiLink syntax and attempts resolution. We check the `data.existing`
 * flag and attach VFile messages for unresolved links.
 */
export const remarkWikiLinkValidator: Plugin<[Options], Root> = (options) => {
  return (tree: Root, file: VFile) => {
    // Validate WikiLinks and embeds even without pageIndex
    // Image embeds don't need pageIndex, only assetManifest (handled in urlResolver)

    // Visit both 'wikiLink' and 'embed' nodes
    visit(tree, ['wikiLink', 'embed'], (node: WikiLinkNode) => {
      // The @flowershow plugin sets data.path to the resolved URL
      // If path is null, the link/embed couldn't be resolved
      if (node.data.path === null) {
        // Different message format for embeds vs links
        const isEmbed = node.type === 'embed';
        const message = file.message(
          isEmbed
            ? `Cannot resolve image embed: ![[${node.value}]]`
            : `Cannot resolve WikiLink: [[${node.value}]]`,
          node.position,
          'archavist:wikilink'
        );
        message.fatal = false; // Warning, not error
      }
    });
  };
};
