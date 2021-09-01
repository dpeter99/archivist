import {IModule} from "../IModule.ts";
import {Document} from "../Document.ts";

import marked from "./../../node_modules/marked/lib/marked.esm.js";



export class MarkdownRender implements IModule{

    constructor() {

    }

    async process(docs:Document[]): Promise<any> {

        for (let d of docs){
            d.content = marked(d.content);
        }

    }

}