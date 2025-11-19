import {Pipeline} from "@/core/pipeline";

/**
 * Configuration schema for Archavist
 */
export interface ArchavistConfig {
    /** Path to the Obsidian vault (required) */
    vaultPath: string;

    /** Output directory for generated site */
    outputPath?: string;

    /** Base URL for the site */
    baseUrl?: string;

    /** Site metadata */
    site?: {
        title?: string;
        description?: string;
        lang?: string;
    };

    /** Development server options */
    dev?: {
        port?: number;
        host?: string;
        open?: boolean;
    };

    /** Watch configuration */
    watch?: {
        ignored?: string[];
        debounce?: number;
    };

    /** Build options */
    build?: {
        clean?: boolean;
    };

    /**
     * Pipeline
     */
    pipeline: Pipeline;
}