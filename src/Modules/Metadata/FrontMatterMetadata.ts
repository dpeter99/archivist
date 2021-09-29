import {IModule} from "../../Module/IModule.ts";
import {Content} from "../../Content.ts";
import {SimpleModule} from "../../Module/SimpleModule.ts";
import {getAttribName} from "./ExtractMetadata.ts";
import {Author} from "../../Metadata.ts";

import { parse } from "https://deno.land/x/frontmatter/mod.ts";

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
