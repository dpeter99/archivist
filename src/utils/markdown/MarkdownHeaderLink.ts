import {createToken} from "./MarkdownUtils.ts";
import {StateCore, Token} from "./markdown.d.ts";


type ArrayKey = keyof Array<Token>;

type ArrayFuncs = "push" | "unshift"


const position = new Map<string,ArrayFuncs>( [
    ['false', 'push'],
    ['true', 'unshift'],
    ['after', 'push'],
    ['before', 'unshift']
]);

const permalinkSymbolMeta = {
    isPermalinkSymbol: true
}

export function renderHref (slug:string, state:StateCore) {
    return `#${slug}`
}

export function renderAttrs (slug:string, state:StateCore) {
    return {}
}

export function renderPermalink (slug:any, opts:any, state:StateCore, idx:number) {



    if(state.tokens[idx].type === "heading_open"){
        //TODO: Add confing for this
        state.tokens[idx]?.attrs?.unshift(['class', 'heading'])
    }


    const linkTokens = [
        createToken(state,'link_open', 'a', 1, {
            attrs: [
                ...(opts.class ? [['class', opts.class]] : []),
                ['href', renderHref(slug, state)],
                ...(opts.ariaHidden ? [['aria-hidden', 'true']] : []),
                ...Object.entries(renderAttrs(slug, state))
            ]
        }),
        //Object.assign(new state.Token('html_inline', '', 0), { content: opts.symbol, meta: permalinkSymbolMeta }),
        new state.Token('link_close', 'a', -1)
    ]

    var children : Token[] = state.tokens[idx+1].children!;

    if (opts.space) {
        //.@ts-ignore
        state.tokens[idx + 1].children![position.get("before")!](Object.assign(new state.Token('text', '', 0), { content: ' ' }))
    }

    //@ts-ignore
    state.tokens[idx + 1].children![position.get("before")!](...linkTokens)


}
