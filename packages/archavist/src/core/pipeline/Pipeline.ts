import type {ArchavistConfig, PipelineContext} from '@/core';
import type { PipelineStep } from '@/core';

/**
 * Main pipeline orchestrator
 */
export class Pipeline {
  private readonly steps: PipelineStep[] = [];

  /**
   * Add a step to the pipeline
   */
  addStep(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Add multiple steps to the pipeline
   */
  addSteps(...steps: PipelineStep[]): this {
    this.steps.push(...steps);
    return this;
  }

  /**
   * Execute the pipeline
   * @param config Site configuration
   * @returns The final pipeline context after all steps
   */
  async execute(config: ArchavistConfig): Promise<PipelineContext> {
    // Initialize the pipeline context
    let context: PipelineContext = {
      config,
      content: [],
      dataComponents: []
    };

    // Execute each step in sequence
    for (const step of this.steps) {
      console.log(`Executing pipeline step: ${step.name}`);
      context = await step.execute(context);
    }

    return context;
  }

  /**
   * Get the list of steps in the pipeline
   */
  getSteps(): ReadonlyArray<PipelineStep> {
    return this.steps;
  }
}