import type { PipelineContext } from './types.ts';

/**
 * Base interface for a pipeline step
 */
export interface PipelineStep {
  /** Name of the pipeline step (for logging/debugging) */
  readonly name: string;

  /**
   * Execute this pipeline step
   * @param context The current pipeline context
   * @returns The modified pipeline context
   */
  execute(context: PipelineContext): Promise<PipelineContext>;
}

/**
 * Abstract base class for pipeline steps
 */
export abstract class BasePipelineStep implements PipelineStep {
  constructor(public readonly name: string) {}

  abstract execute(context: PipelineContext): Promise<PipelineContext>;
}