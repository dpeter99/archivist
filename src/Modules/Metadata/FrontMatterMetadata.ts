import {IModule} from "../../Module/IModule.ts";
import {Content} from "../../Content.ts";
import {SimpleModule} from "../../Module/SimpleModule.ts";
import {getAttribName} from "./ExtractMetadata.ts";
import {Author} from "../../Metadata.ts";

import { parse } from "https://deno.land/x/frontmatter/mod.ts";

/**
 * This plugin extracts the front matter style metadata from the documents.
 * It gets the Yaml data between a pair of ``---``
 *
 * @example The following will give back a title and an array of 2 authors
 * ```
 * ---
 * title: "test"
 * authors:
 *  - "author 1"
 *  - "author 2"
 * ---
 * ```
 */
export class FrontMatterMetadata extends SimpleModule{



    processDoc(doc: Content): Promise<any> {

        let res: any = parse(doc.content);

        //console.log(res);

        for (const re in res.data) {
            const data = res.data[re];
            //console.log(re + " : " + data);

            if(Array.isArray(data)){
                for (const v of data) {
                    doc.metadata.addData(re,v);
                }
            }
            else {
                doc.metadata.addData(re,res.data[re]);
            }

        }

        doc.content = res.content;

        return Promise.resolve();
    }

}
