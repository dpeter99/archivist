/**
 * Core types for the static site generator pipeline
 */

import {Content} from "../Content";

/**
 * Configuration for the static site generator
 */
export interface SiteConfig {
  /** Path to the Obsidian vault */
  vaultPath: string;
  /** Path where the generated site will be output */
  outputPath: string;
  /** Base URL for the site (e.g., "/docs" or "https://example.com") */
  baseUrl?: string;
  /** Custom configuration options */
  [key: string]: unknown;
}

/**
 * Context object that flows through the pipeline
 */
export interface PipelineContext {
  /** Site configuration */
  config: SiteConfig;

  buildDir: string;

  content: Content[];
}