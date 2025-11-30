---
title: WikiLink Test Page
description: Testing WikiLink resolution features
date: 2024-01-20
aliases: [wikitest, link-test]
---

# WikiLink Resolution Test

This page tests various WikiLink features.

## Basic Links

- Link to [[Getting Started with Archavist]] (exact title match)
- Link to [[getting started with archavist]] (case-insensitive)
- Link to [[GETTING STARTED WITH ARCHAVIST]] (all uppercase)

## Links with Aliases

- [[Getting Started with Archavist|Start Here]]
- [[react-19-features|React 19 Guide]]
- [[obsidian-tips|Tips and Tricks]]

## Testing Alias Resolution

This page has aliases defined in frontmatter: `wikitest` and `link-test`.

From other pages, you can link to this page using:
- `[[WikiLink Test Page]]` (title)
- `[[wikitest]]` (alias)
- `[[link-test]]` (alias)

## Unresolved Links

These links point to pages that don't exist:

- [[Nonexistent Page]] - Should have 'unresolved' class
- [[Future Content]] - Another missing page
- [[TODO Write This]] - Planned content

## Valid Links

- Back to [[index|Home]]
- Read [[first-blog-post]]
- Learn about [[markdown-tips]]
