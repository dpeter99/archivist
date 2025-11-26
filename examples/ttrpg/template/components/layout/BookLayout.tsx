import { Content } from '@dpeter99/archavist';
import { Sidebar } from '../sidebar/Sidebar';
import { ContentPanel } from './ContentPanel';

interface BookLayoutProps {
  content: Content;
  siteTitle: string;
  siteSubtitle?: string;
}

export function BookLayout({ content, siteTitle, siteSubtitle }: Readonly<BookLayoutProps>) {
  const currentPath = content.url || '/';

  return (
    <div className="book-container">
      <div className="book-pages">
        <Sidebar
          currentPath={currentPath}
          siteTitle={siteTitle}
          siteSubtitle={siteSubtitle}
        />
        <ContentPanel content={content} />
      </div>
    </div>
  );
}
