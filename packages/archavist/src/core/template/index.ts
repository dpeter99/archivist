import {TemplateOptions} from "@/core/steps/ReactOutput/shared";
import { getCurrentContent } from './currentContent';
import { getAssetManifest } from './assetManifest';
export { getCurrentContent, setCurrentContent } from './currentContent';
export { getNavTree, setNavTree } from './navTree';
export { setAssetManifest, getAssetManifest } from './assetManifest';
export type { NavTreeNode } from '../NavTree';

export function defineTemplate(options: TemplateOptions) {
  return options;
}

/**
 * Resolves an asset path from frontmatter to its public URL.
 *
 * This utility function allows templates to safely resolve asset paths
 * specified in frontmatter fields (e.g., featured images, hero backgrounds).
 * It uses the same path resolution strategy as markdown image processors.
 *
 * Path Resolution:
 * - Direct path: "images/logo.png" matches images/logo.png in manifest
 * - Basename match: "logo.png" matches any path ending with /logo.png (first found)
 * - Normalized paths: "./logo.png", "../logo.png" are normalized before lookup
 *
 * Error Handling:
 * - Returns null if asset not found
 * - Emits VFile warning (visible in build output) for missing assets
 * - Handles undefined and null inputs gracefully
 *
 * @param path - The asset path from frontmatter (can be undefined/null)
 * @returns The resolved asset URL (e.g., "/images/logo.png"), or null if not found
 *
 * @example
 * import { resolveAsset, getCurrentContent } from '@dpeter99/archavist/template';
 *
 * function HeroImage() {
 *   const content = getCurrentContent();
 *   const imagePath = content.frontmatter?.mainImage;
 *   const imageUrl = resolveAsset(imagePath);
 *
 *   if (!imageUrl) {
 *     return null;
 *   }
 *
 *   return <img src={imageUrl} alt="Hero" />;
 * }
 */
export function resolveAsset(path: string | undefined | null): string | null {
  // Handle undefined/null gracefully
  if (!path) {
    return null;
  }

  // Get asset manifest from context
  const manifest = getAssetManifest();
  if (!manifest) {
    // No asset manifest available (AssetStep not in pipeline)
    // Get current content for warning
    const currentContent = getCurrentContent();
    currentContent.vfile.message(
      `Cannot resolve asset "${path}": Asset manifest not available. Add AssetStep to your pipeline.`,
      undefined,
      'archavist:asset'
    );
    return null;
  }

  // Try to find the asset
  const asset = manifest.findAssetByPath(path);

  if (!asset) {
    // Asset not found - emit warning
    const currentContent = getCurrentContent();
    currentContent.vfile.message(
      `Cannot resolve asset: ${path} - asset not found in manifest`,
      undefined,
      'archavist:asset'
    );
    return null;
  }

  // Return the public URL
  return asset.url;
}