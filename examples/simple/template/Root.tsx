import { getCurrentContent } from '@dpeter99/archavist/template';
import type { Content } from '@dpeter99/archavist';
import {ClientCounter} from "./counter";
import React from "react";


export const Root = ({ content }: { content: Content }) => {
  // Demonstrate both approaches to access content:
  // 1. Via props (explicit and recommended for direct usage)
  const title = content.frontmatter?.title || 'Untitled';

  // 2. Via global getter (useful for deeply nested components)
  const currentContent = getCurrentContent();
  const sourcePath = currentContent.sourcePath;

  return (
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
    </head>
    <body>
      <div>
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