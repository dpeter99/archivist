import {AssetManifestComponent, Content, PipelineContext} from "@/core";
import {NavTreeNode} from "@/core/NavTree";


export interface TemplateContext {

  content: Content

  pipelineContext : PipelineContext

}

export let templateContext: TemplateContext;

export function setTemplateContext(val: TemplateContext) {
  templateContext = val;
}



export function getContent() {
  return templateContext.content;
}

export function getNavTree(): NavTreeNode[] {
  let navTree = templateContext.pipelineContext.navTree;
  if (navTree === null) {
    throw new Error('getNavTree() called before navigation tree was set');
  }
  return navTree;
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
export function resolveAsset(path: string): string | null {

  // Get asset manifest from context
  const manifest = templateContext.pipelineContext.dataComponents.get<AssetManifestComponent>("asset-manifest");
  if (!manifest) {
    const currentContent = templateContext.content;
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
    const currentContent = templateContext.content;
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