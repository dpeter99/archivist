import {getNavTree, NavTreeNode} from '@dpeter99/archavist/template';
import {TreeNode} from "./TreeNode";

interface NavigationTreeProps {
  currentPath: string;
}

export function NavigationTree({ currentPath }: NavigationTreeProps) {
  const navTree = getNavTree();

  return (
    <div className="nav-tree">
      {navTree.map((node) => (
        <TreeNode
          key={node.url}
          node={node}
          currentPath={currentPath}
          depth={0}
        />
      ))}
    </div>
  );
}


