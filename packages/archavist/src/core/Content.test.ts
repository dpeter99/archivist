import { describe, it } from 'node:test';
import assert from 'node:assert';
import {AssetManifestComponent, AssetMetadata} from "@/core/steps";

describe('AssetManifestComponent', () => {
  describe('findAssetByPath', () => {
    // Helper to create test manifest
    const createManifest = (
      assets: Record<string, Omit<AssetMetadata, 'basename'>>
    ): AssetManifestComponent => {
      const assetsMap = new Map<string, AssetMetadata>();
      for (const [key, value] of Object.entries(assets)) {
        assetsMap.set(key, {
          ...value,
          basename: key.split('/').pop()!,
        });
      }
      return new AssetManifestComponent(assetsMap);
    };

    it('finds asset by exact path match', () => {
      const manifest = createManifest({
        'images/logo.png': {
          sourcePath: 'images/logo.png',
          absolutePath: '/vault/images/logo.png',
          url: '/images/logo.png',
          outPath: '/build/images/logo.png',
        },
      });

      const result = manifest.findAssetByPath('images/logo.png');
      assert.ok(result);
      assert.strictEqual(result.url, '/images/logo.png');
    });

    it('finds asset by basename match', () => {
      const manifest = createManifest({
        'assets/images/logo.png': {
          sourcePath: 'assets/images/logo.png',
          absolutePath: '/vault/assets/images/logo.png',
          url: '/assets/images/logo.png',
          outPath: '/build/assets/images/logo.png',
        },
      });

      const result = manifest.findAssetByPath('logo.png');
      assert.ok(result);
      assert.strictEqual(result.url, '/assets/images/logo.png');
    });

    it('normalizes leading ./ before lookup', () => {
      const manifest = createManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png',
        },
      });

      const result = manifest.findAssetByPath('./logo.png');
      assert.ok(result);
      assert.strictEqual(result.url, '/logo.png');
    });

    it('normalizes leading ../ before lookup', () => {
      const manifest = createManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png',
        },
      });

      const result = manifest.findAssetByPath('../logo.png');
      assert.ok(result);
      assert.strictEqual(result.url, '/logo.png');
    });

    it('returns undefined for missing assets', () => {
      const manifest = createManifest({});
      const result = manifest.findAssetByPath('missing.png');
      assert.strictEqual(result, undefined);
    });

    it('returns first match for duplicate basenames', () => {
      const manifest = createManifest({
        'folder1/logo.png': {
          sourcePath: 'folder1/logo.png',
          absolutePath: '/vault/folder1/logo.png',
          url: '/folder1/logo.png',
          outPath: '/build/folder1/logo.png',
        },
        'folder2/logo.png': {
          sourcePath: 'folder2/logo.png',
          absolutePath: '/vault/folder2/logo.png',
          url: '/folder2/logo.png',
          outPath: '/build/folder2/logo.png',
        },
      });

      const result = manifest.findAssetByPath('logo.png');
      assert.ok(result);
      // Should match one of them (implementation returns first)
      assert.ok(result.url === '/folder1/logo.png' || result.url === '/folder2/logo.png');
    });

    it('handles paths with multiple ../ segments', () => {
      const manifest = createManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png',
        },
      });

      const result = manifest.findAssetByPath('../../logo.png');
      assert.ok(result);
      assert.strictEqual(result.url, '/logo.png');
    });

    it('prefers exact match over basename match', () => {
      const manifest = createManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png',
        },
        'images/logo.png': {
          sourcePath: 'images/logo.png',
          absolutePath: '/vault/images/logo.png',
          url: '/images/logo.png',
          outPath: '/build/images/logo.png',
        },
      });

      const result = manifest.findAssetByPath('logo.png');
      assert.ok(result);
      // Should prefer exact match
      assert.strictEqual(result.url, '/logo.png');
    });
  });
});
