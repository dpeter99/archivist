---
title: Obsidian Tips and Tricks
description: Productivity tips for working with Obsidian and Archavist
date: 2024-01-08
tags: [obsidian, productivity, tips]
---

# Obsidian Tips and Tricks

After using Obsidian for my blog content, I've discovered several tips that make the workflow smoother.

## Writing Tips

### Use Wiki Links Extensively

Wiki links are the heart of Obsidian. Instead of traditional markdown links, use:

```markdown
[[page-name]]
[[page-name|Custom Display Text]]
```

This makes it easy to create connections between your notes. For example, I often reference my [[getting-started|Getting Started guide]] and [[react-19-features|React 19 article]].

### Frontmatter is Your Friend

Always include frontmatter in your posts:

```yaml
---
title: Your Post Title
description: A brief description
date: 2024-01-08
tags: [tag1, tag2, tag3]
---
```

This metadata is used by Archavist to generate proper HTML pages with correct titles and meta tags.

## Organization Tips

### Use Folders for Categories

Organize your content into folders:

```
content/
├── blog/
├── projects/
├── notes/
└── index.md
```

### Tag Everything

Tags help you categorize content and make it easier to find related posts later. I use tags like:

- `#tutorial` for instructional content
- `#blog` for personal posts
- `#technical` for deep dives

## Archavist-Specific Tips

### Test Locally First

Always test your site locally before deploying:

```bash
archavist dev
```

This starts a development server with hot reloading.

### Check Your Links

Broken wiki links will be highlighted during the build process. Archavist's indexing step builds a complete graph of your content.

### Keep It Simple

Don't over-engineer your content structure. Start simple and add complexity as needed. As I mentioned in my [[first-blog-post|first post]], simplicity is key.

## Workflow

My typical workflow:

1. Write notes in Obsidian
2. Run `archavist dev` to preview
3. Build with `archavist build`
4. Deploy the `build` folder

## Resources

- [[index|Home Page]] - See all posts
- [[getting-started|Getting Started]] - Setup instructions
- [[react-19-features|React 19 Features]] - Technical details

---

Happy note-taking and site building!