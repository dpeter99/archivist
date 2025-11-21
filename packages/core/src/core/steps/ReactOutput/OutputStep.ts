import { mkdir, writeFile } from 'node:fs/promises';
import path, { dirname, join } from 'node:path';

import {createBuilder, InlineConfig} from "vite";
import rsc from "@vitejs/plugin-rsc";
import react from "@vitejs/plugin-react";

import {BasePipelineStep, Content} from '@/core';
import type { PipelineContext } from '@/core';
import {fileURLToPath} from "node:url";
import {ReactElement} from "react";
import {TemplateOptions} from "@/core/steps/ReactOutput/shared";
import * as fs from "node:fs";

/**
 * Pipeline step that writes the generated HTML to disk
 */
export class OutputStep extends BasePipelineStep {
  constructor() {
    super('Output');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const { outputPath } = context.config;

    const templater = await this.buildTemplate(context)
    
    
    // Create output directory if it doesn't exist
    await mkdir(outputPath, { recursive: true });

    // Write each page
    for (const content of context.content) {
      console.log(`Processing file: ${content.sourcePath}`)

      const url = content.sourcePath.replace(/\.[^/.]+$/, "")

      const outputFilePath = this.getOutputPath(url, outputPath);
      
      await templater.render(content, outputFilePath);
    }

    console.log(`Wrote ${context.content.length} pages to ${outputPath}`);

    return context;
  }


  private async buildTemplate(context: PipelineContext): Promise<ContentTemplater> {

    const buildDir = context.buildDir;
    const srcDir = fileURLToPath(new URL('.', import.meta.url))
    
    const config: InlineConfig = {
      root: srcDir,
      configFile: false,
      build:{
        outDir: buildDir,
        sourcemap: true,
      },
      plugins: [
        rsc({}),
        react(),
        // Inspect(),
      ],
      resolve:{
        alias:[
          {find: 'archavist:template', replacement: `${srcDir}/entry.rsc.tsx`} 
        ]
      },
      environments:{
        rsc: {
          build: {
            outDir: buildDir + '/rsc',
            rollupOptions: {
              input: {
                index: `/home/dpeter99/Documents/Projects/Archavist/Archavist_v2/examples/simple/template/index.tsx`,
                rscRender: `${srcDir}/entry.rsc.tsx`
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

    const { render } : typeof import('@/core/framework/entry.rsc') = await import((`${buildDir}/rsc/rscRender.js`))
    const {template} : {template: TemplateOptions} = await import(`${buildDir}/rsc/index.js`)
    
    
    fs.cpSync(`${buildDir}/client`, context.config.outputPath, { recursive: true})
    
    return new ContentTemplater(render, template);
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

type RenderFn = (component: ReactElement) => Promise<{html: ReadableStream<Uint8Array>, rsc: ReadableStream<Uint8Array>}>

class ContentTemplater {
  private renderer: RenderFn;
  private template: TemplateOptions;
  
  
  constructor(renderer: RenderFn, template: TemplateOptions) {
    this.renderer = renderer;
    this.template = template;
  }
  
  public async render(page: Content, outputFilePath: string) {
    const res = await this.renderer(this.template.rootComponent)

    console.log(`Wrtiting file: ${outputFilePath}`)

    // Create directory if needed
    await mkdir(dirname(outputFilePath), { recursive: true });

    // Write the file
    await this.writeFileStream(outputFilePath, res.html)
  }

  async writeFileStream(filePath: string, stream: ReadableStream) {
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, stream)
  }
}