import type { Plugin } from 'unified';
import type { Root, Element } from 'hast';
import type { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import { join, dirname, relative } from 'node:path';

import {AssetManifestComponent} from "@/core";

interface Options {
  assetManifest?: AssetManifestComponent;
  vaultPath: string;
}

/**
 * Rehype plugin that resolves and validates image paths in standard markdown
 * Handles: ![alt](path.png) syntax
 *
 * Transforms relative paths to absolute URLs based on AssetManifestComponent
 * Adds VFile warnings for missing images
 */
export const rehypeImageResolver: Plugin<[Options], Root> = (options) => {
  const { assetManifest, vaultPath } = options;

  return (tree: Root, file: VFile) => {
    if (!assetManifest) {
      // No asset manifest, skip transformation
      return;
    }

    visit(tree, 'element', (node: Element) => {
      // Only process <img> elements
      if (node.tagName !== 'img') {
        return;
      }

      const src = node.properties?.src as string | undefined;
      if (!src) {
        return;
      }

      // Skip external URLs (http://, https://, //)
      if (/^(https?:)?\/\//i.test(src)) {
        return;
      }

      // Skip data URLs
      if (src.startsWith('data:')) {
        return;
      }

      // Get the current file's directory for relative path resolution
      const currentFilePath = file.path || '';
      const currentFileDir = dirname(currentFilePath);

      // Resolve the image path
      const resolvedPath = resolveImagePath(src, currentFileDir, vaultPath);

      // Look up in asset manifest
      const asset = assetManifest.assets.get(resolvedPath);

      if (asset) {
        // Transform to asset URL
        node.properties.src = asset.url;
      } else {
        // Image not found in assets, add warning
        file.message(
          `Cannot resolve image: ![...](${src}) - asset not found`,
          node.position,
          'archavist:image'
        );
        // Keep original src (will be broken link, but renders)
      }
    });
  };
};

/**
 * Resolve image path relative to current file
 *
 * Examples:
 * - "./map.png" in "sessions/s1.md" → "sessions/map.png"
 * - "../images/logo.png" in "posts/article.md" → "images/logo.png"
 * - "/images/logo.png" → "images/logo.png" (strip leading slash)
 * - "map.png" → "map.png" (relative to vault root)
 */
function resolveImagePath(
  imagePath: string,
  currentFileDir: string,
  vaultPath: string
): string {
  // Remove leading slash (treat as vault-relative)
  if (imagePath.startsWith('/')) {
    return imagePath.slice(1);
  }

  // Handle ./ and ../ relative paths
  if (imagePath.startsWith('./') || imagePath.startsWith('../')) {
    // Resolve relative to current file's directory
    const absolutePath = join(vaultPath, currentFileDir, imagePath);
    // Make relative to vault root
    return relative(vaultPath, absolutePath);
  }

  // Plain filename or vault-relative path
  return imagePath;
}
