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

      // Extract title with priority: nav_title → title → fileName → 'Untitled'
      const title = content.frontmatter?.nav_title
                    || content.frontmatter?.title
                    || content.fileName
                    || 'Untitled';

      // Construct the node to insert
      const node: NavTreeNode = {
        title,
        url: content.url,
        children: []
      };

      // Get original directory names from sourceDir for intermediate nodes
      const sourceDirParts = content.sourceDir
        ? content.sourceDir.split('/').filter(Boolean)
        : [];

      this.insertIntoTree(tree, node, sourceDirParts);
    }

    // Store tree in context
    context.navTree = tree;

    // Sort the tree: folders first, then files, alphabetically
    this.sortTreeRecursively(tree);

    console.log(`Built navigation tree with ${context.content.length} pages`);

    return context;
  }

  private insertIntoTree(
    tree: NavTreeNode[],
    nodeToInsert: NavTreeNode,
    sourceDirParts: string[]
  ): void {
    const urlParts = nodeToInsert.url.split('/').filter(Boolean);

    // Root page
    if (urlParts.length === 0) {
      tree.push({ ...nodeToInsert, url: '/' });
      return;
    }

    let currentTree = tree;
    let currentPath = '';

    for (let i = 0; i < urlParts.length; i++) {
      currentPath += '/' + urlParts[i];
      const isLeaf = i === urlParts.length - 1;

      // Find existing node at this level
      let node = currentTree.find(n => n.url === currentPath);

      if (!node) {
        if (isLeaf) {
          // Insert the leaf node with its title
          currentTree.push(nodeToInsert);
        } else {
          // Create intermediate directory node with original casing
          const dirTitle = sourceDirParts[i] || urlParts[i];
          node = {
            title: dirTitle,
            url: currentPath,
            children: []
          };
          currentTree.push(node);
        }
      } else if (isLeaf) {
        // Update existing node with new title
        node.title = nodeToInsert.title;
      }

      // Move to next level (only if not leaf or if node exists)
      if (!isLeaf && node) {
        currentTree = node.children;
      }
    }
  }

  /**
   * Recursively sort nav tree nodes: folders first, then files, alphabetically by title
   */
  private sortTreeRecursively(tree: NavTreeNode[]): void {
    tree.sort((a, b) => {
      const aIsFolder = a.children.length > 0;
      const bIsFolder = b.children.length > 0;

      // Folders before files
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;

      // Alphabetically by title within same type
      return a.title.localeCompare(b.title);
    });

    // Recursively sort children
    for (const node of tree) {
      if (node.children.length > 0) {
        this.sortTreeRecursively(node.children);
      }
    }
  }
}
