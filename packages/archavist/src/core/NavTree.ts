/**
 * Represents a node in the navigation tree
 */
export interface NavTreeNode {
  /** Page title (from frontmatter or filename) */
  title: string;

  /** Relative URL path (e.g., "/docs/guide") */
  url: string;

  /** Child pages nested under this node */
  children: NavTreeNode[];
}
