
import StateCore from "markdown-it/lib/rules_core/state_core.js";
import MarkdownIt from "markdown-it";
import {createToken} from "./MarkdownUtils.ts";

const position = {
    false: 'push',
    true: 'unshift',
    after: 'push',
    before: 'unshift'
}

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

    if (opts.space) {
        state.tokens[idx + 1].children[position["before"]](Object.assign(new state.Token('text', '', 0), { content: ' ' }))
    }


    state.tokens[idx + 1].children[position["before"]](...linkTokens)
}
