/**
 * File system metadata
 */
export type FileStats = {
  /** File size in bytes */
  size: number;
  /** File creation time */
  created: Date;
  /** File last modified time */
  modified: Date;
};

/**
 * Common frontmatter fields (all optional)
 * Extends Record<string, any> to allow custom fields
 */
export type Frontmatter = {
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Publication date */
  date?: string | Date;
  /** Last updated date */
  updated?: string | Date;
  /** Tags for categorization */
  tags?: string[];
  /** Categories for organization */
  categories?: string[];
  /** Author name or names */
  author?: string | string[];
  /** Draft status (exclude from production) */
  draft?: boolean;
  /** Alternative names/aliases for this page */
  aliases?: string[];
  /** Custom permalink override */
  permalink?: string;
  /** Layout/template to use */
  layout?: string;
  /** Featured image */
  image?: string;
  /** Custom frontmatter fields */
  [key: string]: any;
};

/**
 * Comprehensive content object representing a page/document
 */
export type Content = {
  // ============ Source Information ============
  /** Original file path relative to vault (e.g., "blog/post.md") */
  sourcePath: string;
  /** Directory containing the file (e.g., "blog") */
  sourceDir?: string;
  /** File name without extension (e.g., "post") */
  fileName?: string;
  /** File system metadata */
  fileStats?: FileStats;

  // ============ Raw Content ============
  /** Raw markdown content (without frontmatter) */
  markdown: string;
  /** Rendered HTML content (converted from markdown) */
  html?: string;
  /** Parsed frontmatter data */
  frontmatter: Frontmatter;
  /** Original raw file content (with frontmatter) */
  raw?: string;

  // ============ URL/Routing ============
  /** URL-friendly slug (e.g., "my-post") */
  slug?: string;
  /** Relative URL path (e.g., "/blog/my-post") */
  url?: string;
  /** Absolute URL with baseUrl (e.g., "https://example.com/blog/my-post") */
  permalink?: string;
  /** Output file path (e.g., "build/blog/my-post.html") */
  outPath?: string;

  // ============ Navigation & Relationships ============
  /** Navigation breadcrumbs */
  breadcrumbs?: Array<{ title: string; url: string }>;
  /** Next page in sequence (for pagination) */
  next?: Content;
  /** Previous page in sequence (for pagination) */
  prev?: Content;
};