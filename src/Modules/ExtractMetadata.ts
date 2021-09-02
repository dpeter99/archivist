import {SimpleModule} from "../SimpleModule.ts";
import {Content} from "../Content.ts";

import { DOMParser, Element,Node, Document } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export class ExtractMetadata extends SimpleModule{


    processDoc(doc: Content): Promise<any> {

        let parser = new DOMParser();
        let dom = parser.parseFromString(doc.content,"text/html");

        let meta = dom!.getElementsByTagName("pre");

        meta.forEach((e)=>{
            //if(e.attributes.getNam)
            console.log(e.textContent);
            this.parseBikeshedStyle(doc,e.innerText)

            //doc.content = doc.content.replace(e.outerHTML, "");

            //https://regex101.com/r/h0Cfjf/1
            doc.content = doc.content.replace(new RegExp("<pre class='metadata'>\\n([\\w\\W]*)<\\/pre>"), "");

        });

        return Promise.resolve();
    }

    parseBikeshedStyle(doc:Content, text:string){
        let lines = text.split("\n");

        lines.forEach((l)=>{
            let tokens = l.split(":");
            if(tokens[0] != "" && tokens[1] != "") {
                //console.log(tokens[0] + " : " + tokens[1]);

                tokens[0] = tokens[0].replace("!","");
                tokens[1] = tokens[1].trim();
                doc.metadata.set(tokens[0],tokens[1]);
            }
        })
    }

}