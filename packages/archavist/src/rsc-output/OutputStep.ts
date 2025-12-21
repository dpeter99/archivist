import { mkdir, writeFile, rm, copyFile } from 'node:fs/promises';
import path, { dirname, join } from 'node:path';

import {createBuilder, InlineConfig} from "vite";
import rsc from "@vitejs/plugin-rsc";
import react from "@vitejs/plugin-react";

import {AssetManifestComponent, BasePipelineStep, Content} from '@/core';
import type { PipelineContext } from '@/core';
import {fileURLToPath} from "node:url";
import {ReactElement} from "react";
import {TemplateOptions} from "@/rsc-output/shared";
import * as fs from "node:fs";
import { getDataComponent } from '@/core/pipeline/utils';

/**
 * Pipeline step that writes the generated HTML to disk
 */
export class OutputStep extends BasePipelineStep {
  constructor() {
    super('Output');
  }

  async execute(context: PipelineContext): Promise<PipelineContext> {
    const { build } = context.config;

    // Clean output directory if configured
    if (build?.clean) {
      try {
        await rm(build.outputPath, { recursive: true, force: true });
        console.log(`Cleaned output directory: ${build.outputPath}`);
      } catch (error) {
        // Ignore ENOENT (directory doesn't exist on first build)
        if (error instanceof Error && !error.message.includes('ENOENT')) {
          throw error;
        }
      }
    }

    const templater = await this.buildTemplate(context)

    // Create output directory if it doesn't exist
    await mkdir(build.outputPath, { recursive: true });

    // Copy assets from manifest (if any)
    const assetManifest = getDataComponent<AssetManifestComponent>(context, 'asset-manifest');
    if (assetManifest?.assets && assetManifest.assets.size > 0) {
      console.log(`Copying ${assetManifest.assets.size} assets...`);
      let copiedCount = 0;

      for (const asset of assetManifest.assets.values()) {
        try {
          // Ensure directory exists
          await mkdir(dirname(asset.outPath), { recursive: true });

          // Copy file
          await copyFile(asset.absolutePath, asset.outPath);
          copiedCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`Failed to copy asset ${asset.sourcePath}: ${errorMessage}`);
        }
      }

      console.log(`Copied ${copiedCount} assets to ${build.outputPath}`);
    }

    // Write each page
    for (const content of context.content) {
      if (context.config.verbose)
        console.log(`Processing file: ${content.sourcePath}`)

      // Use the already-calculated URL from UrlGenerationStep
      if (!content.url) {
        throw new Error(`Content missing URL: ${content.sourcePath}. Ensure UrlGenerationStep runs before OutputStep.`);
      }

      const outputFilePath = content.outPath;

      await templater.render(content, context.navTree, context, outputFilePath);
    }

    if (context.config.verbose)
      console.log(`Wrote ${context.content.length} pages to ${build.outputPath}`);

    return context;
  }


  private async buildTemplate(context: PipelineContext): Promise<ContentTemplater> {

    const buildDir = context.config.build.buildDir;
    const packageDir = fileURLToPath(new URL('.', import.meta.url))
    
    const config: InlineConfig = {
      root: context.config.projectDir,
      configFile: false,
      logLevel: 'error',
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
                index: `${packageDir}/browser/entry.browser.tsx`,
              },
            },
          },
        },
      }
    }

    const builder = await createBuilder(config)
    await builder.buildApp()
    
    console.log('Finished vite build');
    
    const { render } : typeof import('@/rsc-output/framework/entry.rsc') = await import((`${buildDir}/rsc/rscRender.js`))
    const {template} : {template: TemplateOptions} = await import(`${buildDir}/rsc/index.js`)
    
    
    fs.cpSync(`${buildDir}/client`, context.config.build.outputPath, { recursive: true})
    
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

type RenderFn = (
  content: Content,
  navTree: import('@/core/NavTree').NavTreeNode[] | undefined,
  context: PipelineContext
) => Promise<{html: ReadableStream<Uint8Array>, rsc: ReadableStream<Uint8Array>}>

class ContentTemplater {
  private renderer: RenderFn;
  private template: TemplateOptions;


  constructor(renderer: RenderFn, template: TemplateOptions) {
    this.renderer = renderer;
    this.template = template;
  }

  public async render(
    page: Content,
    navTree: import('@/core/NavTree').NavTreeNode[] | undefined,
    context: PipelineContext,
    outputFilePath: string
  ) {
    const res = await this.renderer(page, navTree, context)

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