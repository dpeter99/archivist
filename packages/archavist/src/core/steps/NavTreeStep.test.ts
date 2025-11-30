import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NavTreeStep } from './NavTreeStep';
import type { PipelineContext } from '@/core';
import type { Content } from '@/core/Content';

describe('NavTreeStep', () => {
  const createContent = (overrides: Partial<Content>): Content => ({
    sourcePath: 'test.md',
    markdown: '',
    frontmatter: {},
    components: [],
    ...overrides
  });

  const createContext = (content: Content[]): PipelineContext => ({
    config: {} as any,
    content,
    dataComponents: []
  });

  describe('title extraction priority', () => {
    const testCases = [
      {
        name: 'uses nav_title when available',
        frontmatter: { nav_title: 'Nav Title', title: 'Title' },
        fileName: 'file-name',
        expected: 'Nav Title'
      },
      {
        name: 'falls back to title when nav_title missing',
        frontmatter: { title: 'Title' },
        fileName: 'file-name',
        expected: 'Title'
      },
      {
        name: 'falls back to fileName when both missing',
        frontmatter: {},
        fileName: 'file-name',
        expected: 'file-name'
      },
      {
        name: 'uses Untitled when all missing',
        frontmatter: {},
        fileName: undefined,
        expected: 'Untitled'
      }
    ];

    for (const tc of testCases) {
      it(tc.name, async () => {
        const step = new NavTreeStep();
        const context = createContext([
          createContent({
            url: '/test',
            frontmatter: tc.frontmatter,
            fileName: tc.fileName
          })
        ]);

        await step.execute(context);

        assert.strictEqual(context.navTree!.length, 1);
        assert.strictEqual(context.navTree![0].title, tc.expected);
      });
    }
  });

  describe('directory casing preservation', () => {
    const testCases = [
      {
        name: 'preserves single directory casing',
        url: '/characters/npc',
        sourceDir: 'Characters',
        expectedDirTitle: 'Characters'
      },
      {
        name: 'preserves nested directory casing',
        url: '/session-notes/year-2025/session-1',
        sourceDir: 'Session Notes/Year 2025',
        expectedPath: ['Session Notes', 'Year 2025']
      },
      {
        name: 'falls back to URL when sourceDir missing',
        url: '/characters/npc',
        sourceDir: undefined,
        expectedDirTitle: 'characters'
      }
    ];

    for (const tc of testCases) {
      it(tc.name, async () => {
        const step = new NavTreeStep();
        const context = createContext([
          createContent({
            url: tc.url,
            sourceDir: tc.sourceDir,
            fileName: 'test',
            frontmatter: { title: 'Test Page' }
          })
        ]);

        await step.execute(context);

        // Navigate through the tree to check directory titles
        if (tc.expectedPath) {
          let current = context.navTree!;
          for (let i = 0; i < tc.expectedPath.length; i++) {
            assert.strictEqual(current[0].title, tc.expectedPath[i]);
            current = current[0].children;
          }
        } else if (tc.expectedDirTitle) {
          assert.strictEqual(context.navTree![0].title, tc.expectedDirTitle);
        }
      });
    }
  });

  describe('tree structure', () => {
    it('builds hierarchical tree from multiple pages', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: '/characters/npc-1',
          sourceDir: 'Characters',
          fileName: 'npc-1',
          frontmatter: { nav_title: 'NPC 1' }
        }),
        createContent({
          url: '/characters/npc-2',
          sourceDir: 'Characters',
          fileName: 'npc-2',
          frontmatter: { nav_title: 'NPC 2' }
        }),
        createContent({
          url: '/locations/town',
          sourceDir: 'Locations',
          fileName: 'town',
          frontmatter: { title: 'Town' }
        })
      ]);

      await step.execute(context);

      // Should have 2 top-level directories
      assert.strictEqual(context.navTree!.length, 2);

      // Check Characters directory
      const charactersDir = context.navTree!.find(n => n.url === '/characters');
      assert.ok(charactersDir, 'Characters directory should exist');
      assert.strictEqual(charactersDir.title, 'Characters');
      assert.strictEqual(charactersDir.children.length, 2);
      assert.strictEqual(charactersDir.children[0].title, 'NPC 1');
      assert.strictEqual(charactersDir.children[1].title, 'NPC 2');

      // Check Locations directory
      const locationsDir = context.navTree!.find(n => n.url === '/locations');
      assert.ok(locationsDir, 'Locations directory should exist');
      assert.strictEqual(locationsDir.title, 'Locations');
      assert.strictEqual(locationsDir.children.length, 1);
      assert.strictEqual(locationsDir.children[0].title, 'Town');
    });

    it('handles root-level pages', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: '/',
          sourceDir: '.',
          fileName: 'index',
          frontmatter: { title: 'Home' }
        })
      ]);

      await step.execute(context);

      assert.strictEqual(context.navTree!.length, 1);
      assert.strictEqual(context.navTree![0].url, '/');
      assert.strictEqual(context.navTree![0].title, 'Home');
      assert.strictEqual(context.navTree![0].children.length, 0);
    });

    it('updates existing node when same URL appears twice', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: '/page',
          sourceDir: '.',
          fileName: 'page',
          frontmatter: { title: 'First Title' }
        }),
        createContent({
          url: '/page',
          sourceDir: '.',
          fileName: 'page',
          frontmatter: { title: 'Updated Title' }
        })
      ]);

      await step.execute(context);

      assert.strictEqual(context.navTree!.length, 1);
      assert.strictEqual(context.navTree![0].title, 'Updated Title');
    });
  });

  describe('edge cases', () => {
    it('handles empty content array', async () => {
      const step = new NavTreeStep();
      const context = createContext([]);

      await step.execute(context);

      assert.strictEqual(context.navTree!.length, 0);
    });

    it('skips content without URL', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: undefined,
          fileName: 'test'
        })
      ]);

      await step.execute(context);

      assert.strictEqual(context.navTree!.length, 0);
    });

    it('handles deeply nested paths', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: '/a/b/c/d/page',
          sourceDir: 'A/B/C/D',
          fileName: 'page',
          frontmatter: { title: 'Deep Page' }
        })
      ]);

      await step.execute(context);

      // Navigate to the deepest level
      let current = context.navTree!;
      const expectedTitles = ['A', 'B', 'C', 'D'];
      for (const title of expectedTitles) {
        assert.strictEqual(current[0].title, title);
        current = current[0].children;
      }
      assert.strictEqual(current[0].title, 'Deep Page');
    });
  });

  describe('tree sorting', () => {
    it('sorts folders before files at same level', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: '/file1',
          sourceDir: '.',
          fileName: 'file1',
          frontmatter: { title: 'File 1' }
        }),
        createContent({
          url: '/folder/page',
          sourceDir: 'Folder',
          fileName: 'page',
          frontmatter: { title: 'Page' }
        }),
        createContent({
          url: '/file2',
          sourceDir: '.',
          fileName: 'file2',
          frontmatter: { title: 'File 2' }
        })
      ]);

      await step.execute(context);

      assert.strictEqual(context.navTree!.length, 3);
      // Folder should be first
      assert.strictEqual(context.navTree![0].title, 'Folder');
      assert.ok(context.navTree![0].children.length > 0);
      // Files should follow
      assert.strictEqual(context.navTree![1].title, 'File 1');
      assert.strictEqual(context.navTree![2].title, 'File 2');
    });

    it('sorts alphabetically within folders', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: '/zebra/page',
          sourceDir: 'Zebra',
          fileName: 'page',
          frontmatter: { title: 'Page' }
        }),
        createContent({
          url: '/apple/page',
          sourceDir: 'Apple',
          fileName: 'page',
          frontmatter: { title: 'Page' }
        }),
        createContent({
          url: '/mango/page',
          sourceDir: 'Mango',
          fileName: 'page',
          frontmatter: { title: 'Page' }
        })
      ]);

      await step.execute(context);

      assert.strictEqual(context.navTree!.length, 3);
      assert.strictEqual(context.navTree![0].title, 'Apple');
      assert.strictEqual(context.navTree![1].title, 'Mango');
      assert.strictEqual(context.navTree![2].title, 'Zebra');
    });

    it('sorts alphabetically within files', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: '/zebra',
          sourceDir: '.',
          fileName: 'zebra',
          frontmatter: { title: 'Zebra' }
        }),
        createContent({
          url: '/apple',
          sourceDir: '.',
          fileName: 'apple',
          frontmatter: { title: 'Apple' }
        }),
        createContent({
          url: '/mango',
          sourceDir: '.',
          fileName: 'mango',
          frontmatter: { title: 'Mango' }
        })
      ]);

      await step.execute(context);

      assert.strictEqual(context.navTree!.length, 3);
      assert.strictEqual(context.navTree![0].title, 'Apple');
      assert.strictEqual(context.navTree![1].title, 'Mango');
      assert.strictEqual(context.navTree![2].title, 'Zebra');
    });

    it('recursively sorts nested children', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: '/parent/file1',
          sourceDir: 'Parent',
          fileName: 'file1',
          frontmatter: { title: 'File 1' }
        }),
        createContent({
          url: '/parent/subfolder/page',
          sourceDir: 'Parent/Subfolder',
          fileName: 'page',
          frontmatter: { title: 'Page' }
        }),
        createContent({
          url: '/parent/file2',
          sourceDir: 'Parent',
          fileName: 'file2',
          frontmatter: { title: 'File 2' }
        })
      ]);

      await step.execute(context);

      const parent = context.navTree![0];
      assert.strictEqual(parent.title, 'Parent');
      assert.strictEqual(parent.children.length, 3);

      // Subfolder should be first (it's a folder)
      assert.strictEqual(parent.children[0].title, 'Subfolder');
      assert.ok(parent.children[0].children.length > 0);

      // Then files alphabetically
      assert.strictEqual(parent.children[1].title, 'File 1');
      assert.strictEqual(parent.children[2].title, 'File 2');
    });

    it('sorts mixed folders and files correctly', async () => {
      const step = new NavTreeStep();
      const context = createContext([
        createContent({
          url: '/zoo',
          sourceDir: '.',
          fileName: 'zoo',
          frontmatter: { title: 'Zoo' }
        }),
        createContent({
          url: '/beta/page',
          sourceDir: 'Beta',
          fileName: 'page',
          frontmatter: { title: 'Page' }
        }),
        createContent({
          url: '/apple',
          sourceDir: '.',
          fileName: 'apple',
          frontmatter: { title: 'Apple' }
        }),
        createContent({
          url: '/delta/page',
          sourceDir: 'Delta',
          fileName: 'page',
          frontmatter: { title: 'Page' }
        })
      ]);

      await step.execute(context);

      assert.strictEqual(context.navTree!.length, 4);
      // Folders first, alphabetically
      assert.strictEqual(context.navTree![0].title, 'Beta');
      assert.strictEqual(context.navTree![1].title, 'Delta');
      // Then files, alphabetically
      assert.strictEqual(context.navTree![2].title, 'Apple');
      assert.strictEqual(context.navTree![3].title, 'Zoo');
    });
  });
});
