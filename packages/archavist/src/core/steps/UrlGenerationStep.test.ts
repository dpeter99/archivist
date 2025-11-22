import { test, describe } from 'node:test';
import assert from 'node:assert';
import { UrlGenerationStep } from './UrlGenerationStep';
import type { PipelineContext } from '@/core/pipeline/types';
import type { Content } from '@/core/Content';

describe('UrlGenerationStep', () => {
  // Helper function to create a mock context
  function createMockContext(content: Partial<Content>[]): PipelineContext {
    return {
      config: {
        vaultPath: '/test/vault',
        outputPath: '/test/output',
      },
      buildDir: '/test/build',
      projectDir: '/test/project',
      content: content.map(c => ({
        sourcePath: c.sourcePath || 'test.md',
        markdown: c.markdown || '',
        frontmatter: c.frontmatter || {},
        fileName: c.fileName,
        sourceDir: c.sourceDir,
        ...c,
      })) as Content[],
    };
  }

  describe('slug generation', () => {
    test('should generate slugs from various filename formats', async (t) => {
      const testCases = [
        { fileName: 'my-post', expected: 'my-post', description: 'simple filename' },
        { fileName: 'my blog post', expected: 'my-blog-post', description: 'spaces to hyphens' },
        { fileName: 'my_blog_post', expected: 'my-blog-post', description: 'underscores to hyphens' },
        { fileName: 'My-Blog-Post', expected: 'my-blog-post', description: 'lowercase' },
        { fileName: 'my@blog#post!', expected: 'myblogpost', description: 'remove special characters' },
        { fileName: 'my---blog---post', expected: 'my-blog-post', description: 'multiple consecutive hyphens' },
        { fileName: '-my-blog-post-', expected: 'my-blog-post', description: 'trim leading/trailing hyphens' },
        { fileName: 'My Cool Post! (2024)', expected: 'my-cool-post-2024', description: 'mixed special characters' },
        { fileName: 'café-résumé', expected: 'cafe-resume', description: 'accented characters transliterated' },
        { fileName: 'Zürich', expected: 'zurich', description: 'umlaut transliteration' },
        { fileName: 'naïve', expected: 'naive', description: 'diaeresis transliteration' },
        { fileName: 'São Paulo', expected: 'sao-paulo', description: 'tilde and space' },
      ];

      for (const { fileName, expected, description } of testCases) {
        await t.test(description, async () => {
          const step = new UrlGenerationStep();
          const context = createMockContext([{ fileName, sourcePath: `${fileName}.md` }]);
          const result = await step.execute(context);
          assert.strictEqual(result.content[0].slug, expected);
        });
      }
    });
  });

  describe('URL generation', () => {
    test('should generate URLs from file structure', async () => {
      const step = new UrlGenerationStep();
      const context = createMockContext([
        { fileName: 'post', sourceDir: '.', sourcePath: 'post.md' },
        { fileName: 'article', sourceDir: 'blog/2024', sourcePath: 'blog/2024/article.md' },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].url, '/post');
      assert.strictEqual(result.content[1].url, '/blog/2024/article');
    });

    test('should ensure URLs start with slash and have no trailing slash', async () => {
      const step = new UrlGenerationStep();
      const context = createMockContext([
        { fileName: 'post', sourceDir: 'blog', sourcePath: 'blog/post.md' },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].url?.startsWith('/'), true);
      assert.strictEqual(result.content[0].url?.endsWith('/'), false);
    });
  });

  describe('output path generation', () => {
    test('should generate output paths with .html extension', async (t) => {
      const testCases = [
        { fileName: 'post', sourceDir: '.', expected: '/test/output/post.html', description: 'root directory' },
        { fileName: 'post', sourceDir: 'blog', expected: '/test/output/blog/post.html', description: 'nested directory' },
      ];

      for (const { fileName, sourceDir, expected, description } of testCases) {
        await t.test(description, async () => {
          const step = new UrlGenerationStep();
          const context = createMockContext([{ fileName, sourceDir, sourcePath: `${sourceDir}/${fileName}.md` }]);
          const result = await step.execute(context);
          assert.strictEqual(result.content[0].outPath, expected);
        });
      }
    });
  });

  describe('batch processing', () => {
    test('should process multiple files', async () => {
      const step = new UrlGenerationStep();
      const context = createMockContext([
        { fileName: 'post1', sourceDir: '.', sourcePath: 'post1.md' },
        { fileName: 'post2', sourceDir: 'blog', sourcePath: 'blog/post2.md' },
        { fileName: 'post3', sourceDir: 'docs', sourcePath: 'docs/post3.md' },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content.length, 3);
      assert.strictEqual(result.content[0].url, '/post1');
      assert.strictEqual(result.content[1].url, '/blog/post2');
      assert.strictEqual(result.content[2].url, '/docs/post3');
    });

    test('should handle empty content array', async () => {
      const step = new UrlGenerationStep();
      const context = createMockContext([]);

      const result = await step.execute(context);

      assert.strictEqual(result.content.length, 0);
    });
  });

  describe('edge cases', () => {
    test('should handle special filename patterns', async (t) => {
      const testCases = [
        { fileName: 'index', expectedSlug: 'index', expectedUrl: '/index', description: 'index file' },
        { fileName: '2024', expectedSlug: '2024', expectedUrl: '/2024', description: 'numeric filename' },
        { fileName: '01-first-post', expectedSlug: '01-first-post', expectedUrl: '/01-first-post', description: 'numbers and text' },
      ];

      for (const { fileName, expectedSlug, expectedUrl, description } of testCases) {
        await t.test(description, async () => {
          const step = new UrlGenerationStep();
          const context = createMockContext([{ fileName, sourceDir: '.', sourcePath: `${fileName}.md` }]);
          const result = await step.execute(context);
          assert.strictEqual(result.content[0].slug, expectedSlug);
          assert.strictEqual(result.content[0].url, expectedUrl);
        });
      }
    });
  });
});