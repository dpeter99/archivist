import {SimpleModule} from "../SimpleModule.ts";
import {Content} from "../Content.ts";

import {DOMParser, Element, Node, Document} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import {getAttribName} from "./ExtractMetadata.ts";
import {Author} from "../Metadata.ts";

export class BikeshedMetadata extends SimpleModule {


    processDoc(doc: Content): Promise<any> {

        let parser = new DOMParser();
        let dom = parser.parseFromString(doc.content, "text/html");

        let meta = dom!.getElementsByTagName("pre");

        meta.forEach((e) => {

            this.parseBikeshedStyle(doc, e.innerText)

            //https://regex101.com/r/h0Cfjf/1
            doc.content = doc.content.replace(new RegExp("<pre class='metadata'>\\n([\\w\\W]*)<\\/pre>"), "");

        });

        return Promise.resolve();
    }

    parseBikeshedStyle(doc: Content, text: string) {
        let lines = text.split("\n");

        lines.forEach((l) => {
            let tokens = [];
            tokens[0] = l.substr(0, l.indexOf(':')); // "72"
            tokens[1] = l.substr(l.indexOf(':') + 1); // "tocirah sneab"

            if (tokens[0] != "" && tokens[1] != "") {
                //console.log(tokens[0] + " : " + tokens[1]);

                tokens[0] = tokens[0].replace("!", "");
                tokens[0] = getAttribName(tokens[0]);

                tokens[1] = tokens[1].trim();

                if(tokens[0] == "Author"){
                    doc.metadata.addData(tokens[0], this.parseAuthor(tokens[1]));
                    return;
                }

                doc.metadata.addData(tokens[0], tokens[1]);

            }
        })
    }

    parseAuthor(text: string) {
        let tokens = text.split(",");
        if (tokens.length < 1) {
            console.log("You must give at least the name of the author");

        }

        let author = new Author(tokens[0]);
        if (tokens.length >= 2) {
            author.Company = tokens[1];
        }

        return author;
    }


}
