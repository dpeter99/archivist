import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import {createBuilder, InlineConfig} from "vite";
import rsc from "@vitejs/plugin-rsc";
import react from "@vitejs/plugin-react";

import { BasePipelineStep } from '@/core';
import type { PipelineContext } from '@/core';
import {fileURLToPath} from "node:url";

/**
 * Pipeline step that writes the generated HTML to disk
 */
export class OutputStep extends BasePipelineStep {
  constructor() {
    super('Output');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const { outputPath } = context.config;

    await this.buildTemplate(context)
    
    // Create output directory if it doesn't exist
    await mkdir(outputPath, { recursive: true });

    // Write each page
    for (const content of context.content) {
      console.log(`Processing file: ${content.sourcePath}`)

      const url = content.sourcePath.replace(/\.[^/.]+$/, "")

      const outputFilePath = this.getOutputPath(url, outputPath);
      
      console.log(`Wrtiting file: ${outputFilePath}`)

      // Create directory if needed
      await mkdir(dirname(outputFilePath), { recursive: true });

      // Write the file
      await writeFile(outputFilePath, "asdasd", 'utf-8');
    }

    console.log(`Wrote ${context.content.length} pages to ${outputPath}`);

    return context;
  }


  private async buildTemplate(context: PipelineContext): Promise<void> {

    const buildDir = context.buildDir;
    const srcDir = fileURLToPath(new URL('.', import.meta.url))

    console.log(`meta url : ${srcDir}`);
    
    const config: InlineConfig = {
      root: srcDir,
      configFile: false,
      build:{
        outDir: buildDir,
      },
      plugins: [
        rsc({}),
        react(),
        // Inspect(),
      ],
      environments:{
        rsc: {
          build: {
            outDir: buildDir + '/rsc',
            rollupOptions: {
              input: {
                index: `${srcDir}/entry.rsc.tsx`,
              },
            },
          },
        },
        ssr: {
          build: {
            outDir: buildDir + '/ssr',
            rollupOptions: {
              input: {
                index: `${srcDir}/entry.ssr.tsx`,
              },
            },
          },
        },
        client: {
          build: {
            outDir: buildDir + '/client',
            rollupOptions: {
              input: {
                index: `${srcDir}/entry.browser.tsx`,
              },
            },
          },
        },
      }
    }

    const builder = await createBuilder(config)
    await builder.buildApp()

  }

  /**
   * Convert a ReadableStream to a string
   */
  private async streamToString(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }

    // Flush any remaining bytes
    result += decoder.decode();

    return result;
  }

  /**
   * Get the output file path for a URL
   */
  private getOutputPath(url: string, outputPath: string): string {
    // Remove leading slash
    let path = url.replace(/^\//, '');

    // If URL ends with /, make it index.html
    if (path === '' || path.endsWith('/')) {
      path += 'index.html';
    } else {
      // Add .html extension
      path += '.html';
    }

    return join(outputPath, path);
  }
}