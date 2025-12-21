import {basename} from "node:path";
import {DataComponent} from "@/core";

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