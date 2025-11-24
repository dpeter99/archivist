import { getCurrentContent, getNavTree, NavTreeNode } from '@dpeter99/archavist/template';
import type { Content } from '@dpeter99/archavist';
import {ClientCounter} from "./counter";
import React from "react";

function NavItem({ node }: { node: NavTreeNode }) {
  return (
    <li>
      <a href={node.url}>{node.title}</a>
      {node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <NavItem key={child.url} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}


export const Root = ({ content }: { content: Content }) => {
  // Demonstrate both approaches to access content:
  // 1. Via props (explicit and recommended for direct usage)
  const title = content.frontmatter?.title || 'Untitled';

  // 2. Via global getter (useful for deeply nested components)
  const currentContent = getCurrentContent();
  const sourcePath = currentContent.sourcePath;

  // Get navigation tree
  const navTree = getNavTree();

  return (
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
    </head>
    <body>
      <div>
        <nav>
          <ul>
            {navTree.map(node => (
              <NavItem key={node.url} node={node} />
            ))}
          </ul>
        </nav>

        <h1>{title}</h1>
        <p>Source: {sourcePath}</p>

        <article>
          {content.html && <div dangerouslySetInnerHTML={{ __html: content.html }} />}
        </article>

        <ClientCounter/>
      </div>
    </body>
    </html>
  )
}