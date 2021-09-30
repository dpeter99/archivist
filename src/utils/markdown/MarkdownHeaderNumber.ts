//import StateCore from "../../node_modules/markdown-it/lib/rules_core/state_core.js";
//import Token from "../../node_modules/markdown-it/lib/token.js";

//import {StateCore} from "markdown-it";

//import StateCore from '@types/markdown-it'

//import Token from "markdown-it/lib/token.js";
//import StateCore from "markdown-it/lib/rules_core/state_core.js";
//import MarkdownIt from "markdown-it";

//import type M from "https://cdn.skypack.dev/@types/markdown-it";
import {createToken} from "./MarkdownUtils.ts";
import {StateCore, Token} from "./markdown.d.ts";


export class Options{
    excludeTrailingZeros = true;
    shiftHeadings = 0;
    addNumbers = true;
}

function headingLevel(token: Token) {
    if(token.tag){
        return parseInt(token.tag.substr(1, 1));
    }
    return 0;
}

function getNextHeadingNumber(level:number, state:number[], opts: Options){
    const acc_level = level-1 - opts.shiftHeadings;

    state[acc_level]++;

    state.fill(0,acc_level+1);

    if(opts.excludeTrailingZeros){
        let a:number[] = Array.of(...state);

        while(a[a.length-1] === 0){ // While the last element is a 0,
            a.pop();                  // Remove that last element
        }

        return formatHeadingNumber(a,opts);
    }

    return formatHeadingNumber(state,opts);
}

function formatHeadingNumber(state:number[], opts:Options){
    return state.join(".")+". ";
}

export function MarkdownHeadingNumbers (md:any, opts:Options) {

    let options:Options = Object.assign(new Options(),opts);

    md.core.ruler.push("heading-numbers",(state: StateCore)=>{

        let headingState: number[] = [0,0,0,0,0,0,0]

        const tokens = state.tokens

        for (let idx = 0; idx < tokens.length; idx++) {
            const token = tokens[idx]

            if (token.type !== 'heading_open') {
                continue
            }

            const level = headingLevel(token);

            const num = getNextHeadingNumber(level,headingState, options);

            const linkTokens = [
                createToken(state,'span_open', 'span', 1, {}),
                createToken(state,"text","span",0,{content:num}),
                new state.Token('span_open', 'span', -1)
            ]

            if(opts.addNumbers) {
                state.tokens[idx + 1]?.children?.unshift(...linkTokens);
            }
        }

    })

}








