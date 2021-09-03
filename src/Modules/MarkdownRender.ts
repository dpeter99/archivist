import {IModule} from "../IModule.ts";
import {Content} from "../Content.ts";

import marked from "./../../node_modules/marked/lib/marked.esm.js";
import {SimpleModule} from "../SimpleModule.ts";



export class MarkdownRender extends SimpleModule{

    async processDoc(doc:Content): Promise<any> {

            doc.content = marked(doc.content);

    }

}