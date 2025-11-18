import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pathToFileURL } from 'node:url'

import {createBuilder, type InlineConfig} from 'vite'
import rsc from "@vitejs/plugin-rsc";
import react from "@vitejs/plugin-react";
import Inspect from "vite-plugin-inspect";
import { fileURLToPath } from "node:url";

export const pages = [
  { url: '/', title: 'Home' },
]

pages.push({ url: '/about', title: 'About' })

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const buildDir = './.archavist/build';
const baseDir = './dist';

const config: InlineConfig = {
  root: __dirname,
  configFile: false,
  build:{
    outDir: buildDir,
  },
  plugins: [
    rsc({}),
    react(),
    Inspect(),
  ],
  environments:{
    rsc: {
      build: {
        outDir: buildDir + '/rsc',
        rollupOptions: {
          input: {
            index: './src/framework/entry.rsc.tsx',
          },
        },
      },
    },
    ssr: {
      build: {
        outDir: buildDir + '/ssr',
        rollupOptions: {
          input: {
            index: './src/framework/entry.ssr.tsx',
          },
        },
      },
    },
    client: {
      build: {
        outDir: buildDir + '/client',
        rollupOptions: {
          input: {
            index: './src/framework/entry.browser.tsx',
          },
        },
      },
    },
  }
}

const builder = await createBuilder(config)
//builder.build(new BuildEnvironment('client', builder))
await builder.buildApp()

const rscEntry: typeof import('./src/framework/entry.rsc') = await import((`${buildDir}/rsc/index.js`))
const res = await rscEntry.handleSsg(new Request(new URL('https://test.com')))



await writeFileStream(
  path.join(baseDir, './test.html'),
  res.html,
)

async function writeFileStream(filePath: string, stream: ReadableStream) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
  await fs.promises.writeFile(filePath, Readable.fromWeb(stream as any))
}
