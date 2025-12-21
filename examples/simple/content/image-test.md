---
title: Image Path Resolution Test
---

# Image Path Resolution Test

This page tests various image path resolution scenarios.

## Obsidian Embed Syntax

### Root-level image
![[test-logo.svg]]

### Nested image
![[images/nested-icon.svg]]

### Missing image (should warn)
![[missing-image.png]]

## Standard Markdown Syntax

### Root-level image (relative)
![Test Logo](./test-logo.svg)

### Nested image (relative)
![Nested Icon](./images/nested-icon.svg)

### Vault-relative path
![Logo](/test-logo.svg)

### External image (should NOT transform)
![External](https://example.com/image.png)

### Missing image (should warn)
![Missing](./nonexistent.jpg)
