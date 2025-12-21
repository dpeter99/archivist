import type {VFile} from 'vfile';

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
  frontmatter: Record<string, any>;
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

  // ============ Diagnostics ============
  /** VFile object with diagnostic messages (initialized in ObsidianLoader) */
  vfile: VFile;

  components: DataComponent[];
};


export type DataComponent = {
  id: string;
  type: string;
}

/**
 * Individual page entry for the page index
 */
export interface PageIndexEntry {
  title: string;
  aliases: string[];
  sourcePath: string;
  url: string;
}

/**
 * Data component that holds all page index entries
 */
export interface PageIndexComponent extends DataComponent {
  type: 'page-index';
  entries: PageIndexEntry[];
}

