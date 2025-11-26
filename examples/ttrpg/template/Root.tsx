import { Content } from '@dpeter99/archavist';
import { BookLayout } from './components/layout/BookLayout';
import './styles/global.scss';

export function Root({ content }: { content: Content }) {
  const title = content.frontmatter?.title || 'Untitled';

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} - Ren's Mind</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BookLayout
          content={content}
          siteTitle="Ren's Mind"
          siteSubtitle="Chronicles of the group"
        />
      </body>
    </html>
  );
}
