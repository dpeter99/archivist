import { glob } from 'glob';
import { stat } from 'node:fs/promises';
import { join, basename } from 'node:path';

import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core/pipeline/types';
import { AssetManifestComponent, type AssetMetadata } from '@/core/Content';

const DEFAULT_ASSET_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',  // Images
  'pdf',                                        // Documents
  'mp3', 'mp4', 'webm', 'ogg',                 // Media
  'zip', 'tar', 'gz'                           // Archives
];

export interface AssetStepOptions {
  vaultPath: string;
  extensions?: string[];
}

/**
 * Pipeline step that discovers and catalogs asset files from the vault
 *
 * This step scans the vault for asset files (images, documents, media) and builds
 * a metadata manifest that is stored in the pipeline context. The actual file copying
 * is deferred to OutputStep to avoid conflicts with its clean operation.
 */
export class AssetStep extends BasePipelineStep {
  private vaultPath: string;
  private extensions: string[];

  constructor(options: AssetStepOptions) {
    super('Asset Discovery');
    this.vaultPath = options.vaultPath;
    this.extensions = options.extensions ?? DEFAULT_ASSET_EXTENSIONS;
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    // Build glob pattern for all asset extensions
    const pattern = `**/*.{${this.extensions.join(',')}}`;

    // Scan vault for assets
    const assetPaths = await glob(pattern, {
      cwd: this.vaultPath,
      absolute: false,
      nodir: true,
    });

    console.log(`Found ${assetPaths.length} asset files`);

    // Build asset manifest
    const assetManifest = new Map<string, AssetMetadata>();

    for (const assetPath of assetPaths) {
      const absolutePath = join(this.vaultPath, assetPath);

      // Verify file exists and is accessible
      try {
        await stat(absolutePath);
      } catch (error) {
        console.warn(`Asset not accessible: ${assetPath}`);
        continue;
      }

      // Generate output URL (preserve path structure)
      // Normalize Windows paths to forward slashes
      const url = '/' + assetPath.replace(/\\/g, '/');

      // Generate output path
      const outPath = join(context.config.build.outputPath, assetPath);

      const metadata: AssetMetadata = {
        sourcePath: assetPath,
        absolutePath,
        url,
        outPath,
        basename: basename(assetPath),
      };

      assetManifest.set(assetPath, metadata);
    }

    // Create AssetManifestComponent and add to data components
    const assetComponent = new AssetManifestComponent(assetManifest);
    context.dataComponents.push(assetComponent);

    console.log(`Indexed ${assetManifest.size} assets for output`);

    return context;
  }
}
