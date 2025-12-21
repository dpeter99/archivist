import {AssetManifestComponent} from "@/core";

let assetManifest: AssetManifestComponent | null = null;

/**
 * Sets the asset manifest for the current render context.
 * Called internally by the render function before rendering each page.
 *
 * @internal
 */
export function setAssetManifest(manifest: AssetManifestComponent | undefined): void {
  assetManifest = manifest || null;
}

/**
 * Gets the asset manifest for the current render context.
 * Used internally by resolveAsset() to look up assets.
 *
 * @returns The asset manifest, or null if not available
 * @internal
 */
export function getAssetManifest(): AssetManifestComponent | null {
  return assetManifest;
}
