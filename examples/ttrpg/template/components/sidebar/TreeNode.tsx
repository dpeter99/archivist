'use client'

import { NavTreeNode } from '@dpeter99/archavist/template';
import {MinusIcon} from "../../icons/MinusIcon";
import {PlusIcon} from "../../icons/PlusIcon";
import {useState} from "react";

interface TreeNodeProps {
  node: NavTreeNode;
  currentPath: string;
  depth: number;
}

export function TreeNode({node, currentPath, depth}: TreeNodeProps) {
  const isActivePath = currentPath.startsWith(node.url);
  const [isExpanded, setIsExpanded] = useState(isActivePath);
  
  
  const hasChildren = node.children && node.children.length > 0;
  
  const nodeClasses = [
    'nav-node',
    `nav-node--depth-${depth}`
  ].join(' ');

  return (
    <div className={nodeClasses}>
      <TreeItem
        url={node.url}
        text={node.title}
        expandable={hasChildren}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        isActive={isActivePath}
      />
      {hasChildren && (
        <div className={`nav-node__content ${isExpanded ? '' : 'collapsed'}`}>
          {node.children.map((child) => (
            <TreeNode
              key={child.url}
              node={child}
              currentPath={currentPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeItemProps {
  url: string;
  text: string;
  
  expandable: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  
  isActive: boolean;
}

export function TreeItem({
  expandable, 
  isExpanded, 
  onToggle, 
  isActive,
  url, text
}: Readonly<TreeItemProps>) {

  const itemClasses = [
    'nav-item',
    isActive ? 'nav-item--active' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClasses}>
      {expandable && (
        <button
          className="nav-item__toggle"
          onClick={onToggle}
          aria-expanded={isExpanded}
        >
          <span className="nav-item__toggle-icon">
            {isExpanded ? <MinusIcon /> : <PlusIcon />}
          </span>
        </button>
        )
      }
      <a href={url}>
        <span className="nav-item__label">{text}</span>
      </a>
    </div>
  );
}