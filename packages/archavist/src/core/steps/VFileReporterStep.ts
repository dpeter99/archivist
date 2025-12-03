import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core';
import { reporter } from 'vfile-reporter';
import type { VFile } from 'vfile';

/**
 * Reports all VFile diagnostic messages collected during the pipeline.
 *
 * This step should be added after MarkdownRenderStep to display
 * warnings and errors in a professional, linter-style format with
 * precise line/column positions.
 */
export class VFileReporterStep extends BasePipelineStep {
  constructor() {
    super('Diagnostic Reporter');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    // Collect all VFiles with messages
    const filesWithMessages: VFile[] = [];

    for (const content of context.content) {
      if (content.vfile && content.vfile.messages.length > 0) {
        filesWithMessages.push(content.vfile);
      }
    }

    // Report if there are any messages
    if (filesWithMessages.length > 0) {
      console.log('\n' + reporter(filesWithMessages));
    }

    return context;
  }
}
