import type { NavTreeNode } from '../NavTree';

let navTree: NavTreeNode[] | null = null;

export function setNavTree(tree: NavTreeNode[] | undefined): void {
  navTree = tree || [];
}

export function getNavTree(): NavTreeNode[] {
  if (navTree === null) {
    throw new Error('getNavTree() called before navigation tree was set');
  }
  return navTree;
}
