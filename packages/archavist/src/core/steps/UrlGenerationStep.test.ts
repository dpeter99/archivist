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
        build:{
          buildDir: './.archavist',
          outputPath: '/test/output'
        },
        projectDir: './',
      },
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

  describe('directory slugification', () => {
    test('should slugify directory names with spaces', async () => {
      const step = new UrlGenerationStep();
      const context = createMockContext([
        {
          fileName: 'article',
          sourceDir: 'Blog Posts',
          sourcePath: 'Blog Posts/article.md'
        },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].slug, 'article');
      assert.strictEqual(result.content[0].url, '/blog-posts/article');
      assert.strictEqual(result.content[0].outPath, '/test/output/blog-posts/article.html');
    });

    test('should slugify multi-level directory paths', async () => {
      const step = new UrlGenerationStep();
      const context = createMockContext([
        {
          fileName: 'post',
          sourceDir: 'My Blog/2024 Posts',
          sourcePath: 'My Blog/2024 Posts/post.md'
        },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].slug, 'post');
      assert.strictEqual(result.content[0].url, '/my-blog/2024-posts/post');
      assert.strictEqual(result.content[0].outPath, '/test/output/my-blog/2024-posts/post.html');
    });

    test('should slugify directory with special characters', async () => {
      const step = new UrlGenerationStep();
      const context = createMockContext([
        {
          fileName: 'article',
          sourceDir: 'Work & Projects!/Client #1',
          sourcePath: 'Work & Projects!/Client #1/article.md'
        },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].slug, 'article');
      assert.strictEqual(result.content[0].url, '/work-projects/client-1/article');
    });

    test('should slugify filename and all directory segments', async () => {
      const step = new UrlGenerationStep();
      const context = createMockContext([
        {
          fileName: 'My Cool Article!',
          sourceDir: 'Blog Posts/Featured Items',
          sourcePath: 'Blog Posts/Featured Items/My Cool Article!.md'
        },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].slug, 'my-cool-article');
      assert.strictEqual(result.content[0].url, '/blog-posts/featured-items/my-cool-article');
    });
  });

  describe('folder index support', () => {
    test('should create folder index when file matches folder name', async () => {
      const step = new UrlGenerationStep({ folderIndex: true });
      const context = createMockContext([
        { fileName: 'posts', sourceDir: 'posts', sourcePath: 'posts/posts.md' },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].slug, 'posts');
      assert.strictEqual(result.content[0].url, '/posts/');
      assert.strictEqual(result.content[0].outPath, '/test/output/posts.html');
    });

    test('should not create folder index when disabled', async () => {
      const step = new UrlGenerationStep({ folderIndex: false });
      const context = createMockContext([
        { fileName: 'posts', sourceDir: 'posts', sourcePath: 'posts/posts.md' },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].url, '/posts/posts');
      assert.strictEqual(result.content[0].outPath, '/test/output/posts/posts.html');
    });

    test('should handle nested folder indexes', async () => {
      const step = new UrlGenerationStep({ folderIndex: true });
      const context = createMockContext([
        { fileName: 'intro', sourceDir: 'guides/intro', sourcePath: 'guides/intro/intro.md' },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].slug, 'intro');
      assert.strictEqual(result.content[0].url, '/guides/intro/');
      assert.strictEqual(result.content[0].outPath, '/test/output/guides/intro.html');
    });

    test('should handle normal files when folder index enabled', async () => {
      const step = new UrlGenerationStep({ folderIndex: true });
      const context = createMockContext([
        { fileName: 'article', sourceDir: 'posts', sourcePath: 'posts/article.md' },
      ]);

      const result = await step.execute(context);

      assert.strictEqual(result.content[0].slug, 'article');
      assert.strictEqual(result.content[0].url, '/posts/article');
      assert.strictEqual(result.content[0].outPath, '/test/output/posts/article.html');
    });
  });
});