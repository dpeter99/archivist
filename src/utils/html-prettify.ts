
import {unified} from 'npm:unified';
import rehypeParse from 'npm:rehype-parse';
import rehypeFormat from 'npm:rehype-format';
import rehypeStringify from 'npm:rehype-stringify';

export async function htmlPrettify(content: string) {
    const file = await unified()
        .use(rehypeParse)
        .use(rehypeFormat)
        .use(rehypeStringify, { allowDangerousCharacters: true })
        .process(content)

    return String(file);
}