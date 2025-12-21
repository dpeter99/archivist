import { describe, it } from 'node:test';
import assert from 'node:assert';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { VFile } from 'vfile';
import { rehypeImageResolver } from './rehypeImageResolver';
import {AssetManifestComponent, AssetMetadata} from "@/core";

describe('rehypeImageResolver', () => {
  // Helper to create mock asset manifest
  const createAssetManifest = (
    assets: Record<string, Omit<AssetMetadata, 'basename'>>
  ): AssetManifestComponent => {
    const assetsMap = new Map<string, AssetMetadata>();
    for (const [key, value] of Object.entries(assets)) {
      assetsMap.set(key, {
        ...value,
        basename: key.split('/').pop()!  // Calculate basename from sourcePath
      });
    }
    return {
      id: 'asset-manifest',
      type: 'asset-manifest',
      assets: assetsMap
    };
  };

  // Helper to process markdown
  const processMarkdown = async (
    markdown: string,
    assetManifest?: AssetManifestComponent,
    vaultPath: string = '/vault',
    filePath: string = 'test.md'
  ): Promise<VFile> => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeImageResolver, { assetManifest, vaultPath })
      .use(rehypeStringify);

    const file = new VFile({ value: markdown, path: filePath });
    return await processor.process(file);
  };

  describe('URL transformation', () => {
    it('transforms resolved paths to asset URLs', async () => {
      const manifest = createAssetManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png'
        }
      });

      const result = await processMarkdown('![Logo](./logo.png)', manifest);
      const html = String(result);

      assert.match(html, /src="\/logo\.png"/);
    });

    it('transforms nested image paths', async () => {
      const manifest = createAssetManifest({
        'images/map.png': {
          sourcePath: 'images/map.png',
          absolutePath: '/vault/images/map.png',
          url: '/images/map.png',
          outPath: '/build/images/map.png'
        }
      });

      const result = await processMarkdown('![Map](./images/map.png)', manifest);
      const html = String(result);

      assert.match(html, /src="\/images\/map\.png"/);
    });
  });

  describe('path resolution', () => {
    it('resolves relative paths with ./', async () => {
      const manifest = createAssetManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png'
        }
      });

      const result = await processMarkdown('![Logo](./logo.png)', manifest);
      const html = String(result);

      assert.match(html, /src="\/logo\.png"/);
    });

    it('resolves vault-relative paths with /', async () => {
      const manifest = createAssetManifest({
        'images/logo.png': {
          sourcePath: 'images/logo.png',
          absolutePath: '/vault/images/logo.png',
          url: '/images/logo.png',
          outPath: '/build/images/logo.png'
        }
      });

      const result = await processMarkdown('![Logo](/images/logo.png)', manifest);
      const html = String(result);

      assert.match(html, /src="\/images\/logo\.png"/);
    });

    it('resolves plain filenames', async () => {
      const manifest = createAssetManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png'
        }
      });

      const result = await processMarkdown('![Logo](logo.png)', manifest);
      const html = String(result);

      assert.match(html, /src="\/logo\.png"/);
    });
  });

  describe('missing images', () => {
    it('adds warning for missing images', async () => {
      const manifest = createAssetManifest({});

      const result = await processMarkdown('![Missing](./missing.png)', manifest);

      assert.strictEqual(result.messages.length, 1);
      assert.match(result.messages[0].message, /Cannot resolve image/);
      assert.match(result.messages[0].message, /missing\.png/);
    });

    it('keeps original src when image not found', async () => {
      const manifest = createAssetManifest({});

      const result = await processMarkdown('![Missing](./missing.png)', manifest);
      const html = String(result);

      assert.match(html, /src="\.\/missing\.png"/);
    });
  });

  describe('external URLs', () => {
    it('skips http:// URLs', async () => {
      const manifest = createAssetManifest({});

      const result = await processMarkdown('![Remote](http://example.com/image.png)', manifest);
      const html = String(result);

      assert.match(html, /src="http:\/\/example\.com\/image\.png"/);
      assert.strictEqual(result.messages.length, 0);
    });

    it('skips https:// URLs', async () => {
      const manifest = createAssetManifest({});

      const result = await processMarkdown('![Remote](https://example.com/image.png)', manifest);
      const html = String(result);

      assert.match(html, /src="https:\/\/example\.com\/image\.png"/);
      assert.strictEqual(result.messages.length, 0);
    });

    it('skips protocol-relative URLs', async () => {
      const manifest = createAssetManifest({});

      const result = await processMarkdown('![Remote](//example.com/image.png)', manifest);
      const html = String(result);

      assert.match(html, /src="\/\/example\.com\/image\.png"/);
      assert.strictEqual(result.messages.length, 0);
    });

    it('skips data: URLs', async () => {
      const manifest = createAssetManifest({});

      const result = await processMarkdown('![Data](data:image/png;base64,ABC)', manifest);
      const html = String(result);

      assert.match(html, /src="data:image\/png;base64,ABC"/);
      assert.strictEqual(result.messages.length, 0);
    });
  });

  describe('edge cases', () => {
    it('handles images without src attribute', async () => {
      const manifest = createAssetManifest({});

      const result = await processMarkdown('<img alt="test">', manifest);

      // Should not crash, no warnings
      assert.strictEqual(result.messages.length, 0);
    });

    it('handles missing asset manifest gracefully', async () => {
      const result = await processMarkdown('![Logo](./logo.png)', undefined);
      const html = String(result);

      // Should keep original src, no transformation
      assert.match(html, /src="\.\/logo\.png"/);
      assert.strictEqual(result.messages.length, 0);
    });

    it('handles empty src attribute', async () => {
      const manifest = createAssetManifest({});

      const result = await processMarkdown('![]()', manifest);

      // Should not crash
      assert.strictEqual(result.messages.length, 0);
    });
  });
});
