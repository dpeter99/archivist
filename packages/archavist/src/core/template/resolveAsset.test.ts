import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { VFile } from 'vfile';
import { resolveAsset } from './index';
import { setCurrentContent } from './currentContent';
import { setAssetManifest } from './assetManifest';
import type { Content } from '../Content';
import { AssetManifestComponent, type AssetMetadata } from '../Content';

describe('resolveAsset', () => {
  // Helper to create test content
  const createContent = (): Content => ({
    sourcePath: 'test.md',
    markdown: '# Test',
    frontmatter: {},
    vfile: new VFile({ path: 'test.md' }),
    components: [],
  });

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

  beforeEach(() => {
    // Reset context before each test
    setCurrentContent(createContent());
    setAssetManifest(undefined);
  });

  describe('successful resolution', () => {
    it('resolves asset by exact path', () => {
      const manifest = createManifest({
        'characters/hero.png': {
          sourcePath: 'characters/hero.png',
          absolutePath: '/vault/characters/hero.png',
          url: '/characters/hero.png',
          outPath: '/build/characters/hero.png',
        },
      });
      setAssetManifest(manifest);

      const result = resolveAsset('characters/hero.png');
      assert.strictEqual(result, '/characters/hero.png');
    });

    it('resolves asset by basename', () => {
      const manifest = createManifest({
        'images/characters/hero.png': {
          sourcePath: 'images/characters/hero.png',
          absolutePath: '/vault/images/characters/hero.png',
          url: '/images/characters/hero.png',
          outPath: '/build/images/characters/hero.png',
        },
      });
      setAssetManifest(manifest);

      const result = resolveAsset('hero.png');
      assert.strictEqual(result, '/images/characters/hero.png');
    });

    it('does not emit warnings for found assets', () => {
      const content = createContent();
      setCurrentContent(content);

      const manifest = createManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png',
        },
      });
      setAssetManifest(manifest);

      resolveAsset('logo.png');
      assert.strictEqual(content.vfile.messages.length, 0);
    });
  });

  describe('error handling', () => {
    it('returns null for undefined input', () => {
      const manifest = createManifest({});
      setAssetManifest(manifest);

      const result = resolveAsset(undefined);
      assert.strictEqual(result, null);
    });

    it('returns null for null input', () => {
      const manifest = createManifest({});
      setAssetManifest(manifest);

      const result = resolveAsset(null);
      assert.strictEqual(result, null);
    });

    it('returns null for empty string', () => {
      const manifest = createManifest({});
      setAssetManifest(manifest);

      const result = resolveAsset('');
      assert.strictEqual(result, null);
    });

    it('returns null when asset not found', () => {
      const manifest = createManifest({});
      setAssetManifest(manifest);

      const result = resolveAsset('missing.png');
      assert.strictEqual(result, null);
    });

    it('emits warning when asset not found', () => {
      const content = createContent();
      setCurrentContent(content);

      const manifest = createManifest({});
      setAssetManifest(manifest);

      resolveAsset('missing.png');

      assert.strictEqual(content.vfile.messages.length, 1);
      assert.match(content.vfile.messages[0].message, /Cannot resolve asset/);
      assert.match(content.vfile.messages[0].message, /missing\.png/);
      assert.strictEqual(content.vfile.messages[0].source, 'archavist');
      assert.strictEqual(content.vfile.messages[0].ruleId, 'asset');
    });

    it('returns null when manifest not available', () => {
      setAssetManifest(undefined);

      const result = resolveAsset('logo.png');
      assert.strictEqual(result, null);
    });

    it('emits warning when manifest not available', () => {
      const content = createContent();
      setCurrentContent(content);
      setAssetManifest(undefined);

      resolveAsset('logo.png');

      assert.strictEqual(content.vfile.messages.length, 1);
      assert.match(content.vfile.messages[0].message, /Asset manifest not available/);
      assert.match(content.vfile.messages[0].message, /Add AssetStep/);
    });
  });

  describe('path normalization', () => {
    it('handles ./ prefix', () => {
      const manifest = createManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png',
        },
      });
      setAssetManifest(manifest);

      const result = resolveAsset('./logo.png');
      assert.strictEqual(result, '/logo.png');
    });

    it('handles ../ prefix', () => {
      const manifest = createManifest({
        'logo.png': {
          sourcePath: 'logo.png',
          absolutePath: '/vault/logo.png',
          url: '/logo.png',
          outPath: '/build/logo.png',
        },
      });
      setAssetManifest(manifest);

      const result = resolveAsset('../logo.png');
      assert.strictEqual(result, '/logo.png');
    });
  });
});
