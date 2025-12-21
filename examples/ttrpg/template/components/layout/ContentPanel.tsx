import { Content } from '@dpeter99/archavist';
import { resolveAsset } from '@dpeter99/archavist/template';
import { MobileMenuToggle } from '../sidebar/MobileMenuToggle';

interface ContentPanelProps {
  content: Content;
}

export function ContentPanel({ content }: ContentPanelProps) {
  const title = content.frontmatter?.title || 'Untitled';
  const imagePath = content.frontmatter?.image as string | undefined;
  const imageUrl = resolveAsset(imagePath);
  const dateRaw = content.frontmatter?.date;
  const date = dateRaw ? (dateRaw instanceof Date ? dateRaw.toISOString().split('T')[0] : String(dateRaw)) : undefined;

  return (
    <main className="right-page">
      <MobileMenuToggle action="open" />

      <div className="right-page__content">
        <div className={`page-header ${imageUrl ? 'image' : ''}`}>
          {imageUrl && (
            <div className="page-header__image">
              <img src={imageUrl} alt="" />
            </div>
          )}
          <div className="page-header__title">
            <h1>{title}</h1>
            {date && <span className="subtitle">{date}</span>}
          </div>
        </div>

        <div className="page-content">
          {content.html && (
            <article dangerouslySetInnerHTML={{ __html: content.html }} />
          )}
        </div>
      </div>
    </main>
  );
}
