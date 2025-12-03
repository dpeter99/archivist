import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import type { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import type { PageIndexComponent } from '@/core/Content';

interface WikiLinkNode {
  type: 'wikiLink';
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
    const { pageIndex } = options;

    if (!pageIndex) {
      // No page index available, can't validate
      return;
    }

    visit(tree, 'wikiLink', (node: WikiLinkNode) => {
      // The @flowershow plugin sets data.path to the resolved URL
      // If path is null, the link couldn't be resolved
      if (node.data.path === null) {
        const message = file.message(
          `Cannot resolve WikiLink: [[${node.value}]]`,
          node.position,
          'archavist:wikilink'
        );
        message.fatal = false; // Warning, not error
      }
    });
  };
};
