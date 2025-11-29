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

      // Use the already-calculated URL from UrlGenerationStep
      if (!content.url) {
        throw new Error(`Content missing URL: ${content.sourcePath}. Ensure UrlGenerationStep runs before OutputStep.`);
      }

      const outputFilePath = content.outPath;

      await templater.render(content, context.navTree, outputFilePath);
    }

    console.log(`Wrote ${context.content.length} pages to ${outputPath}`);

    return context;
  }


  private async buildTemplate(context: PipelineContext): Promise<ContentTemplater> {

    const buildDir = context.buildDir;
    const packageDir = fileURLToPath(new URL('.', import.meta.url))
    
    const config: InlineConfig = {
      root: context.projectDir,
      configFile: false,
      build:{
        outDir: buildDir,
        sourcemap: true,
        minify: false,
      },
      plugins: [
        rsc({}),
        react(),
      ],
      resolve:{
        alias:[
          {find: 'archavist:template', replacement: `${packageDir}/entry.rsc.tsx`},
          {find: 'template', replacement: `./template/index.tsx`},
        ]
      },
      environments:{
        rsc: {
          build: {
            outDir: buildDir + '/rsc',
            rollupOptions: {
              input: {
                index: `./template/index.tsx`,
                rscRender: `${packageDir}/entry.rsc.tsx`
              },
            },
          },
        },
        ssr: {
          build: {
            outDir: buildDir + '/ssr',
            rollupOptions: {
              input: {
                index: `${packageDir}/entry.ssr.tsx`,
              },
            },
          },
        },
        client: {
          build: {
            outDir: buildDir + '/client',
            rollupOptions: {
              input: {
                index: `${packageDir}/entry.browser.tsx`,
              },
            },
          },
        },
      }
    }

    const builder = await createBuilder(config)
    await builder.buildApp()
    
    console.log('Finished vite build');
    
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
}

type RenderFn = (content: Content, navTree?: import('@/core/NavTree').NavTreeNode[]) => Promise<{html: ReadableStream<Uint8Array>, rsc: ReadableStream<Uint8Array>}>

class ContentTemplater {
  private renderer: RenderFn;
  private template: TemplateOptions;


  constructor(renderer: RenderFn, template: TemplateOptions) {
    this.renderer = renderer;
    this.template = template;
  }

  public async render(page: Content, navTree: import('@/core/NavTree').NavTreeNode[] | undefined, outputFilePath: string) {
    const res = await this.renderer(page, navTree)

    console.log(`Wrtiting file: ${outputFilePath}`)

    // Create directory if needed
    await mkdir(dirname(outputFilePath), { recursive: true });

    // Write the file
    await this.writeFileStream(outputFilePath, res.html)

    const rscFile = outputFilePath.replace(path.extname(outputFilePath), '.rsc');
    await this.writeFileStream(rscFile, res.rsc)
  }

  async writeFileStream(filePath: string, stream: ReadableStream) {
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, stream)
  }
}