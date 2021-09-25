//   import StateCore from "../../node_modules/markdown-it/lib/rules_core/state_core.js";


//.. @deno-types="https://cdn.skypack.dev/@types/markdown-it/lib/rules_core/state_core.d.ts"
//import type * as M from "https://cdn.skypack.dev/@types/markdown-it/index.d.ts";
//import StateCore from "https://esm.sh/markdown-it@12.0.6/lib/rules_core/state_core.js";


//...@deno-types="https://cdn.skypack.dev/@types/markdown-it/"
//import StateCore from "https://cdn.skypack.dev/markdown-it@12.0.6/lib/rules_core/state_core.js?dts";
//import StateCore from "https://esm.sh/@types/markdown-it/lib/rules_core/state_core.d.ts";

import {StateCore, Token} from "./markdown.d.ts";

export function test(){
    //console.log(new StateCore("",null,null));
}

export function createToken(state:StateCore, type:string, tag:string, nesting:Token.Nesting, data:any){
    return Object.assign(new state.Token(type, tag, nesting), data);
}
