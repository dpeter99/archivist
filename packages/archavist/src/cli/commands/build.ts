import type {ArchavistConfig, UserConfig} from '@/core/config';
import { logger } from '../utils/logger';
import { Pipeline } from "@/core";
import {Archavist} from "@/core/Archavist";

export interface BuildOptions {
  config?: string;
  output?: string;
  verbose?: boolean;
}

/**
 * Execute the build command
 */
export async function buildCommand(
  config: UserConfig,
  options: BuildOptions
): Promise<void> {



  try {
    
    const archavist = new Archavist(config);
    const context = await archavist.build();
    
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    process.exit(1);
  }
}
