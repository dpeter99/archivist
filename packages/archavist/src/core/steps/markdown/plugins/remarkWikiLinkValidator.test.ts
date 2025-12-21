import { describe, it } from 'node:test';
import assert from 'node:assert';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import wikiLinkPlugin from '@flowershow/remark-wiki-link';
import { VFile } from 'vfile';
import { remarkWikiLinkValidator } from './remarkWikiLinkValidator';
import type { PageIndexComponent } from '@/core/Content';

describe('remarkWikiLinkValidator', () => {
  // Helper to create a mock page index
  const createPageIndex = (): PageIndexComponent => ({
    id: 'test-index',
    type: 'page-index',
    entries: []
  });

  // Helper to process markdown with a simple stub resolver
  const processMarkdown = async (
    markdown: string,
    resolvedLinks: Record<string, string | null>, // Map of link names to URLs (null = not found)
    hasPageIndex = true
  ): Promise<VFile> => {
    const urlResolver = (target: any): string | null => {
      return resolvedLinks[target.filePath] ?? null;
    };

    const processor = unified()
      .use(remarkParse)
      .use(wikiLinkPlugin, { urlResolver })
      .use(remarkWikiLinkValidator, { pageIndex: hasPageIndex ? createPageIndex() : undefined })
      .use(remarkRehype)
      .use(rehypeStringify);

    return await processor.process(markdown);
  };

  describe('valid links (should NOT produce warnings)', () => {
    it('should not warn when urlResolver returns a URL', async () => {
      const markdown = '[[Home]] and [[About]]';
      const result = await processMarkdown(markdown, {
        'Home': '/home',
        'About': '/about'
      });

      assert.strictEqual(result.messages.length, 0, 'Should have no warnings');
    });
  });

  describe('invalid links (SHOULD produce warnings)', () => {
    it('should warn when urlResolver returns null', async () => {
      const markdown = '[[NonExistent]]';
      const result = await processMarkdown(markdown, {
        'NonExistent': null
      });

      assert.strictEqual(result.messages.length, 1, 'Should have one warning');
      assert.ok(
        result.messages[0].message.includes('Cannot resolve WikiLink'),
        'Warning should mention WikiLink'
      );
      assert.ok(
        result.messages[0].message.includes('[[NonExistent]]'),
        'Warning should include link text'
      );
      assert.strictEqual(result.messages[0].fatal, false, 'Should be a warning, not fatal');
    });

    it('should warn for multiple broken links', async () => {
      const markdown = '[[Missing1]] and [[Missing2]]';
      const result = await processMarkdown(markdown, {
        'Missing1': null,
        'Missing2': null
      });

      assert.strictEqual(result.messages.length, 2, 'Should have two warnings');
    });

    it('should provide correct position information in warnings', async () => {
      const markdown = 'Some text [[Missing]] more text';
      const result = await processMarkdown(markdown, {
        'Missing': null
      });

      assert.strictEqual(result.messages.length, 1);
      assert.ok(result.messages[0].place, 'Warning should have position info');
      const place = result.messages[0].place!;
      // place can be Point (with line directly) or Position (with start/end)
      const line = 'start' in place ? place.start.line : place.line;
      assert.strictEqual(line, 1);
    });
  });

  describe('edge cases', () => {
    it('should validate even when no page index provided', async () => {
      const markdown = '[[SomeLink]]';
      const result = await processMarkdown(markdown, { 'SomeLink': null }, false);

      assert.strictEqual(
        result.messages.length,
        1,
        'Should validate and warn even without page index (for image embeds)'
      );
    });

    it('should handle multiple links to the same missing page', async () => {
      const markdown = '[[Missing]] and [[Missing]] again';
      const result = await processMarkdown(markdown, {
        'Missing': null
      });

      assert.strictEqual(result.messages.length, 2, 'Should warn for each occurrence');
    });

    it('should handle mix of valid and invalid links', async () => {
      const markdown = '[[Valid]] and [[Invalid]]';
      const result = await processMarkdown(markdown, {
        'Valid': '/valid',
        'Invalid': null
      });

      assert.strictEqual(result.messages.length, 1, 'Should warn only for invalid link');
      assert.ok(
        result.messages[0].message.includes('[[Invalid]]'),
        'Should warn about the invalid link'
      );
    });
  });

  describe('integration with remark-wiki-link', () => {
    it('should correctly identify resolved vs unresolved links', async () => {
      const markdown = `
# Test Document

[[Existing]] - should resolve
[[Missing]] - should not resolve
      `;

      const result = await processMarkdown(markdown, {
        'Existing': '/existing',
        'Missing': null
      });

      assert.strictEqual(result.messages.length, 1, 'Should have exactly one warning');
      assert.ok(
        result.messages[0].message.includes('[[Missing]]'),
        'Should warn about Missing'
      );
    });

    it('should work with complex document structure', async () => {
      const markdown = `
# Main Content

See [[Guide]] and [[API]] for more info.

Don't go to [[Nowhere]].
      `;

      const result = await processMarkdown(markdown, {
        'Guide': '/guide',
        'API': '/api',
        'Nowhere': null
      });

      assert.strictEqual(result.messages.length, 1, 'Should have one warning');
      assert.ok(
        result.messages[0].message.includes('[[Nowhere]]'),
        'Should only warn about the broken link'
      );
    });
  });

  describe('embed validation', () => {
    it('should warn for missing image embeds', async () => {
      const markdown = '![[missing-image.png]]';

      const result = await processMarkdown(markdown, {
        'missing-image.png': null
      });

      assert.strictEqual(result.messages.length, 1, 'Should have one warning');
      assert.match(
        result.messages[0].message,
        /Cannot resolve image embed: !\[\[missing-image\.png\]\]/,
        'Should specifically identify as image embed'
      );
    });

    it('should not warn for resolved image embeds', async () => {
      const markdown = '![[logo.png]]';

      const result = await processMarkdown(markdown, {
        'logo.png': '/logo.png'
      });

      assert.strictEqual(result.messages.length, 0, 'Should have no warnings');
    });

    it('should handle mixed embeds and links', async () => {
      const markdown = `
See ![[logo.png]] and [[Document]]

Also ![[missing.png]] and [[MissingPage]]
      `;

      const result = await processMarkdown(markdown, {
        'logo.png': '/logo.png',
        'Document': '/document',
        'missing.png': null,
        'MissingPage': null
      });

      assert.strictEqual(result.messages.length, 2, 'Should have two warnings');

      const messages = result.messages.map(m => m.message);
      assert.ok(
        messages.some(m => m.includes('![[missing.png]]')),
        'Should warn about missing image embed'
      );
      assert.ok(
        messages.some(m => m.includes('[[MissingPage]]')),
        'Should warn about missing wikilink'
      );
    });
  });
});
