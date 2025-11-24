import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core';
import type { NavTreeNode } from '@/core/NavTree';

export class NavTreeStep extends BasePipelineStep {
  constructor() {
    super('Navigation Tree');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const tree: NavTreeNode[] = [];

    // Build tree from content URLs
    for (const content of context.content) {
      if (!content.url) continue;

      const title = content.frontmatter?.title || content.fileName || 'Untitled';
      const url = content.url;

      this.insertIntoTree(tree, url, title);
    }

    // Store tree in context
    context.navTree = tree;

    console.log(`Built navigation tree with ${context.content.length} pages`);

    return context;
  }

  private insertIntoTree(tree: NavTreeNode[], url: string, title: string): void {
    const parts = url.split('/').filter(p => p);

    // Root page
    if (parts.length === 0) {
      tree.push({ title, url: '/', children: [] });
      return;
    }

    // Build path and find/create nodes
    let currentTree = tree;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      currentPath += '/' + parts[i];
      const isLeaf = i === parts.length - 1;

      // Find existing node at this level
      let node = currentTree.find(n => n.url === currentPath);

      if (!node) {
        // Create new node
        node = {
          title: isLeaf ? title : parts[i],
          url: currentPath,
          children: []
        };
        currentTree.push(node);
      } else if (isLeaf) {
        // Update title for leaf node
        node.title = title;
      }

      currentTree = node.children;
    }
  }
}
