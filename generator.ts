import {build, type InlineConfig} from 'vite'
import rsc from "@vitejs/plugin-rsc";
import react from "@vitejs/plugin-react";
import Inspect from "vite-plugin-inspect";
import { fileURLToPath } from "node:url";

export const pages = [
  { url: '/', title: 'Home' },
]

pages.push({ url: '/about', title: 'About' })

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const config: InlineConfig = {
  root: __dirname,
  configFile: false,
  plugins: [
    rsc({}),
    react(),
    Inspect(),
  ],
  environments:{
    rsc: {
      build: {
        rollupOptions: {
          input: {
            index: './src/framework/entry.rsc.tsx',
          },
        },
      },
    },
    ssr: {
      build: {
        rollupOptions: {
          input: {
            index: './src/framework/entry.ssr.tsx',
          },
        },
      },
    },
    client: {
      build: {
        rollupOptions: {
          input: {
            index: './src/framework/entry.browser.tsx',
          },
        },
      },
    },
  }
}

await build(config)

