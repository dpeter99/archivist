import {SimpleModule} from "../SimpleModule.ts";
import {Content} from "../Content.ts";


import {CompositeModule} from "../CompositeModule.ts";

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

