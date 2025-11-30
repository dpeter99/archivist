import {Pipeline} from "@/core/pipeline";


export interface BuildConfig {
  clean?: boolean;
  
  buildDir: string;

  /** Output directory for generated site */
  outputPath?: string;
}

/**
 * Configuration schema for Archavist
 */
export interface ArchavistConfig {
    /** Base URL for the site */
    baseUrl?: string;

    projectDir: string;
    
    /** Build options */
    build?: BuildConfig;
    
    verbose?: boolean;
}

export interface UserConfig {
  /** Base URL for the site */
  baseUrl?: string;
  
  /** Build options */
  build?: BuildConfig;

  /**
   * Pipeline
   */
  pipeline: Pipeline;
}