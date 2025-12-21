import { getCurrentContent, getNavTree, NavTreeNode, resolveAsset } from '@dpeter99/archavist/template';
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

  // Test resolveAsset with frontmatter image
  const imagePath = content.frontmatter?.image as string | undefined;
  const imageUrl = resolveAsset(imagePath);

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

        {imageUrl && (
          <div style={{ border: '2px solid green', padding: '10px', margin: '10px 0' }}>
            <p><strong>Resolved Asset:</strong> {imageUrl}</p>
            <img src={imageUrl} alt="Test" style={{ maxWidth: '200px' }} />
          </div>
        )}
        {imagePath && !imageUrl && (
          <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
            <p><strong>Asset Resolution Failed:</strong> {imagePath}</p>
            <p>Check console warnings for details.</p>
          </div>
        )}

        <article>
          {content.html && <div dangerouslySetInnerHTML={{ __html: content.html }} />}
        </article>

        <ClientCounter/>
      </div>
    </body>
    </html>
  )
}