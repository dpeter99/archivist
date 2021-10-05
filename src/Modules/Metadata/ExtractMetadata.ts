import {SimpleModule} from "../../Module/SimpleModule.ts";
import {Content} from "../../Content.ts";


import {CompositeModule} from "../../Module/CompositeModule.ts";


/**
 * This plugin is for extracting metadata from the documents
 * It uses sub modules to extract different types of metadata.
 * Possible sub modules are:
 *  - @see {@link FrontMatterMetadata}
 *  - @see {@link BikeshedMetadata}
 */
export class ExtractMetadata extends CompositeModule{

    async process(docs: Content[]): Promise<any> {

        for (const module of this.modules) {
            await module.process(docs);
        }

    }

}


export const AttribNameMapping = {
    Author : "Author",
    Editor : "Author"
}

export function getAttribName(name: string) : string {
    //@ts-ignore
    let val = AttribNameMapping[name];
    if(val == undefined){
        return name
    }
    else {
        return val;
    }
}

