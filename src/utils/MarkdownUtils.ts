
import StateCore from "markdown-it/lib/rules_core/state_core.js";
import MarkdownIt from "markdown-it";

export function createToken(state:StateCore, type:string, tag:string, nesting:number, data:any){
    return Object.assign(new state.Token(type, tag, nesting), data);
}
