import type { ArchavistConfig } from '@/core/config';
import { logger } from '../utils/logger';
import { Pipeline } from "@/core";

export interface BuildOptions {
  config?: string;
  output?: string;
  verbose?: boolean;
}

/**
 * Execute the build command
 */
export async function buildCommand(
  config: ArchavistConfig,
  options: BuildOptions
): Promise<void> {

  if (options.verbose) {
    logger.info(`Vault path: ${config.vaultPath}`);
    logger.info(`Output path: ${config.outputPath}`);
    logger.info(`Base URL: ${config.baseUrl || '(none)'}`);
    logger.log('');
  }

  try {
    // Create the pipeline
    let pipeline: Pipeline = config.pipeline;

    // Execute the pipeline
    const context = await pipeline.execute({
      vaultPath: config.vaultPath,
      outputPath: config.outputPath || './build',
      baseUrl: config.baseUrl || '',
    });

    if (options.verbose) {
      logger.log('');
      logger.info(`Output: ${config.outputPath}`);
    }
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    process.exit(1);
  }
}
