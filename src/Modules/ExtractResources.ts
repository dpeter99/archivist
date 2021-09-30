import {SimpleModule} from "../Module/SimpleModule.ts";
import {Content} from "../Content.ts";

import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export class ExtractResources extends SimpleModule{

    async processDoc(doc: Content): Promise<any> {

        const htmlDom = new DOMParser().parseFromString(doc.content, "text/html")!;

        let files: string[]= [];

        htmlDom.querySelectorAll("img")!.forEach((e)=>{
            //files.push(e.src)
            if(e instanceof Element){
                files.push(e.getAttribute("src"));
            }
            console.log(e);
        });

        return super.processDoc(doc);
    }
}
