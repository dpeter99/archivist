

export type Content = {
    sourcePath: string,
    content: string,
    frontmatter: Record<string, any>,

    url?: string,
    outPath?: string,
}