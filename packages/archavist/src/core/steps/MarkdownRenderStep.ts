import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { BasePipelineStep } from '@/core/pipeline/PipelineStep';
import type { PipelineContext } from '@/core';

/**
 * Pipeline step that renders markdown to HTML using remark/rehype
 */
export class MarkdownRenderStep extends BasePipelineStep {
  private processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify);

  constructor() {
    super('Markdown Rendering');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    for (const content of context.content) {
      const result = await this.processor.process(content.markdown);
      content.html = String(result);
    }

    console.log(`Rendered ${context.content.length} markdown files to HTML`);

    return context;
  }
}