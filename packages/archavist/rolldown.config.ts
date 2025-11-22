import { defineConfig } from 'rolldown';
import { viteAliasPlugin } from 'rolldown/experimental'
import path from "node:path";
import {fileURLToPath} from "node:url";
import {dts} from "rolldown-plugin-dts";

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  input: {
    index: './src/index.ts',
    cli: './src/cli/main.ts',
    template: './src/core/template/index.ts',
  },
  external: [
    /^node:/,
    /node_modules/
  ],
  plugins: [
    viteAliasPlugin({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
      ]
    }),
    dts({
      resolve: true,
    })
  ],
  output: {
    cleanDir: true,
    dir: 'dist',
    sourcemap: true,
  },
});