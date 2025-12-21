import type { VFile } from 'vfile';
import { basename } from 'node:path';

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

/**
 * Metadata for a single asset file
 */
export interface AssetMetadata {
  /** Source path relative to vault (e.g., "images/map.png") */
  sourcePath: string;
  /** Absolute source file path for copying */
  absolutePath: string;
  /** Output URL (e.g., "/images/map.png") */
  url: string;
  /** Output file path (e.g., "build/images/map.png") */
  outPath: string;
  /** Pre-calculated basename for efficient lookups (e.g., "map.png") */
  basename: string;
}

/**
 * Data component that holds all asset metadata and provides resolution methods
 */
export class AssetManifestComponent implements DataComponent {
  readonly id = 'asset-manifest';
  readonly type = 'asset-manifest';
  readonly assets: Map<string, AssetMetadata>;

  constructor(assets: Map<string, AssetMetadata>) {
    this.assets = assets;
  }

  /**
   * Find asset by various path formats
   *
   * Supports multiple path resolution strategies:
   * - Direct match: "images/logo.png"
   * - Basename match: "logo.png" matches any path ending with /logo.png
   * - Normalized paths: handles "./", "../", etc.
   *
   * @param filePath - The asset path to resolve
   * @returns Asset metadata if found, undefined otherwise
   */
  findAssetByPath(filePath: string): AssetMetadata | undefined {
    // Normalize: remove leading ./ and ../
    const normalized = filePath.replace(/^\.\//, '').replace(/^\.\.\//g, '');

    // Try direct lookup by full path
    if (this.assets.has(normalized)) {
      return this.assets.get(normalized);
    }

    // Try basename match (use pre-calculated basename for efficiency)
    const searchBasename = basename(filePath);
    for (const asset of this.assets.values()) {
      if (asset.basename === searchBasename) {
        return asset; // Return first match
      }
    }

    return undefined;
  }
}